import React from 'react';
import { Send } from 'lucide-react';
import type { Device } from '@fluxshare/shared';
import { Badge, DeviceAvatar } from '@fluxshare/ui';

export interface DeviceCardProps {
  readonly device: Device;
  readonly isSelected: boolean;
  readonly onSelect: (deviceId: string) => void;
  readonly onSendFile?: (device: Device) => void;
}

export function DeviceCard({
  device,
  isSelected,
  onSelect,
  onSendFile
}: DeviceCardProps): React.JSX.Element {
  return (
    <div
      onClick={() => onSelect(device.id)}
      className={`group relative p-5 rounded-2xl border transition-all duration-200 cursor-pointer select-none flex flex-col justify-between ${
        isSelected
          ? 'bg-flux-surface border-flux-accent shadow-glow'
          : 'bg-flux-card/60 border-flux-border hover:bg-flux-surface hover:border-gray-600'
      }`}
    >
      {/* Top row: Avatar & Status */}
      <div className="flex items-center justify-between mb-4">
        <DeviceAvatar os={device.os} isSelected={isSelected} />
        <Badge variant="status" status={device.status} />
      </div>

      {/* Device Info */}
      <div className="mb-4">
        <h4 className="font-semibold text-white text-base group-hover:text-flux-accent transition-colors truncate">
          {device.name}
        </h4>
        <p className="text-xs text-gray-400 capitalize mt-0.5">
          {device.os === 'macos'
            ? 'Mac'
            : device.os === 'windows'
            ? 'Windows PC'
            : device.os === 'ios'
            ? 'iPhone / iPad'
            : device.os === 'android'
            ? 'Android Device'
            : device.os}
        </p>
      </div>

      {/* Action Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onSelect(device.id);
          if (onSendFile) onSendFile(device);
        }}
        className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
          isSelected
            ? 'bg-flux-accent text-flux-bg shadow-sm hover:opacity-95'
            : 'bg-flux-surface border border-flux-border text-gray-200 group-hover:border-flux-accent/50 group-hover:text-white'
        }`}
      >
        <Send className="w-3.5 h-3.5" />
        <span>Send File</span>
      </button>
    </div>
  );
}

