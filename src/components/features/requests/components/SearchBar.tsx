import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { useSelector } from 'react-redux';



export interface SelectOption {
    value: string;
    label: string;
}

interface SearchBarProps {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    selectedType: string;
    setSelectedType: (type: string) => void;
    typesOptions: SelectOption[];
    placeholder?: string;
}

export default function SearchBar({
    searchQuery,
    setSearchQuery,
    selectedType,
    setSelectedType,
    typesOptions,
    placeholder = "Search by request #, requester, department, or item..."
}: SearchBarProps) {

    const dropdownRef = useRef<HTMLDivElement>(null);


    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const darkMode = useSelector((state: any) => state.ui.darkMode);

    const handleTypeSelect = (value: string) => {
        setSelectedType(value);
        setIsDropdownOpen(false);
    };

    const getSelectedLabel = () => {
        const option = typesOptions.find(opt => opt.value === selectedType);
        return option?.label || selectedType;
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };

        if (isDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isDropdownOpen]);

    return (
        <div className="w-full max-w-7xl mx-auto p-4 border rounded-xl">
            <div className="flex gap-4 items-center flex-col md:flex-row">
                {/* Search Input */}
                <div className="flex-1 rounded-xl w-[-webkit-fill-available]"
                    style={{
                        background: `${darkMode ? '#121212' : '#F3F3F5'}`,
                    }}
                >
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={placeholder}
                        className={`px-4 py-1 rounded-lg  placeholder-gray-400  w-full
                            transition-all ${darkMode ? 'bg-[#121212]' : 'bg-[#F3F3F5]'}
                        `}
                        style={{
                            // width: '-webkit-fill-available'
                        }}
                    />
                </div>

                {/* Dropdown */}
                <div className="relative w-full md:w-auto" ref={dropdownRef}>
                    <button
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className={` min-w-[200px] w-full  px-4 py-2 bg-gray-50 rounded-lg text-gray-700 flex items-center justify-between 
                        hover:bg-gray-100 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm
                            ${darkMode ? 'text-white' : 'text-black'}
                        `}
                        style={{
                            background: `${darkMode ? '#121212' : '#F3F3F5'}`,
                            minWidth: '180px'
                        }}
                    >
                        <span>{getSelectedLabel()}</span>
                        <ChevronDown
                            className={`w-5 h-5 ml-2 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                            style={{
                                transition: '.2s',
                                transform: `${isDropdownOpen ? 'rotate(180deg)' : ''}`
                            }}
                        />
                    </button>

                    {/* Dropdown Menu */}
                    {isDropdownOpen && (
                        <div className={`flex flex-col gap-0 absolute right-0 mt-2 min-w-[220px] rounded-lg shadow-lg border border-gray-200 py-2 z-10
                                ${darkMode ? 'bg-[#000]' : 'bg-[#fff]'}
                            `}
                            style={{
                                minWidth: '180px'
                            }}
                        >
                            {typesOptions.map((option) => (
                                <button
                                    key={option.value}
                                    onClick={() => handleTypeSelect(option.value)}
                                    className={`w-full px-4 py-2 text-left text-sm rounded-xl 
                                        transition-colors flex items-center justify-between group transition
                                        ${darkMode ? 'hover:bg-[#262626]' : 'hover:bg-[#ECECF0]'}
                                    `}

                                >
                                    <span className={`text-gray-700 ${darkMode ? 'text-white' : 'text-black'}
                                        `}>{option.label}</span>
                                    {selectedType === option.value && (
                                        <Check className="w-5 h-5 text-blue-600" />
                                    )}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Results Preview (opcional) */}
            {searchQuery && (
                <div className="mt-4 text-sm text-gray-500">
                    Buscando "{searchQuery}" en: {getSelectedLabel()}
                </div>
            )}
        </div>
    );
}