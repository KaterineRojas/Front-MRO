import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../../ui/dialog';
import { Button } from '../../../ui/button';
import { Input } from '../../../ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../ui/table';
import { Calculator, Printer } from 'lucide-react';
import type { CycleCountModalProps } from './types';

export function CycleCountModal({
  open,
  onOpenChange,
  cycleCountItems,
  updatePhysicalStock,
  saveCycleCount,
  printCycleCount,
}: CycleCountModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[98vw] w-full max-h-[95vh] h-full overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span className="flex items-center space-x-2">
              <Calculator className="h-5 w-5" />
              <span>Cycle Count</span>
            </span>
            <Button variant="outline" size="sm" onClick={printCycleCount}>
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
          </DialogTitle>
          <DialogDescription>Review and adjust inventory quantities</DialogDescription>
        </DialogHeader>

        <div className="overflow-auto flex-1">
          <div id="cycle-count-table">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>System Stock</TableHead>
                  <TableHead>Physical Count</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Unit Cost</TableHead>
                  <TableHead>Total Value</TableHead>
                  <TableHead>Variance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cycleCountItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-mono">{item.code}</TableCell>
                    <TableCell>{item.description}</TableCell>
                    <TableCell>{item.systemStock}</TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={item.physicalStock}
                        onChange={(e) => updatePhysicalStock(item.id, parseInt(e.target.value) || 0)}
                        className="w-20"
                      />
                    </TableCell>
                    <TableCell>{item.unit}</TableCell>
                    <TableCell>${item.unitCost.toFixed(2)}</TableCell>
                    <TableCell>${item.totalValue.toFixed(2)}</TableCell>
                    <TableCell>
                      <span
                        className={`${
                          item.variance > 0 ? 'text-green-600' : item.variance < 0 ? 'text-red-600' : 'text-gray-600'
                        }`}
                      >
                        {item.variance > 0 ? '+' : ''}
                        {item.variance}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={saveCycleCount}>Save Adjustments</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
