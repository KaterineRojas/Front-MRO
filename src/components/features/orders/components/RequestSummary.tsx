import React from 'react';
import { Package, Trash2, Send, Loader2 } from 'lucide-react';
import { Button } from '../../inventory/components/Button';
import { Badge } from '../../inventory/components/Badge';
import { useSelector } from 'react-redux';
// Import the correct interface
import { PurchaseRequestItem } from '../types/purchaseType';

interface RequestSummaryProps {
    items: PurchaseRequestItem[]; // ✅ Typed correctly
    onRemoveItem: (id: number) => void;
    onSubmit: (e: React.FormEvent) => void;
    isLoading: boolean;
}

export const RequestSummary: React.FC<RequestSummaryProps> = ({
    items,
    onRemoveItem,
    onSubmit,
    isLoading
}) => {

    // Calculate total
    const totalAmount = items.reduce((sum, item) => sum + item.totalCost, 0);
    const darkMode = useSelector((state: any) => state.ui.darkMode);

    return (
        <div className="space-y-6">

            {/* ITEMS CARD */}
            <div className="rounded-xl border border-gray-200 bg-white text-gray-950 shadow-sm dark:border-gray-800 dark:bg-transparent dark:text-gray-50 flex flex-col">

                {/* Header */}
                <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-100 dark:border-gray-800">
                    <h3 className="font-semibold leading-none tracking-tight">
                        Items in Request ({items.length})
                    </h3>
                    <Badge variant={`${darkMode ? 'emerald' : 'emerald-soft'}`} className="text-sm px-2.5 py-1">
                        Total: ${totalAmount.toFixed(2)}
                    </Badge>
                </div>

                {/* Content */}
                <div className="p-6">
                    {items.length === 0 ? (
                        <div className="text-center py-8 text-gray-400 dark:text-gray-500 border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-lg">
                            <Package className="h-10 w-10 mx-auto mb-3 opacity-30" />
                            <p className="font-medium text-sm">No items added yet</p>
                            <p className="text-xs mt-1">Select articles from the catalogue.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {items.map((item) => (
                                <div key={item.id} className="group flex items-start space-x-3 p-3 border border-gray-100 dark:border-gray-800 rounded-lg bg-gray-200/50 dark:bg-gray-800/50 hover:shadow-sm transition-all">

                                    {/* Image */}
                                    <div className="h-12 w-12 rounded bg-white border border-gray-200 dark:border-gray-700 flex items-center justify-center overflow-hidden flex-shrink-0">
                                        {item.imageUrl ? (
                                            <img src={item.imageUrl} alt="" className="h-full w-full object-cover" />
                                        ) : (
                                            <Package className="h-5 w-5 text-gray-300" />
                                        )}
                                    </div>

                                    {/* Details */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start">
                                            <p className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate pr-2">
                                                {/* ✅ CHANGED: articleCode -> sku */}
                                                {item.sku}
                                            </p>
                                            <p className="font-medium text-sm text-emerald-600 dark:text-gray-100">
                                                ${item.totalCost.toFixed(2)}
                                            </p>
                                        </div>

                                        {/* ✅ CHANGED: articleDescription -> name */}
                                        <p className="text-xs text-gray-500 truncate mb-1">{item.name}</p>

                                        <div className="flex items-center space-x-2">
                                            <Badge variant={`${darkMode ? 'info' : 'info-soft'}`} className="text-[10px] h-5 px-1.5">
                                                {/* ✅ CHANGED: quantity -> requestQuantity */}
                                                {item.requestQuantity} {item.unit}
                                            </Badge>
                                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400">
                                                x ${item.estimatedCost.toFixed(2)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Delete Button */}
                                    <button
                                        onClick={() => onRemoveItem(item.id)}
                                        className="opacity-0 group-hover:opacity-100 p-1.5 text-red-500 hover:text-white hover:bg-red-500 rounded-md transition-all"
                                        title="Remove item"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* SUBMIT BUTTON AREA */}
            <Button
                onClick={onSubmit}
                className="w-full h-12 text-base shadow-lg shadow-indigo-500/20"
                size="md"
                disabled={items.length === 0 || isLoading} 
            >
                {isLoading ? (
                    <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Sending Request...
                    </>
                ) : (
                    <>
                        <Send className="h-4 w-4 mr-2" />
                        Submit Purchase Request
                    </>
                )}
            </Button>

        </div>
    );
};