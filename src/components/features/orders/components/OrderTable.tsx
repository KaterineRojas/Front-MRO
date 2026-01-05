import React, { useMemo } from 'react';
import { ShoppingCart, SearchX, Inbox, History } from 'lucide-react';
import { FilterSelect } from '../../inventory/components/FilterSelect';
import { OrderRow } from './OrderRow';
import { ActivePurchaseTableProps } from '../types/purchaseType';



export const OrderTable: React.FC<ActivePurchaseTableProps> = ({ 
    orders, 
    statusFilter, 
    setStatusFilter, 
    onStatusUpdate,
    activeTab ,
    onReview,
}) => {

    const filterOptions = useMemo(() => {
        if (activeTab === 'active orders') {
            return [
                { value: 'all', label: 'All Active' },
                { value: '0', label: 'Pending' },
                { value: '1', label: 'Approved' }
            ];
        } else {
            return [
                { value: 'all', label: 'All History' },
                { value: '2', label: 'Rejected' },
                { value: '3', label: 'Completed' },
                { value: '4', label: 'Cancelled' }
            ];
        }
    }, [activeTab]);

    return (
        <div className="w-full bg-white dark:bg-[#0A1016] rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
            {/* TOOLBAR HEADER */}
            <div className="flex flex-col md:flex-row md:items-center justify-between p-4 gap-4 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                        {/* Dynamic Icon based on tab */}
                        {activeTab === 'active orders' ? (
                            <ShoppingCart className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        ) : (
                            <History className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        )}
                    </div>
                    <h2 className="text-base font-bold text-gray-900 dark:text-white capitalize">
                        {activeTab}
                        <span className="ml-2 text-sm font-medium text-gray-400">({orders.length})</span>
                    </h2>
                </div>

                <FilterSelect 
                    value={statusFilter}
                    onChange={setStatusFilter}
                    options={filterOptions} 
                    className='pr-[60px]'
                />
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
                            <th className="p-4 text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 text-center">Reason</th>
                            <th className="p-4 text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Created At</th>
                            <th className="p-4 text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {orders.length > 0 ? (
                            orders.map((order) => (
                                <OrderRow key={order.id} order={order} handleReview={onReview} />
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
                                                ? "No orders match the selected filter." 
                                                : "There are no orders in this category right now."}
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