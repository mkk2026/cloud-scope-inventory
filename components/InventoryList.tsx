
import React, { useState } from 'react';
import { CloudResource } from '../types';
import { 
  Search, 
  Filter, 
  RefreshCw, 
  ChevronDown, 
  ChevronUp, 
  ShieldAlert, 
  AlertCircle, 
  CheckCircle, 
  MoreHorizontal,
  SlidersHorizontal,
  X,
  Calendar,
  Tag as TagIcon
} from 'lucide-react';

interface InventoryListProps {
  resources: CloudResource[];
  onRefresh: () => void;
  onSelectResource: (resource: CloudResource) => void;
}

const InventoryList: React.FC<InventoryListProps> = ({ resources, onRefresh, onSelectResource }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  // Advanced Filters State
  const [filterProvider, setFilterProvider] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [filterRisk, setFilterRisk] = useState<string>('All');
  const [filterTags, setFilterTags] = useState<string>('');
  const [dateRange, setDateRange] = useState<{start: string, end: string}>({start: '', end: ''});

  const [sortField, setSortField] = useState<keyof CloudResource>('costPerMonth');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const handleSort = (field: keyof CloudResource) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const clearFilters = () => {
    setFilterProvider('All');
    setFilterStatus('All');
    setFilterRisk('All');
    setFilterTags('');
    setDateRange({start: '', end: ''});
    setSearchTerm('');
  };

  // Calculate active filters for badge
  const activeFilterCount = [
    filterProvider !== 'All',
    filterStatus !== 'All',
    filterRisk !== 'All',
    filterTags !== '',
    dateRange.start !== '',
    dateRange.end !== ''
  ].filter(Boolean).length;

  const filteredResources = resources
    .filter(resource => {
      // 1. Search Term
      const matchesSearch = resource.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            resource.id.toLowerCase().includes(searchTerm.toLowerCase());
      
      // 2. Provider
      const matchesProvider = filterProvider === 'All' || resource.provider === filterProvider;

      // 3. Status
      const matchesStatus = filterStatus === 'All' || resource.status === filterStatus;

      // 4. Risk Level
      const matchesRisk = filterRisk === 'All' || resource.riskLevel === filterRisk;

      // 5. Tags
      let matchesTags = true;
      if (filterTags) {
          const tagFilterLower = filterTags.toLowerCase();
          if (tagFilterLower.includes(':')) {
              const [k, v] = tagFilterLower.split(':').map(s => s.trim());
              if (k && v) {
                  matchesTags = Object.entries(resource.tags).some(([rk, rv]) => 
                      rk.toLowerCase().includes(k) && rv.toLowerCase().includes(v)
                  );
              }
          } else {
               matchesTags = Object.entries(resource.tags).some(([k, v]) => 
                  k.toLowerCase().includes(tagFilterLower) || v.toLowerCase().includes(tagFilterLower)
               );
          }
      }

      // 6. Date Range
      let matchesDate = true;
      const resDate = new Date(resource.createdAt);
      if (dateRange.start) {
          matchesDate = matchesDate && resDate >= new Date(dateRange.start);
      }
      if (dateRange.end) {
          const endDate = new Date(dateRange.end);
          endDate.setHours(23, 59, 59, 999);
          matchesDate = matchesDate && resDate <= endDate;
      }

      return matchesSearch && matchesProvider && matchesStatus && matchesRisk && matchesTags && matchesDate;
    })
    .sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }
      return sortDirection === 'asc' 
        ? String(aValue).localeCompare(String(bValue))
        : String(bValue).localeCompare(String(aValue));
    });

  const getRiskBadge = (level: string) => {
    switch (level) {
      case 'Critical': return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-red-50 text-red-600 border border-red-100"><ShieldAlert className="w-3.5 h-3.5"/> Critical</span>;
      case 'High': return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-orange-50 text-orange-700 border border-orange-100"><AlertCircle className="w-3.5 h-3.5"/> High</span>;
      case 'Medium': return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-yellow-50 text-yellow-700 border border-yellow-100"><AlertCircle className="w-3.5 h-3.5"/> Med</span>;
      default: return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100"><CheckCircle className="w-3.5 h-3.5"/> Secure</span>;
    }
  };

  const SortIcon = ({ field }: { field: keyof CloudResource }) => {
    if (sortField !== field) return <ChevronDown className="w-3 h-3 text-slate-300 opacity-0 group-hover:opacity-50" />;
    return sortDirection === 'asc' ? <ChevronUp className="w-3 h-3 text-indigo-500" /> : <ChevronDown className="w-3 h-3 text-indigo-500" />;
  };

  const Th = ({ field, children }: { field: keyof CloudResource, children: React.ReactNode }) => (
    <th 
      onClick={() => handleSort(field)}
      className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-50 transition-colors group select-none"
    >
      <div className="flex items-center gap-1.5">
        {children}
        <SortIcon field={field} />
      </div>
    </th>
  );

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col h-[calc(100vh-160px)] animate-fade-in">
      <div className="flex flex-col border-b border-slate-100 bg-white rounded-t-2xl z-20">
        {/* Primary Toolbar */}
        <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-3">
            Inventory <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-xs rounded-full font-bold">{filteredResources.length}</span>
            </h2>
            
            <div className="flex gap-3">
            <div className="relative group flex-1 sm:flex-none">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 w-4 h-4 transition-colors" />
                <input 
                type="text" 
                placeholder="Search resources..." 
                className="pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white w-full sm:w-64 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <button 
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-bold transition-all ${
                    showFilters || activeFilterCount > 0
                    ? 'bg-indigo-50 border-indigo-200 text-indigo-700' 
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
            >
                <SlidersHorizontal className="w-4 h-4" />
                <span className="hidden sm:inline">Filters</span>
                {activeFilterCount > 0 && (
                    <span className="flex items-center justify-center w-5 h-5 bg-indigo-600 text-white rounded-full text-[10px] ml-1">
                        {activeFilterCount}
                    </span>
                )}
            </button>

            <button 
                onClick={onRefresh}
                className="p-2.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all border border-slate-200 hover:border-indigo-200"
                title="Force Sync"
            >
                <RefreshCw className="w-4 h-4" />
            </button>
            </div>
        </div>

        {/* Collapsible Advanced Filters */}
        {showFilters && (
            <div className="px-5 pb-5 pt-0 animate-in slide-in-from-top-2 duration-200">
                <div className="p-5 bg-slate-50/80 rounded-xl border border-slate-200 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    
                    {/* Provider Filter */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Cloud Provider</label>
                        <div className="relative">
                            <select 
                                className="w-full pl-3 pr-8 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none appearance-none"
                                value={filterProvider}
                                onChange={(e) => setFilterProvider(e.target.value)}
                            >
                                <option value="All">All Providers</option>
                                <option value="AWS">AWS</option>
                                <option value="Azure">Azure</option>
                                <option value="GCP">GCP</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-3 h-3 pointer-events-none" />
                        </div>
                    </div>

                    {/* Status Filter */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Status</label>
                        <div className="relative">
                            <select 
                                className="w-full pl-3 pr-8 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none appearance-none"
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                            >
                                <option value="All">All Statuses</option>
                                <option value="Running">Running</option>
                                <option value="Stopped">Stopped</option>
                                <option value="Terminated">Terminated</option>
                                <option value="Unknown">Unknown</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-3 h-3 pointer-events-none" />
                        </div>
                    </div>

                    {/* Risk Filter */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Risk Level</label>
                        <div className="relative">
                            <select 
                                className="w-full pl-3 pr-8 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none appearance-none"
                                value={filterRisk}
                                onChange={(e) => setFilterRisk(e.target.value)}
                            >
                                <option value="All">All Levels</option>
                                <option value="Critical">Critical</option>
                                <option value="High">High</option>
                                <option value="Medium">Medium</option>
                                <option value="Low">Low</option>
                                <option value="Secure">Secure</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-3 h-3 pointer-events-none" />
                        </div>
                    </div>

                     {/* Creation Date Filter */}
                     <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Created After</label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
                            <input 
                                type="date"
                                className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-600"
                                value={dateRange.start}
                                onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                            />
                        </div>
                    </div>

                    {/* Tags Filter */}
                    <div className="space-y-1.5 md:col-span-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Filter by Tags</label>
                        <div className="relative">
                            <TagIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
                            <input 
                                type="text"
                                placeholder="Search tags (e.g. 'Env:Prod' or 'Owner')"
                                className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none placeholder:text-slate-400"
                                value={filterTags}
                                onChange={(e) => setFilterTags(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Clear Button */}
                    <div className="flex items-end justify-end md:col-span-2">
                        <button 
                            onClick={clearFilters}
                            className="text-xs font-bold text-slate-500 hover:text-red-600 flex items-center gap-1 px-3 py-2 hover:bg-red-50 rounded-lg transition-colors"
                        >
                            <X className="w-3.5 h-3.5" /> Clear All Filters
                        </button>
                    </div>

                </div>
            </div>
        )}
      </div>

      <div className="flex-1 overflow-auto custom-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead className="bg-white sticky top-0 z-10 shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
            <tr>
              <Th field="name">Name / ID</Th>
              <Th field="provider">Cloud</Th>
              <Th field="type">Type</Th>
              <Th field="riskLevel">Security</Th>
              <Th field="costPerMonth">Cost</Th>
              <Th field="status">Status</Th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Tags</th>
              <th className="p-4 w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {filteredResources.map((resource) => (
              <tr 
                key={resource.id} 
                onClick={() => onSelectResource(resource)}
                className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
              >
                <td className="p-4">
                  <div className="font-bold text-slate-800 text-sm group-hover:text-indigo-600 transition-colors">{resource.name}</div>
                  <div className="text-xs text-slate-400 font-mono mt-0.5">{resource.id}</div>
                </td>
                <td className="p-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold w-fit border shadow-sm
                      ${resource.provider === 'AWS' ? 'bg-[#FF9900]/10 text-[#FF9900] border-[#FF9900]/20' : 
                        resource.provider === 'Azure' ? 'bg-[#007FFF]/10 text-[#007FFF] border-[#007FFF]/20' : 
                        'bg-[#0F9D58]/10 text-[#0F9D58] border-[#0F9D58]/20'}`}>
                      {resource.provider}
                    </span>
                </td>
                <td className="p-4 text-sm font-medium text-slate-600">{resource.type}</td>
                <td className="p-4">
                  {getRiskBadge(resource.riskLevel)}
                </td>
                <td className="p-4 text-sm font-bold text-slate-800">${resource.costPerMonth.toFixed(2)}</td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${
                      resource.status === 'Running' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 
                      resource.status === 'Stopped' ? 'bg-slate-300' : 'bg-red-500'
                    }`}></span>
                    <span className="text-sm font-medium text-slate-600">{resource.status}</span>
                  </div>
                </td>
                <td className="p-4">
                  {Object.keys(resource.tags).length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {Object.entries(resource.tags).slice(0, 2).map(([key, val]) => (
                        <span key={key} className="inline-flex px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                          <span className="font-bold mr-1 text-slate-400">{key}:</span>{val}
                        </span>
                      ))}
                      {Object.keys(resource.tags).length > 2 && (
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-slate-100 text-[10px] font-bold text-slate-500 border border-slate-200">
                            +{Object.keys(resource.tags).length - 2}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-xs font-medium text-red-500 bg-red-50 px-2 py-0.5 rounded">Missing Tags</span>
                  )}
                </td>
                <td className="p-4 text-center">
                    <MoreHorizontal className="w-4 h-4 text-slate-300 group-hover:text-slate-500" />
                </td>
              </tr>
            ))}
            {filteredResources.length === 0 && (
                <tr>
                    <td colSpan={8} className="p-12 text-center">
                        <div className="flex flex-col items-center justify-center text-slate-400">
                            <Filter className="w-12 h-12 mb-3 opacity-20" />
                            <p className="font-medium text-slate-600">No resources match your filters</p>
                            <button onClick={clearFilters} className="mt-3 text-indigo-600 font-bold text-sm hover:underline">
                                Clear all filters
                            </button>
                        </div>
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InventoryList;
