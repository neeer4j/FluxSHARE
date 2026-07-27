import React, { useState } from 'react';
import { Search, CheckCircle2 } from 'lucide-react';
import type { Device } from '@fluxshare/shared';
import { DeviceCard } from './DeviceCard';
import type { OSFilter } from '../../components/layout/HeaderBar';

export interface NearbyDevicesListProps {
  readonly devices: readonly Device[];
  readonly selectedDeviceId: string | null;
  readonly onSelectDevice: (deviceId: string) => void;
  readonly activeOSFilter: OSFilter;
}

export function NearbyDevicesList({
  devices,
  selectedDeviceId,
  onSelectDevice,
  activeOSFilter
}: NearbyDevicesListProps): React.JSX.Element {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredDevices = devices.filter((device) => {
    const matchesOS =
      activeOSFilter === 'all' ? true : device.os === activeOSFilter;
    const matchesQuery =
      searchQuery.trim().length === 0 ||
      device.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      device.ip.includes(searchQuery);

    return matchesOS && matchesQuery;
  });

  return (
    <section className="flex flex-col gap-4">
      {/* List Header & Search */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Select Recipient Device
          </h3>
          <span className="text-xs text-emerald-400 flex items-center gap-1 mt-0.5 font-mono">
            <CheckCircle2 className="w-3.5 h-3.5" /> 100% Direct LAN WebRTC P2P
          </span>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Filter by name or IP..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-flux-surface border border-flux-border text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-flux-accent transition-colors"
          />
        </div>
      </div>

      {/* Grid of Discovered Devices */}
      {filteredDevices.length > 0 ? (
        <div className="grid grid-cols-1 gap-3">
          {filteredDevices.map((device) => (
            <DeviceCard
              key={device.id}
              device={device}
              isSelected={selectedDeviceId === device.id}
              onSelect={onSelectDevice}
            />
          ))}
        </div>
      ) : (
        <div className="p-8 rounded-2xl border border-dashed border-flux-border text-center text-gray-400 text-sm">
          No nearby devices matching filter. Ensure devices are on the same Wi-Fi.
        </div>
      )}
    </section>
  );
}
