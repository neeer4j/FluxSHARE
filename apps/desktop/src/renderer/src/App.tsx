import React, { useEffect, useState } from 'react';
import {
  Wifi,
  Share2,
  History,
  Settings,
  ShieldCheck,
  Laptop,
  Monitor,
  FolderUp,
  Radio,
  CheckCircle2
} from 'lucide-react';
import { NETWORK_CONSTANTS, type Device } from '@fluxshare/shared';
import { formatFileSize } from '@fluxshare/utils';

const MOCK_PEERS: Device[] = [
  {
    id: 'peer-alpha-01',
    name: "MacBook Pro (M3 Max)",
    os: 'macos',
    ip: '192.168.1.142',
    port: 54321,
    status: 'online',
    lastSeen: Date.now()
  },
  {
    id: 'peer-beta-02',
    name: "Workstation PC (RTX 4090)",
    os: 'windows',
    ip: '192.168.1.108',
    port: 54321,
    status: 'online',
    lastSeen: Date.now() - 2000
  },
  {
    id: 'peer-gamma-03',
    name: "Ubuntu Dev Server",
    os: 'linux',
    ip: '192.168.1.199',
    port: 54321,
    status: 'busy',
    lastSeen: Date.now() - 10000
  }
];

export function App(): React.JSX.Element {
  const [activeTab, setActiveTab] = useState<'nearby' | 'history' | 'settings'>('nearby');
  const [selectedPeer, setSelectedPeer] = useState<string | null>('peer-alpha-01');
  const [appVersion, setAppVersion] = useState<string>(NETWORK_CONSTANTS.PROTOCOL_VERSION);
  const [platform, setPlatform] = useState<string>('unknown');

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
          console.warn('Failed to load version from IPC:', err);
        }
      }
    }
    fetchSystemInfo();
  }, []);

  return (
    <div className="flex h-screen w-screen bg-flux-bg text-gray-100 overflow-hidden font-sans">
      {/* Sidebar — Linear / Arc Minimalist Navigation */}
      <aside className="w-64 glass-panel border-r border-flux-border flex flex-col justify-between p-4">
        <div>
          {/* App Branding Header */}
          <div className="flex items-center gap-3 px-2 py-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-flux-accent to-blue-600 flex items-center justify-center shadow-glow">
              <Share2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg tracking-tight leading-none text-white">
                FluxShare
              </h1>
              <span className="text-xs text-gray-400 font-mono">
                v{appVersion} • LAN P2P
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab('nearby')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'nearby'
                  ? 'bg-flux-accent/15 text-flux-accent border border-flux-accent/30'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-flux-hover'
              }`}
            >
              <Wifi className="w-4 h-4" />
              <span>Nearby Devices</span>
              <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-flux-accent/20 text-flux-accent font-mono">
                {MOCK_PEERS.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'history'
                  ? 'bg-flux-accent/15 text-flux-accent border border-flux-accent/30'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-flux-hover'
              }`}
            >
              <History className="w-4 h-4" />
              <span>Recent Transfers</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'settings'
                  ? 'bg-flux-accent/15 text-flux-accent border border-flux-accent/30'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-flux-hover'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </button>
          </nav>
        </div>

        {/* Cryptographic Security Status Badge */}
        <div className="p-3 rounded-xl bg-flux-surface border border-flux-border flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div className="text-xs">
            <div className="font-semibold text-gray-200">AES-256-GCM</div>
            <div className="text-gray-400">Zero Cloud Storage</div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header Bar */}
        <header className="h-16 border-b border-flux-border px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Radio className="w-5 h-5 text-flux-accent animate-pulse" />
            <h2 className="text-base font-semibold text-gray-100">
              LAN Discovery Active ({NETWORK_CONSTANTS.MDNS_SERVICE_TYPE})
            </h2>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400 font-mono">
            <span>Platform:</span>
            <span className="uppercase text-gray-200">{platform}</span>
          </div>
        </header>

        {/* Center Workspace */}
        <div className="flex-1 p-8 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Nearby Peers List (7 cols) */}
          <section className="lg:col-span-7 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                Select Recipient Device
              </h3>
              <span className="text-xs text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> 100% Direct LAN P2P
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {MOCK_PEERS.map((peer) => {
                const isSelected = selectedPeer === peer.id;
                return (
                  <div
                    key={peer.id}
                    onClick={() => setSelectedPeer(peer.id)}
                    className={`group cursor-pointer p-4 rounded-xl border transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-flux-surface border-flux-accent shadow-glow'
                        : 'bg-flux-surface/50 border-flux-border hover:border-gray-600 hover:bg-flux-surface'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          isSelected
                            ? 'bg-flux-accent text-flux-bg font-bold'
                            : 'bg-flux-card text-gray-300 group-hover:text-white'
                        }`}
                      >
                        {peer.os === 'macos' ? (
                          <Laptop className="w-6 h-6" />
                        ) : (
                          <Monitor className="w-6 h-6" />
                        )}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-100 group-hover:text-white">
                          {peer.name}
                        </div>
                        <div className="text-xs text-gray-400 font-mono mt-0.5">
                          {peer.ip}:{peer.port} •{' '}
                          <span className="uppercase">{peer.os}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-block w-2.5 h-2.5 rounded-full ${
                          peer.status === 'online' ? 'bg-emerald-400' : 'bg-amber-400'
                        }`}
                      />
                      <span className="text-xs text-gray-400 capitalize">
                        {peer.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Drag & Drop File Transfer Zone (5 cols) */}
          <section className="lg:col-span-5 flex flex-col">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
              Drop Files to Share
            </h3>

            <div className="flex-1 rounded-2xl border-2 border-dashed border-flux-border hover:border-flux-accent/60 transition-all bg-flux-surface/30 flex flex-col items-center justify-center p-8 text-center cursor-pointer group">
              <div className="w-16 h-16 rounded-2xl bg-flux-accent/10 border border-flux-accent/20 flex items-center justify-center text-flux-accent mb-4 group-hover:scale-110 transition-transform">
                <FolderUp className="w-8 h-8" />
              </div>

              <h4 className="font-semibold text-gray-100 text-lg mb-1">
                Drag & Drop Files Here
              </h4>
              <p className="text-sm text-gray-400 max-w-xs mb-6">
                Or click to browse from your computer. Files transfer directly over LAN without cloud servers.
              </p>

              <button className="px-5 py-2.5 rounded-xl bg-flux-accent text-flux-bg font-semibold text-sm hover:bg-flux-accentHover transition-colors shadow-glow">
                Select Files...
              </button>

              <div className="mt-8 text-xs text-gray-500 font-mono">
                Max chunk size: {formatFileSize(NETWORK_CONSTANTS.DEFAULT_CHUNK_SIZE_BYTES)}
              </div>
            </div>
          </section>
        </div>

        {/* Footer Status Bar */}
        <footer className="h-9 border-t border-flux-border px-6 flex items-center justify-between text-xs text-gray-400 bg-flux-surface/60">
          <div className="flex items-center gap-4 font-mono">
            <span>Protocol: {NETWORK_CONSTANTS.PROTOCOL_VERSION}</span>
            <span>•</span>
            <span>ICE Transport: LAN P2P Ready</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Ready to Transfer</span>
          </div>
        </footer>
      </main>
    </div>
  );
}
export default App;
