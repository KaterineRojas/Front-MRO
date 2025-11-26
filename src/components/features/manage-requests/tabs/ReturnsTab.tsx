import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../ui/select';
import { Input } from '../../../ui/input';
import { Label } from '../../../ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../ui/table';
import { Package } from 'lucide-react';
import ReturnRequestRow from '../components/request-rows/ReturnRequestRow';
import { LoanRequest } from '../types';

interface Props {
  filteredReturns: LoanRequest[];
  selectedReturnBorrower: string;
  handleBorrowerSelect: (value: string) => void;
  borrowerSelectSearchTerm: string;
  setBorrowerSelectSearchTerm: (v: string) => void;
  filteredBorrowersForSelect: string[];
  expandedReturns: Set<number>;
  onToggleExpandReturns: (id: number) => void;
  expandedKitItems: Set<string>;
  onToggleExpandKitItem: (requestId: number, itemId: number) => void;
  selectedReturnItems: Set<string>;
  selectedKitItems: Set<string>;
  getReturnQuantity: (requestId: number, itemId: number) => number;
  handleSelectReturnItem: (requestId: number, itemId: number) => void;
  handleReturnQuantityChange: (requestId: number, itemId: number, quantity: number) => void;
  getItemCondition: (requestId: number, itemId: number) => string;
  handleOpenConditionDialog: (requestId: number, itemId: number, isKit: boolean, kitItemId?: number) => void;
  areAllRegularItemsSelected: (requestId: number, items: any[]) => boolean;
  handleSelectAllRegularItems: (request: LoanRequest, checked: boolean) => void;
  hasSelectedKitItems: (requestId: number, itemId: number) => boolean;
  handleTakePhotoItems: (request: LoanRequest) => void;
  handleConfirmReturnItems: (request: LoanRequest) => void;
  handleTakeKitPhoto: (requestId: number, itemId: number) => void;
  handleSaveKitChecklist: (requestId: number, itemId: number) => void;
  getKitItemQuantity: (requestId: number, itemId: number, kitItemId: number) => number;
  handleKitItemQuantityChange: (requestId: number, itemId: number, kitItemId: number, quantity: number) => void;
  handleSelectKitItem: (requestId: number, itemId: number, kitItemId: number) => void;
  getKitItemCondition: (requestId: number, itemId: number, kitItemId: number) => string;
  formatConditionText: (condition: string) => string;
  kitPhotos: Record<string, string>;
  capturedPhoto?: string | null;
}

export const ReturnsTab: React.FC<Props> = (props) => {
  const {
    filteredReturns,
    selectedReturnBorrower,
    handleBorrowerSelect,
    borrowerSelectSearchTerm,
    setBorrowerSelectSearchTerm,
    filteredBorrowersForSelect,
    expandedReturns,
    onToggleExpandReturns
  } = props;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center"><Package className="h-5 w-5 mr-2" /> <span className="font-bold text-2xl">Returns ({filteredReturns.length})</span></CardTitle>
        </div>

        <div className="mt-4 flex gap-4">
          <div className="flex-1 max-w-xs">
            <Label htmlFor="return-borrower-select" className="text-sm mb-2 block">Select Borrower</Label>
            <Select  onValueChange={handleBorrowerSelect}>
              <SelectTrigger id="return-borrower-select"><SelectValue placeholder="Select a borrower" className="cursor-pointer"/></SelectTrigger>
              <SelectContent className="cursor-pointer">
                <div className="p-2 sticky top-0 bg-background z-10">
                  <Input placeholder="Search borrower..." 
                  value={borrowerSelectSearchTerm} 
                  onChange={(e) => setBorrowerSelectSearchTerm(e.target.value)} 
                  onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()} 
                  className="mb-2" />
                </div>
                <div className="max-h-[300px]">
                  {filteredBorrowersForSelect.length > 0 ? (
                    filteredBorrowersForSelect.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)
                  ) : (
                    <div className="p-2 text-sm text-muted-foreground text-center">No borrowers found</div>
                  )}
                </div>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {!selectedReturnBorrower ? (
          <div className="text-center py-8 text-muted-foreground"><Package className="h-12 w-12 mx-auto mb-4 opacity-50" /><p>Please select a borrower to view their return items</p></div>
        ) : filteredReturns.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground"><Package className="h-12 w-12 mx-auto mb-4 opacity-50" /><p>No return items found for this borrower</p></div>
        ) : (
          <div className="rounded-md border">
            <Table className="border-collapse">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12 align-middle text-left"></TableHead>
                  <TableHead >Borrower</TableHead>
                  <TableHead >Department</TableHead>
                  <TableHead >Project</TableHead>
                  <TableHead >Loan Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="text-left">
                {filteredReturns.map(request => (
                  <ReturnRequestRow
                    key={request.id}
                    request={request}
                    expanded={expandedReturns.has(request.id)}
                    onToggleExpand={onToggleExpandReturns}
                    expandedKitItems={props.expandedKitItems}
                    onToggleExpandKitItem={props.onToggleExpandKitItem}
                    selectedReturnItems={props.selectedReturnItems}
                    selectedKitItems={props.selectedKitItems}
                    getReturnQuantity={props.getReturnQuantity}
                    handleSelectReturnItem={props.handleSelectReturnItem}
                    handleReturnQuantityChange={props.handleReturnQuantityChange}
                    getItemCondition={props.getItemCondition}
                    handleOpenConditionDialog={props.handleOpenConditionDialog}
                    areAllRegularItemsSelected={props.areAllRegularItemsSelected}
                    handleSelectAllRegularItems={props.handleSelectAllRegularItems}
                    hasSelectedKitItems={props.hasSelectedKitItems}
                    handleTakePhotoItems={props.handleTakePhotoItems}
                    handleConfirmReturnItems={props.handleConfirmReturnItems}
                    handleTakeKitPhoto={props.handleTakeKitPhoto}
                    handleSaveKitChecklist={props.handleSaveKitChecklist}
                    getKitItemQuantity={props.getKitItemQuantity}
                    handleKitItemQuantityChange={props.handleKitItemQuantityChange}
                    handleSelectKitItem={props.handleSelectKitItem}
                    getKitItemCondition={props.getKitItemCondition}
                    formatConditionText={props.formatConditionText}
                    kitPhotos={props.kitPhotos}
                    capturedPhoto={props.capturedPhoto}
                  />
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ReturnsTab;
