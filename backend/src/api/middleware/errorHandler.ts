import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { HttpError } from './auth.js';

export function notFoundHandler(_req: Request, res: Response) {
  res.status(404).json({ error: 'Not found.' });
}

export function errorHandler(error: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (error instanceof ZodError) {
    res.status(400).json({
      error: 'Validation failed.',
      issues: error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message
      }))
    });
    return;
  }

  if (error instanceof HttpError) {
    res.status(error.status).json({ error: error.message });
    return;
  }

  console.error('[backend] unhandled error:', error);
  res.status(500).json({ error: 'Internal server error.' });
}
