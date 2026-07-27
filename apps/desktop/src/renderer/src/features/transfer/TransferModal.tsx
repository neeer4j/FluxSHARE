import React from 'react';
import { ShieldAlert, CheckCircle2 } from 'lucide-react';
import type { Device, FileMetadata } from '@fluxshare/shared';
import { formatFileSize } from '@fluxshare/utils';
import { Button, Modal, ProgressBar } from '@fluxshare/ui';

export type TransferModalStep = 'confirm' | 'transferring' | 'completed';

export interface TransferModalProps {
  readonly isOpen: boolean;
  readonly step: TransferModalStep;
  readonly sender: Device;
  readonly file: FileMetadata;
  readonly percentage: number;
  readonly speedBytesPerSec: number;
  readonly etaSeconds: number;
  readonly onAccept: () => void;
  readonly onReject: () => void;
  readonly onCancel: () => void;
  readonly onClose: () => void;
}

export function TransferModal({
  isOpen,
  step,
  sender,
  file,
  percentage,
  speedBytesPerSec,
  etaSeconds,
  onAccept,
  onReject,
  onCancel,
  onClose
}: TransferModalProps): React.JSX.Element {
  return (
    <Modal
      isOpen={isOpen}
      onClose={step === 'completed' ? onClose : onReject}
      title={
        step === 'confirm'
          ? 'Incoming LAN File Transfer'
          : step === 'transferring'
          ? 'Transferring via Direct P2P'
          : 'Transfer Successfully Completed'
      }
      footer={
        step === 'confirm' ? (
          <>
            <Button variant="secondary" onClick={onReject}>
              Reject
            </Button>
            <Button variant="glow" onClick={onAccept}>
              Accept Transfer
            </Button>
          </>
        ) : step === 'transferring' ? (
          <Button variant="danger" onClick={onCancel}>
            Cancel Transfer
          </Button>
        ) : (
          <Button variant="glow" onClick={onClose}>
            Done
          </Button>
        )
      }
    >
      <div className="space-y-4">
        {/* Sender Info Card */}
        <div className="p-3.5 rounded-2xl bg-flux-card border border-flux-border flex items-center justify-between text-xs">
          <div>
            <span className="text-gray-400">Sender: </span>
            <span className="font-semibold text-white">{sender.name}</span>
          </div>
          <span className="font-mono text-gray-400">
            {sender.ip} • <span className="uppercase">{sender.os}</span>
          </span>
        </div>

        {/* File Metadata Card */}
        <div className="p-4 rounded-2xl bg-flux-bg border border-flux-border flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-gray-100 truncate max-w-[220px]">
              {file.name}
            </span>
            <span className="text-xs font-mono text-flux-accent font-semibold">
              {formatFileSize(file.size)}
            </span>
          </div>

          <div className="flex items-center gap-2 text-[10px] text-gray-400 font-mono">
            <ShieldAlert className="w-3.5 h-3.5 text-emerald-400" />
            <span>SHA256: {file.sha256?.slice(0, 16)}...</span>
          </div>
        </div>

        {/* Progress or Completion state */}
        {step === 'transferring' && (
          <div className="pt-2">
            <ProgressBar
              percentage={percentage}
              speedBytesPerSecond={speedBytesPerSec}
              etaSeconds={etaSeconds}
              label={`Receiving "${file.name}"`}
            />
          </div>
        )}

        {step === 'completed' && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3 text-emerald-300 text-sm font-medium">
            <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
            <span>
              File received and saved locally via AES-256-GCM WebRTC DataChannel.
            </span>
          </div>
        )}
      </div>
    </Modal>
  );
}
