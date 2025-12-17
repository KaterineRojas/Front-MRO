
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../ui/tabs';
import { ScrollArea } from '../../ui/scroll-area';
import { BorrowRequests } from './Borrow/BorrowRequests';
import { PurchaseRequests } from './Purchase/PurchaseRequests';
import { TransferRequests }  from './Transfer/TransferRequests';

const validTabs = ['borrow', 'purchase', 'transfer'] as const;
type TabValue = typeof validTabs[number];

const getTabFromParams = (search: string): TabValue => {
  const params = new URLSearchParams(search);
  const tabParam = params.get('tab');
  return validTabs.includes(tabParam as TabValue) ? (tabParam as TabValue) : 'borrow';
};

export function RequestOrders() {
  const location = useLocation();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<TabValue>(() => getTabFromParams(location.search));

  useEffect(() => {
    const tabParam = getTabFromParams(location.search);
    if (tabParam !== activeTab) {
      setActiveTab(tabParam);
    }
  }, [location.search, activeTab]);

  const handleTabChange = (value: string) => {
    if (!validTabs.includes(value as TabValue)) {
      return;
    }
    const params = new URLSearchParams(location.search);
    params.set('tab', value);
    navigate(`${location.pathname}?${params.toString()}`, { replace: true });
    setActiveTab(value as TabValue);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1>Request Orders</h1>
        <p className="text-muted-foreground">
          Manage your borrow, purchase requests and transfers
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
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