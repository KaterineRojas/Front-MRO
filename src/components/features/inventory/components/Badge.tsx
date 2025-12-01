import React from 'react';

const BASE_STYLES = "inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 gap-1 transition-colors";

const VARIANTS = {
    default: "border-transparent bg-gray-900 text-white dark:bg-gray-50 dark:text-gray-900",
    secondary: "border-transparent bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-50",
    outline: "text-gray-950 dark:text-gray-50 border-gray-200 dark:border-gray-800",
    
    destructive: "border-transparent bg-red-600 text-white shadow hover:bg-red-700 dark:bg-red-700",

    success: "bg-transparent border-emerald-600 text-emerald-600 dark:border-emerald-500 dark:text-emerald-400",
    
    warning: "bg-transparent border-amber-400 text-amber-500 dark:text-amber-400", 
    
    info: "bg-transparent border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-400",
    
    critical: "bg-transparent border-red-600 text-red-600 dark:border-red-500 dark:text-red-500",
    
    neutral: "bg-transparent border-gray-900 text-gray-900 dark:border-white dark:text-white",
    
    brand: "bg-transparent border-purple-600 text-purple-600 dark:border-purple-500 dark:text-purple-400",


    "success-soft": "border-transparent bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
    
    "warning-soft": "border-transparent bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    
    "info-soft": "border-transparent bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    
    "critical-soft": "border-transparent bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    
    "neutral-soft": "border-black  dark:bg-gray-900 dark:text-gray-400 dark:border-gray-700",
    
    "brand-soft": "border-transparent bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
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
        <span
            className={`${BASE_STYLES} ${variantStyles} ${className}`}
            {...props}
        >
            {children}
        </span>
    );
};