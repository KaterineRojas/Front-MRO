import React from 'react';
import { TableCell, TableRow } from '../../../../ui/table';
import { Button } from '../../../../ui/button';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../../../ui/tabs';
import { LoanRequest } from '../../types';
import { RegularItemsTabContent } from './ItemTabReturnRow'; 
import { KitsTabContent } from './KitTabReturnRow';

// La interfaz de Props permanece igual ya que el componente aún necesita todas las funciones
interface Props {
  request: LoanRequest;
  expanded: boolean;
  onToggleExpand: (id: number) => void;
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

export const ReturnRequestRow: React.FC<Props> = (props) => {
  const { request } = props;
  
  // Filtramos los items aquí para pasarlos a los componentes hijos
  const regularItems = request.items.filter(i => !i.isKit);
  const kitItems = request.items.filter(i => i.isKit);

  // Usamos el operador spread para pasar todas las props de la interfaz a los hijos
  const sharedProps = { ...props, regularItems, kitItems };

  return (
    <>
      <TableRow className="hover:bg-muted/50 ">
        <TableCell>
          <div>
            <div>{request.requesterName}</div>
            <div className="text-sm text-muted-foreground">{request.requesterEmail}</div>
          </div>
        </TableCell>
        <TableCell>{request.departmentName}</TableCell>
        <TableCell>{request.project}</TableCell>
        <TableCell>{request.loanDate || request.requestedLoanDate}</TableCell>
      </TableRow>

      <TableRow>
        <TableCell colSpan={4} className="bg-muted/30 p-0">
          <div>
            <Tabs defaultValue="items">
              <TabsList>
                <TabsTrigger value="items" className="cursor-pointer">Items</TabsTrigger>
                <TabsTrigger value="kits" className="cursor-pointer">Kits</TabsTrigger>
              </TabsList>

              <TabsContent value="items">
                  <RegularItemsTabContent {...sharedProps} />
              </TabsContent>

              <TabsContent value="kits">
                  <KitsTabContent {...sharedProps} />
              </TabsContent>
            </Tabs>
          </div>
        </TableCell>
      </TableRow>
    </>
  );
};

export default ReturnRequestRow;