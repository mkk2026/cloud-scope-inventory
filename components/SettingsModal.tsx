
import React from 'react';
import { X, Clock, RefreshCw } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  autoSyncEnabled: boolean;
  onToggleAutoSync: (enabled: boolean) => void;
  syncInterval: number;
  onSetSyncInterval: (minutes: number) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen, onClose, autoSyncEnabled, onToggleAutoSync, syncInterval, onSetSyncInterval
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100 ring-1 ring-slate-900/5">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-indigo-600" />
            Sync Settings
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors rounded-full hover:bg-slate-100 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-8">
            {/* Auto Sync Toggle */}
            <div className="flex items-center justify-between">
                <div>
                    <p className="font-semibold text-slate-800 text-base">Automatic Sync</p>
                    <p className="text-sm text-slate-500 mt-1">Refresh cloud resources in background</p>
                </div>
                <button 
                    onClick={() => onToggleAutoSync(!autoSyncEnabled)}
                    className={`relative w-14 h-8 rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${autoSyncEnabled ? 'bg-indigo-600' : 'bg-slate-200'}`}
                >
                    <span className={`inline-block w-6 h-6 transform transition-transform duration-200 ease-in-out bg-white rounded-full shadow-sm translate-x-1 mt-1 ${autoSyncEnabled ? 'translate-x-7' : 'translate-x-0'}`} />
                </button>
            </div>

            {/* Interval Selection */}
            <div className={`space-y-4 transition-all duration-300 ${autoSyncEnabled ? 'opacity-100 transform translate-y-0' : 'opacity-40 pointer-events-none transform translate-y-2'}`}>
                <label className="text-sm font-medium text-slate-700 flex items-center gap-2 uppercase tracking-wider">
                    <Clock className="w-4 h-4" />
                    Sync Frequency
                </label>
                <div className="grid grid-cols-3 gap-3">
                    {[15, 30, 60, 360, 1440].map((mins) => (
                        <button
                            key={mins}
                            onClick={() => onSetSyncInterval(mins)}
                            className={`px-4 py-3 text-sm border rounded-xl transition-all shadow-sm ${
                                syncInterval === mins 
                                ? 'bg-indigo-50 border-indigo-500 text-indigo-700 font-bold ring-1 ring-indigo-500' 
                                : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50 font-medium'
                            }`}
                        >
                            {mins < 60 ? `${mins}m` : `${mins / 60}h`}
                        </button>
                    ))}
                </div>
                <p className="text-xs text-slate-400 text-center pt-2">
                    Next sync will occur automatically based on this interval.
                </p>
            </div>
        </div>
        
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
            <button 
                onClick={onClose}
                className="px-6 py-2.5 bg-slate-900 text-white rounded-xl hover:bg-slate-800 font-medium transition-colors shadow-lg shadow-slate-200"
            >
                Done
            </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
