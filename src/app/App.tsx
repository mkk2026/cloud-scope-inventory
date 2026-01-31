import { useState } from 'react';
import { Cloud, LayoutDashboard, Database, Network, Shield, Bot, LogOut } from 'lucide-react';
import { Settings, Bell } from 'lucide-react';
import DashboardPage from '@/app/components/DashboardPage';
import ResourcesPage from '@/app/components/ResourcesPage';
import TopologyMapPage from '@/app/components/TopologyMapPage';
import CompliancePage from '@/app/components/CompliancePage';
import AIAdvisorPage from '@/app/components/AIAdvisorPage';

type Page = 'dashboard' | 'resources' | 'topology' | 'compliance' | 'ai-advisor';

interface NavItem {
  id: Page;
  label: string;
  icon: React.ReactNode;
}

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [currentRole, setCurrentRole] = useState('Sarah Connor (Admin)');

  const overviewNav: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'resources', label: 'Resources', icon: <Database className="w-5 h-5" /> },
    { id: 'topology', label: 'Topology Map', icon: <Network className="w-5 h-5" /> },
  ];

  const governanceNav: NavItem[] = [
    { id: 'compliance', label: 'Compliance', icon: <Shield className="w-5 h-5" /> },
    { id: 'ai-advisor', label: 'AI Advisor', icon: <Bot className="w-5 h-5" /> },
  ];

  const roles = [
    { name: 'Sarah Connor (Admin)', color: 'bg-red-500' },
    { name: 'John Doe (Editor)', color: 'bg-blue-500' },
    { name: 'Guest Observer (Viewer)', color: 'bg-green-500' },
  ];

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage />;
      case 'resources':
        return <ResourcesPage />;
      case 'topology':
        return <TopologyMapPage />;
      case 'compliance':
        return <CompliancePage />;
      case 'ai-advisor':
        return <AIAdvisorPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div className="flex h-screen bg-[#0a0f1a] text-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0d1220] border-r border-gray-800 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <Cloud className="w-8 h-8 text-cyan-400" />
            <div>
              <h1 className="text-xl font-semibold text-white">CloudScope</h1>
              <p className="text-xs text-gray-400">INVENTORY PRO</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          {/* Overview Section */}
          <div className="mb-6">
            <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3">Overview</h3>
            <div className="space-y-1">
              {overviewNav.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setCurrentPage(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                    currentPage === item.id
                      ? 'bg-indigo-600 text-white'
                      : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-200'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Governance Section */}
          <div className="mb-6">
            <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3">Governance</h3>
            <div className="space-y-1">
              {governanceNav.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setCurrentPage(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                    currentPage === item.id
                      ? 'bg-indigo-600 text-white'
                      : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-200'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Role Simulation */}
          <div className="mb-6">
            <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3">Role Simulation</h3>
            <div className="space-y-2">
              {roles.map((role) => (
                <button
                  key={role.name}
                  onClick={() => setCurrentRole(role.name)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                    currentRole === role.name
                      ? 'bg-gray-800/50 text-white'
                      : 'text-gray-400 hover:bg-gray-800/30'
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full ${role.color}`} />
                  <span className="text-sm">{role.name}</span>
                </button>
              ))}
            </div>
          </div>
        </nav>

        {/* Sign Out */}
        <div className="p-4 border-t border-gray-800">
          <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-400 hover:bg-gray-800/50 hover:text-gray-200 transition-colors">
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-[#0d1220] border-b border-gray-800 px-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold capitalize">{currentPage.replace('-', ' ')}</h2>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-gray-400">Synced: 7:50:48 AM</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-gray-800/50 rounded-lg transition-colors">
              <Settings className="w-5 h-5 text-gray-400" />
            </button>
            <button className="p-2 hover:bg-gray-800/50 rounded-lg transition-colors relative">
              <Bell className="w-5 h-5 text-gray-400" />
              <div className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors text-sm">
              + Connect Account
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-gray-800">
              <div className="text-right">
                <p className="text-sm font-medium">{currentRole.split('(')[0].trim()}</p>
                <p className="text-xs text-gray-400">{currentRole.match(/\((.*?)\)/)?.[1] || 'Admin'}</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center font-semibold">
                {currentRole[0]}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-6">
          {renderPage()}
        </div>
      </main>
    </div>
  );
}
