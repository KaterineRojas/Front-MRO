import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ImageWithFallback } from '../../figma/ImageWithFallback';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Label } from '../ui/label';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Plus, Package, ChevronDown, ChevronRight, Printer, Eye, Camera, CheckCircle, Save } from 'lucide-react';
import { Alert, AlertDescription } from '../ui/alert';

interface KitItem {
  id: number;
  name: string;
  description: string;
  category: string;
  type: 'consumable' | 'non-consumable';
  quantity: number;
  unit: string;
  imageUrl?: string;
}

interface LoanItem {
  id: number;
  articleBinCode: string;
  articleName: string;
  articleDescription: string;
  articleType: 'consumable' | 'non-consumable';
  quantity: number;
  unit: string;
  status: 'pending' | 'active' | 'returned' | 'partial' | 'lost' | 'damaged';
  imageUrl?: string;
  isKit?: boolean;
  kitItems?: KitItem[];
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
  loanDate?: string;
  status: 'pending-approval' | 'approved' | 'packed' | 'pending-to-return' | 'returned' | 'completed' | 'rejected' | 'processed' | 'ready-for-packing' | 'delivered' | 'inactive' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  notes: string;
  requestedBy: string;
  approvedBy?: string;
  processedBy?: string;
  createdAt: string;
  items: LoanItem[];
}

// Mock data for Packing Requests (similar to Ready for Packing)
const mockPackingRequests: LoanRequest[] = [
  {
    id: 1,
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
        id: 1,
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
        id: 2,
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
    id: 2,
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
        id: 3,
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
        id: 4,
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

// Mock data for Returns (items currently on loan) - with kit items
const mockReturns: LoanRequest[] = [
  {
    id: 10,
    requestNumber: 'LR-2025-001',
    borrower: 'Emma Davis',
    borrowerEmail: 'emma.davis@company.com',
    department: 'Sales',
    project: 'Client Presentations Q1',
    loanDate: '2025-01-25',
    requestedLoanDate: '2025-01-25',
    expectedReturnDate: '2025-02-01',
    status: 'pending-to-return',
    priority: 'high',
    notes: 'Need for important client presentations during Q1',
    requestedBy: 'Emma Davis',
    createdAt: '2025-01-22T10:30:00Z',
    items: [
      {
        id: 101,
        articleBinCode: 'BIN-TECH-002',
        articleName: 'Dell Latitude Laptop',
        articleDescription: 'Laptop Dell Latitude 5520',
        articleType: 'non-consumable',
        quantity: 2,
        unit: 'units',
        status: 'active',
        imageUrl: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=300',
        isKit: false
      },
      {
        id: 102,
        articleBinCode: 'BIN-TECH-009',
        articleName: 'Wireless Mouse',
        articleDescription: 'Wireless Mouse Professional',
        articleType: 'non-consumable',
        quantity: 3,
        unit: 'units',
        status: 'active',
        imageUrl: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=300',
        isKit: false
      },
      {
        id: 103,
        articleBinCode: 'KIT-OFFICE-001',
        articleName: 'Office Starter Kit',
        articleDescription: 'Complete office setup kit',
        articleType: 'non-consumable',
        quantity: 1,
        unit: 'kit',
        status: 'active',
        imageUrl: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=300',
        isKit: true,
        kitItems: [
          {
            id: 1031,
            name: 'Wireless Keyboard',
            description: 'Ergonomic wireless keyboard',
            category: 'Office Supplies',
            type: 'non-consumable',
            quantity: 1,
            unit: 'units',
            imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=100'
          },
          {
            id: 1032,
            name: 'USB Hub 4-Port',
            description: 'Multi-port USB hub',
            category: 'Technology',
            type: 'non-consumable',
            quantity: 1,
            unit: 'units',
            imageUrl: 'https://images.unsplash.com/photo-1625948515291-69613efd103f?w=100'
          },
          {
            id: 1033,
            name: 'Notebook Set',
            description: 'Pack of 3 notebooks',
            category: 'Stationery',
            type: 'consumable',
            quantity: 3,
            unit: 'units',
            imageUrl: 'https://images.unsplash.com/photo-1517842264405-4f052a6fc8c2?w=100'
          }
        ]
      }
    ]
  },
  {
    id: 11,
    requestNumber: 'KIT-2025-004',
    borrower: 'Ana Martinez',
    borrowerEmail: 'ana.martinez@company.com',
    department: 'Design',
    project: 'UI/UX Redesign',
    loanDate: '2025-01-26',
    requestedLoanDate: '2025-01-26',
    expectedReturnDate: '2025-02-05',
    status: 'pending-to-return',
    priority: 'medium',
    notes: 'Equipment needed for design mockups and user testing - Kit Order',
    requestedBy: 'Ana Martinez',
    createdAt: '2025-01-23T14:00:00Z',
    items: [
      {
        id: 104,
        articleBinCode: 'BIN-TECH-005',
        articleName: 'Graphics Tablet',
        articleDescription: 'Wacom Intuos Pro Graphics Tablet',
        articleType: 'non-consumable',
        quantity: 2,
        unit: 'units',
        status: 'active',
        imageUrl: 'https://images.unsplash.com/photo-1596727147705-61a532a659bd?w=300',
        isKit: false
      },
      {
        id: 105,
        articleBinCode: 'KIT-DESIGN-001',
        articleName: 'Designer Tool Kit',
        articleDescription: 'Complete toolkit for designers',
        articleType: 'non-consumable',
        quantity: 1,
        unit: 'kit',
        status: 'active',
        imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300',
        isKit: true,
        kitItems: [
          {
            id: 1051,
            name: 'Color Calibration Tool',
            description: 'X-Rite ColorMunki Display',
            category: 'Design Tools',
            type: 'non-consumable',
            quantity: 1,
            unit: 'units',
            imageUrl: 'https://images.unsplash.com/photo-1587145820266-a5951ee6f620?w=100'
          },
          {
            id: 1052,
            name: 'Digital Stylus',
            description: 'Apple Pencil 2nd Generation',
            category: 'Design Tools',
            type: 'non-consumable',
            quantity: 2,
            unit: 'units',
            imageUrl: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=100'
          }
        ]
      }
    ]
  },
  {
    id: 12,
    requestNumber: 'LR-2025-012',
    borrower: 'Michael Chen',
    borrowerEmail: 'michael.chen@company.com',
    department: 'IT',
    project: 'Network Setup',
    loanDate: '2025-01-28',
    requestedLoanDate: '2025-01-28',
    expectedReturnDate: '2025-02-10',
    status: 'pending-to-return',
    priority: 'medium',
    notes: 'Network equipment for office setup',
    requestedBy: 'Michael Chen',
    createdAt: '2025-01-27T09:00:00Z',
    items: [
      {
        id: 120,
        articleBinCode: 'BIN-NET-001',
        articleName: 'Network Switch',
        articleDescription: '24-Port Gigabit Network Switch',
        articleType: 'non-consumable',
        quantity: 1,
        unit: 'units',
        status: 'active',
        imageUrl: 'https://images.unsplash.com/photo-1606904825846-647eb07f5be2?w=300',
        isKit: false
      }
    ]
  }
];

export function ManageRequests() {
  // State for Packing Requests
  const [packingRequests] = useState<LoanRequest[]>(mockPackingRequests);
  const [expandedPackingRequests, setExpandedPackingRequests] = useState<Set<number>>(new Set());
  const [selectedPackingItems, setSelectedPackingItems] = useState<Set<string>>(new Set());
  const [packingItemQuantities, setPackingItemQuantities] = useState<Record<string, number>>({});
  const [printedRequests, setPrintedRequests] = useState<Set<number>>(new Set());

  // State for Returns
  const [allReturns, setAllReturns] = useState<LoanRequest[]>(mockReturns);
  const [selectedReturnBorrower, setSelectedReturnBorrower] = useState<string>('');
  const [expandedReturns, setExpandedReturns] = useState<Set<number>>(new Set());
  const [expandedKitItems, setExpandedKitItems] = useState<Set<string>>(new Set());
  const [selectedReturnItems, setSelectedReturnItems] = useState<Set<string>>(new Set());
  const [selectedKitItems, setSelectedKitItems] = useState<Set<string>>(new Set());
  const [returnQuantities, setReturnQuantities] = useState<Record<string, number>>({});
  const [kitItemQuantities, setKitItemQuantities] = useState<Record<string, number>>({});
  const [itemConditions, setItemConditions] = useState<Record<string, string>>({});
  const [kitItemConditions, setKitItemConditions] = useState<Record<string, string>>({});
  const [borrowerSelectSearchTerm, setBorrowerSelectSearchTerm] = useState<string>('');
  const [photoDialogOpen, setPhotoDialogOpen] = useState(false);
  const [kitPhotoDialogOpen, setKitPhotoDialogOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [currentReturnRequest, setCurrentReturnRequest] = useState<LoanRequest | null>(null);
  const [currentKitItem, setCurrentKitItem] = useState<{requestId: number, itemId: number} | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [kitPhotos, setKitPhotos] = useState<Record<string, string>>({});
  const [itemsPhotoDialogOpen, setItemsPhotoDialogOpen] = useState(false);
  const [itemsConfirmDialogOpen, setItemsConfirmDialogOpen] = useState(false);
  const [kitReturnDialogOpen, setKitReturnDialogOpen] = useState(false);
  const [kitReturnOption, setKitReturnOption] = useState<'restock' | 'disassemble' | ''>('');
  const [pendingKitReturn, setPendingKitReturn] = useState<{requestId: number, itemId: number} | null>(null);
  const [conditionDialogOpen, setConditionDialogOpen] = useState(false);
  const [currentConditionItem, setCurrentConditionItem] = useState<{requestId: number, itemId: number, kitItemId?: number, isKit: boolean} | null>(null);
  const [conditionCounts, setConditionCounts] = useState({ good: 0, revision: 0, lost: 0 });
  const [missingKitItems, setMissingKitItems] = useState<Array<{id: number, name: string, category: string, missingQuantity: number, totalQuantity: number}>>([]);

  // Get unique borrowers from returns
  const uniqueReturnBorrowers = useMemo(() => {
    const borrowers = allReturns.map(req => req.borrower);
    return Array.from(new Set(borrowers)).sort();
  }, [allReturns]);

  // Filter returns by selected borrower
  const filteredReturns = useMemo(() => {
    if (!selectedReturnBorrower) {
      return [];
    }
    return allReturns.filter(req => req.borrower === selectedReturnBorrower);
  }, [allReturns, selectedReturnBorrower]);

  // Handle borrower selection from dropdown
  const handleBorrowerSelect = (value: string) => {
    setSelectedReturnBorrower(value);
    setBorrowerSelectSearchTerm(''); // Clear select search term
  };

  // Filter borrowers for the select dropdown
  const filteredBorrowersForSelect = useMemo(() => {
    if (!borrowerSelectSearchTerm.trim()) {
      return uniqueReturnBorrowers;
    }
    return uniqueReturnBorrowers.filter(borrower =>
      borrower.toLowerCase().includes(borrowerSelectSearchTerm.toLowerCase())
    );
  }, [uniqueReturnBorrowers, borrowerSelectSearchTerm]);

  // Packing Requests Handlers
  const handleToggleExpandPacking = (id: number) => {
    const newExpanded = new Set(expandedPackingRequests);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedPackingRequests(newExpanded);
  };

  const handleSelectPackingItem = (requestId: number, itemId: number) => {
    const itemKey = `${requestId}-${itemId}`;
    const newSelected = new Set(selectedPackingItems);
    if (newSelected.has(itemKey)) {
      newSelected.delete(itemKey);
      const newQuantities = { ...packingItemQuantities };
      delete newQuantities[itemKey];
      setPackingItemQuantities(newQuantities);
    } else {
      newSelected.add(itemKey);
    }
    setSelectedPackingItems(newSelected);
  };

  const handlePackingQuantityChange = (requestId: number, itemId: number, quantity: number) => {
    const itemKey = `${requestId}-${itemId}`;
    setPackingItemQuantities({
      ...packingItemQuantities,
      [itemKey]: quantity
    });
  };

  const getPackingItemQuantity = (requestId: number, itemId: number): number => {
    const itemKey = `${requestId}-${itemId}`;
    return packingItemQuantities[itemKey] || 0;
  };

  const handleConfirmPacking = (request: LoanRequest) => {
    alert(`Packing confirmed for ${request.requestNumber}`);
  };

  const handlePrintSinglePacking = (request: LoanRequest) => {
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
                  const qty = packingItemQuantities[itemKey] !== undefined ? packingItemQuantities[itemKey] : item.quantity;
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
      setPrintedRequests(prev => new Set(prev).add(request.id));
    }
  };

  const handleOpenConditionDialog = (requestId: number, itemId: number, isKit: boolean, kitItemId?: number) => {
    setCurrentConditionItem({ requestId, itemId, kitItemId, isKit });
    const itemKey = isKit && kitItemId ? `${requestId}-${itemId}-${kitItemId}` : `${requestId}-${itemId}`;
    const existingCondition = isKit ? kitItemConditions[itemKey] : itemConditions[itemKey];
    
    if (existingCondition) {
      const goodMatch = existingCondition.match(/Good: (\d+)/);
      const revisionMatch = existingCondition.match(/Revision: (\d+)/);
      const lostMatch = existingCondition.match(/Lost: (\d+)/);
      
      setConditionCounts({
        good: goodMatch ? parseInt(goodMatch[1]) : 0,
        revision: revisionMatch ? parseInt(revisionMatch[1]) : 0,
        lost: lostMatch ? parseInt(lostMatch[1]) : 0,
      });
    } else {
      setConditionCounts({ good: 0, revision: 0, lost: 0 });
    }
    
    setConditionDialogOpen(true);
  };

  const handleSaveCondition = () => {
    if (!currentConditionItem) return;
    
    const { requestId, itemId, kitItemId, isKit } = currentConditionItem;
    const itemKey = isKit && kitItemId ? `${requestId}-${itemId}-${kitItemId}` : `${requestId}-${itemId}`;
    const total = conditionCounts.good + conditionCounts.revision + conditionCounts.lost;
    
    if (total === 0) {
      alert('Please specify at least one item condition.');
      return;
    }
    
    const returnQty = isKit && kitItemId 
      ? getKitItemQuantity(requestId, itemId, kitItemId) 
      : getReturnQuantity(requestId, itemId);
    
    if (total > returnQty) {
      alert(`Total condition count (${total}) cannot exceed the return quantity (${returnQty}).`);
      return;
    }
    
    if (total < returnQty) {
      alert(`Total condition count (${total}) must match the return quantity (${returnQty}).`);
      return;
    }
    
    let conditionString = '';
    if (conditionCounts.good > 0) conditionString += `Good: ${conditionCounts.good}`;
    if (conditionCounts.revision > 0) conditionString += (conditionString ? ', ' : '') + `Revision: ${conditionCounts.revision}`;
    if (conditionCounts.lost > 0) conditionString += (conditionString ? ', ' : '') + `Lost: ${conditionCounts.lost}`;
    
    if (isKit) {
      setKitItemConditions(prev => ({ ...prev, [itemKey]: conditionString }));
    } else {
      setItemConditions(prev => ({ ...prev, [itemKey]: conditionString }));
    }
    
    setConditionDialogOpen(false);
    setCurrentConditionItem(null);
  };

  // Returns Handlers
  const handleToggleExpandReturns = (id: number) => {
    const newExpanded = new Set(expandedReturns);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedReturns(newExpanded);
  };

  const handleToggleExpandKitItem = (requestId: number, itemId: number) => {
    const kitKey = `${requestId}-${itemId}`;
    const newExpanded = new Set(expandedKitItems);
    if (newExpanded.has(kitKey)) {
      newExpanded.delete(kitKey);
    } else {
      newExpanded.add(kitKey);
    }
    setExpandedKitItems(newExpanded);
  };

  const handleSelectReturnItem = (requestId: number, itemId: number) => {
    const itemKey = `${requestId}-${itemId}`;
    const newSelected = new Set(selectedReturnItems);
    const newQuantities = { ...returnQuantities };
    const newConditions = { ...itemConditions };
    
    if (newSelected.has(itemKey)) {
      newSelected.delete(itemKey);
      delete newQuantities[itemKey];
      delete newConditions[itemKey];
      setReturnQuantities(newQuantities);
      setItemConditions(newConditions);
    } else {
      newSelected.add(itemKey);
      const request = filteredReturns.find(r => r.id === requestId);
      const item = request?.items.find(i => i.id === itemId);
      if (item) {
        newQuantities[itemKey] = item.quantity;
        newConditions[itemKey] = 'good-condition';
        setReturnQuantities(newQuantities);
        setItemConditions(newConditions);
      }
    }
    setSelectedReturnItems(newSelected);
  };

  const handleSelectKitItem = (requestId: number, itemId: number, kitItemId: number) => {
    const kitItemKey = `${requestId}-${itemId}-${kitItemId}`;
    const newSelected = new Set(selectedKitItems);
    const newQuantities = { ...kitItemQuantities };
    const newConditions = { ...kitItemConditions };
    
    if (newSelected.has(kitItemKey)) {
      newSelected.delete(kitItemKey);
      delete newQuantities[kitItemKey];
      delete newConditions[kitItemKey];
    } else {
      newSelected.add(kitItemKey);
      // Initialize with max quantity and good condition
      const request = filteredReturns.find(r => r.id === requestId);
      const item = request?.items.find(i => i.id === itemId);
      const kitItem = item?.kitItems?.find(ki => ki.id === kitItemId);
      if (kitItem) {
        newQuantities[kitItemKey] = kitItem.quantity;
        newConditions[kitItemKey] = 'good-condition';
      }
    }
    setSelectedKitItems(newSelected);
    setKitItemQuantities(newQuantities);
    setKitItemConditions(newConditions);
  };

  const areAllKitItemsSelected = (requestId: number, itemId: number, kitItems: KitItem[]) => {
    return kitItems.every(kitItem => {
      const kitItemKey = `${requestId}-${itemId}-${kitItem.id}`;
      return selectedKitItems.has(kitItemKey);
    });
  };

  const hasSelectedKitItems = (requestId: number, itemId: number) => {
    const kitKey = `${requestId}-${itemId}`;
    return Array.from(selectedKitItems).some(key => key.startsWith(kitKey));
  };

  const handleSelectAllKitItems = (requestId: number, itemId: number, kitItems: KitItem[], checked: boolean) => {
    const newSelected = new Set(selectedKitItems);
    const newQuantities = { ...kitItemQuantities };
    const newConditions = { ...kitItemConditions };
    
    kitItems.forEach(kitItem => {
      const kitItemKey = `${requestId}-${itemId}-${kitItem.id}`;
      if (checked) {
        newSelected.add(kitItemKey);
        newQuantities[kitItemKey] = kitItem.quantity;
        newConditions[kitItemKey] = 'good-condition';
      } else {
        newSelected.delete(kitItemKey);
        delete newQuantities[kitItemKey];
        delete newConditions[kitItemKey];
      }
    });
    setSelectedKitItems(newSelected);
    setKitItemQuantities(newQuantities);
    setKitItemConditions(newConditions);
  };

  const handleKitItemQuantityChange = (requestId: number, itemId: number, kitItemId: number, quantity: number) => {
    const kitItemKey = `${requestId}-${itemId}-${kitItemId}`;
    const request = filteredReturns.find(r => r.id === requestId);
    const item = request?.items.find(i => i.id === itemId);
    const kitItem = item?.kitItems?.find(ki => ki.id === kitItemId);
    
    if (kitItem && quantity >= 1 && quantity <= kitItem.quantity) {
      setKitItemQuantities({
        ...kitItemQuantities,
        [kitItemKey]: quantity
      });
    }
  };

  const getKitItemQuantity = (requestId: number, itemId: number, kitItemId: number): number => {
    const kitItemKey = `${requestId}-${itemId}-${kitItemId}`;
    return kitItemQuantities[kitItemKey] || 1;
  };

  const handleItemConditionChange = (requestId: number, itemId: number, condition: string) => {
    const itemKey = `${requestId}-${itemId}`;
    setItemConditions({
      ...itemConditions,
      [itemKey]: condition
    });
  };

  const getItemCondition = (requestId: number, itemId: number): string => {
    const itemKey = `${requestId}-${itemId}`;
    return itemConditions[itemKey] || 'good-condition';
  };

  const handleKitItemConditionChange = (requestId: number, itemId: number, kitItemId: number, condition: string) => {
    const kitItemKey = `${requestId}-${itemId}-${kitItemId}`;
    setKitItemConditions({
      ...kitItemConditions,
      [kitItemKey]: condition
    });
  };

  const getKitItemCondition = (requestId: number, itemId: number, kitItemId: number): string => {
    const kitItemKey = `${requestId}-${itemId}-${kitItemId}`;
    return kitItemConditions[kitItemKey] || 'good-condition';
  };

  const formatConditionText = (condition: string): string => {
    if (condition === 'good-condition') return 'Condition';
    if (condition === 'on-revision') return 'On Revision';
    if (condition === 'lost') return 'Lost';
    return condition;
  };

  const handleReturnQuantityChange = (requestId: number, itemId: number, quantity: number) => {
    const itemKey = `${requestId}-${itemId}`;
    const request = filteredReturns.find(r => r.id === requestId);
    const item = request?.items.find(i => i.id === itemId);
    
    if (item && quantity >= 1 && quantity <= item.quantity) {
      setReturnQuantities({
        ...returnQuantities,
        [itemKey]: quantity
      });
    }
  };

  const getReturnQuantity = (requestId: number, itemId: number): number => {
    const itemKey = `${requestId}-${itemId}`;
    return returnQuantities[itemKey] || 1;
  };

  const handleTakePhotoItems = (request: LoanRequest) => {
    setCurrentReturnRequest(request);
    setItemsPhotoDialogOpen(true);
  };

  const handleCapturePhotoItems = () => {
    setCapturedPhoto(`photo-items-${Date.now()}.jpg`);
    alert('Photo captured successfully!');
    setItemsPhotoDialogOpen(false);
  };

  const handleTakeKitPhoto = (requestId: number, itemId: number) => {
    setCurrentKitItem({ requestId, itemId });
    setKitPhotoDialogOpen(true);
  };

  const handleCaptureKitPhoto = () => {
    if (currentKitItem) {
      const kitKey = `${currentKitItem.requestId}-${currentKitItem.itemId}`;
      setKitPhotos({
        ...kitPhotos,
        [kitKey]: `kit-photo-${Date.now()}.jpg`
      });
      alert('Kit photo captured successfully!');
    }
    setKitPhotoDialogOpen(false);
    setCurrentKitItem(null);
  };

  const handleConfirmReturnItems = (request: LoanRequest) => {
    const regularItems = request.items.filter(item => !item.isKit);
    const selectedCount = regularItems.filter(item => {
      const itemKey = `${request.id}-${item.id}`;
      return selectedReturnItems.has(itemKey);
    }).length;

    if (selectedCount === 0) {
      alert('Please select at least one item to return');
      return;
    }

    setCurrentReturnRequest(request);
    setItemsConfirmDialogOpen(true);
  };

  const handleConfirmReturnItemsDialog = () => {
    if (!currentReturnRequest) return;

    const regularItems = currentReturnRequest.items.filter(item => !item.isKit);
    const returnedItemIds = regularItems
      .filter(item => {
        const itemKey = `${currentReturnRequest.id}-${item.id}`;
        return selectedReturnItems.has(itemKey) && getReturnQuantity(currentReturnRequest.id, item.id) > 0;
      })
      .map(item => item.id);

    console.log('Confirming return (items):', {
      request: currentReturnRequest,
      returnedItemIds
    });

    // Remove returned items from the request
    setAllReturns(prevReturns => 
      prevReturns.map(request => {
        if (request.id === currentReturnRequest.id) {
          const remainingItems = request.items.filter(item => !returnedItemIds.includes(item.id));
          return {
            ...request,
            items: remainingItems
          };
        }
        return request;
      }).filter(request => request.items.length > 0)
    );

    // Clear selections for returned items
    const newSelectedItems = new Set(selectedReturnItems);
    const newQuantities = { ...returnQuantities };
    returnedItemIds.forEach(itemId => {
      const itemKey = `${currentReturnRequest.id}-${itemId}`;
      newSelectedItems.delete(itemKey);
      delete newQuantities[itemKey];
    });
    setSelectedReturnItems(newSelectedItems);
    setReturnQuantities(newQuantities);
    setCapturedPhoto(null);
    setItemsConfirmDialogOpen(false);
    
    alert(`Return confirmed for ${currentReturnRequest.requestNumber}. ${returnedItemIds.length} item(s) returned to inventory.`);
    setCurrentReturnRequest(null);
  };

  const handleSaveKitChecklist = (requestId: number, itemId: number) => {
    // Calculate missing kit items
    const request = filteredReturns.find(r => r.id === requestId);
    const kitItem = request?.items.find(i => i.id === itemId);
    
    if (kitItem && kitItem.kitItems) {
      const missing: Array<{id: number, name: string, category: string, missingQuantity: number, totalQuantity: number}> = [];
      
      kitItem.kitItems.forEach(item => {
        const kitItemKey = `${requestId}-${itemId}-${item.id}`;
        const isSelected = selectedKitItems.has(kitItemKey);
        const returnedQuantity = isSelected ? (kitItemQuantities[kitItemKey] || item.quantity) : 0;
        const missingQuantity = item.quantity - returnedQuantity;
        
        if (missingQuantity > 0) {
          missing.push({
            id: item.id,
            name: item.name,
            category: item.category,
            missingQuantity: missingQuantity,
            totalQuantity: item.quantity
          });
        }
      });
      
      setMissingKitItems(missing);
    }
    
    // Open the kit return modal
    setPendingKitReturn({ requestId, itemId });
    setKitReturnOption('');
    setKitReturnDialogOpen(true);
  };

  const handleConfirmKitReturn = () => {
    if (!pendingKitReturn || !kitReturnOption) {
      return;
    }

    const { requestId, itemId } = pendingKitReturn;
    const kitKey = `${requestId}-${itemId}`;
    const selectedCount = Array.from(selectedKitItems).filter(key => key.startsWith(kitKey)).length;
    
    // Remove the kit item from the request's items
    setAllReturns(prevReturns => 
      prevReturns.map(request => {
        if (request.id === requestId) {
          return {
            ...request,
            items: request.items.filter(item => item.id !== itemId)
          };
        }
        return request;
      }).filter(request => request.items.length > 0)
    );

    // Clear kit item selections
    const newSelectedKitItems = new Set(selectedKitItems);
    Array.from(selectedKitItems).forEach(key => {
      if (key.startsWith(kitKey)) {
        newSelectedKitItems.delete(key);
      }
    });
    setSelectedKitItems(newSelectedKitItems);

    // Clear return item selection
    const itemKey = `${requestId}-${itemId}`;
    const newSelectedItems = new Set(selectedReturnItems);
    newSelectedItems.delete(itemKey);
    setSelectedReturnItems(newSelectedItems);

    // Clear return quantity
    const newQuantities = { ...returnQuantities };
    delete newQuantities[itemKey];
    setReturnQuantities(newQuantities);

    // Close expanded kit
    const newExpanded = new Set(expandedKitItems);
    newExpanded.delete(kitKey);
    setExpandedKitItems(newExpanded);

    // Clear kit photo
    const newKitPhotos = { ...kitPhotos };
    delete newKitPhotos[kitKey];
    setKitPhotos(newKitPhotos);

    const optionText = kitReturnOption === 'restock' ? 'restocked' : 'disassembled';
    alert(`Kit ${optionText}! ${selectedCount} items selected. Kit removed from return list.`);
    
    // Close dialog and reset
    setKitReturnDialogOpen(false);
    setPendingKitReturn(null);
    setKitReturnOption('');
    setMissingKitItems([]);
  };

  const handlePrintMissingItems = () => {
    if (!pendingKitReturn) return;
    
    const { requestId, itemId } = pendingKitReturn;
    const request = filteredReturns.find(r => r.id === requestId);
    const kitItem = request?.items.find(i => i.id === itemId);
    
    if (!kitItem) return;
    
    const printWindow = window.open('', '', 'width=800,height=600');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Missing Kit Items - ${kitItem.articleName}</title>
            <style>
              body {
                font-family: 'Segoe UI Variable', 'Segoe UI', sans-serif;
                padding: 20px;
                color: #191C37;
              }
              h1 {
                color: #191C37;
                border-bottom: 2px solid #568FCB;
                padding-bottom: 10px;
              }
              h2 {
                color: #568FCB;
                margin-top: 20px;
              }
              table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 20px;
              }
              th, td {
                border: 1px solid #ddd;
                padding: 12px;
                text-align: left;
              }
              th {
                background-color: #568FCB;
                color: white;
              }
              tr:nth-child(even) {
                background-color: #F3F2F8;
              }
              .header-info {
                margin-bottom: 20px;
              }
              .info-row {
                margin: 5px 0;
              }
              @media print {
                button { display: none; }
              }
            </style>
          </head>
          <body>
            <h1>Missing Kit Items Report</h1>
            <div class="header-info">
              <div class="info-row"><strong>Kit Name:</strong> ${kitItem.articleName}</div>
              <div class="info-row"><strong>BIN Code:</strong> ${kitItem.articleBinCode}</div>
              <div class="info-row"><strong>Request Number:</strong> ${request.requestNumber}</div>
              <div class="info-row"><strong>Borrower:</strong> ${request.borrower}</div>
              <div class="info-row"><strong>Date:</strong> ${new Date().toLocaleDateString()}</div>
            </div>
            <h2>Items to Restock (${missingKitItems.length})</h2>
            <table>
              <thead>
                <tr>
                  <th>Item Name</th>
                  <th>Category</th>
                  <th>Missing Quantity</th>
                  <th>Total Required</th>
                </tr>
              </thead>
              <tbody>
                ${missingKitItems.map(item => `
                  <tr>
                    <td>${item.name}</td>
                    <td>${item.category}</td>
                    <td>${item.missingQuantity}</td>
                    <td>${item.totalQuantity}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            <script>
              window.onload = function() { window.print(); }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  const getPriorityBadge = (priority: string) => {
    const badges = {
      low: <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">Low</Badge>,
      medium: <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">Medium</Badge>,
      high: <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-300">High</Badge>,
      urgent: <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300">Urgent</Badge>
    };
    return badges[priority as keyof typeof badges] || null;
  };

  const isKitOrder = (request: LoanRequest) => {
    return request.requestNumber.startsWith('KIT-');
  };

  const getSelectedItemsCount = (requestId: number, items: LoanItem[]) => {
    return items.filter(item => {
      const itemKey = `${requestId}-${item.id}`;
      return selectedPackingItems.has(itemKey);
    }).length;
  };

  const areAllItemsSelected = (requestId: number, items: LoanItem[]) => {
    return items.every(item => {
      const itemKey = `${requestId}-${item.id}`;
      return selectedPackingItems.has(itemKey);
    });
  };

  const handleSelectAllPackingItems = (request: LoanRequest, checked: boolean) => {
    const newSelected = new Set(selectedPackingItems);
    request.items.forEach(item => {
      const itemKey = `${request.id}-${item.id}`;
      if (checked) {
        newSelected.add(itemKey);
      } else {
        newSelected.delete(itemKey);
      }
    });
    setSelectedPackingItems(newSelected);
  };

  const areAllRegularItemsSelected = (requestId: number, items: LoanItem[]) => {
    const regularItems = items.filter(item => !item.isKit);
    if (regularItems.length === 0) return false;
    return regularItems.every(item => {
      const itemKey = `${requestId}-${item.id}`;
      return selectedReturnItems.has(itemKey);
    });
  };

  const handleSelectAllRegularItems = (request: LoanRequest, checked: boolean) => {
    const newSelected = new Set(selectedReturnItems);
    const newQuantities = { ...returnQuantities };
    
    const regularItems = request.items.filter(item => !item.isKit);
    regularItems.forEach(item => {
      const itemKey = `${request.id}-${item.id}`;
      if (checked) {
        newSelected.add(itemKey);
        newQuantities[itemKey] = item.quantity;
      } else {
        newSelected.delete(itemKey);
        delete newQuantities[itemKey];
      }
    });
    
    setSelectedReturnItems(newSelected);
    setReturnQuantities(newQuantities);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-2" style={{ fontWeight: 700, fontSize: '2rem' }}>Manage Requests</h1>
      </div>

      <Tabs defaultValue="packing-requests" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="packing-requests">Packing Requests</TabsTrigger>
          <TabsTrigger value="returns">Returns</TabsTrigger>
        </TabsList>

        {/* Packing Requests Tab */}
        <TabsContent value="packing-requests" className="space-y-4">
          <div className="flex justify-end">
            <Button className="bg-[#568FCB] hover:bg-[#4A7AB5]">
              <Plus className="h-4 w-4 mr-2" />
              Create New Request Order
            </Button>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <Package className="h-5 w-5 mr-2" />
                  Packing Requests ({packingRequests.length})
                </CardTitle>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    disabled={packingRequests.length === 0}
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
                    {packingRequests.map((request) => (
                      <React.Fragment key={request.id}>
                        <TableRow className="hover:bg-muted/50">
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleExpandPacking(request.id)}
                            >
                              {expandedPackingRequests.has(request.id) ? (
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
                              {isKitOrder(request) ? `${request.items.length}` : `${getSelectedItemsCount(request.id, request.items)} / ${request.items.length}`}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePrintSinglePacking(request)}
                              >
                                <Printer className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => handleConfirmPacking(request)}
                                disabled={!printedRequests.has(request.id) || (!isKitOrder(request) && getSelectedItemsCount(request.id, request.items) === 0)}
                              >
                                <Package className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>

                        {expandedPackingRequests.has(request.id) && (
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
                                      id={`select-all-packing-${request.id}`}
                                      checked={areAllItemsSelected(request.id, request.items)}
                                      onChange={(e) => handleSelectAllPackingItems(request, e.target.checked)}
                                      className="h-4 w-4"
                                    />
                                    <label htmlFor={`select-all-packing-${request.id}`} className="text-sm cursor-pointer">
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
                                                  checked={selectedPackingItems.has(itemKey)}
                                                  onChange={() => handleSelectPackingItem(request.id, item.id)}
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
                                                    value={getPackingItemQuantity(request.id, item.id)}
                                                    onChange={(e) => handlePackingQuantityChange(request.id, item.id, parseInt(e.target.value) || 0)}
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

        {/* Returns Tab */}
        <TabsContent value="returns" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <Package className="h-5 w-5 mr-2" />
                  <span className="font-bold text-2xl">Returns ({filteredReturns.length})</span>
                </CardTitle>
              </div>
              
              {/* Borrower Selector and Search for Returns */}
              <div className="mt-4 flex gap-4">
                <div className="flex-1 max-w-xs">
                  <Label htmlFor="return-borrower-select" className="text-sm mb-2 block">
                    Select Borrower
                  </Label>
                  <Select value={selectedReturnBorrower} onValueChange={handleBorrowerSelect}>
                    <SelectTrigger id="return-borrower-select">
                      <SelectValue placeholder="Select a borrower" />
                    </SelectTrigger>
                    <SelectContent>
                      <div className="p-2 sticky top-0 bg-background z-10">
                        <Input
                          placeholder="Search borrower..."
                          value={borrowerSelectSearchTerm}
                          onChange={(e) => setBorrowerSelectSearchTerm(e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          onKeyDown={(e) => e.stopPropagation()}
                          className="mb-2"
                        />
                      </div>
                      <div className="max-h-[300px] overflow-y-auto">
                        {filteredBorrowersForSelect.length > 0 ? (
                          filteredBorrowersForSelect.map((borrower) => (
                            <SelectItem key={borrower} value={borrower}>
                              {borrower}
                            </SelectItem>
                          ))
                        ) : (
                          <div className="p-2 text-sm text-muted-foreground text-center">
                            No borrowers found
                          </div>
                        )}
                      </div>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {!selectedReturnBorrower ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Please select a borrower to view their return items</p>
                </div>
              ) : filteredReturns.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No return items found for this borrower</p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12"></TableHead>
                        <TableHead>Borrower</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Project</TableHead>
                        <TableHead>Loan Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredReturns.map((request) => {
                        const regularItems = request.items.filter(item => !item.isKit);
                        const kitItems = request.items.filter(item => item.isKit);
                        
                        return (
                          <React.Fragment key={request.id}>
                            <TableRow className="hover:bg-muted/50">
                              <TableCell>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleToggleExpandReturns(request.id)}
                                >
                                  {expandedReturns.has(request.id) ? (
                                    <ChevronDown className="h-4 w-4" />
                                  ) : (
                                    <ChevronRight className="h-4 w-4" />
                                  )}
                                </Button>
                              </TableCell>
                              <TableCell>
                                <div>
                                  <div>{request.borrower}</div>
                                  <div className="text-sm text-muted-foreground">{request.borrowerEmail}</div>
                                </div>
                              </TableCell>
                              <TableCell>{request.department}</TableCell>
                              <TableCell>{request.project}</TableCell>
                              <TableCell>{request.loanDate || request.requestedLoanDate}</TableCell>
                            </TableRow>

                            {expandedReturns.has(request.id) && (
                              <TableRow>
                                <TableCell colSpan={5} className="bg-muted/30 p-0">
                                  <div className="p-4">
                                    <h4 className="flex items-center mb-4">
                                      <Package className="h-4 w-4 mr-2" />
                                      Items to return
                                    </h4>

                                    <Tabs defaultValue="items" className="w-full">
                                      <TabsList className="grid w-full grid-cols-2">
                                        <TabsTrigger value="items">Items ({regularItems.length})</TabsTrigger>
                                        <TabsTrigger value="kits">Kits ({kitItems.length})</TabsTrigger>
                                      </TabsList>

                                      {/* Items Tab */}
                                      <TabsContent value="items" className="space-y-4">
                                        <div className="flex items-center justify-between mb-3">
                                          <div className="flex items-center space-x-2">
                                            <input
                                              type="checkbox"
                                              id={`select-all-items-${request.id}`}
                                              checked={areAllRegularItemsSelected(request.id, request.items)}
                                              onChange={(e) => handleSelectAllRegularItems(request, e.target.checked)}
                                              className="h-4 w-4"
                                            />
                                            <label htmlFor={`select-all-items-${request.id}`} className="text-sm cursor-pointer">
                                              Select All Items
                                            </label>
                                          </div>
                                        </div>

                                        <div className="rounded-md border bg-card">
                                          <Table>
                                            <TableHeader>
                                              <TableRow>
                                                <TableHead className="w-12">Select</TableHead>
                                                <TableHead className="w-20">Image</TableHead>
                                                <TableHead>BIN Code</TableHead>
                                                <TableHead>Name</TableHead>
                                                <TableHead>Description</TableHead>
                                                <TableHead>Quantity to Return</TableHead>
                                                <TableHead>Condition</TableHead>
                                                <TableHead>Type</TableHead>
                                              </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                              {regularItems.length === 0 ? (
                                                <TableRow>
                                                  <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                                                    No regular items to return
                                                  </TableCell>
                                                </TableRow>
                                              ) : (
                                                regularItems.map((item) => {
                                                  const itemKey = `${request.id}-${item.id}`;
                                                  const isSelected = selectedReturnItems.has(itemKey);
                                                  return (
                                                    <TableRow key={item.id}>
                                                      <TableCell>
                                                        <input
                                                          type="checkbox"
                                                          checked={isSelected}
                                                          onChange={() => handleSelectReturnItem(request.id, item.id)}
                                                          className="h-4 w-4"
                                                        />
                                                      </TableCell>
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
                                                        <div className="flex items-center space-x-2">
                                                          <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleReturnQuantityChange(request.id, item.id, Math.max(1, getReturnQuantity(request.id, item.id) - 1))}
                                                            disabled={!isSelected || getReturnQuantity(request.id, item.id) <= 1}
                                                          >
                                                            -
                                                          </Button>
                                                          <Input
                                                            type="number"
                                                            min="1"
                                                            max={item.quantity}
                                                            value={getReturnQuantity(request.id, item.id)}
                                                            onChange={(e) => handleReturnQuantityChange(request.id, item.id, parseInt(e.target.value) || 1)}
                                                            className="w-20 text-center"
                                                            disabled={!isSelected}
                                                          />
                                                          <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleReturnQuantityChange(request.id, item.id, Math.min(item.quantity, getReturnQuantity(request.id, item.id) + 1))}
                                                            disabled={!isSelected || getReturnQuantity(request.id, item.id) >= item.quantity}
                                                          >
                                                            +
                                                          </Button>
                                                          <span className="text-sm text-muted-foreground">/ {item.quantity} {item.unit}</span>
                                                        </div>
                                                      </TableCell>
                                                      <TableCell>
                                                        <Button
                                                          variant="outline"
                                                          size="sm"
                                                          onClick={() => handleOpenConditionDialog(request.id, item.id, false)}
                                                          disabled={!isSelected}
                                                          className="w-[160px]"
                                                        >
                                                          {formatConditionText(getItemCondition(request.id, item.id)) || 'Select Condition'}
                                                        </Button>
                                                      </TableCell>
                                                      <TableCell>
                                                        <Badge variant={item.articleType === 'consumable' ? 'secondary' : 'outline'}>
                                                          {item.articleType === 'consumable' ? 'Consumable' : 'Non-Consumable'}
                                                        </Badge>
                                                      </TableCell>
                                                    </TableRow>
                                                  );
                                                })
                                              )}
                                            </TableBody>
                                          </Table>
                                        </div>

                                        {regularItems.length > 0 && (
                                          <>
                                            {/* Photo captured indicator */}
                                            {capturedPhoto && (
                                              <Alert className="bg-green-50 border-green-200">
                                                <CheckCircle className="h-4 w-4 text-green-600" />
                                                <AlertDescription className="text-green-800">
                                                  Photo captured: {capturedPhoto}
                                                </AlertDescription>
                                              </Alert>
                                            )}

                                            {/* Action Buttons */}
                                            <div className="flex justify-end space-x-2">
                                              <Button
                                                variant="outline"
                                                onClick={() => handleTakePhotoItems(request)}
                                                className="bg-[#568FCB] hover:bg-[#4A7AB5] text-black"
                                              >
                                                <Camera className="h-4 w-4 mr-2" />
                                                Take Photo
                                              </Button>
                                              <Button
                                                onClick={() => handleConfirmReturnItems(request)}
                                                className="bg-[#46B593] hover:bg-[#3DA482] text-black disabled:bg-gray-400 disabled:hover:bg-gray-400"
                                                disabled={!request.items.filter(item => !item.isKit).some(item => selectedReturnItems.has(`${request.id}-${item.id}`))}
                                              >
                                                <CheckCircle className="h-4 w-4 mr-2" />
                                                Return
                                              </Button>
                                            </div>
                                          </>
                                        )}
                                      </TabsContent>

                                      {/* Kits Tab */}
                                      <TabsContent value="kits" className="space-y-4">
                                        {kitItems.length === 0 ? (
                                          <div className="text-center py-8 text-muted-foreground">
                                            <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                            <p>No kits to return</p>
                                          </div>
                                        ) : (
                                          kitItems.map((kitItem) => {
                                            const kitKey = `${request.id}-${kitItem.id}`;
                                            const isKitExpanded = expandedKitItems.has(kitKey);
                                            
                                            return (
                                              <div key={kitItem.id} className="border rounded-lg p-4 bg-card">
                                                <div className="flex items-center justify-between mb-4">
                                                  <div className="flex items-center gap-4">
                                                    <Button
                                                      variant="ghost"
                                                      size="sm"
                                                      onClick={() => handleToggleExpandKitItem(request.id, kitItem.id)}
                                                    >
                                                      {isKitExpanded ? (
                                                        <ChevronDown className="h-4 w-4" />
                                                      ) : (
                                                        <ChevronRight className="h-4 w-4" />
                                                      )}
                                                    </Button>
                                                    <ImageWithFallback
                                                      src={kitItem.imageUrl || ''}
                                                      alt={kitItem.articleName}
                                                      className="w-16 h-16 object-cover rounded"
                                                    />
                                                    <div>
                                                      <p className="font-mono text-sm text-muted-foreground">{kitItem.articleBinCode}</p>
                                                      <h5>{kitItem.articleName}</h5>
                                                      <p className="text-sm text-muted-foreground">{kitItem.articleDescription}</p>
                                                    </div>
                                                  </div>
                                                </div>

                                                {isKitExpanded && kitItem.kitItems && (
                                                  <div className="space-y-4">
                                                    <div className="flex items-center justify-between">
                                                      <h6 className="flex items-center">
                                                        <Package className="h-4 w-4 mr-2" />
                                                        Kit Items Checklist
                                                      </h6>
                                                      <div className="flex items-center space-x-2">
                                                        <input
                                                          type="checkbox"
                                                          id={`select-all-kit-${request.id}-${kitItem.id}`}
                                                          checked={areAllKitItemsSelected(request.id, kitItem.id, kitItem.kitItems)}
                                                          onChange={(e) => handleSelectAllKitItems(request.id, kitItem.id, kitItem.kitItems, e.target.checked)}
                                                          className="h-4 w-4"
                                                        />
                                                        <label htmlFor={`select-all-kit-${request.id}-${kitItem.id}`} className="text-sm cursor-pointer">
                                                          Select All Kit Items
                                                        </label>
                                                      </div>
                                                    </div>

                                                    <div className="rounded-md border">
                                                      <Table>
                                                        <TableHeader>
                                                          <TableRow>
                                                            <TableHead className="w-12">Select</TableHead>
                                                            <TableHead className="w-20">Image</TableHead>
                                                            <TableHead>Name</TableHead>
                                                            <TableHead>Description</TableHead>
                                                            <TableHead>Category</TableHead>
                                                            <TableHead>Quantity to Return</TableHead>
                                                            <TableHead>Condition</TableHead>
                                                            <TableHead>Type</TableHead>
                                                          </TableRow>
                                                        </TableHeader>
                                                        <TableBody>
                                                          {kitItem.kitItems.map((item) => {
                                                            const kitItemKey = `${request.id}-${kitItem.id}-${item.id}`;
                                                            const isKitItemSelected = selectedKitItems.has(kitItemKey);
                                                            return (
                                                              <TableRow key={item.id}>
                                                                <TableCell>
                                                                  <input
                                                                    type="checkbox"
                                                                    checked={isKitItemSelected}
                                                                    onChange={() => handleSelectKitItem(request.id, kitItem.id, item.id)}
                                                                    className="h-4 w-4"
                                                                  />
                                                                </TableCell>
                                                                <TableCell>
                                                                  <ImageWithFallback
                                                                    src={item.imageUrl || ''}
                                                                    alt={item.name}
                                                                    className="w-12 h-12 object-cover rounded"
                                                                  />
                                                                </TableCell>
                                                                <TableCell>{item.name}</TableCell>
                                                                <TableCell className="text-sm text-muted-foreground">{item.description}</TableCell>
                                                                <TableCell>{item.category}</TableCell>
                                                                <TableCell>
                                                                  <div className="flex items-center space-x-2">
                                                                    <Button
                                                                      variant="outline"
                                                                      size="sm"
                                                                      onClick={() => handleKitItemQuantityChange(request.id, kitItem.id, item.id, Math.max(1, getKitItemQuantity(request.id, kitItem.id, item.id) - 1))}
                                                                      disabled={!isKitItemSelected || getKitItemQuantity(request.id, kitItem.id, item.id) <= 1}
                                                                    >
                                                                      -
                                                                    </Button>
                                                                    <Input
                                                                      type="number"
                                                                      min="1"
                                                                      max={item.quantity}
                                                                      value={getKitItemQuantity(request.id, kitItem.id, item.id)}
                                                                      onChange={(e) => handleKitItemQuantityChange(request.id, kitItem.id, item.id, parseInt(e.target.value) || 1)}
                                                                      className="w-20 text-center"
                                                                      disabled={!isKitItemSelected}
                                                                    />
                                                                    <Button
                                                                      variant="outline"
                                                                      size="sm"
                                                                      onClick={() => handleKitItemQuantityChange(request.id, kitItem.id, item.id, Math.min(item.quantity, getKitItemQuantity(request.id, kitItem.id, item.id) + 1))}
                                                                      disabled={!isKitItemSelected || getKitItemQuantity(request.id, kitItem.id, item.id) >= item.quantity}
                                                                    >
                                                                      +
                                                                    </Button>
                                                                    <span className="text-sm text-muted-foreground">/ {item.quantity} {item.unit}</span>
                                                                  </div>
                                                                </TableCell>
                                                                <TableCell>
                                                                  <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => handleOpenConditionDialog(request.id, kitItem.id, true, item.id)}
                                                                    disabled={!isKitItemSelected}
                                                                    className="w-[160px]"
                                                                  >
                                                                    {formatConditionText(getKitItemCondition(request.id, kitItem.id, item.id)) || 'Select Condition'}
                                                                  </Button>
                                                                </TableCell>
                                                                <TableCell>
                                                                  <Badge variant={item.type === 'consumable' ? 'secondary' : 'outline'}>
                                                                    {item.type === 'consumable' ? 'Consumable' : 'Non-Consumable'}
                                                                  </Badge>
                                                                </TableCell>
                                                              </TableRow>
                                                            );
                                                          })}
                                                        </TableBody>
                                                      </Table>
                                                    </div>

                                                    {/* Kit Photo captured indicator */}
                                                    {kitPhotos[kitKey] && (
                                                      <Alert className="bg-green-50 border-green-200">
                                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                                        <AlertDescription className="text-green-800">
                                                          Photo captured: {kitPhotos[kitKey]}
                                                        </AlertDescription>
                                                      </Alert>
                                                    )}

                                                    {/* Kit Action Buttons */}
                                                    <div className="flex justify-end space-x-2">
                                                      <Button
                                                        variant="outline"
                                                        onClick={() => handleTakeKitPhoto(request.id, kitItem.id)}
                                                        className="bg-[#568FCB] hover:bg-[#4A7AB5] text-black"
                                                      >
                                                        <Camera className="h-4 w-4 mr-2" />
                                                        Take Photo
                                                      </Button>
                                                      <Button
                                                        variant="outline"
                                                        onClick={() => handleSaveKitChecklist(request.id, kitItem.id)}
                                                        className="bg-[#46B593] hover:bg-[#3DA482] text-black disabled:bg-gray-400 disabled:hover:bg-gray-400"
                                                        disabled={!hasSelectedKitItems(request.id, kitItem.id)}
                                                      >
                                                        <CheckCircle className="h-4 w-4 mr-2" />
                                                        Return
                                                      </Button>
                                                    </div>
                                                  </div>
                                                )}
                                              </div>
                                            );
                                          })
                                        )}
                                      </TabsContent>
                                    </Tabs>
                                  </div>
                                </TableCell>
                              </TableRow>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Photo Capture Dialog for Items */}
      <Dialog open={itemsPhotoDialogOpen} onOpenChange={setItemsPhotoDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Take Photo of Return Items</DialogTitle>
            <DialogDescription>
              Capture a photo of the items being returned for documentation purposes.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center space-y-4 py-6">
            <div className="w-full h-64 bg-muted rounded-lg flex items-center justify-center border-2 border-dashed">
              <Camera className="h-16 w-16 text-muted-foreground" />
            </div>
            <p className="text-sm text-black">Camera preview would appear here</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setItemsPhotoDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCapturePhotoItems} className="bg-[#568FCB] hover:bg-[#4A7AB5]">
              <Camera className="h-4 w-4 mr-2" />
              Capture Photo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Kit Photo Capture Dialog */}
      <Dialog open={kitPhotoDialogOpen} onOpenChange={setKitPhotoDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Take Photo of Kit Items</DialogTitle>
            <DialogDescription>
              Capture a photo of the kit items being returned for documentation purposes.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center space-y-4 py-6">
            <div className="w-full h-64 bg-muted rounded-lg flex items-center justify-center border-2 border-dashed">
              <Camera className="h-16 w-16 text-muted-foreground" />
            </div>
            <p className="text-sm text-black">Camera preview would appear here</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setKitPhotoDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCaptureKitPhoto} className="bg-[#568FCB] hover:bg-[#4A7AB5]">
              <Camera className="h-4 w-4 mr-2" />
              Capture Photo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Return Dialog for Items */}
      <Dialog open={itemsConfirmDialogOpen} onOpenChange={setItemsConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Return</DialogTitle>
            <DialogDescription>
              Are you sure you want to confirm the return of the selected items? This will update the inventory.
            </DialogDescription>
          </DialogHeader>
          {currentReturnRequest && (
            <div className="py-4">
              <p className="mb-2">
                <span className="font-semibold">Request Number:</span> {currentReturnRequest.requestNumber}
              </p>
              <p className="mb-2">
                <span className="font-semibold">Borrower:</span> {currentReturnRequest.borrower}
              </p>
              <p className="mb-4">
                <span className="font-semibold">Items being returned:</span>
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                {currentReturnRequest.items
                  .filter(item => !item.isKit && selectedReturnItems.has(`${currentReturnRequest.id}-${item.id}`) && getReturnQuantity(currentReturnRequest.id, item.id) > 0)
                  .map(item => (
                    <li key={item.id}>
                      {item.articleName} - {getReturnQuantity(currentReturnRequest.id, item.id)} {item.unit}
                    </li>
                  ))}
              </ul>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setItemsConfirmDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmReturnItemsDialog} className="bg-[#46B593] hover:bg-[#3DA482]">
              <CheckCircle className="h-4 w-4 mr-2" />
              Confirm Return
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Kit Return Options Dialog */}
      <Dialog open={kitReturnDialogOpen} onOpenChange={setKitReturnDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Kit Return Options</DialogTitle>
            <DialogDescription>
              {pendingKitReturn && (() => {
                const request = filteredReturns.find(r => r.id === pendingKitReturn.requestId);
                const kitItem = request?.items.find(i => i.id === pendingKitReturn.itemId);
                return kitItem ? (
                  <span>
                    <strong>{kitItem.articleName}</strong> ({kitItem.articleBinCode}) - Choose how you want to handle the returned kit.
                  </span>
                ) : 'Choose how you want to handle the returned kit.';
              })()}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <RadioGroup value={kitReturnOption} onValueChange={setKitReturnOption}>
              <div className="space-y-3">
                <div 
                  onClick={() => setKitReturnOption('restock')}
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                    kitReturnOption === 'restock' 
                      ? 'border-[#568FCB] bg-[#568FCB]/10' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="restock" id="restock" />
                    <div>
                      <Label htmlFor="restock" className="cursor-pointer text-base">
                        Restock Kit
                      </Label>
                    </div>
                  </div>
                </div>
                <div 
                  onClick={() => setKitReturnOption('disassemble')}
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                    kitReturnOption === 'disassemble' 
                      ? 'border-[#568FCB] bg-[#568FCB]/10' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-3" >
                    <RadioGroupItem value="disassemble" id="disassemble" />
                    <div>
                      <Label htmlFor="disassemble" className="cursor-pointer text-base">
                        Disassemble Kit
                      </Label>
                    </div>
                  </div>
                </div>
              </div>
            </RadioGroup>

            {/* Show missing items list when Restock Kit is selected */}
            {kitReturnOption === 'restock' && missingKitItems.length > 0 && (
              <div className="mt-6 border-2 border-[#568FCB] rounded-lg p-4 bg-[#568FCB]/5">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-base flex items-center">
                    <Package className="h-4 w-4 mr-2 text-[#568FCB]" />
                    Items to Restock ({missingKitItems.length})
                  </h4>
                  <Button
                    onClick={handlePrintMissingItems}
                    variant="outline"
                    size="sm"
                    className="bg-white hover:bg-gray-50"
                  >
                    <span className="mr-2">🖨️</span>
                    Print List
                  </Button>
                </div>
                <div className="rounded-md border bg-white">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead className="text-right">Missing Qty</TableHead>
                        <TableHead className="text-right">Total Required</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {missingKitItems.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.name}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{item.category}</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <span className="font-semibold text-orange-600">{item.missingQuantity}</span>
                          </TableCell>
                          <TableCell className="text-right">{item.totalQuantity}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}

            {kitReturnOption === 'restock' && missingKitItems.length === 0 && (
              <Alert className="mt-6 bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  All kit items have been returned. No items need to be restocked.
                </AlertDescription>
              </Alert>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setKitReturnDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="outline"
              onClick={handleConfirmKitReturn} 
              className="bg-[#46B593] hover:bg-[#3DA482]"
              disabled={!kitReturnOption}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Condition Dialog */}
      <Dialog open={conditionDialogOpen} onOpenChange={setConditionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set Item Condition</DialogTitle>
            <DialogDescription>
              Specify the quantity for each condition type.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="good-count">Good Condition</Label>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setConditionCounts(prev => ({ ...prev, good: Math.max(0, prev.good - 1) }))}
                >
                  -
                </Button>
                <Input
                  id="good-count"
                  type="number"
                  min="0"
                  value={conditionCounts.good}
                  onChange={(e) => setConditionCounts(prev => ({ ...prev, good: Math.max(0, parseInt(e.target.value) || 0) }))}
                  className="w-20 text-center"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setConditionCounts(prev => ({ ...prev, good: prev.good + 1 }))}
                >
                  +
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="revision-count">On Revision</Label>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setConditionCounts(prev => ({ ...prev, revision: Math.max(0, prev.revision - 1) }))}
                >
                  -
                </Button>
                <Input
                  id="revision-count"
                  type="number"
                  min="0"
                  value={conditionCounts.revision}
                  onChange={(e) => setConditionCounts(prev => ({ ...prev, revision: Math.max(0, parseInt(e.target.value) || 0) }))}
                  className="w-20 text-center"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setConditionCounts(prev => ({ ...prev, revision: prev.revision + 1 }))}
                >
                  +
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="lost-count">Lost</Label>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setConditionCounts(prev => ({ ...prev, lost: Math.max(0, prev.lost - 1) }))}
                >
                  -
                </Button>
                <Input
                  id="lost-count"
                  type="number"
                  min="0"
                  value={conditionCounts.lost}
                  onChange={(e) => setConditionCounts(prev => ({ ...prev, lost: Math.max(0, parseInt(e.target.value) || 0) }))}
                  className="w-20 text-center"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setConditionCounts(prev => ({ ...prev, lost: prev.lost + 1 }))}
                >
                  +
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConditionDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="outline" onClick={handleSaveCondition} 
              className="bg-[#46B593] hover:bg-[#3DA482] text-black"
            >
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
