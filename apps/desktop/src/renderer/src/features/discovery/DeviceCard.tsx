import React from 'react';
import type { Device } from '@fluxshare/shared';
import { Badge, DeviceAvatar, GlassPanel } from '@fluxshare/ui';

export interface DeviceCardProps {
  readonly device: Device;
  readonly isSelected: boolean;
  readonly onSelect: (deviceId: string) => void;
}

export function DeviceCard({
  device,
  isSelected,
  onSelect
}: DeviceCardProps): React.JSX.Element {
  return (
    <GlassPanel
      hoverGlow={!isSelected}
      onClick={() => onSelect(device.id)}
      className={`group p-4 transition-all flex items-center justify-between select-none ${
        isSelected
          ? 'border-flux-accent bg-flux-surface shadow-glow'
          : 'border-flux-border hover:bg-flux-surface/90'
      }`}
    >
      <div className="flex items-center gap-4">
        <DeviceAvatar os={device.os} isSelected={isSelected} />

        <div>
          <div className="font-semibold text-gray-100 group-hover:text-white flex items-center gap-2">
            <span>{device.name}</span>
          </div>
          <div className="text-xs text-gray-400 font-mono mt-0.5 flex items-center gap-2">
            <span>
              {device.ip}:{device.port}
            </span>
            <span>•</span>
            <span className="uppercase">{device.os}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Badge variant="status" status={device.status} />
      </div>
    </GlassPanel>
  );
}
