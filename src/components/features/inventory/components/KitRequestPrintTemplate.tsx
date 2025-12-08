import React from 'react';
import { KitItem, Kit } from '../types'; // Import your types

interface PrintTemplateProps {
    kit: Kit; // Replace with your Kit Type
    articles: any[]; // Replace with your Article Type
    quantity: number;
}

// We use forwardRef so the parent can trigger the print on this specific DOM element
export const KitRequestPrintTemplate = React.forwardRef<HTMLDivElement, PrintTemplateProps>(
    ({ kit, articles, quantity }, ref) => {

        const today = new Date().toLocaleDateString();

        return (
            <div ref={ref} className="p-8 bg-white text-black print-container">

                {/* 1. PRINT HEADER */}
                <div className="mb-8 border-b pb-4">
                    <div className="flex justify-between items-end">
                        <div>
                            <h1 className="text-2xl font-bold uppercase tracking-wider">Material Request Form</h1>
                            <p className="text-sm text-gray-500 mt-1">Request ID: #{kit.id} | SKU: {kit.sku}</p>
                        </div>
                        <div className="text-right">
                            <h2 className="text-xl font-semibold text-gray-800">{kit.name}</h2>
                            <p className="text-sm text-gray-500">Requested Qty: {quantity}</p>
                        </div>
                    </div>
                </div>

                {/* 2. THE TABLE (Styled specifically for high contrast printing) */}
                <table className="w-full text-sm border-collapse mb-8">
                    <thead>
                        <tr className="border-b-2 border-black">
                            <th className="py-2 text-left font-bold uppercase text-xs">Item</th>
                            <th className="py-2 text-center font-bold uppercase text-xs">Bin Location</th>
                            <th className="py-2 text-center font-bold uppercase text-xs">Qty Needed</th>
                            <th className="py-2 text-right font-bold uppercase text-xs">Stock Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {kit.items.map((item: KitItem, idx: number) => {
                            const articleInInventory = articles.find(a => a.id === item.articleId);
                            const currentStock = articleInInventory?.quantityAvailable ?? 0;
                            const required = item.quantity * quantity;
                            const hasStock = currentStock >= required;

                            return (
                                <tr key={idx} className="border-b border-gray-300">
                                    <td className="py-3 pr-2">
                                        <span className="font-semibold block">{item.articleName}</span>
                                        <span className="text-xs text-gray-500">{item.articleSku}</span>
                                    </td>
                                    <td className="py-3 text-center text-gray-600 font-mono">
                                        {kit.binCode || 'N/A'}
                                    </td>
                                    <td className="py-3 text-center font-bold">
                                        {required}
                                    </td>
                                    <td className="py-3 text-right">
                                        {hasStock ? (
                                            <span className="flex items-center justify-end text-green-700 font-medium">
                                                ✓ Available ({currentStock})
                                            </span>
                                        ) : (
                                            <span className="flex items-center justify-end text-red-700 font-bold">
                                                ⚠ Low Stock ({currentStock})
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>

                {/* 3. FOOTER & SIGNATURES */}
                <div className="mt-12 pt-8 border-t-2 border-gray-100">
                    <div className="grid grid-cols-2 gap-12">

                        {/* Requested By */}
                        <div>
                            <p className="text-xs font-bold uppercase text-gray-500 mb-8">Requested By:</p>
                            <div className="border-t border-black w-3/4"></div>
                            <p className="mt-2 text-sm">Signature</p>
                            <p className="text-xs text-gray-500 mt-1">Date: {today}</p>
                        </div>

                        {/* Approved By */}
                        <div>
                            <p className="text-xs font-bold uppercase text-gray-500 mb-8">Approved By:</p>
                            <div className="border-t border-black w-3/4"></div>
                            <p className="mt-2 text-sm">Manager Signature</p>
                            <p className="text-xs text-gray-500 mt-1">Date: ______________</p>
                        </div>

                    </div>

                    <div className="mt-8 text-center text-[10px] text-gray-400">
                        System generated document. Internal use only.
                    </div>
                </div>

            </div>
        );
    }
);