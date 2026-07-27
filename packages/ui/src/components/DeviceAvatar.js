import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Laptop, Monitor, Server, Apple } from 'lucide-react';
export function DeviceAvatar({ os, isSelected = false, className = '' }) {
    const getIcon = () => {
        switch (os) {
            case 'macos':
                return _jsx(Laptop, { className: "w-6 h-6" });
            case 'windows':
                return _jsx(Monitor, { className: "w-6 h-6" });
            case 'linux':
                return _jsx(Server, { className: "w-6 h-6" });
            default:
                return _jsx(Monitor, { className: "w-6 h-6" });
        }
    };
    return (_jsxs("div", { className: `relative w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${isSelected
            ? 'bg-flux-accent text-flux-bg shadow-glow font-bold'
            : 'bg-flux-card text-gray-300 border border-flux-border'} ${className}`, children: [getIcon(), os === 'macos' && (_jsx("div", { className: "absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-flux-surface border border-flux-border flex items-center justify-center text-gray-300", children: _jsx(Apple, { className: "w-3 h-3" }) }))] }));
}
//# sourceMappingURL=DeviceAvatar.js.map