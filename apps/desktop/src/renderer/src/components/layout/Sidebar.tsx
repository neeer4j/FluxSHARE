import React from 'react';
import { Wifi, History, Settings, Share2, ShieldCheck } from 'lucide-react';
import { Badge } from '@fluxshare/ui';

export type NavigationTab = 'nearby' | 'history' | 'settings';

export interface SidebarProps {
  readonly activeTab: NavigationTab;
  readonly onTabChange: (tab: NavigationTab) => void;
  readonly nearbyCount: number;
  readonly appVersion: string;
}

export function Sidebar({
  activeTab,
  onTabChange,
  nearbyCount,
  appVersion
}: SidebarProps): React.JSX.Element {
  const tabs: readonly { id: NavigationTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'nearby', label: 'Nearby Devices', icon: <Wifi className="w-4 h-4" />, badge: nearbyCount },
    { id: 'history', label: 'Recent Transfers', icon: <History className="w-4 h-4" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> }
  ];

  return (
    <aside className="w-64 glass-panel border-r border-flux-border flex flex-col justify-between p-4 select-none shrink-0">
      <div>
        {/* App Branding Header */}
        <div className="flex items-center gap-3 px-2 py-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-flux-accent to-blue-600 flex items-center justify-center shadow-glow">
            <Share2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight leading-none text-white">
              FluxShare
            </h1>
            <span className="text-xs text-gray-400 font-mono">
              v{appVersion} • LAN P2P
            </span>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="space-y-1">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-flux-accent/15 text-flux-accent border border-flux-accent/30 shadow-sm'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-flux-hover'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {typeof tab.badge === 'number' && (
                  <span className="ml-auto">
                    <Badge
                      label={String(tab.badge)}
                      className="!px-2 !py-0.5 !text-[10px]"
                    />
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Cryptographic Security Status Badge */}
      <div className="p-3.5 rounded-2xl bg-flux-surface/90 border border-flux-border flex items-center gap-3 shadow-glass">
        <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div className="text-xs">
          <div className="font-semibold text-gray-200">AES-256-GCM</div>
          <div className="text-gray-400">Zero Cloud Storage</div>
        </div>
      </div>
    </aside>
  );
}
