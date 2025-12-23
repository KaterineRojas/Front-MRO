import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../../ui/table';
import { Badge } from '../../../../ui/badge';
import { Package } from 'lucide-react';
import type { ItemStockDistributionProps } from './types';

export function ItemStockDistribution({ article }: ItemStockDistributionProps) {
  const displayUnit = article.unit || 'pieces';
  const totalInventoryIncludingLoans = (article.totalPhysical ?? 0) + (article.quantityOnLoan ?? 0);

  const normalizePurpose = (purpose?: string | null, isDefault?: boolean) => {
    if (purpose && purpose.trim().length > 0) {
      return purpose;
    }
    return isDefault ? 'GoodCondition' : 'Unknown';
  };

  const getBinStatusBadge = (binPurpose?: string | null, isDefault?: boolean) => {
    const resolvedPurpose = normalizePurpose(binPurpose, isDefault);

    switch (resolvedPurpose) {
      case 'GoodCondition':
        return <Badge className="bg-green-600">Good Condition</Badge>;
      case 'OnRevision':
        return <Badge className="bg-yellow-600">On Revision</Badge>;
      case 'Scrap':
        return <Badge variant="destructive">Scrap</Badge>;
      case 'Unknown':
        return <Badge variant="secondary">Unknown</Badge>;
      default:
        return <Badge variant="outline">{resolvedPurpose}</Badge>;
    }
  };

  return (
    <div className="p-4">
      <h4 className="flex items-center mb-3">
        <Package className="h-4 w-4 mr-2" />
        Stock Distribution for SKU: {article.sku}
      </h4>
      <div className="rounded-md border dark:border-border bg-card">
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
              article.bins.map((bin) => {
                const purpose = normalizePurpose(bin.binPurpose ?? bin.binPurposeDisplay, bin.isDefault);
                const showAvailabilityBreakdown = purpose === 'GoodCondition';

                return (
                  <TableRow key={bin.inventoryId ?? `${bin.binId}-${bin.binCode}`}>
                    <TableCell className="font-mono">{bin.binCode}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span>{bin.quantity} {displayUnit}</span>
                        {showAvailabilityBreakdown && (
                          <div className="text-[11px] text-muted-foreground mt-1 space-y-[1px]">
                            <div>Available: {article.quantityAvailable} {displayUnit}</div>
                            <div>Reserved: {article.quantityReserved} {displayUnit}</div>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{getBinStatusBadge(purpose, bin.isDefault)}</TableCell>
                  </TableRow>
                );
              })
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
        <p>Total inventory of this SKU in all containers and loans: {totalInventoryIncludingLoans} {displayUnit}</p>
        <p>On loan: {article.quantityOnLoan} {displayUnit}</p>
        <p>Stock: {article.totalPhysical} {displayUnit}</p>
      </div>
    </div>
  );
}