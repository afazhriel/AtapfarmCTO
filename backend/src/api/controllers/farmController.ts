import { Response, NextFunction } from 'express';
import {
  addMember,
  createFarm,
  deleteFarm,
  getFarm,
  listFarmsForUser,
  listMembers,
  removeMember,
  updateFarm,
  updateMemberRole
} from '../../application/farm/farmService.js';
import { HttpError, AuthenticatedRequest } from '../middleware/auth.js';
import {
  addMemberSchema,
  createFarmSchema,
  updateFarmSchema,
  updateMemberRoleSchema
} from '../schemas/index.js';

function getFarmId(req: AuthenticatedRequest): string {
  const farmId = req.params.farmId;
  if (!farmId) throw new HttpError(400, 'farmId is required.');
  req.farmId = farmId;
  return farmId;
}

export async function createFarmHandler(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const input = createFarmSchema.parse(req.body);
    const { uid = '', email = '', displayName = '' } = req.authUser || {};
    const farm = await createFarm(uid, displayName, email, input);
    res.status(201).json(farm);
  } catch (error) {
    next(error);
  }
}

export async function listFarmsHandler(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const uid = req.authUser?.uid || '';
    const farms = await listFarmsForUser(uid);
    res.json(farms);
  } catch (error) {
    next(error);
  }
}

export async function getFarmHandler(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const farmId = getFarmId(req);
    const farm = await getFarm(farmId, req.authUser?.uid || '');
    res.json(farm);
  } catch (error) {
    next(error);
  }
}

export async function updateFarmHandler(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const farmId = getFarmId(req);
    const input = updateFarmSchema.parse(req.body);
    const farm = await updateFarm(farmId, req.authUser?.uid || '', input);
    res.json(farm);
  } catch (error) {
    next(error);
  }
}

export async function deleteFarmHandler(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const farmId = getFarmId(req);
    await deleteFarm(farmId, req.authUser?.uid || '');
    res.json({ deleted: true });
  } catch (error) {
    next(error);
  }
}

export async function listMembersHandler(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const farmId = getFarmId(req);
    const members = await listMembers(farmId, req.authUser?.uid || '');
    res.json(members);
  } catch (error) {
    next(error);
  }
}

export async function addMemberHandler(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const farmId = getFarmId(req);
    const input = addMemberSchema.parse(req.body);
    const member = await addMember(farmId, req.authUser?.uid || '', input);
    res.status(201).json(member);
  } catch (error) {
    next(error);
  }
}

export async function updateMemberRoleHandler(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const farmId = getFarmId(req);
    const memberUid = req.params.memberUid;
    const input = updateMemberRoleSchema.parse(req.body);
    await updateMemberRole(farmId, req.authUser?.uid || '', memberUid, input.role);
    res.json({ updated: true });
  } catch (error) {
    next(error);
  }
}

export async function removeMemberHandler(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const farmId = getFarmId(req);
    const memberUid = req.params.memberUid;
    await removeMember(farmId, req.authUser?.uid || '', memberUid);
    res.json({ deleted: true });
  } catch (error) {
    next(error);
  }
}
