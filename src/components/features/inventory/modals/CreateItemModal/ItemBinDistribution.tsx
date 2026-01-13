import  { useState } from 'react';
import { Button } from '../../../../ui/button';
import { Badge } from '../../../../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../../ui/table';
import { Package, ChevronDown, ChevronRight } from 'lucide-react';
import { calculateTotalStock } from './itemModalHelpers';
import type { ItemBinDistributionProps } from './types';

export function ItemBinDistribution({ article, bins }: ItemBinDistributionProps) {
  const [showBinStock, setShowBinStock] = useState(false);
  const totalStock = calculateTotalStock(bins, article.quantityAvailable || 0);

  return (
    <div className="space-y-4">
      <div className="border dark:border-border rounded-lg overflow-hidden bg-muted/30">
        <Button
          type="button"
          variant="ghost"
          className="w-full flex items-center justify-between p-4 hover:bg-muted/50"
          onClick={() => setShowBinStock(!showBinStock)}
        >
          <span className="flex items-center gap-2 font-semibold">
            <Package className="h-4 w-4" />
            Stock Distribution Across Bins
            <Badge variant="secondary">{bins.length} Bins</Badge>
          </span>
          {showBinStock ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </Button>
        {showBinStock && (
          <div className="p-4 border-t dark:border-border">
            <div className="rounded-md border dark:border-border bg-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>BIN Code</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bins.length > 0 ? (
                    bins.map((bin, index) => (
                      <TableRow key={bin.binCode || index}>
                        <TableCell className="font-mono">{bin.binCode || 'N/A'}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell className="text-center text-muted-foreground py-4">
                        No bins assigned yet
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            <div className="mt-3 p-3 bg-primary/5 rounded-md border dark:border-border border-primary/10">
              <p className="text-sm font-medium">
                Total Physical Stock: <span className="text-primary">{totalStock} {article.unit}</span>
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                SKU: {article.sku}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}