import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import {
  createDocument,
  deleteDocument,
  listActivities,
  listDocuments,
  logActivity,
  updateDocument
} from '../../application/operations/operationsService.js';
import { seedDemoData } from '../../application/operations/seedService.js';
import {
  alertSchema,
  assetSchema,
  maintenanceSchema,
  taskSchema,
  telemetrySchema
} from '../schemas/index.js';

const COLLECTIONS = ['assets', 'telemetry', 'tasks', 'alerts', 'maintenance'] as const;
type CollectionName = (typeof COLLECTIONS)[number];

function parseCollection(raw: string): CollectionName {
  if (!(COLLECTIONS as readonly string[]).includes(raw)) {
    throw new Error('INVALID_COLLECTION');
  }
  return raw as CollectionName;
}

function getFarmId(req: AuthenticatedRequest): string {
  const farmId = req.params.farmId;
  if (!farmId) throw new Error('FARM_ID_REQUIRED');
  req.farmId = farmId;
  return farmId;
}

function getActor(req: AuthenticatedRequest) {
  return {
    actorId: req.authUser?.uid || '',
    actorName: req.authUser?.displayName || req.authUser?.email || 'System'
  };
}

const SCHEMAS: Record<CollectionName, (raw: unknown) => unknown> = {
  assets: (raw) => assetSchema.parse(raw),
  telemetry: (raw) => telemetrySchema.parse(raw),
  tasks: (raw) => taskSchema.parse(raw),
  alerts: (raw) => alertSchema.parse(raw),
  maintenance: (raw) => maintenanceSchema.parse(raw)
};

export async function createOperationHandler(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const farmId = getFarmId(req);
    const collectionName = parseCollection(req.params.collection);
    const payload = SCHEMAS[collectionName](req.body) as Record<string, unknown>;
    const actor = getActor(req);
    const created = await createDocument(farmId, actor.actorId, collectionName, { payload, ...actor });
    res.status(201).json(created);
  } catch (error) {
    next(error);
  }
}

export async function createActivityHandler(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const farmId = getFarmId(req);
    const actor = getActor(req);
    const { action, entity, details } = req.body || {};
    if (!action || !entity) throw new Error('ACTIVITY_FIELDS_REQUIRED');
    await logActivity(farmId, actor.actorId, actor.actorName, String(action), String(entity), String(details || ''));
    res.status(201).json({ created: true });
  } catch (error) {
    next(error);
  }
}

export async function listOperationHandler(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const farmId = getFarmId(req);
    const collectionName = parseCollection(req.params.collection);
    const items = await listDocuments(farmId, req.authUser?.uid || '', collectionName);
    res.json(items);
  } catch (error) {
    next(error);
  }
}

export async function updateOperationHandler(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const farmId = getFarmId(req);
    const collectionName = parseCollection(req.params.collection);
    const documentId = req.params.documentId;
    const payload = SCHEMAS[collectionName](req.body) as Record<string, unknown>;
    const actor = getActor(req);
    const updated = await updateDocument(farmId, actor.actorId, collectionName, documentId, payload);
    res.json(updated);
  } catch (error) {
    next(error);
  }
}

export async function deleteOperationHandler(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const farmId = getFarmId(req);
    const collectionName = parseCollection(req.params.collection);
    const documentId = req.params.documentId;
    const actor = getActor(req);
    await deleteDocument(farmId, actor.actorId, collectionName, documentId);
    res.json({ deleted: true });
  } catch (error) {
    next(error);
  }
}

export async function listActivitiesHandler(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const farmId = getFarmId(req);
    const activities = await listActivities(farmId, req.authUser?.uid || '');
    res.json(activities);
  } catch (error) {
    next(error);
  }
}

export async function seedHandler(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const farmId = getFarmId(req);
    const result = await seedDemoData(farmId, req.authUser?.uid || '');
    res.json(result);
  } catch (error) {
    next(error);
  }
}
