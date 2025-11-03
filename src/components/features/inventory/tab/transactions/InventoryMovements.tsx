import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/features/ui/card';
import { ArrowLeftRight } from 'lucide-react';
import { TransactionsTable } from './TransactionsTable';
import type { Transaction } from './transactionTypes';
import { getAllTransactions } from '@/services/transactionService';

export function InventoryMovements() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const data = await getAllTransactions();
      setTransactions(data);
    } catch (error) {
      console.error('Error loading transactions:', error);
      // Optionally set an error state here
    } finally {
      setLoading(false);
    }
  };

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
    <Card>
      <CardHeader>
        <div>
          <CardTitle className="flex items-center text-2xl font-bold">
            <ArrowLeftRight className="h-6 w-6 mr-2" />
            Transactions
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Complete record of all inventory movements and changes
          </p>
        </div>
      </CardHeader>
      <CardContent>
        <TransactionsTable
          transactions={transactions}
          loading={loading}
          title="All Transactions"
          showItemColumn={true}
          onItemClick={handleItemClick}
          onBinClick={handleBinClick}
        />
      </CardContent>
    </Card>
  );
}
