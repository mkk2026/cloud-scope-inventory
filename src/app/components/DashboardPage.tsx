import { DollarSign, ShieldAlert, AlertTriangle, Cloud, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

// Mock data for charts
const costTrendData = [
  { month: 'Jan', AWS: 3200, Azure: 4800, GCP: 2500 },
  { month: 'Feb', AWS: 2800, Azure: 2400, GCP: 2000 },
  { month: 'Mar', AWS: 2500, Azure: 8200, GCP: 2500 },
  { month: 'Apr', AWS: 2400, Azure: 5200, GCP: 2200 },
  { month: 'May', AWS: 2800, Azure: 5600, GCP: 2000 },
  { month: 'Jun', AWS: 3400, Azure: 5000, GCP: 2200 },
];

const securityPostureData = [
  { name: 'High Risk', value: 3, color: '#ef4444' },
  { name: 'Secure', value: 5, color: '#10b981' },
];

const resourceDistribution = [
  { provider: 'AWS', count: 5 },
  { provider: 'GCP', count: 1 },
  { provider: 'AZURE', count: 2 },
];

export default function DashboardPage() {
  const kpiCards = [
    {
      title: 'Total Monthly Cost',
      value: '$2,552.95',
      change: '+2.4%',
      changeLabel: 'vs last month',
      icon: <DollarSign className="w-6 h-6" />,
      iconBg: 'bg-cyan-500/20',
      iconColor: 'text-cyan-400',
      positive: true,
    },
    {
      title: 'Security Risks',
      value: '3',
      changeLabel: 'Critical & High issues',
      icon: <ShieldAlert className="w-6 h-6" />,
      iconBg: 'bg-red-500/20',
      iconColor: 'text-red-400',
      positive: false,
    },
    {
      title: 'Untagged Resources',
      value: '1',
      changeLabel: 'Missing Cost Center',
      icon: <AlertTriangle className="w-6 h-6" />,
      iconBg: 'bg-orange-500/20',
      iconColor: 'text-orange-400',
      positive: false,
    },
    {
      title: 'Total Resources',
      value: '8',
      changeLabel: 'Across connected clouds',
      icon: <Cloud className="w-6 h-6" />,
      iconBg: 'bg-indigo-500/20',
      iconColor: 'text-indigo-400',
      positive: true,
    },
  ];

  const totalAnnualProjection = costTrendData.reduce((sum, month) => 
    sum + month.AWS + month.Azure + month.GCP, 0
  ) * 2; // Simplified projection

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiCards.map((card, index) => (
          <div
            key={index}
            className="bg-[#0d1220] border border-gray-800 rounded-lg p-6 hover:border-gray-700 transition-colors"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-lg ${card.iconBg}`}>
                <div className={card.iconColor}>{card.icon}</div>
              </div>
            </div>
            <h3 className="text-sm text-gray-400 mb-2">{card.title}</h3>
            <div className="flex items-end justify-between">
              <p className="text-3xl font-semibold">{card.value}</p>
              {card.change && (
                <span className={`text-sm flex items-center gap-1 ${card.positive ? 'text-green-400' : 'text-red-400'}`}>
                  <TrendingUp className="w-4 h-4" />
                  {card.change}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-2">{card.changeLabel}</p>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cost Trend Chart */}
        <div className="lg:col-span-2 bg-[#0d1220] border border-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Cost Trend by Provider</h3>
            <div className="text-sm text-gray-400">
              Projected: <span className="text-cyan-400 font-semibold">${totalAnnualProjection.toLocaleString()}/yr</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={costTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0d1220',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: '#9ca3af' }}
              />
              <Legend />
              <Bar dataKey="AWS" stackId="a" fill="#f59e0b" />
              <Bar dataKey="Azure" stackId="a" fill="#3b82f6" />
              <Bar dataKey="GCP" stackId="a" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Right Column - Security & Resources */}
        <div className="space-y-6">
          {/* Security Posture */}
          <div className="bg-[#0d1220] border border-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Security Posture</h3>
            <div className="flex items-center justify-center mb-4">
              <ResponsiveContainer width="100%" height={150}>
                <PieChart>
                  <Pie
                    data={securityPostureData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={60}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {securityPostureData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2">
              {securityPostureData.map((item, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-gray-300">{item.name}</span>
                  </div>
                  <span className="font-semibold">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Resource Distribution */}
          <div className="bg-[#0d1220] border border-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Resource Distribution</h3>
            <div className="space-y-3">
              {resourceDistribution.map((resource, index) => (
                <div
                  key={index}
                  className="bg-gray-800/30 rounded-lg p-4 border border-gray-700/50"
                >
                  <div className="text-sm text-gray-400 mb-1">{resource.provider}</div>
                  <div className="text-2xl font-semibold">{resource.count}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
