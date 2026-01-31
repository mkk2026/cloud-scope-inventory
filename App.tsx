
import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, 
  Server, 
  Tag, 
  TrendingUp, 
  MessageSquare, 
  Cloud,
  LogOut,
  Bell,
  Plus,
  X,
  ShieldCheck,
  Download,
  Users,
  Lock,
  Settings,
  RefreshCw,
  Zap,
  Loader2,
  AlertTriangle,
  ArrowUpRight,
  CheckCircle
} from 'lucide-react';
import { CloudResource, InventoryStats, User } from './types';
import { inventoryService } from './services/mockData';
import { authService, MOCK_USERS } from './services/authService';
import Dashboard from './components/Dashboard';
import InventoryList from './components/InventoryList';
import TopologyGraph from './components/TopologyGraph';
import AiAdvisor from './components/AiAdvisor';
import SettingsModal from './components/SettingsModal';
import ComplianceView from './components/ComplianceView';
import ErrorBoundary from './components/ErrorBoundary';
import { ToastProvider, useToast } from './components/ToastProvider';

type View = 'dashboard' | 'inventory' | 'topology' | 'compliance' | 'advisor';

import { validateEnvironment } from './services/envService';

// Validate environment on app start
validateEnvironment();

const AppContent: React.FC = () => {
  const { showToast } = useToast();
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [resources, setResources] = useState<CloudResource[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isBackgroundSyncing, setIsBackgroundSyncing] = useState(false);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState<CloudResource | null>(null);
  const [currentUser, setCurrentUser] = useState<User>(authService.getCurrentUser());
  const [stats, setStats] = useState<InventoryStats>({
    totalResources: 0,
    totalCost: 0,
    untaggedCount: 0,
    criticalRiskCount: 0,
    providerSplit: [],
    costTrend: []
  });

  // Auto-Sync State
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(false);
  const [syncInterval, setSyncInterval] = useState(15); // Minutes
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  const refreshStats = (currentResources: CloudResource[]) => {
     setStats(inventoryService.getStats(currentResources));
  };

  const handleSwitchUser = (userId: string) => {
    const newUser = authService.switchUser(userId);
    setCurrentUser(newUser);
  };

  const syncData = async (provider: string = "All", isBackground: boolean = false) => {
    if (isBackground) {
      setIsBackgroundSyncing(true);
    } else {
      setIsLoading(true);
    }

    try {
      // Simulate API handshake and data fetch
      const newResources = await inventoryService.fetchCloudSnapshot("Production", provider);
      setResources(newResources);
      refreshStats(newResources);
      setLastSyncTime(new Date());
    } catch (error) {
      console.error("Sync failed:", error);
    } finally {
      if (isBackground) {
        setIsBackgroundSyncing(false);
      } else {
        setIsLoading(false);
      }
    }
  };

  const handleConnect = async (provider: string) => {
    if (!authService.hasPermission('manage_connections')) return;
    setIsConnectModalOpen(false);
    showToast(`Connecting to ${provider}...`, 'info');
    await syncData(provider);
    showToast(`Successfully connected to ${provider}`, 'success');
  };

  const handleImport = () => {
    if (!authService.hasPermission('import_data')) return;

    const json = prompt("Paste your JSON inventory array here:");
    if (json) {
       try {
         const imported = inventoryService.importData(json);
         setResources(imported);
         refreshStats(imported);
         setLastSyncTime(new Date());
         showToast(`Imported ${imported.length} resources`, 'success');
       } catch (error) {
         showToast('Failed to import data. Please check JSON format.', 'error');
       }
    }
  };

  // Auto-Sync Effect
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (autoSyncEnabled && resources.length > 0) {
      // Convert minutes to milliseconds
      const intervalMs = syncInterval * 60 * 1000;
      
      console.log(`Auto-sync scheduled every ${syncInterval} minutes.`);
      
      intervalId = setInterval(() => {
        console.log(`Executing auto-sync (Interval: ${syncInterval}m)`);
        syncData("All", true);
      }, intervalMs);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [autoSyncEnabled, syncInterval, resources.length]);

  const NavItem = ({ view, icon: Icon, label }: { view: View; icon: any; label: string }) => (
    <button
      onClick={() => setCurrentView(view)}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 mb-1 group ${
        currentView === view 
          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20' 
          : 'text-slate-400 hover:bg-slate-800 hover:text-white'
      }`}
    >
      <Icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${currentView === view ? 'text-indigo-200' : 'text-slate-500 group-hover:text-white'}`} />
      <span className="font-medium tracking-wide text-sm">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans text-slate-900">
      {/* Sidebar - Redesigned Dark Theme */}
      <aside className="w-72 bg-slate-900 border-r border-slate-800 hidden md:flex flex-col shadow-xl z-20">
        <div className="p-6 flex items-center gap-3 border-b border-slate-800 bg-slate-950/50">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-900/20">
            <Cloud className="w-6 h-6 text-white" />
          </div>
          <div>
             <span className="text-xl font-bold text-white tracking-tight block">CloudScope</span>
             <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">Inventory Pro</span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-6 overflow-y-auto custom-scrollbar">
          <div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 px-4">Overview</div>
            <NavItem view="dashboard" icon={LayoutDashboard} label="Dashboard" />
            <NavItem view="inventory" icon={Server} label="Resources" />
            <NavItem view="topology" icon={TrendingUp} label="Topology Map" />
          </div>
          
          <div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 px-4">Governance</div>
            <NavItem view="compliance" icon={Tag} label="Compliance" />
            <NavItem view="advisor" icon={MessageSquare} label="AI Advisor" />
          </div>

          {/* RBAC Demo Switcher */}
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1">
              <Users className="w-3 h-3" /> Role Simulation
            </div>
            <div className="space-y-2">
              {MOCK_USERS.map(user => (
                <button
                  key={user.id}
                  onClick={() => handleSwitchUser(user.id)}
                  className={`w-full flex items-center gap-2 p-2 rounded-lg text-xs transition-colors ${
                    currentUser.id === user.id ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full shadow-[0_0_8px] ${
                    user.role === 'Admin' ? 'bg-red-500 shadow-red-500/50' : 
                    user.role === 'Editor' ? 'bg-blue-500 shadow-blue-500/50' : 'bg-emerald-500 shadow-emerald-500/50'
                  }`} />
                  {user.name} ({user.role})
                </button>
              ))}
            </div>
          </div>
        </nav>

        <div className="p-4 border-t border-slate-800 bg-slate-950/30">
          <button className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-red-400 hover:bg-slate-800/50 rounded-lg transition-all w-full group">
            <LogOut className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
            <span className="font-medium text-sm">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative shadow-2xl">
        {/* Header */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-8 z-10 sticky top-0">
          <div className="flex items-center gap-4">
             <h1 className="text-2xl font-bold text-slate-800 capitalize tracking-tight">
               {currentView === 'advisor' ? 'AI Advisor' : currentView.replace('-', ' ')}
             </h1>
             {lastSyncTime && (
                <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium border border-green-100 animate-fade-in">
                   {isBackgroundSyncing ? (
                     <Loader2 className="w-3 h-3 animate-spin" />
                   ) : (
                     <RefreshCw className="w-3 h-3" />
                   )}
                   {isBackgroundSyncing ? 'Syncing...' : `Synced: ${lastSyncTime.toLocaleTimeString()}`}
                </div>
             )}
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
                 {/* Auto Sync Indicator / Button */}
                 {autoSyncEnabled && (
                    <button 
                      onClick={() => setIsSettingsOpen(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-bold border border-indigo-100 hover:bg-indigo-100 transition-colors"
                      title="Click to configure Auto-Sync"
                    >
                        <Zap className={`w-3 h-3 fill-indigo-600 ${isBackgroundSyncing ? 'animate-pulse' : ''}`} />
                        {isBackgroundSyncing ? 'SYNCING' : `AUTO ${syncInterval < 60 ? syncInterval + 'm' : (syncInterval / 60) + 'h'}`}
                    </button>
                 )}

                <button 
                  onClick={() => setIsSettingsOpen(true)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                  title="Settings"
                >
                  <Settings className="w-5 h-5" />
                </button>
                <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full relative transition-colors">
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                </button>
            </div>

            <div className="h-8 w-px bg-slate-200"></div>

            {/* Header Actions */}
            <button 
              onClick={() => setIsConnectModalOpen(true)}
              disabled={!authService.hasPermission('manage_connections')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm ${
                authService.hasPermission('manage_connections') 
                  ? 'bg-slate-900 text-white hover:bg-slate-800 hover:shadow-md hover:scale-[1.02]' 
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
            >
              {!authService.hasPermission('manage_connections') ? <Lock className="w-3 h-3" /> : <Plus className="w-4 h-4" />} 
              Connect Account
            </button>
            
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-800">{currentUser.name}</p>
                <div className="flex items-center justify-end gap-1">
                    <span className={`w-1.5 h-1.5 rounded-full ${
                        currentUser.role === 'Admin' ? 'bg-red-500' : 
                        currentUser.role === 'Editor' ? 'bg-blue-500' : 'bg-emerald-500'
                    }`}></span>
                    <p className="text-xs font-medium text-slate-500">{currentUser.role}</p>
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-slate-200 border-2 border-white shadow-md overflow-hidden">
                 <img src={currentUser.avatar} alt="User" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </header>

        {/* View Content */}
        <div className="flex-1 overflow-auto p-8 relative scroll-smooth">
          {isLoading && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center animate-in fade-in duration-300">
              <div className="relative">
                  <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                      <Cloud className="w-6 h-6 text-indigo-600" />
                  </div>
              </div>
              <p className="text-slate-800 font-bold mt-6 text-lg">Synchronizing Infrastructure</p>
              <p className="text-slate-500 text-sm mt-1">Discovering resources across regions...</p>
            </div>
          )}

          {resources.length === 0 && !isLoading ? (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-lg mx-auto animate-in zoom-in-95 duration-500">
              <div className="w-24 h-24 bg-indigo-50 rounded-3xl flex items-center justify-center mb-8 shadow-inner">
                <Cloud className="w-12 h-12 text-indigo-600" />
              </div>
              <h2 className="text-3xl font-bold text-slate-900 mb-3">No Connected Clouds</h2>
              <p className="text-slate-500 mb-10 leading-relaxed text-lg">
                Your inventory is empty. Connect a provider to visualize your infrastructure, track costs, and ensure compliance.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 w-full">
                <button 
                  onClick={() => setIsConnectModalOpen(true)}
                  disabled={!authService.hasPermission('manage_connections')}
                  className={`flex-1 px-8 py-4 rounded-xl font-bold text-lg shadow-xl transition-all ${
                     authService.hasPermission('manage_connections')
                     ? 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-indigo-200 hover:-translate-y-1'
                     : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                  }`}
                >
                   {authService.hasPermission('manage_connections') ? 'Connect Account' : 'Connect Disabled'}
                </button>
                <button 
                  onClick={handleImport}
                  disabled={!authService.hasPermission('import_data')}
                  className={`flex-1 px-8 py-4 border-2 rounded-xl font-bold text-lg transition-all ${
                    authService.hasPermission('import_data')
                    ? 'bg-white border-slate-200 text-slate-700 hover:border-indigo-200 hover:bg-indigo-50 hover:-translate-y-1'
                    : 'bg-slate-50 border-slate-200 text-slate-300 cursor-not-allowed'
                  }`}
                >
                  {authService.hasPermission('import_data') ? 'Import JSON' : 'Import Disabled'}
                </button>
              </div>
            </div>
          ) : (
            <>
              {currentView === 'dashboard' && <Dashboard resources={resources} stats={stats} />}
              {currentView === 'inventory' && (
                <InventoryList 
                  resources={resources} 
                  onRefresh={() => syncData("All", false)} 
                  onSelectResource={setSelectedResource}
                />
              )}
              {currentView === 'topology' && <TopologyGraph resources={resources} />}
              
              {currentView === 'compliance' && (
                <ComplianceView resources={resources} onSelectResource={setSelectedResource} />
              )}

              {currentView === 'advisor' && <AiAdvisor resources={resources} />}
            </>
          )}
        </div>

        {/* Resource Details Drawer */}
        {selectedResource && (
          <div className="absolute inset-0 z-40 flex justify-end bg-slate-900/20 backdrop-blur-sm">
            <div 
                className="w-full max-w-[500px] bg-white shadow-2xl h-full flex flex-col animate-in slide-in-from-right duration-300"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6 border-b border-slate-100 flex items-start justify-between bg-slate-50/50">
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <span className={`px-2.5 py-1 text-xs rounded-md font-bold uppercase tracking-wider ${selectedResource.status === 'Running' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
                        {selectedResource.status}
                        </span>
                        <span className="px-2.5 py-1 bg-white border border-slate-200 text-slate-500 text-xs rounded-md font-medium">{selectedResource.type}</span>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 leading-tight">{selectedResource.name}</h2>
                    <p className="text-sm text-slate-500 font-mono mt-1 flex items-center gap-2">
                        {selectedResource.id}
                        <button className="text-indigo-600 hover:underline text-xs font-sans font-medium">Copy</button>
                    </p>
                </div>
                <button onClick={() => setSelectedResource(null)} className="p-2 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
                    <X className="w-6 h-6" />
                </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                {/* Cost Section */}
                <section>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <span className="w-8 h-[1px] bg-slate-200"></span> Cost Analysis
                    </h3>
                    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 p-5 rounded-2xl flex items-center justify-between shadow-sm">
                    <div>
                        <p className="text-emerald-800 text-sm font-bold opacity-80 mb-1">Monthly Run Rate</p>
                        <p className="text-3xl font-black text-emerald-900 tracking-tight">${selectedResource.costPerMonth.toFixed(2)}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-emerald-800 text-xs font-semibold opacity-70 mb-1">Annual Projection</p>
                        <p className="text-emerald-900 font-bold text-lg">${(selectedResource.costPerMonth * 12).toFixed(2)}</p>
                    </div>
                    </div>
                </section>

                {/* Security Section (Overhauled) */}
                <section>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <span className="w-8 h-[1px] bg-slate-200"></span> Security & Risk
                    </h3>
                    <div className={`p-5 rounded-2xl border-l-4 shadow-sm transition-all ${
                        selectedResource.riskLevel === 'Critical' ? 'bg-red-50 border-red-500' :
                        selectedResource.riskLevel === 'High' ? 'bg-orange-50 border-orange-500' :
                        selectedResource.riskLevel === 'Medium' ? 'bg-yellow-50 border-yellow-500' :
                        'bg-emerald-50 border-emerald-500'
                    }`}>
                    <div className="flex items-center gap-4 mb-6">
                        <div className={`p-3 rounded-xl shadow-sm ${
                             selectedResource.riskLevel === 'Critical' ? 'bg-red-100 text-red-600' :
                             selectedResource.riskLevel === 'High' ? 'bg-orange-100 text-orange-600' :
                             selectedResource.riskLevel === 'Medium' ? 'bg-yellow-100 text-yellow-600' :
                             'bg-emerald-100 text-emerald-600'
                        }`}>
                            <ShieldCheck className="w-8 h-8" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-0.5">Risk Assessment</p>
                            <span className={`font-black text-2xl tracking-tight ${
                                selectedResource.riskLevel === 'Critical' ? 'text-red-700' :
                                selectedResource.riskLevel === 'High' ? 'text-orange-700' :
                                selectedResource.riskLevel === 'Medium' ? 'text-yellow-700' :
                                'text-emerald-700'
                            }`}>
                                {selectedResource.riskLevel}
                            </span>
                        </div>
                    </div>
                    
                    {selectedResource.securityIssues && selectedResource.securityIssues.length > 0 ? (
                        <div className="space-y-3">
                            {selectedResource.securityIssues.map((issue, idx) => (
                                <div key={idx} className="bg-white/80 p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-3">
                                    <div className="flex items-start gap-3">
                                        <AlertTriangle className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                                            selectedResource.riskLevel === 'Critical' ? 'text-red-500' : 'text-orange-500'
                                        }`} />
                                        <div>
                                            <p className="text-sm font-bold text-slate-800 leading-snug">{issue}</p>
                                            <p className="text-xs text-slate-500 mt-1">Detected via CIS Benchmark automated scan.</p>
                                        </div>
                                    </div>
                                    <div className="flex justify-end pt-2 border-t border-slate-100/50">
                                        <a href="#" className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold transition-colors">
                                            Remediate Issue <ArrowUpRight className="w-3 h-3" />
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex items-center gap-3 text-sm text-emerald-800 font-medium bg-white/60 p-4 rounded-xl border border-emerald-100/50">
                            <CheckCircle className="w-5 h-5 text-emerald-600" /> 
                            <div>
                                <p className="font-bold">No active security findings</p>
                                <p className="text-xs opacity-75 font-normal mt-0.5">Resource passed all compliance checks.</p>
                            </div>
                        </div>
                    )}
                    </div>
                </section>

                {/* Tags Section */}
                <section>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <span className="w-8 h-[1px] bg-slate-200"></span> Resource Tags
                    </h3>
                    <div className="flex flex-wrap gap-2">
                    {Object.entries(selectedResource.tags).map(([k, v]) => (
                        <div key={k} className="pl-3 pr-4 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-600 shadow-sm flex items-center gap-2 hover:border-indigo-200 transition-colors">
                            <span className="font-bold text-slate-400 uppercase text-[10px] tracking-wider">{k}</span>
                            <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                            <span className="font-bold text-slate-800">{v}</span>
                        </div>
                    ))}
                    {Object.keys(selectedResource.tags).length === 0 && (
                        <span className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-500 italic w-full text-center">No tags assigned.</span>
                    )}
                    </div>
                </section>

                {/* Metadata Section (JSON) */}
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <span className="w-8 h-[1px] bg-slate-200"></span> Raw Metadata
                        </h3>
                        <button 
                          onClick={() => {
                            const dataStr = JSON.stringify(selectedResource, null, 2);
                            const dataBlob = new Blob([dataStr], {type: 'application/json'});
                            const url = URL.createObjectURL(dataBlob);
                            const link = document.createElement('a');
                            link.href = url;
                            link.download = `${selectedResource.name}-metadata.json`;
                            link.click();
                            URL.revokeObjectURL(url);
                            showToast('Resource metadata exported', 'success');
                          }}
                          className="text-xs text-indigo-600 font-bold hover:text-indigo-800 flex items-center gap-1.5 px-2 py-1 bg-indigo-50 rounded hover:bg-indigo-100 transition-colors"
                        >
                            <Download className="w-3 h-3" /> Export JSON
                        </button>
                    </div>
                    <div className="bg-slate-900 rounded-xl p-4 overflow-x-auto shadow-inner border border-slate-800">
                        <pre className="text-xs text-indigo-300 font-mono leading-relaxed">
                        {JSON.stringify({ 
                            ...selectedResource, 
                            tags: selectedResource.tags,
                            metadata: selectedResource.metadata || {} 
                        }, null, 2)}
                        </pre>
                    </div>
                </section>
                </div>
                
                <div className="p-6 border-t border-slate-100 bg-slate-50/50">
                <button 
                    onClick={() => {/* Trigger AI Analysis for this specific resource */}}
                    className="w-full py-3.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2.5 hover:-translate-y-0.5"
                >
                    <MessageSquare className="w-5 h-5" /> Analyze with AI Advisor
                </button>
                </div>
            </div>
          </div>
        )}

        {/* Settings Modal */}
        <SettingsModal 
            isOpen={isSettingsOpen}
            onClose={() => setIsSettingsOpen(false)}
            autoSyncEnabled={autoSyncEnabled}
            onToggleAutoSync={setAutoSyncEnabled}
            syncInterval={syncInterval}
            onSetSyncInterval={setSyncInterval}
        />

        {/* Connect Modal */}
        {isConnectModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all scale-100 ring-1 ring-slate-900/5">
              <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div>
                    <h3 className="text-xl font-bold text-slate-900">Connect Cloud Account</h3>
                    <p className="text-slate-500 text-sm mt-1">Select a provider to import resources</p>
                </div>
                <button onClick={() => setIsConnectModalOpen(false)} className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-full transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-8 space-y-4">
                <button 
                  onClick={() => handleConnect("AWS")}
                  className="w-full flex items-center justify-between p-5 border-2 border-slate-100 rounded-2xl hover:border-orange-200 hover:bg-orange-50/50 transition-all group relative overflow-hidden"
                >
                  <div className="flex items-center gap-4 relative z-10">
                     <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-2xl border border-slate-100 group-hover:scale-110 transition-transform">🟠</div>
                     <div className="text-left">
                       <p className="font-bold text-slate-800 text-lg group-hover:text-orange-900">Amazon Web Services</p>
                       <p className="text-xs text-slate-500 font-medium">IAM Role or Access Key</p>
                     </div>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-orange-500 group-hover:text-white transition-all">
                      <Plus className="w-5 h-5" />
                  </div>
                </button>

                <button 
                  onClick={() => handleConnect("Azure")}
                  className="w-full flex items-center justify-between p-5 border-2 border-slate-100 rounded-2xl hover:border-blue-200 hover:bg-blue-50/50 transition-all group"
                >
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-2xl border border-slate-100 group-hover:scale-110 transition-transform">🔵</div>
                     <div className="text-left">
                       <p className="font-bold text-slate-800 text-lg group-hover:text-blue-900">Microsoft Azure</p>
                       <p className="text-xs text-slate-500 font-medium">Service Principal</p>
                     </div>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-blue-500 group-hover:text-white transition-all">
                      <Plus className="w-5 h-5" />
                  </div>
                </button>

                <button 
                  onClick={() => handleConnect("GCP")}
                  className="w-full flex items-center justify-between p-5 border-2 border-slate-100 rounded-2xl hover:border-green-200 hover:bg-green-50/50 transition-all group"
                >
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-2xl border border-slate-100 group-hover:scale-110 transition-transform">🟢</div>
                     <div className="text-left">
                       <p className="font-bold text-slate-800 text-lg group-hover:text-green-900">Google Cloud</p>
                       <p className="text-xs text-slate-500 font-medium">Service Account JSON</p>
                     </div>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-green-500 group-hover:text-white transition-all">
                      <Plus className="w-5 h-5" />
                  </div>
                </button>
              </div>
              <div className="p-6 bg-slate-50 text-center text-xs font-medium text-slate-500 border-t border-slate-100 flex items-center justify-center gap-2">
                <ShieldCheck className="w-4 h-4" />
                Read-only access required. No write permissions requested.
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </ErrorBoundary>
  );
};

export default App;
