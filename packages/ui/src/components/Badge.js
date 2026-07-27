import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const STATUS_COLOR_MAP = {
    online: {
        text: 'text-emerald-400',
        bg: 'bg-emerald-500/10 border-emerald-500/30',
        dot: 'bg-emerald-400 animate-pulse'
    },
    busy: {
        text: 'text-amber-400',
        bg: 'bg-amber-500/10 border-amber-500/30',
        dot: 'bg-amber-400'
    },
    offline: {
        text: 'text-gray-400',
        bg: 'bg-gray-500/10 border-gray-500/30',
        dot: 'bg-gray-400'
    }
};
const OS_LABEL_MAP = {
    macos: 'macOS',
    windows: 'Windows 11',
    linux: 'Linux'
};
export function Badge({ variant = 'default', status = 'online', os = 'macos', label, className = '' }) {
    if (variant === 'status') {
        const config = STATUS_COLOR_MAP[status];
        return (_jsxs("span", { className: `inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono border ${config.bg} ${config.text} ${className}`, children: [_jsx("span", { className: `w-2 h-2 rounded-full ${config.dot}` }), _jsx("span", { className: "capitalize", children: label ?? status })] }));
    }
    if (variant === 'os') {
        return (_jsx("span", { className: `inline-flex items-center px-2.5 py-1 rounded-md text-xs font-mono bg-flux-card text-gray-300 border border-flux-border uppercase tracking-wide ${className}`, children: label ?? OS_LABEL_MAP[os] }));
    }
    return (_jsx("span", { className: `inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-flux-accent/15 text-flux-accent border border-flux-accent/30 ${className}`, children: label ?? 'Default' }));
}
//# sourceMappingURL=Badge.js.map