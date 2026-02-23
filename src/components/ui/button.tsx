import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
        return (
            <button
                ref={ref}
                className={cn(
                    "inline-flex items-center justify-center rounded-full font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 disabled:pointer-events-none disabled:opacity-50",
                    {
                        'bg-neutral-900 text-neutral-50 hover:bg-neutral-900/90': variant === 'primary',
                        'bg-neutral-100 text-neutral-900 hover:bg-neutral-100/80': variant === 'secondary',
                        'border border-neutral-200 bg-white hover:bg-neutral-100 hover:text-neutral-900': variant === 'outline',
                        'hover:bg-neutral-100 hover:text-neutral-900': variant === 'ghost',
                        'h-9 px-4 text-sm': size === 'sm',
                        'h-10 px-6 py-2': size === 'md',
                        'h-11 px-8': size === 'lg',
                    },
                    className
                )}
                {...props}
            />
        );
    }
);

Button.displayName = "Button";
