import { Timestamp } from 'firebase-admin/firestore';
import { adminDb } from '../../infrastructure/firebase/admin.js';
import {
  collectionRef,
  commitBatch,
  getDocument,
  getMemberRole,
  isMember,
  listCollection,
  newWriteBatch,
  now,
  toIso
} from '../../infrastructure/firestore/repository.js';
import { FarmRole } from '../../domain/farm.js';
import { HttpError } from '../../api/middleware/auth.js';

export interface CreateFarmInput {
  name: string;
  type: string;
  location: string;
}

export interface FarmView {
  id: string;
  name: string;
  type: string;
  location: string;
  ownerId: string;
  role: FarmRole;
  createdAt: string | null;
  updatedAt: string | null;
}

function toFarmView(farmId: string, data: Record<string, unknown>, role: FarmRole): FarmView {
  return {
    id: farmId,
    name: String(data.name || ''),
    type: String(data.type || ''),
    location: String(data.location || ''),
    ownerId: String(data.ownerId || ''),
    role,
    createdAt: toIso(data.createdAt),
    updatedAt: toIso(data.updatedAt)
  };
}

export async function createFarm(uid: string, displayName: string, email: string, input: CreateFarmInput): Promise<FarmView> {
  const farmRef = collectionRef('farms').doc();
  const memberRef = adminDb.doc(`farms/${farmRef.id}/members/${uid}`);
  const membershipRef = adminDb.doc(`memberships/${farmRef.id}_${uid}`);
  const timestamps = now();

  const membership = {
    farmId: farmRef.id,
    userId: uid,
    displayName: displayName || email?.split('@')[0] || 'Owner',
    email,
    role: 'owner',
    joinedAt: timestamps,
    updatedAt: timestamps
  };

  const batch = newWriteBatch();
  batch.set(farmRef, {
    ...input,
    ownerId: uid,
    createdAt: timestamps,
    updatedAt: timestamps
  });
  batch.set(memberRef, membership);
  batch.set(membershipRef, membership);
  await commitBatch(batch);

  return toFarmView(farmRef.id, { ...input, ownerId: uid }, 'owner');
}

export async function listFarmsForUser(uid: string): Promise<FarmView[]> {
  const memberships = await listCollection('memberships');
  const mine = memberships.filter((m) => String(m.data.userId) === uid);

  const views = await Promise.all(
    mine.map(async (membership) => {
      const farmId = String(membership.data.farmId || '');
      if (!farmId) return null;
      const farmData = await getDocument(`farms/${farmId}`);
      if (!farmData) return null;
      return toFarmView(farmId, farmData, membership.data.role as FarmRole);
    })
  );

  return views.filter((view): view is FarmView => Boolean(view));
}

export async function getFarm(farmId: string, uid: string): Promise<FarmView> {
  if (!(await isMember(farmId, uid))) throw new HttpError(403, 'You are not a member of this farm.');
  const data = await getDocument(`farms/${farmId}`);
  if (!data) throw new HttpError(404, 'Farm not found.');
  const role = (await getMemberRole(farmId, uid)) || 'viewer';
  return toFarmView(farmId, data, role);
}

export async function updateFarm(farmId: string, uid: string, input: Partial<CreateFarmInput>): Promise<FarmView> {
  const role = await getMemberRole(farmId, uid);
  if (role !== 'owner' && role !== 'manager') throw new HttpError(403, 'Only owner or manager can update farm metadata.');

  const payload: Record<string, unknown> = { ...input, updatedAt: now() };
  await adminDb.doc(`farms/${farmId}`).update(payload);

  const data = await getDocument(`farms/${farmId}`);
  if (!data) throw new HttpError(404, 'Farm not found.');
  return toFarmView(farmId, data, role);
}

export async function deleteFarm(farmId: string, uid: string): Promise<void> {
  const role = await getMemberRole(farmId, uid);
  if (role !== 'owner') throw new HttpError(403, 'Only the owner can delete a farm.');

  const members = await listCollection(`farms/${farmId}/members`);
  const batch = newWriteBatch();
  batch.delete(adminDb.doc(`farms/${farmId}`));
  members.forEach((member) => {
    const memberUid = String(member.data.userId || member.id);
    batch.delete(adminDb.doc(`farms/${farmId}/members/${memberUid}`));
    batch.delete(adminDb.doc(`memberships/${farmId}_${memberUid}`));
  });
  await commitBatch(batch);
}

export async function addMember(farmId: string, uid: string, input: { userId: string; displayName: string; email: string; role: FarmRole }) {
  const role = await getMemberRole(farmId, uid);
  if (role !== 'owner' && role !== 'manager') throw new HttpError(403, 'Only owner or manager can add members.');

  const userRecord = await getDocument(`users/${input.userId}`);
  if (!userRecord) throw new HttpError(404, 'Target user profile not found.');

  const timestamps = now();
  const payload = {
    farmId,
    userId: input.userId,
    displayName: input.displayName,
    email: input.email,
    role: input.role,
    joinedAt: timestamps,
    updatedAt: timestamps
  };

  const batch = newWriteBatch();
  batch.set(adminDb.doc(`farms/${farmId}/members/${input.userId}`), payload);
  batch.set(adminDb.doc(`memberships/${farmId}_${input.userId}`), payload);
  await commitBatch(batch);

  return payload;
}

export async function updateMemberRole(farmId: string, uid: string, memberUid: string, role: FarmRole) {
  const actorRole = await getMemberRole(farmId, uid);
  if (actorRole !== 'owner' && actorRole !== 'manager') throw new HttpError(403, 'Only owner or manager can update member roles.');

  const existing = await getDocument(`farms/${farmId}/members/${memberUid}`);
  if (!existing) throw new HttpError(404, 'Member not found.');
  if (existing.role === 'owner') throw new HttpError(400, 'Owner role cannot be modified.');

  const payload = { role, updatedAt: now() };
  const batch = newWriteBatch();
  batch.update(adminDb.doc(`farms/${farmId}/members/${memberUid}`), payload);
  batch.update(adminDb.doc(`memberships/${farmId}_${memberUid}`), payload);
  await commitBatch(batch);
}

export async function removeMember(farmId: string, uid: string, memberUid: string) {
  const actorRole = await getMemberRole(farmId, uid);
  if (actorRole !== 'owner' && actorRole !== 'manager') throw new HttpError(403, 'Only owner or manager can remove members.');

  const existing = await getDocument(`farms/${farmId}/members/${memberUid}`);
  if (!existing) throw new HttpError(404, 'Member not found.');
  if (existing.role === 'owner') throw new HttpError(400, 'Owner cannot be removed.');

  const batch = newWriteBatch();
  batch.delete(adminDb.doc(`farms/${farmId}/members/${memberUid}`));
  batch.delete(adminDb.doc(`memberships/${farmId}_${memberUid}`));
  await commitBatch(batch);
}

export async function listMembers(farmId: string, uid: string) {
  const role = await getMemberRole(farmId, uid);
  if (!role) throw new HttpError(403, 'You are not a member of this farm.');
  const members = await listCollection(`farms/${farmId}/members`);
  return members.map((member) => ({
    userId: String(member.data.userId || member.id),
    displayName: String(member.data.displayName || ''),
    email: String(member.data.email || ''),
    role: String(member.data.role || ''),
    joinedAt: toIso(member.data.joinedAt)
  }));
}

export function serializeTimestamp(value: unknown): string | null {
  if (value instanceof Timestamp) return value.toDate().toISOString();
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'string') return value;
  return null;
}
