import React, { useState } from 'react';
import {
    ChevronRight,
    ChevronDown,
    Package,
    Check,
    X,
    Building2,   // Added icon for Supplier
    Layers,      // Added icon for Items
    FolderKanban, // Added icon for Project
    UserCheck,    // Added icon for Approver

} from 'lucide-react';
import { getStatusBadge, getUrgencyBadge } from '../../inventory/components/RequestBadges';
import { STATUS_MAP, PRIORITY_MAP, formatDate, formatCurrency } from '../utils/purchase-utils';
import { PurchaseRequest } from '../types/purchaseType';
import { useSelector } from 'react-redux';
import { ActionButton } from '../../inventory/components/ActionButton'


interface Props {
    order: PurchaseRequest;
    handleStatusUpdate: (id: number, status: number) => void;
}

export const OrderRow: React.FC<Props> = ({ order, handleStatusUpdate }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const statusString = STATUS_MAP[order.status] || 'unknown';
    const priorityString = PRIORITY_MAP[order.priority] || 'low';
    const darkMode = useSelector((state: any) => state.ui.darkMode);

    return (
        <>
            {/* MAIN DATA ROW */}
            <tr className={`
                group transition-colors border-b border-gray-100 hover:bg-[#F5F5F7] dark:hover:bg-[#191F26] dark:border-gray-800
                ${isExpanded ? 'hover:bg-white dark:hover:bg-[#1F2937] dark:bg-[#1F2937]' : ' dark:hover:bg-white/[0.02]'}
            `}>
                <td className="p-4">
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="p-2 hover:bg-gray-200 dark:hover:bg-white] rounded transition-colors text-gray-400 dark:text-white dark:hover:text-[#191c31]"
                    >
                        <ChevronRight className={`w-4 h-4 transition duration-200 ease-out ${isExpanded ? 'rotate-90' : ''} `} />
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
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{order.requesterName}</span>
                        <span className="text-[10px] text-gray-500 uppercase">{order.warehouseName}</span>
                    </div>
                </td>
                <td className="p-4 text-sm font-bold text-right text-emerald-600 dark:text-emerald-400 font-mono">
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
                        {/* APPROVE: Green Outline, fills on hover */}
                        <ActionButton
                            icon="approve"
                            variant="success" // Border-green, Text-green
                            className="w-8 h-8 p-0 rounded-md" // Force square shape
                            title="Approve Request" // Tooltip behavior
                            onClick={() => console.log('Purchase Approved successfully')}
                        />

                        {/* REJECT: Red Outline, fills on hover */}
                        <ActionButton
                            icon='reject'
                            variant="danger" // Border-red, Text-red
                            className="w-8 h-8 p-0 rounded-md"
                            title="Reject Request"
                            onClick={() => console.log('Purchase Reject')}
                        />
                    </div>
                </td>
            </tr>

            {/* EXPANDED DRAWER */}
            {isExpanded && (
                <tr className="bg-[#F2F2F4] dark:bg-black/20 shadow-inner">
                    <td colSpan={8} className="p-0 border-b border-gray-100 dark:border-gray-800">
                        <div className="p-6 animate-in fade-in slide-in-from-top-1 duration-200">

                            {/* COLORFUL CARDS GRID */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">

                                {/* 1. PROJECT (Blue Theme) */}
                                <div className="p-4 rounded-xl border transition-all
                                    bg-white border-gray-200 shadow-sm 
                                    dark:bg-blue-500/5 dark:border-blue-500/20 dark:shadow-none">
                                    <div className="flex items-center gap-2 mb-2">
                                        <FolderKanban className="w-4 h-4 text-gray-400 dark:text-blue-400" />
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-blue-300">Project</p>
                                    </div>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-blue-100 pl-6">
                                        {order.projectName || 'General Inventory'}
                                    </p>
                                </div>

                                {/* 2. ITEMS (Purple Theme) */}
                                <div className="p-4 rounded-xl border transition-all
                                    bg-white border-gray-200 shadow-sm 
                                    dark:bg-purple-500/5 dark:border-purple-500/20 dark:shadow-none">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Layers className="w-4 h-4 text-gray-400 dark:text-purple-400" />
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-purple-300">Composition</p>
                                    </div>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-purple-100 pl-6">
                                        {order.totalItems} lines <span className="text-gray-400 dark:text-purple-400/50">|</span> {order.totalQuantity} units
                                    </p>
                                </div>

                                {/* 3. SUPPLIER (Amber/Orange Theme) */}
                                <div className="p-4 rounded-xl border transition-all
                                    bg-white border-gray-200 shadow-sm 
                                    dark:bg-amber-500/5 dark:border-amber-500/20 dark:shadow-none">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Building2 className="w-4 h-4 text-gray-400 dark:text-amber-400" />
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-amber-300">Supplier</p>
                                    </div>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-amber-100 pl-6">
                                        {order.supplier || 'Unassigned'}
                                    </p>
                                </div>

                                {/* 4. APPROVED BY (Emerald Theme) */}
                                <div className="p-4 rounded-xl border transition-all
                                    bg-white border-gray-200 shadow-sm 
                                    dark:bg-emerald-500/5 dark:border-emerald-500/20 dark:shadow-none">
                                    <div className="flex items-center gap-2 mb-2">
                                        <UserCheck className="w-4 h-4 text-gray-400 dark:text-emerald-400" />
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-emerald-300">Approval</p>
                                    </div>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-emerald-100 pl-6">
                                        {order.approvedByName || 'Pending Review'}
                                    </p>
                                </div>

                            </div>

                            {/* DETAIL SECTION HEADER */}
                            <div className="flex items-center gap-2 mb-4 pl-1">
                                <Package className="h-4 w-4 text-gray-400" />
                                <h4 className="text-xs font-bold uppercase tracking-widest text-gray-500">
                                    Request Line Items
                                </h4>
                            </div>

                            {/* PLACEHOLDER FOR ITEMS TABLE */}
                            <div className="text-center py-10 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl bg-gray-50/50 dark:bg-transparent">
                                <p className="text-sm text-gray-500">
                                    Full line item details would be rendered here.
                                </p>
                            </div>
                        </div>
                    </td>
                </tr>
            )}
        </>
    );
};



/**
 * hover row #F5F5F7
 * bg expanded row #F2F2F4
 * 
 * darkmode hover row #191F26
 * darkmode actived extended row #1F2937 
 */