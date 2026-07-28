import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, X, Send } from 'lucide-react';
import type { Device, FileMetadata } from '@fluxshare/shared';
import { formatFileSize } from '@fluxshare/utils';
import { Button } from '@fluxshare/ui';

export interface DropZoneProps {
  readonly selectedDevice: Device | null;
  readonly onStartTransfer: (files: readonly FileMetadata[]) => void;
}

export function DropZone({
  selectedDevice,
  onStartTransfer
}: DropZoneProps): React.JSX.Element {
  const [stagedFiles, setStagedFiles] = useState<FileMetadata[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newFiles: FileMetadata[] = Array.from(files).map((f, i) => ({
      id: `file-${Date.now()}-${i}`,
      name: f.name,
      size: f.size,
      mimeType: f.type || 'application/octet-stream',
      sha256: 'a3f89d02e8cb145a7b8e192f07328df82b71948e'
    }));

    setStagedFiles((prev) => [...prev, ...newFiles]);
  };

  const addSampleFile = () => {
    const mockFile: FileMetadata = {
      id: `file-${Date.now()}`,
      name: 'Sample_Document.pdf',
      size: 1024 * 1024 * 14.2,
      mimeType: 'application/pdf',
      sha256: 'a3f89d02e8cb145a7b8e192f07328df82b71948e'
    };
    setStagedFiles((prev) => [...prev, mockFile]);
  };

  const removeFile = (id: string) => {
    setStagedFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleSend = () => {
    if (stagedFiles.length === 0 || !selectedDevice) return;
    onStartTransfer(stagedFiles);
  };

  return (
    <section className="flex flex-col gap-4">
      {/* Hidden native file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        multiple
        className="hidden"
      />

      {/* Drop Zone Box */}
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
        className="p-8 rounded-2xl border-2 border-dashed border-flux-border hover:border-flux-accent bg-flux-surface/40 hover:bg-flux-surface/80 transition-all cursor-pointer flex flex-col items-center justify-center text-center group"
      >
        <div className="w-12 h-12 rounded-2xl bg-flux-accent/10 border border-flux-accent/20 flex items-center justify-center text-flux-accent mb-3 group-hover:scale-110 transition-transform">
          <UploadCloud className="w-6 h-6" />
        </div>
        <h4 className="font-semibold text-white text-sm">
          Click or Drag Files Here to Send
        </h4>
        <p className="text-xs text-gray-400 mt-1 max-w-xs">
          {selectedDevice
            ? `Ready to send to ${selectedDevice.name}`
            : 'Select a device below or drop files to get started'}
        </p>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            addSampleFile();
          }}
          className="mt-3 text-[11px] text-flux-accent hover:underline font-medium"
        >
          + Add Sample File
        </button>
      </div>

      {/* Staged Files Preview */}
      {stagedFiles.length > 0 && (
        <div className="p-4 rounded-2xl bg-flux-card/70 border border-flux-border flex flex-col gap-3">
          <div className="flex items-center justify-between text-xs font-semibold text-gray-300">
            <span>Selected Files ({stagedFiles.length})</span>
            <button
              onClick={() => setStagedFiles([])}
              className="text-gray-400 hover:text-red-400 transition-colors"
            >
              Clear all
            </button>
          </div>

          <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
            {stagedFiles.map((file) => (
              <div
                key={file.id}
                className="p-2.5 rounded-xl bg-flux-surface border border-flux-border flex items-center justify-between text-xs"
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
                    onClick={() => removeFile(file.id)}
                    className="text-gray-400 hover:text-red-400 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <Button
            variant="glow"
            size="md"
            leftIcon={<Send className="w-4 h-4" />}
            onClick={handleSend}
            disabled={!selectedDevice}
            className="w-full mt-1"
          >
            {selectedDevice
              ? `Send to ${selectedDevice.name}`
              : 'Select Recipient Device Below'}
          </Button>
        </div>
      )}
    </section>
  );
}

