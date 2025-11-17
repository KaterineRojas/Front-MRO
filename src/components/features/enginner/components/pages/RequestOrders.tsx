
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../ui/tabs';
import { ScrollArea } from '../../ui/scroll-area';
import { BorrowRequests } from './BorrowRequests';
import { PurchaseRequests } from './PurchaseRequests';
import { TransferRequests } from './TransferRequests';

export function RequestOrders() {
  return (
    <div className="space-y-6">
      <div>
        <h1>Request Orders</h1>
        <p className="text-muted-foreground">
          Manage your borrow, purchase requests and transfers
        </p>
      </div>

      <Tabs defaultValue="borrow" className="space-y-4">
        <ScrollArea className="w-full">
          <TabsList className="w-full inline-flex md:grid md:grid-cols-3 min-w-max md:min-w-0">
            <TabsTrigger value="borrow" className="flex-1 md:flex-auto">Borrow</TabsTrigger>
            <TabsTrigger value="purchase" className="flex-1 md:flex-auto">Purchase</TabsTrigger>
            <TabsTrigger value="transfer" className="flex-1 md:flex-auto">Transfer</TabsTrigger>
          </TabsList>
        </ScrollArea>

        <TabsContent value="borrow" className="mt-4">
          <BorrowRequests />
        </TabsContent>
        
        <TabsContent value="purchase" className="mt-4">
          <PurchaseRequests />
        </TabsContent>
        
        <TabsContent value="transfer" className="mt-4">
          <TransferRequests />
        </TabsContent>
      </Tabs>
    </div>
  );
}