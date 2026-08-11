import { Router } from 'express';
import { ingestHandler } from '../controllers/ingestController.js';

/**
 * IoT ingestion endpoint.
 *
 * CTO DECISION REQUIRED (AGENTS.md §8): currently no authentication on this
 * endpoint. Production requires device authentication before enabling public
 * access.
 */
export function ingestRoutes(): Router {
  const router = Router();

  router.post('/ingest', ingestHandler);

  return router;
}
