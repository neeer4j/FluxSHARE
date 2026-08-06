import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, X, Send } from 'lucide-react';
import type { Device } from '@fluxshare/shared';
import { formatFileSize } from '@fluxshare/utils';

export interface DropZoneProps {
  readonly devices?: readonly Device[];
  readonly selectedDevice: Device | null;
  readonly onSelectDevice?: (deviceId: string) => void;
  readonly onStartTransfer: (files: readonly File[]) => void;
  readonly onOpenConnectMobile?: () => void;
  readonly onAddDemoDevice?: () => void;
  readonly isMobile?: boolean;
}

export function DropZone({
  devices = [],
  selectedDevice,
  onSelectDevice,
  onStartTransfer,
  onOpenConnectMobile,
  onAddDemoDevice,
  isMobile = false
}: DropZoneProps): React.JSX.Element {
  const [stagedFiles, setStagedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newFiles: File[] = Array.from(files);
    setStagedFiles((prev) => [...prev, ...newFiles]);
  };

  const addSampleFile = () => {
    const blob = new Blob(['Sample content'], { type: 'application/pdf' });
    const file = new File([blob], `Sample_Document_${Date.now()}.pdf`, { type: 'application/pdf' });
    setStagedFiles((prev) => [...prev, file]);
  };

  const removeFile = (name: string) => {
    setStagedFiles((prev) => prev.filter((f) => f.name !== name));
  };

  const handleSendAction = () => {
    if (stagedFiles.length === 0) return;

    if (!selectedDevice) {
      if (devices.length > 0 && onSelectDevice && devices[0]) {
        onSelectDevice(devices[0].id);
        onStartTransfer(stagedFiles);
      } else if (onAddDemoDevice) {
        onAddDemoDevice();
      } else if (onOpenConnectMobile) {
        onOpenConnectMobile();
      }
      return;
    }

    onStartTransfer(stagedFiles);
  };

  return (
    <section className="w-full flex flex-col gap-4">
      {/* Hidden native file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        multiple
        className="hidden"
      />

      {/* Main Drop Area */}
      <div
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const files: FileMetadata[] = Array.from(e.dataTransfer.files).map((f, i) => ({
              id: `file-${Date.now()}-${i}`,
              name: f.name,
              size: f.size,
              mimeType: f.type || 'application/octet-stream',
              sha256: 'a3f89d02e8cb145a7b8e192f07328df82b71948e'
            }));
            setStagedFiles((prev) => [...prev, ...files]);
          }
        }}
        className="p-8 sm:p-10 rounded-3xl border-2 border-dashed border-flux-border hover:border-flux-accent bg-flux-surface/30 hover:bg-flux-surface/60 transition-all cursor-pointer flex flex-col items-center justify-center text-center group relative overflow-hidden"
      >
        <div className="w-14 h-14 rounded-2xl bg-flux-accent/10 border border-flux-accent/20 flex items-center justify-center text-flux-accent mb-4 group-hover:scale-110 transition-transform">
          <UploadCloud className="w-7 h-7" />
        </div>
        
        <h3 className="font-bold text-white text-base sm:text-lg mb-1">
          {isMobile ? 'Tap to choose photos or files to send' : 'Drop files here or click to choose'}
        </h3>
        
        <p className="text-xs text-gray-400 max-w-sm">
          {selectedDevice
            ? `Ready to send to ${selectedDevice.name}`
            : isMobile
            ? 'Select files to send to your host PC'
            : 'Select files to send to any nearby connected phone or computer'}
        </p>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            addSampleFile();
          }}
          className="mt-4 text-xs text-flux-accent hover:underline font-semibold"
        >
          + Add Sample File
        </button>
      </div>

      {/* Selected Files & Recipient Picker */}
      {stagedFiles.length > 0 && (
        <div className="p-4 rounded-2xl bg-flux-card/80 border border-flux-border flex flex-col gap-3">
          <div className="flex items-center justify-between text-xs font-semibold text-gray-300">
            <span>Selected Files ({stagedFiles.length})</span>
            <button
              onClick={() => setStagedFiles([])}
              className="text-gray-400 hover:text-red-400 transition-colors"
            >
              Clear all
            </button>
          </div>

          {/* Staged File Items */}
          <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
            {stagedFiles.map((file, idx) => (
              <div
                key={`${file.name}-${file.size}-${idx}`}
                className="p-3 rounded-xl bg-flux-surface border border-flux-border flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2.5 truncate">
                  <FileText className="w-4 h-4 text-flux-accent shrink-0" />
                  <span className="truncate text-gray-200 font-medium">
                    {file.name}
                  </span>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-gray-400">
                    {formatFileSize(file.size)}
                  </span>
                  <button
                    onClick={() => removeFile(file.name)}
                    className="text-gray-400 hover:text-red-400 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Recipient Device Selector dropdown if devices exist */}
          {devices.length > 0 && onSelectDevice && (
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-flux-surface border border-flux-border text-xs">
              <span className="text-gray-400 font-medium">Recipient Device:</span>
              <select
                value={selectedDevice?.id ?? ''}
                onChange={(e) => onSelectDevice(e.target.value)}
                className="bg-flux-card border border-flux-border rounded-lg px-2.5 py-1 text-xs font-semibold text-white focus:outline-none focus:border-flux-accent"
              >
                {devices.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.os.toUpperCase()})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Action Send Button */}
          <button
            onClick={handleSendAction}
            className="w-full py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-glow bg-flux-accent text-flux-bg hover:opacity-95 transition-all"
          >
            <Send className="w-4 h-4" />
            <span>
              {selectedDevice
                ? `Send Files to ${selectedDevice.name}`
                : devices.length > 0
                ? 'Send Files to Connected Device'
                : 'Connect Device to Send Files'}
            </span>
          </button>
        </div>
      )}
    </section>
  );
}



