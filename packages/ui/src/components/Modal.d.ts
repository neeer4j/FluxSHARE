import React from 'react';
export interface ModalProps {
    readonly isOpen: boolean;
    readonly onClose: () => void;
    readonly title?: string;
    readonly children: React.ReactNode;
    readonly footer?: React.ReactNode;
    readonly maxWidth?: string;
}
export declare function Modal({ isOpen, onClose, title, children, footer, maxWidth }: ModalProps): React.JSX.Element;
//# sourceMappingURL=Modal.d.ts.map