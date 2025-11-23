import React from 'react';

type ButtonVariant = 'primary' | 'success' | 'danger' | 'outline' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'icon';

interface ActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    className?: string;
    children: React.ReactNode;
}

export function Button({
    variant = 'primary',
    size = 'md',
    className = '',
    children,
    ...props
}: ActionButtonProps) {

    const baseStyles = "inline-flex items-center justify-center rounded-md font-medium transition-colors shadow-sm focus:outline-none disabled:opacity-50 disabled:pointer-events-none";

    const variants = {
        primary: "bg-gray-900 text-white hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200",

        success: "bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500",

        danger: "bg-red-600 text-white hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-500",

        outline: "border border-gray-300 bg-transparent hover:bg-gray-100 text-gray-700 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800",

        ghost: "bg-transparent hover:bg-gray-100 text-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 shadow-none",
    };

    const sizes = {
        sm: "h-8 px-3 text-xs",
        md: "h-9 px-4 py-2 text-sm", 
        icon: "h-9 w-9 p-0", 
    };

    const finalClass = `
    ${baseStyles} 
    ${variants[variant]} 
    ${sizes[size]} 
    ${className}
    `.trim();

    return (
        <button className={finalClass} {...props}>
            {children}
        </button>
    );
}