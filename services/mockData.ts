
import { CloudResource, CloudProvider, ResourceType, InventoryStats, RiskLevel } from '../types';

// This service replaces the random mock generator. 
// It simulates a real backend API that allows syncing, importing, and persistence.

const INITIAL_DATA: CloudResource[] = [
  {
    id: "i-0a1b2c3d4e5f",
    name: "prod-api-cluster-01",
    provider: "AWS",
    accountId: "123456789012",
    type: "Compute Instance",
    region: "us-east-1",
    costPerMonth: 245.50,
    tags: { Environment: "Production", Owner: "DevOps" },
    status: "Running",
    createdAt: "2023-11-15T08:00:00Z",
    riskLevel: "Secure", // Engine will calculate
    securityIssues: [],
    metadata: { instanceType: "m5.xlarge", imageId: "ami-0c55b159cbfafe1f0", publicIp: null }
  },
  {
    id: "db-mysql-prod-01",
    name: "customer-records-primary",
    provider: "GCP",
    accountId: "gcp-proj-8821",
    type: "Database",
    region: "us-central1",
    costPerMonth: 520.00,
    tags: { Project: "CRM", CostCenter: "CC-901" },
    status: "Running",
    createdAt: "2023-01-10T12:30:00Z",
    riskLevel: "Secure",
    securityIssues: [],
    metadata: { engine: "MySQL 8.0", storage: "500GB SSD", storageEncrypted: true }
  },
  {
    id: "s3-legacy-logs",
    name: "company-legacy-logs-archive",
    provider: "AWS",
    accountId: "123456789012",
    type: "Storage Bucket",
    region: "us-west-2",
    costPerMonth: 1200.00,
    tags: {},
    status: "Running",
    createdAt: "2020-05-20T09:15:00Z",
    riskLevel: "Secure",
    securityIssues: [],
    metadata: { sizeGB: 45000, storageClass: "Standard", publicAccess: true, encryption: "None" }
  },
  {
    id: "vm-jenkins-build",
    name: "ci-cd-build-agent",
    provider: "Azure",
    accountId: "sub-8829-1120",
    type: "Compute Instance",
    region: "westeurope",
    costPerMonth: 180.00,
    tags: { Environment: "Dev" },
    status: "Running",
    createdAt: "2024-02-01T14:20:00Z",
    riskLevel: "Secure",
    securityIssues: [],
    metadata: { size: "Standard_D4s_v3", os: "Ubuntu 22.04", publicIp: "20.40.10.5", openPorts: [22, 8080] }
  },
  {
    id: "vpc-main-prod",
    name: "vpc-production-network",
    provider: "AWS",
    accountId: "123456789012",
    type: "VPC",
    region: "us-east-1",
    costPerMonth: 0,
    tags: { Environment: "Production" },
    status: "Running",
    createdAt: "2022-06-15T10:00:00Z",
    riskLevel: "Secure",
    securityIssues: [],
    metadata: { cidr: "10.0.0.0/16" }
  },
  {
    id: "lb-frontend-app",
    name: "app-ingress-alb",
    provider: "AWS",
    accountId: "123456789012",
    type: "Load Balancer",
    region: "us-east-1",
    costPerMonth: 45.00,
    tags: { Service: "Frontend" },
    status: "Running",
    createdAt: "2023-11-20T11:00:00Z",
    riskLevel: "Secure",
    securityIssues: [],
    metadata: { scheme: "internet-facing", type: "application", sslPolicy: "ELBSecurityPolicy-2016-08" }
  },
  {
    id: "func-resize-img",
    name: "image-processor-lambda",
    provider: "AWS",
    accountId: "123456789012",
    type: "Function",
    region: "us-east-1",
    costPerMonth: 12.45,
    tags: { Project: "Media" },
    status: "Running",
    createdAt: "2024-03-05T16:45:00Z",
    riskLevel: "Secure",
    securityIssues: [],
    metadata: { runtime: "nodejs18.x", memory: "128MB" }
  },
  {
    id: "aks-cluster-dev",
    name: "dev-k8s-cluster",
    provider: "Azure",
    accountId: "sub-8829-1120",
    type: "Kubernetes Cluster",
    region: "eastus",
    costPerMonth: 350.00,
    tags: { Environment: "Development", Owner: "Platform" },
    status: "Running",
    createdAt: "2024-01-15T09:30:00Z",
    riskLevel: "Secure",
    securityIssues: [],
    metadata: { version: "1.28.5", nodes: 3, dashboardEnabled: true, rbacEnabled: false }
  }
];

export const MOCK_HISTORY_DATA = [
  { name: 'Jan', AWS: 4000, Azure: 2400, GCP: 2400 },
  { name: 'Feb', AWS: 3000, Azure: 1398, GCP: 2210 },
  { name: 'Mar', AWS: 2000, Azure: 9800, GCP: 2290 },
  { name: 'Apr', AWS: 2780, Azure: 3908, GCP: 2000 },
  { name: 'May', AWS: 1890, Azure: 4800, GCP: 2181 },
  { name: 'Jun', AWS: 2390, Azure: 3800, GCP: 2500 },
];

class InventoryService {
  private resources: CloudResource[] = [];

  // Automated Security Compliance Engine (Simulating CIS Benchmarks)
  private applySecurityControls(resource: CloudResource): CloudResource {
    const issues: string[] = [];
    let risk: RiskLevel = 'Secure';
    const m = resource.metadata || {};

    // --- Governance Checks ---
    if (Object.keys(resource.tags).length === 0) {
        issues.push("Governance: Resource is completely untagged");
        if (risk === 'Secure') risk = 'Low';
    } else if (!resource.tags['Owner'] && !resource.tags['CostCenter'] && !resource.tags['Environment']) {
        issues.push("Governance: Missing standard tags (Owner/CostCenter/Environment)");
        if (risk === 'Secure') risk = 'Low';
    }

    // --- CIS Benchmarks & Security Best Practices ---

    // Storage Buckets (CIS AWS 2.1, 2.2 equivalent)
    if (resource.type === 'Storage Bucket') {
        if (m.publicAccess === true) {
            issues.push("CIS 2.1: Storage Bucket has public access enabled");
            risk = 'Critical';
        }
        if (m.encryption !== 'AES256' && m.encryption !== 'AWS-KMS') {
            issues.push("CIS 2.2: Storage Bucket server-side encryption not enabled");
            if (risk !== 'Critical') risk = 'High';
        }
    }

    // Compute Instances (CIS AWS 4.1 equivalent)
    if (resource.type === 'Compute Instance') {
        if (m.publicIp && !resource.tags['Type']?.includes('Bastion')) {
             issues.push("CIS 4.1: Compute Instance exposed to public internet (SSH/RDP port risk)");
             if (risk !== 'Critical') risk = 'High';
        }
        if (m.openPorts && (m.openPorts.includes(22) || m.openPorts.includes(3389))) {
             issues.push("Network Security: Critical ports (22/3389) open to 0.0.0.0/0");
             if (risk !== 'Critical') risk = 'High';
        }
    }

    // Databases (CIS AWS 3.1 equivalent)
    if (resource.type === 'Database') {
        if (m.storageEncrypted !== true) {
            issues.push("CIS 3.1: Database storage is not encrypted at rest");
            if (risk !== 'Critical') risk = 'High';
        }
    }
    
    // Kubernetes (CIS Kubernetes 5.1 equivalent)
    if (resource.type === 'Kubernetes Cluster') {
        if (m.dashboardEnabled === true) {
             issues.push("CIS 5.1: Kubernetes Dashboard is enabled (high attack surface)");
             if (risk !== 'Critical') risk = 'High';
        }
        if (m.rbacEnabled === false) {
             issues.push("CIS 5.6: RBAC is not enabled");
             if (risk !== 'Critical') risk = 'High';
        }
    }

    // Load Balancers
    if (resource.type === 'Load Balancer') {
        if (m.scheme === 'internet-facing' && m.sslPolicy?.includes('2016')) {
             issues.push("TLS Security: Using outdated SSL Policy (Pre-TLS 1.2)");
             if (risk === 'Secure') risk = 'Medium';
        }
    }

    return {
        ...resource,
        riskLevel: risk,
        securityIssues: issues
    };
  }

  // Simulate an API call to fetch data from cloud providers
  async fetchCloudSnapshot(accountName: string, provider: string): Promise<CloudResource[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Return deterministic data based on the simulation
        // Apply compliance engine dynamically
        this.resources = INITIAL_DATA.map(r => this.applySecurityControls(r));
        resolve(this.resources);
      }, 1500); // 1.5s simulated network latency
    });
  }

  // Allow importing JSON data directly (SaaS feature)
  importData(jsonData: string): CloudResource[] {
    try {
      const parsed = JSON.parse(jsonData);
      const rawResources = Array.isArray(parsed) ? parsed : [];
      // Run compliance checks on imported data
      this.resources = rawResources.map((r: CloudResource) => this.applySecurityControls(r));
      return this.resources;
    } catch (e) {
      console.error("Failed to parse import", e);
      return this.resources;
    }
  }

  getStats(resources: CloudResource[]): InventoryStats {
    const totalCost = resources.reduce((sum, r) => sum + r.costPerMonth, 0);
    const untagged = resources.filter(r => Object.keys(r.tags).length === 0).length;
    const criticalRisks = resources.filter(r => r.riskLevel === 'Critical' || r.riskLevel === 'High').length;
    
    const providerCounts = resources.reduce((acc, r) => {
      acc[r.provider] = (acc[r.provider] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalResources: resources.length,
      totalCost,
      untaggedCount: untagged,
      criticalRiskCount: criticalRisks,
      providerSplit: Object.entries(providerCounts).map(([name, value]) => ({ name, value })),
      costTrend: MOCK_HISTORY_DATA
    };
  }
}

export const inventoryService = new InventoryService();
