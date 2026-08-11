import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';

export function healthHandler(_req: Request, res: Response) {
  res.json({ status: 'ok', service: 'farmfleet-backend' });
}

export async function meHandler(req: AuthenticatedRequest, res: Response) {
  const { authUser } = req;
  res.json({
    uid: authUser?.uid,
    email: authUser?.email,
    displayName: authUser?.displayName
  });
}
