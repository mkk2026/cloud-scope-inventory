import { useState } from 'react';
import { Search, Filter, Download, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

interface Resource {
  id: string;
  name: string;
  type: string;
  provider: 'AWS' | 'Azure' | 'GCP';
  region: string;
  status: 'Running' | 'Stopped' | 'Error';
  cost: number;
  tags: string[];
  compliance: 'Compliant' | 'Non-Compliant' | 'Warning';
  lastModified: string;
}

const mockResources: Resource[] = [
  {
    id: 'i-0a1b2c3d4e5f',
    name: 'prod-web-server-01',
    type: 'EC2 Instance',
    provider: 'AWS',
    region: 'us-east-1',
    status: 'Running',
    cost: 145.32,
    tags: ['production', 'web', 'cost-center-123'],
    compliance: 'Compliant',
    lastModified: '2026-01-30',
  },
  {
    id: 'vm-9x8y7z6w5v',
    name: 'dev-database-azure',
    type: 'Virtual Machine',
    provider: 'Azure',
    region: 'eastus',
    status: 'Running',
    cost: 89.50,
    tags: ['development', 'database'],
    compliance: 'Warning',
    lastModified: '2026-01-29',
  },
  {
    id: 's3-bucket-logs',
    name: 'company-logs-archive',
    type: 'S3 Bucket',
    provider: 'AWS',
    region: 'us-west-2',
    status: 'Running',
    cost: 23.15,
    tags: ['logs', 'archive', 'cost-center-123'],
    compliance: 'Compliant',
    lastModified: '2026-01-28',
  },
  {
    id: 'gcp-compute-1',
    name: 'analytics-processor',
    type: 'Compute Engine',
    provider: 'GCP',
    region: 'us-central1',
    status: 'Running',
    cost: 234.89,
    tags: ['analytics', 'cost-center-456'],
    compliance: 'Compliant',
    lastModified: '2026-01-30',
  },
  {
    id: 'i-zombie-instance',
    name: 'old-test-server',
    type: 'EC2 Instance',
    provider: 'AWS',
    region: 'eu-west-1',
    status: 'Stopped',
    cost: 0.00,
    tags: ['test'],
    compliance: 'Non-Compliant',
    lastModified: '2025-12-15',
  },
  {
    id: 'azure-sql-prod',
    name: 'prod-sql-database',
    type: 'SQL Database',
    provider: 'Azure',
    region: 'westeurope',
    status: 'Running',
    cost: 456.78,
    tags: ['production', 'database', 'cost-center-123'],
    compliance: 'Compliant',
    lastModified: '2026-01-31',
  },
  {
    id: 'gcs-backup',
    name: 'backup-storage-bucket',
    type: 'Cloud Storage',
    provider: 'GCP',
    region: 'us-east1',
    status: 'Running',
    cost: 67.23,
    tags: ['backup', 'storage'],
    compliance: 'Warning',
    lastModified: '2026-01-27',
  },
  {
    id: 'azure-app-service',
    name: 'api-gateway-prod',
    type: 'App Service',
    provider: 'Azure',
    region: 'centralus',
    status: 'Running',
    cost: 178.90,
    tags: ['production', 'api'],
    compliance: 'Non-Compliant',
    lastModified: '2026-01-30',
  },
];

const providerColors = {
  AWS: 'bg-orange-500',
  Azure: 'bg-blue-500',
  GCP: 'bg-green-500',
};

const statusIcons = {
  Running: <CheckCircle className="w-4 h-4 text-green-400" />,
  Stopped: <AlertCircle className="w-4 h-4 text-yellow-400" />,
  Error: <XCircle className="w-4 h-4 text-red-400" />,
};

const complianceColors = {
  Compliant: 'text-green-400',
  'Non-Compliant': 'text-red-400',
  Warning: 'text-yellow-400',
};

export default function ResourcesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');

  const filteredResources = mockResources.filter((resource) => {
    const matchesSearch =
      resource.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesProvider =
      selectedProvider === 'All' || resource.provider === selectedProvider;

    const matchesStatus =
      selectedStatus === 'All' || resource.status === selectedStatus;

    return matchesSearch && matchesProvider && matchesStatus;
  });

  const totalCost = filteredResources.reduce((sum, r) => sum + r.cost, 0);

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#0d1220] border border-gray-800 rounded-lg p-4">
          <p className="text-sm text-gray-400 mb-1">Total Resources</p>
          <p className="text-2xl font-semibold">{filteredResources.length}</p>
        </div>
        <div className="bg-[#0d1220] border border-gray-800 rounded-lg p-4">
          <p className="text-sm text-gray-400 mb-1">Monthly Cost</p>
          <p className="text-2xl font-semibold">${totalCost.toFixed(2)}</p>
        </div>
        <div className="bg-[#0d1220] border border-gray-800 rounded-lg p-4">
          <p className="text-sm text-gray-400 mb-1">Compliant</p>
          <p className="text-2xl font-semibold text-green-400">
            {filteredResources.filter((r) => r.compliance === 'Compliant').length}
          </p>
        </div>
        <div className="bg-[#0d1220] border border-gray-800 rounded-lg p-4">
          <p className="text-sm text-gray-400 mb-1">Issues</p>
          <p className="text-2xl font-semibold text-red-400">
            {filteredResources.filter((r) => r.compliance === 'Non-Compliant').length}
          </p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-[#0d1220] border border-gray-800 rounded-lg p-4">
        <div className="flex flex-wrap gap-4">
          {/* Search */}
          <div className="flex-1 min-w-[300px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search resources..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-100"
            />
          </div>

          {/* Provider Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={selectedProvider}
              onChange={(e) => setSelectedProvider(e.target.value)}
              className="px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-100"
            >
              <option value="All">All Providers</option>
              <option value="AWS">AWS</option>
              <option value="Azure">Azure</option>
              <option value="GCP">GCP</option>
            </select>
          </div>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-100"
          >
            <option value="All">All Status</option>
            <option value="Running">Running</option>
            <option value="Stopped">Stopped</option>
            <option value="Error">Error</option>
          </select>

          {/* Export Button */}
          <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Resources Table */}
      <div className="bg-[#0d1220] border border-gray-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800 bg-gray-800/30">
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Resource</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Type</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Provider</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Region</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Cost/Mo</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Compliance</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Tags</th>
              </tr>
            </thead>
            <tbody>
              {filteredResources.map((resource) => (
                <tr
                  key={resource.id}
                  className="border-b border-gray-800 hover:bg-gray-800/30 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-100">{resource.name}</p>
                      <p className="text-sm text-gray-500">{resource.id}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-300">{resource.type}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${providerColors[resource.provider]}`} />
                      <span className="text-gray-300">{resource.provider}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-400">{resource.region}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {statusIcons[resource.status]}
                      <span className="text-gray-300">{resource.status}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-300 font-medium">
                    ${resource.cost.toFixed(2)}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`font-medium ${complianceColors[resource.compliance]}`}>
                      {resource.compliance}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {resource.tags.slice(0, 2).map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-gray-700/50 text-gray-300 text-xs rounded"
                        >
                          {tag}
                        </span>
                      ))}
                      {resource.tags.length > 2 && (
                        <span className="px-2 py-1 bg-gray-700/50 text-gray-400 text-xs rounded">
                          +{resource.tags.length - 2}
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredResources.length === 0 && (
          <div className="py-12 text-center text-gray-400">
            <p>No resources found matching your filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
