import React from 'react';
import { Card, CardContent } from '../../../ui/card';
import { InventoryMovements } from '../tab/InventoryMovements';

export function TransactionsTab() {
  return (
    <Card>
      <CardContent className="pt-6">
        <InventoryMovements />
      </CardContent>
    </Card>
  );
}
