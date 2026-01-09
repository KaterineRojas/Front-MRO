import React from 'react';
import { ShoppingCart, SearchX, Inbox, CheckCheck, XCircle } from 'lucide-react';
import { UnifiedOrderRow } from './OrderRow';
import { ActivePurchaseTableProps } from '../types/purchaseType';



export const OrderTable: React.FC<ActivePurchaseTableProps> = ({
    statusFilter,
    activeTab,
    onReview,
    requests,
}) => {

    const getActiveTabIcon = () => {
        switch (activeTab) {
            case 'pending':
                return <ShoppingCart className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            case 'approved':
                return <CheckCheck className="w-5 h-5 text-green-600 dark:text-green-400" />
            case 'rejected':
                return <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            default:
                return null;
        }
    }

    const getActiveTabBg = () => {
        switch (activeTab) {
            case 'pending':
                return 'bg-blue-500/10 dark:bg-blue-500/20';
            case 'approved':
                return 'bg-green-500/10 dark:bg-green-500/20';
            case 'rejected':
                return 'bg-red-500/10 dark:bg-red-500/20';
            default:
                return 'bg-gray-100 dark:bg-gray-800';
        }
    }



    return (
        <div className="w-full bg-white dark:bg-[#0A1016] rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
            {/* TOOLBAR HEADER */}
            <div className="flex flex-col md:flex-row md:items-center justify-between p-4 gap-4 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${getActiveTabBg()}`}>
                        {getActiveTabIcon()}
                    </div>
                    <h2 className="text-base font-bold text-gray-900 dark:text-white capitalize">
                        {activeTab + ' Requests'}
                        <span className="ml-2 text-sm font-medium text-gray-400">({requests.length})</span>
                    </h2>
                </div>
            </div>

            {/* RESPONSIVE TABLE CONTAINER */}
            <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full border-collapse text-left min-w-[900px]">
                    <thead>
                        <tr className="bg-gray-50/50 dark:bg-gray-900/30 border-b border-gray-100 dark:border-gray-800">
                            <th className="p-4 w-12"></th>
                            <th className="p-4 text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Request #</th>
                            <th className="p-4 text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Status</th>
                            <th className="p-4 text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Requester</th>
                            <th className="p-4 text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 text-right">Total Value</th>
                            <th className="p-4 text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 text-center">Reason / Type</th>
                            <th className="p-4 text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Created At</th>
                            <th className="p-4 text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {requests.length ? (
                            requests.map((item, index) => (
                                <UnifiedOrderRow key={`${item.id}-${index}`} row={item} handleReview={onReview} />
                            ))
                        ) : (
                            <tr>
                                <td colSpan={8} className="py-16 text-center">
                                    <div className="flex flex-col items-center justify-center">
                                        <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-full mb-3">
                                            {statusFilter !== 'all' ? (
                                                <SearchX className="w-8 h-8 text-gray-400" />
                                            ) : (
                                                <Inbox className="w-8 h-8 text-gray-400" />
                                            )}
                                        </div>
                                        <h3 className="text-sm font-bold text-gray-900 dark:text-white">No requests found</h3>
                                        <p className="text-xs text-gray-500 mt-1 max-w-[200px]">
                                            {statusFilter !== 'all'
                                                ? "No requests match the selected filter."
                                                : "There are no requests in this category right now."}
                                        </p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};