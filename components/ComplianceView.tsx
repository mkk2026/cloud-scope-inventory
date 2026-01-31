
import React, { useState } from 'react';
import { CloudResource } from '../types';
import { 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle, 
  ArrowUpRight,
  Shield,
  Tag,
  Check
} from 'lucide-react';

interface ComplianceViewProps {
  resources: CloudResource[];
  onSelectResource: (resource: CloudResource) => void;
}

const ComplianceView: React.FC<ComplianceViewProps> = ({ resources, onSelectResource }) => {
  const [filter, setFilter] = useState<'All' | 'Critical' | 'High' | 'Medium' | 'Governance'>('All');

  // Calculate stats
  const totalRisks = resources.filter(r => r.riskLevel !== 'Secure').length;
  const criticalCount = resources.filter(r => r.riskLevel === 'Critical').length;
  const highCount = resources.filter(r => r.riskLevel === 'High').length;
  const mediumCount = resources.filter(r => r.riskLevel === 'Medium').length;
  const untaggedCount = resources.filter(r => Object.keys(r.tags).length === 0).length;
  
  // Simple score calculation: Percentage of secure resources
  const securityScore = resources.length > 0 
    ? Math.max(0, Math.round(((resources.length - totalRisks) / resources.length) * 100)) 
    : 100;

  const getFilteredIssues = () => {
    // Include resources that have risk OR are untagged
    let relevant = resources.filter(r => r.riskLevel !== 'Secure' || Object.keys(r.tags).length === 0);
    
    if (filter === 'Critical') return relevant.filter(r => r.riskLevel === 'Critical');
    if (filter === 'High') return relevant.filter(r => r.riskLevel === 'High');
    if (filter === 'Medium') return relevant.filter(r => r.riskLevel === 'Medium');
    if (filter === 'Governance') return relevant.filter(r => Object.keys(r.tags).length === 0);
    
    return relevant.sort((a, b) => {
        // Sort Critical first
        const severityMap = { Critical: 3, High: 2, Medium: 1, Low: 0, Secure: -1 };
        return severityMap[b.riskLevel] - severityMap[a.riskLevel];
    });
  };

  const issues = getFilteredIssues();

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
           <div>
             <p className="text-slate-500 font-bold text-xs uppercase tracking-wider">Compliance Score</p>
             <p className={`text-3xl font-black mt-1 ${securityScore >= 80 ? 'text-emerald-600' : securityScore >= 50 ? 'text-orange-500' : 'text-red-600'}`}>
                {securityScore}%
             </p>
           </div>
           <div className={`p-3 rounded-full ${securityScore >= 80 ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-500'}`}>
             <Shield className="w-6 h-6" />
           </div>
        </div>
        
        <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
           <div>
             <p className="text-slate-500 font-bold text-xs uppercase tracking-wider">Critical Issues</p>
             <p className="text-3xl font-black text-red-600 mt-1">{criticalCount}</p>
           </div>
           <div className="p-3 rounded-full bg-red-50 text-red-600">
             <ShieldAlert className="w-6 h-6" />
           </div>
        </div>

        <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
           <div>
             <p className="text-slate-500 font-bold text-xs uppercase tracking-wider">High Severity</p>
             <p className="text-3xl font-black text-orange-600 mt-1">{highCount}</p>
           </div>
           <div className="p-3 rounded-full bg-orange-50 text-orange-600">
             <AlertTriangle className="w-6 h-6" />
           </div>
        </div>

        <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
           <div>
             <p className="text-slate-500 font-bold text-xs uppercase tracking-wider">Untagged</p>
             <p className="text-3xl font-black text-slate-700 mt-1">{untaggedCount}</p>
           </div>
           <div className="p-3 rounded-full bg-slate-100 text-slate-600">
             <Tag className="w-6 h-6" />
           </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-h-[500px]">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                Active Violations <span className="bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full text-xs">{issues.length}</span>
            </h2>
            <div className="flex gap-2">
                {(['All', 'Critical', 'High', 'Governance'] as const).map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            filter === f 
                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' 
                            : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                    >
                        {f}
                    </button>
                ))}
            </div>
        </div>

        <div className="divide-y divide-slate-100">
            {issues.length === 0 ? (
                <div className="p-20 text-center text-slate-500 flex flex-col items-center">
                    <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-4">
                        <Check className="w-8 h-8 text-emerald-500" />
                    </div>
                    <p className="font-bold text-lg text-slate-800">No Violations Found</p>
                    <p className="text-sm mt-1 max-w-xs mx-auto">Your infrastructure passes all checks for the selected filter.</p>
                </div>
            ) : (
                issues.map(resource => (
                    <div key={resource.id} className="p-6 hover:bg-slate-50 transition-colors group">
                        <div className="flex items-start gap-4">
                            <div className="mt-1 flex-shrink-0">
                                {resource.riskLevel === 'Critical' && <ShieldAlert className="w-6 h-6 text-red-500" />}
                                {resource.riskLevel === 'High' && <AlertTriangle className="w-6 h-6 text-orange-500" />}
                                {(resource.riskLevel === 'Medium' || resource.riskLevel === 'Low') && <AlertTriangle className="w-6 h-6 text-yellow-500" />}
                                {(resource.riskLevel === 'Secure' && Object.keys(resource.tags).length === 0) && <Tag className="w-6 h-6 text-slate-400" />}
                            </div>
                            <div className="flex-1">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2">
                                    <div className="flex items-center gap-3">
                                        <h3 className="text-base font-bold text-slate-900">{resource.name}</h3>
                                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${
                                            resource.provider === 'AWS' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                                            resource.provider === 'Azure' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                            'bg-green-50 text-green-600 border-green-100'
                                        }`}>
                                            {resource.provider}
                                        </span>
                                        <span className="text-xs text-slate-400 font-mono hidden sm:inline">{resource.id}</span>
                                    </div>
                                    <button 
                                        onClick={() => onSelectResource(resource)}
                                        className="text-xs font-bold text-indigo-600 hover:text-indigo-800 opacity-0 group-hover:opacity-100 transition-opacity text-left sm:text-right mt-1 sm:mt-0"
                                    >
                                        View Resource Details
                                    </button>
                                </div>
                                
                                <div className="space-y-3 mt-3">
                                    {/* Security Issues */}
                                    {resource.securityIssues?.map((issue, idx) => (
                                        <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between bg-red-50/50 p-4 rounded-xl border border-red-100/50 gap-3">
                                            <div className="text-sm text-red-900/90 font-medium">
                                                {issue}
                                            </div>
                                            <a 
                                                href={`https://www.google.com/search?q=${encodeURIComponent(issue + " remediation " + resource.provider)}`} 
                                                target="_blank" 
                                                rel="noreferrer"
                                                className="flex items-center gap-1.5 text-xs font-bold bg-white px-3 py-2 rounded-lg text-red-700 border border-red-100 shadow-sm hover:bg-red-50 hover:border-red-200 transition-colors whitespace-nowrap w-fit"
                                            >
                                                Remediation Guide <ArrowUpRight className="w-3 h-3" />
                                            </a>
                                        </div>
                                    ))}

                                    {/* Tagging Issues */}
                                    {Object.keys(resource.tags).length === 0 && (
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-slate-100/50 p-4 rounded-xl border border-slate-200/50 gap-3">
                                            <div className="text-sm text-slate-700 font-medium flex items-center gap-2">
                                                <Tag className="w-4 h-4 text-slate-400" />
                                                Missing required cost allocation tags (Owner, Environment, CostCenter)
                                            </div>
                                            <button className="flex items-center gap-1.5 text-xs font-bold bg-white px-3 py-2 rounded-lg text-slate-600 border border-slate-200 shadow-sm hover:text-indigo-600 hover:border-indigo-100 transition-colors whitespace-nowrap w-fit">
                                                Manage Tags <ArrowUpRight className="w-3 h-3" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))
            )}
        </div>
      </div>
    </div>
  );
};

export default ComplianceView;
