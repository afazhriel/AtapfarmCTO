import { api } from '../lib/api';

async function createFarmDocument(farmId, collectionName, payload) {
  const result = await api.post(`/api/v1/farms/${farmId}/${collectionName}`, payload);
  return result.id;
}

async function updateFarmDocument(farmId, collectionName, documentId, payload) {
  return api.patch(`/api/v1/farms/${farmId}/${collectionName}/${documentId}`, payload);
}

async function deleteFarmDocument(farmId, collectionName, documentId) {
  return api.delete(`/api/v1/farms/${farmId}/${collectionName}/${documentId}`);
}

async function setFarmDocument(farmId, collectionName, documentId, payload) {
  return api.patch(`/api/v1/farms/${farmId}/${collectionName}/${documentId}`, payload);
}

async function logActivity(farmId, user, action, entity, details = '') {
  return api.post(`/api/v1/farms/${farmId}/activities`, {
    action,
    entity,
    details,
    actorId: user?.uid || '',
    actorName: user?.displayName || user?.email || 'System'
  });
}

async function addTeamMember(farmId, payload) {
  return api.post(`/api/v1/farms/${farmId}/members`, payload);
}

async function updateTeamMemberRole(farmId, userId, role) {
  return api.patch(`/api/v1/farms/${farmId}/members/${userId}`, { role });
}

async function removeTeamMember(farmId, userId) {
  return api.delete(`/api/v1/farms/${farmId}/members/${userId}`);
}

export {
  addTeamMember,
  createFarmDocument,
  deleteFarmDocument,
  logActivity,
  removeTeamMember,
  setFarmDocument,
  updateFarmDocument,
  updateTeamMemberRole
};
