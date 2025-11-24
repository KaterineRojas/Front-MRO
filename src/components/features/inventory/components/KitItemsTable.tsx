import React from 'react';
import { Package } from 'lucide-react';

interface Article {
    sku: string;
    imageUrl?: string;
}

interface KitItem {
    articleSku: string;
    articleName: string;
    articleDescription?: string;
    quantity: number;
    imageUrl?: string;
}

interface KitItemsTableProps {
    items: KitItem[];
    articles: Article[];
    assemblyQuantity?: number;
}

export const KitItemsTable: React.FC<KitItemsTableProps> = ({
    items,
    articles = [],
    assemblyQuantity = 1,
}) => {
    return (
        <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0A0A0A] overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    {/* HEADER */}
                    <thead className="bg-gray-50 dark:bg-[#0A0A0A] border-b border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 uppercase text-xs font-medium">
                        <tr>
                            <th className="px-4 py-3 w-20">Image</th>
                            <th className="px-4 py-3">SKU</th>
                            <th className="px-4 py-3">Name & Description</th>
                            <th className="px-4 py-3 text-center">Qty / Kit</th>

                            <th className={`px-4 py-3 text-center ${assemblyQuantity > 1 ? 'bg-indigo-50/50 dark:bg-indigo-900/10' : ''}`}>
                                <div className="flex flex-col items-center">
                                    <span className={assemblyQuantity > 1 ? 'text-indigo-700 dark:text-indigo-300 font-semibold' : ''}>
                                        Total Qty
                                    </span>
                                    {assemblyQuantity > 1 && (
                                        <span className="text-[10px] normal-case text-indigo-500/80 dark:text-indigo-400/60 font-medium">
                                            (for {assemblyQuantity} kits)
                                        </span>
                                    )}
                                </div>
                            </th>
                        </tr>
                    </thead>

                    {/* BODY */}
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {items.map((item, index) => {
                            const article = articles.find((a) => a.sku === item.articleSku);
                            const imageSrc = article?.imageUrl || item.imageUrl;
                            const totalQty = item.quantity * assemblyQuantity;

                            return (
                                <tr key={`${item.articleSku}-${index}`}>

                                    {/* 1. IMAGEN */}
                                    <td className="px-4 py-3">
                                        {imageSrc ? (
                                            <img
                                                src={imageSrc}
                                                alt={item.articleName}
                                                className="w-10 h-10 object-cover rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50"
                                            />
                                        ) : (
                                            <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-md flex items-center justify-center border border-gray-200 dark:border-gray-700">
                                                <Package className="h-5 w-5 text-gray-400" />
                                            </div>
                                        )}
                                    </td>

                                    <td className="px-4 py-3 font-mono text-xs text-gray-500 dark:text-gray-400">
                                        {item.articleSku}
                                    </td>

                                    {/* 3. INFO */}
                                    <td className="px-4 py-3">
                                        <div className="flex flex-col max-w-[200px] sm:max-w-xs">
                                            <span className="font-medium text-gray-900 dark:text-gray-200 text-sm truncate" title={item.articleName}>
                                                {item.articleName}
                                            </span>
                                            {item.articleDescription && (
                                                <span className="text-xs text-gray-500 truncate" title={item.articleDescription}>
                                                    {item.articleDescription}
                                                </span>
                                            )}
                                        </div>
                                    </td>

                                    {/* 4. QTY UNITARIA */}
                                    <td className="px-4 py-3 text-center">
                                        <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                                            x{item.quantity}
                                        </span>
                                    </td>

                                    {/* 5. QTY TOTAL */}
                                    <td className={`px-4 py-3 text-center ${assemblyQuantity > 1 ? 'bg-indigo-50/30 dark:bg-indigo-900/10' : ''}`}>
                                        <span className={`
                                            inline-flex items-center justify-center px-3 py-1 rounded-md text-xs font-bold shadow-sm
                                            ${assemblyQuantity > 1
                                                ? 'bg-indigo-600 text-white dark:bg-indigo-500 dark:text-white'
                                                : 'bg-gray-100 text-gray-500 dark:bg-gray-900 dark:text-white'
                                            }
                                        `}>
                                            {totalQty}
                                        </span>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};  