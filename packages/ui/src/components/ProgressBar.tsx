import React from 'react';
import { motion } from 'framer-motion';
import { formatPercentage, formatTransferSpeed, formatETA } from '@fluxshare/utils';

export interface ProgressBarProps {
  /**
   * Percentage completion from 0 to 100.
   */
  readonly percentage: number;
  /**
   * Current transfer speed in bytes per second.
   */
  readonly speedBytesPerSecond?: number;
  /**
   * Estimated seconds remaining until transfer completion.
   */
  readonly etaSeconds?: number;
  /**
   * Optional custom status label above the progress bar.
   */
  readonly label?: string;
  readonly className?: string;
}

export function ProgressBar({
  percentage,
  speedBytesPerSecond,
  etaSeconds,
  label,
  className = ''
}: ProgressBarProps): React.JSX.Element {
  const clamped = Math.min(100, Math.max(0, percentage));

  return (
    <div className={`w-full flex flex-col gap-2 select-none ${className}`}>
      {/* Readout Header */}
      <div className="flex items-center justify-between text-xs font-mono">
        <span className="text-gray-300 font-medium">
          {label ?? 'Transferring Data...'}
        </span>
        <div className="flex items-center gap-3 text-gray-400">
          {typeof speedBytesPerSecond === 'number' && (
            <span className="text-flux-accent">
              {formatTransferSpeed(speedBytesPerSecond)}
            </span>
          )}
          {typeof etaSeconds === 'number' && (
            <span>ETA: {formatETA(etaSeconds)}</span>
          )}
          <span className="text-gray-200 font-bold">
            {formatPercentage(clamped, 1)}
          </span>
        </div>
      </div>

      {/* Track & Animated Bar */}
      <div className="h-2.5 w-full bg-flux-card rounded-full overflow-hidden border border-flux-border p-0.5">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-blue-500 via-flux-accent to-cyan-300 shadow-glow"
          initial={{ width: 0 }}
          animate={{ width: `${clamped}%` }}
          transition={{ type: 'spring', stiffness: 120, damping: 20 }}
        />
      </div>
    </div>
  );
}
