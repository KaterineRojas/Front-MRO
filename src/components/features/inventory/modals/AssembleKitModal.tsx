import React, { useState, useEffect } from 'react';
import {
    X, Minus, Plus, AlertTriangle, ArrowRight,
    PackageCheck, MapPin, Loader2, CheckCircle2, AlertCircle
} from 'lucide-react';

interface Bin {
    id: number;
    binCode: string;
    description?: string;
}

interface KitItem {
    articleId: number;
    articleSku: string;
    articleName: string;
    quantity: number;
    articleDescription?: string;
    currentStock?: number;     
}

interface AssembleKitModalProps {
    isOpen: boolean;
    onClose: () => void;
    kit: any;

    availableBins: Bin[];
    loadingAvailableBins: boolean;
    assemblyBinCode?: string | null;
    isBuilding: boolean;
    onConfirm: (qty: number, binId?: number) => void;
}

export const AssembleKitModal: React.FC<AssembleKitModalProps> = ({
    isOpen,
    onClose,
    kit,
    availableBins = [],
    loadingAvailableBins,
    assemblyBinCode,
    isBuilding,
    onConfirm
}) => {
    const [quantity, setQuantity] = useState(1);
    const [selectedBinId, setSelectedBinId] = useState<number>(0);

    useEffect(() => {
        if (isOpen) {
            setQuantity(1);
            setSelectedBinId(0);
        }
    }, [isOpen]);

    if (!isOpen || !kit) return null;

    const canBuildStock = kit.items.every((item: KitItem) => {
        const currentStock = item.currentStock ?? 0;
        const required = item.quantity * quantity;
        return currentStock >= required;
    });

    const hasValidBin = assemblyBinCode || selectedBinId > 0;
    const canConfirm = canBuildStock && hasValidBin && !isBuilding;

    const handleIncrement = () => setQuantity(q => Math.min(999, q + 1));
    const handleDecrement = () => setQuantity(q => Math.max(1, q - 1));

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-[#121212] w-full max-w-2xl rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col max-h-[90vh]">

                {/* HEADER */}
                <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-[#0A0A0A]">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <PackageCheck className="w-5 h-5 text-indigo-600" />
                            Assemble Kit
                        </h2>
                        <p className="text-xs text-gray-500 mt-1">
                            Building: <span className="font-semibold text-gray-700 dark:text-gray-300">{kit.name}</span>
                        </p>
                    </div>
                    <button
                        onClick={!isBuilding ? onClose : undefined}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors disabled:opacity-50"
                        disabled={isBuilding}
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* BODY */}
                <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-8">

                    {/* 1. CANTIDAD */}
                    <div className="flex flex-col items-center justify-center p-6 bg-indigo-50/30 dark:bg-indigo-900/10 rounded-xl border border-dashed border-indigo-200 dark:border-indigo-800/50">
                        <label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-4 uppercase tracking-wide text-xs">
                            Quantity to Build
                        </label>
                        <div className="flex items-center gap-6">
                            <button onClick={handleDecrement} disabled={quantity <= 1 || isBuilding} className="w-12 h-12 rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:text-indigo-600 transition-all active:scale-95 disabled:opacity-50">
                                <Minus className="w-5 h-5" />
                            </button>
                            <div className="w-20 text-center">
                                <span className="text-4xl font-bold text-indigo-600 dark:text-indigo-400 font-mono tracking-tight">
                                    {quantity}
                                </span>
                            </div>
                            <button onClick={handleIncrement} disabled={isBuilding} className="w-12 h-12 rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:text-indigo-600 transition-all active:scale-95 disabled:opacity-50">
                                <Plus className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* 2. SELECCIÓN BIN */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-gray-500" />
                            Target Location
                        </h3>
                        {assemblyBinCode ? (
                            <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-lg flex justify-between items-center">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Assigned BIN:</span>
                                <span className="font-mono font-bold text-gray-900 dark:text-white bg-white dark:bg-black px-3 py-1 rounded border border-gray-200 dark:border-gray-700">
                                    {assemblyBinCode}
                                </span>
                            </div>
                        ) : (
                            <div className="relative">
                                {loadingAvailableBins ? (
                                    <div className="p-4 border rounded-lg flex items-center justify-center text-gray-500 gap-2 bg-gray-50 dark:bg-gray-900/30">
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span className="text-sm">Loading bins...</span>
                                    </div>
                                ) : (
                                    <div className="relative">
                                        <select
                                            value={selectedBinId}
                                            onChange={(e) => setSelectedBinId(Number(e.target.value))}
                                            disabled={isBuilding}
                                            className="w-full appearance-none bg-white dark:bg-[#0A0A0A] border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-3 pr-8 cursor-pointer"
                                        >
                                            <option value={0}>Select a target BIN...</option>
                                            {availableBins.map((bin) => (
                                                <option key={bin.id} value={bin.id}>
                                                    {bin.binCode} {bin.description ? `- ${bin.description}` : ''}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* 3. TABLA REQUERIMIENTOS */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">Resource Requirements</h3>
                        <div className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 dark:bg-[#0A0A0A] text-gray-500 dark:text-gray-400 text-xs uppercase font-medium border-b border-gray-200 dark:border-gray-800">
                                    <tr>
                                        <th className="px-4 py-2 text-left">Item</th>
                                        <th className="px-4 py-2 text-center">Needed</th>
                                        <th className="px-4 py-2 text-right">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-800 bg-white dark:bg-[#0A0A0A]">
                                    {kit.items.map((item: KitItem, idx: number) => {

                                        const currentStock = item.quantity ?? 0;
                                        const required = item.quantity * quantity;
                                        const hasStock = currentStock >= required;

                                        return (
                                            <tr key={`${item.articleSku}-${idx}`} className={!hasStock ? 'bg-red-50 dark:bg-red-900/10' : ''}>
                                                <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-200">
                                                    {item.articleName}
                                                    <div className="text-xs text-gray-400 font-mono font-normal">{item.articleSku}</div>
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <div className="flex flex-col items-center">
                                                        <span className="text-[10px] text-gray-400">{item.quantity} x {quantity}</span>
                                                        <span className="font-bold text-gray-900 dark:text-white">{required}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    {hasStock ? (
                                                        <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-xs font-semibold bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded border border-emerald-100 dark:border-emerald-900/30">
                                                            <CheckCircle2 className="w-3 h-3" /> Available ({currentStock})
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 text-red-600 dark:text-red-400 text-xs font-bold bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded border border-red-100 dark:border-red-900/30">
                                                            <AlertTriangle className="w-3 h-3" /> Low Stock ({currentStock})
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>

                {/* FOOTER */}
                <div className="p-4 bg-gray-50 dark:bg-[#0A0A0A] border-t border-gray-200 dark:border-gray-800 flex justify-end gap-3">
                    <button onClick={onClose} disabled={isBuilding} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-[#121212] dark:text-gray-300 dark:border-gray-700">
                        Cancel
                    </button>
                    <button
                        onClick={() => onConfirm(quantity, selectedBinId)}
                        disabled={!canConfirm}
                        className={`px-6 py-2 text-sm font-medium text-white rounded-lg shadow-sm flex items-center gap-2 transition-all ${canConfirm ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed'}`}
                    >
                        {isBuilding ? (<> <Loader2 className="w-4 h-4 animate-spin" /> Building... </>) : (<> Confirm Assembly <ArrowRight className="w-4 h-4" /> </>)}
                    </button>
                </div>

            </div>
        </div>
    );
};


