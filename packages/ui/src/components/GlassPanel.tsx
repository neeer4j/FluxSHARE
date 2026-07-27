import React from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';

export interface GlassPanelProps extends HTMLMotionProps<'div'> {
  readonly hoverGlow?: boolean;
  readonly children: React.ReactNode;
}

export function GlassPanel({
  hoverGlow = false,
  children,
  className = '',
  ...props
}: GlassPanelProps): React.JSX.Element {
  return (
    <motion.div
      className={`rounded-2xl bg-flux-surface/80 backdrop-blur-glass border border-flux-border transition-all ${
        hoverGlow
          ? 'hover:border-flux-accent/50 hover:shadow-glow cursor-pointer'
          : ''
      } ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
}
