import React, { useState } from 'react';
import { Search, QrCode, Plus, Smartphone } from 'lucide-react';
import type { Device } from '@fluxshare/shared';
import { DeviceCard } from './DeviceCard';
export interface NearbyDevicesListProps {
  readonly devices: readonly Device[];
  readonly selectedDeviceId: string | null;
  readonly onSelectDevice: (deviceId: string) => void;
  readonly onSendFile?: (device: Device) => void;
  readonly onOpenConnectMobile?: () => void;
  readonly onAddDemoDevice?: () => void;
}

export function NearbyDevicesList({
  devices,
  selectedDeviceId,
  onSelectDevice,
  onSendFile,
  onOpenConnectMobile,
  onAddDemoDevice
}: NearbyDevicesListProps): React.JSX.Element {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredDevices = devices.filter((device) => {
    return (
      searchQuery.trim().length === 0 ||
      device.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <section className="flex flex-col gap-6">
      {/* Header & Search */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <h3 className="text-sm font-semibold text-gray-200">
            Discovered Devices ({filteredDevices.length})
          </h3>
        </div>

        {devices.length > 0 && (
          <div className="relative w-full sm:w-60">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search device..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-flux-surface border border-flux-border text-xs text-gray-100 placeholder-gray-500 focus:outline-none focus:border-flux-accent transition-colors"
            />
          </div>
        )}
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
        <div className="p-10 rounded-3xl border border-dashed border-flux-border/80 bg-flux-surface/30 text-center flex flex-col items-center justify-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-flux-accent/10 border border-flux-accent/20 flex items-center justify-center text-flux-accent">
            <Smartphone className="w-7 h-7" />
          </div>

          <div className="max-w-md space-y-1">
            <h4 className="text-base font-semibold text-white">
              No devices connected yet
            </h4>
            <p className="text-xs text-gray-400">
              Scan the QR code with your iPhone or Android to connect instantly on Wi-Fi, or add a test device below.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {onOpenConnectMobile && (
              <button
                onClick={onOpenConnectMobile}
                className="px-4 py-2.5 rounded-xl bg-flux-accent text-flux-bg font-bold text-xs flex items-center gap-2 shadow-glow hover:opacity-95 transition-all"
              >
                <QrCode className="w-4 h-4" />
                <span>Connect Phone via QR Code</span>
              </button>
            )}

            {onAddDemoDevice && (
              <button
                onClick={onAddDemoDevice}
                className="px-4 py-2.5 rounded-xl bg-flux-surface border border-flux-border hover:bg-flux-hover text-gray-300 hover:text-white font-medium text-xs flex items-center gap-1.5 transition-all"
              >
                <Plus className="w-4 h-4 text-flux-accent" />
                <span>Add Test Device</span>
              </button>
            )}
          </div>
        </div>
      )}
    </section>
  );
}


