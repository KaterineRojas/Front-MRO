import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../ui/card';
import { Button } from '../../../ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../ui/table';
import { Package, Plus } from 'lucide-react';
import PackingRequestRow from '../components/request-rows/PackingRequestRow';
import { LoanRequest } from '../types';

interface Props {
  packingRequests: LoanRequest[];
  expandedPackingRequests: Set<string>;
  onToggleExpandPacking: (requestNumber: string) => void;
  isKitOrder: (r: LoanRequest) => boolean;
  getPriorityBadge: (p: string) => React.ReactNode;
  selectedPackingItems: Set<string>;
  packingItemQuantities: Record<string, number>;
  handleSelectPackingItem: (requestId: number, itemId: number) => void;
  handlePackingQuantityChange: (requestId: number, itemId: number, quantity: number) => void;
  getPackingItemQuantity: (requestId: number, itemId: number) => number;
  areAllItemsSelected: (requestId: number, items: any[]) => boolean;
  handleSelectAllPackingItems: (request: LoanRequest, checked: boolean) => void;
  printedRequests: Set<string>;
  handlePrintAllPacking: () => void;
  handlePrintSinglePacking: (request: LoanRequest) => void;
  handleConfirmPacking: (request: LoanRequest) => void;
}

export const PackingRequestsTab: React.FC<Props> = (props) => {
  const { packingRequests, expandedPackingRequests, onToggleExpandPacking } = props;
  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button className="bg-white hover:bg-white">
          <Plus className="h-4 w-4 mr-2" /> Create New Request Order
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center"><Package className="h-5 w-5 mr-2" />Packing Requests ({packingRequests.length})</CardTitle>
            <div className="flex space-x-2 ">
              <Button variant="outline" 
              onClick={props.handlePrintAllPacking} 
              disabled={packingRequests.length === 0} 
              className="cursor-pointer">
                <span>Print All</span></Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {packingRequests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Package className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Packing Requests</h3>

            </div>
          ) : (
            <div className="rounded-md">
              <Table className="border-collapse min-w-max">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12 align-middle text-left"></TableHead>
                    <TableHead >Request #</TableHead>
                    <TableHead >Borrower</TableHead>
                    <TableHead >Department</TableHead>
                    <TableHead >Project</TableHead>
                    <TableHead >Loan Date</TableHead>
                    <TableHead >Kit</TableHead>
                    <TableHead >Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="text-left">
                  {packingRequests.map((request) => (
                    <PackingRequestRow
                      key={request.requestNumber}
                      request={request}
                      expanded={expandedPackingRequests.has(request.requestNumber)}
                      onToggleExpand={onToggleExpandPacking}
                      isKitOrder={props.isKitOrder}
                      getPriorityBadge={props.getPriorityBadge}
                      selectedPackingItems={props.selectedPackingItems}
                      packingItemQuantities={props.packingItemQuantities}
                      handleSelectPackingItem={props.handleSelectPackingItem}
                      handlePackingQuantityChange={props.handlePackingQuantityChange}
                      getPackingItemQuantity={props.getPackingItemQuantity}
                      areAllItemsSelected={props.areAllItemsSelected}
                      handleSelectAllPackingItems={props.handleSelectAllPackingItems}
                      printedRequests={props.printedRequests}
                      handlePrintSinglePacking={props.handlePrintSinglePacking}
                      handleConfirmPacking={props.handleConfirmPacking}
                    />
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PackingRequestsTab;
