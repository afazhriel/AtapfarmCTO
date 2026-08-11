export const FARM_ROLES = ['owner', 'manager', 'operator', 'viewer'] as const;
export type FarmRole = (typeof FARM_ROLES)[number];

export const FARM_TYPES = ['Mixed Farm', 'Livestock', 'Crop', 'Aquaculture', 'Poultry'] as const;
export type FarmType = (typeof FARM_TYPES)[number];

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string;
  emailVerified: boolean;
  createdAt?: Date;
  lastLoginAt?: Date;
}

export interface Membership {
  farmId: string;
  userId: string;
  displayName: string;
  email: string;
  role: FarmRole;
  joinedAt: Date;
  updatedAt: Date;
}

export interface Farm {
  id: string;
  name: string;
  type: string;
  location: string;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
  demoSeededAt?: Date;
}
