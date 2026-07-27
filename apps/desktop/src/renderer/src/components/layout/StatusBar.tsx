import React from 'react';
import { NETWORK_CONSTANTS } from '@fluxshare/shared';

export interface StatusBarProps {
  readonly isTransferring?: boolean;
}

export function StatusBar({ isTransferring = false }: StatusBarProps): React.JSX.Element {
  return (
    <footer className="h-9 border-t border-flux-border px-6 flex items-center justify-between text-xs text-gray-400 bg-flux-surface/60 select-none shrink-0 font-mono">
      <div className="flex items-center gap-4">
        <span>Protocol: {NETWORK_CONSTANTS.PROTOCOL_VERSION}</span>
        <span>•</span>
        <span>ICE Transport: LAN P2P Direct</span>
      </div>

      <div className="flex items-center gap-2">
        <span
          className={`w-2 h-2 rounded-full ${
            isTransferring ? 'bg-amber-400 animate-ping' : 'bg-emerald-400'
          }`}
        />
        <span>{isTransferring ? 'Active DataChannel Streaming' : 'Ready to Transfer'}</span>
      </div>
    </footer>
  );
}
