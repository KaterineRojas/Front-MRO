import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../../ui/dialog';
import { Button } from '../../../ui/button';
import { Input } from '../../../ui/input';
import { Package, CheckCircle, Loader2 } from 'lucide-react';

interface Item {
    id: number;
    itemId: number;
    sku?: string;
    articleCode?: string;
    name?: string;
    articleDescription?: string;
    quantity: number;
    unit?: string;
    imageUrl?: string;
}

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    order: any | null;
    onConfirm: (receivedQuantities: Record<number, number>) => Promise<void> | void;
}

export const ReceivedItemsModal: React.FC<Props> = ({ open, onOpenChange, order, onConfirm }) => {
    const [receivedQuantities, setReceivedQuantities] = useState<Record<number, number>>({});
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (order && order.items) {
            console.log('📦 Modal opened with order items:', order.items);
            // Inicializar con las cantidades originales usando itemId
            const initialQuantities: Record<number, number> = {};
            order.items.forEach((item: Item) => {
                console.log(`📦 Initializing item ${item.itemId} with quantity ${item.quantity}`);
                initialQuantities[item.itemId] = item.quantity;
            });
            console.log('📦 Initial quantities set:', initialQuantities);
            setReceivedQuantities(initialQuantities);
        }
    }, [order]);

    const handleQuantityChange = (itemId: number, value: string) => {
        const qty = parseInt(value, 10);
        if (!isNaN(qty) && qty >= 0) {
            console.log(`📦 Item ${itemId} quantity changed to ${qty}`);
            setReceivedQuantities(prev => ({
                ...prev,
                [itemId]: qty
            }));
        }
    };

    const handleConfirm = async () => {
        console.log('📦 Confirming received items with quantities:', receivedQuantities);
        console.log('📦 Total items to confirm:', Object.entries(receivedQuantities).length);
        setIsLoading(true);
        try {
            await onConfirm(receivedQuantities);
            console.log('✅ Received items confirmed successfully');
        } catch (error) {
            console.error('❌ Error confirming received items:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-xl flex items-center gap-2">
                        <Package className="h-5 w-5 text-emerald-600" />
                        Received Items
                    </DialogTitle>
                    <DialogDescription>
                        {order && (
                            <span className="text-base">
                                Enter the received quantity for each item in <strong>{order.requestNumber}</strong>
                            </span>
                        )}
                    </DialogDescription>
                </DialogHeader>

                {order && order.items && order.items.length > 0 ? (
                    <div className="space-y-4">
                        {order.items.map((item: Item, index: number) => (
                            <div key={item.itemId || index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                                <div className="flex gap-4 items-start">
                                    {/* Item Image */}
                                    <div className="flex-shrink-0">
                                        {item.imageUrl ? (
                                            <img
                                                src={item.imageUrl}
                                                alt={item.name || item.articleDescription}
                                                className="w-16 h-16 object-cover rounded-md bg-gray-200 dark:bg-gray-700"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/64?text=No+Image';
                                                }}
                                            />
                                        ) : (
                                            <div className="w-16 h-16 flex items-center justify-center bg-gray-200 dark:bg-gray-700 rounded-md">
                                                <Package className="w-8 h-8 text-gray-400" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Item Details */}
                                    <div className="flex-1">
                                        <div className="mb-2">
                                            <span className="inline-block text-[10px] font-bold uppercase tracking-wider bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">
                                                {item.sku || item.articleCode || 'N/A'}
                                            </span>
                                        </div>
                                        <p className="font-semibold text-gray-900 dark:text-white mb-1">
                                            {item.name || item.articleDescription || 'N/A'}
                                        </p>
                                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                                            Original quantity: {item.quantity} {item.unit || 'units'}
                                        </p>

                                        {/* Input for Received Quantity */}
                                        <div className="flex items-center gap-2">
                                            <label htmlFor={`qty-${item.itemId}`} className="text-sm font-medium text-gray-700 dark:text-gray-300 min-w-fit">
                                                Received:
                                            </label>
                                            <Input
                                                id={`qty-${item.itemId}`}
                                                type="number"
                                                min="0"
                                                max={item.quantity}
                                                value={receivedQuantities[item.itemId] ?? item.quantity}
                                                onChange={(e) => handleQuantityChange(item.itemId, e.target.value)}
                                                className="w-24 h-9"
                                                disabled={isLoading}
                                            />
                                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                                {item.unit || 'units'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-gray-500">
                        No items to receive
                    </div>
                )}

                {isLoading && (
                    <div className="flex flex-col items-center justify-center py-4 gap-2">
                        <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
                        <p className="text-sm text-gray-600 dark:text-gray-400">Processing received items...</p>
                    </div>
                )}

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} className="text-black cursor-pointer" disabled={isLoading}>
                        Cancel
                    </Button>
                    <Button onClick={handleConfirm} className="bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer" disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            <>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Confirm 
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default ReceivedItemsModal;
