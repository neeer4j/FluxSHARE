import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, Check, Wifi, QrCode } from 'lucide-react';
import { Modal, Button } from '@fluxshare/ui';

export interface ConnectMobileModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly localIp: string;
  readonly port: number;
}

export function ConnectMobileModal({
  isOpen,
  onClose,
  localIp,
  port
}: ConnectMobileModalProps): React.JSX.Element {
  const [copied, setCopied] = useState(false);
  const connectUrl = `http://${localIp}:${port}`;

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(connectUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Connect Mobile Device (Zero-Install)"
      maxWidth="max-w-lg"
      footer={
        <Button variant="secondary" onClick={onClose}>
          Done
        </Button>
      }
    >
      <div className="flex flex-col items-center text-center space-y-6">
        {/* Subtitle / Header badge */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-flux-accent/10 border border-flux-accent/20 text-flux-accent text-xs font-semibold">
          <Wifi className="w-3.5 h-3.5" />
          <span>LAN Wi-Fi Direct Connection</span>
        </div>

        {/* QR Code Container */}
        <div className="p-4 bg-white rounded-2xl shadow-glow border-4 border-flux-border/50 transition-transform hover:scale-105 duration-300">
          <QRCodeSVG
            value={connectUrl}
            size={200}
            level="M"
            bgColor="#FFFFFF"
            fgColor="#0B0D11"
          />
        </div>

        {/* URL copy banner */}
        <div className="w-full bg-flux-card border border-flux-border rounded-2xl p-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <QrCode className="w-4 h-4 text-gray-400 shrink-0" />
            <span className="font-mono text-sm text-gray-200 truncate">
              {connectUrl}
            </span>
          </div>
          <button
            onClick={handleCopyUrl}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-flux-surface hover:bg-flux-hover text-xs font-medium text-gray-200 border border-flux-border transition-colors shrink-0"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-gray-400" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>

        {/* Step-by-Step Instructions */}
        <div className="w-full text-left space-y-3 pt-2 border-t border-flux-border/60">
          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            How to pair your iPhone or Android
          </h4>
          <div className="space-y-2.5 text-xs text-gray-300">
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-flux-accent/15 text-flux-accent flex items-center justify-center font-bold shrink-0 mt-0.5">
                1
              </div>
              <p>
                Ensure your iPhone or Android device is connected to the same{' '}
                <strong className="text-white">Wi-Fi network</strong> as this PC.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-flux-accent/15 text-flux-accent flex items-center justify-center font-bold shrink-0 mt-0.5">
                2
              </div>
              <p>
                Open your camera app or QR scanner and scan the QR code above.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-flux-accent/15 text-flux-accent flex items-center justify-center font-bold shrink-0 mt-0.5">
                3
              </div>
              <p>
                The FluxSHARE mobile web app will open instantly and your device will
                appear in the peers list ready for high-speed transfers.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
