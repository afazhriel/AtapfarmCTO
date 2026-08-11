import express, { Express } from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import { systemRoutes } from './api/routes/systemRoutes.js';
import { farmRoutes } from './api/routes/farmRoutes.js';
import { operationsRoutes } from './api/routes/operationsRoutes.js';
import { ingestRoutes } from './api/routes/ingestRoutes.js';
import { errorHandler, notFoundHandler } from './api/middleware/errorHandler.js';

export function createApp(): Express {
  const app = express();

  app.use(cors({ origin: env.corsOrigin.split(','), credentials: true }));
  app.use(express.json({ limit: '256kb' }));

  app.use('/api/v1', systemRoutes());
  app.use('/api/v1/farms', farmRoutes());
  app.use('/api/v1', operationsRoutes());
  app.use('/api/v1', ingestRoutes());

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
