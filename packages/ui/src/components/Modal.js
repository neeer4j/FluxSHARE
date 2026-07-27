import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
export function Modal({ isOpen, onClose, title, children, footer, maxWidth = 'max-w-md' }) {
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);
    return (_jsx(AnimatePresence, { children: isOpen && (_jsxs("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4", children: [_jsx(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0.2 }, onClick: onClose, className: "absolute inset-0 bg-black/60 backdrop-blur-md" }), _jsxs(motion.div, { initial: { scale: 0.94, opacity: 0, y: 12 }, animate: { scale: 1, opacity: 1, y: 0 }, exit: { scale: 0.94, opacity: 0, y: 12 }, transition: { type: 'spring', stiffness: 350, damping: 25 }, className: `relative w-full ${maxWidth} rounded-3xl bg-flux-surface border border-flux-border shadow-glass overflow-hidden z-10 flex flex-col`, children: [title && (_jsxs("div", { className: "flex items-center justify-between px-6 py-4 border-b border-flux-border", children: [_jsx("h3", { className: "text-base font-semibold text-white tracking-tight", children: title }), _jsx("button", { onClick: onClose, className: "p-1 rounded-lg text-gray-400 hover:text-white hover:bg-flux-hover transition-colors", children: _jsx(X, { className: "w-5 h-5" }) })] })), _jsx("div", { className: "p-6", children: children }), footer && (_jsx("div", { className: "px-6 py-4 bg-flux-card/50 border-t border-flux-border flex items-center justify-end gap-3", children: footer }))] })] })) }));
}
//# sourceMappingURL=Modal.js.map