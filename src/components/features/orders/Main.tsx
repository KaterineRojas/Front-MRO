import React, { useState, useMemo, useEffect, useCallback } from 'react'
import { PurchaseOrdersProps } from './types/purchaseType'
import TabsGroup from '../requests/components/Tabs'
import { OrderTable } from './components/OrderTable'
import { PurchaseRequest } from './types/purchaseType'
import { Plus, Loader2 } from 'lucide-react'
import { CreatePurchaseRequestPage } from './CreatePurchaseRequestPage'
import { authService } from '../../../services/authService'
import { getAllPurchaseRequests } from './services/purchaseService'
import { ReviewRequestModal } from './modals/ApproveRequestModal'
import { TableErrorBoundary } from './components/TableErrorBoundary'
import { TableErrorState } from './components/TableErrorState'

export function Main({ onViewDetail }: PurchaseOrdersProps) {
    const [activeTab, setActiveTab] = useState('active orders');
    const [statusFilter, setStatusFilter] = useState<string>('all');

    const [purchaseOrders, setPurchaseOrders] = useState<PurchaseRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [creatingRequest, setCreatingRequest] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [reviewState, setReviewState] = useState<{
        isOpen: boolean;
        order: PurchaseRequest | null;
        action: 'approve' | 'reject';
    }>({
        isOpen: false,
        order: null,
        action: 'approve'
    });

    const handleOpenReview = (order: PurchaseRequest, action: 'approve' | 'reject') => {
        setReviewState({
            isOpen: true,
            order,
            action
        });
    };

    const handleCloseReview = () => {
        setReviewState(prev => ({ ...prev, isOpen: false }));
    };

    const handleConfirmReview = async (action: 'approve' | 'reject', notes: string) => {
        console.log(`Processing ${action} for ID ${reviewState.order?.id} with notes: ${notes}`);

        // TODO: Call your API here
        // await api.updateStatus(reviewState.order.id, action, notes);

        handleCloseReview();
    };

    // Fetch Function
    const fetchOrders = useCallback(async (signal?: AbortSignal) => {
        const validSignal = (signal instanceof AbortSignal) ? signal : undefined;

        try {
            setIsLoading(true);
            setError(null);

            const data = await getAllPurchaseRequests(validSignal);

            setPurchaseOrders(data);

        } catch (err: any) {
            if (err.name === 'AbortError') {
                console.log('Fetch aborted');
                return;
            }

            console.error("Failed to load orders:", err);

            if (err.message === 'Failed to fetch') {
                setError("Unable to connect to the server. Please check your connection.");
            } else {
                setError(err.message || "An unexpected error occurred.");
            }
        } finally {
            if (!validSignal?.aborted) {
                setIsLoading(false);
            }
        }
    }, []);

    // Load data on mount
    useEffect(() => {
        const controller = new AbortController();

        fetchOrders(controller.signal);

        return () => {
            controller.abort();
        };
    }, [fetchOrders]);

    const handleStatusUpdate = (orderId: number, newStatus: number) => {
        // Note: This only updates local state. You will need an API endpoint to save this change later.
        setPurchaseOrders(prevOrders =>
            prevOrders.map(order => {
                if (order.id === orderId) {
                    return {
                        ...order,
                        status: newStatus,
                        ...(newStatus === 1 && {
                            approvedAt: new Date().toISOString(),
                            approvedByName: authService.getUser()?.name
                        })
                    };
                }
                return order;
            })
        );
    };

    const filteredOrders = useMemo(() => {
        let data = purchaseOrders;

        if (activeTab === 'active orders') {
            data = data.filter(order => [0, 1].includes(order.status));
        } else {
            data = data.filter(order => [2, 3].includes(order.status));
        }

        if (statusFilter !== 'all') {
            data = data.filter(order => order.status.toString() === statusFilter);
        }

        return data;
    }, [purchaseOrders, activeTab, statusFilter]);

    const handleCreateNewRequest = () => {
        setCreatingRequest(true);
    };

    const handleBackFromCreate = () => {
        setCreatingRequest(false);
    };

    const handleRequestSaved = () => {
        setCreatingRequest(false);
        fetchOrders();
    };

    if (creatingRequest) {
        return (
            <CreatePurchaseRequestPage
                onBack={handleBackFromCreate}
                onSave={handleRequestSaved}
            />
        );
    }

    return (
        <div className="p-6 max-w-[1600px] mx-auto space-y-6">

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Purchase Requests
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Manage purchase requests and orders
                    </p>
                </div>

                <button
                    onClick={handleCreateNewRequest}
                    className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-700 hover:bg-indigo-800 rounded-lg shadow-sm transition-colors"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    New Request
                </button>
            </div>

            <TabsGroup
                tabsList={[
                    { name: 'Active Orders', iconType: 'shoppingCart' },
                    { name: 'Orders History', iconType: 'history' }
                ]}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
            />

            {isLoading ? (
                <div className="flex justify-center items-center h-64 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex flex-col items-center text-gray-400">
                        <Loader2 className="h-8 w-8 animate-spin mb-2" />
                        <p>Loading requests...</p>
                    </div>
                </div>
            ) : (
                error ? (
                    <TableErrorState message={error} onRetry={fetchOrders} />
                ) : (
                    /* CASE 2: Render Crash (Safeguard) */
                    <TableErrorBoundary>
                        <OrderTable
                            orders={filteredOrders}
                            statusFilter={statusFilter}
                            setStatusFilter={setStatusFilter}
                            activeTab={activeTab}
                            onReview={handleOpenReview}
                        />
                    </TableErrorBoundary>
                )
            )}


            <ReviewRequestModal
                isOpen={reviewState.isOpen}
                order={reviewState.order}
                initialAction={reviewState.action}
                onClose={handleCloseReview}
                onConfirm={handleConfirmReview}
            />
        </div>
    );
}