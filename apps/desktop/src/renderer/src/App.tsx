import React, { useEffect, useState, useRef } from 'react';
import { NETWORK_CONSTANTS, type Device, type FileMetadata } from '@fluxshare/shared';
import { normalizeDownloadPath } from '@fluxshare/utils';
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
import { SignalingClient, buildWsUrl } from './signaling/client';
import { WebRtcManager } from './signaling/webrtc';

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
  const [downloadPath, setDownloadPath] = useState<string>(() => normalizeDownloadPath('C:\\Users\\neera\\Downloads\\FluxShare'));

  // Load persisted settings from localStorage (quick, cross-platform persistence)
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem('fluxshare:settings');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.deviceName) setDeviceName(String(parsed.deviceName));
        if (parsed?.port) setPort(Number(parsed.port));
        if (parsed?.downloadPath) setDownloadPath(normalizeDownloadPath(String(parsed.downloadPath)));
      }
    } catch (e) {
      // ignore parse errors
    }
  }, []);
  const [deviceId] = useState<string>(() => (crypto && (crypto as any).randomUUID ? (crypto as any).randomUUID() : `dev-${Date.now()}`));

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConnectMobileOpen, setIsConnectMobileOpen] = useState(false);
  const [modalStep, setModalStep] = useState<TransferModalStep>('confirm');
  const [simulatedFile, setSimulatedFile] = useState<FileMetadata | null>(null);
  const [transferProgress, setTransferProgress] = useState(0);
  const [transferSpeed, setTransferSpeed] = useState(1024 * 1024 * 18.4); // 18.4 MB/s
  const [etaSeconds, setEtaSeconds] = useState(5);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const signalingRef = useRef<null | import('./signaling/client').SignalingClient>(null);
  const managersRef = useRef<Map<string, import('./signaling/webrtc').WebRtcManager>>(new Map());
  const transfersRef = useRef<Map<string, { file: File; sessionId: string; remoteId: string }>>(new Map());
  const resumePromisesRef = useRef<Map<string, (last: number) => void>>(new Map());

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

  // Setup signaling client
  useEffect(() => {
    // build device descriptor
    const localDevice: Device = {
      id: deviceId,
      name: deviceName,
      os: 'web',
      ip: localIp,
      port: port,
      status: 'online',
      lastSeen: Date.now()
    };

    const wsUrl = buildWsUrl(localIp || 'localhost', port);
    const client = new SignalingClient(wsUrl, localDevice);

    client.setHandlers({
      onPeersList: (peers) => {
        setDevices(peers);
      },
      onPeerAnnounce: (peer) => {
        setDevices((prev) => {
          const exists = prev.find((p) => p.id === peer.id);
          if (exists) {
            return prev.map((p) => (p.id === peer.id ? peer : p));
          }
          return [peer, ...prev];
        });
      },
      onPeerLeave: (peerId) => {
        setDevices((prev) => prev.filter((p) => p.id !== peerId));
      },
      onTransferOffer: (msg) => {
        // Open modal to confirm incoming transfer
        const file = msg.payload.files[0];
        if (!file) return;
        setSelectedPeerId(msg.senderId);
        setSimulatedFile(file);
        setModalStep('confirm');
        setIsModalOpen(true);
      }
      ,
      onWebRtcOffer: (msg) => {
        try {
          const sdp = msg.payload.sdp as string;
          const sender = msg.senderId;
          let mgr = managersRef.current.get(sender);
          if (!mgr) {
            mgr = new WebRtcManager(deviceId, sender, (m: any) => signalingRef.current?.send(m));
            managersRef.current.set(sender, mgr);
          }
          mgr.handleRemoteOffer(sdp);
        } catch (err) {
          console.warn('Failed to handle incoming WEBRTC_OFFER', err);
        }
      },
      onWebRtcAnswer: (msg) => {
        try {
          const sdp = msg.payload.sdp as string;
          const sender = msg.senderId;
          const mgr = managersRef.current.get(sender);
          if (mgr) mgr.handleRemoteAnswer(sdp);
        } catch (err) {
          console.warn('Failed to handle WEBRTC_ANSWER', err);
        }
      },
      onIceCandidate: (msg) => {
        try {
          const candidate = msg.payload.candidate as string;
          const sender = msg.senderId;
          const mgr = managersRef.current.get(sender);
          if (mgr) mgr.handleRemoteIce(candidate);
        } catch (err) {
          console.warn('Failed to handle ICE candidate', err);
        }
      }
      ,
      onTransferResumeRequest: (msg) => {
        try {
          const fileId = msg.payload.fileId as string;
          const requester = msg.senderId;
          const mgr = managersRef.current.get(requester);
          const last = mgr ? mgr.getLastContiguousChunk(fileId) : -1;
          const resp = {
            type: 'TRANSFER_RESUME_RESPONSE',
            senderId: deviceId,
            targetId: requester,
            timestamp: Date.now(),
            payload: { fileId, lastContiguousChunk: last }
          } as unknown as import('@fluxshare/protocol').SignalingMessage;
          signalingRef.current?.send(resp);
        } catch (err) {
          console.warn('Failed to handle TRANSFER_RESUME_REQUEST', err);
        }
      },
      onTransferResumeResponse: (msg) => {
        try {
          const fileId = msg.payload.fileId as string;
          const last = Number(msg.payload.lastContiguousChunk ?? -1);
          const resolver = resumePromisesRef.current.get(fileId);
          if (resolver) {
            resolver(last);
            resumePromisesRef.current.delete(fileId);
          }
        } catch (err) {
          console.warn('Failed to handle TRANSFER_RESUME_RESPONSE', err);
        }
      }
    });

    signalingRef.current = client;
    client.connect();

    return () => {
      client.disconnect();
      signalingRef.current = null;
    };
  }, [deviceId, deviceName, port, localIp]);

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
  const handleStartTransfer = async (files: readonly File[]) => {
    if (files.length === 0 || !selectedDevice) return;
    const fileToStage = files[0];
    if (!fileToStage) return;
    // send signaling TRANSFER_OFFER
    const sessionId = (crypto && (crypto as any).randomUUID) ? (crypto as any).randomUUID() : `sess-${Date.now()}`;
    const fileId = `file-${Date.now()}`;
    const fileMeta: import('@fluxshare/shared').FileMetadata = {
      id: fileId,
      name: fileToStage.name,
      size: fileToStage.size,
      mimeType: fileToStage.type || 'application/octet-stream',
      sha256: ''
    };

    const msg = {
      type: 'TRANSFER_OFFER',
      senderId: deviceId,
      targetId: selectedDevice.id,
      timestamp: Date.now(),
      payload: {
        sessionId,
        files: [fileMeta],
        totalBytes: fileToStage.size
      }
    } as unknown as import('@fluxshare/protocol').SignalingMessage;

    signalingRef.current?.send(msg);

    // store mapping for resume
    transfersRef.current.set(fileId, { file: fileToStage, sessionId, remoteId: selectedDevice.id });

    // locally show outbound modal
    setSimulatedFile({
      id: `filemeta-${Date.now()}`,
      name: fileToStage.name,
      size: fileToStage.size,
      mimeType: fileToStage.type,
      sha256: ''
    } as unknown as import('@fluxshare/shared').FileMetadata);
    setModalStep('confirm');
    setTransferProgress(0);
    setIsModalOpen(true);

    // create a WebRTC manager and start negotiation as initiator
    try {
      const mgr = new WebRtcManager(deviceId, selectedDevice.id, (m: any) => signalingRef.current?.send(m));
      managersRef.current.set(selectedDevice.id, mgr);
      await mgr.initiateNegotiation();
      await mgr.waitForOpen();

      // ask remote what they've already received for this file (resume)
      const resumeReq = {
        type: 'TRANSFER_RESUME_REQUEST',
        senderId: deviceId,
        targetId: selectedDevice.id,
        timestamp: Date.now(),
        payload: { fileId }
      } as unknown as import('@fluxshare/protocol').SignalingMessage;
      signalingRef.current?.send(resumeReq);

      const lastChunk = await new Promise<number>((resolve) => {
        const timeout = window.setTimeout(() => {
          resumePromisesRef.current.delete(fileId);
          resolve(-1);
        }, 3000);
        resumePromisesRef.current.set(fileId, (last) => {
          clearTimeout(timeout);
          resolve(last);
        });
      });

      const startChunk = Math.max(0, lastChunk + 1);
      await mgr.sendFile(fileToStage, startChunk, fileId);
    } catch (err) {
      console.warn('Failed to establish WebRTC transfer', err);
    }
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

        // Notify remote that transfer accepted/completed
        const acceptMsg = {
          type: 'TRANSFER_ACCEPT',
          senderId: deviceId,
          targetId: selectedDevice?.id ?? undefined,
          timestamp: Date.now(),
          payload: {
            sessionId: `sess-${Date.now()}`
          }
        } as unknown as import('@fluxshare/protocol').SignalingMessage;
        signalingRef.current?.send(acceptMsg);

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

  const handleSaveSettings = (newName: string, newPort: number, newDownloadPath: string) => {
    setDeviceName(newName);
    setPort(newPort);
    setDownloadPath(normalizeDownloadPath(newDownloadPath));
    try {
      const payload = { deviceName: newName, port: newPort, downloadPath: newDownloadPath };
      localStorage.setItem('fluxshare:settings', JSON.stringify(payload));
    } catch (e) {
      // best-effort only
      console.warn('Failed to persist settings to localStorage', e);
    }
  };

  const handleBrowseDownloadPath = async (): Promise<string | undefined> => {
    const selectedPath = await window.fluxshare?.selectDownloadDirectory?.();
    if (selectedPath) {
      const normalized = normalizeDownloadPath(selectedPath);
      setDownloadPath(normalized);
      return normalized;
    }
    return undefined;
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
                  const blob = new Blob(['sample content'], { type: 'application/zip' });
                  const sampleFile = new File([blob], `Photos_Archive_${Date.now()}.zip`, { type: 'application/zip' });
                  // eslint-disable-next-line @typescript-eslint/no-floating-promises
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
              downloadPath={downloadPath}
              onSaveSettings={handleSaveSettings}
              onBrowseDownloadPath={handleBrowseDownloadPath}
            />
          </div>
        )}
      </main>

      {/* Mobile QR Code Modal */}
      <ConnectMobileModal
        isOpen={isConnectMobileOpen}
        onClose={() => setIsConnectMobileOpen(false)}
        localIp={localIp}
        // In development Vite serves the mobile page; packaged builds use the signaling server.
        port={window.location.port === '3000' ? 3000 : port}
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

