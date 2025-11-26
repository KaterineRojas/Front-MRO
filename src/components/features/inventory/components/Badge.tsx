// src/components/ui/Badge.tsx
import React from 'react';

// Definimos los estilos base que comparten todos los badges
const BASE_STYLES = "inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 gap-1 transition-colors";

// Mapeo simple de variantes a clases de Tailwind
const VARIANTS = {
    default: "border-transparent bg-gray-900 text-white dark:bg-gray-50 dark:text-gray-900",
    secondary: "border-transparent bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-50",
    outline: "text-gray-950 dark:text-gray-50 border-gray-200 dark:border-gray-800",
    destructive: "border-transparent bg-red-500 text-white shadow hover:bg-red-500/80",

    // Tus variantes personalizadas de negocio
    success: "border-transparent bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
    warning: "border-transparent bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
    info: "border-transparent bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    critical: "border-transparent bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    neutral: "border-gray-200 bg-gray-50 text-gray-600 dark:bg-gray-900 dark:text-gray-400 dark:border-gray-700",
};

// Tipos para TypeScript (Opcional, pero recomendado)
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

    // Seleccionamos la clase según la variante, o usamos default si no existe
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