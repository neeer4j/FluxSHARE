import React, { useState } from 'react';
import { Search, Radio } from 'lucide-react';
import type { Device } from '@fluxshare/shared';
import { DeviceCard } from './DeviceCard';
import type { OSFilter } from '../../components/layout/HeaderBar';

export interface NearbyDevicesListProps {
  readonly devices: readonly Device[];
  readonly selectedDeviceId: string | null;
  readonly onSelectDevice: (deviceId: string) => void;
  readonly onSendFile?: (device: Device) => void;
  readonly activeOSFilter: OSFilter;
}

export function NearbyDevicesList({
  devices,
  selectedDeviceId,
  onSelectDevice,
  onSendFile,
  activeOSFilter
}: NearbyDevicesListProps): React.JSX.Element {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredDevices = devices.filter((device) => {
    const matchesOS =
      activeOSFilter === 'all' ? true : device.os === activeOSFilter;
    const matchesQuery =
      searchQuery.trim().length === 0 ||
      device.name.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesOS && matchesQuery;
  });

  return (
    <section className="flex flex-col gap-6">
      {/* Header & Search */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <h3 className="text-sm font-semibold text-gray-200">
            Nearby Devices on your Wi-Fi ({filteredDevices.length})
          </h3>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-60">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search device name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-flux-surface border border-flux-border text-xs text-gray-100 placeholder-gray-500 focus:outline-none focus:border-flux-accent transition-colors"
          />
        </div>
      </div>

      {/* Grid of Discovered Devices */}
      {filteredDevices.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredDevices.map((device) => (
            <DeviceCard
              key={device.id}
              device={device}
              isSelected={selectedDeviceId === device.id}
              onSelect={onSelectDevice}
              onSendFile={onSendFile}
            />
          ))}
        </div>
      ) : (
        <div className="p-12 rounded-3xl border border-dashed border-flux-border bg-flux-surface/30 text-center flex flex-col items-center justify-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-flux-accent/10 border border-flux-accent/20 flex items-center justify-center text-flux-accent">
            <Radio className="w-6 h-6 animate-pulse" />
          </div>
          <h4 className="text-sm font-medium text-gray-200">
            Scanning for nearby devices...
          </h4>
          <p className="text-xs text-gray-400 max-w-sm">
            Ensure devices are connected to the same local Wi-Fi network and have FluxShare open.
          </p>
        </div>
      )}
    </section>
  );
}

