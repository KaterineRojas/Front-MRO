import { Badge } from '../../ui2/badge';
import { TrendingDown, TrendingUp, RotateCcw, Package } from 'lucide-react';

/**
 * Get stock status badge variant based on current and minimum stock levels
 */
export const getStockStatus = (current: number, min: number) => {
  if (current === 0) return { label: 'Out of Stock', variant: 'destructive' as const };
  if (current <= min) return { label: 'Low Stock', variant: 'outline' as const };
  return { label: 'In Stock', variant: 'default' as const };
};

/**
 * Get status badge for item/kit condition
 */
export const getStatusBadge = (status: string) => {
  switch (status) {
    case 'good-condition':
      return <Badge className="bg-green-600">Good Condition</Badge>;
    case 'on-revision':
      return <Badge className="bg-yellow-600">On Revision</Badge>;
    case 'scrap':
      return <Badge variant="destructive">Scrap</Badge>;
    case 'repaired':
      return <Badge className="bg-blue-600">Repaired</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

/**
 * Get icon for item type
 */
export const getTypeIcon = (type: string) => {
  switch (type) {
    case 'consumable':
      return <TrendingDown className="h-4 w-4 text-red-600" />;
    case 'non-consumable':
      return <RotateCcw className="h-4 w-4 text-blue-600" />;
    case 'pending-purchase':
      return <TrendingUp className="h-4 w-4 text-orange-600" />;
    default:
      return <Package className="h-4 w-4" />;
  }
};
