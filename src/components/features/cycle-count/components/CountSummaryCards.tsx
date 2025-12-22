import { Card, CardContent } from '../../../ui/card';
import { Package, AlertTriangle, CheckCircle } from 'lucide-react';

interface CountSummaryCardsProps {
  totalItems: number;
  countedItems: number;
  pendingItems: number;
  discrepanciesCount: number;
}

export function CountSummaryCards({ 
  totalItems, 
  countedItems, 
  pendingItems, 
  discrepanciesCount 
}: CountSummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Items</p>
              <p className="text-2xl">{totalItems}</p>
            </div>
            <Package className="h-8 w-8 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Counted</p>
              <p className="text-2xl text-green-600">{countedItems}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="text-2xl text-orange-600">{pendingItems}</p>
            </div>
            <Package className="h-8 w-8 text-orange-600" />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Discrepancies</p>
              <p className="text-2xl text-red-600">{discrepanciesCount}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
