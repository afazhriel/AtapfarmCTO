import { Router } from 'express';
import {
  createActivityHandler,
  createOperationHandler,
  deleteOperationHandler,
  listActivitiesHandler,
  listOperationHandler,
  seedHandler,
  updateOperationHandler
} from '../controllers/operationsController.js';
import { requireAuth } from '../middleware/auth.js';

export function operationsRoutes(): Router {
  const router = Router();

  router.use(requireAuth);

  router.post('/:farmId/activities', createActivityHandler);
  router.get('/:farmId/activities', listActivitiesHandler);
  router.post('/:farmId/seed', seedHandler);
  router.get('/:farmId/:collection', listOperationHandler);
  router.post('/:farmId/:collection', createOperationHandler);
  router.patch('/:farmId/:collection/:documentId', updateOperationHandler);
  router.delete('/:farmId/:collection/:documentId', deleteOperationHandler);

  return router;
}
