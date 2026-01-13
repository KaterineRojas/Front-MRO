import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';

import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Plus, UserCheck, CheckCircle, AlertCircle, XCircle, FileText, Clock, Eye, Package, Undo, ClipboardCheck, Truck, Archive, Printer } from 'lucide-react';


interface LoanItem {
  id: number;
  articleBinCode: string;
  articleName: string;
  articleDescription: string;
  articleType: 'consumable' | 'non-consumable';
  quantity: number;
  unit: string;
  returnedQuantity?: number;
  status: 'pending' | 'active' | 'returned' | 'partial' | 'lost' | 'damaged';
}

interface Loan {
  id: number;
  articleBinCode: string;
  articleName: string;
  articleDescription: string;
  articleType: 'consumable' | 'non-consumable';
  quantity: number;
  unit: string;
  borrower: string;
  borrowerEmail: string;
  department: string;
  project: string;
  loanDate: string;
  expectedReturnDate: string;
  actualReturnDate?: string;
  status: 'active' | 'returned' | 'overdue' | 'lost' | 'damaged';
  notes: string;
  approvedBy: string;
  createdAt: string;
}

interface LoanRequest {
  id: number;
  requestNumber: string;
  borrower: string;
  borrowerEmail: string;
  department: string;
  project: string;
  requestedLoanDate: string;
  expectedReturnDate: string;
  status: 'pending-approval' | 'approved' | 'packed' | 'pending-to-return' | 'returned' | 'completed' | 'rejected' | 'processed' | 'ready-for-packing' | 'delivered' | 'inactive';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  notes: string;
  requestedBy: string;
  approvedBy?: string;
  processedBy?: string;
  createdAt: string;
  items: LoanItem[];
}

const mockLoanRequests: LoanRequest[] = [
  {
    id: 1,
    requestNumber: 'LR-2025-001',
    borrower: 'Emma Davis',
    borrowerEmail: 'emma.davis@company.com',
    department: 'Sales',
    project: 'Client Presentations Q1',
    requestedLoanDate: '2025-01-25',
    expectedReturnDate: '2025-02-01',
    status: 'pending-to-return',
    priority: 'high',
    notes: 'Need for important client presentations during Q1',
    requestedBy: 'Emma Davis',
    createdAt: '2025-01-22T10:30:00Z',
    items: [
      {
        id: 1,
        articleBinCode: 'BIN-TECH-002',
        articleName: 'Dell Latitude Laptop',
        articleDescription: 'Laptop Dell Latitude 5520',
        articleType: 'non-consumable',
        quantity: 2,
        unit: 'units',
        status: 'pending'
      },
      {
        id: 11,
        articleBinCode: 'BIN-TECH-009',
        articleName: 'Wireless Mouse',
        articleDescription: 'Wireless Mouse',
        articleType: 'non-consumable',
        quantity: 3,
        unit: 'units',
        status: 'pending'
      },
      {
        id: 12,
        articleBinCode: 'BIN-OFFICE-015',
        articleName: 'Presentation Clicker',
        articleDescription: 'Presentation Clicker',
        articleType: 'non-consumable',
        quantity: 1,
        unit: 'units',
        status: 'pending'
      }
    ]
  },
  {
    id: 2,
    requestNumber: 'LR-2025-004',
    borrower: 'Ana Martinez',
    borrowerEmail: 'ana.martinez@company.com',
    department: 'Design',
    project: 'UI/UX Redesign',
    requestedLoanDate: '2025-01-26',
    expectedReturnDate: '2025-02-05',
    status: 'pending-to-return',
    priority: 'medium',
    notes: 'Equipment needed for design mockups',
    requestedBy: 'Ana Martinez',
    createdAt: '2025-01-23T14:00:00Z',
    items: [
      {
        id: 2,
        articleBinCode: 'BIN-TECH-005',
        articleName: 'Graphics Tablet',
        articleDescription: 'Graphics Tablet Professional',
        articleType: 'non-consumable',
        quantity: 1,
        unit: 'units',
        status: 'pending'
      },
      {
        id: 21,
        articleBinCode: 'BIN-TECH-012',
        articleName: 'Digital Stylus',
        articleDescription: 'Digital Stylus Pro',
        articleType: 'non-consumable',
        quantity: 2,
        unit: 'units',
        status: 'pending'
      },
      {
        id: 22,
        articleBinCode: 'BIN-OFFICE-020',
        articleName: 'Color Calibration Tool',
        articleDescription: 'Color Calibration Tool',
        articleType: 'non-consumable',
        quantity: 1,
        unit: 'units',
        status: 'pending'
      }
    ]
  },
  {
    id: 3,
    requestNumber: 'LR-2025-008',
    borrower: 'Carlos Rodriguez',
    borrowerEmail: 'carlos.rodriguez@company.com',
    department: 'Engineering',
    project: 'Product Testing Phase 3',
    requestedLoanDate: '2025-01-28',
    expectedReturnDate: '2025-02-10',
    status: 'pending-to-return',
    priority: 'urgent',
    notes: 'Critical testing equipment for final validation',
    requestedBy: 'Carlos Rodriguez',
    createdAt: '2025-01-26T09:15:00Z',
    items: [
      {
        id: 31,
        articleBinCode: 'BIN-TEST-005',
        articleName: 'Digital Oscilloscope',
        articleDescription: 'Digital Oscilloscope',
        articleType: 'non-consumable',
        quantity: 1,
        unit: 'units',
        status: 'pending'
      },
      {
        id: 32,
        articleBinCode: 'BIN-TEST-006',
        articleName: 'Professional Multimeter',
        articleDescription: 'Multimeter Professional',
        articleType: 'non-consumable',
        quantity: 3,
        unit: 'units',
        status: 'pending'
      },
      {
        id: 33,
        articleBinCode: 'BIN-TOOL-025',
        articleName: 'Precision Screwdriver Set',
        articleDescription: 'Precision Screwdriver Set',
        articleType: 'non-consumable',
        quantity: 2,
        unit: 'sets',
        status: 'pending'
      },
      {
        id: 34,
        articleBinCode: 'BIN-SAFETY-010',
        articleName: 'Anti-static Wrist Strap',
        articleDescription: 'Anti-static Wrist Strap',
        articleType: 'consumable',
        quantity: 5,
        unit: 'units',
        status: 'pending'
      }
    ]
  },
  {
    id: 4,
    requestNumber: 'LR-2025-009',
    borrower: 'Maria Gonzalez',
    borrowerEmail: 'maria.gonzalez@company.com',
    department: 'Marketing',
    project: 'Social Media Campaign',
    requestedLoanDate: '2025-01-29',
    expectedReturnDate: '2025-02-08',
    status: 'pending-to-return',
    priority: 'medium',
    notes: 'Equipment for content creation and video recording',
    requestedBy: 'Maria Gonzalez',
    createdAt: '2025-01-27T14:30:00Z',
    items: [
      {
        id: 41,
        articleBinCode: 'BIN-CAM-001',
        articleName: 'Canon EOS R5 Camera',
        articleDescription: 'DSLR Camera Canon EOS R5',
        articleType: 'non-consumable',
        quantity: 1,
        unit: 'units',
        status: 'pending'
      },
      {
        id: 42,
        articleBinCode: 'BIN-CAM-005',
        articleName: 'Camera Lens 24-70mm',
        articleDescription: 'Camera Lens 24-70mm',
        articleType: 'non-consumable',
        quantity: 2,
        unit: 'units',
        status: 'pending'
      },
      {
        id: 43,
        articleBinCode: 'BIN-LIGHT-002',
        articleName: 'LED Ring Light',
        articleDescription: 'LED Ring Light',
        articleType: 'non-consumable',
        quantity: 3,
        unit: 'units',
        status: 'pending'
      },
      {
        id: 44,
        articleBinCode: 'BIN-AUD-003',
        articleName: 'Wireless Microphone',
        articleDescription: 'Wireless Microphone System',
        articleType: 'non-consumable',
        quantity: 1,
        unit: 'units',
        status: 'pending'
      },
      {
        id: 45,
        articleBinCode: 'BIN-ACC-010',
        articleName: 'Professional Camera Tripod',
        articleDescription: 'Camera Tripod Professional',
        articleType: 'non-consumable',
        quantity: 2,
        unit: 'units',
        status: 'pending'
      }
    ]
  },
  {
    id: 5,
    requestNumber: 'LR-2025-010',
    borrower: 'David Kim',
    borrowerEmail: 'david.kim@company.com',
    department: 'IT Support',
    project: 'Network Infrastructure Upgrade',
    requestedLoanDate: '2025-01-30',
    expectedReturnDate: '2025-02-12',
    status: 'pending-to-return',
    priority: 'high',
    notes: 'Specialized tools for network equipment installation',
    requestedBy: 'David Kim',
    createdAt: '2025-01-28T11:45:00Z',
    items: [
      {
        id: 51,
        articleBinCode: 'BIN-NET-001',
        articleName: 'Network Cable Tester',
        articleDescription: 'Network Cable Tester',
        articleType: 'non-consumable',
        quantity: 1,
        unit: 'units',
        status: 'pending'
      },
      {
        id: 52,
        articleBinCode: 'BIN-NET-005',
        articleName: 'Fiber Optic Kit',
        articleDescription: 'Fiber Optic Connector Kit',
        articleType: 'non-consumable',
        quantity: 1,
        unit: 'kits',
        status: 'pending'
      },
      {
        id: 53,
        articleBinCode: 'BIN-TOOL-030',
        articleName: 'RJ45 Crimping Tool',
        articleDescription: 'Crimping Tool RJ45',
        articleType: 'non-consumable',
        quantity: 2,
        unit: 'units',
        status: 'pending'
      },
      {
        id: 54,
        articleBinCode: 'BIN-CONS-020',
        articleName: 'Cat6 Ethernet Cable',
        articleDescription: 'Ethernet Cable Cat6 - 50m',
        articleType: 'consumable',
        quantity: 10,
        unit: 'meters',
        status: 'pending'
      },
      {
        id: 55,
        articleBinCode: 'BIN-CONS-021',
        articleName: 'RJ45 Connectors',
        articleDescription: 'RJ45 Connectors',
        articleType: 'consumable',
        quantity: 50,
        unit: 'pieces',
        status: 'pending'
      }
    ]
  },
  {
    id: 6,
    requestNumber: 'LR-2025-011',
    borrower: 'Jennifer White',
    borrowerEmail: 'jennifer.white@company.com',
    department: 'Training',
    project: 'Technical Workshop Series',
    requestedLoanDate: '2025-01-31',
    expectedReturnDate: '2025-02-14',
    status: 'pending-to-return',
    priority: 'low',
    notes: 'Training materials for hands-on workshops',
    requestedBy: 'Jennifer White',
    createdAt: '2025-01-29T16:20:00Z',
    items: [
      {
        id: 61,
        articleBinCode: 'BIN-PROJ-005',
        articleName: 'Interactive Projector',
        articleDescription: 'Interactive Projector',
        articleType: 'non-consumable',
        quantity: 1,
        unit: 'units',
        status: 'pending'
      },
      {
        id: 62,
        articleBinCode: 'BIN-COMP-010',
        articleName: 'Training Laptop',
        articleDescription: 'Training Laptop',
        articleType: 'non-consumable',
        quantity: 8,
        unit: 'units',
        status: 'pending'
      },
      {
        id: 63,
        articleBinCode: 'BIN-AUD-005',
        articleName: 'Wireless Headset',
        articleDescription: 'Wireless Headset',
        articleType: 'non-consumable',
        quantity: 15,
        unit: 'units',
        status: 'pending'
      },
      {
        id: 64,
        articleBinCode: 'BIN-OFFICE-025',
        articleName: 'Portable Whiteboard',
        articleDescription: 'Whiteboard Portable',
        articleType: 'non-consumable',
        quantity: 3,
        unit: 'units',
        status: 'pending'
      },
      {
        id: 65,
        articleBinCode: 'BIN-CONS-030',
        articleName: 'Training Manual Set',
        articleDescription: 'Training Manuals Set',
        articleType: 'consumable',
        quantity: 25,
        unit: 'sets',
        status: 'pending'
      }
    ]
  }
];

// Rest of your existing mock data and component logic would continue here...
// This is just showing the pattern for updating the interfaces and data

interface LoanManagementProps {
  onViewDetail: (request: LoanRequest) => void;
  onReturnItems: (request: LoanRequest) => void;
}

export function LoanManagement({ onViewDetail, onReturnItems }: LoanManagementProps) {
  // Component implementation continues with all the updated field names...
  return (
    <div>
      {/* Your existing component JSX with updated field references */}
    </div>
  );
}