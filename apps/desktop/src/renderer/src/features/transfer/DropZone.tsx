import React, { useState } from 'react';
import { FolderUp, FileText, X, Send } from 'lucide-react';
import { NETWORK_CONSTANTS, type Device, type FileMetadata } from '@fluxshare/shared';
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

  const addMockFile = () => {
    const mockFile: FileMetadata = {
      id: `file-${Date.now()}`,
      name: 'FluxShare_Architecture_Design_v2.pdf',
      size: 1024 * 1024 * 24.5, // 24.5 MB
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
    <section className="flex flex-col h-full">
      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
        Drop Files to Share
      </h3>

      {/* Recipient Badge */}
      <div className="mb-3 px-3 py-2 rounded-xl bg-flux-surface border border-flux-border flex items-center justify-between text-xs">
        <span className="text-gray-400">Target Recipient:</span>
        <span className="font-semibold text-flux-accent">
          {selectedDevice ? selectedDevice.name : 'None Selected'}
        </span>
      </div>

      {/* Drop Zone Box */}
      <div
        onClick={addMockFile}
        className="flex-1 rounded-2xl border-2 border-dashed border-flux-border hover:border-flux-accent/60 transition-all bg-flux-surface/30 flex flex-col items-center justify-center p-6 text-center cursor-pointer group"
      >
        <div className="w-14 h-14 rounded-2xl bg-flux-accent/10 border border-flux-accent/20 flex items-center justify-center text-flux-accent mb-3 group-hover:scale-110 transition-transform">
          <FolderUp className="w-7 h-7" />
        </div>

        <h4 className="font-semibold text-gray-100 text-base mb-1">
          Drag & Drop Files Here
        </h4>
        <p className="text-xs text-gray-400 max-w-xs mb-4">
          Click to stage a sample file. Direct transfer over LAN with zero server storage.
        </p>

        <Button variant="glow" size="sm" onClick={(e) => { e.stopPropagation(); addMockFile(); }}>
          Stage Sample File...
        </Button>

        <div className="mt-4 text-[10px] text-gray-500 font-mono">
          Max chunk size: {formatFileSize(NETWORK_CONSTANTS.DEFAULT_CHUNK_SIZE_BYTES)}
        </div>
      </div>

      {/* Staged Files Preview List */}
      {stagedFiles.length > 0 && (
        <div className="mt-4 flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-gray-400">Staged Files ({stagedFiles.length})</span>
            <button
              onClick={() => setStagedFiles([])}
              className="text-gray-500 hover:text-red-400 transition-colors"
            >
              Clear
            </button>
          </div>

          <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
            {stagedFiles.map((file) => (
              <div
                key={file.id}
                className="p-2.5 rounded-xl bg-flux-surface border border-flux-border flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2 truncate">
                  <FileText className="w-4 h-4 text-flux-accent shrink-0" />
                  <span className="truncate text-gray-200 font-medium">
                    {file.name}
                  </span>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-gray-400 font-mono">
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
            className="mt-2 w-full"
          >
            Send to {selectedDevice?.name ?? 'Recipient'}
          </Button>
        </div>
      )}
    </section>
  );
}
