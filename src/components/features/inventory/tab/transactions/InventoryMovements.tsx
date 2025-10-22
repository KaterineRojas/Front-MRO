import React, { useState, useEffect } from 'react';
import { ArrowLeftRight } from 'lucide-react';
import { TransactionsTable } from './TransactionsTable';
import type { Transaction } from './transactionTypes';

// Mock data matching .NET 8 API format
const mockTransactions: Transaction[] = [
  {
    id: 1,
    transactionType: 'Entry',
    quantityChange: 5432,
    itemName: 'Screwdriver Set Phillips',
    itemSku: 'HT-NC-002',
    fromBin: null,
    toBin: 'BIN-A-01',
    notes: 'Initial stock purchase',
    createdAt: '2025-10-22T11:44:55.207656',
  },
  {
    id: 2,
    transactionType: 'Exit',
    quantityChange: -25,
    itemName: 'Laptop Dell Latitude 5520',
    itemSku: 'TECH-002',
    fromBin: 'BIN-B-03',
    toBin: null,
    notes: 'Sold to customer ABC Corp',
    createdAt: '2025-10-21T14:30:12.123456',
  },
  {
    id: 3,
    transactionType: 'Loan',
    quantityChange: -10,
    itemName: 'Office Paper A4 - 80gsm',
    itemSku: 'OFF-001',
    fromBin: 'BIN-C-01',
    toBin: null,
    notes: 'Loaned to Marketing Department',
    createdAt: '2025-10-21T09:15:30.654321',
  },
  {
    id: 4,
    transactionType: 'Return',
    quantityChange: 10,
    itemName: 'Office Paper A4 - 80gsm',
    itemSku: 'OFF-001',
    fromBin: null,
    toBin: 'BIN-C-01',
    notes: 'Returned from Marketing Department',
    createdAt: '2025-10-20T16:45:00.111222',
  },
  {
    id: 5,
    transactionType: 'Relocation',
    quantityChange: 0,
    itemName: 'USB Cable Type-C 2m',
    itemSku: 'USB-003',
    fromBin: 'BIN-A-02',
    toBin: 'BIN-D-05',
    notes: 'Reorganizing warehouse layout',
    createdAt: '2025-10-20T10:20:45.333444',
  },
  {
    id: 6,
    transactionType: 'Adjustment',
    quantityChange: -50,
    itemName: 'Office Paper A4 - 80gsm',
    itemSku: 'OFF-001',
    fromBin: 'BIN-C-01',
    toBin: 'BIN-C-01',
    notes: 'Physical count adjustment - damaged paper found during audit',
    createdAt: '2025-10-19T13:10:25.555666',
  },
  {
    id: 7,
    transactionType: 'KitCreated',
    quantityChange: -15,
    itemName: 'Standard Office Kit',
    itemSku: 'KIT-001',
    fromBin: 'BIN-A-01',
    toBin: null,
    notes: 'Created 5 office kits, consuming various items',
    createdAt: '2025-10-19T08:30:00.777888',
  },
  {
    id: 8,
    transactionType: 'Entry',
    quantityChange: 250,
    itemName: 'Wireless Mouse Logitech',
    itemSku: 'TECH-015',
    fromBin: null,
    toBin: 'BIN-B-02',
    notes: 'Bulk purchase from supplier XYZ',
    createdAt: '2025-10-18T15:20:35.999000',
  },
  {
    id: 9,
    transactionType: 'Exit',
    quantityChange: -5,
    itemName: 'Safety Helmet',
    itemSku: 'SAFE-008',
    fromBin: 'BIN-E-01',
    toBin: null,
    notes: 'Issued to construction team',
    createdAt: '2025-10-18T11:05:15.222333',
  },
  {
    id: 10,
    transactionType: 'Adjustment',
    quantityChange: 3,
    itemName: 'Wireless Mouse Logitech',
    itemSku: 'TECH-015',
    fromBin: 'BIN-B-02',
    toBin: 'BIN-B-02',
    notes: 'Found additional units during inventory check',
    createdAt: '2025-10-17T09:45:50.444555',
  },
];

export function InventoryMovements() {
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const [loading, setLoading] = useState(false);

  // TODO: Uncomment when backend API is ready
  // useEffect(() => {
  //   loadTransactions();
  // }, []);

  // const loadTransactions = async () => {
  //   try {
  //     setLoading(true);
  //     const response = await fetch('/api/Transactions');
  //     if (!response.ok) {
  //       throw new Error('Failed to fetch transactions');
  //     }
  //     const data = await response.json();
  //     setTransactions(data);
  //   } catch (error) {
  //     console.error('Error loading transactions:', error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleItemClick = (itemSku: string) => {
    // Navigate to item detail page (adjust route as needed)
    console.log('Navigate to item:', itemSku);
    // navigate(`/inventory/items/${itemSku}`);
  };

  const handleBinClick = (binCode: string) => {
    // Navigate to bin detail page (adjust route as needed)
    console.log('Navigate to bin:', binCode);
    // navigate(`/inventory/bins/${binCode}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center">
            <ArrowLeftRight className="h-6 w-6 mr-2" />
            Transactions
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Complete record of all inventory movements and changes
          </p>
        </div>
      </div>

      <TransactionsTable
        transactions={transactions}
        loading={loading}
        title="All Transactions"
        showItemColumn={true}
        onItemClick={handleItemClick}
        onBinClick={handleBinClick}
      />
    </div>
  );
}
