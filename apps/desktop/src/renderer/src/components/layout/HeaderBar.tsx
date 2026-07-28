import React from 'react';
import { QrCode, Share2, Radio, History, Settings } from 'lucide-react';
import type { NavigationTab } from './Sidebar';

export interface HeaderBarProps {
  readonly activeTab: NavigationTab;
  readonly onTabChange: (tab: NavigationTab) => void;
  readonly onOpenConnectMobile?: () => void;
}

export function HeaderBar({
  activeTab,
  onTabChange,
  onOpenConnectMobile
}: HeaderBarProps): React.JSX.Element {
  const tabs: readonly { id: NavigationTab; label: string; icon: React.ReactNode }[] = [
    { id: 'nearby', label: 'Share', icon: <Radio className="w-3.5 h-3.5" /> },
    { id: 'history', label: 'Transfers', icon: <History className="w-3.5 h-3.5" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-3.5 h-3.5" /> }
  ];

  return (
    <header className="h-16 px-4 sm:px-8 flex items-center justify-between border-b border-flux-border/60 bg-flux-bg/90 backdrop-blur-xl select-none shrink-0 z-30">
      {/* Brand Logo */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-flux-accent to-blue-600 flex items-center justify-center shadow-glow">
          <Share2 className="w-4 h-4 text-white" />
        </div>
        <span className="font-bold text-base tracking-tight text-white">
          Flux<span className="text-flux-accent">Share</span>
        </span>
      </div>

      {/* Floating Center Tabs */}
      <nav className="flex items-center gap-1 p-1 rounded-full bg-flux-surface/80 border border-flux-border/80 shadow-glass">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-flux-accent text-flux-bg shadow-sm'
                  : 'text-gray-400 hover:text-white hover:bg-flux-hover/50'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Right Action: QR Mobile Button */}
      {onOpenConnectMobile && (
        <button
          onClick={onOpenConnectMobile}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-flux-surface hover:bg-flux-hover text-gray-200 hover:text-white text-xs font-semibold border border-flux-border transition-all active:scale-95 shadow-sm"
        >
          <QrCode className="w-3.5 h-3.5 text-flux-accent" />
          <span className="hidden sm:inline">Connect Phone</span>
        </button>
      )}
    </header>
  );
}



