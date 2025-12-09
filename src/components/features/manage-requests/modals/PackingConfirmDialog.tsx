import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../../ui/dialog';
import { Button } from '../../../ui/button';
import { Package, CheckCircle } from 'lucide-react';
import { LoanRequest, LoanItem} from '../types';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentPackingRequest: LoanRequest | null;
  onConfirm: () => void;
}

export const PackingConfirmDialog: React.FC<Props> = ({ open, onOpenChange, currentPackingRequest, onConfirm }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2"><Package className="h-5 w-5 text-[#568FCB]" />Confirm Packing</DialogTitle>
          <DialogDescription>
            {currentPackingRequest && (<span className="text-base">Packing confirmed for <strong>{currentPackingRequest.requestNumber}</strong></span>)}
          </DialogDescription>
        </DialogHeader>
        {currentPackingRequest && (
          <div className="py-4 space-y-3">
            <div className="bg-[#568FCB]/10 border-2 border-[#568FCB] rounded-lg p-4">
              <p className="text-sm mb-2"><span className="font-semibold">Borrower:</span> {currentPackingRequest.requesterName}</p>
              <p className="text-sm mb-2"><span className="font-semibold">Project:</span> {currentPackingRequest.projectId}</p>
              <p className="text-sm"><span className="font-semibold">Items:</span> {currentPackingRequest.items.length} item(s)</p>
            </div>
            <p className="text-sm text-muted-foreground">This request will be moved to Returns and marked as ready for delivery.</p>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="text-black cursor-pointer">Cancel</Button>
          <Button variant="outline" onClick={onConfirm} className="text-black cursor-pointer"><CheckCircle className="h-4 w-4 mr-2" />Accept</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PackingConfirmDialog;
