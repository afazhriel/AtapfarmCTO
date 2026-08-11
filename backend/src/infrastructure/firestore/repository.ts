import {
  CollectionReference,
  FieldValue,
  Query,
  Timestamp,
  WriteBatch
} from 'firebase-admin/firestore';
import { adminDb } from '../firebase/admin.js';
import { FarmRole } from '../../domain/farm.js';

export type DocData = Record<string, unknown>;

export function now(): FieldValue {
  return FieldValue.serverTimestamp();
}

export function toIso(value: unknown): string | null {
  if (!value) return null;
  if (value instanceof Timestamp) return value.toDate().toISOString();
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'string') return value;
  return null;
}

export async function getDocument(path: string): Promise<DocData | null> {
  const snapshot = await adminDb.doc(path).get();
  return snapshot.exists ? (snapshot.data() as DocData) : null;
}

export async function listCollection(path: string): Promise<Array<{ id: string; data: DocData }>> {
  const snapshot = await adminDb.collection(path).get();
  return snapshot.docs.map((item) => ({ id: item.id, data: item.data() }));
}

export function collectionRef(path: string): CollectionReference {
  return adminDb.collection(path);
}

export function docRef(path: string) {
  return adminDb.doc(path);
}

export function newWriteBatch(): WriteBatch {
  return adminDb.batch();
}

export async function commitBatch(batch: WriteBatch): Promise<void> {
  await batch.commit();
}

export function queryBy(field: string, value: string): Query {
  return adminDb.collection(field).where('userId', '==', value);
}

export async function getMembershipsForUser(uid: string): Promise<Array<{ id: string; data: DocData }>> {
  const snapshot = await adminDb.collection('memberships').where('userId', '==', uid).get();
  return snapshot.docs.map((item) => ({ id: item.id, data: item.data() }));
}

export async function getMemberRole(farmId: string, uid: string): Promise<FarmRole | null> {
  const member = await getDocument(`farms/${farmId}/members/${uid}`);
  const role = member?.role as FarmRole | undefined;
  return role || null;
}

export async function isMember(farmId: string, uid: string): Promise<boolean> {
  const member = await getDocument(`farms/${farmId}/members/${uid}`);
  return Boolean(member);
}

export function canManage(role: FarmRole | null): boolean {
  return role === 'owner' || role === 'manager';
}

export function canOperate(role: FarmRole | null): boolean {
  return role === 'owner' || role === 'manager' || role === 'operator';
}
