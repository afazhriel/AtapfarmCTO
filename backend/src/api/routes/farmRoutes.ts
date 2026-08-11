import { Router } from 'express';
import {
  addMemberHandler,
  createFarmHandler,
  deleteFarmHandler,
  getFarmHandler,
  listFarmsHandler,
  listMembersHandler,
  removeMemberHandler,
  updateFarmHandler,
  updateMemberRoleHandler
} from '../controllers/farmController.js';
import { allowRoles, requireAuth } from '../middleware/auth.js';

export function farmRoutes(): Router {
  const router = Router();

  router.use(requireAuth);

  router.post('/', createFarmHandler);
  router.get('/', listFarmsHandler);
  router.get('/:farmId', getFarmHandler);
  router.patch('/:farmId', allowRoles('owner', 'manager'), updateFarmHandler);
  router.delete('/:farmId', allowRoles('owner'), deleteFarmHandler);

  router.get('/:farmId/members', listMembersHandler);
  router.post('/:farmId/members', allowRoles('owner', 'manager'), addMemberHandler);
  router.patch('/:farmId/members/:memberUid', allowRoles('owner', 'manager'), updateMemberRoleHandler);
  router.delete('/:farmId/members/:memberUid', allowRoles('owner', 'manager'), removeMemberHandler);

  return router;
}
