import React from 'react';
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
export declare function ProgressBar({ percentage, speedBytesPerSecond, etaSeconds, label, className }: ProgressBarProps): React.JSX.Element;
//# sourceMappingURL=ProgressBar.d.ts.map