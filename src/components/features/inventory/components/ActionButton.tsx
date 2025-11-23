import React from 'react';
import {
    Hammer,       // Para Assemble
    Wrench,       // Para Dismantle
    Copy,         // Para Duplicate
    Trash2,       // Para Delete
    MoreHorizontal, // Fallback
    PackagePlus,
    PackageMinus,
    CopyPlus,
} from 'lucide-react';

// 1. Definimos los tipos de variantes para controlar el color/intención
export type ActionVariant = 'primary' | 'primarySolid' | 'cyan' | 'purple' | 'success' | 'warning' | 'danger' | 'neutral' | 'slate';

// 2. Definimos los nombres de iconos permitidos
export type IconType = 'assemble' | 'dismantle' | 'duplicate' | 'delete';

interface ActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    icon: IconType;
    label?: string; // Texto opcional. Si no existe, el botón será cuadrado (icon-only)
    variant?: ActionVariant;
    isLoading?: boolean;
}

export const ActionButton: React.FC<ActionButtonProps> = ({
    icon,
    label,
    variant = 'neutral', // Por defecto gris
    isLoading,
    className = '',
    disabled,
    ...props
}) => {

    // --- Lógica de Iconos (Switch) ---
    const renderIcon = () => {
        const iconProps = { size: 18, className: label ? "mr-2" : "" }; // Margen solo si hay texto

        switch (icon) {
            case 'assemble': return <PackagePlus {...iconProps} />;
            case 'dismantle': return <PackageMinus {...iconProps} />;
            case 'duplicate': return <CopyPlus {...iconProps} />;
            case 'delete': return <Trash2 {...iconProps} />;
            default: return <MoreHorizontal {...iconProps} />;
        }
    };

    // --- Lógica de Estilos (Colores Vivos pero Sutiles) ---
    // Usamos bg-opacity o colores '50/100' de Tailwind para dar vida a la tabla sin ser agresivos
    const getVariantStyles = (v: ActionVariant) => {
        // Clases comunes para todos (transiciones suaves)
        const commonTransition = "transition-all duration-200 shadow-sm";

        switch (v) {
            case 'primary': // Azul / Indigo (Assemble)
                return `
                border-indigo-600 text-indigo-600 
                hover:bg-indigo-600 hover:text-white 
                dark:border-indigo-500 dark:text-indigo-400 dark:hover:bg-indigo-500 dark:hover:text-white
                ${commonTransition}
            `;

            case 'primarySolid': // Azul / Indigo (Assemble)
                return `
                border-indigo-600 text-indigo-600 
                bg-indigo-600 text-white 
                dark:hover:border-white hover:bg-indigo-500 dark:hover:text-white
                ${commonTransition}
            `;

            case 'cyan':
                return `
                    border-cyan-600 text-cyan-600 
                    hover:bg-cyan-600 hover:text-white 
                    dark:border-cyan-400 dark:text-cyan-400 dark:hover:bg-cyan-500 dark:hover:text-white
                    ${commonTransition}
            `;

            case 'success': // Verde
                return `
                border-emerald-600 text-emerald-600 
                hover:bg-emerald-600 hover:text-white 
                dark:border-emerald-500 dark:text-emerald-400 dark:hover:bg-emerald-500 dark:hover:text-white
                ${commonTransition}
            `;

            case 'warning': // Naranja (Dismantle)
                return `
                border-orange-500 text-orange-600 
                hover:bg-orange-500 hover:text-white 
                dark:border-orange-500 dark:text-orange-400 dark:hover:bg-orange-500 dark:hover:text-white
                ${commonTransition}
            `;

            case 'danger': // Rojo (Delete)
                return `
                border-red-600 text-red-600 
                hover:bg-red-600 hover:text-white 
                dark:border-red-500 dark:text-red-400 dark:hover:bg-red-600 dark:hover:text-white
                ${commonTransition}
            `;

            case 'neutral': // Gris (Duplicate / Template)
                return `
                border-gray-300 text-gray-600 
                hover:bg-gray-800 hover:text-white hover:border-gray-800
                dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:border-gray-700 dark:hover:text-white
                ${commonTransition}
            `;

            case 'purple': // Renómbralo a 'info' o 'secondary' si prefieres
                return `
                    border-purple-600 text-purple-600 
                    hover:bg-purple-600 hover:text-white 
                    dark:border-purple-400 dark:text-purple-400 dark:hover:bg-purple-500 dark:hover:text-white
                    ${commonTransition}
            `;

            case 'slate':
                return `
                border-slate-600 text-slate-600 
                hover:bg-slate-700 hover:text-white 
                dark:border-slate-400 dark:text-slate-400 dark:hover:bg-slate-600 dark:hover:text-white
                ${commonTransition}
            `;

            default:
                return `
                border-gray-200 text-gray-500 
                hover:bg-gray-100 hover:text-gray-900
                dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800
                ${commonTransition}
            `;
        }
    };

    // Clases base: Flexbox, bordes redondeados, transiciones
    const baseStyles = "inline-flex items-center justify-center font-medium transition-all duration-200 border rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed";

    // Ajuste de padding dependiendo si tiene texto o es solo icono
    const sizeStyles = label
        ? "px-3 py-1.5 text-sm"  // Botón normal
        : "p-2";                 // Botón cuadrado (solo icono)

    return (
        <button
            className={`
        ${baseStyles} 
        ${sizeStyles} 
        ${getVariantStyles(variant)} 
        ${className}
      `}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading ? (
                <span className="animate-spin mr-2">⏳</span> // O tu spinner favorito
            ) : (
                renderIcon()
            )}
            {label}
        </button>
    );
};