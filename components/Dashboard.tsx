
import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';
import { CloudResource, InventoryStats } from '../types';
import { DollarSign, Server, AlertTriangle, TrendingUp, ShieldAlert, ArrowUpRight } from 'lucide-react';

interface DashboardProps {
  resources: CloudResource[];
  stats: InventoryStats;
}

const COLORS = ['#F59E0B', '#3B82F6', '#10B981', '#FF8042']; // AWS Orange, Azure Blue, GCP Green
const RISK_COLORS = { Critical: '#EF4444', High: '#F97316', Medium: '#EAB308', Low: '#3B82F6', Secure: '#10B981' };

const Dashboard: React.FC<DashboardProps> = ({ resources, stats }) => {
  
  const Card = ({ title, value, icon: Icon, color, subtext, trend }: any) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-start justify-between hover:shadow-md transition-shadow duration-300">
      <div>
        <div className="flex items-center gap-2 mb-2">
            <div className={`p-2 rounded-lg ${color} bg-opacity-10`}>
                <Icon className={`w-5 h-5 ${color.replace('bg-', 'text-')}`} />
            </div>
            <p className="text-sm text-slate-500 font-semibold tracking-wide">{title}</p>
        </div>
        <p className="text-3xl font-black text-slate-800 tracking-tight mt-2">{value}</p>
        {subtext && (
            <div className="flex items-center gap-2 mt-2">
                {trend && <span className="text-green-600 bg-green-50 px-1.5 py-0.5 rounded text-xs font-bold flex items-center"><ArrowUpRight className="w-3 h-3" /> {trend}</span>}
                <p className="text-xs text-slate-400 font-medium">{subtext}</p>
            </div>
        )}
      </div>
    </div>
  );

  const riskData = [
    { name: 'High Risk', value: resources.filter(r => r.riskLevel === 'Critical' || r.riskLevel === 'High').length, color: '#EF4444' },
    { name: 'Medium', value: resources.filter(r => r.riskLevel === 'Medium').length, color: '#EAB308' },
    { name: 'Secure', value: resources.filter(r => r.riskLevel === 'Secure' || r.riskLevel === 'Low').length, color: '#10B981' },
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card 
          title="Total Monthly Cost" 
          value={`$${stats.totalCost.toLocaleString()}`} 
          icon={DollarSign} 
          color="bg-emerald-500"
          subtext="vs last month"
          trend="2.4%"
        />
        <Card 
          title="Security Risks" 
          value={stats.criticalRiskCount} 
          icon={ShieldAlert} 
          color="bg-red-500" 
          subtext="Critical & High issues"
        />
        <Card 
          title="Untagged Resources" 
          value={stats.untaggedCount} 
          icon={AlertTriangle} 
          color="bg-orange-500"
          subtext="Missing Cost Center"
        />
        <Card 
          title="Total Resources" 
          value={stats.totalResources} 
          icon={Server} 
          color="bg-blue-500" 
          subtext="Across connected clouds"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 lg:col-span-2 h-[400px] flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-800">Cost Trend by Provider</h3>
            <span className="text-xs font-bold bg-slate-100 text-slate-600 px-3 py-1.5 rounded-full border border-slate-200">
                Projected: <span className="text-indigo-600">${(stats.totalCost * 12).toLocaleString()}</span> / yr
            </span>
          </div>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                data={stats.costTrend}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                barSize={32}
                >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" tick={{fill: '#64748B', fontSize: 12}} axisLine={false} tickLine={false} dy={10} />
                <YAxis tick={{fill: '#64748B', fontSize: 12}} axisLine={false} tickLine={false} tickFormatter={(value) => `$${value}`} />
                <Tooltip 
                    cursor={{fill: '#F1F5F9'}}
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                    itemStyle={{ fontSize: '12px', fontWeight: 600 }}
                    labelStyle={{ fontSize: '12px', color: '#94A3B8', marginBottom: '8px' }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }} />
                <Bar dataKey="AWS" stackId="a" fill="#F59E0B" radius={[0, 0, 4, 4]} />
                <Bar dataKey="Azure" stackId="a" fill="#3B82F6" />
                <Bar dataKey="GCP" stackId="a" fill="#10B981" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-rows-2 gap-6 h-[400px]">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
            <h3 className="text-lg font-bold mb-4 text-slate-800">Security Posture</h3>
             <div className="flex-1 flex items-center gap-2">
                <ResponsiveContainer width="50%" height="100%">
                  <PieChart>
                    <Pie 
                        data={riskData} 
                        cx="50%" 
                        cy="50%" 
                        innerRadius={35} 
                        outerRadius={55} 
                        paddingAngle={5} 
                        dataKey="value"
                        stroke="none"
                    >
                      {riskData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-3">
                  {riskData.map(d => (
                    <div key={d.name} className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: d.color}}></span>
                        <span className="text-slate-600 font-medium">{d.name}</span>
                      </div>
                      <span className="font-bold text-slate-800">{d.value}</span>
                    </div>
                  ))}
                </div>
             </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-center">
             <h3 className="text-lg font-bold mb-4 text-slate-800">Resource Distribution</h3>
             <div className="flex items-center gap-3">
                {stats.providerSplit.map((p, i) => (
                  <div key={p.name} className="flex-1 text-center py-4 rounded-xl bg-slate-50 border border-slate-100 group hover:border-indigo-100 transition-colors">
                     <div className="text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">{p.name}</div>
                     <div className="text-xl font-black text-slate-800 group-hover:text-indigo-600 transition-colors">{p.value}</div>
                  </div>
                ))}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
