import React, { useEffect, useState, useRef } from 'react';
import { NETWORK_CONSTANTS, type Device, type FileMetadata } from '@fluxshare/shared';
import {
  Sidebar,
  type NavigationTab
} from './components/layout/Sidebar';
import {
  HeaderBar,
  type OSFilter
} from './components/layout/HeaderBar';
import { StatusBar } from './components/layout/StatusBar';
import { NearbyDevicesList } from './features/discovery/NearbyDevicesList';
import { DropZone } from './features/transfer/DropZone';
import {
  TransferModal,
  type TransferModalStep
} from './features/transfer/TransferModal';
import {
  TransferHistoryTable,
  type HistoryItem
} from './features/transfer/TransferHistoryTable';
import { SettingsPanel } from './features/settings/SettingsPanel';

const MOCK_PEERS: readonly Device[] = [
  {
    id: 'peer-alpha-01',
    name: 'MacBook Pro (M3 Max)',
    os: 'macos',
    ip: '192.168.1.142',
    port: 54321,
    status: 'online',
    lastSeen: Date.now()
  },
  {
    id: 'peer-beta-02',
    name: 'Workstation PC (RTX 4090)',
    os: 'windows',
    ip: '192.168.1.108',
    port: 54321,
    status: 'online',
    lastSeen: Date.now() - 2000
  },
  {
    id: 'peer-gamma-03',
    name: 'Ubuntu Dev Server',
    os: 'linux',
    ip: '192.168.1.199',
    port: 54321,
    status: 'busy',
    lastSeen: Date.now() - 10000
  }
];

const INITIAL_HISTORY: readonly HistoryItem[] = [
  {
    id: 'hist-01',
    filename: 'design-system-tokens-v1.zip',
    sizeBytes: 1024 * 1024 * 42,
    direction: 'received',
    peerName: 'MacBook Pro (M3 Max)',
    timestamp: Date.now() - 3600000,
    status: 'completed',
    sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
  }
];

export function App(): React.JSX.Element {
  // Navigation & Platform State
  const [activeTab, setActiveTab] = useState<NavigationTab>('nearby');
  const [osFilter, setOsFilter] = useState<OSFilter>('all');
  const [selectedPeerId, setSelectedPeerId] = useState<string | null>('peer-alpha-01');
  const [appVersion, setAppVersion] = useState<string>(NETWORK_CONSTANTS.PROTOCOL_VERSION);
  const [platform, setPlatform] = useState<string>('unknown');

  // Transfer History State
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([...INITIAL_HISTORY]);

  // Settings State
  const [deviceName, setDeviceName] = useState<string>('My FluxShare Desktop');
  const [port, setPort] = useState<number>(NETWORK_CONSTANTS.DEFAULT_SIGNALING_PORT);

  // Transfer Simulation Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalStep, setModalStep] = useState<TransferModalStep>('confirm');
  const [simulatedFile, setSimulatedFile] = useState<FileMetadata | null>(null);
  const [transferProgress, setTransferProgress] = useState(0);
  const [transferSpeed, setTransferSpeed] = useState(1024 * 1024 * 18.4); // 18.4 MB/s
  const [etaSeconds, setEtaSeconds] = useState(5);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    async function fetchSystemInfo() {
      if (window.fluxshare) {
        try {
          const [ver, plat] = await Promise.all([
            window.fluxshare.getAppVersion(),
            window.fluxshare.getPlatform()
          ]);
          setAppVersion(ver);
          setPlatform(plat);
        } catch (err) {
          console.warn('Failed to load system info from IPC:', err);
        }
      }
    }
    fetchSystemInfo();
  }, []);

  const selectedDevice =
    MOCK_PEERS.find((p) => p.id === selectedPeerId) ?? null;

  // Triggered when user stages files and clicks "Send to..."
  const handleStartTransfer = (files: readonly FileMetadata[]) => {
    if (files.length === 0 || !selectedDevice) return;
    const fileToStage = files[0];
    if (!fileToStage) return;
    setSimulatedFile(fileToStage);
    setModalStep('confirm');
    setTransferProgress(0);
    setIsModalOpen(true);
  };

  // User accepts the incoming file transfer simulation
  const handleAcceptTransfer = () => {
    setModalStep('transferring');
    let currentProgress = 0;
    const totalDurationMs = 4000;
    const intervalMs = 100;
    const increment = (intervalMs / totalDurationMs) * 100;

    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      currentProgress = Math.min(100, currentProgress + increment);
      setTransferProgress(currentProgress);
      const remainingSec = Math.max(
        0,
        Math.round(((100 - currentProgress) / 100) * 4)
      );
      setEtaSeconds(remainingSec);
      setTransferSpeed(1024 * 1024 * (16 + Math.random() * 6));

      if (currentProgress >= 100) {
        if (timerRef.current) clearInterval(timerRef.current);
        setModalStep('completed');

        // Append to history table
        if (simulatedFile && selectedDevice) {
          const newItem: HistoryItem = {
            id: `hist-${Date.now()}`,
            filename: simulatedFile.name,
            sizeBytes: simulatedFile.size,
            direction: 'sent',
            peerName: selectedDevice.name,
            timestamp: Date.now(),
            status: 'completed',
            sha256:
              simulatedFile.sha256 ??
              'a3f89d02e8cb145a7b8e192f07328df82b71948e'
          };
          setHistoryItems((prev) => [newItem, ...prev]);
        }
      }
    }, intervalMs);
  };

  const handleCancelTransfer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsModalOpen(false);
  };

  const handleCloseModal = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsModalOpen(false);
  };

  const handleSaveSettings = (newName: string, newPort: number) => {
    setDeviceName(newName);
    setPort(newPort);
  };

  return (
    <div className="flex h-screen w-screen bg-flux-bg text-gray-100 overflow-hidden font-sans">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        nearbyCount={MOCK_PEERS.length}
        appVersion={appVersion}
      />

      {/* Main Content Pane */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <HeaderBar
          platform={platform}
          activeFilter={osFilter}
          onFilterChange={setOsFilter}
          showFilter={activeTab === 'nearby'}
        />

        {/* Dynamic Center View */}
        <div className="flex-1 p-8 overflow-y-auto">
          {activeTab === 'nearby' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
              {/* Left Column: Discovered LAN Peers (7 cols) */}
              <div className="lg:col-span-7">
                <NearbyDevicesList
                  devices={MOCK_PEERS}
                  selectedDeviceId={selectedPeerId}
                  onSelectDevice={setSelectedPeerId}
                  activeOSFilter={osFilter}
                />
              </div>

              {/* Right Column: File DropZone (5 cols) */}
              <div className="lg:col-span-5 h-full">
                <DropZone
                  selectedDevice={selectedDevice}
                  onStartTransfer={handleStartTransfer}
                />
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <TransferHistoryTable
              items={historyItems}
              onClearHistory={() => setHistoryItems([])}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsPanel
              initialDeviceName={deviceName}
              initialPort={port}
              downloadPath="C:\Users\neera\Downloads\FluxShare"
              onSaveSettings={handleSaveSettings}
            />
          )}
        </div>

        {/* Footer Status Bar */}
        <StatusBar isTransferring={modalStep === 'transferring'} />
      </main>

      {/* Interactive Transfer Simulation Modal */}
      {simulatedFile && selectedDevice && (
        <TransferModal
          isOpen={isModalOpen}
          step={modalStep}
          sender={selectedDevice}
          file={simulatedFile}
          percentage={transferProgress}
          speedBytesPerSec={transferSpeed}
          etaSeconds={etaSeconds}
          onAccept={handleAcceptTransfer}
          onReject={handleCancelTransfer}
          onCancel={handleCancelTransfer}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}
export default App;
