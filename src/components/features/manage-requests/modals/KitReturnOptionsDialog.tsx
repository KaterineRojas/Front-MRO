import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../../ui/dialog';
import { Button } from '../../../ui/button';
import { RadioGroup, RadioGroupItem } from '../../../ui/radio-group';
import { Package, CheckCircle } from 'lucide-react';
import { LoanRequest } from '../types';
import { Box } from "lucide-react";
import { PackageMinus } from "lucide-react"
interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pendingKitReturn: { requestId: number, itemId: number } | null;
  filteredReturns: LoanRequest[];
  kitReturnOption: 'restock' | 'disassemble' | '';
  setKitReturnOption: (v: 'restock' | 'disassemble' | '') => void;
  missingKitItems: Array<{id: number, name: string, category: string, missingQuantity: number, totalQuantity: number}>;
  handlePrintMissingItems: () => void;
  handleConfirmKitReturn: () => void;
}

export const KitReturnOptionsDialog: React.FC<Props> = ({ open, onOpenChange, pendingKitReturn, filteredReturns, kitReturnOption, setKitReturnOption, missingKitItems, handlePrintMissingItems, handleConfirmKitReturn }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center">Kit Return Options</DialogTitle>
          <DialogDescription>
            {pendingKitReturn && (() => {
              const request = filteredReturns.find(r => r.id === pendingKitReturn.requestId);
              const kitItem = request?.items.find(i => i.id === pendingKitReturn.itemId);
              return kitItem ? (<span><strong>{kitItem.name}</strong> ({kitItem.sku}) - Choose how you want to handle the returned kit.</span>) : 'Choose how you want to handle the returned kit.';
            })()}
          </DialogDescription>
        </DialogHeader>
        <div className="py-2">
          <RadioGroup value={kitReturnOption} onValueChange={setKitReturnOption}>
            <div className="space-y-3">
              <div onClick={() => setKitReturnOption('restock')} className={`border-2 rounded-lg p-4 cursor-pointer transition-all
                 ${ kitReturnOption === 'restock' ? 'border-[#568FCB] bg-[#568FCB]/10' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600' }`}>
                <div className="flex items-center space-x-3 border px-2 py-3 rounded cursor-pointer">
                  <RadioGroupItem value="restock" id="restock" />
                  <div>
                    <label htmlFor="restock" className="flex items-center cursor-pointer hover:border-blue-500">
                      <Box className="h-4 w-4 mr-1 cursor-pointer" /> {/* icono de caja */}
                      Restock Kit
                    </label>
                  </div>
                </div>
              </div>
              <div onClick={() => setKitReturnOption('disassemble')} className={`p-4 cursor-pointer transition-all
                ${ kitReturnOption === 'disassemble' ? 'border-[#568FCB] bg-[#568FCB]/10' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600' }`}>
                <div className="flex items-center space-x-3 border px-3 py-3 rounded cursor-pointer">
                  <RadioGroupItem value="disassemble" id="disassemble" />
                  <div>
                    <label htmlFor="disassemble" className="flex items-center hover:border-red-500 cursor-pointer">
                    <PackageMinus className="h-4 w-4 mr-1 text-red-600 cursor-pointer" /> {/* ícono de desarmar */}
                    Disassemble Kit
                  </label>
                  </div>
                </div>
              </div>
            </div>
          </RadioGroup>

          {kitReturnOption === 'restock' && missingKitItems.length > 0 && (
            <div className="mt-6 border-2 border-[#568FCB] rounded-lg p-4 bg-[#568FCB]/5">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-base flex items-center">
                  <Package className="h-4 w-4 mr-2 text-[#568FCB]" />Items to Restock ({missingKitItems.length})</h4>
                <Button onClick={handlePrintMissingItems} variant="outline" size="sm" className="cursor-pointer">🖨️ Print List</Button>
              </div>
              <div className="rounded-md border dark:border-gray-700 bg-white dark:bg-gray-900 p-4">
                <table className="w-full">
                  <thead>
                    <tr className="text-center"><th>Item</th><th>Category</th><th className="text-right">Missing Qty</th><th className="text-right">Total Required</th></tr>
                  </thead>
                  <tbody>
                    {missingKitItems.map(item => (<tr key={item.id}><td className="text-center">{item.name}</td><td className="text-center"><span >{item.category}</span></td><td className="text-center font-semibold text-orange-600">{item.missingQuantity}</td><td className="text-center">{item.totalQuantity}</td></tr>))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {kitReturnOption === 'restock' && missingKitItems.length === 0 && (
            <div className="mt-6 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 p-4 rounded text-green-700 dark:text-green-300">All kit items have been returned. No items need to be restocked.</div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="cursor-pointer text-black">Cancel</Button>
          <Button variant="outline" onClick={handleConfirmKitReturn} className="cursor-pointer text-black" disabled={!kitReturnOption}><CheckCircle/>Confirm</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default KitReturnOptionsDialog;
