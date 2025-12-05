import React, { useState, useEffect } from 'react';
import {
  ChevronRight,
} from 'lucide-react';
import type { KitRowProps } from './types';
import { getAvailableBins, checkKitOccupation, type Bin, getAllAvailableBins, AvailableBinResponse } from '../../services/binsService';
import { getKitCurrentBin, createPhysicalKit, deleteKit as deleteKitService, dismantleKit, getKitDefaultBin } from '../../services/kitService';
import { DismantleKitModal } from '../../modals/DismantleKitModal';
import { ActionButton } from '../../components/ActionButton'
import { AssembleKitModal } from '../../modals/AssembleKitModal'
import { DeleteKitModal } from '../../modals/DeleteKitModal'
import { KitExpandedDetails } from '../../components/KitDetailsRow';
import { Badge } from '../../components/Badge'
import { isPending } from '@reduxjs/toolkit';
import { useSelector } from 'react-redux';


export function KitRow({
  kit,
  articles,
  categories,
  isExpanded,
  onToggleExpand,
  onEditKit,
  onUseAsTemplate,
  onDeleteKit,
  onRefreshKits,
}: KitRowProps) {
  const [isBuilding, setIsBuilding] = useState(false);
  const [assemblyBinId, setAssemblyBinId] = useState<number>(0);
  const [assemblyBinCode, setAssemblyBinCode] = useState('');
  const [availableBins, setAvailableBins] = useState<AvailableBinResponse[]>([]);
  const [loadingAvailableBins, setLoadingAvailableBins] = useState(false);
  const [dismantleModalOpen, setDismantleModalOpen] = useState(false);
  const [dismantleQuantity, setDismantleQuantity] = useState(1);
  const [dismantleNotes, setDismantleNotes] = useState('');
  const [isDismantling, setIsDismantling] = useState(false);
  const [isAssembleModalOpen, setIsAssembleModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteStatus, setDeleteStatus] = useState<'confirm' | 'loading' | 'success' | 'error'>('confirm');
  const [deleteMessageModal, setDeleteMessageModal] = useState('')
  const darkMode = useSelector((state: any) => state.ui.darkMode);
  const WAREHOUSE_ID = 1;



  useEffect(() => {
    console.log(kit);
    // console.log(articles);
    

  }, [])

  useEffect(() => {
    console.log(assemblyBinCode);
    
  }, [assemblyBinCode])
  
  


  useEffect(() => {
    // 1. EARLY EXIT: If UI is closed, do nothing.
    if (!isExpanded && !isAssembleModalOpen) return;

    // 2. CACHE CHECK: If already have the code, do nothing.
    if (assemblyBinCode) return;

    // Setup AbortController for cleanup
    const controller = new AbortController();
    let isActive = true;

    async function loadKitData() {
      try {
        setLoadingAvailableBins(true);

        // A. Fetch Kit Occupation (Default Bin)
        const occupation = await getKitDefaultBin(
          { kitId: kit.id, warehouseId: WAREHOUSE_ID },
          controller.signal
        );

        // Check if component is still mounted before setting state
        if (!isActive) return;

        if (occupation) {
          // CASE: Found Default Bin
          setAssemblyBinId(occupation.id);
          setAssemblyBinCode(occupation.binCode);
        } else {
          // CASE: No Default Bin (404/Null)
          setAssemblyBinId(0);
          setAssemblyBinCode('');

          // B. Fetch Dropdown Options (Only if Modal is Open)
          // We check isAssembleModalOpen here again because it might have changed during the await
          if (isAssembleModalOpen) {
            // OPTIMIZATION: We pass 'availableBins' length check to the service 
            // or simply fetch. To avoid dependency loops, we assume if we are here,
            // we want to ensure the list is populated.

            // NOTE: Ideally, 'availableBins' should be managed by a separate query (React Query),
            // but for this manual effect, we fetch if the list is likely empty.
            if (availableBins.length === 0) {
              const bins = await getAllAvailableBins(WAREHOUSE_ID, true);
              if (isActive) setAvailableBins(bins);
            }
          }
        }
      } catch (error) {
        // Ignore AbortErrors (user cancelled/closed modal)
        if (error instanceof Error && error.name !== 'AbortError') {
          console.error('Error loading kit bin info:', error);
        }
      } finally {
        if (isActive) setLoadingAvailableBins(false);
      }
    }

    loadKitData();

    // Cleanup function: Abort fetch if user closes modal/collapses card
    return () => {
      isActive = false;
      controller.abort();
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isExpanded, isAssembleModalOpen, kit.id, assemblyBinCode]);
  // We intentionally exclude 'availableBins' to avoid loops, or we handle it via ref.





  const handleConfirmAssembly = async (qty: number, selectedBinId?: number) => {

    // Validamos qué BIN usar: El seleccionado en el modal O el pre-asignado
    const finalBinId = selectedBinId || assemblyBinId;
    const finalBinCode = availableBins.find(b => b.id === finalBinId)?.code || assemblyBinCode;

    if (!finalBinId) {
      alert('Error: No BIN location identified.');
      return;
    }

    try {
      setIsBuilding(true);

      await createPhysicalKit({
        kitId: kit.id,
        binCode: finalBinCode,
        binId: finalBinId,
        quantity: qty,
        notes: `Built ${qty} kit(s) of ${kit.name}`,
      });

      setIsAssembleModalOpen(false);
      onRefreshKits();

    } catch (error) {
      console.error('Error building kit:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`Unable to build kit\n\nReason: ${errorMessage}`);
    } finally {
      setIsBuilding(false);
    }
  };

  const handleUseKit = () => {
    onUseAsTemplate(kit);
  };

  const handleToggleAndScroll = () => {
    onToggleExpand(kit.id);

    if (!isExpanded) {
      setTimeout(() => {
        const detailSection = document.getElementById(`kit-details-${kit.id}`);

        if (detailSection) {
          detailSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 150);
    }
  };

  const handleOpenDismantleModal = () => {
    setDismantleQuantity(1);
    setDismantleNotes('');
    setDismantleModalOpen(true);
  };

  const handleConfirmDismantle = async () => {
    try {
      setIsDismantling(true);

      await dismantleKit(kit.id, {
        quantity: dismantleQuantity,
        notes: dismantleNotes || undefined,
      });

      alert(`✓ Successfully dismantled ${dismantleQuantity} kit(s) of "${kit.name}"`);
      setDismantleModalOpen(false);
      setDismantleQuantity(1);
      setDismantleNotes('');
      onRefreshKits();
    } catch (error) {
      console.error('❌ Error dismantling kit:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`Failed to dismantle kit\n\nReason: ${errorMessage}`);
    } finally {
      setIsDismantling(false);
    }
  };

  const getAvailableBadge = (required: number, available: number) => {
    if (required >= available) return <Badge variant={`${darkMode ? 'critical' : 'critical-soft'}`}>{available}</Badge>;
    if (required < available) return <Badge variant={`${darkMode ? 'success' : 'success-soft'}`}>{available}</Badge>;
  };

  const handleOpenDeleteModal = () => {
    setDeleteStatus('confirm');
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      setDeleteStatus('loading');

      await deleteKitService(kit.id);

      setDeleteStatus('success');
      onRefreshKits();
    } catch (error) {
      console.error('❌ Error deleting kit:', error);
      setDeleteStatus('error');

      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      setDeleteMessageModal(message);
    }
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
  };


  return (
    <React.Fragment>
      <tr
        className={`border-b border-gray-100 dark:border-gray-800 transition-colors ${isExpanded ? 'bg-gray-50 dark:bg-gray-700/50' : 'hover:bg-[#F5F5F7] dark:hover:bg-gray-800/30'
          }`}
      >
        <td className="p-2 align-middle">
          <button
            className="p-1.5 rounded-md hover:bg-[#E5E7EB] dark:hover:bg-white dark:hover:text-black text-gray-500 transition-colors"
            onClick={handleToggleAndScroll}
          >
            <ChevronRight className={`h-4 w-4 transition duration-1500 ${isExpanded ? 'rotate-90' : ''}`} />
          </button>
        </td>

        <td className="p-2 align-middle">
          <span className="font-mono text-sm">{kit.sku}</span>
        </td>

        <td className="p-2 align-middle">
          <div className="flex items-center space-x-3">
            <div>
              <p className="font-medium text-sm">{kit.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{kit.binCode}</p>
            </div>
          </div>
        </td>

        <td className="p-2 align-middle max-w-xs">
          <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{kit.description || '-'}</p>
        </td>

        <td className="p-2 align-middle text-center">
          <Badge variant={`${darkMode ? 'info' : 'info-soft'}`}>{kit.items.length} items</Badge>
        </td>

        <td className="p-2 align-middle text-center">
          <Badge variant={`${darkMode ? 'neutral' : 'neutral-soft'}`} className="font-semibold">{kit.quantity}</Badge>
        </td>

        <td className="p-2 align-middle text-center">
          {getAvailableBadge(kit.items.length, kit.quantityAvailable)}
        </td>

        <td className="p-2 align-middle text-center py-3">
          <div className="flex justify-center items-center gap-2">

            <ActionButton
              icon="assemble"
              label="Assemble"
              variant="primarySolid"
              // onClick={handleExpandAndFocusAssembly}
              onClick={() => setIsAssembleModalOpen(true)}
            />

            <div className="h-5 w-px bg-gray-200 dark:bg-gray-700 mx-1"></div>

            <ActionButton
              icon="duplicate"
              variant="cyan"
              title="Duplicate / Template"
              onClick={handleUseKit}
            />

            <ActionButton
              icon="dismantle"
              variant="warning"
              disabled={kit.quantity === 0}
              title={kit.quantity > 0 ? "Dismantle Kit" : "No stock to dismantle"}
              onClick={handleOpenDismantleModal}
            />

            <ActionButton
              icon="delete"
              variant="danger"
              disabled={kit.quantity > 0}
              title={kit.quantity > 0 ? "Cannot delete: Stock exists" : "Delete Kit"}
              onClick={handleOpenDeleteModal}
            />

          </div>
        </td>
      </tr>

      {/* SECCIÓN EXPANDIDA */}
      {isExpanded && (
        <KitExpandedDetails
          kit={kit}
          articles={articles}
          assemblyBinCode={assemblyBinCode}
          loadingAvailableBins={loadingAvailableBins}
          colSpan={8} // 8 columnas en la tabla principal
        />
      )}

      {/* MODAL DE ASSEMBLY */}
      <AssembleKitModal
        isOpen={isAssembleModalOpen}
        onClose={() => setIsAssembleModalOpen(false)}
        kit={kit}
        availableBins={availableBins}
        loadingAvailableBins={loadingAvailableBins}
        assemblyBinCode={assemblyBinCode}
        isBuilding={isBuilding}
        onConfirm={(qty, binId) => {
          handleConfirmAssembly(qty, binId);
        }}
        articles={articles}
      />

      {/* MODAL DE DISMANTLE */}
      <DismantleKitModal
        open={dismantleModalOpen}
        onOpenChange={setDismantleModalOpen}
        kitName={kit.name}
        maxQuantity={kit.quantityAvailable}
        quantity={dismantleQuantity}
        notes={dismantleNotes}
        onQuantityChange={setDismantleQuantity}
        onNotesChange={setDismantleNotes}
        onConfirm={handleConfirmDismantle}
        isSubmitting={isDismantling}
      />

      {/* MODAL DE DELETE */}
      <DeleteKitModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        kitName={kit.name}
        status={deleteStatus}
        message={deleteMessageModal}
      />

    </React.Fragment>
  );
}