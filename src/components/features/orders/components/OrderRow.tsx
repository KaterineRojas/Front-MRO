import React, { useState } from 'react';
import {
    ChevronRight,
    Package,
    Building2,
    Layers,
    FolderKanban,
    UserCheck,
    ImageOff,
    XCircle,
    CheckCheck
} from 'lucide-react';
import { getStatusBadge, getReasonBadge } from '../../inventory/components/RequestBadges';
import { STATUS_MAP, REASON_MAP, formatDate, formatCurrency } from '../utils/purchase-utils';
import { PurchaseRequest } from '../types/purchaseType';
import { useSelector } from 'react-redux';
import { ActionButton } from '../../inventory/components/ActionButton';
import { UnifiedRequest } from '../../requests/types/loanTypes';

interface Props {
    row: UnifiedRequest;
    handleReview: (order: PurchaseRequest, action: 'approve' | 'reject') => void;
}

export const UnifiedOrderRow: React.FC<Props> = ({ row, handleReview }: Props) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const darkMode = useSelector((state: any) => state.ui.darkMode);

    const data = row.originalData;

    //reason: low stock, urgent, new project
    const reasonString = (data.kind === 'Purchase')
        ? (REASON_MAP[data.reason] || 'Standard')
        : 'Standard';

    // status: pending, approved an rejected
    const statusString = (data.kind === 'Purchase')
        ? (STATUS_MAP[data.status] || 'unknown')
        : 'unknown';

    // Approved/rejected by
    let approverDisplay = 'Pending Review';

    if (data.kind === 'Purchase') {
        if (data.approvedByName) approverDisplay = data.approvedByName;
    } else {
        const nameFromNotes = data.notes?.match(/by\s+(\w+)\s+at/)?.[1];

        if (nameFromNotes) {
            approverDisplay = nameFromNotes;
        }
        else if (data.status === 'Approved') {
            approverDisplay = 'Authorized';
        }
    }

    //total cost
    const totalCostDisplay = (data.kind === 'Purchase')
        ? formatCurrency(data.estimatedTotalCost)
        : '--';

    // Optional: Switch color to gray for Loans so it looks like "N/A"
    // instead of "Free Money"
    const totalCostColor = (data.kind === 'Purchase')
        ? 'text-emerald-600 dark:text-emerald-400'
        : 'text-gray-400 dark:text-gray-600';

    // notes
    const rawNotes = ('notes' in data) ? data.notes : null;

    const displayNotes = (data.kind === 'Loan' && rawNotes)
        ? rawNotes.replace(/^\[.*?\]:\s*/, '')
        : rawNotes;

    // rejection reason
    let rejectionDisplay: string | null | undefined = null;

    if (data.kind === 'Purchase') {
        rejectionDisplay = data.rejectionReason;
    } else {
        if (data.status === 'Rejected' && data.notes) {
            rejectionDisplay = data.notes.replace(/^\[.*?\]:\s*/, '');
        }
    }

    // Define who performed the action
    let actionedBy = '';

    if (data.kind === 'Purchase') {
        actionedBy = data.approvedByName || data.rejectedByName || '';
    } else {
        const match = data.notes?.match(/by\s+(\w+)\s+at/);
        actionedBy = match ? match[1] : '';
    }


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
                        className="p-2 hover:bg-gray-200 dark:hover:bg-white/10 rounded transition-colors text-gray-400 dark:text-white"
                    >
                        <ChevronRight className={`w-4 h-4 transition duration-200 ease-out ${isExpanded ? 'rotate-90' : ''} `} />
                    </button>
                </td>
                <td className="p-4 font-mono text-sm font-bold text-blue-600 dark:text-blue-400">
                    {data.requestNumber}
                </td>
                <td className="p-4">
                    {getStatusBadge(statusString, `${darkMode ? '' : 'soft'}`)}
                </td>
                <td className="p-4">
                    <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{data.requesterId}</span>
                        <span className="text-[10px] text-gray-500 uppercase">{data.warehouseName}</span>
                    </div>
                </td>
                <td className="p-4 text-sm font-bold text-right text-emerald-600 dark:text-emerald-400 font-mono">
                    {totalCostDisplay}
                </td>
                <td className="p-4 text-center">
                    {getReasonBadge(reasonString, `${darkMode ? '' : 'soft'}`)}
                </td>
                <td className="p-4 text-sm text-gray-500">
                    {formatDate(data.createdAt)}
                </td>
                <td className="p-4 text-right">
                    {data.status === 0 ? (
                        /* --- PENDING STATE: ACTION BUTTONS --- */
                        <div className="flex justify-end gap-2">
                            <ActionButton
                                icon="approve"
                                variant="success"
                                className="w-8 h-8 p-0 rounded-md"
                                title="Approve Request"
                                onClick={() => handleReview(order, 'approve')}
                            />
                            <ActionButton
                                icon="reject"
                                variant="danger"
                                className="w-8 h-8 p-0 rounded-md"
                                title="Reject Request"
                                onClick={() => handleReview(order, 'reject')}
                            />
                        </div>
                    ) : (
                        <div className="flex flex-col items-end justify-center h-full">
                            <span className={`inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold ${data.status === 1 ? 'text-emerald-400' : 'text-red-500'
                                }`}>
                                {data.status === 1 ? 'Approved' : 'Rejected'}
                                {data.status === 1 ? <CheckCheck className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                            </span>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                by {actionedBy}
                            </span>
                        </div>
                    )}
                </td>
            </tr>

            {/* EXPANDED DRAWER */}
            {isExpanded && (
                <tr className="bg-[#F2F2F4] dark:bg-black/20 shadow-inner">
                    <td colSpan={8} className="p-0 border-b border-gray-100 dark:border-gray-800">
                        <div className="p-6 animate-in fade-in slide-in-from-top-1 duration-200">

                            {/* UPPER STATS CARDS */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                                {/* 1. Project */}
                                <div className="p-4 rounded-xl border  border-blue-500 shadow-sm bg-blue-500/5 dark:border-blue-500/20 dark:shadow-none">
                                    <div className="flex items-center gap-2 mb-2">
                                        <FolderKanban className="w-4 h-4 text-blue-400" />
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-blue-300">Project</p>
                                    </div>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-blue-100 pl-6">
                                        {data.projectId || 'General Inventory'}
                                    </p>
                                </div>

                                {/* 2. Composition */}
                                <div className="p-4 rounded-xl border shadow-sm bg-purple-500/5 border-purple-500/20 dark:shadow-none">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Layers className="w-4 h-4  text-purple-400" />
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-purple-300">Composition</p>
                                    </div>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-purple-100 pl-6">
                                        {data.totalQuantity} Units <span className="font-normal text-purple-700 dark:text-purple-400/60">in {data.totalItems} items</span>
                                    </p>
                                </div>

                                {/* 3. Company */}
                                <div className="p-4 rounded-xl border shadow-sm bg-amber-500/5 border-amber-500/20 dark:shadow-none">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Building2 className="w-4 h-4 text-amber-400" />
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-amber-300">Company</p>
                                    </div>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-amber-100 pl-6">
                                        {data.companyId || 'Unassigned'}
                                    </p>
                                </div>

                                {/* 4. Approval */}
                                <div className="p-4 rounded-xl border shadow-sm bg-emerald-500/5 border-emerald-500/20 dark:shadow-none">
                                    <div className="flex items-center gap-2 mb-2">
                                        <UserCheck className="w-4 h-4 text-gray-400 dark:text-emerald-400" />
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-emerald-300">
                                            Approval
                                        </p>
                                    </div>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-emerald-100 pl-6">
                                        {/* Use the logic variable here */}
                                        {approverDisplay}
                                    </p>
                                </div>
                            </div>

                            {/* NOTES SECTION (Only if notes exist) */}
                            {displayNotes && (
                                <div className="mb-6 p-4 bg-gray-200 dark:bg-yellow-900/10 border border-gray-900/20 dark:border-yellow-900/30 rounded-lg">
                                    <h4 className="text-xs font-bold uppercase text-gray-900 dark:text-yellow-500 mb-1">
                                        Request Notes
                                    </h4>
                                    <p className="text-sm text-gray-700 dark:text-yellow-100/80 font-medium">
                                        {displayNotes}
                                    </p>
                                </div>
                            )}

                            {rejectionDisplay && (
                                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-lg">
                                    <h4 className="text-xs font-bold uppercase text-red-800 dark:text-red-400 mb-1">
                                        Rejection Reason
                                    </h4>
                                    <p className="text-sm text-red-700 dark:text-red-200/90">
                                        {rejectionDisplay}
                                    </p>
                                </div>
                            )}

                            {/* ITEMS GRID SECTION */}
                            <div className="flex items-center gap-2 mb-4 pl-1">
                                <Package className="h-4 w-4 text-gray-400" />
                                <h4 className="text-xs font-bold uppercase tracking-widest text-gray-500">
                                    Included Items ({data.items?.length || 0})
                                </h4>
                            </div>

                            {(!data.items || data.items.length === 0) ? (
                                <div className="text-center py-6 border border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
                                    <p className="text-sm text-gray-400">No items found in this request.</p>
                                </div>
                            ) : (
                                /* COLUMN GRID */
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {data.items.map((item) => {
                                        const displayQty = 'quantity' in item ? item.quantity : item.quantityRequested;

                                        return (
                                            <div
                                                key={item.id}
                                                className="group flex gap-4 p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#131A27] hover:shadow-md transition-all"
                                            >
                                                {/* Image Container */}
                                                <div className="relative w-16 h-16 shrink-0 bg-gray-100 dark:bg-gray-700 rounded-md overflow-hidden flex items-center justify-center">
                                                    {item.imageUrl ? (
                                                        <img
                                                            src={item.imageUrl}
                                                            alt={item.name}
                                                            className="w-full h-full object-cover"
                                                            onError={(e) => {
                                                                (e.target as HTMLImageElement).style.display = 'none';
                                                                (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                                                            }}
                                                        />
                                                    ) : null}
                                                    {/* Fallback Icon */}
                                                    <ImageOff className={`w-6 h-6 text-gray-400 ${item.imageUrl ? 'hidden' : ''}`} />
                                                </div>

                                                {/* Item Details */}
                                                <div className="flex-1 min-w-0 flex flex-col justify-center">
                                                    <div className="flex justify-between items-start">
                                                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate pr-2" title={item.name}>
                                                            {item.name}
                                                        </p>
                                                    </div>

                                                    <p className="text-xs font-mono text-gray-500 dark:text-gray-400 mb-1">
                                                        {item.sku}
                                                    </p>

                                                    <div className="flex items-center gap-2 mt-auto">
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                                                            Qty: {displayQty}
                                                        </span>

                                                        {item.description && (
                                                            <span className="text-[10px] text-gray-400 truncate max-w-[120px]" title={item.description}>
                                                                {item.description}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                        </div>
                    </td>
                </tr>
            )}
        </>
    );
};