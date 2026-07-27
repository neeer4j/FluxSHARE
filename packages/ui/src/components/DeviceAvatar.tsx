import React from 'react';
import { Laptop, Monitor, Server, Apple } from 'lucide-react';
import type { DeviceOS } from '@fluxshare/shared';

export interface DeviceAvatarProps {
  readonly os: DeviceOS;
  readonly isSelected?: boolean;
  readonly className?: string;
}

export function DeviceAvatar({
  os,
  isSelected = false,
  className = ''
}: DeviceAvatarProps): React.JSX.Element {
  const getIcon = () => {
    switch (os) {
      case 'macos':
        return <Laptop className="w-6 h-6" />;
      case 'windows':
        return <Monitor className="w-6 h-6" />;
      case 'linux':
        return <Server className="w-6 h-6" />;
      default:
        return <Monitor className="w-6 h-6" />;
    }
  };

  return (
    <div
      className={`relative w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
        isSelected
          ? 'bg-flux-accent text-flux-bg shadow-glow font-bold'
          : 'bg-flux-card text-gray-300 border border-flux-border'
      } ${className}`}
    >
      {getIcon()}

      {/* Mini OS watermark badge */}
      {os === 'macos' && (
        <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-flux-surface border border-flux-border flex items-center justify-center text-gray-300">
          <Apple className="w-3 h-3" />
        </div>
      )}
    </div>
  );
}
