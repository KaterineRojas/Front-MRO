import React, { useState, useMemo } from 'react';
import { Package, Search, Plus } from 'lucide-react';
import { Button } from '../../inventory/components/Button';
import { Badge } from '../../inventory/components/Badge';
import { useSelector } from 'react-redux';
import { Item } from '../types/purchaseType';
import { getCategoryVariant } from '../utils/purchase-utils'

interface ArticleSelectorProps {
    items: Item[];
    onAddItem: (item: Item, quantity: number, estimatedCost: number, purchaseUrl: string) => void;
}

export const ArticleSelector: React.FC<ArticleSelectorProps> = ({
    items,
    onAddItem
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
    const darkMode = useSelector((state: any) => state.ui.darkMode);

    const [formState, setFormState] = useState({
        quantity: '',
        estimatedCost: '',
        purchaseUrl: ''
    });

    const filteredItems = useMemo(() => {
        if (!searchTerm) return items;
        const lowerTerm = searchTerm.toLowerCase();
        return items.filter(item =>
            item.sku.toLowerCase().includes(lowerTerm) ||
            item.name.toLowerCase().includes(lowerTerm)
        );
    }, [searchTerm, items]);

    const selectedItem = items.find(i => i.id === selectedItemId);

    const handleSelectItem = (item: Item) => {
        setSelectedItemId(item.id);
        setFormState({ quantity: '', estimatedCost: '', purchaseUrl: '' });
    };

    const handleSubmit = () => {
        if (!selectedItem || !formState.quantity || !formState.estimatedCost) return;

        onAddItem(
            selectedItem,
            parseInt(formState.quantity),
            parseFloat(formState.estimatedCost),
            formState.purchaseUrl
        );

        setSelectedItemId(null);
        setFormState({ quantity: '', estimatedCost: '', purchaseUrl: '' });
    };

    const inputClass = "flex h-9 w-full rounded-md border border-gray-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus:outline-none focus:ring-1 focus:ring-gray-900 dark:border-gray-800 dark:focus:ring-gray-300";

    return (
        <div className="rounded-xl border border-gray-200 bg-white text-gray-950 shadow-sm dark:border-gray-800 dark:bg-transparent dark:text-gray-50 flex flex-col h-full">
            <div className="p-6 pb-4 border-b border-gray-100 dark:border-gray-800">
                <h3 className="font-semibold text-lg flex items-center">
                    <Package className="h-5 w-5 mr-2 text-indigo-600" /> Inventory Catalogue
                </h3>
            </div>

            <div className="p-6 space-y-6">
                <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <input type="text" placeholder="Search SKU, Name..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className={`${inputClass} pl-9`} />
                </div>

                <div className="mt-4 border rounded-md bg-white dark:bg-transparent dark:border-gray-800 h-[240px] overflow-y-auto">
                    {filteredItems.map((item) => (
                        <div key={item.id} onClick={() => handleSelectItem(item)} className={`flex items-start gap-3 p-3 cursor-pointer border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-[#191f26] ${selectedItemId === item.id ? 'bg-indigo-50 dark:bg-[#1F2937]' : ''}`}>
                            <div className="h-10 w-10 rounded bg-gray-100 flex items-center justify-center overflow-hidden">
                                {item.imageUrl ? <img src={item.imageUrl} className="h-full w-full object-cover" /> : <Package className="h-5 w-5 text-gray-400" />}
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between">
                                    <span className="font-semibold text-sm">{item.name}</span>
                                    <Badge variant={getCategoryVariant(item.category, darkMode)} className="text-[10px]">{item.category}</Badge>
                                </div>
                                <span className="text-xs text-gray-500 font-mono">{item.sku}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {selectedItem && (
                    <div className="pt-4 border-t border-gray-100 dark:border-gray-800 animate-in fade-in slide-in-from-top-2">
                        <h4 className="font-medium text-sm mb-3">Add details for <span className="text-indigo-600">{selectedItem.name}</span></h4>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="text-xs font-medium mb-1 block">Quantity ({selectedItem.unit})*</label>
                                <input type="number" min="1" className={inputClass} value={formState.quantity} onChange={(e) => setFormState({ ...formState, quantity: e.target.value })} />
                            </div>
                            <div>
                                <label className="text-xs font-medium mb-1 block">Est. Cost*</label>
                                <input type="number" step="0.01" className={inputClass} value={formState.estimatedCost} onChange={(e) => setFormState({ ...formState, estimatedCost: e.target.value })} />
                            </div>
                        </div>
                        <div className="mb-4">
                            <label className="text-xs font-medium mb-1 block">Link (Optional)</label>
                            <input type="text" className={inputClass} placeholder="https://..." value={formState.purchaseUrl} onChange={(e) => setFormState({ ...formState, purchaseUrl: e.target.value })} />
                        </div>
                        <Button variant="primary" className="w-full" onClick={handleSubmit} disabled={!formState.quantity || !formState.estimatedCost}>
                            <Plus className="h-4 w-4 mr-2" /> Add to Request
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};