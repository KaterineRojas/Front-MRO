import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Plus, UserCheck, CheckCircle, AlertCircle, XCircle, FileText, Clock, Eye, Package, Undo, ClipboardCheck, Truck, Archive, Printer, ChevronDown, ChevronRight, Filter, History } from 'lucide-react';


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
  imageUrl?: string;
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
  status: 'pending-approval' | 'approved' | 'packed' | 'pending-to-return' | 'returned' | 'completed' | 'rejected' | 'processed' | 'ready-for-packing' | 'delivered' | 'inactive' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  notes: string;
  requestedBy: string;
  approvedBy?: string;
  processedBy?: string;
  createdAt: string;
  items: LoanItem[];
}

interface PartialReturnRecord {
  id: number;
  returnDate: string;
  returnedBy: string;
  returnedItems: {
    itemId: number;
    articleBinCode: string;
    articleName: string;
    quantityGood: number;
    quantityDefective: number;
    notes: string;
    imageUrl?: string;
    isKit?: boolean;
  }[];
  generalNotes: string;
  processedBy: string;
  isKit?: boolean;
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
        status: 'pending',
        imageUrl: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=300'
      },
      {
        id: 11,
        articleBinCode: 'BIN-TECH-009',
        articleName: 'Wireless Mouse',
        articleDescription: 'Wireless Mouse Professional',
        articleType: 'non-consumable',
        quantity: 3,
        unit: 'units',
        status: 'pending',
        imageUrl: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=300'
      },
      {
        id: 12,
        articleBinCode: 'BIN-OFFICE-015',
        articleName: 'Presentation Clicker',
        articleDescription: 'Wireless Presentation Remote Control',
        articleType: 'non-consumable',
        quantity: 2,
        unit: 'units',
        status: 'pending',
        imageUrl: 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=300'
      },
      {
        id: 13,
        articleBinCode: 'BIN-TECH-018',
        articleName: 'USB-C Hub',
        articleDescription: 'Multi-port USB-C Hub with HDMI',
        articleType: 'non-consumable',
        quantity: 2,
        unit: 'units',
        status: 'pending',
        imageUrl: 'https://images.unsplash.com/photo-1625948515291-69613efd103f?w=300'
      },
      {
        id: 14,
        articleBinCode: 'BIN-OFFICE-025',
        articleName: 'Portable Whiteboard',
        articleDescription: 'Magnetic Portable Whiteboard 24x18',
        articleType: 'non-consumable',
        quantity: 1,
        unit: 'units',
        status: 'pending',
        imageUrl: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=300'
      }
    ]
  },
  {
    id: 2,
    requestNumber: 'KIT-2025-004',
    borrower: 'Ana Martinez',
    borrowerEmail: 'ana.martinez@company.com',
    department: 'Design',
    project: 'UI/UX Redesign',
    requestedLoanDate: '2025-01-26',
    expectedReturnDate: '2025-02-05',
    status: 'pending-to-return',
    priority: 'medium',
    notes: 'Equipment needed for design mockups and user testing - Kit Order',
    requestedBy: 'Ana Martinez',
    createdAt: '2025-01-23T14:00:00Z',
    items: [
      {
        id: 2,
        articleBinCode: 'BIN-TECH-005',
        articleName: 'Graphics Tablet',
        articleDescription: 'Wacom Intuos Pro Graphics Tablet',
        articleType: 'non-consumable',
        quantity: 2,
        unit: 'units',
        status: 'pending',
        imageUrl: 'https://images.unsplash.com/photo-1596727147705-61a532a659bd?w=300'
      },
      {
        id: 21,
        articleBinCode: 'BIN-TECH-012',
        articleName: 'Digital Stylus',
        articleDescription: 'Apple Pencil 2nd Generation',
        articleType: 'non-consumable',
        quantity: 3,
        unit: 'units',
        status: 'pending',
        imageUrl: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=300'
      },
      {
        id: 22,
        articleBinCode: 'BIN-OFFICE-020',
        articleName: 'Color Calibration Tool',
        articleDescription: 'X-Rite ColorMunki Display',
        articleType: 'non-consumable',
        quantity: 1,
        unit: 'units',
        status: 'pending',
        imageUrl: 'https://images.unsplash.com/photo-1587145820266-a5951ee6f620?w=300'
      },
      {
        id: 23,
        articleBinCode: 'BIN-TECH-030',
        articleName: 'iPad Pro',
        articleDescription: 'iPad Pro 12.9 inch for design work',
        articleType: 'non-consumable',
        quantity: 2,
        unit: 'units',
        status: 'pending',
        imageUrl: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=300'
      },
      {
        id: 24,
        articleBinCode: 'BIN-LIGHTING-001',
        articleName: 'LED Light Ring',
        articleDescription: 'Professional LED Ring Light 18 inch',
        articleType: 'non-consumable',
        quantity: 1,
        unit: 'units',
        status: 'pending',
        imageUrl: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=300'
      },
      {
        id: 25,
        articleBinCode: 'BIN-CAMERA-003',
        articleName: 'DSLR Camera',
        articleDescription: 'Canon EOS R6 Mark II',
        articleType: 'non-consumable',
        quantity: 1,
        unit: 'units',
        status: 'pending',
        imageUrl: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=300'
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
    status: 'completed',
    priority: 'urgent',
    notes: 'Critical testing equipment for final product validation before launch',
    requestedBy: 'Carlos Rodriguez',
    createdAt: '2025-01-26T09:15:00Z',
    items: [
      {
        id: 31,
        articleBinCode: 'BIN-TEST-005',
        articleName: 'Digital Oscilloscope',
        articleDescription: 'Tektronix MSO64 Mixed Signal Oscilloscope',
        articleType: 'non-consumable',
        quantity: 2,
        unit: 'units',
        status: 'pending',
        imageUrl: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=300'
      }
    ]
  },
  {
    id: 7,
    requestNumber: 'LR-2025-015',
    borrower: 'Laura Stevens',
    borrowerEmail: 'laura.stevens@company.com',
    department: 'Marketing',
    project: 'Product Launch Campaign Q1',
    requestedLoanDate: '2025-01-20',
    expectedReturnDate: '2025-02-15',
    status: 'completed',
    priority: 'high',
    notes: 'Complete equipment package for multi-phase marketing campaign',
    requestedBy: 'Laura Stevens',
    createdAt: '2025-01-19T11:00:00Z',
    items: [
      {
        id: 71,
        articleBinCode: 'BIN-CAM-001',
        articleName: 'DSLR Camera Canon EOS R5',
        articleDescription: 'Canon EOS R5 Mirrorless Camera Body',
        articleType: 'non-consumable',
        quantity: 2,
        unit: 'units',
        status: 'pending',
        imageUrl: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=300'
      },
      {
        id: 72,
        articleBinCode: 'BIN-LIGHT-002',
        articleName: 'LED Panel Light',
        articleDescription: 'Professional LED Panel Light 1000W',
        articleType: 'non-consumable',
        quantity: 4,
        unit: 'units',
        status: 'pending',
        imageUrl: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=300'
      },
      {
        id: 73,
        articleBinCode: 'BIN-AUDIO-003',
        articleName: 'Wireless Microphone System',
        articleDescription: 'Shure UHF Wireless Mic System',
        articleType: 'non-consumable',
        quantity: 3,
        unit: 'units',
        status: 'pending',
        imageUrl: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=300'
      },
      {
        id: 74,
        articleBinCode: 'BIN-TECH-025',
        articleName: 'Laptop MacBook Pro',
        articleDescription: 'MacBook Pro 16-inch M2 Max',
        articleType: 'non-consumable',
        quantity: 2,
        unit: 'units',
        status: 'pending',
        imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300'
      }
    ]
  },
  {
    id: 8,
    requestNumber: 'LR-2025-020',
    borrower: 'Robert Chen',
    borrowerEmail: 'robert.chen@company.com',
    department: 'Operations',
    project: 'Warehouse Optimization Project',
    requestedLoanDate: '2025-01-15',
    expectedReturnDate: '2025-02-10',
    status: 'completed',
    priority: 'medium',
    notes: 'Equipment for warehouse layout and efficiency improvements',
    requestedBy: 'Robert Chen',
    createdAt: '2025-01-14T14:30:00Z',
    items: [
      {
        id: 81,
        articleBinCode: 'BIN-TOOL-015',
        articleName: 'Laser Distance Measurer',
        articleDescription: 'Bosch GLM 50 C Laser Measure',
        articleType: 'non-consumable',
        quantity: 3,
        unit: 'units',
        status: 'pending',
        imageUrl: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=300'
      },
      {
        id: 82,
        articleBinCode: 'BIN-TECH-030',
        articleName: 'Tablet iPad Pro',
        articleDescription: 'iPad Pro 12.9 inch with Apple Pencil',
        articleType: 'non-consumable',
        quantity: 5,
        unit: 'units',
        status: 'pending',
        imageUrl: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=300'
      }
    ]
  },
  {
    id: 9,
    requestNumber: 'LR-2025-025',
    borrower: 'Michelle Park',
    borrowerEmail: 'michelle.park@company.com',
    department: 'Training',
    project: 'Technical Training Workshop Series',
    requestedLoanDate: '2025-01-10',
    expectedReturnDate: '2025-02-05',
    status: 'completed',
    priority: 'high',
    notes: 'Equipment for comprehensive training program',
    requestedBy: 'Michelle Park',
    createdAt: '2025-01-09T10:00:00Z',
    items: [
      {
        id: 91,
        articleBinCode: 'BIN-PROJ-005',
        articleName: 'Interactive Projector',
        articleDescription: 'Epson BrightLink 696Ui Interactive Projector',
        articleType: 'non-consumable',
        quantity: 2,
        unit: 'units',
        status: 'pending',
        imageUrl: 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=300'
      },
      {
        id: 92,
        articleBinCode: 'BIN-AUDIO-010',
        articleName: 'Portable PA System',
        articleDescription: 'Bose S1 Pro Portable PA System',
        articleType: 'non-consumable',
        quantity: 3,
        unit: 'units',
        status: 'pending',
        imageUrl: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=300'
      },
      {
        id: 93,
        articleBinCode: 'BIN-OFFICE-030',
        articleName: 'Portable Whiteboard',
        articleDescription: 'Mobile Whiteboard 72x48 inch',
        articleType: 'non-consumable',
        quantity: 4,
        unit: 'units',
        status: 'pending',
        imageUrl: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=300'
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
    status: 'rejected',
    priority: 'medium',
    notes: 'Equipment for content creation, video recording, and live streaming events',
    requestedBy: 'Maria Gonzalez',
    createdAt: '2025-01-27T14:30:00Z',
    items: [
      {
        id: 41,
        articleBinCode: 'BIN-CAM-001',
        articleName: 'DSLR Camera Canon EOS R5',
        articleDescription: 'Canon EOS R5 Mirrorless Camera Body',
        articleType: 'non-consumable',
        quantity: 2,
        unit: 'units',
        status: 'pending',
        imageUrl: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=300'
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
    status: 'approved',
    priority: 'high',
    notes: 'Specialized tools and equipment for complete network infrastructure overhaul',
    requestedBy: 'David Kim',
    createdAt: '2025-01-28T11:45:00Z',
    items: [
      {
        id: 51,
        articleBinCode: 'BIN-NET-001',
        articleName: 'Network Cable Tester',
        articleDescription: 'Fluke Networks CIQ-100 CableIQ',
        articleType: 'non-consumable',
        quantity: 2,
        unit: 'units',
        status: 'pending',
        imageUrl: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=300'
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
    status: 'packed',
    priority: 'low',
    notes: 'Training materials and equipment for hands-on technical workshops and certification programs',
    requestedBy: 'Jennifer White',
    createdAt: '2025-01-29T16:20:00Z',
    items: [
      {
        id: 61,
        articleBinCode: 'BIN-PROJ-005',
        articleName: 'Interactive Projector',
        articleDescription: 'Epson BrightLink 696Ui Interactive Projector',
        articleType: 'non-consumable',
        quantity: 2,
        unit: 'units',
        status: 'pending',
        imageUrl: 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=300'
      }
    ]
  }
];

const mockPurchaseOnSiteRequests: LoanRequest[] = [
  {
    id: 10,
    requestNumber: 'POS-2025-001',
    borrower: 'Michael Chen',
    borrowerEmail: 'michael.chen@company.com',
    department: 'Engineering',
    project: 'Emergency Repair',
    requestedLoanDate: '2025-01-23',
    expectedReturnDate: '2025-01-23',
    status: 'pending-approval',
    priority: 'urgent',
    notes: 'Urgent equipment needed for emergency repair',
    requestedBy: 'Michael Chen',
    createdAt: '2025-01-23T08:30:00Z',
    items: [
      {
        id: 101,
        articleBinCode: 'BIN-TOOL-029',
        articleName: 'Power Drill Set',
        articleDescription: 'Power Drill Set',
        articleType: 'non-consumable',
        quantity: 1,
        unit: 'units',
        status: 'pending',
        imageUrl: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=300'
      }
    ]
  }
];

const mockReadyForPacking: LoanRequest[] = [
  {
    id: 40,
    requestNumber: 'LR-2025-002',
    borrower: 'Diana Wilson',
    borrowerEmail: 'diana.wilson@company.com',
    department: 'Marketing',
    project: 'Trade Show Booth',
    requestedLoanDate: '2025-01-26',
    expectedReturnDate: '2025-02-02',
    status: 'approved',
    priority: 'high',
    notes: 'All items verified and ready for packaging',
    requestedBy: 'Diana Wilson',
    approvedBy: 'John Smith',
    createdAt: '2025-01-24T11:00:00Z',
    items: [
      {
        id: 401,
        articleBinCode: 'BIN-DISP-001',
        articleName: 'Portable Display Stand',
        articleDescription: 'Display Stand Portable',
        articleType: 'non-consumable',
        quantity: 2,
        unit: 'units',
        status: 'pending',
        imageUrl: 'https://images.unsplash.com/photo-1505330622279-bf7d7fc918f4?w=300'
      },
      {
        id: 402,
        articleBinCode: 'BIN-TECH-007',
        articleName: 'Wireless Remote',
        articleDescription: 'Wireless Presentation Remote',
        articleType: 'non-consumable',
        quantity: 1,
        unit: 'units',
        status: 'pending',
        imageUrl: 'https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?w=300'
      }
    ]
  },
  {
    id: 41,
    requestNumber: 'KIT-2025-001',
    borrower: 'Thomas Anderson',
    borrowerEmail: 'thomas.anderson@company.com',
    department: 'Engineering',
    project: 'Field Testing Q1',
    requestedLoanDate: '2025-02-01',
    expectedReturnDate: '2025-02-15',
    status: 'approved',
    priority: 'urgent',
    notes: 'Critical field testing equipment for Q1 deliverables - Kit Order',
    requestedBy: 'Thomas Anderson',
    approvedBy: 'John Smith',
    createdAt: '2025-01-30T14:20:00Z',
    items: [
      {
        id: 411,
        articleBinCode: 'BIN-TEST-008',
        articleName: 'Spectrum Analyzer',
        articleDescription: 'RF Spectrum Analyzer 9kHz-26.5GHz',
        articleType: 'non-consumable',
        quantity: 1,
        unit: 'units',
        status: 'pending',
        imageUrl: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=300'
      },
      {
        id: 412,
        articleBinCode: 'BIN-TEST-010',
        articleName: 'Signal Generator',
        articleDescription: 'RF Signal Generator with Modulation',
        articleType: 'non-consumable',
        quantity: 1,
        unit: 'units',
        status: 'pending',
        imageUrl: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=300'
      }
    ]
  }
];

const mockPackingList: LoanRequest[] = [
  {
    id: 50,
    requestNumber: 'LR-2025-003',
    borrower: 'Carlos Rodriguez',
    borrowerEmail: 'carlos.rodriguez@company.com',
    department: 'Operations',
    project: 'Site Installation',
    requestedLoanDate: '2025-01-27',
    expectedReturnDate: '2025-02-03',
    status: 'packed',
    priority: 'urgent',
    notes: 'Ready for pickup/delivery',
    requestedBy: 'Carlos Rodriguez',
    approvedBy: 'John Smith',
    createdAt: '2025-01-25T09:15:00Z',
    items: [
      {
        id: 501,
        articleBinCode: 'BIN-TOOL-015',
        articleName: 'Installation Kit Complete',
        articleDescription: 'Installation Kit Complete',
        articleType: 'non-consumable',
        quantity: 1,
        unit: 'units',
        status: 'pending',
        imageUrl: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=300'
      }
    ]
  }
];

const mockLoans: Loan[] = [
  {
    id: 1,
    articleBinCode: 'BIN-TECH-002',
    articleName: 'Dell Latitude Laptop',
    articleDescription: 'Laptop Dell Latitude 5520',
    articleType: 'non-consumable',
    quantity: 1,
    unit: 'units',
    borrower: 'Sarah Williams',
    borrowerEmail: 'sarah.williams@company.com',
    department: 'Marketing',
    project: 'Product Launch Campaign',
    loanDate: '2025-01-15',
    expectedReturnDate: '2025-01-29',
    status: 'active',
    notes: 'For remote work during product launch',
    approvedBy: 'John Smith',
    createdAt: '2025-01-14T09:00:00Z'
  }
];

interface Kit {
  id: number;
  binCode: string;
  name: string;
  description: string;
  category: string;
  items: any[];
}

const mockKits: Kit[] = [
  {
    id: 1,
    binCode: 'KIT-OFFICE-001',
    name: 'Basic Office Starter Kit',
    description: 'Complete office setup kit for new employees',
    category: 'office-supplies',
    items: [
      { id: 1, articleId: 1, articleBinCode: 'BIN-OFF-001', articleName: 'Wireless Mouse', quantity: 1, imageUrl: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=100&h=100&fit=crop' },
      { id: 2, articleId: 2, articleBinCode: 'BIN-OFF-002', articleName: 'Mechanical Keyboard', quantity: 1, imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=100&h=100&fit=crop' },
      { id: 3, articleId: 3, articleBinCode: 'BIN-OFF-003', articleName: 'Monitor Stand', quantity: 1, imageUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=100&h=100&fit=crop' },
      { id: 4, articleId: 4, articleBinCode: 'BIN-OFF-004', articleName: 'USB Hub 4-Port', quantity: 1, imageUrl: 'https://images.unsplash.com/photo-1625948515291-69613efd103f?w=100&h=100&fit=crop' },
      { id: 5, articleId: 5, articleBinCode: 'BIN-STAT-001', articleName: 'Notebook Set', quantity: 3, imageUrl: 'https://images.unsplash.com/photo-1517842264405-4f052a6fc8c2?w=100&h=100&fit=crop' }
    ]
  },
  {
    id: 2,
    binCode: 'KIT-SAFETY-001',
    name: 'Personal Safety Kit',
    description: 'Complete personal protective equipment kit',
    category: 'safety-equipment',
    items: [
      { id: 6, articleId: 10, articleBinCode: 'BIN-SAFETY-001', articleName: 'Safety Helmet', quantity: 1, imageUrl: 'https://images.unsplash.com/photo-1504681869696-d977211a5f4c?w=100&h=100&fit=crop' },
      { id: 7, articleId: 11, articleBinCode: 'BIN-SAFETY-002', articleName: 'Safety Goggles', quantity: 1, imageUrl: 'https://images.unsplash.com/photo-1509695507497-903c140c43b0?w=100&h=100&fit=crop' },
      { id: 8, articleId: 12, articleBinCode: 'BIN-SAFETY-003', articleName: 'Safety Gloves', quantity: 2, imageUrl: 'https://images.unsplash.com/photo-1603575448878-868a0ca231bd?w=100&h=100&fit=crop' },
      { id: 9, articleId: 13, articleBinCode: 'BIN-SAFETY-004', articleName: 'High Visibility Vest', quantity: 1, imageUrl: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=100&h=100&fit=crop' },
      { id: 10, articleId: 14, articleBinCode: 'BIN-SAFETY-005', articleName: 'First Aid Kit', quantity: 1, imageUrl: 'https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=100&h=100&fit=crop' }
    ]
  },
  {
    id: 3,
    binCode: 'KIT-TECH-001',
    name: 'Presentation Equipment Kit',
    description: 'Complete setup for presentations and meetings',
    category: 'technology',
    items: [
      { id: 11, articleId: 20, articleBinCode: 'BIN-TECH-001', articleName: 'Portable Projector', quantity: 1, imageUrl: 'https://images.unsplash.com/photo-1605647540924-852290f6b0d5?w=100&h=100&fit=crop' },
      { id: 12, articleId: 21, articleBinCode: 'BIN-TECH-002', articleName: 'Wireless Presenter', quantity: 1, imageUrl: 'https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?w=100&h=100&fit=crop' },
      { id: 13, articleId: 22, articleBinCode: 'BIN-TECH-003', articleName: 'HDMI Cable 2m', quantity: 2, imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100&h=100&fit=crop' },
      { id: 14, articleId: 23, articleBinCode: 'BIN-TECH-004', articleName: 'Portable Speaker', quantity: 1, imageUrl: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=100&h=100&fit=crop' }
    ]
  }
];

// Mock return history for completed requests
const mockReturnHistory: Record<number, PartialReturnRecord[]> = {
  3: [ // For LR-2025-008 (completed)
    {
      id: 1,
      returnDate: '2025-02-05',
      returnedBy: 'Carlos Rodriguez',
      isKit: false,
      returnedItems: [
        {
          itemId: 31,
          articleBinCode: 'BIN-TEST-005',
          articleName: 'Digital Oscilloscope',
          quantityGood: 2,
          quantityDefective: 0,
          notes: 'All items returned in excellent condition',
          imageUrl: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=300',
          isKit: false
        }
      ],
      generalNotes: 'Project completed successfully. All equipment returned on time.',
      processedBy: 'John Smith'
    }
  ],
  7: [ // For LR-2025-015 (completed with multiple partial returns)
    {
      id: 1,
      returnDate: '2025-02-01',
      returnedBy: 'Laura Stevens',
      isKit: false,
      returnedItems: [
        {
          itemId: 71,
          articleBinCode: 'BIN-CAM-001',
          articleName: 'DSLR Camera Canon EOS R5',
          quantityGood: 2,
          quantityDefective: 0,
          notes: 'Cameras returned after first phase of campaign',
          imageUrl: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=300',
          isKit: false
        },
        {
          itemId: 74,
          articleBinCode: 'BIN-TECH-025',
          articleName: 'Laptop MacBook Pro',
          quantityGood: 1,
          quantityDefective: 0,
          notes: 'One laptop returned early, still need the other',
          imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300',
          isKit: false
        }
      ],
      generalNotes: 'First phase completed. Partial return after initial campaign videos.',
      processedBy: 'Sarah Williams'
    },
    {
      id: 2,
      returnDate: '2025-02-08',
      returnedBy: 'Laura Stevens',
      isKit: false,
      returnedItems: [
        {
          itemId: 72,
          articleBinCode: 'BIN-LIGHT-002',
          articleName: 'LED Panel Light',
          quantityGood: 3,
          quantityDefective: 1,
          notes: 'One light panel has flickering issue, needs repair',
          imageUrl: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=300',
          isKit: false
        },
        {
          itemId: 73,
          articleBinCode: 'BIN-AUDIO-003',
          articleName: 'Wireless Microphone System',
          quantityGood: 3,
          quantityDefective: 0,
          notes: 'All microphone systems working perfectly',
          imageUrl: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=300',
          isKit: false
        }
      ],
      generalNotes: 'Second phase completed. Most equipment in good condition.',
      processedBy: 'John Smith'
    },
    {
      id: 3,
      returnDate: '2025-02-15',
      returnedBy: 'Laura Stevens',
      isKit: false,
      returnedItems: [
        {
          itemId: 74,
          articleBinCode: 'BIN-TECH-025',
          articleName: 'Laptop MacBook Pro',
          quantityGood: 1,
          quantityDefective: 0,
          notes: 'Final laptop returned after campaign completion',
          imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300',
          isKit: false
        }
      ],
      generalNotes: 'Campaign completed successfully. All remaining equipment returned.',
      processedBy: 'Sarah Williams'
    }
  ],
  8: [ // For LR-2025-020 (completed with multiple returns)
    {
      id: 1,
      returnDate: '2025-01-28',
      returnedBy: 'Robert Chen',
      isKit: false,
      returnedItems: [
        {
          itemId: 81,
          articleBinCode: 'BIN-TOOL-015',
          articleName: 'Laser Distance Measurer',
          quantityGood: 3,
          quantityDefective: 0,
          notes: 'All laser measurers returned after initial survey',
          imageUrl: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=300',
          isKit: false
        }
      ],
      generalNotes: 'Initial warehouse measurements completed.',
      processedBy: 'John Smith'
    },
    {
      id: 2,
      returnDate: '2025-02-10',
      returnedBy: 'Robert Chen',
      isKit: false,
      returnedItems: [
        {
          itemId: 82,
          articleBinCode: 'BIN-TECH-030',
          articleName: 'Tablet iPad Pro',
          quantityGood: 4,
          quantityDefective: 1,
          notes: 'One iPad has cracked screen from accidental drop',
          imageUrl: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=300',
          isKit: false
        }
      ],
      generalNotes: 'Project completed. One device damaged during use.',
      processedBy: 'Sarah Williams'
    }
  ],
  9: [ // For LR-2025-025 (completed with multiple returns)
    {
      id: 1,
      returnDate: '2025-01-25',
      returnedBy: 'Michelle Park',
      isKit: false,
      returnedItems: [
        {
          itemId: 92,
          articleBinCode: 'BIN-AUDIO-010',
          articleName: 'Portable PA System',
          quantityGood: 3,
          quantityDefective: 0,
          notes: 'PA systems returned after first workshop',
          imageUrl: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=300',
          isKit: false
        }
      ],
      generalNotes: 'First training session completed successfully.',
      processedBy: 'John Smith'
    },
    {
      id: 2,
      returnDate: '2025-02-01',
      returnedBy: 'Michelle Park',
      isKit: false,
      returnedItems: [
        {
          itemId: 93,
          articleBinCode: 'BIN-OFFICE-030',
          articleName: 'Portable Whiteboard',
          quantityGood: 4,
          quantityDefective: 0,
          notes: 'All whiteboards in excellent condition',
          imageUrl: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=300',
          isKit: false
        }
      ],
      generalNotes: 'Second phase of training workshops completed.',
      processedBy: 'Sarah Williams'
    },
    {
      id: 3,
      returnDate: '2025-02-05',
      returnedBy: 'Michelle Park',
      isKit: false,
      returnedItems: [
        {
          itemId: 91,
          articleBinCode: 'BIN-PROJ-005',
          articleName: 'Interactive Projector',
          quantityGood: 2,
          quantityDefective: 0,
          notes: 'Projectors returned after final training session',
          imageUrl: 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=300',
          isKit: false
        }
      ],
      generalNotes: 'All training workshops completed. Equipment in perfect condition.',
      processedBy: 'John Smith'
    }
  ]
};

const mockEngineers = [
  'John Smith',
  'Emma Davis',
  'Michael Chen',
  'Sarah Williams',
  'Ana Martinez',
  'Carlos Rodriguez',
  'Maria Gonzalez',
  'David Kim'
];

const mockDepartments = [
  'Engineering',
  'Marketing',
  'Sales',
  'Operations',
  'IT',
  'R&D',
  'Human Resources',
  'Finance',
  'Quality Assurance',
  'Production'
];

interface RequestOrdersProps {
  onViewDetail: (request: LoanRequest, previousTab?: string) => void;
  onReturnItems: (request: LoanRequest, previousTab?: string) => void;
  initialTab?: string;
}

export function RequestOrders({ onViewDetail, onReturnItems, initialTab }: RequestOrdersProps) {
  const [loanRequests, setLoanRequests] = useState<LoanRequest[]>(mockLoanRequests);
  const [purchaseOnSiteRequests, setPurchaseOnSiteRequests] = useState<LoanRequest[]>(mockPurchaseOnSiteRequests);
  const [readyForPacking, setReadyForPacking] = useState<LoanRequest[]>(mockReadyForPacking);
  const [packingList, setPackingList] = useState<LoanRequest[]>(mockPackingList);
  const [loans, setLoans] = useState<Loan[]>(mockLoans);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedRequests, setSelectedRequests] = useState<Set<number>>(new Set());
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set()); // Format: "requestId-itemId"
  const [expandedRequests, setExpandedRequests] = useState<Set<number>>(new Set());
  const [expandedPendingToReturn, setExpandedPendingToReturn] = useState<Set<number>>(new Set());
  const [expandedPurchaseOnSite, setExpandedPurchaseOnSite] = useState<Set<number>>(new Set());
  const [expandedPackingList, setExpandedPackingList] = useState<Set<number>>(new Set());
  const [expandedInactive, setExpandedInactive] = useState<Set<number>>(new Set());
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [selectedHistoryRequest, setSelectedHistoryRequest] = useState<LoanRequest | null>(null);
  const [viewingHistory, setViewingHistory] = useState(false);
  const [createKitOrderOpen, setCreateKitOrderOpen] = useState(false);
  const [kitOrderForm, setKitOrderForm] = useState({
    kitId: '',
    department: '',
    returnDate: '',
    project: '',
    engineer: ''
  });
  const [kitSearchTerm, setKitSearchTerm] = useState('');
  const [departmentSearchTerm, setDepartmentSearchTerm] = useState('');
  const [engineerSearchTerm, setEngineerSearchTerm] = useState('');
  const [itemQuantities, setItemQuantities] = useState<Record<string, number>>({});
  const [quantityNotes, setQuantityNotes] = useState<Record<number, string>>({});

  // Active tab state
  const [activeTab, setActiveTab] = useState<string>(initialTab || 'overview');

  // Overview filters and pagination
  const [overviewFilterType, setOverviewFilterType] = useState<'all' | 'active' | 'department' | 'inactive'>('all');
  const [overviewSecondaryFilter, setOverviewSecondaryFilter] = useState('');
  const [overviewSearchTerm, setOverviewSearchTerm] = useState('');
  const [overviewDisplayCount, setOverviewDisplayCount] = useState(15);
  const [expandedOverview, setExpandedOverview] = useState<Set<number>>(new Set());

  const handleQuantityChange = (requestId: number, itemId: number, newQuantity: number) => {
    const itemKey = `${requestId}-${itemId}`;
    const request = readyForPacking.find(r => r.id === requestId);
    const item = request?.items.find(i => i.id === itemId);
    
    if (item && newQuantity >= 0 && newQuantity <= item.quantity) {
      setItemQuantities(prev => ({
        ...prev,
        [itemKey]: newQuantity
      }));
    }
  };

  const handleQuantityNoteChange = (requestId: number, note: string) => {
    setQuantityNotes(prev => ({
      ...prev,
      [requestId]: note
    }));
  };

  const hasQuantityChanges = (requestId: number): boolean => {
    const request = readyForPacking.find(r => r.id === requestId);
    if (!request) return false;
    
    return request.items.some(item => {
      const itemKey = `${requestId}-${item.id}`;
      const currentQty = itemQuantities[itemKey];
      return currentQty !== undefined && currentQty !== item.quantity;
    });
  };

  const getItemQuantity = (requestId: number, itemId: number): number => {
    const itemKey = `${requestId}-${itemId}`;
    return itemQuantities[itemKey] ?? readyForPacking.find(r => r.id === requestId)?.items.find(i => i.id === itemId)?.quantity ?? 0;
  };

  const handleSelectRequest = (requestId: number) => {
    const newSelection = new Set(selectedRequests);
    if (newSelection.has(requestId)) {
      newSelection.delete(requestId);
    } else {
      newSelection.add(requestId);
    }
    setSelectedRequests(newSelection);
  };

  const handleToggleExpand = (requestId: number) => {
    const newExpanded = new Set(expandedRequests);
    if (newExpanded.has(requestId)) {
      newExpanded.delete(requestId);
    } else {
      newExpanded.add(requestId);
    }
    setExpandedRequests(newExpanded);
  };

  const handleToggleExpandPendingToReturn = (requestId: number) => {
    const newExpanded = new Set(expandedPendingToReturn);
    if (newExpanded.has(requestId)) {
      newExpanded.delete(requestId);
    } else {
      newExpanded.add(requestId);
    }
    setExpandedPendingToReturn(newExpanded);
  };

  const handleToggleExpandPurchaseOnSite = (requestId: number) => {
    const newExpanded = new Set(expandedPurchaseOnSite);
    if (newExpanded.has(requestId)) {
      newExpanded.delete(requestId);
    } else {
      newExpanded.add(requestId);
    }
    setExpandedPurchaseOnSite(newExpanded);
  };

  const handleToggleExpandPackingList = (requestId: number) => {
    const newExpanded = new Set(expandedPackingList);
    if (newExpanded.has(requestId)) {
      newExpanded.delete(requestId);
    } else {
      newExpanded.add(requestId);
    }
    setExpandedPackingList(newExpanded);
  };

  const handleToggleExpandInactive = (requestId: number) => {
    const newExpanded = new Set(expandedInactive);
    if (newExpanded.has(requestId)) {
      newExpanded.delete(requestId);
    } else {
      newExpanded.add(requestId);
    }
    setExpandedInactive(newExpanded);
  };

  const handleViewHistory = (request: LoanRequest) => {
    setSelectedHistoryRequest(request);
    setViewingHistory(true);
  };

  const handleBackFromHistory = () => {
    setViewingHistory(false);
    setSelectedHistoryRequest(null);
  };

  const handleSelectItem = (requestId: number, itemId: number) => {
    const itemKey = `${requestId}-${itemId}`;
    const newSelection = new Set(selectedItems);
    if (newSelection.has(itemKey)) {
      newSelection.delete(itemKey);
    } else {
      newSelection.add(itemKey);
    }
    setSelectedItems(newSelection);
  };

  const handleSelectAllItemsInRequest = (request: LoanRequest, checked: boolean) => {
    const newSelection = new Set(selectedItems);
    request.items.forEach(item => {
      const itemKey = `${request.id}-${item.id}`;
      if (checked) {
        newSelection.add(itemKey);
      } else {
        newSelection.delete(itemKey);
      }
    });
    setSelectedItems(newSelection);
  };

  const areAllItemsSelected = (request: LoanRequest): boolean => {
    return request.items.every(item => selectedItems.has(`${request.id}-${item.id}`));
  };

  const getSelectedItemsCount = (request: LoanRequest): number => {
    return request.items.filter(item => selectedItems.has(`${request.id}-${item.id}`)).length;
  };

  const handleConfirmToPacking = () => {
    if (selectedItems.size === 0) {
      alert('Please select at least one item to pack.');
      return;
    }

    // Group selected items by request
    const itemsByRequest = new Map<number, number[]>();
    selectedItems.forEach(itemKey => {
      const [requestId, itemId] = itemKey.split('-').map(Number);
      if (!itemsByRequest.has(requestId)) {
        itemsByRequest.set(requestId, []);
      }
      itemsByRequest.get(requestId)!.push(itemId);
    });

    // Create new requests for packing list with only selected items
    const newPackingItems: LoanRequest[] = [];
    const updatedReadyForPacking: LoanRequest[] = [];

    readyForPacking.forEach(request => {
      const selectedItemIds = itemsByRequest.get(request.id);
      
      if (selectedItemIds) {
        // Split request into selected and remaining items
        const selectedItemsForRequest = request.items.filter(item => selectedItemIds.includes(item.id));
        const remainingItems = request.items.filter(item => !selectedItemIds.includes(item.id));

        // Add selected items to packing list
        if (selectedItemsForRequest.length > 0) {
          newPackingItems.push({
            ...request,
            status: 'packed',
            items: selectedItemsForRequest
          });
        }

        // Keep remaining items in ready for packing
        if (remainingItems.length > 0) {
          updatedReadyForPacking.push({
            ...request,
            items: remainingItems
          });
        }
      } else {
        // Request not affected, keep as is
        updatedReadyForPacking.push(request);
      }
    });

    setPackingList([...packingList, ...newPackingItems]);
    setReadyForPacking(updatedReadyForPacking);
    setSelectedItems(new Set());
    setExpandedRequests(new Set());
    alert(`${selectedItems.size} item(s) moved to packing list!`);
  };

  const handleMarkAsDelivered = (requestId: number) => {
    const request = packingList.find(req => req.id === requestId);
    if (request) {
      setPackingList(packingList.filter(req => req.id !== requestId));
      alert('Request marked as delivered!');
    }
  };

  const handleCreateKitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    
    const selectedKit = mockKits.find(k => k.id.toString() === kitOrderForm.kitId);
    if (!selectedKit) return;

    // Convert kit items to loan items
    const kitItems: LoanItem[] = selectedKit.items.map((item, index) => ({
      id: Date.now() + index,
      articleBinCode: item.articleBinCode,
      articleName: item.articleName,
      articleDescription: `${item.articleName} (from ${selectedKit.name})`,
      articleType: 'non-consumable',
      quantity: item.quantity,
      unit: 'units',
      status: 'pending' as const,
      imageUrl: item.imageUrl
    }));

    const newRequest: LoanRequest = {
      id: Date.now(),
      requestNumber: `KIT-${new Date().getFullYear()}-${String(readyForPacking.length + 1).padStart(3, '0')}`,
      borrower: kitOrderForm.engineer,
      borrowerEmail: `${kitOrderForm.engineer.toLowerCase().replace(' ', '.')}@company.com`,
      department: kitOrderForm.department,
      project: kitOrderForm.project,
      requestedLoanDate: new Date().toISOString().split('T')[0],
      expectedReturnDate: kitOrderForm.returnDate,
      status: 'approved',
      priority: 'medium',
      notes: `Kit order: ${selectedKit.name}`,
      requestedBy: kitOrderForm.engineer,
      approvedBy: 'System',
      createdAt: new Date().toISOString(),
      items: kitItems
    };

    setReadyForPacking([newRequest, ...readyForPacking]);
    setCreateKitOrderOpen(false);
    setKitOrderForm({
      kitId: '',
      department: '',
      returnDate: '',
      project: '',
      engineer: ''
    });
    setKitSearchTerm('');
    setDepartmentSearchTerm('');
    setEngineerSearchTerm('');
    alert('Kit request order created successfully and added to Ready for Packing!');
  };

  const filteredKits = mockKits.filter(kit => 
    kit.binCode.toLowerCase().includes(kitSearchTerm.toLowerCase()) ||
    kit.name.toLowerCase().includes(kitSearchTerm.toLowerCase())
  );

  const filteredEngineers = mockEngineers.filter(eng =>
    eng.toLowerCase().includes(engineerSearchTerm.toLowerCase())
  );

  const filteredDepartments = mockDepartments.filter(dept =>
    dept.toLowerCase().includes(departmentSearchTerm.toLowerCase())
  );

  const selectedKit = kitOrderForm.kitId ? mockKits.find(k => k.id.toString() === kitOrderForm.kitId) : null;

  // Helper function to check if a request is a kit order
  const isKitOrder = (request: LoanRequest): boolean => {
    return request.requestNumber.startsWith('KIT-');
  };

  const handlePrintSingleOrder = (request: LoanRequest) => {
    const quantityNote = quantityNotes[request.id];
    
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Checking List - ${request.requestNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 10px; }
            .request-card { border: 1px solid #ccc; margin-bottom: 20px; padding: 15px; page-break-inside: avoid; }
            .request-header { background-color: #f5f5f5; padding: 10px; margin: -15px -15px 15px -15px; }
            .items-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            .items-table th, .items-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            .items-table th { background-color: #f9f9f9; }
            .checkbox { width: 20px; height: 20px; border: 2px solid #333; display: inline-block; margin-right: 10px; }
            .priority-high { color: #ff6b35; font-weight: bold; }
            .priority-medium { color: #f7931e; font-weight: bold; }
            .priority-urgent { color: #dc3545; font-weight: bold; }
            .notes { background-color: #f8f9fa; padding: 10px; margin-top: 10px; border-left: 4px solid #007bff; }
            .quantity-note { background-color: #fff3cd; padding: 10px; margin-top: 10px; border-left: 4px solid #ffc107; }
            @media print {
              body { margin: 0; }
              .request-card { page-break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>CHECKING LIST - ${request.requestNumber}</h1>
            <p>Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
          </div>
          
          <div class="request-card">
            <div class="request-header">
              <h2>${request.requestNumber}</h2>
              <p><strong>Borrower:</strong> ${request.borrower} (${request.borrowerEmail})</p>
              <p><strong>Department:</strong> ${request.department} | <strong>Project:</strong> ${request.project}</p>
              <p><strong>Priority:</strong> <span class="priority-${request.priority}">${request.priority.toUpperCase()}</span></p>
              <p><strong>Loan Date:</strong> ${request.requestedLoanDate} | <strong>Expected Return:</strong> ${request.expectedReturnDate}</p>
            </div>
            
            <h3>Items Checklist:</h3>
            <table class="items-table">
              <thead>
                <tr>
                  <th style="width: 30px;">✓</th>
                  <th>BIN Code</th>
                  <th>Description</th>
                  <th>Quantity</th>
                  <th>Unit</th>
                  <th>Verified By</th>
                </tr>
              </thead>
              <tbody>
                ${request.items.map(item => {
                  const itemKey = `${request.id}-${item.id}`;
                  const qty = itemQuantities[itemKey] !== undefined ? itemQuantities[itemKey] : item.quantity;
                  return `
                    <tr>
                      <td><span class="checkbox"></span></td>
                      <td>${item.articleBinCode}</td>
                      <td>${item.articleDescription}</td>
                      <td>${qty}${qty !== item.quantity ? ` (Original: ${item.quantity})` : ''}</td>
                      <td>${item.unit}</td>
                      <td>________________</td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
            
            ${request.notes ? `<div class="notes"><strong>Notes:</strong> ${request.notes}</div>` : ''}
            ${quantityNote ? `<div class="quantity-note"><strong>Quantity Modification Note:</strong> ${quantityNote}</div>` : ''}
            
            <div style="margin-top: 20px; border-top: 1px solid #ddd; padding-top: 15px;">
              <p><strong>Checked by:</strong> _________________________ <strong>Date:</strong> _____________</p>
              <p><strong>Signature:</strong> _________________________</p>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 30px; border-top: 2px solid #333; padding-top: 10px;">
            <p><em>This is a computer-generated document for checking list purposes.</em></p>
          </div>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleConfirmSingleOrderToPacking = (request: LoanRequest) => {
    // Check if quantity was modified and note is required
    if (!isKitOrder(request) && hasQuantityChanges(request.id)) {
      const note = quantityNotes[request.id];
      if (!note || note.trim() === '') {
        alert('Please provide a note explaining why quantities were modified before confirming.');
        return;
      }
    }

    // For kit orders, select all items automatically
    if (isKitOrder(request)) {
      const newPackingItem: LoanRequest = {
        ...request,
        status: 'packed'
      };
      setPackingList([...packingList, newPackingItem]);
      setReadyForPacking(readyForPacking.filter(req => req.id !== request.id));
      alert(`Kit order ${request.requestNumber} moved to packing list!`);
    } else {
      // For non-kit orders, only move selected items
      const selectedItemsForThisRequest = request.items.filter(item => 
        selectedItems.has(`${request.id}-${item.id}`)
      );

      if (selectedItemsForThisRequest.length === 0) {
        alert('Please select at least one item from this order to pack.');
        return;
      }

      const remainingItems = request.items.filter(item => 
        !selectedItems.has(`${request.id}-${item.id}`)
      );

      // Add selected items to packing list
      const newPackingItem: LoanRequest = {
        ...request,
        status: 'packed',
        items: selectedItemsForThisRequest
      };
      setPackingList([...packingList, newPackingItem]);

      // Update or remove from ready for packing
      if (remainingItems.length > 0) {
        setReadyForPacking(readyForPacking.map(req => 
          req.id === request.id 
            ? { ...req, items: remainingItems }
            : req
        ));
      } else {
        setReadyForPacking(readyForPacking.filter(req => req.id !== request.id));
      }

      // Clear selection for this request
      const newSelection = new Set(selectedItems);
      request.items.forEach(item => {
        newSelection.delete(`${request.id}-${item.id}`);
      });
      setSelectedItems(newSelection);

      alert(`${selectedItemsForThisRequest.length} item(s) moved to packing list!`);
    }
  };

  const handlePrintCheckingList = () => {
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Checking List - Request Orders</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 10px; }
            .request-card { border: 1px solid #ccc; margin-bottom: 20px; padding: 15px; page-break-inside: avoid; }
            .request-header { background-color: #f5f5f5; padding: 10px; margin: -15px -15px 15px -15px; }
            .items-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            .items-table th, .items-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            .items-table th { background-color: #f9f9f9; }
            .checkbox { width: 20px; height: 20px; border: 2px solid #333; display: inline-block; margin-right: 10px; }
            .priority-high { color: #ff6b35; font-weight: bold; }
            .priority-medium { color: #f7931e; font-weight: bold; }
            .priority-urgent { color: #dc3545; font-weight: bold; }
            .notes { background-color: #f8f9fa; padding: 10px; margin-top: 10px; border-left: 4px solid #007bff; }
            @media print {
              body { margin: 0; }
              .request-card { page-break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>CHECKING LIST - REQUEST ORDERS</h1>
            <p>Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
            <p>Total Requests: ${readyForPacking.length}</p>
          </div>
          
          ${readyForPacking.map(request => `
            <div class="request-card">
              <div class="request-header">
                <h2>${request.requestNumber}</h2>
                <p><strong>Borrower:</strong> ${request.borrower} (${request.borrowerEmail})</p>
                <p><strong>Department:</strong> ${request.department} | <strong>Project:</strong> ${request.project}</p>
                <p><strong>Priority:</strong> <span class="priority-${request.priority}">${request.priority.toUpperCase()}</span></p>
                <p><strong>Loan Date:</strong> ${request.requestedLoanDate} | <strong>Expected Return:</strong> ${request.expectedReturnDate}</p>
              </div>
              
              <h3>Items Checklist:</h3>
              <table class="items-table">
                <thead>
                  <tr>
                    <th style="width: 30px;">✓</th>
                    <th>BIN Code</th>
                    <th>Description</th>
                    <th>Quantity</th>
                    <th>Unit</th>
                    <th>Verified By</th>
                  </tr>
                </thead>
                <tbody>
                  ${request.items.map(item => `
                    <tr>
                      <td><span class="checkbox"></span></td>
                      <td>${item.articleBinCode}</td>
                      <td>${item.articleDescription}</td>
                      <td>${item.quantity}</td>
                      <td>${item.unit}</td>
                      <td>________________</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
              
              ${request.notes ? `<div class="notes"><strong>Notes:</strong> ${request.notes}</div>` : ''}
              
              <div style="margin-top: 20px; border-top: 1px solid #ddd; padding-top: 15px;">
                <p><strong>Checked by:</strong> _________________________ <strong>Date:</strong> _____________</p>
                <p><strong>Signature:</strong> _________________________</p>
              </div>
            </div>
          `).join('')}
          
          <div style="text-align: center; margin-top: 30px; border-top: 2px solid #333; padding-top: 10px;">
            <p><em>This is a computer-generated document for checking list purposes.</em></p>
          </div>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
  };

  // Request status flow: 1=Pending Approval, 2=Approved, 3=Packed, 4=Pending to Return, 5=Returned, 6=Completed
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending-approval':
        return <Badge variant="outline" className="text-orange-600 border-orange-600"><Clock className="mr-1 h-3 w-3" /> Pending Approval</Badge>;
      case 'approved':
        return <Badge variant="default" className="bg-green-600"><CheckCircle className="mr-1 h-3 w-3" /> Approved</Badge>;
      case 'packed':
        return <Badge variant="default" className="bg-purple-600"><Package className="mr-1 h-3 w-3" /> Packed</Badge>;
      case 'pending-to-return':
        return <Badge variant="outline" className="text-blue-600 border-blue-600"><Undo className="mr-1 h-3 w-3" /> Pending to Return</Badge>;
      case 'returned':
        return <Badge variant="default" className="bg-green-600"><CheckCircle className="mr-1 h-3 w-3" /> Returned</Badge>;
      case 'completed':
        return <Badge variant="default" className="bg-green-800"><CheckCircle className="mr-1 h-3 w-3" /> Completed</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="mr-1 h-3 w-3" /> Rejected</Badge>;
      case 'processed':
        return <Badge variant="secondary"><Package className="mr-1 h-3 w-3" /> Processed</Badge>;
      case 'ready-for-packing':
        return <Badge variant="outline" className="text-blue-600 border-blue-600"><ClipboardCheck className="mr-1 h-3 w-3" /> Ready for Packing</Badge>;
      case 'delivered':
        return <Badge variant="default" className="bg-green-600"><Truck className="mr-1 h-3 w-3" /> Delivered</Badge>;
      case 'inactive':
        return <Badge variant="outline" className="text-gray-600 border-gray-600"><Archive className="mr-1 h-3 w-3" /> Inactive</Badge>;
      case 'active':
        return <Badge variant="default" className="bg-blue-600"><UserCheck className="mr-1 h-3 w-3" /> Active</Badge>;
      case 'overdue':
        return <Badge variant="destructive"><AlertCircle className="mr-1 h-3 w-3" /> Overdue</Badge>;
      case 'lost':
        return <Badge variant="destructive"><XCircle className="mr-1 h-3 w-3" /> Lost</Badge>;
      case 'damaged':
        return <Badge variant="outline" className="text-red-600 border-red-600"><XCircle className="mr-1 h-3 w-3" /> Damaged</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <Badge variant="destructive">Urgent</Badge>;
      case 'high':
        return <Badge variant="outline" className="text-red-600 border-red-600">High</Badge>;
      case 'medium':
        return <Badge variant="outline" className="text-orange-600 border-orange-600">Medium</Badge>;
      case 'low':
        return <Badge variant="outline" className="text-green-600 border-green-600">Low</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  // Get all requests for overview
  const getAllRequests = (): LoanRequest[] => {
    return [
      ...loanRequests,
      ...purchaseOnSiteRequests,
      ...readyForPacking,
      ...packingList
    ];
  };

  // Get unique statuses for active filter
  const getActiveStatuses = (): string[] => {
    const activeRequests = getAllRequests().filter(req => req.status !== 'completed' && req.status !== 'rejected');
    const statuses = new Set(activeRequests.map(req => req.status));
    return Array.from(statuses);
  };

  // Get unique departments
  const getUniqueDepartments = (): string[] => {
    const allRequests = getAllRequests();
    const departments = new Set(allRequests.map(req => req.department));
    return Array.from(departments).sort();
  };

  // Filter requests for overview with pagination
  const getFilteredOverviewRequests = (): LoanRequest[] => {
    let allRequests = getAllRequests();
    
    // First filter by type
    if (overviewFilterType === 'active') {
      allRequests = allRequests.filter(req => req.status !== 'completed' && req.status !== 'rejected');
      
      // Then filter by status if selected (ignore 'all-statuses' sentinel value)
      if (overviewSecondaryFilter && overviewSecondaryFilter !== 'all-statuses') {
        allRequests = allRequests.filter(req => req.status === overviewSecondaryFilter);
      }
    } else if (overviewFilterType === 'department') {
      // Filter by department if selected (ignore 'all-departments' sentinel value)
      if (overviewSecondaryFilter && overviewSecondaryFilter !== 'all-departments') {
        allRequests = allRequests.filter(req => 
          req.department.toLowerCase().includes(overviewSecondaryFilter.toLowerCase())
        );
      }
    } else if (overviewFilterType === 'inactive') {
      allRequests = allRequests.filter(req => req.status === 'completed' || req.status === 'rejected');
    }
    // 'all' doesn't need filtering
    
    // Then apply search term
    if (overviewSearchTerm.trim()) {
      const searchLower = overviewSearchTerm.toLowerCase();
      allRequests = allRequests.filter(req => 
        req.requestNumber.toLowerCase().includes(searchLower) ||
        req.borrower.toLowerCase().includes(searchLower) ||
        req.department.toLowerCase().includes(searchLower) ||
        req.project.toLowerCase().includes(searchLower) ||
        req.requestedLoanDate.includes(searchLower) ||
        req.expectedReturnDate.includes(searchLower) ||
        req.priority.toLowerCase().includes(searchLower) ||
        req.status.toLowerCase().includes(searchLower)
      );
    }
    
    return allRequests;
  };

  const getDisplayedRequests = (): LoanRequest[] => {
    const filtered = getFilteredOverviewRequests();
    return filtered.slice(0, overviewDisplayCount);
  };

  const handleLoadMore = () => {
    setOverviewDisplayCount(prev => prev + 15);
  };

  const hasMoreToLoad = (): boolean => {
    return getFilteredOverviewRequests().length > overviewDisplayCount;
  };

  const handleToggleExpandOverview = (requestId: number) => {
    const newExpanded = new Set(expandedOverview);
    if (newExpanded.has(requestId)) {
      newExpanded.delete(requestId);
    } else {
      newExpanded.add(requestId);
    }
    setExpandedOverview(newExpanded);
  };

  // If viewing history, show the history view instead of the main content
  if (viewingHistory && selectedHistoryRequest) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Button variant="ghost" onClick={handleBackFromHistory} className="mb-2">
              ← Back to Inactive Orders
            </Button>
            <h1>Return History - {selectedHistoryRequest.requestNumber}</h1>
            <p className="text-muted-foreground">
              Complete return history for this request
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Request Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="h-5 w-5 mr-2" />
                Request Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Borrower</Label>
                  <p className="font-medium">{selectedHistoryRequest.borrower}</p>
                  <p className="text-sm text-muted-foreground">{selectedHistoryRequest.borrowerEmail}</p>
                </div>
                <div>
                  <Label>Department</Label>
                  <p>{selectedHistoryRequest.department}</p>
                </div>
                <div>
                  <Label>Project</Label>
                  <p>{selectedHistoryRequest.project}</p>
                </div>
                <div>
                  <Label>Loan Date</Label>
                  <p>{selectedHistoryRequest.requestedLoanDate}</p>
                </div>
                <div>
                  <Label>Expected Return Date</Label>
                  <p>{selectedHistoryRequest.expectedReturnDate}</p>
                </div>
                <div>
                  <Label>Priority</Label>
                  <Badge variant={selectedHistoryRequest.priority === 'urgent' ? 'destructive' : 'outline'}>
                    {selectedHistoryRequest.priority.toUpperCase()}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Return History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <History className="h-5 w-5 mr-2" />
                Return History ({mockReturnHistory[selectedHistoryRequest.id]?.length || 0} returns)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {mockReturnHistory[selectedHistoryRequest.id]?.length > 0 ? (
                <div className="space-y-4">
                  {mockReturnHistory[selectedHistoryRequest.id].map((returnRecord) => (
                    <div key={returnRecord.id} className="border rounded-lg p-4 space-y-4">
                      {/* Return Header */}
                      <div className="flex items-center justify-between pb-3 border-b">
                        <div>
                          <div className="flex items-center space-x-2">
                            <FileText className="h-4 w-4" />
                            <span className="font-medium">Return #{returnRecord.id}</span>
                            <Badge className="bg-green-600">Completed</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            Returned on {returnRecord.returnDate} by {returnRecord.returnedBy}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Processed by: {returnRecord.processedBy}
                          </p>
                        </div>
                      </div>

                      {/* Returned Items */}
                      <div>
                        <Label className="mb-2 block">Returned Items</Label>
                        <div className="rounded-md border">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="w-20">Image</TableHead>
                                <TableHead>BIN Code</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Quantity Good</TableHead>
                                <TableHead>Quantity Defective</TableHead>
                                <TableHead>Notes</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {returnRecord.returnedItems.map((item) => (
                                <TableRow key={item.itemId}>
                                  <TableCell>
                                    <ImageWithFallback
                                      src={item.imageUrl || ''}
                                      alt={item.articleName}
                                      className="w-12 h-12 object-cover rounded"
                                    />
                                  </TableCell>
                                  <TableCell className="font-mono">{item.articleBinCode}</TableCell>
                                  <TableCell>{item.articleName}</TableCell>
                                  <TableCell>
                                    <Badge className="bg-green-600">{item.quantityGood}</Badge>
                                  </TableCell>
                                  <TableCell>
                                    {item.quantityDefective > 0 ? (
                                      <Badge variant="destructive">{item.quantityDefective}</Badge>
                                    ) : (
                                      <span className="text-muted-foreground">0</span>
                                    )}
                                  </TableCell>
                                  <TableCell className="max-w-xs truncate" title={item.notes}>
                                    {item.notes || '-'}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>

                      {/* General Notes */}
                      {returnRecord.generalNotes && (
                        <div>
                          <Label>General Notes</Label>
                          <p className="text-sm mt-1 p-3 bg-muted rounded-lg">{returnRecord.generalNotes}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <History className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No return history available for this request</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Request Orders</h1>
          <p className="text-muted-foreground">
            Manage equipment loan requests and track their status
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="ready-for-packing">Ready for Packing</TabsTrigger>
          <TabsTrigger value="packing-list">Packing List</TabsTrigger>
          <TabsTrigger value="pending-to-return">Pending to Return</TabsTrigger>
          <TabsTrigger value="purchase-on-site">Purchase on Site</TabsTrigger>
          <TabsTrigger value="inactive">Inactive</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Filter className="h-5 w-5 mr-2" />
                Overview Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Filter Type</Label>
                    <Select
                      value={overviewFilterType}
                      onValueChange={(value: any) => {
                        setOverviewFilterType(value);
                        // Reset secondary filter when changing type
                        if (value === 'active') {
                          setOverviewSecondaryFilter('');
                        } else if (value === 'department') {
                          setOverviewSecondaryFilter('');
                        } else {
                          setOverviewSecondaryFilter('');
                        }
                        setOverviewDisplayCount(15);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Requests</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="department">Department</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Secondary Filter</Label>
                    {overviewFilterType === 'active' && (
                      <div className="space-y-2">
                        <Select
                          value={overviewSecondaryFilter || 'all-statuses'}
                          onValueChange={(value) => {
                            setOverviewSecondaryFilter(value === 'all-statuses' ? '' : value);
                            setOverviewDisplayCount(15);
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="All Active Statuses" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all-statuses">All Active Statuses</SelectItem>
                            {getActiveStatuses().map((status) => (
                              <SelectItem key={status} value={status}>
                                {status.replace(/-/g, ' ').toUpperCase()}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    {overviewFilterType === 'department' && (
                      <div className="space-y-2">
                        <Select
                          value={overviewSecondaryFilter || 'all-departments'}
                          onValueChange={(value) => {
                            setOverviewSecondaryFilter(value === 'all-departments' ? '' : value);
                            setOverviewDisplayCount(15);
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="All Departments" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all-departments">All Departments</SelectItem>
                            {getUniqueDepartments().map((dept) => (
                              <SelectItem key={dept} value={dept}>
                                {dept}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    {(overviewFilterType === 'all' || overviewFilterType === 'inactive') && (
                      <Input
                        placeholder="No secondary filter available"
                        disabled
                      />
                    )}
                  </div>
                </div>

                <div>
                  <Label>Search</Label>
                  <Input
                    placeholder="Search by Request #, Borrower, Department, Project, Loan Date, Return Date, Priority, or Status..."
                    value={overviewSearchTerm}
                    onChange={(e) => {
                      setOverviewSearchTerm(e.target.value);
                      setOverviewDisplayCount(15);
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                All Requests ({getFilteredOverviewRequests().length} total, showing {getDisplayedRequests().length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12"></TableHead>
                      <TableHead>Request #</TableHead>
                      <TableHead>Borrower</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Project</TableHead>
                      <TableHead>Loan Date</TableHead>
                      <TableHead>Return Date</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getDisplayedRequests().map((request) => (
                      <React.Fragment key={`${request.id}-${request.requestNumber}`}>
                        <TableRow className="hover:bg-muted/50">
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleExpandOverview(request.id)}
                            >
                              {expandedOverview.has(request.id) ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                            </Button>
                          </TableCell>
                          <TableCell className="font-mono">{request.requestNumber}</TableCell>
                          <TableCell>
                            <div>
                              <div>{request.borrower}</div>
                              <div className="text-sm text-muted-foreground">{request.borrowerEmail}</div>
                            </div>
                          </TableCell>
                          <TableCell>{request.department}</TableCell>
                          <TableCell>{request.project}</TableCell>
                          <TableCell>{request.requestedLoanDate}</TableCell>
                          <TableCell>{request.expectedReturnDate}</TableCell>
                          <TableCell>{getPriorityBadge(request.priority)}</TableCell>
                          <TableCell>{getStatusBadge(request.status)}</TableCell>
                        </TableRow>

                        {/* Expanded Items Section */}
                        {expandedOverview.has(request.id) && (
                          <TableRow>
                            <TableCell colSpan={9} className="bg-muted/30 p-0">
                              <div className="p-4">
                                <h4 className="flex items-center mb-3">
                                  <Package className="h-4 w-4 mr-2" />
                                  Items in this request
                                </h4>
                                <div className="rounded-md border bg-card">
                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead className="w-20">Image</TableHead>
                                        <TableHead>BIN Code</TableHead>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead>Quantity</TableHead>
                                        <TableHead>Type</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {request.items.map((item) => (
                                        <TableRow key={item.id}>
                                          <TableCell>
                                            <ImageWithFallback
                                              src={item.imageUrl || ''}
                                              alt={item.articleName}
                                              className="w-12 h-12 object-cover rounded"
                                            />
                                          </TableCell>
                                          <TableCell className="font-mono">{item.articleBinCode}</TableCell>
                                          <TableCell>{item.articleName}</TableCell>
                                          <TableCell>{item.articleDescription}</TableCell>
                                          <TableCell>{item.quantity} {item.unit}</TableCell>
                                          <TableCell>
                                            <Badge variant="outline">
                                              {item.articleType}
                                            </Badge>
                                          </TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              {hasMoreToLoad() && (
                <div className="flex justify-center mt-4">
                  <Button onClick={handleLoadMore} variant="outline">
                    Load More (15 more)
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Ready for Packing Tab */}
        <TabsContent value="ready-for-packing" className="space-y-4">
          {/* Create New Request Order Button - Outside the table */}
          <div className="flex justify-end">
            <Button
              onClick={() => setCreateKitOrderOpen(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create New Request Order
            </Button>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <ClipboardCheck className="h-5 w-5 mr-2" />
                  Ready for Packing ({readyForPacking.length})
                </CardTitle>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    onClick={handlePrintCheckingList}
                    disabled={readyForPacking.length === 0}
                  >
                    <Printer className="h-4 w-4 mr-2" />
                    Print All
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12"></TableHead>
                      <TableHead>Request #</TableHead>
                      <TableHead>Borrower</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Project</TableHead>
                      <TableHead>Loan Date</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Kit</TableHead>
                      <TableHead>Items Selected</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {readyForPacking.map((request) => (
                      <React.Fragment key={request.id}>
                        <TableRow className="hover:bg-muted/50">
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleExpand(request.id)}
                            >
                              {expandedRequests.has(request.id) ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                            </Button>
                          </TableCell>
                          <TableCell className="font-mono">{request.requestNumber}</TableCell>
                          <TableCell>
                            <div>
                              <div>{request.borrower}</div>
                              <div className="text-sm text-muted-foreground">{request.borrowerEmail}</div>
                            </div>
                          </TableCell>
                          <TableCell>{request.department}</TableCell>
                          <TableCell>{request.project}</TableCell>
                          <TableCell>{request.requestedLoanDate}</TableCell>
                          <TableCell>{getPriorityBadge(request.priority)}</TableCell>
                          <TableCell>
                            <Badge variant={isKitOrder(request) ? "default" : "outline"}>
                              {isKitOrder(request) ? 'Yes' : 'No'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {isKitOrder(request) ? `${request.items.length}` : `${getSelectedItemsCount(request)} / ${request.items.length}`}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onViewDetail(request)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePrintSingleOrder(request)}
                              >
                                <Printer className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => handleConfirmSingleOrderToPacking(request)}
                                disabled={!isKitOrder(request) && getSelectedItemsCount(request) === 0}
                              >
                                <Package className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                        
                        {/* Expanded Items Section */}
                        {expandedRequests.has(request.id) && (
                          <TableRow>
                            <TableCell colSpan={10} className="bg-muted/30 p-0">
                              <div className="p-4">
                                <div className="flex items-center justify-between mb-3">
                                  <h4 className="flex items-center">
                                    <Package className="h-4 w-4 mr-2" />
                                    Items in this request
                                  </h4>
                                  <div className="flex items-center space-x-2">
                                    <input
                                      type="checkbox"
                                      id={`select-all-${request.id}`}
                                      checked={areAllItemsSelected(request)}
                                      onChange={(e) => handleSelectAllItemsInRequest(request, e.target.checked)}
                                      className="h-4 w-4"
                                    />
                                    <label htmlFor={`select-all-${request.id}`} className="text-sm cursor-pointer">
                                      Select All Items
                                    </label>
                                  </div>
                                </div>
                                <div className="rounded-md border bg-card">
                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                        {!isKitOrder(request) && <TableHead className="w-12">Select</TableHead>}
                                        <TableHead className="w-20">Image</TableHead>
                                        <TableHead>BIN Code</TableHead>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead>Quantity</TableHead>
                                        <TableHead>Type</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {request.items.map((item) => {
                                        const itemKey = `${request.id}-${item.id}`;
                                        return (
                                          <TableRow key={item.id}>
                                            {!isKitOrder(request) && (
                                              <TableCell>
                                                <input
                                                  type="checkbox"
                                                  checked={selectedItems.has(itemKey)}
                                                  onChange={() => handleSelectItem(request.id, item.id)}
                                                  className="h-4 w-4"
                                                />
                                              </TableCell>
                                            )}
                                            <TableCell>
                                              <ImageWithFallback
                                                src={item.imageUrl || ''}
                                                alt={item.articleName}
                                                className="w-12 h-12 object-cover rounded"
                                              />
                                            </TableCell>
                                            <TableCell className="font-mono text-sm">{item.articleBinCode}</TableCell>
                                            <TableCell>{item.articleName}</TableCell>
                                            <TableCell className="text-sm text-muted-foreground">{item.articleDescription}</TableCell>
                                            <TableCell>
                                              {!isKitOrder(request) ? (
                                                <div className="flex items-center space-x-2">
                                                  <Input
                                                    type="number"
                                                    min="0"
                                                    max={item.quantity}
                                                    value={getItemQuantity(request.id, item.id)}
                                                    onChange={(e) => handleQuantityChange(request.id, item.id, parseInt(e.target.value) || 0)}
                                                    className="w-20"
                                                  />
                                                  <span className="text-sm text-muted-foreground">/ {item.quantity} {item.unit}</span>
                                                </div>
                                              ) : (
                                                <span>{item.quantity} {item.unit}</span>
                                              )}
                                            </TableCell>
                                            <TableCell>
                                              <Badge variant={item.articleType === 'consumable' ? 'secondary' : 'outline'}>
                                                {item.articleType === 'consumable' ? 'Consumable' : 'Non-Consumable'}
                                              </Badge>
                                            </TableCell>
                                          </TableRow>
                                        );
                                      })}
                                    </TableBody>
                                  </Table>
                                </div>
                                
                                {/* Note field for quantity changes */}
                                {!isKitOrder(request) && hasQuantityChanges(request.id) && (
                                  <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-950/20 rounded-md border border-amber-200 dark:border-amber-900">
                                    <Label className="text-sm mb-2 block text-amber-900 dark:text-amber-100">
                                      Note Required (Quantity Modified)
                                    </Label>
                                    <textarea
                                      value={quantityNotes[request.id] || ''}
                                      onChange={(e) => handleQuantityNoteChange(request.id, e.target.value)}
                                      placeholder="Please explain why quantities were modified..."
                                      className="w-full min-h-[80px] p-2 border rounded-md bg-white dark:bg-gray-900"
                                      required
                                    />
                                  </div>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Packing List Tab */}
        <TabsContent value="packing-list" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="h-5 w-5 mr-2" />
                Packing List ({packingList.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12"></TableHead>
                      <TableHead>Request #</TableHead>
                      <TableHead>Borrower</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Project</TableHead>
                      <TableHead>Loan Date</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {packingList.map((request) => (
                      <React.Fragment key={request.id}>
                        <TableRow>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleExpandPackingList(request.id)}
                            >
                              {expandedPackingList.has(request.id) ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                            </Button>
                          </TableCell>
                          <TableCell className="font-mono">{request.requestNumber}</TableCell>
                          <TableCell>
                            <div>
                              <div>{request.borrower}</div>
                              <div className="text-sm text-muted-foreground">{request.borrowerEmail}</div>
                            </div>
                          </TableCell>
                          <TableCell>{request.department}</TableCell>
                          <TableCell>{request.project}</TableCell>
                          <TableCell>{request.requestedLoanDate}</TableCell>
                          <TableCell>{getPriorityBadge(request.priority)}</TableCell>
                          <TableCell>{getStatusBadge(request.status)}</TableCell>
                          <TableCell>
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleMarkAsDelivered(request.id)}
                            >
                              <Truck className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>

                        {/* Expanded Items Section */}
                        {expandedPackingList.has(request.id) && (
                          <TableRow>
                            <TableCell colSpan={9} className="bg-muted/30 p-0">
                              <div className="p-4">
                                <h4 className="flex items-center mb-3">
                                  <Package className="h-4 w-4 mr-2" />
                                  Items in this request
                                </h4>
                                <div className="rounded-md border bg-card">
                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead className="w-20">Image</TableHead>
                                        <TableHead>BIN Code</TableHead>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead>Quantity</TableHead>
                                        <TableHead>Type</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {request.items.map((item) => (
                                        <TableRow key={item.id}>
                                          <TableCell>
                                            <ImageWithFallback
                                              src={item.imageUrl || ''}
                                              alt={item.articleName}
                                              className="w-12 h-12 object-cover rounded"
                                            />
                                          </TableCell>
                                          <TableCell className="font-mono">{item.articleBinCode}</TableCell>
                                          <TableCell>{item.articleName}</TableCell>
                                          <TableCell>{item.articleDescription}</TableCell>
                                          <TableCell>{item.quantity} {item.unit}</TableCell>
                                          <TableCell>
                                            <Badge variant="outline">
                                              {item.articleType}
                                            </Badge>
                                          </TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pending to Return Tab */}
        <TabsContent value="pending-to-return" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Undo className="h-5 w-5 mr-2" />
                Pending to Return ({loanRequests.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12"></TableHead>
                      <TableHead>Request #</TableHead>
                      <TableHead>Borrower</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Project</TableHead>
                      <TableHead>Expected Return</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Kit</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loanRequests.map((request) => (
                      <React.Fragment key={request.id}>
                        <TableRow>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleExpandPendingToReturn(request.id)}
                            >
                              {expandedPendingToReturn.has(request.id) ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                            </Button>
                          </TableCell>
                          <TableCell className="font-mono">{request.requestNumber}</TableCell>
                          <TableCell>
                            <div>
                              <div>{request.borrower}</div>
                              <div className="text-sm text-muted-foreground">{request.borrowerEmail}</div>
                            </div>
                          </TableCell>
                          <TableCell>{request.department}</TableCell>
                          <TableCell>{request.project}</TableCell>
                          <TableCell>{request.expectedReturnDate}</TableCell>
                          <TableCell>{getPriorityBadge(request.priority)}</TableCell>
                          <TableCell>
                            <Badge variant={isKitOrder(request) ? "default" : "outline"}>
                              {isKitOrder(request) ? 'Yes' : 'No'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onReturnItems(request, activeTab)}
                            >
                              <Undo className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>

                        {/* Expanded Items Section */}
                        {expandedPendingToReturn.has(request.id) && (
                          <TableRow>
                            <TableCell colSpan={9} className="bg-muted/30 p-0">
                              <div className="p-4">
                                <h4 className="flex items-center mb-3">
                                  <Package className="h-4 w-4 mr-2" />
                                  Items in this request
                                </h4>
                                <div className="rounded-md border bg-card">
                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead className="w-20">Image</TableHead>
                                        <TableHead>BIN Code</TableHead>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead>Quantity</TableHead>
                                        <TableHead>Type</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {request.items.map((item) => (
                                        <TableRow key={item.id}>
                                          <TableCell>
                                            <ImageWithFallback
                                              src={item.imageUrl || ''}
                                              alt={item.articleName}
                                              className="w-12 h-12 object-cover rounded"
                                            />
                                          </TableCell>
                                          <TableCell className="font-mono">{item.articleBinCode}</TableCell>
                                          <TableCell>{item.articleName}</TableCell>
                                          <TableCell>{item.articleDescription}</TableCell>
                                          <TableCell>{item.quantity} {item.unit}</TableCell>
                                          <TableCell>
                                            <Badge variant="outline">
                                              {item.articleType}
                                            </Badge>
                                          </TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Purchase on Site Tab */}
        <TabsContent value="purchase-on-site" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="h-5 w-5 mr-2" />
                Purchase on Site ({purchaseOnSiteRequests.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12"></TableHead>
                      <TableHead>Request #</TableHead>
                      <TableHead>Requester</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Project</TableHead>
                      <TableHead>Request Date</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {purchaseOnSiteRequests.map((request) => (
                      <React.Fragment key={request.id}>
                        <TableRow>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleExpandPurchaseOnSite(request.id)}
                            >
                              {expandedPurchaseOnSite.has(request.id) ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                            </Button>
                          </TableCell>
                          <TableCell className="font-mono">{request.requestNumber}</TableCell>
                          <TableCell>
                            <div>
                              <div>{request.borrower}</div>
                              <div className="text-sm text-muted-foreground">{request.borrowerEmail}</div>
                            </div>
                          </TableCell>
                          <TableCell>{request.department}</TableCell>
                          <TableCell>{request.project}</TableCell>
                          <TableCell>{request.requestedLoanDate}</TableCell>
                          <TableCell>{getPriorityBadge(request.priority)}</TableCell>
                          <TableCell>{getStatusBadge(request.status)}</TableCell>
                        </TableRow>

                        {/* Expanded Items Section */}
                        {expandedPurchaseOnSite.has(request.id) && (
                          <TableRow>
                            <TableCell colSpan={8} className="bg-muted/30 p-0">
                              <div className="p-4">
                                <h4 className="flex items-center mb-3">
                                  <Package className="h-4 w-4 mr-2" />
                                  Items in this request
                                </h4>
                                <div className="rounded-md border bg-card">
                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead className="w-20">Image</TableHead>
                                        <TableHead>BIN Code</TableHead>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead>Quantity</TableHead>
                                        <TableHead>Type</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {request.items.map((item) => (
                                        <TableRow key={item.id}>
                                          <TableCell>
                                            <ImageWithFallback
                                              src={item.imageUrl || ''}
                                              alt={item.articleName}
                                              className="w-12 h-12 object-cover rounded"
                                            />
                                          </TableCell>
                                          <TableCell className="font-mono">{item.articleBinCode}</TableCell>
                                          <TableCell>{item.articleName}</TableCell>
                                          <TableCell>{item.articleDescription}</TableCell>
                                          <TableCell>{item.quantity} {item.unit}</TableCell>
                                          <TableCell>
                                            <Badge variant="outline">
                                              {item.articleType}
                                            </Badge>
                                          </TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Inactive Tab */}
        <TabsContent value="inactive" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Archive className="h-5 w-5 mr-2" />
                Inactive Requests ({loanRequests.filter(r => r.status === 'completed' || r.status === 'cancelled').length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12"></TableHead>
                      <TableHead>Request #</TableHead>
                      <TableHead>Borrower</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Project</TableHead>
                      <TableHead>Loan Date</TableHead>
                      <TableHead>Return Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loanRequests.filter(r => r.status === 'completed' || r.status === 'cancelled').map((request) => (
                      <React.Fragment key={request.id}>
                        <TableRow className="hover:bg-muted/50">
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleExpandInactive(request.id)}
                            >
                              {expandedInactive.has(request.id) ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                            </Button>
                          </TableCell>
                          <TableCell className="font-mono">{request.requestNumber}</TableCell>
                          <TableCell>
                            <div>
                              <div>{request.borrower}</div>
                              <div className="text-xs text-muted-foreground">{request.borrowerEmail}</div>
                            </div>
                          </TableCell>
                          <TableCell>{request.department}</TableCell>
                          <TableCell>{request.project}</TableCell>
                          <TableCell>{request.requestedLoanDate}</TableCell>
                          <TableCell>{request.expectedReturnDate}</TableCell>
                          <TableCell>
                            <Badge className={request.status === 'completed' ? 'bg-green-600' : 'bg-gray-600'}>
                              {request.status.toUpperCase()}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {request.status === 'completed' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewHistory(request)}
                              >
                                <History className="h-4 w-4 mr-1" />
                                History
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>

                        {/* Expanded Items Section */}
                        {expandedInactive.has(request.id) && (
                          <TableRow>
                            <TableCell colSpan={9} className="bg-muted/30 p-0">
                              <div className="p-4">
                                <h4 className="flex items-center mb-3">
                                  <Package className="h-4 w-4 mr-2" />
                                  Items in this request
                                </h4>
                                <div className="rounded-md border bg-card">
                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead className="w-20">Image</TableHead>
                                        <TableHead>BIN Code</TableHead>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead>Quantity</TableHead>
                                        <TableHead>Type</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {request.items.map((item) => (
                                        <TableRow key={item.id}>
                                          <TableCell>
                                            <ImageWithFallback
                                              src={item.imageUrl || ''}
                                              alt={item.articleName}
                                              className="w-12 h-12 object-cover rounded"
                                            />
                                          </TableCell>
                                          <TableCell className="font-mono">{item.articleBinCode}</TableCell>
                                          <TableCell>{item.articleName}</TableCell>
                                          <TableCell>{item.articleDescription}</TableCell>
                                          <TableCell>{item.quantity} {item.unit}</TableCell>
                                          <TableCell>
                                            <Badge variant="outline">
                                              {item.articleType}
                                            </Badge>
                                          </TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Kit Order Modal */}
      <Dialog open={createKitOrderOpen} onOpenChange={setCreateKitOrderOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Package className="h-5 w-5 mr-2" />
              Create New Request Order
            </DialogTitle>
            <DialogDescription>
              Create a new kit request order. Fill in all the required fields below.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateKitOrder} className="space-y-5">
            {/* Kit Selection */}
            <div className="space-y-2">
              <Label htmlFor="kit-select" className="flex items-center">
                <Package className="h-4 w-4 mr-1" />
                Select Kit *
              </Label>
              <Select
                value={kitOrderForm.kitId}
                onValueChange={(value) => {
                  setKitOrderForm({ ...kitOrderForm, kitId: value });
                  setKitSearchTerm('');
                }}
                required
              >
                <SelectTrigger id="kit-select" className="h-11">
                  <SelectValue placeholder="Choose a kit from the list" />
                </SelectTrigger>
                <SelectContent>
                  <div className="p-2">
                    <Input
                      placeholder="Search by BIN code or name..."
                      value={kitSearchTerm}
                      onChange={(e) => setKitSearchTerm(e.target.value)}
                      className="mb-2"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                  {filteredKits.length > 0 ? (
                    filteredKits.map((kit) => (
                      <SelectItem key={kit.id} value={kit.id.toString()}>
                        <div className="flex flex-col">
                          <span className="font-medium">{kit.binCode}</span>
                          <span className="text-sm text-muted-foreground">{kit.name}</span>
                        </div>
                      </SelectItem>
                    ))
                  ) : (
                    <div className="p-2 text-sm text-muted-foreground text-center">
                      No kits found
                    </div>
                  )}
                </SelectContent>
              </Select>
              {kitOrderForm.kitId && (
                <p className="text-sm text-muted-foreground">
                  Selected: {mockKits.find(k => k.id.toString() === kitOrderForm.kitId)?.name}
                </p>
              )}
            </div>

            {/* Kit Items Display */}
            {selectedKit && selectedKit.items.length > 0 && (
              <div className="space-y-2 p-4 bg-muted/30 rounded-lg border">
                <Label className="flex items-center">
                  <Package className="h-4 w-4 mr-1" />
                  Items in this Kit ({selectedKit.items.length})
                </Label>
                <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
                  {selectedKit.items.map((item) => (
                    <div key={item.id} className="flex items-center space-x-3 p-2 bg-card rounded border">
                      <img 
                        src={item.imageUrl} 
                        alt={item.articleName}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate">{item.articleName}</p>
                        <p className="text-xs text-muted-foreground font-mono">{item.articleBinCode}</p>
                      </div>
                      <div className="text-sm">
                        <Badge variant="outline">x{item.quantity}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Department */}
            <div className="space-y-2">
              <Label htmlFor="department-select">Department *</Label>
              <Select
                value={kitOrderForm.department}
                onValueChange={(value) => {
                  setKitOrderForm({ ...kitOrderForm, department: value });
                  setDepartmentSearchTerm('');
                }}
                required
              >
                <SelectTrigger id="department-select" className="h-11">
                  <SelectValue placeholder="Select a department" />
                </SelectTrigger>
                <SelectContent>
                  <div className="p-2">
                    <Input
                      placeholder="Search department..."
                      value={departmentSearchTerm}
                      onChange={(e) => setDepartmentSearchTerm(e.target.value)}
                      className="mb-2"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                  {filteredDepartments.length > 0 ? (
                    filteredDepartments.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))
                  ) : (
                    <div className="p-2 text-sm text-muted-foreground text-center">
                      No departments found
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Project */}
            <div className="space-y-2">
              <Label htmlFor="project">Project *</Label>
              <Input
                id="project"
                value={kitOrderForm.project}
                onChange={(e) => setKitOrderForm({ ...kitOrderForm, project: e.target.value })}
                placeholder="e.g., Site Installation, Product Launch"
                className="h-11"
                required
              />
            </div>

            {/* Return Date */}
            <div className="space-y-2">
              <Label htmlFor="returnDate">Expected Return Date *</Label>
              <Input
                id="returnDate"
                type="date"
                value={kitOrderForm.returnDate}
                onChange={(e) => setKitOrderForm({ ...kitOrderForm, returnDate: e.target.value })}
                className="h-11"
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>

            {/* Engineer Selection */}
            <div className="space-y-2">
              <Label htmlFor="engineer-select">Engineer / Requester *</Label>
              <Select
                value={kitOrderForm.engineer}
                onValueChange={(value) => {
                  setKitOrderForm({ ...kitOrderForm, engineer: value });
                  setEngineerSearchTerm('');
                }}
                required
              >
                <SelectTrigger id="engineer-select" className="h-11">
                  <SelectValue placeholder="Select an engineer" />
                </SelectTrigger>
                <SelectContent>
                  <div className="p-2">
                    <Input
                      placeholder="Search engineer..."
                      value={engineerSearchTerm}
                      onChange={(e) => setEngineerSearchTerm(e.target.value)}
                      className="mb-2"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                  {filteredEngineers.length > 0 ? (
                    filteredEngineers.map((engineer) => (
                      <SelectItem key={engineer} value={engineer}>
                        {engineer}
                      </SelectItem>
                    ))
                  ) : (
                    <div className="p-2 text-sm text-muted-foreground text-center">
                      No engineers found
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setCreateKitOrderOpen(false);
                  setKitOrderForm({
                    kitId: '',
                    department: '',
                    returnDate: '',
                    project: '',
                    engineer: ''
                  });
                  setKitSearchTerm('');
                  setEngineerSearchTerm('');
                }}
                className="min-w-[100px]"
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                className="min-w-[100px] bg-blue-600 hover:bg-blue-700"
              >
                Create Order
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}