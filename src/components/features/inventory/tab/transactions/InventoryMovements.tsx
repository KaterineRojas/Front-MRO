import React, { useState } from 'react';
import { Badge } from '../../../ui/badge';
import { TrendingUp, TrendingDown, RotateCcw } from 'lucide-react';
import { MovementFilters } from './MovementFilters';
import { MovementTable } from './MovementTable';
import { CycleCountModal } from './CycleCountModal';
import { UseMovementFilters } from './UseMovementFilters';
import type { Movement, CycleCountItem } from './types';

const mockMovements: Movement[] = [
  {
    id: 1,
    type: 'entry',
    subtype: 'purchase',
    articleCode: 'OFF-001',
    articleDescription: 'Office Paper A4 - 80gsm',
    quantity: 500,
    unit: 'sheets',
    reference: 'PO-2025-001',
    notes: 'Quarterly paper stock replenishment',
    user: 'Sarah Johnson',
    project: 'Office Supplies Replenishment',
    date: '2025-01-20',
    createdAt: '2025-01-20T10:30:00Z',
  },
  {
    id: 2,
    type: 'exit',
    subtype: 'loan',
    articleCode: 'TECH-002',
    articleDescription: 'Laptop Dell Latitude 5520',
    quantity: 1,
    unit: 'units',
    reference: 'LOAN-001',
    notes: 'Loan to Marketing team for presentation',
    user: 'Mike Chen',
    project: 'Product Launch Campaign',
    date: '2025-01-20',
    createdAt: '2025-01-20T14:15:00Z',
  },
  {
    id: 3,
    type: 'exit',
    subtype: 'consumption',
    articleCode: 'USB-003',
    articleDescription: 'USB Cable Type-C 2m',
    quantity: 2,
    unit: 'units',
    reference: 'CONS-001',
    notes: 'IT department setup new workstations',
    user: 'Anna Rodriguez',
    project: 'Workstation Setup Project',
    date: '2025-01-19',
    createdAt: '2025-01-19T09:45:00Z',
  },
  {
    id: 4,
    type: 'entry',
    subtype: 'return',
    articleCode: 'TECH-002',
    articleDescription: 'Laptop Dell Latitude 5520',
    quantity: 1,
    unit: 'units',
    reference: 'LOAN-001',
    notes: 'Returned from Marketing team',
    user: 'David Wilson',
    project: 'Product Launch Campaign',
    date: '2025-01-19',
    createdAt: '2025-01-19T16:20:00Z',
  },
  {
    id: 5,
    type: 'adjustment',
    subtype: 'audit',
    articleCode: 'OFF-001',
    articleDescription: 'Office Paper A4 - 80gsm',
    quantity: -50,
    unit: 'sheets',
    reference: 'AUD-2025-001',
    notes: 'Physical count adjustment - damaged paper found',
    user: 'Sarah Johnson',
    project: 'Monthly Audit Process',
    date: '2025-01-18',
    createdAt: '2025-01-18T11:00:00Z',
  },
];

const mockCycleCountItems: CycleCountItem[] = [
  {
    id: 1,
    code: 'OFF-001',
    description: 'Office Paper A4 - 80gsm',
    systemStock: 2500,
    physicalStock: 2500,
    unit: 'sheets',
    unitCost: 0.02,
    totalValue: 50.0,
    variance: 0,
  },
  {
    id: 2,
    code: 'TECH-002',
    description: 'Laptop Dell Latitude 5520',
    systemStock: 15,
    physicalStock: 14,
    unit: 'units',
    unitCost: 1200.0,
    totalValue: 16800.0,
    variance: -1,
  },
  {
    id: 3,
    code: 'USB-003',
    description: 'USB Cable Type-C 2m',
    systemStock: 5,
    physicalStock: 7,
    unit: 'units',
    unitCost: 8.99,
    totalValue: 62.93,
    variance: 2,
  },
];

export function InventoryMovements() {
  const [movements] = useState<Movement[]>(mockMovements);
  const [cycleCountOpen, setCycleCountOpen] = useState(false);
  const [cycleCountItems, setCycleCountItems] = useState<CycleCountItem[]>(mockCycleCountItems);

  // Custom hook for filters
  const {
    filterType,
    setFilterType,
    filterSubtype,
    setFilterSubtype,
    filterUser,
    setFilterUser,
    filterProject,
    setFilterProject,
    filteredMovements,
    uniqueUsers,
    uniqueProjects,
  } = UseMovementFilters(movements);

  const updatePhysicalStock = (id: number, newStock: number) => {
    setCycleCountItems((items) =>
      items.map((item) => {
        if (item.id === id) {
          const variance = newStock - item.systemStock;
          const totalValue = newStock * item.unitCost;
          return {
            ...item,
            physicalStock: newStock,
            variance,
            totalValue,
          };
        }
        return item;
      })
    );
  };

  const saveCycleCount = () => {
    console.log('Saving cycle count adjustments...', cycleCountItems);
    setCycleCountOpen(false);
  };

  const printCycleCount = () => {
    const printContent = document.getElementById('cycle-count-table');
    if (printContent) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Cycle Count Report - ${new Date().toLocaleDateString()}</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th, td { border: 1px solid #000; padding: 8px; text-align: left; font-size: 12px; }
                th { background-color: #f5f5f5; font-weight: bold; }
                h1 { margin-bottom: 10px; }
                .header { margin-bottom: 20px; }
              </style>
            </head>
            <body>
              <div class="header">
                <h1>Cycle Count Report</h1>
                <p>Date: ${new Date().toLocaleDateString()}</p>
                <p>Time: ${new Date().toLocaleTimeString()}</p>
              </div>
              ${printContent.innerHTML}
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  const getMovementIcon = (type: Movement['type']) => {
    switch (type) {
      case 'entry':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'exit':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      case 'adjustment':
        return <RotateCcw className="h-4 w-4 text-blue-600" />;
    }
  };

  const getMovementBadge = (type: Movement['type'], subtype: Movement['subtype']) => {
    const baseClass = 'text-xs';
    switch (type) {
      case 'entry':
        return (
          <Badge variant="default" className={baseClass}>
            {subtype === 'purchase' ? 'Purchase' : 'Return'}
          </Badge>
        );
      case 'exit':
        return (
          <Badge variant="destructive" className={baseClass}>
            {subtype === 'consumption' ? 'Consumption' : subtype === 'loan' ? 'Loan' : 'Sale'}
          </Badge>
        );
      case 'adjustment':
        return (
          <Badge variant="secondary" className={baseClass}>
            Adjustment
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Inventory Movements</h1>
          <p className="text-muted-foreground">Track all inventory entries, exits, and adjustments</p>
        </div>
      </div>

      <MovementFilters
        filterType={filterType}
        setFilterType={setFilterType}
        filterSubtype={filterSubtype}
        setFilterSubtype={setFilterSubtype}
        filterUser={filterUser}
        setFilterUser={setFilterUser}
        filterProject={filterProject}
        setFilterProject={setFilterProject}
        uniqueUsers={uniqueUsers}
        uniqueProjects={uniqueProjects}
      />

      <MovementTable
        movements={filteredMovements}
        getMovementIcon={getMovementIcon}
        getMovementBadge={getMovementBadge}
      />

      <CycleCountModal
        open={cycleCountOpen}
        onOpenChange={setCycleCountOpen}
        cycleCountItems={cycleCountItems}
        updatePhysicalStock={updatePhysicalStock}
        saveCycleCount={saveCycleCount}
        printCycleCount={printCycleCount}
      />
    </div>
  );
}
