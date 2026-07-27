import React from 'react';
import { type HTMLMotionProps } from 'framer-motion';
export interface GlassPanelProps extends HTMLMotionProps<'div'> {
    readonly hoverGlow?: boolean;
    readonly children: React.ReactNode;
}
export declare function GlassPanel({ hoverGlow, children, className, ...props }: GlassPanelProps): React.JSX.Element;
//# sourceMappingURL=GlassPanel.d.ts.map