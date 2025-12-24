import { PurchaseRequest } from '../types/purchase';

export const MOCK_ORDERS: PurchaseRequest[] = [
    {
        id: 101,
        requestNumber: "REQ-2025-001",
        requesterId: 45,
        requesterName: "Sarah Connor",
        warehouseId: 10,
        warehouseName: "Central Hub",
        departmentName: "Logistics",
        projectName: "Skynet Upgrade",
        status: 0, // Pending
        priority: 3, // Urgent
        selfPurchase: false,
        totalAmount: 5420.50,
        totalItems: 12,
        totalQuantity: 450,
        approvedByName: null,
        approvedAt: null,
        supplier: "Cyberdyne Systems",
        createdAt: "2025-12-20T09:15:00Z",
        orderedAt: null,
        receivedAt: null
    },
    {
        id: 102,
        requestNumber: "REQ-2025-002",
        requesterId: 12,
        requesterName: "John Wick",
        warehouseId: 2,
        warehouseName: "Continental Storage",
        departmentName: "Security",
        projectName: "Tactical Gear",
        status: 1, // Approved
        priority: 2, // High
        selfPurchase: true,
        totalAmount: 12500.00,
        totalItems: 4,
        totalQuantity: 4,
        approvedByName: "Winston Scott",
        approvedAt: "2025-12-21T14:30:00Z",
        supplier: "High Table Supplies",
        createdAt: "2025-12-21T10:00:00Z",
        orderedAt: null,
        receivedAt: null
    },
    {
        id: 103,
        requestNumber: "REQ-2025-003",
        requesterId: 8,
        requesterName: "Ellen Ripley",
        warehouseId: 4,
        warehouseName: "Nostromo Bay",
        departmentName: "Maintenance",
        projectName: "HVAC Repair",
        status: 2, // Rejected
        priority: 1, // Medium
        selfPurchase: false,
        totalAmount: 350.75,
        totalItems: 2,
        totalQuantity: 10,
        approvedByName: null,
        approvedAt: null,
        supplier: "Weyland-Yutani",
        createdAt: "2025-12-22T08:45:00Z",
        orderedAt: null,
        receivedAt: null
    },
    {
        id: 104,
        requestNumber: "REQ-2025-004",
        requesterId: 55,
        requesterName: "Tony Stark",
        warehouseId: 1,
        warehouseName: "Stark Tower Lab",
        departmentName: "R&D",
        projectName: "Mark 42",
        status: 0, // Pending
        priority: 0, // Low
        selfPurchase: false,
        totalAmount: 85000.00,
        totalItems: 1,
        totalQuantity: 1,
        approvedByName: null,
        approvedAt: null,
        supplier: "Stark Ind",
        createdAt: "2025-12-23T11:20:00Z",
        orderedAt: null,
        receivedAt: null
    },
    {
        id: 105,
        requestNumber: "REQ-2025-005",
        requesterId: 3,
        requesterName: "Walter White",
        warehouseId: 9,
        warehouseName: "Lab 3",
        departmentName: "Chemistry",
        projectName: "Blue Sky",
        status: 3, // Completed (or Ordered)
        priority: 3, // Urgent
        selfPurchase: true,
        totalAmount: 1200.00,
        totalItems: 6,
        totalQuantity: 24,
        approvedByName: "Gus Fring",
        approvedAt: "2025-12-18T16:00:00Z",
        supplier: "Madrigal Electromotive",
        createdAt: "2025-12-18T09:00:00Z",
        orderedAt: "2025-12-19T10:00:00Z",
        receivedAt: "2025-12-20T11:30:00Z"
    },
    {
        id: 106,
        requestNumber: "REQ-2025-006",
        requesterId: 22,
        requesterName: "Bruce Wayne",
        warehouseId: 5,
        warehouseName: "Batcave",
        departmentName: "Operations",
        projectName: "Vehicle Maintenance",
        status: 0, // Pending
        priority: 1, // Medium
        selfPurchase: false,
        totalAmount: 4500.25,
        totalItems: 8,
        totalQuantity: 16,
        approvedByName: null,
        approvedAt: null,
        supplier: "Fox Tech",
        createdAt: "2025-12-23T13:45:00Z",
        orderedAt: null,
        receivedAt: null
    }
];