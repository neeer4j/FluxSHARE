import { jsx as _jsx } from "react/jsx-runtime";
import { motion } from 'framer-motion';
export function GlassPanel({ hoverGlow = false, children, className = '', ...props }) {
    return (_jsx(motion.div, { className: `rounded-2xl bg-flux-surface/80 backdrop-blur-glass border border-flux-border transition-all ${hoverGlow
            ? 'hover:border-flux-accent/50 hover:shadow-glow cursor-pointer'
            : ''} ${className}`, ...props, children: children }));
}
//# sourceMappingURL=GlassPanel.js.map