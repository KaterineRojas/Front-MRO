// pages/ManageRequestsPage.tsx

import React, { useState, useCallback } from 'react';
import { Badge } from '../../../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../ui/tabs';
import { useAppSelector } from '../../../../store/hooks';

// Importar los Custom Hooks
import { usePackingRequestsLogic } from '../hooks/usePackingRequestsLogic'; 
import { useReturnsLogic } from '../hooks/useReturnsLogic'; 

// Importaciones de componentes hijos
import PhotoDialog from '../modals/PhotoDialog';
import PackingConfirmDialog from '../modals/PackingConfirmDialog';
import KitConfirmationDialog from '../modals/KitConfirmationDialog';
import KitReturnOptionsDialog from '../modals/KitReturnOptionsDialog';
import ConditionDialog from '../modals/ConditionDialog';
import PackingRequestsTab from '../tabs/PackingRequestsTab';
import ReturnsTab from '../tabs/ReturnsTab';
// types imported where needed in child components

// Helper de UI
const getPriorityBadge = (priority: string) => {
  const badges: Record<string, React.ReactNode> = {
    low: <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">Low</Badge>,
    medium: <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">Medium</Badge>,
    high: <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-300">High</Badge>,
    urgent: <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300">Urgent</Badge>
  };
  return badges[priority] || null;
};

export function ManageRequestsPage() {
  const [activeTab, setActiveTab] = useState<string>('packing-requests');
  
  // Obtener el usuario autenticado
  const user = useAppSelector(state => state.auth.user);
  const engineerId = user?.employeeId || 'amx0142'; // Fallback al ID por defecto
  
  // Llamar a los Custom Hooks
  const returnsLogic = useReturnsLogic({ engineerId });
  const packingLogic = usePackingRequestsLogic();
  
  // Manejar la dependencia cruzada
  const handleConfirmPackingDialog = useCallback(() => {
    // Pasa el setter de returnsLogic a la función de packingLogic
    packingLogic.handleConfirmPackingDialog(returnsLogic.setAllReturns);
  }, [packingLogic, returnsLogic.setAllReturns]);
  
  return (
    <div className="space-y-6">
      <div><h1 className="mb-2" style={{ fontWeight: 700, fontSize: '2rem' }}>Manage Requests</h1></div>

      <Tabs value={activeTab} onValueChange={(v: string) => setActiveTab(v)} className="w-full">
        <TabsList>
          <TabsTrigger value="packing-requests" className="cursor-pointer">Packing Requests</TabsTrigger>
          <TabsTrigger value="returns" className="cursor-pointer">Returns</TabsTrigger>
        </TabsList>

        <TabsContent value="packing-requests">
          <div className="space-y-4">
            <PackingRequestsTab
              packingRequests={packingLogic.packingRequests}
              expandedPackingRequests={packingLogic.expandedPackingRequests}
              onToggleExpandPacking={packingLogic.handleToggleExpandPacking}
              isKitOrder={packingLogic.isKitOrder}
              getPriorityBadge={getPriorityBadge}
              selectedPackingItems={packingLogic.selectedPackingItems}
              packingItemQuantities={packingLogic.packingItemQuantities}
              handleSelectPackingItem={packingLogic.handleSelectPackingItem}
              handlePackingQuantityChange={packingLogic.handlePackingQuantityChange}
              getPackingItemQuantity={packingLogic.getPackingItemQuantity}
              areAllItemsSelected={packingLogic.areAllItemsSelected}
              handleSelectAllPackingItems={packingLogic.handleSelectAllPackingItems}
              printedRequests={packingLogic.printedRequests}
              handlePrintAllPacking={packingLogic.handlePrintAllPacking}
              handlePrintSinglePacking={packingLogic.handlePrintSinglePacking}
              handleConfirmPacking={packingLogic.handleConfirmPacking}
            />
          </div>
        </TabsContent>

        <TabsContent value="returns">
          <div className="space-y-4">
            <ReturnsTab
              filteredReturns={returnsLogic.filteredReturns}
              selectedReturnBorrower={returnsLogic.selectedReturnBorrower}
              handleBorrowerSelect={returnsLogic.handleBorrowerSelect}
              borrowerSelectSearchTerm={returnsLogic.borrowerSelectSearchTerm}
              setBorrowerSelectSearchTerm={returnsLogic.setBorrowerSelectSearchTerm}
              filteredBorrowersForSelect={returnsLogic.filteredBorrowersForSelect}
              expandedReturns={returnsLogic.expandedReturns}
              onToggleExpandReturns={returnsLogic.onToggleExpandReturns}
              expandedKitItems={returnsLogic.expandedKitItems}
              onToggleExpandKitItem={returnsLogic.onToggleExpandKitItem}
              selectedReturnItems={returnsLogic.selectedReturnItems}
              selectedKitItems={returnsLogic.selectedKitItems}
              getReturnQuantity={returnsLogic.getReturnQuantity}
              handleSelectReturnItem={returnsLogic.handleSelectReturnItem}
              handleReturnQuantityChange={returnsLogic.handleReturnQuantityChange}
              getItemCondition={returnsLogic.getItemCondition}
              handleOpenConditionDialog={returnsLogic.handleOpenConditionDialog}
              areAllRegularItemsSelected={returnsLogic.areAllRegularItemsSelected}
              handleSelectAllRegularItems={returnsLogic.handleSelectAllRegularItems}
              hasSelectedKitItems={returnsLogic.hasSelectedKitItems}
              handleTakePhotoItems={returnsLogic.handleTakePhotoItems}
              handleConfirmReturnItems={returnsLogic.handleConfirmReturnItems}
              handleTakeKitPhoto={returnsLogic.handleTakeKitPhoto}
              handleSaveKitChecklist={returnsLogic.handleSaveKitChecklist}
              getKitItemQuantity={returnsLogic.getKitItemQuantity}
              handleKitItemQuantityChange={returnsLogic.handleKitItemQuantityChange}
              handleSelectKitItem={returnsLogic.handleSelectKitItem}
              getKitItemCondition={returnsLogic.getKitItemCondition}
              formatConditionText={returnsLogic.formatConditionText}
              kitPhotos={returnsLogic.kitPhotos}
              capturedPhoto={returnsLogic.capturedPhoto}
            />
          </div>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <PhotoDialog
        open={returnsLogic.itemsPhotoDialogOpen}
        onOpenChange={returnsLogic.setItemsPhotoDialogOpen}
        onCapture={returnsLogic.handleCapturePhotoItems}
        title="Take Photo of Return Items"
        description="Capture a photo of the items being returned for documentation purposes."
      />
      <PhotoDialog
        open={returnsLogic.kitPhotoDialogOpen}
        onOpenChange={returnsLogic.setKitPhotoDialogOpen}
        onCapture={returnsLogic.handleCaptureKitPhoto}
        title="Take Photo of Kit Items"
        description="Capture a photo of the kit items being returned for documentation purposes."
      />
      <PackingConfirmDialog 
        open={packingLogic.packingConfirmDialogOpen} 
        onOpenChange={packingLogic.setPackingConfirmDialogOpen} 
        currentPackingRequest={packingLogic.currentPackingRequest} 
        onConfirm={handleConfirmPackingDialog} 
      />
      <KitConfirmationDialog 
        open={returnsLogic.kitConfirmationDialogOpen} 
        onOpenChange={returnsLogic.setKitConfirmationDialogOpen} 
        pendingKitConfirmation={returnsLogic.pendingKitConfirmation} 
        onFinalConfirm={returnsLogic.handleFinalConfirmKitReturn} 
      />
      <KitReturnOptionsDialog 
        open={returnsLogic.kitReturnDialogOpen} 
        onOpenChange={returnsLogic.setKitReturnDialogOpen} 
        pendingKitReturn={returnsLogic.pendingKitReturn}
        filteredReturns={returnsLogic.filteredReturns}
        kitReturnOption={returnsLogic.kitReturnOption}
        setKitReturnOption={returnsLogic.setKitReturnOption}
        missingKitItems={returnsLogic.missingKitItems}
        handlePrintMissingItems={returnsLogic.handlePrintMissingItems}
        handleConfirmKitReturn={returnsLogic.handleConfirmKitReturn} 
      />
      <ConditionDialog 
        open={returnsLogic.conditionDialogOpen} 
        onOpenChange={returnsLogic.setConditionDialogOpen} 
        conditionCounts={returnsLogic.conditionCounts} 
        setConditionCounts={returnsLogic.setConditionCounts} 
        onSave={returnsLogic.handleSaveCondition} 
      />
    </div>
  );
}

export default ManageRequestsPage;