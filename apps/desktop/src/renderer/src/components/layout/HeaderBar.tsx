import React from 'react';
import { Radio, QrCode } from 'lucide-react';
import { NETWORK_CONSTANTS, type DeviceOS } from '@fluxshare/shared';
import { Badge } from '@fluxshare/ui';

export type OSFilter = DeviceOS | 'all';

export interface HeaderBarProps {
  readonly platform: string;
  readonly activeFilter: OSFilter;
  readonly onFilterChange: (filter: OSFilter) => void;
  readonly showFilter?: boolean;
  readonly onOpenConnectMobile?: () => void;
}

export function HeaderBar({
  platform,
  activeFilter,
  onFilterChange,
  showFilter = true,
  onOpenConnectMobile
}: HeaderBarProps): React.JSX.Element {
  const filterOptions: readonly { id: OSFilter; label: string }[] = [
    { id: 'all', label: 'All Devices' },
    { id: 'macos', label: 'macOS' },
    { id: 'windows', label: 'Windows 11' },
    { id: 'linux', label: 'Linux' },
    { id: 'ios', label: 'iOS' },
    { id: 'android', label: 'Android' }
  ];

  return (
    <header className="h-16 border-b border-flux-border px-8 flex items-center justify-between bg-flux-bg/60 backdrop-blur-md select-none shrink-0">
      {/* Left: Discovery Badge */}
      <div className="flex items-center gap-3">
        <Radio className="w-5 h-5 text-flux-accent animate-pulse" />
        <div>
          <h2 className="text-sm font-semibold text-gray-100 leading-tight">
            LAN Discovery Active
          </h2>
          <p className="text-xs text-gray-400 font-mono">
            {NETWORK_CONSTANTS.MDNS_SERVICE_TYPE}
          </p>
        </div>
      </div>

      {/* Center: OS Platform Filter Pills (if active) */}
      {showFilter && (
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-flux-surface border border-flux-border">
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

      {/* Right: Connect Mobile QR Button & Platform indicator */}
      <div className="flex items-center gap-4">
        {onOpenConnectMobile && (
          <button
            onClick={onOpenConnectMobile}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-flux-accent to-indigo-500 text-flux-bg text-xs font-bold shadow-glow hover:opacity-95 transition-all active:scale-95"
          >
            <QrCode className="w-4 h-4" />
            <span>Connect Mobile</span>
          </button>
        )}

        <div className="flex items-center gap-2 text-xs text-gray-400 font-mono">
          <span>Host Platform:</span>
          <Badge label={platform.toUpperCase()} className="!py-0.5" />
        </div>
      </div>
    </header>
  );
}

