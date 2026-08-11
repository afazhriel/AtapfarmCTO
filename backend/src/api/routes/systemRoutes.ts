import { Router } from 'express';
import { healthHandler, meHandler } from '../controllers/systemController.js';
import { requireAuth } from '../middleware/auth.js';

export function systemRoutes(): Router {
  const router = Router();

  router.get('/health', healthHandler);
  router.get('/me', requireAuth, meHandler);

  return router;
}
