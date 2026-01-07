import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, DollarSign, User, Ban, Info } from 'lucide-react';
import { PurchaseRequest } from '../types/purchaseType';
import { formatCurrency, formatDate } from '../utils/purchase-utils';

type ReviewAction = 'approve' | 'reject';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (action: ReviewAction, notes: string) => void;
    order: PurchaseRequest | null;
    initialAction: ReviewAction;
    isProcessing?: boolean;
}

export const ReviewRequestModal: React.FC<Props> = ({
    isOpen,
    onClose,
    onConfirm,
    order,
    initialAction,
    isProcessing = false
}) => {
    const [notes, setNotes] = useState('');
    const [action, setAction] = useState<ReviewAction>(initialAction);

    useEffect(() => {
        if (isOpen) {
            setNotes('');
            setAction(initialAction);
        }
    }, [isOpen, initialAction]);

    if (!isOpen || !order) return null;

    const isApprove = action === 'approve';

    // Theme Config
    const theme = isApprove ? {
        color: 'text-emerald-600',
        darkColor: 'dark:text-emerald-400',
        bg: 'bg-emerald-100',
        darkBg: 'dark:bg-emerald-900/30',
        btnBg: 'bg-emerald-600 hover:bg-emerald-700',
        icon: CheckCircle2,
        title: 'Confirm Approval',
        description: 'You are about to approve this purchase request.'
    } : {
        color: 'text-red-600',
        darkColor: 'dark:text-red-400',
        bg: 'bg-red-100',
        darkBg: 'dark:bg-red-900/30',
        btnBg: 'bg-red-600 hover:bg-red-700',
        icon: Ban,
        title: 'Reject Request',
        description: 'This action will cancel the request. A reason is required.'
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={onClose}
        >
            <div
                className="w-full max-w-lg bg-white dark:bg-[#030712] rounded-xl shadow-2xl border border-gray-100 dark:border-gray-700 m-4 overflow-hidden"
                onClick={e => e.stopPropagation()}
            >

                {/* HEADER */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${theme.bg} ${theme.color} ${theme.darkBg} ${theme.darkColor}`}>
                            <theme.icon className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{theme.title}</h3>
                            <p className="text-sm text-gray-500">{theme.description}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* BODY */}
                <div className="p-6 space-y-6">

                    {/* Common Summary Card */}
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-100 dark:border-gray-700">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-mono text-gray-500">{order.requestNumber}</span>
                            <span className="text-xs text-gray-400">{formatDate(order.createdAt)}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Amount</p>
                                <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold text-lg">
                                    <DollarSign className="w-4 h-4" />
                                    {formatCurrency(order.estimatedTotalCost).replace('$', '')}
                                </div>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Requested By</p>
                                <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 font-medium">
                                    <User className="w-4 h-4 text-gray-400" />
                                    <span className="truncate">{order.requesterId}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* DYNAMIC CONTENT AREA */}
                    {isApprove ? (
                        // APPROVAL VIEW: Just a confirmation message
                        <div className="flex gap-3 p-4 bg-blue-50 dark:bg-blue-900/10 text-blue-800 dark:text-blue-200 rounded-lg text-sm border border-blue-100 dark:border-blue-900/20">
                            <Info className="w-5 h-5 shrink-0" />
                            <p>
                                By clicking confirm, the request status will change to <strong>Approved</strong> and the warehouse will be notified to proceed with the purchase order.
                            </p>
                        </div>
                    ) : (
                        // REJECTION VIEW: Required Reason Input
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                Reason for Rejection <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                rows={3}
                                autoFocus
                                className="w-full rounded-lg border border-red-200 dark:border-red-900/50 bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all resize-none text-sm p-3 placeholder-gray-400"
                                placeholder="E.g., Budget exceeded, Item in stock, Duplicate request..."
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                            />
                            <p className="text-xs text-gray-500 mt-2 text-right">
                                {notes.length}/200 characters
                            </p>
                        </div>
                    )}
                </div>

                {/* FOOTER */}
                <div className="p-6 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3 bg-gray-50/50 dark:bg-gray-800/30">
                    <button
                        onClick={onClose}
                        disabled={isProcessing}
                        className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={() => onConfirm(action, notes)}
                        // Logic: Disable if processing OR (it is rejection AND notes are empty)
                        disabled={isProcessing || (!isApprove && !notes.trim())}
                        className={`
                            px-4 py-2 text-sm font-medium text-white rounded-lg shadow-sm transition-all flex items-center gap-2 
                            disabled:opacity-50 disabled:cursor-not-allowed ${theme.btnBg}
                        `}
                    >
                        {isProcessing ? 'Processing...' : (
                            <>
                                <theme.icon className="w-4 h-4" />
                                Confirm {isApprove ? 'Approval' : 'Rejection'}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};