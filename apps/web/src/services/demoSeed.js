import { api } from '../lib/api';

export async function seedDemoData(farmId, user) {
  if (!farmId) throw new Error('Farm is required.');
  return api.post(`/api/v1/farms/${farmId}/seed`, {
    actorId: user?.uid || '',
    actorName: user?.displayName || user?.email || 'System'
  });
}
