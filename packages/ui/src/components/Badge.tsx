import React from 'react';
import type { DeviceStatus, DeviceOS } from '@fluxshare/shared';

export type BadgeVariant = 'status' | 'os' | 'default';

export interface BadgeProps {
  readonly variant?: BadgeVariant;
  readonly status?: DeviceStatus;
  readonly os?: DeviceOS;
  readonly label?: string;
  readonly className?: string;
}

const STATUS_COLOR_MAP: Record<DeviceStatus, { text: string; bg: string; dot: string }> = {
  online: {
    text: 'text-emerald-400',
    bg: 'bg-emerald-500/10 border-emerald-500/30',
    dot: 'bg-emerald-400 animate-pulse'
  },
  busy: {
    text: 'text-amber-400',
    bg: 'bg-amber-500/10 border-amber-500/30',
    dot: 'bg-amber-400'
  },
  offline: {
    text: 'text-gray-400',
    bg: 'bg-gray-500/10 border-gray-500/30',
    dot: 'bg-gray-400'
  }
};

const OS_LABEL_MAP: Record<DeviceOS, string> = {
  macos: 'macOS',
  windows: 'Windows 11',
  linux: 'Linux',
  ios: 'iOS',
  android: 'Android',
  web: 'Web'
};

export function Badge({
  variant = 'default',
  status = 'online',
  os = 'macos',
  label,
  className = ''
}: BadgeProps): React.JSX.Element {
  if (variant === 'status') {
    const config = STATUS_COLOR_MAP[status];
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono border ${config.bg} ${config.text} ${className}`}
      >
        <span className={`w-2 h-2 rounded-full ${config.dot}`} />
        <span className="capitalize">{label ?? status}</span>
      </span>
    );
  }

  if (variant === 'os') {
    return (
      <span
        className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-mono bg-flux-card text-gray-300 border border-flux-border uppercase tracking-wide ${className}`}
      >
        {label ?? OS_LABEL_MAP[os]}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-flux-accent/15 text-flux-accent border border-flux-accent/30 ${className}`}
    >
      {label ?? 'Default'}
    </span>
  );
}
