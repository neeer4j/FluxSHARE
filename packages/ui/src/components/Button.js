import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
const VARIANT_CLASSES = {
    glow: 'bg-flux-accent text-flux-bg font-semibold shadow-glow hover:bg-flux-accentHover focus:ring-2 focus:ring-flux-accent/50',
    primary: 'bg-blue-600 text-white font-medium hover:bg-blue-500 shadow-sm focus:ring-2 focus:ring-blue-500/50',
    secondary: 'bg-flux-surface text-gray-200 font-medium border border-flux-border hover:bg-flux-card hover:border-gray-500 focus:ring-2 focus:ring-gray-500/30',
    ghost: 'bg-transparent text-gray-400 font-medium hover:bg-flux-hover hover:text-gray-100',
    danger: 'bg-red-500/10 text-red-400 font-medium border border-red-500/20 hover:bg-red-500/20 hover:text-red-300 focus:ring-2 focus:ring-red-500/40'
};
const SIZE_CLASSES = {
    sm: 'px-3 py-1.5 text-xs rounded-lg gap-1.5',
    md: 'px-4 py-2 text-sm rounded-xl gap-2',
    lg: 'px-6 py-3 text-base rounded-2xl gap-2.5'
};
export function Button({ variant = 'secondary', size = 'md', isLoading = false, leftIcon, rightIcon, children, className = '', disabled, ...props }) {
    const isDisabled = disabled || isLoading;
    return (_jsxs(motion.button, { whileHover: !isDisabled ? { scale: 1.02 } : undefined, whileTap: !isDisabled ? { scale: 0.98 } : undefined, transition: { type: 'spring', stiffness: 400, damping: 25 }, className: `inline-flex items-center justify-center transition-colors select-none focus:outline-none ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${className}`, disabled: isDisabled, ...props, children: [isLoading ? (_jsx(Loader2, { className: "w-4 h-4 animate-spin shrink-0" })) : (leftIcon && _jsx("span", { className: "shrink-0", children: leftIcon })), _jsx("span", { children: children }), !isLoading && rightIcon && _jsx("span", { className: "shrink-0", children: rightIcon })] }));
}
//# sourceMappingURL=Button.js.map