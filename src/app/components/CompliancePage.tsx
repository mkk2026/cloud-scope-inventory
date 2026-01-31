import { useState } from 'react';
import { Shield, AlertTriangle, CheckCircle, XCircle, ChevronDown, ChevronRight, Download } from 'lucide-react';

interface ComplianceCheck {
  id: string;
  title: string;
  category: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  status: 'Pass' | 'Fail' | 'Warning';
  provider: 'AWS' | 'Azure' | 'GCP' | 'Multi-Cloud';
  description: string;
  remediation: string;
  affectedResources: number;
}

const mockComplianceData: ComplianceCheck[] = [
  {
    id: 'CIS-AWS-1.1',
    title: 'Ensure MFA is enabled for root account',
    category: 'Identity and Access Management',
    severity: 'Critical',
    status: 'Fail',
    provider: 'AWS',
    description: 'Root account does not have MFA enabled, creating a significant security risk.',
    remediation: 'Enable MFA for the root account in AWS IAM console.',
    affectedResources: 1,
  },
  {
    id: 'CIS-AWS-2.1',
    title: 'Ensure CloudTrail is enabled in all regions',
    category: 'Logging and Monitoring',
    severity: 'High',
    status: 'Pass',
    provider: 'AWS',
    description: 'CloudTrail is properly configured and logging across all regions.',
    remediation: 'N/A',
    affectedResources: 0,
  },
  {
    id: 'CIS-AWS-3.1',
    title: 'Ensure S3 buckets have encryption enabled',
    category: 'Data Protection',
    severity: 'High',
    status: 'Warning',
    provider: 'AWS',
    description: 'Some S3 buckets do not have default encryption enabled.',
    remediation: 'Enable default encryption for all S3 buckets.',
    affectedResources: 2,
  },
  {
    id: 'CIS-AZURE-1.1',
    title: 'Ensure security contact emails are set',
    category: 'Security Center',
    severity: 'Medium',
    status: 'Pass',
    provider: 'Azure',
    description: 'Security contact information is properly configured.',
    remediation: 'N/A',
    affectedResources: 0,
  },
  {
    id: 'CIS-AZURE-2.1',
    title: 'Ensure Azure Defender is enabled',
    category: 'Security Center',
    severity: 'Critical',
    status: 'Fail',
    provider: 'Azure',
    description: 'Azure Defender is not enabled for all resource types.',
    remediation: 'Enable Azure Defender in Security Center for all resource types.',
    affectedResources: 5,
  },
  {
    id: 'CIS-AZURE-3.1',
    title: 'Ensure SQL databases have encryption enabled',
    category: 'Data Protection',
    severity: 'High',
    status: 'Fail',
    provider: 'Azure',
    description: 'SQL databases do not have Transparent Data Encryption (TDE) enabled.',
    remediation: 'Enable TDE for all SQL databases.',
    affectedResources: 1,
  },
  {
    id: 'CIS-GCP-1.1',
    title: 'Ensure API keys are rotated every 90 days',
    category: 'Identity and Access Management',
    severity: 'Medium',
    status: 'Pass',
    provider: 'GCP',
    description: 'All API keys are within the 90-day rotation policy.',
    remediation: 'N/A',
    affectedResources: 0,
  },
  {
    id: 'CIS-GCP-2.1',
    title: 'Ensure Cloud Storage buckets are not publicly accessible',
    category: 'Data Protection',
    severity: 'Critical',
    status: 'Warning',
    provider: 'GCP',
    description: 'Some Cloud Storage buckets have public access configured.',
    remediation: 'Remove public access from Cloud Storage buckets unless explicitly required.',
    affectedResources: 1,
  },
  {
    id: 'CIS-MULTI-1.1',
    title: 'Ensure unused resources are deleted',
    category: 'Resource Management',
    severity: 'Low',
    status: 'Warning',
    provider: 'Multi-Cloud',
    description: 'Zombie resources detected across multiple cloud providers.',
    remediation: 'Review and delete unused resources to reduce costs and attack surface.',
    affectedResources: 3,
  },
];

const severityColors = {
  Critical: 'bg-red-500',
  High: 'bg-orange-500',
  Medium: 'bg-yellow-500',
  Low: 'bg-blue-500',
};

const statusIcons = {
  Pass: <CheckCircle className="w-5 h-5 text-green-400" />,
  Fail: <XCircle className="w-5 h-5 text-red-400" />,
  Warning: <AlertTriangle className="w-5 h-5 text-yellow-400" />,
};

export default function CompliancePage() {
  const [selectedProvider, setSelectedProvider] = useState<string>('All');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('All');
  const [expandedChecks, setExpandedChecks] = useState<Set<string>>(new Set());

  const toggleCheck = (checkId: string) => {
    const newExpanded = new Set(expandedChecks);
    if (newExpanded.has(checkId)) {
      newExpanded.delete(checkId);
    } else {
      newExpanded.add(checkId);
    }
    setExpandedChecks(newExpanded);
  };

  const filteredChecks = mockComplianceData.filter((check) => {
    const matchesProvider =
      selectedProvider === 'All' || check.provider === selectedProvider;
    const matchesSeverity =
      selectedSeverity === 'All' || check.severity === selectedSeverity;
    return matchesProvider && matchesSeverity;
  });

  const totalChecks = filteredChecks.length;
  const passedChecks = filteredChecks.filter((c) => c.status === 'Pass').length;
  const failedChecks = filteredChecks.filter((c) => c.status === 'Fail').length;
  const warningChecks = filteredChecks.filter((c) => c.status === 'Warning').length;
  const complianceScore = Math.round((passedChecks / totalChecks) * 100);

  // Group by category
  const categories = Array.from(new Set(filteredChecks.map((c) => c.category)));

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-[#0d1220] border border-gray-800 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-8 h-8 text-indigo-400" />
            <div>
              <p className="text-sm text-gray-400">Compliance Score</p>
              <p className="text-3xl font-semibold">{complianceScore}%</p>
            </div>
          </div>
        </div>

        <div className="bg-[#0d1220] border border-gray-800 rounded-lg p-4">
          <p className="text-sm text-gray-400 mb-1">Total Checks</p>
          <p className="text-2xl font-semibold">{totalChecks}</p>
          <p className="text-xs text-gray-500 mt-1">CIS Benchmarks</p>
        </div>

        <div className="bg-[#0d1220] border border-gray-800 rounded-lg p-4">
          <p className="text-sm text-gray-400 mb-1">Passed</p>
          <p className="text-2xl font-semibold text-green-400">{passedChecks}</p>
          <p className="text-xs text-gray-500 mt-1">{Math.round((passedChecks / totalChecks) * 100)}% compliant</p>
        </div>

        <div className="bg-[#0d1220] border border-gray-800 rounded-lg p-4">
          <p className="text-sm text-gray-400 mb-1">Failed</p>
          <p className="text-2xl font-semibold text-red-400">{failedChecks}</p>
          <p className="text-xs text-gray-500 mt-1">Requires attention</p>
        </div>

        <div className="bg-[#0d1220] border border-gray-800 rounded-lg p-4">
          <p className="text-sm text-gray-400 mb-1">Warnings</p>
          <p className="text-2xl font-semibold text-yellow-400">{warningChecks}</p>
          <p className="text-xs text-gray-500 mt-1">Needs review</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-[#0d1220] border border-gray-800 rounded-lg p-4">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-4">
            <select
              value={selectedProvider}
              onChange={(e) => setSelectedProvider(e.target.value)}
              className="px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-100"
            >
              <option value="All">All Providers</option>
              <option value="AWS">AWS</option>
              <option value="Azure">Azure</option>
              <option value="GCP">GCP</option>
              <option value="Multi-Cloud">Multi-Cloud</option>
            </select>

            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-100"
            >
              <option value="All">All Severities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export Report
          </button>
        </div>
      </div>

      {/* Compliance Checks by Category */}
      <div className="space-y-4">
        {categories.map((category) => {
          const categoryChecks = filteredChecks.filter((c) => c.category === category);
          const categoryPassed = categoryChecks.filter((c) => c.status === 'Pass').length;
          const categoryScore = Math.round((categoryPassed / categoryChecks.length) * 100);

          return (
            <div key={category} className="bg-[#0d1220] border border-gray-800 rounded-lg overflow-hidden">
              <div className="p-4 bg-gray-800/30 border-b border-gray-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-gray-400" />
                    <h3 className="font-semibold">{category}</h3>
                    <span className="px-2 py-1 bg-gray-700 rounded text-xs">
                      {categoryChecks.length} checks
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-sm text-gray-400">
                      Score: <span className={`font-semibold ${categoryScore >= 80 ? 'text-green-400' : categoryScore >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>{categoryScore}%</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="divide-y divide-gray-800">
                {categoryChecks.map((check) => (
                  <div key={check.id} className="p-4 hover:bg-gray-800/20 transition-colors">
                    <div
                      className="flex items-start justify-between cursor-pointer"
                      onClick={() => toggleCheck(check.id)}
                    >
                      <div className="flex items-start gap-3 flex-1">
                        <button className="mt-1">
                          {expandedChecks.has(check.id) ? (
                            <ChevronDown className="w-5 h-5 text-gray-400" />
                          ) : (
                            <ChevronRight className="w-5 h-5 text-gray-400" />
                          )}
                        </button>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            {statusIcons[check.status]}
                            <h4 className="font-medium">{check.title}</h4>
                            <span className="text-xs text-gray-500">{check.id}</span>
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`px-2 py-1 ${severityColors[check.severity]} text-white text-xs rounded font-medium`}>
                              {check.severity}
                            </span>
                            <span className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded">
                              {check.provider}
                            </span>
                            {check.affectedResources > 0 && (
                              <span className="px-2 py-1 bg-orange-500/20 text-orange-400 text-xs rounded">
                                {check.affectedResources} affected resource{check.affectedResources > 1 ? 's' : ''}
                              </span>
                            )}
                          </div>

                          {expandedChecks.has(check.id) && (
                            <div className="mt-4 pl-8 space-y-3 text-sm">
                              <div>
                                <p className="text-gray-400 font-medium mb-1">Description:</p>
                                <p className="text-gray-300">{check.description}</p>
                              </div>
                              {check.status !== 'Pass' && (
                                <div>
                                  <p className="text-gray-400 font-medium mb-1">Remediation:</p>
                                  <p className="text-gray-300">{check.remediation}</p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
