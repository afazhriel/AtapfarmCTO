import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  serverTimestamp,
  setDoc,
  updateDoc,
  writeBatch
} from 'firebase/firestore';
import { db } from '../lib/firebase';

function farmCollection(farmId, collectionName) {
  if (!db) throw new Error('Firebase is not configured.');
  if (!farmId) throw new Error('No farm selected.');
  return collection(db, 'farms', farmId, collectionName);
}

export async function createFarmDocument(farmId, collectionName, payload) {
  const result = await addDoc(farmCollection(farmId, collectionName), {
    ...payload,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  return result.id;
}

export async function updateFarmDocument(farmId, collectionName, documentId, payload) {
  return updateDoc(doc(db, 'farms', farmId, collectionName, documentId), {
    ...payload,
    updatedAt: serverTimestamp()
  });
}

export async function deleteFarmDocument(farmId, collectionName, documentId) {
  return deleteDoc(doc(db, 'farms', farmId, collectionName, documentId));
}

export async function setFarmDocument(farmId, collectionName, documentId, payload) {
  return setDoc(
    doc(db, 'farms', farmId, collectionName, documentId),
    {
      ...payload,
      updatedAt: serverTimestamp()
    },
    { merge: true }
  );
}

export async function logActivity(farmId, user, action, entity, details = '') {
  return addDoc(farmCollection(farmId, 'activities'), {
    action,
    entity,
    details,
    actorId: user?.uid || '',
    actorName: user?.displayName || user?.email || 'System',
    createdAt: serverTimestamp()
  });
}


export async function addTeamMember(farmId, payload) {
  const batch = writeBatch(db);
  const memberRef = doc(db, 'farms', farmId, 'members', payload.userId);
  const membershipRef = doc(db, 'memberships', `${farmId}_${payload.userId}`);
  const data = {
    ...payload,
    farmId,
    joinedAt: payload.joinedAt || new Date(),
    updatedAt: serverTimestamp()
  };
  batch.set(memberRef, data);
  batch.set(membershipRef, data);
  return batch.commit();
}

export async function updateTeamMemberRole(farmId, userId, role) {
  const batch = writeBatch(db);
  batch.update(doc(db, 'farms', farmId, 'members', userId), { role, updatedAt: serverTimestamp() });
  batch.update(doc(db, 'memberships', `${farmId}_${userId}`), { role, updatedAt: serverTimestamp() });
  return batch.commit();
}

export async function removeTeamMember(farmId, userId) {
  const batch = writeBatch(db);
  batch.delete(doc(db, 'farms', farmId, 'members', userId));
  batch.delete(doc(db, 'memberships', `${farmId}_${userId}`));
  return batch.commit();
}
