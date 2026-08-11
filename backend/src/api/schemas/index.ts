import { z } from 'zod';
import { FARM_ROLES } from '../../domain/farm.js';

export const createFarmSchema = z.object({
  name: z.string().min(1).max(120),
  type: z.string().min(1).max(60),
  location: z.string().min(1).max(200)
});

export const updateFarmSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  type: z.string().min(1).max(60).optional(),
  location: z.string().min(1).max(200).optional()
});

export const addMemberSchema = z.object({
  userId: z.string().min(1),
  displayName: z.string().min(1).max(120),
  email: z.string().email(),
  role: z.enum(FARM_ROLES).refine((role) => role !== 'owner', { message: 'Role owner cannot be assigned via member add.' })
});

export const updateMemberRoleSchema = z.object({
  role: z.enum(FARM_ROLES).refine((role) => role !== 'owner', { message: 'Role owner cannot be modified.' })
});

export const assetSchema = z.object({
  name: z.string().min(1).max(120),
  code: z.string().min(1).max(60).optional(),
  category: z.string().min(1).max(60),
  subtype: z.string().min(1).max(60).optional(),
  status: z.string().min(1).max(40).optional(),
  location: z.string().min(1).max(120).optional(),
  quantity: z.number().nonnegative().optional(),
  tag: z.string().max(80).optional(),
  healthScore: z.number().min(0).max(100).optional(),
  utilization: z.number().min(0).max(100).optional(),
  lastServiceAt: z.string().datetime().optional(),
  nextServiceAt: z.string().datetime().optional(),
  notes: z.string().max(1000).optional()
});

export const telemetrySchema = z.object({
  assetId: z.string().min(1),
  assetName: z.string().max(120).optional(),
  metric: z.string().min(1).max(60),
  value: z.number(),
  unit: z.string().min(1).max(20),
  status: z.string().max(40).optional(),
  source: z.string().max(60).optional(),
  recordedAt: z.string().datetime().optional()
});

export const taskSchema = z.object({
  title: z.string().min(1).max(160),
  type: z.string().max(60).optional(),
  status: z.string().max(40).optional(),
  priority: z.string().max(40).optional(),
  assetId: z.string().max(80).optional(),
  assetName: z.string().max(120).optional(),
  assigneeName: z.string().max(120).optional(),
  dueAt: z.string().datetime().optional(),
  notes: z.string().max(1000).optional(),
  completedAt: z.string().datetime().optional()
});

export const alertSchema = z.object({
  title: z.string().min(1).max(160),
  severity: z.string().max(40).optional(),
  status: z.string().max(40).optional(),
  assetId: z.string().max(80).optional(),
  assetName: z.string().max(120).optional(),
  message: z.string().max(1000).optional(),
  resolvedAt: z.string().datetime().optional()
});

export const maintenanceSchema = z.object({
  title: z.string().min(1).max(160),
  status: z.string().max(40).optional(),
  assetId: z.string().max(80).optional(),
  assetName: z.string().max(120).optional(),
  scheduledAt: z.string().datetime().optional(),
  completedAt: z.string().datetime().optional(),
  technician: z.string().max(120).optional(),
  cost: z.number().nonnegative().optional(),
  notes: z.string().max(1000).optional()
});
