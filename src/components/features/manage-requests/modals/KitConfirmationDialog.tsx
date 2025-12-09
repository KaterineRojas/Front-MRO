import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../../ui/dialog';
import { Button } from '../../../ui/button';
import { CheckCircle } from 'lucide-react';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pendingKitConfirmation: { option: 'restock' | 'disassemble', selectedCount: number } | null;
  onFinalConfirm: () => void;
}

export const KitConfirmationDialog: React.FC<Props> = ({ open, onOpenChange, pendingKitConfirmation, onFinalConfirm }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2"><CheckCircle className="h-5 w-5 text-[#46B593]" />Kit Return Confirmed</DialogTitle>
        </DialogHeader>
        {pendingKitConfirmation && (
          <div className="py-4">
            <div className="bg-[#46B593]/10 border-2 border-[#46B593] rounded-lg p-4">
              <p className="text-base mb-3">Kit <strong>{pendingKitConfirmation.option === 'restock' ? 'restocked' : 'disassembled'}</strong> successfully!</p>
              <p className="text-sm text-muted-foreground">{pendingKitConfirmation.selectedCount} item(s) were selected. Kit has been removed from the return list.</p>
            </div>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="text-black cursor-pointer">Cancel</Button>
          <Button variant="outline" onClick={onFinalConfirm} className="text-black cursor-pointer"><CheckCircle/>Accept</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default KitConfirmationDialog;
