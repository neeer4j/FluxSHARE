import React from 'react';
import { Radio, History, Settings } from 'lucide-react';
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
  nearbyCount
}: SidebarProps): React.JSX.Element {
  const tabs: readonly { id: NavigationTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'nearby', label: 'Nearby Devices', icon: <Radio className="w-4 h-4" />, badge: nearbyCount },
    { id: 'history', label: 'Transfers', icon: <History className="w-4 h-4" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> }
  ];

  return (
    <aside className="w-60 bg-flux-card/40 border-r border-flux-border flex flex-col justify-between p-4 select-none shrink-0">
      <div>
        {/* Navigation Menu */}
        <nav className="space-y-1">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
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

      {/* Network Status indicator */}
      <div className="px-3 py-2 rounded-xl bg-flux-surface/60 border border-flux-border flex items-center gap-2 text-xs text-gray-400">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span>Wi-Fi Network Active</span>
      </div>
    </aside>
  );
}

