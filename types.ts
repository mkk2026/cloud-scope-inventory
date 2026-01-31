
export type CloudProvider = 'AWS' | 'Azure' | 'GCP';

export type ResourceType = 
  | 'Compute Instance' 
  | 'Storage Bucket' 
  | 'Database' 
  | 'Load Balancer' 
  | 'VPC' 
  | 'Function'
  | 'Kubernetes Cluster';

export type RiskLevel = 'Critical' | 'High' | 'Medium' | 'Low' | 'Secure';

export interface CloudResource {
  id: string;
  name: string;
  provider: CloudProvider;
  accountId: string; // SaaS multi-tenancy support
  type: ResourceType;
  region: string;
  costPerMonth: number;
  tags: Record<string, string>;
  status: 'Running' | 'Stopped' | 'Terminated' | 'Unknown';
  createdAt: string;
  riskLevel: RiskLevel;
  securityIssues?: string[]; // E.g., "Publicly Accessible", "Unencrypted"
  metadata?: Record<string, any>; // Raw JSON from the provider
}

export interface InventoryStats {
  totalResources: number;
  totalCost: number;
  untaggedCount: number;
  criticalRiskCount: number;
  providerSplit: Array<{ name: string; value: number }>;
  costTrend: Array<{ name: string; AWS: number; Azure: number; GCP: number }>;
}

export interface CloudCredential {
  id: string;
  name: string;
  provider: CloudProvider;
  lastSync: string;
  status: 'Active' | 'Error' | 'Syncing';
}

// RBAC Types
export type UserRole = 'Admin' | 'Editor' | 'Viewer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
}
