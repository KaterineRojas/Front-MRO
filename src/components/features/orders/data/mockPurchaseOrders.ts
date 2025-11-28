interface PurchaseItem {
    id: number;
    articleCode: string;
    articleDescription: string;
    quantity: number;
    unit: string;
    unitCost: number;
    totalCost: number;
    receivedQuantity?: number;
    status: 'pending' | 'partial' | 'received';
    purchaseUrl?: string;
    imageUrl?: string;
}

interface PurchaseOrder {
    id: number;
    poNumber: string;
    supplier: string;
    supplierContact: string;
    requestedBy: string;
    department: string;
    project: string;
    approvedBy?: string;
    orderDate: string;
    expectedDelivery?: string;
    actualDelivery?: string;
    status: 'pending' | 'approved' | 'ordered' | 'delivered' | 'cancelled' | 'activated' | 'completed';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    notes: string;
    createdAt: string;
    items: PurchaseItem[];
    totalOrderValue: number;
    cancelNotes?: string;
}

export const mockPurchaseOrders: PurchaseOrder[] = [
    {
        id: 1,
        poNumber: 'PO-2025-001',
        supplier: 'Office Supplies Inc.',
        supplierContact: 'supplier@officesupplies.com',
        requestedBy: 'Anna Rodriguez',
        department: 'Administration',
        project: 'Office Supplies Replenishment',
        approvedBy: 'Sarah Johnson',
        orderDate: '2025-01-18',
        expectedDelivery: '2025-01-25',
        status: 'activated',
        priority: 'medium',
        notes: 'Regular monthly paper stock replenishment',
        createdAt: '2025-01-18T09:00:00Z',
        totalOrderValue: 520.00,
        items: [
            {
                id: 1,
                articleCode: 'OFF-001',
                articleDescription: 'Office Paper A411 - 80gsm',
                quantity: 1000,
                unit: 'sheets',
                unitCost: 0.02,
                totalCost: 20.00,
                status: 'pending',
                imageUrl: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=300'
            },
            {
                id: 2,
                articleCode: 'OFF-002',
                articleDescription: 'Printer Toner HP LaserJet',
                quantity: 10,
                unit: 'units',
                unitCost: 50.00,
                totalCost: 500.00,
                receivedQuantity: 5,
                status: 'partial',
                imageUrl: 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=300'
            }
        ]
    },
    {
        id: 2,
        poNumber: 'PO-2025-002',
        supplier: 'Cable Masters',
        supplierContact: 'orders@cablemasters.com',
        requestedBy: 'Mike Chen',
        department: 'IT',
        project: 'Workstation Setup Project',
        orderDate: '2025-01-20',
        expectedDelivery: '2025-01-27',
        actualDelivery: '2025-01-22',
        status: 'delivered',
        priority: 'high',
        notes: 'Urgent need for new workstation setups',
        createdAt: '2025-01-20T14:30:00Z',
        totalOrderValue: 449.50,
        items: [
            {
                id: 3,
                articleCode: 'USB-003',
                articleDescription: 'USB Cable Type-C 2m',
                quantity: 50,
                unit: 'units',
                unitCost: 8.99,
                totalCost: 449.50,
                receivedQuantity: 50,
                status: 'received',
                imageUrl: 'https://images.unsplash.com/photo-1625948515291-69613efd103f?w=300'
            }
        ]
    },
    {
        id: 3,
        poNumber: 'PO-2025-003',
        supplier: 'AV Equipment Co.',
        supplierContact: 'sales@avequipment.com',
        requestedBy: 'David Wilson',
        department: 'Training',
        project: 'Training Room Upgrade',
        status: 'pending',
        priority: 'medium',
        orderDate: '2025-01-21',
        notes: 'For new training rooms setup',
        createdAt: '2025-01-21T11:15:00Z',
        totalOrderValue: 1800.00,
        items: [
            {
                id: 4,
                articleCode: 'PROJ-004',
                articleDescription: 'Projector Epson EB-X41',
                quantity: 2,
                unit: 'units',
                unitCost: 450.00,
                totalCost: 900.00,
                status: 'pending',
                imageUrl: 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=300'
            },
            {
                id: 5,
                articleCode: 'PROJ-005',
                articleDescription: 'Projection Screen 100 inch',
                quantity: 2,
                unit: 'units',
                unitCost: 450.00,
                totalCost: 900.00,
                status: 'pending',
                imageUrl: 'https://images.unsplash.com/photo-1605647540924-852290f6b0d5?w=300'
            }
        ]
    },
    {
        id: 4,
        poNumber: 'PO-2025-004',
        supplier: 'Tech Solutions Ltd.',
        supplierContact: 'sales@techsolutions.com',
        requestedBy: 'Sarah Martinez',
        department: 'Marketing',
        project: 'Digital Campaign Equipment',
        status: 'approved',
        priority: 'high',
        orderDate: '2025-01-22',
        expectedDelivery: '2025-02-01',
        notes: 'Equipment for new marketing campaign',
        createdAt: '2025-01-22T10:00:00Z',
        totalOrderValue: 3200.00,
        items: [
            {
                id: 6,
                articleCode: 'TECH-002',
                articleDescription: 'Laptop Dell Latitude 5520',
                quantity: 2,
                unit: 'units',
                unitCost: 1200.00,
                totalCost: 2400.00,
                status: 'pending',
                imageUrl: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=300'
            },
            {
                id: 7,
                articleCode: 'TECH-003',
                articleDescription: 'Wireless Mouse Logitech MX Master',
                quantity: 4,
                unit: 'units',
                unitCost: 99.00,
                totalCost: 396.00,
                status: 'pending',
                imageUrl: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=300'
            },
            {
                id: 8,
                articleCode: 'TECH-004',
                articleDescription: 'USB-C Hub Multiport Adapter',
                quantity: 4,
                unit: 'units',
                unitCost: 49.00,
                totalCost: 196.00,
                status: 'pending',
                imageUrl: 'https://images.unsplash.com/photo-1625948515291-69613efd103f?w=300'
            }
        ]
    }
];