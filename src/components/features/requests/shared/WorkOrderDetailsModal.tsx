import { Badge } from '../../../ui/badge';
import { Button } from '../../../ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../../../ui/dialog';
import type { WorkOrder } from '../services/sharedServices';

function formatWorkOrderDate(date: string | undefined): string {
  if (!date) return 'N/A';
  try {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return date;
  }
}

interface WorkOrderDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workOrder: WorkOrder | null | undefined;
}

export function WorkOrderDetailsModal({
  open,
  onOpenChange,
  workOrder,
}: WorkOrderDetailsModalProps) {
  return (
    <Dialog open={open && !!workOrder} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Work Order Details</DialogTitle>
          <DialogDescription>
            Review the information for the selected work order.
          </DialogDescription>
        </DialogHeader>
        {workOrder && (
          <div className="space-y-3 text-sm">
            <div>
              <p className="text-muted-foreground text-xs">Work Order</p>
              <p className="font-semibold">{workOrder.wo}</p>
            </div>
            {workOrder.serviceDesc && (
              <div>
                <p className="text-muted-foreground text-xs">Description</p>
                <p>{workOrder.serviceDesc}</p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-muted-foreground text-xs">Start Date</p>
                <p>{formatWorkOrderDate(workOrder.startDate)}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">End Date</p>
                <p>{formatWorkOrderDate(workOrder.endDate)}</p>
              </div>
            </div>
            {workOrder.status && (
              <div>
                <p className="text-muted-foreground text-xs">Status</p>
                <Badge variant="secondary" className="uppercase">
                  {workOrder.status}
                </Badge>
              </div>
            )}
          </div>
        )}
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
