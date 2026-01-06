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
import { approvePurchaseRequest, rejectPurchaseRequest } from './services/purchaseService'

export function Main({ onViewDetail }: PurchaseOrdersProps) {
    // Make sure your Tab names here match exactly what is in TabsGroup below
    const [activeTab, setActiveTab] = useState('active orders'); 
    const [statusFilter, setStatusFilter] = useState<string>('all');

    const [purchaseOrders, setPurchaseOrders] = useState<PurchaseRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [creatingRequest, setCreatingRequest] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isReviewProcessing, setIsReviewProcessing] = useState(false);

    const [reviewState, setReviewState] = useState<{
        isOpen: boolean;
        order: PurchaseRequest | null;
        action: 'approve' | 'reject';
    }>({
        isOpen: false,
        order: null,
        action: 'approve'
    });

    const filteredOrders = useMemo(() => {
        let data = purchaseOrders;

        if (activeTab === 'active orders') {
            data = data.filter(order => order.status === 0);
        } else {
            data = data.filter(order => order.status === 1 || order.status === 2);
        }

        // 2. APPLY DROPDOWN FILTER (If you still use the dropdown inside the tab)
        if (statusFilter !== 'all') {
            data = data.filter(order => order.status.toString() === statusFilter);
        }

        return data;
    }, [purchaseOrders, activeTab, statusFilter]);


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
        if (!reviewState.order) return;

        try {
            setIsReviewProcessing(true); 

            if (action === 'approve') {
                await approvePurchaseRequest(reviewState.order.id);
            } else {
                await rejectPurchaseRequest(reviewState.order.id, notes);
            }

            handleCloseReview();
            fetchOrders(); // Refresh list after action

        } catch (error: any) {
            console.error(`Failed to ${action} request:`, error);
            alert(error.message || "Something went wrong while processing the request.");
        } finally {
            setIsReviewProcessing(false);
        }
    };

    const fetchOrders = useCallback(async (signal?: AbortSignal) => {
        const validSignal = (signal instanceof AbortSignal) ? signal : undefined;

        try {
            setIsLoading(true);
            setError(null);
            const data = await getAllPurchaseRequests(validSignal);
            console.log(data);
            
            setPurchaseOrders(data);
        } catch (err: any) {
            if (err.name === 'AbortError') return;
            console.error("Failed to load orders:", err);
            setError(err.message || "An unexpected error occurred.");
        } finally {
            if (!validSignal?.aborted) {
                setIsLoading(false);
            }
        }
    }, []);

    useEffect(() => {
        const controller = new AbortController();
        fetchOrders(controller.signal);
        return () => {
            controller.abort();
        };
    }, [fetchOrders]);

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
                isProcessing={isReviewProcessing}
            />
        </div>
    );
}