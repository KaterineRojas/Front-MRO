// src/components/features/inventory/tabs/Items/ItemStockDistribution.tsx
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../../ui/table';
import { Badge } from '../../../../ui/badge';
import { Package } from 'lucide-react';
import type { ItemStockDistributionProps } from './types';

export function ItemStockDistribution({ article }: ItemStockDistributionProps) {
  const getBinStatusBadge = (binPurpose: string) => {
    switch (binPurpose) {
      case 'GoodCondition':
        return <Badge className="bg-green-600">Good Condition</Badge>;
      case 'OnRevision':
        return <Badge className="bg-yellow-600">On Revision</Badge>;
      case 'Scrap':
        return <Badge variant="destructive">Scrap</Badge>;
      default:
        return <Badge variant="outline">{binPurpose}</Badge>;
    }
  };

  return (
    <div className="p-4">
      <h4 className="flex items-center mb-3">
        <Package className="h-4 w-4 mr-2" />
        Stock Distribution for SKU: {article.sku}
      </h4>
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>BIN Code</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Type</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {article.bins.length > 0 ? (
              article.bins.map((bin) => (
                <TableRow key={bin.binId}>
                  <TableCell className="font-mono">{bin.binCode}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span>{bin.quantity} {article.unit}</span>
                      {bin.binPurpose === 'GoodCondition' && (
                        <div className="text-[11px] text-muted-foreground mt-1 space-y-[1px]">
                          <div>Available: {article.quantityAvailable} {article.unit}</div>
                          <div>On Loan: {article.quantityOnLoan} {article.unit}</div>
                          <div>Reserved: {article.quantityReserved} {article.unit}</div>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{getBinStatusBadge(bin.binPurpose)}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground">
                  No bins assigned to this item
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="mt-2 space-y-1 text-sm text-muted-foreground">
        <p>Total stock for this SKU across all bins: {article.totalPhysical} {article.unit}</p>
      </div>
    </div>
  );
}