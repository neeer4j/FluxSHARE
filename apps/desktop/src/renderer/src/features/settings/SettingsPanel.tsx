import React, { useState } from 'react';
import { ShieldAlert, Save, FolderOpen, Network } from 'lucide-react';
import { Button, GlassPanel } from '@fluxshare/ui';

export interface SettingsPanelProps {
  readonly initialDeviceName: string;
  readonly initialPort: number;
  readonly downloadPath: string;
  readonly onSaveSettings: (name: string, port: number, downloadPath: string) => void;
  readonly onBrowseDownloadPath?: () => Promise<string | undefined>;
}

export function SettingsPanel({
  initialDeviceName,
  initialPort,
  downloadPath,
  onSaveSettings,
  onBrowseDownloadPath
}: SettingsPanelProps): React.JSX.Element {
  const [deviceName, setDeviceName] = useState(initialDeviceName);
  const [port, setPort] = useState(String(initialPort));
  const [selectedDownloadPath, setSelectedDownloadPath] = useState(downloadPath);
  const [isSaved, setIsSaved] = useState(false);

  React.useEffect(() => {
    setDeviceName(initialDeviceName);
  }, [initialDeviceName]);

  React.useEffect(() => {
    setPort(String(initialPort));
  }, [initialPort]);

  React.useEffect(() => {
    setSelectedDownloadPath(downloadPath);
  }, [downloadPath]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedPort = parseInt(port, 10);
    if (!isNaN(parsedPort)) {
      onSaveSettings(deviceName, parsedPort, selectedDownloadPath);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2500);
    }
  };

  const handleBrowse = async () => {
    if (!onBrowseDownloadPath) return;
    const chosenPath = await onBrowseDownloadPath();
    if (chosenPath) {
      setSelectedDownloadPath(chosenPath);
    }
  };

  return (
    <section className="max-w-2xl flex flex-col gap-6">
      <div>
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Application Settings
        </h3>
        <p className="text-xs text-gray-400 mt-0.5">
          Configure how your device appears on the LAN and where files are saved.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        {/* Device Name */}
        <GlassPanel className="p-5 space-y-3">
          <label className="block text-sm font-semibold text-gray-200">
            Device Display Name
          </label>
          <input
            type="text"
            value={deviceName}
            onChange={(e) => setDeviceName(e.target.value)}
            className="w-full px-4 py-2 rounded-xl bg-flux-bg border border-flux-border text-sm text-gray-100 focus:outline-none focus:border-flux-accent"
            placeholder="e.g. MacBook Pro (M3 Max)"
            required
          />
          <p className="text-xs text-gray-400">
            This name is broadcast via mDNS to nearby peers on your local network.
          </p>
        </GlassPanel>

        {/* Network Port & ICE */}
        <GlassPanel className="p-5 space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-200">
            <Network className="w-4 h-4 text-flux-accent" />
            <span>LAN Listen Port (mDNS / TCP)</span>
          </div>
          <input
            type="number"
            value={port}
            onChange={(e) => setPort(e.target.value)}
            min="1024"
            max="65535"
            className="w-full px-4 py-2 rounded-xl bg-flux-bg border border-flux-border text-sm text-gray-100 font-mono focus:outline-none focus:border-flux-accent"
            required
          />
          <p className="text-xs text-gray-400">
            Default is port 54321. Ensure your operating system firewall allows traffic on this port.
          </p>
        </GlassPanel>

        {/* Download Folder */}
        <GlassPanel className="p-5 space-y-3">
          <label className="block text-sm font-semibold text-gray-200">
            Default Download Folder
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={selectedDownloadPath}
              className="flex-1 px-4 py-2 rounded-xl bg-flux-bg border border-flux-border text-xs text-gray-300 font-mono"
            />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              leftIcon={<FolderOpen className="w-4 h-4" />}
              onClick={handleBrowse}
            >
              Browse...
            </Button>
          </div>
        </GlassPanel>

        {/* Security Overview Card */}
        <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-4">
          <ShieldAlert className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <h4 className="font-semibold text-emerald-300">
              Zero Cloud Storage Architecture
            </h4>
            <p className="text-emerald-200/80 leading-relaxed">
              Files transferred with FluxShare never touch third-party servers. All data is encrypted using AES-256-GCM via WebRTC DTLS/SRTP directly between your LAN devices.
            </p>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3 pt-2">
          {isSaved && (
            <span className="text-xs text-emerald-400 font-mono animate-fade-in">
              Settings Saved Successfully!
            </span>
          )}
          <Button
            type="submit"
            variant="glow"
            size="md"
            leftIcon={<Save className="w-4 h-4" />}
          >
            Save Preferences
          </Button>
        </div>
      </form>
    </section>
  );
}
