export interface Asset {
  id: string;
  name: string;
  code: string;
  category: string;
  subtype: string;
  status: string;
  location: string;
  quantity: number;
  tag: string;
  healthScore: number;
  utilization: number;
  lastServiceAt?: Date;
  nextServiceAt?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TelemetryReading {
  id: string;
  assetId: string;
  assetName?: string;
  metric: string;
  value: number;
  unit: string;
  status: string;
  source: string;
  recordedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Task {
  id: string;
  title: string;
  type: string;
  status: string;
  priority: string;
  assetId?: string;
  assetName?: string;
  assigneeName?: string;
  dueAt?: Date;
  notes?: string;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Alert {
  id: string;
  title: string;
  severity: string;
  status: string;
  assetId?: string;
  assetName?: string;
  message: string;
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface MaintenanceWorkOrder {
  id: string;
  title: string;
  status: string;
  assetId?: string;
  assetName?: string;
  scheduledAt?: Date;
  completedAt?: Date;
  technician?: string;
  cost?: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Activity {
  id: string;
  action: string;
  entity: string;
  details: string;
  actorId: string;
  actorName: string;
  createdAt: Date;
}
