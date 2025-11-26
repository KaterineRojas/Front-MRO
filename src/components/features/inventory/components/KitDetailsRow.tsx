import React from 'react';
import { PackageOpen } from 'lucide-react';
// Asumo que estos componentes ya existen en tu proyecto según tu contexto
import { KitItemsTable } from './KitItemsTable';
import { KitStatusCard } from './KitStatusCard';

// Define las interfaces según tus datos reales (simplificado para el ejemplo)
interface KitExpandedDetailsProps {
    kit: any; // Reemplazar con tu tipo 'Kit'
    articles: any[]; // Reemplazar con tu tipo 'Article[]'
    assemblyBinCode: string | null;
    loadingAvailableBins: boolean;
    colSpan: number; // Importante para que ocupe todo el ancho de la tabla
}

export const KitExpandedDetails: React.FC<KitExpandedDetailsProps> = ({
    kit,
    articles,
    assemblyBinCode,
    loadingAvailableBins,
    colSpan
}) => {
    return (
        // Usamos <tr> nativo en lugar de <TableRow>
        <tr className="border-b border-gray-100 dark:border-gray-800 dark:bg-gray-900/50 transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">

            {/* Usamos <td> nativo en lugar de <TableCell> */}
            <td colSpan={colSpan} className="p-0 bg-gray-50/30 dark:bg-gray-900/10">

                {/* Contenedor de estilos interno (El que tenías en tu snippet) */}
                <div className="p-6 bg-gray-50/50 dark:bg-black/20 border-t border-gray-100 dark:border-gray-800 shadow-inner">

                    {/* Cabecera de la Sección */}
                    <h4 className="flex items-center text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">
                        <PackageOpen className="h-4 w-4 mr-2 text-indigo-600" />
                        Kit Contents
                    </h4>

                    {/* Layout Side-by-Side */}
                    <div className="flex flex-col lg:flex-row gap-6 items-start">

                        {/* 1. Tabla de Items */}
                        <div className="flex-1 min-w-0 space-y-3 w-full">
                            <KitItemsTable
                                items={kit.items}
                                articles={articles}
                            />
                        </div>

                        {/* 2. Tarjeta de Estado */}
                        <div className="w-full lg:w-80 shrink-0">
                            <KitStatusCard
                                kit={kit}
                                assemblyBinCode={assemblyBinCode}
                                loading={loadingAvailableBins}
                            />
                        </div>

                    </div>
                </div>
            </td>
        </tr>
    );
};