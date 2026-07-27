import React from 'react';
import { ShieldCheck, FileText, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { formatFileSize } from '@fluxshare/utils';
import { Badge } from '@fluxshare/ui';

export interface HistoryItem {
  readonly id: string;
  readonly filename: string;
  readonly sizeBytes: number;
  readonly direction: 'sent' | 'received';
  readonly peerName: string;
  readonly timestamp: number;
  readonly status: 'completed' | 'failed' | 'cancelled';
  readonly sha256: string;
}

export interface TransferHistoryTableProps {
  readonly items: readonly HistoryItem[];
  readonly onClearHistory: () => void;
}

export function TransferHistoryTable({
  items,
  onClearHistory
}: TransferHistoryTableProps): React.JSX.Element {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Recent LAN Transfers
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            All files transferred directly over peer-to-peer WebRTC DataChannels.
          </p>
        </div>
        {items.length > 0 && (
          <button
            onClick={onClearHistory}
            className="text-xs text-gray-400 hover:text-red-400 transition-colors"
          >
            Clear History
          </button>
        )}
      </div>

      {items.length > 0 ? (
        <div className="rounded-2xl border border-flux-border bg-flux-surface/60 overflow-hidden">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-flux-border bg-flux-card/50 text-gray-400 font-mono">
                <th className="py-3 px-4">Direction</th>
                <th className="py-3 px-4">File Name</th>
                <th className="py-3 px-4">Size</th>
                <th className="py-3 px-4">Peer Device</th>
                <th className="py-3 px-4">SHA-256 Integrity</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-flux-border">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-flux-hover/50 transition-colors">
                  <td className="py-3 px-4">
                    {item.direction === 'sent' ? (
                      <span className="inline-flex items-center gap-1.5 text-blue-400 font-medium">
                        <ArrowUpRight className="w-4 h-4" /> Sent
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-emerald-400 font-medium">
                        <ArrowDownLeft className="w-4 h-4" /> Received
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 font-medium text-gray-100">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-flux-accent shrink-0" />
                      <span className="truncate max-w-[180px]">{item.filename}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono text-gray-300">
                    {formatFileSize(item.sizeBytes)}
                  </td>
                  <td className="py-3 px-4 text-gray-300">{item.peerName}</td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono text-[10px]">
                      <ShieldCheck className="w-3 h-3" />
                      {item.sha256.slice(0, 8)}...
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Badge
                      label={item.status.toUpperCase()}
                      className={
                        item.status === 'completed'
                          ? '!bg-emerald-500/10 !text-emerald-400 !border-emerald-500/30'
                          : '!bg-red-500/10 !text-red-400 !border-red-500/30'
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="p-12 rounded-2xl border border-dashed border-flux-border text-center text-gray-400 text-sm">
          No transfers recorded yet. Select a nearby device and drop files to start.
        </div>
      )}
    </section>
  );
}
