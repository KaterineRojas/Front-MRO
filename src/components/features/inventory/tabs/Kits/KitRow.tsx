import React, { useState, useEffect } from 'react';
import { Button } from '../../../../ui/button';
// import { Badge } from '../../../../ui/badge';
import { TableCell, TableRow, TableBody, TableHead, TableHeader, Table } from '../../../../ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../../../../ui/alert-dialog';
import {
  PackageMinus,
  ChevronDown,
  ChevronRight,
  Trash2,
  Package,
  Loader2,
  Plus,
  MapPin,
  Minus,
  AlertCircle,
  PackagePlus,
  CopyPlus,
  Archive,
  UserCheck,
  Lock,
  MoreHorizontal,
  PackageOpen
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../../ui/select';

import { Input } from '../../../../ui/input';
import { Label } from '../../../../ui/label';
import type { KitRowProps } from './types';
import { getAvailableBins, checkKitOccupation, type Bin } from '../../services/binsService';
import { getKitCurrentBin, createPhysicalKit, deleteKit as deleteKitService, dismantleKit } from '../../services/kitService';
import { DismantleKitModal } from '../../modals/DismantleKitModal';
import { ActionButton } from '../../components/ActionButton'
import { KitItemsTable } from '../../components/KitItemsTable'
import { KitStatusCard } from '../../components/KitStatusCard';
import { AssembleKitModal } from '../../modals/AssembleKitModal'
import { DeleteKitModal } from '../../modals/DeleteKitModal'
import { KitExpandedDetails } from '../../components/KitDetailsRow';
import {Badge} from '../../components/Badge'
import { isPending } from '@reduxjs/toolkit';

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
  const [assemblyQuantity, setAssemblyQuantity] = useState(1);
  const [confirmAssemblyOpen, setConfirmAssemblyOpen] = useState(false);
  const [assemblyBinId, setAssemblyBinId] = useState<number>(0);
  const [assemblyBinCode, setAssemblyBinCode] = useState('');
  const [availableBins, setAvailableBins] = useState<Bin[]>([]);
  const [loadingAvailableBins, setLoadingAvailableBins] = useState(false);
  const [modalBinId, setModalBinId] = useState<number>(0);
  const [modalBinCode, setModalBinCode] = useState('');
  const [dismantleModalOpen, setDismantleModalOpen] = useState(false);
  const [dismantleQuantity, setDismantleQuantity] = useState(1);
  const [dismantleNotes, setDismantleNotes] = useState('');
  const [isDismantling, setIsDismantling] = useState(false);
  const [isAssembleModalOpen, setIsAssembleModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteStatus, setDeleteStatus] = useState<'confirm' | 'loading' | 'success' | 'error'>('confirm');
  const [deleteMessageModal, setDeleteMessageModal] = useState('')


  useEffect(() => {
    // console.log(kit);
    // console.log(articles);

  }, [])


  // for updating BIN code showed in the BIN info card and assembly modal
  useEffect(() => {
    // REGLA 0: Si todo está cerrado, no hacemos nada.
    if (!isExpanded && !isAssembleModalOpen) return;

    // REGLA 2, 3 y 4 (Verificación de Caché):
    // Si YA tenemos un código de BIN cargado (sea porque estaba expandido o porque se abrió el modal antes),
    // NO hacemos la petición de ocupación nuevamente. Asumimos que el dato local es válido.
    if (assemblyBinCode) {
      setLoadingAvailableBins(false);
      return;
    }

    // REGLA 1: Si no tenemos dato (assemblyBinCode es vacío), hacemos la carga.
    async function loadKitData() {
      try {
        setLoadingAvailableBins(true);

        // 1. Verificamos ocupación
        const occupation = await checkKitOccupation(kit.id);

        if (occupation && occupation.isOccupied) {
          // Si tiene BIN, lo guardamos y terminamos.
          // Al guardar 'assemblyBinCode', la proxima vez que este effect corra,
          // entrara en el 'if(assemblyBinCode)' de arriba y no pedira nada.
          setAssemblyBinId(occupation.occupiedBin.id);
          setAssemblyBinCode(occupation.occupiedBin.binCode);
        } else {
          setAssemblyBinId(0);
          setAssemblyBinCode('');

          // Regla 2
          // Si el modal está abierto y NO hay bin asignado, necesitamos
          // cargar la lista de opciones para el Dropdown.
          if (isAssembleModalOpen) {
            // Solo si la lista esta vacia
            if (availableBins.length === 0) {
              const bins = await getAvailableBins(0, true);
              setAvailableBins(bins);
            }
          }
        }
      } catch (error) {
        console.error('Error loading kit bin info:', error);
      } finally {
        setLoadingAvailableBins(false);
      }
    }

    loadKitData();

  }, [isExpanded, isAssembleModalOpen, kit.id, assemblyBinCode]);



  // useEffect(() => {
  //   async function loadBinsForModal() {
  //     if (!confirmAssemblyOpen) {
  //       setModalBinId(0);
  //       setModalBinCode('');
  //       return;
  //     }

  //     if (assemblyBinCode && assemblyBinId > 0) {
  //       setModalBinId(assemblyBinId);
  //       setModalBinCode(assemblyBinCode);
  //       return;
  //     }

  //     if (availableBins.length === 0) {
  //       try {
  //         setLoadingAvailableBins(true);
  //         const bins = await getAvailableBins(0, true);
  //         setAvailableBins(bins);
  //       } catch (error) {
  //         console.error('Error loading bins for modal:', error);
  //       } finally {
  //         setLoadingAvailableBins(false);
  //       }
  //     }
  //   }

  //   loadBinsForModal();
  // }, [confirmAssemblyOpen, assemblyBinCode, assemblyBinId, availableBins.length]);




  // const handleConfirmAssembly = async () => {
  //   if (!modalBinCode || modalBinId === 0) {
  //     alert('Please select a BIN location');
  //     return;
  //   }

  //   try {
  //     setIsBuilding(true);

  //     await createPhysicalKit({
  //       kitId: kit.id,
  //       binCode: modalBinCode,
  //       binId: modalBinId,
  //       quantity: assemblyQuantity,
  //       notes: `Built ${assemblyQuantity} kit(s) of ${kit.name}`,
  //     });

  //     alert(`✓ Successfully built ${assemblyQuantity} kit(s) of ${kit.name} in BIN: ${modalBinCode}`);
  //     setConfirmAssemblyOpen(false);
  //     setAssemblyQuantity(1);
  //     setModalBinId(0);
  //     setModalBinCode('');
  //     onRefreshKits();
  //   } catch (error) {
  //     console.error('Error building kit:', error);
  //     const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
  //     alert(`Unable to build kit\n\nReason: ${errorMessage}`);
  //   } finally {
  //     setIsBuilding(false);
  //   }
  // };

  // CAMBIO: La función ahora acepta argumentos (qty, binId)
  const handleConfirmAssembly = async (qty: number, selectedBinId?: number) => {

    // Validamos qué BIN usar: El seleccionado en el modal O el pre-asignado
    const finalBinId = selectedBinId || assemblyBinId;
    const finalBinCode = availableBins.find(b => b.id === finalBinId)?.binCode || assemblyBinCode;

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
        quantity: qty, // Usamos el argumento qty
        notes: `Built ${qty} kit(s) of ${kit.name}`,
      });

      // Feedback y Cierre
      // alert(`✓ Successfully built...`); // Opcional, un Toast es mejor
      setIsAssembleModalOpen(false); // Cerramos el nuevo modal
      onRefreshKits(); // Recargamos la tabla

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

  const handleModalBinChange = (binId: string) => {
    const selectedBin = availableBins.find(b => b.id.toString() === binId);
    if (selectedBin) {
      setModalBinId(selectedBin.id);
      setModalBinCode(selectedBin.binCode);
    }
  };

  const handleExpandAndFocusAssembly = () => {
    if (!isExpanded) {
      onToggleExpand(kit.id);
    }
    setTimeout(() => {
      const assemblySection = document.getElementById(`kit-assembly-${kit.id}`);
      if (assemblySection) {
        assemblySection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 100);
  };

  const handleToggleAndScroll = () => {
    // 1. Ejecutamos la lógica original de expandir/colapsar
    onToggleExpand(kit.id);

    // 2. Si vamos a ABRIR (actualmente !isExpanded), programamos el scroll
    if (!isExpanded) {
      setTimeout(() => {
        // Intentamos buscar el contenedor de detalles específicos
        const detailSection = document.getElementById(`kit-details-${kit.id}`);

        if (detailSection) {
          // 'center' o 'start' suelen ser mejores que 'nearest' para ver el detalle completo
          detailSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 150); // Damos un poco de tiempo a la animación de apertura (ajusta según tu CSS)
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
    if (required >= available) return <Badge variant="critical">{available}</Badge>;
    if (required < available) return <Badge variant="success">{available}</Badge>;
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
      {/* FILA PRINCIPAL 
          Reemplazamos <TableRow> y <TableCell> por <tr> y <td> con clases de Tailwind 
      */}
      <tr 
        className={`border-b border-gray-100 dark:border-gray-800 transition-colors ${
          isExpanded ? 'bg-gray-50 dark:bg-gray-800/50' : 'hover:bg-gray-50 dark:hover:bg-gray-800/30'
        }`}
      >
        {/* Celda 1: Toggle Button */}
        <td className="p-2 align-middle">
          <button 
            className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors"
            onClick={handleToggleAndScroll}
          >
            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
        </td>

        {/* Celda 2: SKU */}
        <td className="p-2 align-middle">
          <span className="font-mono text-sm">{kit.sku}</span>
        </td>

        {/* Celda 3: Name & Bin */}
        <td className="p-2 align-middle">
          <div className="flex items-center space-x-3">
            <div>
              <p className="font-medium text-sm">{kit.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{kit.binCode}</p>
            </div>
          </div>
        </td>

        {/* Celda 4: Description */}
        <td className="p-2 align-middle max-w-xs">
          <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{kit.description || '-'}</p>
        </td>

        {/* Celda 5: Items Count (Badge Component) */}
        <td className="p-2 align-middle text-center">
          <Badge variant="info">{kit.items.length} items</Badge>
        </td>

        {/* Celda 6: Stock Total (Badge Component) */}
        <td className="p-2 align-middle text-center">
          <Badge variant="neutral" className="font-semibold">{kit.quantity}</Badge>
        </td>

        {/* Celda 7: Available Badge (Helper Function) */}
        <td className="p-2 align-middle text-center">
          {getAvailableBadge(kit.items.length, kit.quantityAvailable)}
        </td>

        {/* Celda 8: Actions (ActionButton Components) */}
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

      {/* SECCIÓN EXPANDIDA (MODULARIZADA) */}
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