import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { ShoppingCart, SearchX, Inbox, History, ChevronRight, Package, Building2, Layers, FolderKanban, UserCheck, Loader2 } from 'lucide-react';
import { getStatusBadge, getReasonBadge } from '../../inventory/components/RequestBadges';
import { useSelector } from 'react-redux';
import { getPurchaseRequestsByStatus, markAsOrdered, markAsBought } from '../services/purchaseRequestsService';
import toast from 'react-hot-toast';
import { ConfirmModal } from '../modals/ConfirmModal';
import { ReceivedItemsModal } from '../modals/ReceivedItemsModal';

// Status mapping for display - handles both string and numeric status
const STATUS_MAP: Record<string | number, string> = {
    // String status (from API)
    'Approved': 'approved',
    'Ordered': 'ordered',
    'Received': 'received',
    // Numeric status (from API response)
    0: 'pending',
    1: 'approved',      // Approved
    2: 'in-progress',
    3: 'ordered',       // Ordered
    4: 'received',      // Received
};

const REASON_MAP: Record<number, string> = {
    0: 'Low Stock',
    1: 'Urgent',
    2: 'New project',
};

const formatDate = (dateString: string) => {
    if (!dateString) return '---';
    return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
};

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(amount);
};

interface OrderRowProps {
    order: any;
    onOrderClick: (orderId: number) => void;
    onBoughtClick: (orderId: number) => void;
    showActions: boolean;
    activeTab: 'active orders' | 'orders history';
}

const OrderRow: React.FC<OrderRowProps> = ({ order, onOrderClick, onBoughtClick, showActions, activeTab }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    
    // Handle both numeric and string status values
    const statusString = STATUS_MAP[order.status] || (typeof order.status === 'string' ? order.status.toLowerCase() : 'unknown');
    const reasonString = REASON_MAP[order.reason] || 'Standard';
    const darkMode = useSelector((state: any) => state.ui.darkMode);
    
    // Determine buttons based on status (handle both string and number)
    const isApproved = order.status === 'Approved' || order.status === 1;
    const isOrdered = order.status === 'Ordered' || order.status === 3;

    return (
        <>
            <tr className={`group transition-colors border-b border-gray-100 hover:bg-[#F5F5F7] dark:hover:bg-[#191F26] dark:border-gray-800 ${isExpanded ? 'hover:bg-white dark:hover:bg-[#1F2937] dark:bg-[#1F2937]' : ' dark:hover:bg-white/[0.02]'}`}>
                <td className="p-4">
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="p-2 hover:bg-gray-200 dark:hover:bg-white/10 rounded transition-colors text-gray-400 dark:text-white"
                    >
                        <ChevronRight className={`w-4 h-4 transition duration-200 ease-out ${isExpanded ? 'rotate-90' : ''}`} />
                    </button>
                </td>
                <td className="p-4 font-mono text-sm font-bold text-blue-600 dark:text-blue-400">
                    {order.requestNumber || `#${order.id}`}
                </td>
                <td className="p-4">
                    {getStatusBadge(statusString, `${darkMode ? '' : 'soft'}`)}
                </td>
                <td className="p-4">
                    <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{order.requesterName || 'N/A'}</span>
                        <span className="text-[10px] text-gray-500 uppercase">{order.warehouseName || 'Warehouse'}</span>
                    </div>
                </td>
                <td className="p-4 text-sm font-bold text-left text-emerald-600 dark:text-emerald-400 font-mono">
                    {formatCurrency(order.totalAmount || order.estimatedTotalCost || 0)}
                </td>
                <td className="p-4 text-left">
                    {getReasonBadge(reasonString, `${darkMode ? '' : 'soft'}`)}
                </td>
                <td className="p-4 text-sm text-gray-500 text-left">
                    {formatDate(order.createdAt)}
                </td>
                {showActions && (
                    <td className="p-4 text-left">
                        <div className="">
                            {isApproved && (
                                <button
                                    className="inline-flex items-center gap-1 px-3 h-8 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    title="Mark as Ordered"
                                    onClick={() => onOrderClick(order.id)}
                                >
                                    Order
                                </button>
                            )}
                            {isOrdered && (
                                <button
                                    className="inline-flex items-center gap-1 px-3 h-8 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    title="Mark as Bought"
                                    onClick={() => onBoughtClick(order.id)}
                                >
                                    
                                    Received
                                </button>
                            )}
                        </div>
                    </td>
                )}
            </tr>

            {isExpanded && (
                <tr className="bg-[#F2F2F4] dark:bg-black/20 shadow-inner">
                    <td colSpan={8} className="p-0 border-b border-gray-100 dark:border-gray-800">
                        <div className="p-6 animate-in fade-in slide-in-from-top-1 duration-200">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                                <div className="p-4 rounded-xl border border-blue-500 shadow-sm bg-blue-500/5 dark:border-blue-500/20 dark:shadow-none">
                                    <div className="flex items-center gap-2 mb-2">
                                        <FolderKanban className="w-4 h-4 text-blue-400" />
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-blue-300">Project</p>
                                    </div>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-blue-100 pl-6">
                                        {order.projectId || 'N/A'}
                                    </p>
                                </div>
                                <div className="p-4 rounded-xl border shadow-sm bg-purple-500/5 border-purple-500/20 dark:shadow-none">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Layers className="w-4 h-4 text-purple-400" />
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-purple-300">Items</p>
                                    </div>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-purple-100 pl-6">
                                        {order.totalItems || 0} items <span className="font-normal text-purple-700 dark:text-purple-400/60">({order.totalQuantity || 0} units)</span>
                                    </p>
                                </div>
                                <div className="p-4 rounded-xl border shadow-sm bg-amber-500/5 border-amber-500/20 dark:shadow-none">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Building2 className="w-4 h-4 text-amber-400" />
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-amber-300">Company</p>
                                    </div>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-amber-100 pl-6">
                                        {order.companyId || 'N/A'}
                                    </p>
                                </div>
                                <div className="p-4 rounded-xl border shadow-sm bg-emerald-500/5 border-emerald-500/20 dark:shadow-none">
                                    <div className="flex items-center gap-2 mb-2">
                                        <UserCheck className="w-4 h-4 text-gray-400 dark:text-emerald-400" />
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-emerald-300">Approved By</p>
                                    </div>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-emerald-100 pl-6">
                                        {order.approvedByName || 'Pending'}
                                    </p>
                                </div>
                            </div>

                            {order.notes && (
                                <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-800">
                                    <p className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-2">Notes</p>
                                    <p className="text-sm text-gray-700 dark:text-gray-300">{order.notes}</p>
                                </div>
                            )}

                            {order.rejectionReason && (
                                <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-800">
                                    <p className="text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400 mb-2">Rejection Reason</p>
                                    <p className="text-sm text-gray-700 dark:text-gray-300">{order.rejectionReason}</p>
                                </div>
                            )}

                            <div className="flex items-center justify-between gap-2 mb-4 pl-1">
                                <div className="flex items-center gap-2">
                                    <Package className="h-4 w-4 text-gray-400" />
                                    <h4 className="text-xs text-[16px] font-bold uppercase tracking-widest text-gray-900">
                                        Request Items
                                    </h4>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-[14px] font-semibold text-gray-900 dark:text-gray-400">
                                        {activeTab === 'active orders' ? 'Ordered At:' : 'Received At:'}
                                    </span>
                                    <span className="text-xs text-[14px] font-semibold text-blue-900 dark:text-blue-400">
                                        {activeTab === 'active orders' 
                                            ? (order.orderedAt ? formatDate(order.orderedAt) : 'Not yet')
                                            : (order.receivedAt ? formatDate(order.receivedAt) : '---')
                                        }
                                    </span>
                                </div>
                            </div>

                            {/* Items Table */}
                            <div className="mb-6 overflow-x-auto">
                                {order.items && order.items.length > 0 ? (
                                    <table className="w-full border-collapse text-sm">
                                        <thead>
                                            <tr className="bg-gray-100 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                                                <th className="p-3 text-left text-[12px] font-bold uppercase tracking-wider text-gray-900 dark:text-gray-300">Image</th>
                                                <th className="p-3 text-left text-[12px] font-bold uppercase tracking-wider text-gray-900 dark:text-gray-300">SKU</th>
                                                <th className="p-3 text-left text-[12px] font-bold uppercase tracking-wider text-gray-900 dark:text-gray-300">Name</th>
                                                <th className="p-3 text-left text-[12px] font-bold uppercase tracking-wider text-gray-900 dark:text-gray-300">Description</th>
                                                <th className="p-3 text-left text-[12px] font-bold uppercase tracking-wider text-gray-900 dark:text-gray-300">Quantity</th>
                                                {activeTab === 'orders history' && (
                                                    <th className="p-3 text-left text-[12px] font-bold uppercase tracking-wider text-gray-900 dark:text-gray-300">Quantity Received</th>
                                                )}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                            {order.items.map((item: any, index: number) => (
                                                <tr key={item.id || index} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                                    {/* Image */}
                                                    <td className="p-3">
                                                        {item.imageUrl ? (
                                                            <img 
                                                                src={item.imageUrl} 
                                                                alt={item.name || item.articleDescription}
                                                                className="w-16 h-16 object-cover rounded-lg bg-gray-200 dark:bg-gray-700"
                                                                onError={(e) => {
                                                                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/48?text=No+Image';
                                                                }}
                                                            />
                                                        ) : (
                                                            <div className="w-12 h-12 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-lg">
                                                                <Package className="w-6 h-6 text-gray-300 dark:text-gray-600" />
                                                            </div>
                                                        )}
                                                    </td>

                                                    {/* SKU */}
                                                    <td className="p-3">
                                                        <span className="inline-flex items-center px-2 py-1 rounded-md text-[11px] font-bold bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                                                            {item.sku || item.articleCode || 'N/A'}
                                                        </span>
                                                    </td>

                                                    {/* Name */}
                                                    <td className="p-3">
                                                        <p className="text-xs text-[13px] text-gray-600 dark:text-gray-400 max-w-xs truncate">
                                                            {item.name || item.articleDescription || 'N/A'}
                                                        </p>
                                                    </td>

                                                    {/* Description */}
                                                    <td className="p-3">
                                                        <p className="text-xs text-[13px] text-gray-600 dark:text-gray-400 max-w-xs truncate">
                                                            {item.description || item.articleDescription || '—'}
                                                        </p>
                                                    </td>

                                                    {/* Quantity */}
                                                    <td className="p-3 ">
                                                        <span className="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300">
                                                            {item.quantity} {item.unit || 'units'}
                                                        </span>
                                                    </td>

                                                    {/* Quantity Received - Only for history */}
                                                    {activeTab === 'orders history' && (
                                                        <td className="p-3 ">
                                                            <span className="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
                                                                {item.quantityReceived || 0} {item.unit || 'units'}
                                                            </span>
                                                        </td>
                                                    )}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <div className="p-8 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-dashed border-gray-200 dark:border-gray-700 text-center">
                                        <Package className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                                        <p className="text-sm text-gray-500 dark:text-gray-400">No items available</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </td>
                </tr>
            )}
        </>
    );
};

interface Props {
    activeTab: 'active orders' | 'orders history';
    warehouseId: number;
}

export const PurchaseOrdersTab: React.FC<Props> = ({ activeTab, warehouseId }) => {
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [orders, setOrders] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
    const [isBoughtModalOpen, setIsBoughtModalOpen] = useState(false);
    const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
    const [receivedQuantities, setReceivedQuantities] = useState<Record<number, number>>({});

    const fetchOrders = useCallback(async (signal?: AbortSignal) => {
        try {
            setIsLoading(true);
            setError(null);
            
            // For Active Orders tab, fetch Approved and Ordered
            // For Orders History tab, fetch Received
            const statuses = activeTab === 'active orders' 
                ? ['Approved', 'Ordered']
                : ['Received'];
            
            const data = await getPurchaseRequestsByStatus(warehouseId, statuses, signal);
            console.log('📦 Fetched purchase requests:', data);
            setOrders(data);
        } catch (err: any) {
            if (err.name === 'AbortError') return;
            console.error("Failed to load purchase requests:", err);
            setError(err.message || "An unexpected error occurred.");
        } finally {
            setIsLoading(false);
        }
    }, [activeTab, warehouseId]);

    const handleOrderClick = (orderId: number) => {
        setSelectedOrderId(orderId);
        setIsOrderModalOpen(true);
    };

    const handleBoughtClick = (orderId: number) => {
        setSelectedOrderId(orderId);
        setIsBoughtModalOpen(true);
    };

    const handleConfirmOrder = async () => {
        if (!selectedOrderId) return;
        
        try {
            await markAsOrdered(selectedOrderId);
            toast.success('Order marked successfully!');
            setIsOrderModalOpen(false);
            setSelectedOrderId(null);
            // Refresh the table to show the updated status (Approved -> Ordered)
            await fetchOrders();
            console.log('✅ Table refreshed, order status updated to Ordered');
        } catch (error: any) {
            toast.error(error.message || 'Failed to mark as ordered');
        }
    };

    const handleConfirmBought = async (quantities: Record<number, number>) => {
        if (!selectedOrderId) return;
        
        console.log('🛒 Confirming bought/received for order:', selectedOrderId, 'with quantities:', quantities);
        
        try {
            await markAsBought(selectedOrderId, quantities);
            toast.success('Order marked as bought/received!');
            setIsBoughtModalOpen(false);
            setSelectedOrderId(null);
            setReceivedQuantities({});
            
            // Refresh the table to remove the item since it's now "Received"
            await fetchOrders();
            console.log('✅ Table refreshed, order should be removed');
        } catch (error: any) {
            console.error('❌ Error in handleConfirmBought:', error);
            toast.error(error.message || 'Failed to mark as bought');
        }
    };

    useEffect(() => {
        const controller = new AbortController();
        fetchOrders(controller.signal);
        return () => controller.abort();
    }, [fetchOrders]);

    const filteredOrders = useMemo(() => {
        let data = orders;

        const term = (searchTerm || '').trim().toLowerCase();
        if (term.length > 0) {
            data = data.filter(order => {
                const requestNum = (order.requestNumber || (`#${order.id}`) || '').toString().toLowerCase();
                const requester = (order.requesterName || '').toString().toLowerCase();
                const reason = (REASON_MAP[order.reason] || '').toString().toLowerCase();
                const statusStr = (STATUS_MAP[order.status] || (typeof order.status === 'string' ? order.status : '')).toString().toLowerCase();
                const created = (order.createdAt ? formatDate(order.createdAt) : '').toString().toLowerCase();

                return (
                    requestNum.includes(term) ||
                    requester.includes(term) ||
                    reason.includes(term) ||
                    statusStr.includes(term) ||
                    created.includes(term)
                );
            });
        }

        return data;
    }, [orders, searchTerm]);

    // No client-side status selector; server query determines active vs history.

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex flex-col items-center text-gray-400">
                    <Loader2 className="h-8 w-8 animate-spin mb-2" />
                    <p>Loading requests...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-red-100 dark:border-red-900/30 rounded-xl bg-red-50/50 dark:bg-red-900/10">
                <div className="p-3 bg-red-100 dark:bg-red-900/50 rounded-full mb-4">
                    <Package className="w-8 h-8 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                    Something went wrong
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mb-6">
                    {error}
                </p>
                <button
                    onClick={() => fetchOrders()}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-700 bg-white border border-red-200 rounded-lg hover:bg-red-50 transition-colors shadow-sm"
                >
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="w-full bg-white dark:bg-[#0A1016] rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between p-4 gap-4 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                        {activeTab === 'active orders' ? (
                            <ShoppingCart className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        ) : (
                            <History className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        )}
                    </div>
                    <h2 className="text-base font-bold text-gray-900 dark:text-white capitalize">
                        {activeTab}
                        <span className="ml-2 text-sm font-medium text-gray-400">({filteredOrders.length})</span>
                    </h2>
                    <div className="w-full md:w-auto">
                        <div className="mt-3">
                            <div className="relative">
                                <SearchX className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="search"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search request, status, requester, reason, date"
                                    className="pl-10 pr-3 py-2 rounded-md border border-gray-200 bg-white text-sm w-full md:w-64 dark:bg-[#041426] dark:border-gray-800 dark:text-white"
                                />
                            </div>
                        </div>
                    </div>
                </div>
                
            </div>

            <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full border-collapse text-left min-w-[900px]">
                    <thead>
                        <tr className="bg-gray-50/50 dark:bg-gray-900/30 border-b border-gray-100 dark:border-gray-800">
                            <th className="p-4 w-12"></th>
                            <th className="p-4 text-[12px] font-bold uppercase tracking-wider text-gray-900 dark:text-gray-400">Request #</th>
                            <th className="p-4 text-[12px] font-bold uppercase tracking-wider text-gray-900 dark:text-gray-400">Status</th>
                            <th className="p-4 text-[12px] font-bold uppercase tracking-wider text-gray-900 dark:text-gray-400">Requester</th>
                            <th className="p-4 text-[12px] font-bold uppercase tracking-wider text-gray-900 dark:text-gray-400">Total Value</th>
                            <th className="p-4 text-[12px] font-bold uppercase tracking-wider text-gray-900 dark:text-gray-400">Reason</th>
                            <th className="p-4 text-[12px] font-bold uppercase tracking-wider text-gray-900 dark:text-gray-400">Created At</th>
                            {activeTab === 'active orders' && (
                                <th className="p-4 text-[12px] font-bold uppercase tracking-wider text-gray-900 dark:text-gray-400 ">Actions</th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {filteredOrders.length > 0 ? (
                            filteredOrders.map((order) => (
                                <OrderRow 
                                    key={order.id} 
                                    order={order}
                                    onOrderClick={handleOrderClick}
                                    onBoughtClick={handleBoughtClick}
                                    showActions={activeTab === 'active orders'}
                                    activeTab={activeTab}
                                />
                            ))
                        ) : (
                            <tr>
                                <td colSpan={8} className="py-16 text-center">
                                    <div className="flex flex-col items-center justify-left">
                                        <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-full mb-3">
                                            {(searchTerm || '').trim().length > 0 ? (
                                                <SearchX className="w-8 h-8 text-gray-400" />
                                            ) : (
                                                <Inbox className="w-8 h-8 text-gray-400" />
                                            )}
                                        </div>
                                        <h3 className="text-sm font-bold text-gray-900 dark:text-white">No requests found</h3>
                                        <p className="text-xs text-gray-500 mt-1 max-w-[200px]">
                                            {(searchTerm || '').trim().length > 0
                                                ? "No orders match your search." 
                                                : "There are no orders in this category right now."}
                                        </p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <ConfirmModal
                isOpen={isOrderModalOpen}
                title="Confirm Order"
                message="Are you sure you want to mark this request as Ordered?"
                onConfirm={handleConfirmOrder}
                onCancel={() => {
                    setIsOrderModalOpen(false);
                    setSelectedOrderId(null);
                }}
            />

            <ReceivedItemsModal
                open={isBoughtModalOpen}
                onOpenChange={(open) => {
                    setIsBoughtModalOpen(open);
                    if (!open) {
                        setSelectedOrderId(null);
                        setReceivedQuantities({});
                    }
                }}
                order={selectedOrderId ? orders.find(o => o.id === selectedOrderId) : null}
                onConfirm={handleConfirmBought}
            />
        </div>
    );
};
