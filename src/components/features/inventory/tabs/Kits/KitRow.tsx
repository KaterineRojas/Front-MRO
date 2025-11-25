import React, { useState, useEffect } from 'react';
import { Button } from '../../../../ui/button';
import { Badge } from '../../../../ui/badge';
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
    console.log(kit);
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

  const handleDeleteKit = async () => {
    try {
      await deleteKitService(kit.id);
      alert(`✓ Kit "${kit.name}" deleted successfully`);
      onRefreshKits();
    } catch (error) {
      console.error('❌ Error deleting kit:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`Failed to delete kit\n\nReason: ${errorMessage}`);
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

  // Ejemplo de lógica en tu tabla
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
      <TableRow>
        <TableCell>
          <Button variant="ghost" size="sm" onClick={() => onToggleExpand(kit.id)}>
            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        </TableCell>

        <TableCell>
          <span className="font-mono text-sm">{kit.sku}</span>
        </TableCell>


        <TableCell>
          <div className="flex items-center space-x-3">
            <div>
              <p className="font-medium">{kit.name}</p>
              <p className="text-xs text-muted-foreground">{kit.binCode}</p>
            </div>
          </div>
        </TableCell>
        <TableCell className="max-w-xs">
          <p className="text-sm line-clamp-2">{kit.description || '-'}</p>
        </TableCell>
        <TableCell className="text-center">
          <Badge variant="info">{kit.items.length} items</Badge>
        </TableCell>
        {/* Stock Total */}
        <TableCell className="text-center">
          <Badge variant="neutral" className="font-semibold">{kit.quantity}</Badge>
        </TableCell>

        <TableCell className="text-center">
          {getAvailableBadge(kit.items.length, kit.quantityAvailable)}
        </TableCell>



        <TableCell className="text-center py-3">
          <div className="flex justify-center items-center gap-2">

            <ActionButton
              icon="assemble"
              label="Assemble"
              variant="primarySolid"
              // onClick={handleExpandAndFocusAssembly}
              onClick={() => setIsAssembleModalOpen(true)}
            />

            <div className="h-5 w-px bg-gray-200 mx-1"></div>

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
        </TableCell>


      </TableRow>








      {/* SECCIÓN EXPANDIDA */}
      {isExpanded && (



        <TableRow>
          <TableCell colSpan={8} className="bg-muted/30 p-0">
            <div className="p-6 bg-gray-50/50 dark:bg-black/20 border-t border-gray-100 dark:border-gray-800">

              <h4 className="flex items-center text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">
                <PackageOpen className="h-4 w-4 mr-2 text-indigo-600" />
                Kit Contents
              </h4>

              {/* CONTENEDOR FLEX PRINCIPAL */}
              <div className="flex flex-col lg:flex-row gap-6 items-start">

                {/* 1. SECCIÓN PRINCIPAL: LA TABLA (Ocupa el espacio restante) */}
                <div className="flex-1 min-w-0 space-y-3 w-full">

                  <KitItemsTable
                    items={kit.items}
                    articles={articles}
                  // assemblyQuantity={1} 
                  />
                </div>

                {/* 2. BARRA LATERAL: LA TARJETA DE ESTADO (Ancho fijo en desktop) */}
                <div className="w-full lg:w-80 shrink-0">
                  <KitStatusCard
                    kit={kit}
                    assemblyBinCode={assemblyBinCode}
                    loading={loadingAvailableBins}
                  />
                </div>


              </div>
            </div>





          </TableCell>
        </TableRow>
      )
      }



      {/* modal de assembly */}
      <AssembleKitModal
        isOpen={isAssembleModalOpen}
        onClose={() => setIsAssembleModalOpen(false)}
        kit={kit}
        availableBins={availableBins}
        loadingAvailableBins={loadingAvailableBins}
        assemblyBinCode={assemblyBinCode}
        isBuilding={isBuilding} // estado de carga al confirmar

        onConfirm={(qty, binId) => {
          handleConfirmAssembly(qty, binId);
        }}
      />

      {/*  Modal de Dismantle */}
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

      {/* modal de delete kit */}
      <DeleteKitModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        kitName={kit.name}
        status={deleteStatus}
        message={deleteMessageModal}
      />


    </React.Fragment >
  );
}