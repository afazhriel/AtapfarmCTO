import { beforeAll, afterAll, beforeEach, afterEach, vi, describe, it, expect } from 'vitest';
import request from 'supertest';
import express from 'express';
import { adminDb } from '@/infrastructure/firebase/admin.ts';

// Hoisted mocks - run BEFORE any imports
const { mockInitializeApp, mockGetAuth, mockGetFirestore, mockVerifyIdToken, mockDoc, mockCollection } = vi.hoisted(() => {
  const mockVerifyIdToken = vi.fn().mockResolvedValue({ uid: 'test-uid', email: 'test@example.com' });
  const mockCollection = vi.fn().mockReturnValue({
    doc: vi.fn().mockReturnValue({
      get: vi.fn().mockResolvedValue({ exists: false, data: () => ({}) }),
      set: vi.fn().mockResolvedValue({}),
      update: vi.fn().mockResolvedValue({}),
      delete: vi.fn().mockResolvedValue({}),
      collection: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          get: vi.fn().mockResolvedValue({ docs: [], empty: true }),
        }),
        add: vi.fn().mockResolvedValue({ id: 'mock-id' }),
        doc: vi.fn().mockReturnValue({
          get: vi.fn().mockResolvedValue({ exists: false }),
          set: vi.fn().mockResolvedValue({}),
        }),
        orderBy: vi.fn().mockReturnValue({
          limit: vi.fn().mockReturnValue({
            get: vi.fn().mockResolvedValue({ docs: [], empty: true }),
          }),
        }),
      }),
    }),
    where: vi.fn().mockReturnValue({
      get: vi.fn().mockResolvedValue({ docs: [], empty: true }),
    }),
    orderBy: vi.fn().mockReturnValue({
      limit: vi.fn().mockReturnValue({
        get: vi.fn().mockResolvedValue({ docs: [], empty: true }),
      }),
    }),
    add: vi.fn().mockResolvedValue({ id: 'mock-id' }),
    get: vi.fn().mockResolvedValue({ docs: [], empty: true }),
  });
  const mockDoc = vi.fn().mockReturnValue({
    get: vi.fn().mockResolvedValue({ exists: false, data: () => ({}) }),
    set: vi.fn().mockResolvedValue({}),
    update: vi.fn().mockResolvedValue({}),
    delete: vi.fn().mockResolvedValue({}),
    collection: mockCollection,
    orderBy: vi.fn().mockReturnValue({
      limit: vi.fn().mockReturnValue({
        get: vi.fn().mockResolvedValue({ docs: [], empty: true }),
      }),
    }),
  });
  const mockFirestore = {
    collection: mockCollection,
    doc: mockDoc,
    batch: vi.fn().mockReturnValue({
      set: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      commit: vi.fn().mockResolvedValue({}),
    }),
    settings: vi.fn(),
  };
  const mockGetFirestore = vi.fn(() => mockFirestore);
  const mockGetAuth = vi.fn(() => ({
    verifyIdToken: mockVerifyIdToken,
  }));
  const mockInitializeApp = vi.fn();

  return { mockInitializeApp, mockGetAuth, mockGetFirestore, mockVerifyIdToken, mockDoc, mockCollection };
});

vi.mock('firebase-admin/app', () => ({
  initializeApp: mockInitializeApp,
  applicationDefault: vi.fn(),
  cert: vi.fn(),
  getApp: vi.fn(),
}));

vi.mock('firebase-admin/auth', () => ({
  getAuth: mockGetAuth,
}));

vi.mock('firebase-admin/firestore', () => ({
  getFirestore: mockGetFirestore,
  Timestamp: {
    now: () => ({ toDate: () => new Date() }),
    fromDate: (d: Date) => ({ toDate: () => d }),
  },
  FieldValue: {
    serverTimestamp: () => 'mock-timestamp',
  },
}));

// Set env vars BEFORE importing app
process.env.GCLOUD_PROJECT = 'demo-farmfleet';
process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080';
process.env.CORS_ORIGIN = 'http://localhost:5173';
process.env.PORT = '8080';

// Import after mocks
const { createApp } = await import('@/app.ts');

let app: express.Express;

function setupMockFarm(exists: boolean) {
  mockDoc.mockReturnValue({
    get: vi.fn().mockResolvedValue({ 
      exists, 
      data: () => exists ? { name: 'Test Farm', ownerId: 'test-uid' } : {} 
    }),
    set: vi.fn().mockResolvedValue({}),
    update: vi.fn().mockResolvedValue({}),
    delete: vi.fn().mockResolvedValue({}),
    collection: mockCollection,
    orderBy: vi.fn().mockReturnValue({
      limit: vi.fn().mockReturnValue({
        get: vi.fn().mockResolvedValue({ docs: [], empty: true }),
      }),
    }),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  setupMockFarm(false);
  app = createApp();
});

describe('System Routes', () => {
  it('GET /api/v1/health → 200 OK', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'ok');
    expect(res.body).toHaveProperty('service', 'farmfleet-backend');
  });

  it('GET /api/v1/me → 401 without auth', async () => {
    const res = await request(app).get('/api/v1/me');
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error');
  });
});

describe('Farm Routes (requires auth)', () => {
  it('POST /api/v1/farms → 401 without token', async () => {
    const res = await request(app)
      .post('/api/v1/farms')
      .send({ name: 'Test Farm', type: 'Mixed Farm', location: 'Test Location' });
    expect(res.status).toBe(401);
  });

  it('GET /api/v1/farms → 401 without token', async () => {
    const res = await request(app).get('/api/v1/farms');
    expect(res.status).toBe(401);
  });
});

describe('Operations Routes (requires auth)', () => {
  it('POST /api/v1/farms/:farmId/assets → 401 without token', async () => {
    const res = await request(app)
      .post('/api/v1/farms/test-farm/assets')
      .send({ name: 'Test Asset', code: 'TST-001', category: 'equipment' });
    expect(res.status).toBe(401);
  });

  it('GET /api/v1/farms/:farmId/assets → 401 without token', async () => {
    const res = await request(app).get('/api/v1/farms/test-farm/assets');
    expect(res.status).toBe(401);
  });

  it('POST /api/v1/farms/:farmId/telemetry → 401 without token', async () => {
    const res = await request(app)
      .post('/api/v1/farms/test-farm/telemetry')
      .send({ assetId: 'a1', assetName: 'Asset', metric: 'temperature', value: 25, unit: '°C' });
    expect(res.status).toBe(401);
  });

  it('POST /api/v1/farms/:farmId/tasks → 401 without token', async () => {
    const res = await request(app)
      .post('/api/v1/farms/test-farm/tasks')
      .send({ title: 'Test Task', type: 'inspection', status: 'todo' });
    expect(res.status).toBe(401);
  });

  it('POST /api/v1/farms/:farmId/alerts → 401 without token', async () => {
    const res = await request(app)
      .post('/api/v1/farms/test-farm/alerts')
      .send({ title: 'Test Alert', severity: 'warning', status: 'open' });
    expect(res.status).toBe(401);
  });

  it('POST /api/v1/farms/:farmId/maintenance → 401 without token', async () => {
    const res = await request(app)
      .post('/api/v1/farms/test-farm/maintenance')
      .send({ title: 'Test Maintenance', status: 'scheduled' });
    expect(res.status).toBe(401);
  });

  it('POST /api/v1/farms/:farmId/activities → 401 without token', async () => {
    const res = await request(app)
      .post('/api/v1/farms/test-farm/activities')
      .send({ action: 'Test', entity: 'Test' });
    expect(res.status).toBe(401);
  });
});

describe('Ingest Route (no auth currently)', () => {
  beforeEach(() => {
    setupMockFarm(true);
    app = createApp();
  });

  it('POST /api/v1/ingest → 201 even with empty body (service generates reading)', async () => {
    const res = await request(app).post('/api/v1/ingest').send({});
    expect([200, 201]).toContain(res.status);
    expect(res.body).toHaveProperty('readingId');
  });

  it('POST /api/v1/ingest → 201 with valid telemetry', async () => {
    const payload = {
      farmId: 'test-farm',
      deviceId: 'test-device-001',
      timestamp: new Date().toISOString(),
      readings: [
        { metric: 'temperature', value: 27.5, unit: '°C' },
        { metric: 'humidity', value: 65, unit: '%' }
      ]
    };
    const res = await request(app).post('/api/v1/ingest').send(payload);
    expect([200, 201]).toContain(res.status);
    expect(res.body).toHaveProperty('readingId');
  });
});

describe('Seed Route (requires auth)', () => {
  it('POST /api/v1/farms/:farmId/seed → 401 without token', async () => {
    const res = await request(app).post('/api/v1/farms/test-farm/seed').send({});
    expect(res.status).toBe(401);
  });
});