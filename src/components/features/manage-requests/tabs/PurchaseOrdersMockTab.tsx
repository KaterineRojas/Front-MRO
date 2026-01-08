import React, { useState, useMemo } from 'react';
import { ShoppingCart, SearchX, Inbox, History, ChevronRight, Package, Building2, Layers, FolderKanban, UserCheck, CheckCheck, XCircle } from 'lucide-react';
import { FilterSelect } from '../../inventory/components/FilterSelect';
import { getStatusBadge, getReasonBadge } from '../../inventory/components/RequestBadges';
import { useSelector } from 'react-redux';
import { ActionButton } from '../../inventory/components/ActionButton';
import { ConfirmModal } from '../../manage-requests/modals/ConfirmModal';

// Mock data
const MOCK_ORDERS = [
    {
        id: 1,
        requestNumber: 'PR-2025-001',
        requesterId: 'amx0142',
        warehouseName: 'Main Warehouse',
        status: 3, // Ordered
        reason: 1, // Urgent
        estimatedTotalCost: 15420.50,
        totalItems: 5,
        totalQuantity: 25,
        createdAt: '2025-01-05T10:30:00',
        projectId: 'Project Alpha',
        companyId: 'ACME Corp',
        approvedByName: null,
        rejectedByName: null,
        notes: 'Needed for production line maintenance',
        items: [
            { id: 1, name: 'Industrial Bolt Set', sku: 'BLT-001', quantity: 100, imageUrl: null },
            { id: 2, name: 'Heavy Duty Wrench', sku: 'WRN-045', quantity: 5, imageUrl: null },
        ]
    },
    {
        id: 2,
        requestNumber: 'PR-2025-002',
        requesterId: 'jdoe',
        warehouseName: 'Main Warehouse',
        status: 1, // Approved
        reason: 0, // Low Stock
        estimatedTotalCost: 8900.00,
        totalItems: 3,
        totalQuantity: 15,
        createdAt: '2025-01-03T14:20:00',
        projectId: 'Project Beta',
        companyId: 'TechCo',
        approvedByName: 'John Manager',
        rejectedByName: null,
        notes: null,
        items: [
            { id: 3, name: 'Safety Goggles', sku: 'SFT-100', quantity: 50, imageUrl: null },
        ]
    },
    {
        id: 3,
        requestNumber: 'PR-2025-003',
        requesterId: 'msmith',
        warehouseName: 'Main Warehouse',
        status: 1, // Rejected
        reason: 2, // New project
        estimatedTotalCost: 23500.00,
        totalItems: 8,
        totalQuantity: 40,
        createdAt: '2025-01-02T09:15:00',
        projectId: 'Project Gamma',
        companyId: 'BuildCo',
        approvedByName: null,
        rejectedByName: 'Sarah Admin',
        rejectionReason: 'Budget exceeded for this quarter',
        notes: 'For new construction project',
        items: []
    }
];

const STATUS_MAP: Record<number, string> = {
    1: 'approved',
    3: 'ordered',
    4: 'received',
};

const REASON_MAP: Record<number, string> = {
    0: 'Low Stock',
    1: 'Urgent',
    2: 'New project',
};

const handleOrder = (orderId: number) => {
    console.log('Ordering items for order:', orderId);
    // Aquí puedes llamar al backend para cambiar el status a Ordered
};

const handleReceived = (orderId: number) => {
    console.log('Marking order as received:', orderId);
    // Aquí puedes llamar al backend para cambiar el status a Received
};


const formatDate = (dateString: string) => {
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
}

const OrderRow: React.FC<OrderRowProps> = ({ order }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const confirmOrder = () => {
        order.status = 3; // mock
        setIsModalOpen(false);
    };
    const statusString = STATUS_MAP[order.status] || 'unknown';
    const reasonString = REASON_MAP[order.reason] || 'Standard';
    const darkMode = useSelector((state: any) => state.ui.darkMode);
    const actionedBy = order.approvedByName || order.rejectedByName;

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
                    {order.requestNumber}
                </td>
                <td className="p-4">
                    {getStatusBadge(statusString, `${darkMode ? '' : 'soft'}`)}
                </td>
                <td className="p-4">
                    <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{order.requesterId}</span>
                        <span className="text-[10px] text-gray-500 uppercase">{order.warehouseName}</span>
                    </div>
                </td>
                <td className="p-4 text-sm font-bold text-right text-emerald-600 dark:text-emerald-400 font-mono">
                    {formatCurrency(order.estimatedTotalCost)}
                </td>
                <td className="p-4 text-center">
                    {getReasonBadge(reasonString, `${darkMode ? '' : 'soft'}`)}
                </td>
                <td className="p-4 text-sm text-gray-500">
                    {formatDate(order.createdAt)}
                </td>
                <td className="p-4 text-right">
    {/* Approved → mostrar botón Order */}
    {order.status === 1 && (
        <div className="flex justify-end">
            <button
                className="px-3 h-8 rounded-md bg-blue-500 text-white hover:bg-blue-600"
                onClick={() => setIsModalOpen(true)}
            >
                Order
            </button>
        </div>
    )}

    {/* Ordered → mostrar botón Bought */}
    {order.status === 3 && (
        <div className="flex justify-end">
            <button
                className="px-3 h-8 rounded-md bg-green-500 text-white hover:bg-green-600"
                onClick={() => handleReceived(order.id)}
            >
                Bought
            </button>
        </div>
    )}

    {/* Received → solo texto */}
    {order.status === 4 && (
        <div className="flex flex-col items-end justify-center h-full">
            <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold text-emerald-500">
                Received
            </span>
        </div>
    )}
</td>

            </tr>
            <ConfirmModal
                isOpen={isModalOpen}
                title="Confirm Order"
                message="Are you sure you want to mark this request as Ordered?"
                onConfirm={confirmOrder}
                onCancel={() => setIsModalOpen(false)}
            />


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
                                        {order.projectId || 'General Inventory'}
                                    </p>
                                </div>
                                <div className="p-4 rounded-xl border shadow-sm bg-purple-500/5 border-purple-500/20 dark:shadow-none">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Layers className="w-4 h-4 text-purple-400" />
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-purple-300">Composition</p>
                                    </div>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-purple-100 pl-6">
                                        {order.totalQuantity} Units <span className="font-normal text-purple-700 dark:text-purple-400/60">in {order.totalItems} items</span>
                                    </p>
                                </div>
                                <div className="p-4 rounded-xl border shadow-sm bg-amber-500/5 border-amber-500/20 dark:shadow-none">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Building2 className="w-4 h-4 text-amber-400" />
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-amber-300">Company</p>
                                    </div>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-amber-100 pl-6">
                                        {order.companyId || 'Unassigned'}
                                    </p>
                                </div>
                                <div className="p-4 rounded-xl border shadow-sm bg-emerald-500/5 border-emerald-500/20 dark:shadow-none">
                                    <div className="flex items-center gap-2 mb-2">
                                        <UserCheck className="w-4 h-4 text-gray-400 dark:text-emerald-400" />
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-emerald-300">Approval</p>
                                    </div>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-emerald-100 pl-6">
                                        {order.approvedByName || 'Pending Review'}
                                    </p>
                                </div>
                            </div>

                            {order.notes && (
                                <div className="mb-6 p-4 bg-gray-200 dark:bg-yellow-900/10 border border-gray-900/20 dark:border-yellow-900/30 rounded-lg">
                                    <h4 className="text-xs font-bold uppercase text-gray-900 dark:text-yellow-500 mb-1">Request Notes</h4>
                                    <p className="text-sm text-gray-700 dark:text-yellow-100/80">{order.notes}</p>
                                </div>
                            )}

                            {order.rejectionReason && (
                                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-lg">
                                    <h4 className="text-xs font-bold uppercase text-red-800 dark:text-red-400 mb-1">Rejection Reason</h4>
                                    <p className="text-sm text-red-700 dark:text-red-200/90">{order.rejectionReason}</p>
                                </div>
                            )}

                            <div className="flex items-center gap-2 mb-4 pl-1">
                                <Package className="h-4 w-4 text-gray-400" />
                                <h4 className="text-xs font-bold uppercase tracking-widest text-gray-500">
                                    Included Items ({order.items?.length || 0})
                                </h4>
                            </div>

                            {(!order.items || order.items.length === 0) ? (
                                <div className="text-center py-6 border border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
                                    <p className="text-sm text-gray-400">No items found in this request.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {order.items.map((item: any) => (
                                        <div key={item.id} className="group flex gap-4 p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#131A27] hover:shadow-md transition-all">
                                            <div className="relative w-16 h-16 shrink-0 bg-gray-100 dark:bg-gray-700 rounded-md overflow-hidden flex items-center justify-center">
                                                <Package className="w-6 h-6 text-gray-400" />
                                            </div>
                                            <div className="flex-1 min-w-0 flex flex-col justify-center">
                                                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate pr-2">{item.name}</p>
                                                <p className="text-xs font-mono text-gray-500 dark:text-gray-400 mb-1">{item.sku}</p>
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 w-fit">
                                                    Qty: {item.quantity}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </td>
                </tr>
            )}
        </>
    );
};

interface Props {
    activeTab: 'active orders' | 'orders history';
}

export const PurchaseOrdersMockTab: React.FC<Props> = ({ activeTab }) => {
    const [statusFilter, setStatusFilter] = useState<string>('all');

    const filteredOrders = useMemo(() => {
    let data = MOCK_ORDERS;

    if (activeTab === 'active orders') {
        // Mostrar Approved y Ordered como “pendientes de acción”
        data = data.filter(order => order.status === 1 || order.status === 3);
    } else {
        // Historial → Received
        data = data.filter(order => order.status === 4);
    }

    if (statusFilter !== 'all') {
        data = data.filter(order => order.status.toString() === statusFilter);
    }

    return data;
}, [activeTab, statusFilter]);


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
                </div>

                <FilterSelect 
                    value={statusFilter}
                    onChange={setStatusFilter}
                    options={filterOptions} 
                    className='pr-[60px]'
                />
            </div>

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
                        {filteredOrders.length > 0 ? (
                            filteredOrders.map((order) => (
                                <OrderRow key={order.id} order={order} />
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
