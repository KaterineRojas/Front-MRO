import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Loader2, Filter } from 'lucide-react';

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
    className?: string;
}

export const FilterSelect: React.FC<FilterSelectProps> = ({
    value,
    onChange,
    options,
    placeholder = "Filter",
    isLoading = false,
    className = "",
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Senior tip: Clean event listeners are key for performance
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const selectedOption = options.find(opt => opt.value === value);

    return (
        <div className={`relative ${className}`} ref={containerRef}>
            <button
                type="button"
                onClick={() => !isLoading && setIsOpen(!isOpen)}
                className={`
                    flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium
                    transition-all duration-200 border

                    bg-white border-gray-200 text-gray-700 hover:bg-gray-50

                    dark:bg-[#0A1016] dark:border-gray-800 dark:text-gray-300 dark:hover:bg-gray-800/50
                    focus:outline-none focus:ring-2 focus:ring-blue-500/40
                `}
            >
                <Filter className="w-3.5 h-3.5 opacity-60" />
                <span>{isLoading ? "Loading..." : (selectedOption?.label || placeholder)}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute left-0 mt-2 w-48 z-50 rounded-lg shadow-xl border 
                    bg-white border-gray-200 
                    dark:bg-[#0A1016] dark:border-gray-800 
                    animate-in fade-in zoom-in-95 duration-100">
                    <div className="p-1">
                        {options.map((option) => (
                            <button
                                key={option.value}
                                onClick={() => {
                                    onChange(option.value);
                                    setIsOpen(false);
                                }}
                                className={`
                                    w-full text-left px-3 py-2 text-xs rounded-md flex items-center justify-between
                                    ${option.value === value 
                                        ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' 
                                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}
                                `}
                            >
                                {option.label}
                                {option.value === value && <Check className="w-3 h-3" />}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};