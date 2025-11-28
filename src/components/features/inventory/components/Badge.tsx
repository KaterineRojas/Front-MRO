import React from 'react';

const BASE_STYLES = "inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 gap-1 transition-colors";

const VARIANTS = {
    // Variantes Básicas
    default: "border-transparent bg-gray-900 text-white dark:bg-gray-50 dark:text-gray-900",
    secondary: "border-transparent bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-50",
    outline: "text-gray-950 dark:text-gray-50 border-gray-200 dark:border-gray-800",
    destructive: "border-transparent bg-red-600 text-white shadow hover:bg-red-700 dark:bg-red-900 dark:text-red-100", // Ajusté el rojo para dark mode
    
    // Variantes Semánticas
    success: "border-transparent bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
    warning: "border-transparent bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
    info: "border-transparent bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
    critical: "border-transparent bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
    neutral: "border-gray-200 bg-gray-50 text-gray-600 dark:bg-gray-900 dark:text-gray-400 dark:border-gray-700",
    brand: "border-purple-200 bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300 dark:border-purple-800",
};

type BadgeVariant = keyof typeof VARIANTS;

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
    variant?: BadgeVariant;
    children: React.ReactNode;
}

export const Badge = ({
    variant = 'default',
    className = '',
    children,
    ...props
}: BadgeProps) => {
    const variantStyles = VARIANTS[variant] || VARIANTS.default;

    return (
        <span className={`${BASE_STYLES} ${variantStyles} ${className}`} {...props}>
            {children}
        </span>
    );
};