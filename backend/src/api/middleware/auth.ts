import { NextFunction, Request, Response } from 'express';
import { adminAuth } from '../../infrastructure/firebase/admin.js';
import { getMemberRole } from '../../infrastructure/firestore/repository.js';
import { FarmRole } from '../../domain/farm.js';

export interface AuthUser {
  uid: string;
  email: string;
  displayName: string;
}

export interface AuthenticatedRequest extends Request {
  authUser?: AuthUser;
  farmRole?: FarmRole;
  farmId?: string;
}

export class HttpError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export async function requireAuth(req: AuthenticatedRequest, _res: Response, next: NextFunction) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : '';
    if (!token) throw new HttpError(401, 'Missing bearer token.');

    const decoded = await adminAuth.verifyIdToken(token);
    req.authUser = {
      uid: decoded.uid,
      email: decoded.email || '',
      displayName: decoded.name || ''
    };
    next();
  } catch (error) {
    next(new HttpError(401, 'Invalid or expired token.'));
  }
}

export async function requireFarmRole(req: AuthenticatedRequest, _res: Response, next: NextFunction) {
  try {
    const { authUser, farmId } = req;
    if (!authUser || !farmId) throw new HttpError(401, 'Authentication or farm context missing.');

    const role = await getMemberRole(farmId, authUser.uid);
    if (!role) throw new HttpError(403, 'You are not a member of this farm.');
    req.farmRole = role;
    next();
  } catch (error) {
    next(error);
  }
}

export function allowRoles(...roles: FarmRole[]) {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
    const { farmRole } = req;
    if (!farmRole || !roles.includes(farmRole)) {
      next(new HttpError(403, 'Insufficient role for this operation.'));
      return;
    }
    next();
  };
}
