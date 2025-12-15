

export interface RequestItem {
    id: number;
    articleCode: string;
    articleDescription: string;
    quantity: number;
    unit: string;
    estimatedCost?: number;
    imageUrl?: string;
}

export interface Request {
    id: number;
    type: 'purchase' | 'purchase-on-site' | 'transfer-on-site';
    requestNumber: string;
    requestedBy: string;
    requestedByEmail: string;
    department: string;
    project?: string;
    reason: string;
    urgency: 'low' | 'medium' | 'high' | 'urgent';
    requestDate: string;
    requiredDate?: string;
    returnDate?: string;
    status: 'pending' | 'approved' | 'rejected' | 'completed' | 'sent';
    reviewedBy?: string;
    reviewDate?: string;
    reviewNotes?: string;
    items: RequestItem[];
    purchasedBy?: 'applicant' | 'keeper'; // Only for purchase types
}

export const mockRequests: Request[] = [
    {
        id: 1,
        type: 'transfer-on-site',
        requestNumber: 'REQ-2025-001',
        requestedBy: 'Mike Chen',
        requestedByEmail: 'mike.chen@company.com',
        department: 'Marketing',
        project: 'Q1 Client Presentations',
        reason: 'Need equipment for important client presentations scheduled for next week',
        urgency: 'high',
        requestDate: '2025-01-22',
        requiredDate: '2025-01-25',
        returnDate: '2025-02-05',
        status: 'pending',
        items: [
            {
                id: 1,
                articleCode: 'TECH-002',
                articleDescription: 'Laptop Dell Latitude 5520',
                quantity: 1,
                unit: 'units',
                imageUrl: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=300'
            },
            {
                id: 2,
                articleCode: 'PROJ-004',
                articleDescription: 'Projector Epson EB-X41',
                quantity: 1,
                unit: 'units',
                imageUrl: 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=300'
            }
        ]
    },
    {
        id: 2,
        type: 'purchase',
        requestNumber: 'REQ-2025-002',
        requestedBy: 'Anna Rodriguez',
        requestedByEmail: 'anna.rodriguez@company.com',
        department: 'IT',
        project: 'Workstation Setup 2025',
        reason: 'Stock is running low, need for new workstation setups',
        urgency: 'medium',
        requestDate: '2025-01-21',
        requiredDate: '2025-01-30',
        status: 'pending',
        purchasedBy: 'keeper',
        items: [
            {
                id: 3,
                articleCode: 'USB-003',
                articleDescription: 'USB Cable Type-C 2m',
                quantity: 20,
                unit: 'units',
                estimatedCost: 8.99,
                imageUrl: 'https://images.unsplash.com/photo-1625948515291-69613efd103f?w=300'
            },
            {
                id: 4,
                articleCode: 'KB-015',
                articleDescription: 'Wireless Keyboard Logitech',
                quantity: 10,
                unit: 'units',
                estimatedCost: 45.00,
                imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=300'
            }
        ]
    },
    {
        id: 3,
        type: 'purchase-on-site',
        requestNumber: 'REQ-2025-003',
        requestedBy: 'David Wilson',
        requestedByEmail: 'david.wilson@company.com',
        department: 'Finance',
        reason: 'Emergency replacement needed for broken printer',
        urgency: 'urgent',
        requestDate: '2025-01-23',
        requiredDate: '2025-01-24',
        status: 'approved',
        reviewedBy: 'Sarah Johnson',
        reviewDate: '2025-01-23',
        reviewNotes: 'Approved for immediate purchase',
        purchasedBy: 'applicant',
        items: [
            {
                id: 5,
                articleCode: 'PRINT-008',
                articleDescription: 'Printer HP LaserJet Pro',
                quantity: 1,
                unit: 'units',
                estimatedCost: 350.00,
                imageUrl: 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=300'
            }
        ]
    },
    {
        id: 4,
        type: 'transfer-on-site',
        requestNumber: 'REQ-2025-004',
        requestedBy: 'Linda Martinez',
        requestedByEmail: 'linda.martinez@company.com',
        department: 'Training',
        project: 'Q1 Employee Onboarding',
        reason: 'Quarterly training session for new employees',
        urgency: 'medium',
        requestDate: '2025-01-20',
        requiredDate: '2025-01-28',
        returnDate: '2025-02-01',
        status: 'approved',
        reviewedBy: 'Sarah Johnson',
        reviewDate: '2025-01-21',
        reviewNotes: 'Approved for training purposes',
        items: [
            {
                id: 6,
                articleCode: 'PROJ-004',
                articleDescription: 'Projector Epson EB-X41',
                quantity: 1,
                unit: 'units',
                imageUrl: 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=300'
            },
            {
                id: 7,
                articleCode: 'SCREEN-002',
                articleDescription: 'Projection Screen 100 inch',
                quantity: 1,
                unit: 'units',
                imageUrl: 'https://images.unsplash.com/photo-1605647540924-852290f6b0d5?w=300'
            },
            {
                id: 8,
                articleCode: 'MIC-005',
                articleDescription: 'Wireless Microphone Set',
                quantity: 2,
                unit: 'units',
                imageUrl: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=300'
            }
        ]
    },
    {
        id: 5,
        type: 'purchase',
        requestNumber: 'REQ-2025-005',
        requestedBy: 'James Thompson',
        requestedByEmail: 'james.thompson@company.com',
        department: 'Sales',
        project: 'Sales Team Equipment Upgrade',
        reason: 'Need for client presentations and training sessions',
        urgency: 'low',
        requestDate: '2025-01-19',
        requiredDate: '2025-02-10',
        status: 'rejected',
        reviewedBy: 'Sarah Johnson',
        reviewDate: '2025-01-22',
        reviewNotes: 'Budget constraints this quarter. Please resubmit next quarter.',
        purchasedBy: 'keeper',
        items: [
            {
                id: 9,
                articleCode: 'REMOTE-003',
                articleDescription: 'Wireless Presenter Remote',
                quantity: 3,
                unit: 'units',
                estimatedCost: 50.00,
                imageUrl: 'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=300'
            }
        ]
    },
    {
        id: 6,
        type: 'transfer-on-site',
        requestNumber: 'REQ-2025-006',
        requestedBy: 'Sarah Kim',
        requestedByEmail: 'sarah.kim@company.com',
        department: 'Operations',
        project: 'Warehouse Inventory Audit',
        reason: 'Equipment needed for annual warehouse inventory audit',
        urgency: 'medium',
        requestDate: '2025-01-15',
        requiredDate: '2025-01-18',
        returnDate: '2025-01-20',
        status: 'completed',
        reviewedBy: 'Sarah Johnson',
        reviewDate: '2025-01-16',
        reviewNotes: 'Approved and completed',
        items: [
            {
                id: 10,
                articleCode: 'SCAN-007',
                articleDescription: 'Barcode Scanner Handheld',
                quantity: 5,
                unit: 'units',
                imageUrl: 'https://images.unsplash.com/photo-1588508065123-287b28e013da?w=300'
            },
            {
                id: 11,
                articleCode: 'TAB-009',
                articleDescription: 'Tablet Samsung Galaxy Tab',
                quantity: 3,
                unit: 'units',
                imageUrl: 'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=300'
            }
        ]
    },
    {
        id: 7,
        type: 'purchase-on-site',
        requestNumber: 'REQ-2025-007',
        requestedBy: 'Robert Chang',
        requestedByEmail: 'robert.chang@company.com',
        department: 'Engineering',
        reason: 'Urgent replacement for damaged equipment',
        urgency: 'urgent',
        requestDate: '2025-01-24',
        requiredDate: '2025-01-25',
        status: 'pending',
        purchasedBy: 'applicant',
        items: [
            {
                id: 12,
                articleCode: 'DRILL-012',
                articleDescription: 'Cordless Drill DeWalt 20V',
                quantity: 1,
                unit: 'units',
                estimatedCost: 180.00,
                imageUrl: 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=300'
            },
            {
                id: 13,
                articleCode: 'BITS-025',
                articleDescription: 'Drill Bit Set Professional',
                quantity: 1,
                unit: 'sets',
                estimatedCost: 45.00,
                imageUrl: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=300'
            }
        ]
    }
];