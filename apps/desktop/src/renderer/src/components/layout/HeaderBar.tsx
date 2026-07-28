import React from 'react';
import { QrCode, Share2 } from 'lucide-react';
import { type DeviceOS } from '@fluxshare/shared';

export type OSFilter = DeviceOS | 'all';

export interface HeaderBarProps {
  readonly platform: string;
  readonly activeFilter: OSFilter;
  readonly onFilterChange: (filter: OSFilter) => void;
  readonly showFilter?: boolean;
  readonly onOpenConnectMobile?: () => void;
}

export function HeaderBar({
  activeFilter,
  onFilterChange,
  showFilter = true,
  onOpenConnectMobile
}: HeaderBarProps): React.JSX.Element {
  const filterOptions: readonly { id: OSFilter; label: string }[] = [
    { id: 'all', label: 'All Devices' },
    { id: 'macos', label: 'Mac' },
    { id: 'windows', label: 'Windows' },
    { id: 'linux', label: 'Linux' },
    { id: 'ios', label: 'iPhone/iPad' },
    { id: 'android', label: 'Android' }
  ];

  return (
    <header className="h-16 border-b border-flux-border px-6 flex items-center justify-between bg-flux-bg/80 backdrop-blur-md select-none shrink-0">
      {/* Left: Brand */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-flux-accent to-blue-600 flex items-center justify-center shadow-glow">
          <Share2 className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="font-bold text-base tracking-tight leading-tight text-white">
            FluxShare
          </h1>
          <p className="text-[11px] text-gray-400">
            Instant Wi-Fi File Sharing
          </p>
        </div>
      </div>

      {/* Center: Device Filter Pills */}
      {showFilter && (
        <div className="hidden md:flex items-center gap-1 p-1 rounded-xl bg-flux-surface border border-flux-border">
          {filterOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => onFilterChange(opt.id)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                activeFilter === opt.id
                  ? 'bg-flux-accent text-flux-bg font-semibold shadow-sm'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}

      {/* Right: Connect Mobile Button */}
      <div className="flex items-center gap-3">
        {onOpenConnectMobile && (
          <button
            onClick={onOpenConnectMobile}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-flux-accent to-indigo-500 text-flux-bg text-xs font-bold shadow-glow hover:opacity-95 transition-all active:scale-95"
          >
            <QrCode className="w-4 h-4" />
            <span>Connect Mobile</span>
          </button>
        )}
      </div>
    </header>
  );
}


