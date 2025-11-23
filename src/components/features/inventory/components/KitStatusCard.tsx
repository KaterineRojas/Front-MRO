import React from 'react';
import {
    MapPin,
    Loader2,
    Archive,
    UserCheck,
    Lock,
    Calendar,
    Package
} from 'lucide-react';

interface KitStatusProps {
    kit: {
        id: string | number;
        binCode?: string;
        quantity: number;
        quantityAvailable: number;
        quantityLoan: number;
        quantityReserved: number;
        createdAt?: string;
    };
    assemblyBinCode?: string;
    loading?: boolean;
}

export const KitStatusCard: React.FC<KitStatusProps> = ({
    kit,
    assemblyBinCode,
    loading = false
}) => {
    return (
        <div className="h-full rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0A0A0A] overflow-hidden flex flex-col">

            {/* HEADER */}
            <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-[#0A0A0A]">
                <h4 className="flex items-center font-semibold text-sm text-gray-900 dark:text-gray-100">
                    <MapPin className="h-4 w-4 mr-2 text-indigo-500" />
                    Location & Stock
                </h4>
                {/* Badge de estado general (Opcional, decorativo) */}
                {!loading && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${kit.quantity > 0
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/10 dark:text-emerald-400 dark:border-emerald-900/30'
                            : 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700'
                        }`}>
                        {kit.quantity > 0 ? 'Active' : 'Empty'}
                    </span>
                )}
            </div>

            {/* BODY */}
            <div className="p-5 flex-1 flex flex-col justify-center">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                        <Loader2 className="h-8 w-8 animate-spin mb-2 text-indigo-500" />
                        <span className="text-xs">Syncing inventory...</span>
                    </div>
                ) : (
                    <div className="space-y-6">

                        {/* SECCIÓN 1: BIN LOCATION (Héroe) */}
                        <div className="text-center">
                            <span className="text-xs text-gray-400 uppercase tracking-wider font-medium">BIN Location</span>
                            <div className="mt-1 flex items-center justify-center gap-2">
                                <span className="text-3xl font-mono font-bold text-gray-900 dark:text-white tracking-tight">
                                    {assemblyBinCode || kit.binCode || "---"}
                                </span>
                            </div>
                            {!assemblyBinCode && !kit.binCode && (
                                <span className="text-xs text-orange-500 bg-orange-50 dark:bg-orange-900/20 px-2 py-0.5 rounded mt-1 inline-block">
                                    Not Assigned
                                </span>
                            )}
                        </div>

                        {/* SECCIÓN 2: METRICAS DE STOCK (Grid) */}
                        <div className="grid grid-cols-2 gap-3">
                            {/* Total Stock Box */}
                            <div className="col-span-2 bg-gray-50 dark:bg-gray-900/30 rounded-lg p-3 border border-gray-100 dark:border-gray-800 flex items-center justify-between">
                                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                    <Package className="w-4 h-4" />
                                    <span className="text-sm font-medium">Total Stock</span>
                                </div>
                                <span className="text-lg font-bold text-gray-900 dark:text-white">
                                    {kit.quantity}
                                </span>
                            </div>

                            {/* Breakdown: Available (Verde) */}
                            <div className="bg-emerald-50/50 dark:bg-emerald-900/10 rounded-lg p-3 border border-emerald-100/50 dark:border-emerald-900/20">
                                <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-500 mb-1">
                                    <Archive className="w-3.5 h-3.5" />
                                    <span className="text-xs font-semibold">Available</span>
                                </div>
                                <span className="text-xl font-bold text-emerald-700 dark:text-emerald-400 block">
                                    {kit.quantityAvailable}
                                </span>
                            </div>

                            {/* Breakdown: Reserved/Loan (Azul/Naranja) */}
                            {/* Agrupamos estos dos para ahorrar espacio visual si lo prefieres, o los separamos */}
                            <div className="space-y-2">
                                {/* On Loan */}
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-gray-500 flex items-center gap-1.5">
                                        <UserCheck className="w-3.5 h-3.5 text-orange-500" />
                                        On Loan
                                    </span>
                                    <span className="font-mono font-medium text-gray-900 dark:text-gray-200">
                                        {kit.quantityLoan}
                                    </span>
                                </div>
                                {/* Reserved */}
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-gray-500 flex items-center gap-1.5">
                                        <Lock className="w-3.5 h-3.5 text-blue-500" />
                                        Reserved
                                    </span>
                                    <span className="font-mono font-medium text-gray-900 dark:text-gray-200">
                                        {kit.quantityReserved}
                                    </span>
                                </div>
                            </div>
                        </div>

                    </div>
                )}
            </div>

            {/* FOOTER: FECHA */}
            {!loading && kit.createdAt && (
                <div className="px-5 py-3 bg-gray-50 dark:bg-[#0A0A0A] border-t border-gray-100 dark:border-gray-800">
                    <div className="flex items-center justify-center text-xs text-gray-400 gap-1.5">
                        <Calendar className="w-3 h-3" />
                        <span>Created: {new Date(kit.createdAt).toLocaleDateString()}</span>
                    </div>
                </div>
            )}
        </div>
    );
};