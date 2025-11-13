// src/components/SearchBar.tsx

import React from 'react';
import { Search } from 'lucide-react'; // O tu ícono de 'icons.ts'

/**
 * Define la "forma" de una opción para el select.
 * Es mejor usar objetos (value + label) que solo strings.
 */
export interface SelectOption {
    value: string;
    label: string;
}

// Define las props que el componente SearchBar recibirá
interface SearchBarProps {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    selectedType: string;
    setSelectedType: (type: string) => void;
    typesOptions: SelectOption[];
    placeholder?: string;
}

export const SearchBar = ({
    searchQuery,
    setSearchQuery,
    selectedType,
    setSelectedType,
    typesOptions,
    placeholder = "Search by request #, requester, department, or item..." // Placeholder por defecto
}: SearchBarProps) => {

    return (
        // Contenedor principal: blanco, con borde, redondeado (como en tu imagen)
        <div className="flex items-center w-full gap-4 p-4 bg-white border border-gray-200 rounded-xl shadow-sm">

            {/* --- 1. La Caja de Búsqueda (Input) --- */}
            {/* Contenedor gris claro para el input y el ícono */}
            <div className="flex-grow flex items-center gap-3 px-4 py-2 bg-gray-100 rounded-lg">

                {/* Ícono de Búsqueda */}
                <Search className="h-5 w-5 text-gray-400" />

                {/* Input */}
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={placeholder}
                    // Estilos para que el input se integre con su contenedor
                    className="w-full bg-transparent focus:outline-none text-gray-800 placeholder-gray-500"
                />
            </div>

            {/* --- 2. La Caja de Selección (Select) --- */}
            {/* Contenedor gris claro para el select */}
            <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                // Estilos para que el select se vea como un bloque (similar a la imagen)
                // 'appearance-none' quita el feo estilo por defecto del navegador
                className="px-4 py-2 bg-gray-100 rounded-lg text-gray-800 focus:outline-none"
            >
                {typesOptions.map(option => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>

        </div>
    );
};

export default SearchBar;