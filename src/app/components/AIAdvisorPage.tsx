import { useState } from 'react';
import { Sparkles, Send, DollarSign, Shield, Zap, TrendingDown, ChevronRight } from 'lucide-react';

interface Recommendation {
  id: string;
  category: 'Cost Optimization' | 'Security' | 'Performance' | 'Reliability';
  title: string;
  description: string;
  impact: 'High' | 'Medium' | 'Low';
  potentialSavings?: string;
  effort: 'Easy' | 'Medium' | 'Complex';
  priority: number;
  steps: string[];
}

const mockRecommendations: Recommendation[] = [
  {
    id: 'rec-1',
    category: 'Cost Optimization',
    title: 'Right-size over-provisioned EC2 instances',
    description: 'Analysis shows 3 EC2 instances with consistently low CPU utilization (<20%). Right-sizing these instances could reduce costs significantly.',
    impact: 'High',
    potentialSavings: '$234/month',
    effort: 'Easy',
    priority: 1,
    steps: [
      'Review CloudWatch metrics for instances i-0a1b2c3d, i-4e5f6g7h, i-8i9j0k1l',
      'Identify appropriate smaller instance types (t3.medium → t3.small)',
      'Schedule maintenance window for resizing',
      'Monitor performance post-resize for 1 week',
    ],
  },
  {
    id: 'rec-2',
    category: 'Security',
    title: 'Enable encryption for unencrypted S3 buckets',
    description: '2 S3 buckets lack default encryption. This poses a compliance risk and violates CIS benchmarks.',
    impact: 'High',
    effort: 'Easy',
    priority: 2,
    steps: [
      'Navigate to S3 console',
      'Select buckets: company-logs-archive, backup-storage-bucket',
      'Enable default encryption with AWS-KMS or AES-256',
      'Update bucket policies to enforce encryption',
      'Run compliance scan to verify remediation',
    ],
  },
  {
    id: 'rec-3',
    category: 'Cost Optimization',
    title: 'Delete zombie resources',
    description: 'Found 1 stopped EC2 instance that has been inactive for 45+ days. Deleting it will eliminate associated EBS volume costs.',
    impact: 'Medium',
    potentialSavings: '$15/month',
    effort: 'Easy',
    priority: 3,
    steps: [
      'Verify instance old-test-server (i-zombie-instance) is no longer needed',
      'Create final snapshot if needed for backup',
      'Terminate the instance',
      'Verify associated EBS volumes are deleted',
    ],
  },
  {
    id: 'rec-4',
    category: 'Performance',
    title: 'Enable CloudFront caching for S3-hosted assets',
    description: 'Static assets served directly from S3 could benefit from CloudFront CDN, reducing latency and S3 egress costs.',
    impact: 'Medium',
    potentialSavings: '$45/month',
    effort: 'Medium',
    priority: 4,
    steps: [
      'Create CloudFront distribution',
      'Configure S3 bucket as origin',
      'Set appropriate cache behaviors and TTL',
      'Update DNS/application to use CloudFront domain',
      'Monitor cache hit ratio and optimize',
    ],
  },
  {
    id: 'rec-5',
    category: 'Security',
    title: 'Implement Azure Defender for Cloud',
    description: 'Azure Defender is not enabled for SQL databases and VMs. This provides advanced threat protection and security recommendations.',
    impact: 'High',
    effort: 'Easy',
    priority: 5,
    steps: [
      'Navigate to Azure Security Center',
      'Enable Azure Defender for: SQL Databases, Virtual Machines',
      'Configure email notifications for security alerts',
      'Review and implement initial recommendations',
      'Set up continuous monitoring',
    ],
  },
  {
    id: 'rec-6',
    category: 'Reliability',
    title: 'Implement automated backups for critical databases',
    description: 'RDS database does not have automated backup retention configured beyond the default 7 days.',
    impact: 'Medium',
    effort: 'Easy',
    priority: 6,
    steps: [
      'Enable automated backups for RDS instance prod-sql-database',
      'Set retention period to 30 days',
      'Configure backup window during low-traffic hours',
      'Enable cross-region backup replication',
      'Test restore process',
    ],
  },
];

const categoryIcons = {
  'Cost Optimization': <DollarSign className="w-5 h-5" />,
  'Security': <Shield className="w-5 h-5" />,
  'Performance': <Zap className="w-5 h-5" />,
  'Reliability': <TrendingDown className="w-5 h-5" />,
};

const categoryColors = {
  'Cost Optimization': 'bg-green-500/20 text-green-400 border-green-500/30',
  'Security': 'bg-red-500/20 text-red-400 border-red-500/30',
  'Performance': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  'Reliability': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
};

const impactColors = {
  High: 'text-red-400',
  Medium: 'text-yellow-400',
  Low: 'text-blue-400',
};

const effortColors = {
  Easy: 'text-green-400',
  Medium: 'text-yellow-400',
  Complex: 'text-red-400',
};

export default function AIAdvisorPage() {
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([
    {
      role: 'assistant',
      content: "Hello! I'm your AI-powered cloud optimization advisor. I've analyzed your multi-cloud infrastructure and identified 6 recommendations to improve cost, security, and performance. How can I help you today?",
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [selectedRecommendation, setSelectedRecommendation] = useState<Recommendation | null>(null);

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    // Add user message
    const newMessages = [
      ...chatMessages,
      { role: 'user' as const, content: inputMessage },
    ];

    // Simulate AI response
    const aiResponse = generateAIResponse(inputMessage);
    newMessages.push({ role: 'assistant' as const, content: aiResponse });

    setChatMessages(newMessages);
    setInputMessage('');
  };

  const generateAIResponse = (message: string): string => {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('cost') || lowerMessage.includes('save') || lowerMessage.includes('money')) {
      return "Based on my analysis, you could save approximately $294/month by implementing the top cost optimization recommendations. The highest impact actions are: 1) Right-sizing over-provisioned EC2 instances ($234/month), and 2) Deleting zombie resources ($15/month). Would you like me to create an implementation plan?";
    } else if (lowerMessage.includes('security') || lowerMessage.includes('compliance')) {
      return "I've identified 3 high-priority security issues: 1) Unencrypted S3 buckets (CIS violation), 2) Azure Defender not enabled, and 3) MFA not enabled on AWS root account. I recommend addressing these in order of severity. Shall I provide detailed remediation steps?";
    } else if (lowerMessage.includes('performance')) {
      return "Performance optimization opportunities include implementing CloudFront CDN for static assets and optimizing database query patterns. The CloudFront implementation alone could reduce latency by 60-80% for global users. Would you like specific implementation guidance?";
    } else {
      return "I can help you with cost optimization, security improvements, performance enhancements, and reliability planning. I've analyzed your infrastructure across AWS, Azure, and GCP. What specific area would you like to focus on?";
    }
  };

  const totalPotentialSavings = mockRecommendations
    .filter((r) => r.potentialSavings)
    .reduce((sum, r) => {
      const amount = parseInt(r.potentialSavings!.replace(/[^0-9]/g, ''));
      return sum + amount;
    }, 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-12rem)]">
      {/* Left Column - Recommendations */}
      <div className="lg:col-span-2 flex flex-col gap-6 overflow-hidden">
        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-[#0d1220] border border-gray-800 rounded-lg p-4">
            <p className="text-sm text-gray-400 mb-1">Total Recommendations</p>
            <p className="text-2xl font-semibold">{mockRecommendations.length}</p>
          </div>
          <div className="bg-[#0d1220] border border-gray-800 rounded-lg p-4">
            <p className="text-sm text-gray-400 mb-1">Potential Savings</p>
            <p className="text-2xl font-semibold text-green-400">${totalPotentialSavings}/mo</p>
          </div>
          <div className="bg-[#0d1220] border border-gray-800 rounded-lg p-4">
            <p className="text-sm text-gray-400 mb-1">High Priority</p>
            <p className="text-2xl font-semibold text-red-400">
              {mockRecommendations.filter((r) => r.impact === 'High').length}
            </p>
          </div>
        </div>

        {/* Recommendations List */}
        <div className="flex-1 overflow-y-auto bg-[#0d1220] border border-gray-800 rounded-lg">
          <div className="p-4 border-b border-gray-800 bg-gray-800/30 sticky top-0">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-400" />
              AI-Generated Recommendations
            </h3>
          </div>

          <div className="divide-y divide-gray-800">
            {mockRecommendations.map((rec, index) => (
              <div
                key={rec.id}
                className="p-4 hover:bg-gray-800/30 transition-colors cursor-pointer"
                onClick={() => setSelectedRecommendation(rec)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="text-2xl font-bold text-gray-600">#{index + 1}</div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-100 mb-2">{rec.title}</h4>
                      <p className="text-sm text-gray-400 mb-3">{rec.description}</p>

                      <div className="flex items-center gap-2 flex-wrap">
                        <div className={`px-3 py-1 rounded border ${categoryColors[rec.category]}`}>
                          <div className="flex items-center gap-2 text-sm">
                            {categoryIcons[rec.category]}
                            <span>{rec.category}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Impact: </span>
                            <span className={`font-medium ${impactColors[rec.impact]}`}>{rec.impact}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Effort: </span>
                            <span className={`font-medium ${effortColors[rec.effort]}`}>{rec.effort}</span>
                          </div>
                          {rec.potentialSavings && (
                            <div className="px-2 py-1 bg-green-500/20 text-green-400 rounded font-medium">
                              Save {rec.potentialSavings}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Column - AI Chat & Details */}
      <div className="flex flex-col gap-6">
        {/* Selected Recommendation Details */}
        {selectedRecommendation ? (
          <div className="bg-[#0d1220] border border-gray-800 rounded-lg p-4 max-h-[300px] overflow-y-auto">
            <h4 className="font-semibold mb-3">Implementation Steps</h4>
            <ol className="space-y-2">
              {selectedRecommendation.steps.map((step, idx) => (
                <li key={idx} className="flex gap-3 text-sm">
                  <span className="flex-shrink-0 w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center text-xs">
                    {idx + 1}
                  </span>
                  <span className="text-gray-300 flex-1">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        ) : (
          <div className="bg-[#0d1220] border border-gray-800 rounded-lg p-4 text-center text-gray-400 text-sm">
            Select a recommendation to view implementation steps
          </div>
        )}

        {/* AI Chat */}
        <div className="flex-1 bg-[#0d1220] border border-gray-800 rounded-lg flex flex-col overflow-hidden">
          <div className="p-4 border-b border-gray-800 bg-gray-800/30">
            <h3 className="font-semibold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-400" />
              AI Assistant (Gemini)
            </h3>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {chatMessages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-lg p-3 ${
                    msg.role === 'user'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-800 text-gray-100'
                  }`}
                >
                  <p className="text-sm">{msg.content}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-800">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask about optimization strategies..."
                className="flex-1 px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-100 text-sm"
              />
              <button
                onClick={handleSendMessage}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Note: This is a demo using mock AI responses. In production, this would connect to Google Gemini API.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
