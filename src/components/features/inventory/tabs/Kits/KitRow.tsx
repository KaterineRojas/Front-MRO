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
  Lock
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

  useEffect(() => {
    async function loadKitBinInfo() {
      if (!isExpanded) return;

      try {
        setLoadingAvailableBins(true);
        const occupation = await checkKitOccupation(kit.id);

        if (occupation && occupation.isOccupied) {
          setAssemblyBinId(occupation.occupiedBin.id);
          setAssemblyBinCode(occupation.occupiedBin.binCode);
        } else {
          const bins = await getAvailableBins(0, true);
          setAvailableBins(bins);
          setAssemblyBinId(0);
          setAssemblyBinCode('');
        }
      } catch (error) {
        console.error('Error loading kit bin info:', error);
      } finally {
        setLoadingAvailableBins(false);
      }
    }

    loadKitBinInfo();
  }, [isExpanded, kit.id]);

  useEffect(() => {
    async function loadBinsForModal() {
      if (!confirmAssemblyOpen) {
        setModalBinId(0);
        setModalBinCode('');
        return;
      }

      if (assemblyBinCode && assemblyBinId > 0) {
        setModalBinId(assemblyBinId);
        setModalBinCode(assemblyBinCode);
        return;
      }

      if (availableBins.length === 0) {
        try {
          setLoadingAvailableBins(true);
          const bins = await getAvailableBins(0, true);
          setAvailableBins(bins);
        } catch (error) {
          console.error('Error loading bins for modal:', error);
        } finally {
          setLoadingAvailableBins(false);
        }
      }
    }

    loadBinsForModal();
  }, [confirmAssemblyOpen, assemblyBinCode, assemblyBinId, availableBins.length]);

  const handleConfirmAssembly = async () => {
    if (!modalBinCode || modalBinId === 0) {
      alert('Please select a BIN location');
      return;
    }

    try {
      setIsBuilding(true);

      await createPhysicalKit({
        kitId: kit.id,
        binCode: modalBinCode,
        binId: modalBinId,
        quantity: assemblyQuantity,
        notes: `Built ${assemblyQuantity} kit(s) of ${kit.name}`,
      });

      alert(`✓ Successfully built ${assemblyQuantity} kit(s) of ${kit.name} in BIN: ${modalBinCode}`);
      setConfirmAssemblyOpen(false);
      setAssemblyQuantity(1);
      setModalBinId(0);
      setModalBinCode('');
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
          <Badge variant="outline">{kit.items.length} items</Badge>
        </TableCell>
        {/* Stock Total */}
        <TableCell className="text-center">
          <Badge variant="secondary" className="font-semibold">{kit.quantity}</Badge>
        </TableCell>

        <TableCell className="text-center">
          <span className="font-semibold">{kit.quantityAvailable}</span>
        </TableCell>
        {/*  y botones alineados */}
        <TableCell className="text-center">
          <div className="flex justify-center items-center space-x-2">
            <div className="flex space-x-1">
              <Button
                variant="outline"
                size="sm"
                title="Kit Assembly"
                onClick={handleExpandAndFocusAssembly}
              >
                <PackagePlus className="h-4 w-4 mr-1" />
                Assemble
              </Button>

              <Button
                variant="outline"
                size="sm"
                title="Use as template or Duplicate kit"
                onClick={handleUseKit}
              >
                <CopyPlus className="h-4 w-4 mr-1" />
                Clone
              </Button>
            </div>

            <div className="w-[120px]"> {/* ← Ancho fijo para mantener alineación */}
              {kit.quantityAvailable > 0 ? (
                <Button
                  variant="outline"
                  size="sm"
                  title="Dismantle Kit"
                  onClick={handleOpenDismantleModal}
                  className="w-full"
                >
                  <PackageMinus className="h-4 w-4 mr-1" />
                  To disarm
                </Button>
              ) : kit.quantity === 0 ? (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      title="Delete kit"
                      className="w-full"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete kit
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Kit</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete "{kit.name}"? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteKit}
                        className="bg-destructive hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              ) : null}
            </div>
          </div>
        </TableCell>
      </TableRow>

      {/* SECCIÓN EXPANDIDA */}
      {isExpanded && (
        <TableRow>
          <TableCell colSpan={8} className="bg-muted/30 p-0">
            <div className="p-4 space-y-4">
              {/* Items Table */}
              <div>
                <h4 className="flex items-center mb-3 font-semibold">
                  <Package className="h-4 w-4 mr-2" />
                  Items in this kit
                </h4>
                <div className="rounded-md border bg-card overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-20">Image</TableHead>
                        <TableHead>SKU</TableHead>
                        <TableHead>Name & Description</TableHead>
                        <TableHead className="text-center">Qty/Kit</TableHead>
                        <TableHead className="text-center bg-primary/5">
                          <div className="flex flex-col items-center">
                            <span>Estimated Qty</span>
                            <span className="text-xs text-muted-foreground">({assemblyQuantity} kits)</span>
                          </div>
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {kit.items.map((item, index) => {
                        const article = articles.find((a) => a.sku === item.articleSku);
                        const estimatedQty = item.quantity * assemblyQuantity;

                        return (
                          <TableRow key={index}>
                            <TableCell>
                              {article?.imageUrl || item.imageUrl ? (
                                <img
                                  src={article?.imageUrl || item.imageUrl}
                                  alt={item.articleName}
                                  className="w-12 h-12 object-cover rounded"
                                />
                              ) : (
                                <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
                                  <Package className="h-6 w-6 text-muted-foreground" />
                                </div>
                              )}
                            </TableCell>
                            <TableCell className="font-mono text-sm">{item.articleSku}</TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium">{item.articleName}</p>
                                {item.articleDescription && (
                                  <p className="text-sm text-muted-foreground">{item.articleDescription}</p>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge variant="outline">x{item.quantity}</Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge variant="secondary" className="font-semibold">
                                {estimatedQty}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* BIN Info y Kit Assembly */}
              <div id={`kit-assembly-${kit.id}`} className="grid grid-cols-2 gap-4">
                {/* BIN Information & Stock Breakdown */}
                <div className="p-4 border rounded-lg bg-card">
                  <h4 className="flex items-center mb-3 font-semibold text-sm">
                    <MapPin className="h-4 w-4 mr-2" />
                    BIN Location & Stock
                  </h4>
                  {loadingAvailableBins ? (
                    <div className="flex items-center justify-center p-4">
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground mr-2" />
                      <span className="text-sm text-muted-foreground">Loading BIN info...</span>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {/* BIN Code */}
                      <div className="flex justify-between items-center pb-2 border-b">
                        <span className="text-sm text-muted-foreground">BIN Code:</span>
                        <span className="font-mono font-medium">
                          {assemblyBinCode || kit.binCode || <span className="text-muted-foreground">No BIN Assigned</span>}
                        </span>
                      </div>

                      {/* Total Stock */}
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-semibold">Total Stock:</span>
                        <Badge variant="secondary" className="font-bold text-base">{kit.quantity}</Badge>
                      </div>


                      <div className="space-y-2 pl-2 border-l-2 border-muted">
                        {/* Available */}
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-muted-foreground flex items-center">
                            <Archive className="h-3 w-3 mr-1" />
                            Available:
                          </span>
                          <span className="text-xs font-semibold">{kit.quantityAvailable}</span>
                        </div>

                        {/* On Loan */}
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-muted-foreground flex items-center">
                            <UserCheck className="h-3 w-3 mr-1" />
                            On Loan:
                          </span>
                          <span className="text-xs font-semibold">{kit.quantityLoan}</span>
                        </div>

                        {/* Reserved */}
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-muted-foreground flex items-center">
                            <Lock className="h-3 w-3 mr-1" />
                            Reserved:
                          </span>
                          <span className="text-xs font-semibold">{kit.quantityReserved}</span>
                        </div>
                      </div>

                      {/* Created Date */}
                      <div className="flex justify-between items-center text-xs text-muted-foreground pt-2 border-t">
                        <span>Created:</span>
                        <span>{kit.createdAt}</span>
                      </div>
                    </div>
                  )}
                </div>


                {/* Kit Assembly Section */}
                <div className="p-4 border rounded-lg bg-card">
                  <h4 className="flex items-center mb-3 font-semibold text-sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Kit Assembly
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="assembly-qty" className="text-sm">Quantity to Build</Label>
                      <div className="flex items-center space-x-2 mt-1">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => setAssemblyQuantity(Math.max(1, assemblyQuantity - 1))}
                          disabled={assemblyQuantity <= 1}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>

                        <Input
                          id="assembly-qty"
                          type="number"
                          min="1"
                          max="999"
                          value={assemblyQuantity}
                          onChange={(e) => setAssemblyQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                          className="flex-1 text-center font-semibold"
                          placeholder="Qty"
                        />

                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => setAssemblyQuantity(assemblyQuantity + 1)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>

                        <AlertDialog open={confirmAssemblyOpen} onOpenChange={setConfirmAssemblyOpen}>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="default"
                              title="Build kits"
                              disabled={assemblyQuantity < 1 || loadingAvailableBins}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              Kit Building
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="max-w-2xl">
                            <AlertDialogHeader>
                              <AlertDialogTitle>Confirm Kit Assembly</AlertDialogTitle>
                              <AlertDialogDescription asChild>
                                <div className="space-y-4">
                                  <p>
                                    Build <strong>{assemblyQuantity}</strong> kit(s) of "{kit.name}"
                                  </p>

                                  {!assemblyBinCode && (
                                    <div className="space-y-2">
                                      <Label htmlFor="modal-bin">Select BIN Location *</Label>
                                      {loadingAvailableBins ? (
                                        <div className="flex items-center justify-center p-4 border rounded-md">
                                          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground mr-2" />
                                          <span className="text-sm text-muted-foreground">Loading bins...</span>
                                        </div>
                                      ) : availableBins.length > 0 ? (
                                        <>
                                          <Select
                                            value={modalBinId > 0 ? modalBinId.toString() : ''}
                                            onValueChange={handleModalBinChange}
                                          >
                                            <SelectTrigger id="modal-bin">
                                              <SelectValue placeholder="Select a BIN location" />
                                            </SelectTrigger>
                                            <SelectContent>
                                              {availableBins.map((bin) => (
                                                <SelectItem key={bin.id} value={bin.id.toString()}>
                                                  <div className="flex flex-col">
                                                    <span className="font-mono">{bin.binCode}</span>
                                                    {bin.description && (
                                                      <span className="text-xs text-muted-foreground">{bin.description}</span>
                                                    )}
                                                  </div>
                                                </SelectItem>
                                              ))}
                                            </SelectContent>
                                          </Select>
                                          <p className="text-xs text-muted-foreground">
                                            Select where the assembled kits will be stored
                                          </p>
                                        </>
                                      ) : (
                                        <div className="p-3 border border-destructive rounded-md bg-destructive/10">
                                          <p className="text-destructive text-sm flex items-center">
                                            <AlertCircle className="h-4 w-4 mr-2" />
                                            No bins available
                                          </p>
                                        </div>
                                      )}
                                    </div>
                                  )}

                                  {(assemblyBinCode || modalBinCode) && (
                                    <div className="p-3 border rounded-md bg-muted/50">
                                      <p className="text-sm flex items-center">
                                        <MapPin className="h-4 w-4 mr-2" />
                                        <span className="text-muted-foreground">BIN Location:</span>
                                        <span className="ml-2 font-mono font-semibold">
                                          {modalBinCode || assemblyBinCode}
                                        </span>
                                      </p>
                                    </div>
                                  )}

                                  <div>
                                    <p className="font-semibold mb-2">Items that will be consumed:</p>
                                    <div className="border rounded-md max-h-48 overflow-y-auto">
                                      <Table>
                                        <TableHeader>
                                          <TableRow>
                                            <TableHead>Item</TableHead>
                                            <TableHead className="text-center">Required Qty</TableHead>
                                          </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                          {kit.items.map((item, idx) => (
                                            <TableRow key={idx}>
                                              <TableCell className="font-medium">{item.articleName}</TableCell>
                                              <TableCell className="text-center">
                                                <Badge variant="outline">{item.quantity * assemblyQuantity}</Badge>
                                              </TableCell>
                                            </TableRow>
                                          ))}
                                        </TableBody>
                                      </Table>
                                    </div>
                                  </div>
                                </div>
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel disabled={isBuilding}>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={handleConfirmAssembly}
                                disabled={isBuilding || loadingAvailableBins || (!assemblyBinCode && modalBinId === 0)}
                              >
                                {isBuilding ? (
                                  <>
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    Building...
                                  </>
                                ) : (
                                  'Confirm Build'
                                )}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>

                    <div className="p-2 bg-muted rounded text-xs space-y-1">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Kits to build:</span>
                        <span className="font-semibold">{assemblyQuantity}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total items needed:</span>
                        <span className="font-semibold">
                          {kit.items.reduce((sum, item) => sum + (item.quantity * assemblyQuantity), 0)}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground">
                      Click "Kit Building" to assemble kits
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </TableCell>
        </TableRow>
      )}

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
    </React.Fragment>
  );
}