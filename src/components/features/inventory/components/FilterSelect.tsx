import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Loader2 } from 'lucide-react';

export interface SelectOption {
    value: string;
    label: string;
}

interface FilterSelectProps {
    value: string | null;
    onChange: (value: string) => void;
    options: SelectOption[];
    placeholder?: string;
    isLoading?: boolean;
    icon?: React.ReactNode; // Icono opcional a la izquierda (Label)
    className?: string;
}

export const FilterSelect: React.FC<FilterSelectProps> = ({
    value,
    onChange,
    options,
    placeholder = "Select option",
    isLoading = false,
    icon,
    className = ""
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // 1. Lógica para cerrar el menú si haces click afuera
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // 2. Encontrar el label de la opción seleccionada
    const selectedOption = options.find(opt => opt.value === value);
    const displayLabel = selectedOption ? selectedOption.label : placeholder;

    const handleSelect = (val: string) => {
        onChange(val);
        setIsOpen(false);
    };

    return (
        <div
            className={`relative w-full md:w-auto ${className}`}
            ref={containerRef}
        >
            {/* --- TRIGGER BUTTON --- */}
            <button
                type="button"
                onClick={() => !isLoading && setIsOpen(!isOpen)}
                disabled={isLoading}
                className={`
          w-full min-w-[200px] px-4 py-2.5 rounded-lg text-sm font-medium
          flex items-center justify-between transition-all duration-200 border
          focus:outline-none focus:ring-2 focus:ring-blue-500/50
          
          /* Light Mode Styles */
          bg-[#F3F3F5] text-gray-700 border-transparent hover:bg-gray-200
          
          /* Dark Mode Styles (Tus colores exactos) */
          dark:bg-[#121212] dark:text-white dark:border-gray-800 dark:hover:bg-[#1a1a1a]

          /* Disabled state */
          disabled:opacity-50 disabled:cursor-not-allowed
        `}
            >
                <div className="flex items-center gap-2 truncate">
                    {/* Icono opcional (filtro, tag, etc) */}
                    {icon && <span className="text-gray-500 dark:text-gray-400">{icon}</span>}

                    <span className="truncate">
                        {isLoading ? "Loading..." : displayLabel}
                    </span>
                </div>

                {/* Icono Flecha o Spinner */}
                {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-gray-500 ml-2" />
                ) : (
                    <ChevronDown
                        className={`w-4 h-4 ml-2 text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                    />
                )}
            </button>

            {/* --- DROPDOWN MENU --- */}
            {isOpen && (
                <div className={`
          absolute right-0 mt-2 w-full min-w-[220px] z-50 
          rounded-xl shadow-xl border py-1.5 animate-in fade-in zoom-in-95 duration-100 origin-top-right

          /* Light Mode Colors */
          bg-white border-gray-200 
          
          /* Dark Mode Colors (Tu color exacto) */
          dark:bg-black dark:border-gray-800
        `}>
                    <div className="max-h-[280px] overflow-y-auto custom-scrollbar">
                        {options.map((option) => {
                            const isSelected = option.value === value;
                            return (
                                <button
                                    key={option.value}
                                    onClick={() => handleSelect(option.value)}
                                    className={`
                    w-full text-left px-4 py-2.5 text-sm flex items-center justify-between group transition-colors
                    
                    /* Hover effects */
                    hover:bg-[#ECECF0] dark:hover:bg-[#262626]
                    
                    /* Selected state colors */
                    ${isSelected
                                            ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 font-medium'
                                            : 'text-gray-700 dark:text-gray-300'
                                        }
                  `}
                                >
                                    <span>{option.label}</span>

                                    {isSelected && (
                                        <Check className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};