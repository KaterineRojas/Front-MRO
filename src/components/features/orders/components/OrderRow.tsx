import React, { useState } from 'react';
import {
    ChevronRight,
    ChevronDown,
    Package,
    Check,
    X,
    ExternalLink
} from 'lucide-react';
import { Badge } from '../../inventory/components/Badge';
import { getStatusBadge, getUrgencyBadge } from '../../inventory/components/RequestBadges';
import { STATUS_MAP, PRIORITY_MAP, formatDate, formatCurrency } from '../utils/purchase-utils';
import { PurchaseRequest } from '../types/purchase';
import { useSelector } from 'react-redux';


// We use PurchaseRequest as the primary data interface based on your backend JSON
interface Props {
    order: PurchaseRequest; 
    handleStatusUpdate: (id: number, status: number) => void;
}

export const OrderRow: React.FC<Props> = ({ order, handleStatusUpdate }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    // Map backend integers to string keys for your Badge Helpers
    const statusString = STATUS_MAP[order.status] || 'unknown';
    const priorityString = PRIORITY_MAP[order.priority] || 'low';
    const darkMode = useSelector((state: any) => state.ui.darkMode);


    return (
        <>
            {/* MAIN DATA ROW */}
            <tr className="group hover:bg-gray-50/80 dark:hover:bg-white/[0.02] transition-colors border-b border-gray-100 dark:border-gray-800">
                <td className="p-4">
                    <button 
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                    >
                        {isExpanded ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
                    </button>
                </td>
                <td className="p-4 font-mono text-sm font-bold text-blue-600 dark:text-blue-400">
                    {order.requestNumber}
                </td>
                <td className="p-4">
                    {getStatusBadge(statusString, `${darkMode ? '' : 'soft'}`)}
                </td>
                <td className="p-4">
                    <div className="flex flex-col">
                        <span className="text-sm font-medium dark:text-gray-200">{order.requesterName}</span>
                        <span className="text-[10px] text-gray-500 uppercase">{order.warehouseName}</span>
                    </div>
                </td>
                <td className="p-4 text-sm font-bold text-right dark:text-white font-mono">
                    {formatCurrency(order.totalAmount)}
                </td>
                <td className="p-4">
                    {getUrgencyBadge(priorityString, `${darkMode ? '' : 'soft'}`)}
                </td>
                <td className="p-4 text-sm text-gray-500">
                    {formatDate(order.createdAt)}
                </td>
                <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                        {/* Actions only for Pending status (0) */}
                        {order.status === 0 && (
                            <>
                                <button 
                                    onClick={() => handleStatusUpdate(order.id, 1)} // 1 = Approved
                                    className="p-2 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-lg transition-colors border border-transparent hover:border-emerald-200"
                                    title="Approve"
                                >
                                    <Check className="w-4 h-4" />
                                </button>
                                <button 
                                    onClick={() => handleStatusUpdate(order.id, 2)} // 2 = Rejected
                                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors border border-transparent hover:border-red-200"
                                    title="Reject"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </>
                        )}
                    </div>
                </td>
            </tr>

            {/* EXPANDED DRAWER */}
            {isExpanded && (
                <tr className="bg-gray-50/50 dark:bg-black/40">
                    <td colSpan={8} className="p-0 border-b border-gray-100 dark:border-gray-800">
                        <div className="p-6 animate-in fade-in slide-in-from-top-2 duration-200">
                            
                            {/* Summary Grid for Backend Data */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                                <div className="p-3 rounded-lg bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase">Project</p>
                                    <p className="text-sm font-medium dark:text-gray-200">{order.projectName || 'N/A'}</p>
                                </div>
                                <div className="p-3 rounded-lg bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase">Items / Qty</p>
                                    <p className="text-sm font-medium dark:text-gray-200">{order.totalItems} lines / {order.totalQuantity} units</p>
                                </div>
                                <div className="p-3 rounded-lg bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase">Supplier</p>
                                    <p className="text-sm font-medium dark:text-gray-200">{order.supplier || 'Not assigned'}</p>
                                </div>
                                <div className="p-3 rounded-lg bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase">Approved By</p>
                                    <p className="text-sm font-medium dark:text-gray-200">{order.approvedByName || '---'}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 mb-4">
                                <Package className="h-4 w-4 text-gray-400" />
                                <h4 className="text-xs font-bold uppercase tracking-widest text-gray-500">
                                    Request Details
                                </h4>
                            </div>

                            <div className="text-center py-10 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl">
                                <p className="text-sm text-gray-500">
                                    Line item details are typically fetched via a separate API call using ID: {order.id}
                                </p>
                            </div>
                        </div>
                    </td>
                </tr>
            )}
        </>
    );
};