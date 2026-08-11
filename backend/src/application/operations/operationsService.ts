import { Timestamp } from 'firebase-admin/firestore';
import { adminDb } from '../../infrastructure/firebase/admin.js';
import {
  canManage,
  canOperate,
  collectionRef,
  getDocument,
  getMemberRole,
  listCollection,
  now,
  toIso
} from '../../infrastructure/firestore/repository.js';
import { HttpError } from '../../api/middleware/auth.js';
import { FarmRole } from '../../domain/farm.js';

type DocData = Record<string, unknown>;

export interface OperationInput {
  payload: Record<string, unknown>;
  actorId: string;
  actorName: string;
}

function parseDate(value: unknown): Date | undefined {
  if (!value) return undefined;
  if (value instanceof Timestamp) return value.toDate();
  if (value instanceof Date) return value;
  if (typeof value === 'string') return new Date(value);
  return undefined;
}

function cleanInput(input: Record<string, unknown>): DocData {
  const clean: DocData = {};
  for (const [key, value] of Object.entries(input)) {
    if (value === undefined || value === null) continue;
    if (typeof value === 'string' && key.toLowerCase().endsWith('at')) {
      clean[key] = parseDate(value) || value;
    } else {
      clean[key] = value;
    }
  }
  return clean;
}

function toSerialized(data: DocData): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    out[key] = toIso(value) ?? value;
  }
  return out;
}

async function ensureRole(farmId: string, uid: string, required: (role: FarmRole | null) => boolean): Promise<FarmRole | null> {
  const role = await getMemberRole(farmId, uid);
  if (!role) throw new HttpError(403, 'You are not a member of this farm.');
  if (!required(role)) throw new HttpError(403, 'Insufficient role for this operation.');
  return role;
}

async function ensureDoc(farmId: string, collectionName: string, documentId: string): Promise<DocData> {
  const data = await getDocument(`farms/${farmId}/${collectionName}/${documentId}`);
  if (!data) throw new HttpError(404, `${collectionName} document not found.`);
  return data;
}

export async function createDocument(farmId: string, uid: string, collectionName: string, input: OperationInput) {
  await ensureRole(farmId, uid, canOperate);
  const ref = collectionRef(`farms/${farmId}/${collectionName}`).doc();
  const payload = {
    ...cleanInput(input.payload),
    createdAt: now(),
    updatedAt: now()
  };
  await ref.set(payload);
  return { id: ref.id, ...toSerialized(payload) };
}

export async function updateDocument(farmId: string, uid: string, collectionName: string, documentId: string, payloadInput: DocData) {
  await ensureRole(farmId, uid, canOperate);
  await ensureDoc(farmId, collectionName, documentId);
  const payload = { ...cleanInput(payloadInput), updatedAt: now() };
  await adminDb.doc(`farms/${farmId}/${collectionName}/${documentId}`).update(payload);
  return { id: documentId, ...toSerialized(payload) };
}

export async function deleteDocument(farmId: string, uid: string, collectionName: string, documentId: string) {
  await ensureRole(farmId, uid, canOperate);
  await ensureDoc(farmId, collectionName, documentId);
  await adminDb.doc(`farms/${farmId}/${collectionName}/${documentId}`).delete();
  return { deleted: true, id: documentId };
}

export async function listDocuments(farmId: string, uid: string, collectionName: string) {
  await ensureRole(farmId, uid, () => true);
  const docs = await listCollection(`farms/${farmId}/${collectionName}`);
  return docs.map((item) => ({ id: item.id, ...toSerialized(item.data) }));
}

export async function logActivity(farmId: string, actorId: string, actorName: string, action: string, entity: string, details = '') {
  await collectionRef(`farms/${farmId}/activities`).add({
    action,
    entity,
    details,
    actorId,
    actorName,
    createdAt: now()
  });
}

export async function listActivities(farmId: string, uid: string) {
  await ensureRole(farmId, uid, () => true);
  const docs = await listCollection(`farms/${farmId}/activities`);
  return docs.map((item) => ({ id: item.id, ...toSerialized(item.data) }));
}

export { canManage };
