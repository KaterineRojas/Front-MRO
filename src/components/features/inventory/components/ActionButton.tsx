import React from 'react';
import {
    Hammer,
    Wrench,
    Copy,
    Trash2,
    MoreHorizontal,
    PackagePlus,
    PackageMinus,
    CopyPlus,
    Check,
    X,
} from 'lucide-react';

export type ActionVariant = 'primary' | 'primarySolid' | 'cyan' | 'purple' | 'success' | 'warning' | 'danger' | 'neutral' | 'slate';

// 2. Definimos los nombres de iconos permitidos
export type IconType = 'assemble' | 'dismantle' | 'duplicate' | 'delete' | 'approve' | 'reject';

interface ActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    icon: IconType;
    label?: string;
    variant?: ActionVariant;
    isLoading?: boolean;
}

export const ActionButton: React.FC<ActionButtonProps> = ({
    icon,
    label,
    variant = 'neutral',
    isLoading,
    className = '',
    disabled,
    ...props
}) => {

    const renderIcon = () => {
        const iconProps = { size: 18, className: label ? "mr-2" : "" };

        switch (icon) {
            case 'assemble': return <PackagePlus {...iconProps} />;
            case 'dismantle': return <PackageMinus {...iconProps} />;
            case 'duplicate': return <CopyPlus {...iconProps} />;
            case 'delete': return <Trash2 {...iconProps} />;

            // 👇 ADD THESE TWO CASES
            case 'approve': return <Check {...iconProps} />;
            case 'reject': return <X {...iconProps} />;

            default: return <MoreHorizontal {...iconProps} />;
        }
    };

    const getVariantStyles = (v: ActionVariant) => {
        const commonTransition = "transition-all duration-200 shadow-sm";

        switch (v) {
            case 'primary':
                return `
                border-indigo-600 text-indigo-600 
                enabled:hover:bg-indigo-600 enabled:hover:text-white 
                dark:border-indigo-500 dark:text-indigo-400 dark:enabled:hover:bg-indigo-500 dark:enabled:hover:text-white
                ${commonTransition}
            `;

            case 'primarySolid':
                return `
                border-indigo-600 text-indigo-600 
                bg-indigo-600 text-white 
                enabled:hover:bg-indigo-500 
                dark:enabled:hover:border-white dark:enabled:hover:text-white
                ${commonTransition}
            `;

            case 'cyan':
                return `
                    border-cyan-600 text-cyan-600 
                    enabled:hover:bg-cyan-600 enabled:hover:text-white 
                    dark:border-cyan-400 dark:text-cyan-400 dark:enabled:hover:bg-cyan-500 dark:enabled:hover:text-white
                    ${commonTransition}
            `;

            case 'success':
                return `
                border-emerald-600 text-emerald-600 
                enabled:hover:bg-emerald-600 enabled:hover:text-white 
                dark:border-emerald-500 dark:text-emerald-400 dark:enabled:hover:bg-emerald-500 dark:enabled:hover:text-white
                ${commonTransition}
            `;

            case 'warning':
                return `
                border-orange-500 text-orange-600 
                enabled:hover:bg-orange-500 enabled:hover:text-white 
                dark:border-orange-500 dark:text-orange-400 dark:enabled:hover:bg-orange-500 dark:enabled:hover:text-white
                ${commonTransition}
            `;

            case 'danger':
                return `
                border-red-600 text-red-600 
                enabled:hover:bg-red-600 enabled:hover:text-white 
                dark:border-red-500 dark:text-red-400 dark:enabled:hover:bg-red-600 dark:enabled:hover:text-white
                ${commonTransition}
            `;

            case 'neutral':
                return `
                border-gray-300 text-gray-600 
                enabled:hover:bg-gray-800 enabled:hover:text-white enabled:hover:border-gray-800
                dark:border-gray-600 dark:text-gray-400 dark:enabled:hover:bg-gray-700 dark:enabled:hover:border-gray-700 dark:enabled:hover:text-white
                ${commonTransition}
            `;

            case 'purple':
                return `
                    border-purple-600 text-purple-600 
                    enabled:hover:bg-purple-600 enabled:hover:text-white 
                    dark:border-purple-400 dark:text-purple-400 dark:enabled:hover:bg-purple-500 dark:enabled:hover:text-white
                    ${commonTransition}
            `;

            case 'slate':
                return `
                border-slate-600 text-slate-600 
                enabled:hover:bg-slate-700 enabled:hover:text-white 
                dark:border-slate-400 dark:text-slate-400 dark:enabled:hover:bg-slate-600 dark:enabled:hover:text-white
                ${commonTransition}
            `;

            default:
                return `
                border-gray-200 text-gray-500 
                enabled:hover:bg-gray-100 enabled:hover:text-gray-900
                dark:border-gray-700 dark:text-gray-400 dark:enabled:hover:bg-gray-800
                ${commonTransition}
            `;
        }
    };

    const baseStyles = "inline-flex items-center justify-center font-medium transition-all duration-200 border dark:border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-30 dark:disabled:opacity-50  dark:disabled:hover:bg-[#0A0A0A] disabled:cursor-not-allowed";

    const sizeStyles = label
        ? "px-3 py-1.5 text-sm"
        : "p-2";

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
                <span className="animate-spin mr-2">⏳</span>
            ) : (
                renderIcon()
            )}
            {label}
        </button>
    );
};