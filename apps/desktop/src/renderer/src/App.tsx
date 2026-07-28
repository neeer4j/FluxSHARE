import React, { useEffect, useState, useRef } from 'react';
import { NETWORK_CONSTANTS, type Device, type FileMetadata } from '@fluxshare/shared';
import { type NavigationTab } from './components/layout/Sidebar';
import { HeaderBar } from './components/layout/HeaderBar';
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
import { ConnectMobileModal } from './components/modals/ConnectMobileModal';

export function App(): React.JSX.Element {
  // Discovered Peers State (Starts empty, populates dynamically or via demo trigger)
  const [devices, setDevices] = useState<Device[]>([]);

  // Navigation State
  const [activeTab, setActiveTab] = useState<NavigationTab>('nearby');
  const [selectedPeerId, setSelectedPeerId] = useState<string | null>(null);
  const [localIp, setLocalIp] = useState<string>('192.168.1.6');
  const [isMobile, setIsMobile] = useState<boolean>(false);

  // Transfer History State
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);

  // Settings State
  const [deviceName, setDeviceName] = useState<string>('My FluxShare Desktop');
  const [port, setPort] = useState<number>(NETWORK_CONSTANTS.DEFAULT_SIGNALING_PORT);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConnectMobileOpen, setIsConnectMobileOpen] = useState(false);
  const [modalStep, setModalStep] = useState<TransferModalStep>('confirm');
  const [simulatedFile, setSimulatedFile] = useState<FileMetadata | null>(null);
  const [transferProgress, setTransferProgress] = useState(0);
  const [transferSpeed, setTransferSpeed] = useState(1024 * 1024 * 18.4); // 18.4 MB/s
  const [etaSeconds, setEtaSeconds] = useState(5);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Detect mobile device vs PC
    const checkMobile = () => {
      const mobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      setIsMobile(mobileUA || window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);

    async function fetchSystemInfo() {
      if (window.fluxshare) {
        try {
          const ip = await window.fluxshare.getLocalIp();
          if (ip) setLocalIp(ip);
        } catch (err) {
          console.warn('Failed to load system info from IPC:', err);
        }
      } else if (window.location.hostname && window.location.hostname !== 'localhost') {
        setLocalIp(window.location.hostname);
      }
    }
    fetchSystemInfo();

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleAddDemoDevice = () => {
    const demoDevices: Device[] = [
      {
        id: `peer-phone-${Date.now()}`,
        name: 'My Mobile Phone',
        os: 'ios',
        ip: localIp,
        port: 54321,
        status: 'online',
        lastSeen: Date.now()
      },
      {
        id: `peer-[laptop]-${Date.now()}`,
        name: 'Secondary Laptop',
        os: 'windows',
        ip: '192.168.1.120',
        port: 54321,
        status: 'online',
        lastSeen: Date.now()
      }
    ];

    setDevices((prev) => {
      if (prev.length === 0) {
        setSelectedPeerId(demoDevices[0]!.id);
        return demoDevices;
      }
      return prev;
    });
  };

  const selectedDevice =
    devices.find((p) => p.id === selectedPeerId) ?? devices[0] ?? null;

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
    <div className="flex flex-col h-screen w-screen bg-flux-bg text-gray-100 overflow-hidden font-sans select-none">
      {/* Floating Top Header */}
      <HeaderBar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenConnectMobile={() => setIsConnectMobileOpen(true)}
      />

      {/* Main Single Canvas Workspace */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        {activeTab === 'nearby' && (
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Hero File Drop Area */}
            <DropZone
              devices={devices}
              selectedDevice={selectedDevice}
              onSelectDevice={setSelectedPeerId}
              onStartTransfer={handleStartTransfer}
              onOpenConnectMobile={() => setIsConnectMobileOpen(true)}
              onAddDemoDevice={handleAddDemoDevice}
              isMobile={isMobile}
            />

            {/* Discovered / Connected Devices Grid */}
            <NearbyDevicesList
              devices={devices}
              selectedDeviceId={selectedPeerId}
              onSelectDevice={setSelectedPeerId}
              onOpenConnectMobile={() => setIsConnectMobileOpen(true)}
              onAddDemoDevice={handleAddDemoDevice}
              onSendFile={(dev) => {
                setSelectedPeerId(dev.id);
                const sampleFile: FileMetadata = {
                  id: `file-${Date.now()}`,
                  name: 'Photos_Archive.zip',
                  size: 1024 * 1024 * 18.5,
                  mimeType: 'application/zip',
                  sha256: 'a3f89d02e8cb145a7b8e192f07328df82b71948e'
                };
                handleStartTransfer([sampleFile]);
              }}
            />
          </div>
        )}

        {activeTab === 'history' && (
          <div className="max-w-4xl mx-auto">
            <TransferHistoryTable
              items={historyItems}
              onClearHistory={() => setHistoryItems([])}
            />
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="max-w-3xl mx-auto">
            <SettingsPanel
              initialDeviceName={deviceName}
              initialPort={port}
              downloadPath="C:\Users\neera\Downloads\FluxShare"
              onSaveSettings={handleSaveSettings}
            />
          </div>
        )}
      </main>

      {/* Mobile QR Code Modal */}
      <ConnectMobileModal
        isOpen={isConnectMobileOpen}
        onClose={() => setIsConnectMobileOpen(false)}
        localIp={localIp}
        port={port}
      />

      {/* File Transfer Progress Modal */}
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

