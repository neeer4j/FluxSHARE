import React from 'react';
import { type HTMLMotionProps } from 'framer-motion';
export type ButtonVariant = 'glow' | 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';
export interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
    readonly variant?: ButtonVariant;
    readonly size?: ButtonSize;
    readonly isLoading?: boolean;
    readonly leftIcon?: React.ReactNode;
    readonly rightIcon?: React.ReactNode;
    readonly children?: React.ReactNode;
}
export declare function Button({ variant, size, isLoading, leftIcon, rightIcon, children, className, disabled, ...props }: ButtonProps): React.JSX.Element;
//# sourceMappingURL=Button.d.ts.map