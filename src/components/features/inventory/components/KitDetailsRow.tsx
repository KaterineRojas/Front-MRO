import React from 'react';
import { PackageOpen } from 'lucide-react';
import { KitItemsTable } from './KitItemsTable';
import { KitStatusCard } from './KitStatusCard';

interface KitExpandedDetailsProps {
    kit: any; 
    articles: any[]; 
    assemblyBinCode: string | null;
    loadingAvailableBins: boolean;
    colSpan: number; 
}

export const KitExpandedDetails: React.FC<KitExpandedDetailsProps> = ({
    kit,
    articles,
    assemblyBinCode,
    loadingAvailableBins,
    colSpan
}) => {
    return (
        <tr id={`kit-details-${kit.id}`} className="border-b border-gray-100 dark:border-gray-800 dark:bg-gray-900/50 transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">

            <td colSpan={colSpan} className="p-0 bg-gray-50/30 dark:bg-gray-900/10">

                <div className="p-6 bg-gray-50/50 dark:bg-black/20 border-t border-gray-100 dark:border-gray-800 shadow-inner">

                    <h4 className="flex items-center text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">
                        <PackageOpen className="h-4 w-4 mr-2 text-indigo-600" />
                        Kit Contents
                    </h4>

                    <div className="flex flex-col lg:flex-row gap-6 items-start">

                        <div className="flex-1 min-w-0 space-y-3 w-full">
                            <KitItemsTable
                                items={kit.items}
                                articles={articles}
                            />
                        </div>

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