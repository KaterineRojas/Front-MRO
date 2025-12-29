
import React, { useState, useMemo, useEffect } from 'react'
import { PurchaseOrdersProps } from './types/purchase'
import TabsGroup from '../requests/components/Tabs'
import { OrderTable } from './components/OrderTable'
import { PurchaseRequest } from './types/purchase'
import { MOCK_ORDERS } from './data/mockNewPurchase'
import { Plus } from 'lucide-react'
import { CreatePurchaseRequestPage } from './CreatePurchaseRequestPage'
import {authService} from '../../../services/authService'

export function Main({ onViewDetail }: PurchaseOrdersProps) {
    const [activeTab, setActiveTab] = useState('active orders');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [purchaseOrders, setPurchaseOrders] = useState<PurchaseRequest[]>(MOCK_ORDERS);
    const [creatingRequest, setCreatingRequest] = useState(false);


    const handleStatusUpdate = (orderId: number, newStatus: number) => {
        setPurchaseOrders(prevOrders =>
            prevOrders.map(order => {
                if (order.id === orderId) {
                    return {
                        ...order,
                        status: newStatus, // 1 for Approved, 2 for Rejected
                        // If approved (1), we can simulate setting the approval date
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
            // Show Pending (0) and Approved (1)
            data = data.filter(order => [0, 1].includes(order.status));
        } else {
            // Show Rejected (2), Completed (3)
            data = data.filter(order => [2, 3].includes(order.status));
        }

        // 2. Step 2: Filter by DROPDOWN selection
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



    if (creatingRequest) {
        return (
            <CreatePurchaseRequestPage
                onBack={handleBackFromCreate}
                onSave={() => { }}//poner la funcion para crear el purchase request
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
                    className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Register Kit
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

            <OrderTable
                orders={filteredOrders}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                onStatusUpdate={handleStatusUpdate}
                activeTab={activeTab}
            />
        </div>
    );

}


