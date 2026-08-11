import { Response, NextFunction } from 'express';
import { Request } from 'express';
import { ingestTelemetry } from '../../events/ingestion/ingestService.js';

export async function ingestHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await ingestTelemetry(req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}
