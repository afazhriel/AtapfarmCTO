import { randomUUID } from 'node:crypto';
import { collectionRef, getDocument, now } from '../../infrastructure/firestore/repository.js';
import { env } from '../../config/env.js';

export interface IngestionPayload {
  farmId: string;
  assetId: string;
  assetName?: string;
  metric: string;
  value: number;
  unit: string;
  recordedAt?: string;
  deviceId?: string;
  idempotencyKey?: string;
}

/**
 * Device identity verification.
 *
 * CTO DECISION REQUIRED (AGENTS.md §8): current implementation accepts a
 * dev-provided `deviceId`. Production must authenticate devices via one of:
 *  - per-device API key stored server-side
 *  - device custom claims issued by the backend
 *  - signed device tokens / mTLS
 * Until the CTO decides, device identity is treated as untrusted metadata.
 */
async function resolveDeviceIdentity(deviceId?: string): Promise<{ trusted: boolean; deviceId: string }> {
  if (!deviceId) return { trusted: false, deviceId: '' };
  return { trusted: false, deviceId };
}

/**
 * Threshold-based alert rules.
 *
 * CTO DECISION REQUIRED (AGENTS.md §8): no thresholds are invented.
 * The rules engine below is a no-op placeholder; business rules are
 * approved by the CTO before activation.
 */
function evaluateRules(_reading: { metric: string; value: number; unit: string }): Array<{ title: string; severity: string; message: string }> {
  return [];
}

function normalizeTimestamp(recordedAt?: string): Date {
  if (recordedAt) {
    const parsed = new Date(recordedAt);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }
  return new Date();
}

export async function ingestTelemetry(payload: IngestionPayload): Promise<{ readingId: string; alertCount: number }> {
  const { farmId } = payload;
  const farm = await getDocument(`farms/${farmId}`);
  if (!farm) throw new Error('FARM_NOT_FOUND');

  const { deviceId } = await resolveDeviceIdentity(payload.deviceId);

  // Idempotency: refuse duplicate ingestion keys.
  if (payload.idempotencyKey) {
    const existing = await getDocument(`farms/${farmId}/telemetry/${payload.idempotencyKey}`);
    if (existing) return { readingId: payload.idempotencyKey, alertCount: 0 };
  }

  const readingId = payload.idempotencyKey || randomUUID();
  const recordedAt = normalizeTimestamp(payload.recordedAt);
  const receivedAt = new Date();

  const reading = {
    assetId: payload.assetId,
    assetName: payload.assetName || '',
    metric: payload.metric,
    value: payload.value,
    unit: payload.unit,
    status: 'normal',
    source: 'iot-sensor',
    deviceId,
    recordedAt,
    receivedAt,
    createdAt: now(),
    updatedAt: now()
  };

  await collectionRef(`farms/${farmId}/telemetry`).doc(readingId).set(reading);

  // Rule evaluation is a no-op until thresholds are approved.
  const alerts = evaluateRules({ metric: payload.metric, value: payload.value, unit: payload.unit });
  for (const alert of alerts) {
    await collectionRef(`farms/${farmId}/alerts`).add({
      ...alert,
      status: 'open',
      assetId: payload.assetId,
      assetName: payload.assetName || '',
      createdAt: now(),
      updatedAt: now()
    });
  }

  if (env.isEmulator) {
    console.log('[ingest] emulator:', JSON.stringify({ farmId, readingId, metric: payload.metric }));
  }

  return { readingId, alertCount: alerts.length };
}
