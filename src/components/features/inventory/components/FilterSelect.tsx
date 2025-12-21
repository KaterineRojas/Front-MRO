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
    icon?: React.ReactNode;
    className?: string;
    allOptionIncluded?: boolean;
}

export const FilterSelect: React.FC<FilterSelectProps> = ({
    value,
    onChange,
    options,
    placeholder = "Select option",
    isLoading = false,
    icon,
    className = "",
    allOptionIncluded = false,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

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
            <button
                type="button"
                onClick={() => !isLoading && setIsOpen(!isOpen)}
                disabled={isLoading}
                className={`
                    w-full min-w-[200px] px-4 py-2.5 rounded-lg text-sm font-medium
                    flex items-center justify-between transition-all duration-200 border dark:border-border
                    focus:outline-none focus:ring-2 focus:ring-blue-500/50

                    bg-[#F3F3F5] text-gray-700 border-transparent hover:bg-gray-200

                    dark:bg-[#121212] dark:text-white dark:hover:bg-[#1a1a1a]

                    disabled:opacity-50 disabled:cursor-not-allowed
                `}
            >
                <div className="flex items-center gap-2 truncate">
                    {icon && <span className="text-gray-500 dark:text-gray-400">{icon}</span>}

                    <span className="truncate">
                        {isLoading ? "Loading..." : displayLabel}
                    </span>
                </div>

                {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-gray-500 ml-2" />
                ) : (
                    <ChevronDown
                        className={`w-4 h-4 ml-2 text-black dark:text-white transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                    />
                )}
            </button>

            {/* --- DROPDOWN MENU --- */}
            {isOpen && (
                <div className={`
                    absolute right-0 mt-2 w-full min-w-[220px] z-50
                    rounded-xl shadow-xl border dark:border-border py-1.5 animate-in fade-in zoom-in-95 duration-100 origin-top-right
                    bg-white border-gray-200
                    dark:bg-black dark:overflow-x-hidden
                `}>
                    <div className="max-h-[280px] overflow-y-auto custom-scrollbar">
                        {allOptionIncluded && <button
                            onClick={() => handleSelect('all')} 
                            className={`
                                w-full text-left px-4 py-2.5 text-sm flex items-center justify-between group transition-colors
                                hover:bg-[#ECECF0] dark:hover:bg-[#262626]
                                ${(value === 'all' || !value) 
                                    ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 font-medium'
                                    : 'text-gray-700 dark:text-gray-300'
                                }
                            `}
                        >
                            <span>All Categories</span>

                            {(value === 'all' || !value) && (
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12" />
                                </svg>
                            )}
                        </button>}

                        <div className="h-px bg-gray-100 dark:bg-gray-800 my-1 mx-2"></div>

                        {options.map((option) => {
                            const isSelected = option.value === value;

                            return (
                                <button
                                    key={option.value}
                                    onClick={() => handleSelect(option.value)}
                                    className={`
                                        w-full text-left px-4 py-2.5 text-sm flex items-center justify-between group transition-colors
                                        hover:bg-[#ECECF0] dark:hover:bg-[#262626]
                                        ${isSelected
                                                ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 font-medium'
                                                : 'text-gray-700 dark:text-gray-300'
                                            }
                                    `}
                                >
                                    <span>{option.label}</span>

                                    {isSelected && (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="20 6 9 17 4 12" />
                                        </svg>
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