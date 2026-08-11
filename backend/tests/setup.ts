import { beforeAll, afterAll, beforeEach, afterEach, vi } from 'vitest';
import * as admin from 'firebase-admin';
import * as sinon from 'sinon';

let adminInitStub: sinon.SinonStub;
let testEnv: any;

beforeAll(async () => {
  const { default: test } = await import('firebase-functions-test');
  testEnv = test({
    projectId: 'demo-farmfleet',
  });
  adminInitStub = sinon.stub(admin, 'initializeApp');
});

afterAll(() => {
  adminInitStub.restore();
  testEnv?.cleanup();
});

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  sinon.restore();
});

export { testEnv, adminInitStub };