import React from 'react';
import type { DeviceStatus, DeviceOS } from '@fluxshare/shared';
export type BadgeVariant = 'status' | 'os' | 'default';
export interface BadgeProps {
    readonly variant?: BadgeVariant;
    readonly status?: DeviceStatus;
    readonly os?: DeviceOS;
    readonly label?: string;
    readonly className?: string;
}
export declare function Badge({ variant, status, os, label, className }: BadgeProps): React.JSX.Element;
//# sourceMappingURL=Badge.d.ts.map