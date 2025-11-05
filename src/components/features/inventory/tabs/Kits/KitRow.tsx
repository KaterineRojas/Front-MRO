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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../../../ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../../ui/select';
import { Input } from '../../../../ui/input';
import { Label } from '../../../../ui/label';
import { ChevronDown, ChevronRight, Trash2, Package, Loader2, Plus, MapPin, Minus, AlertCircle } from 'lucide-react';
import type { KitRowProps } from './types';
import { BinSelector } from '../../components/BinSelector';
import { getKitCurrentBin, createPhysicalKit } from '../../services/kitService';
import { getAvailableBins, checkKitOccupation, type Bin } from '../../services/binsService';

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
  
  // Estado para la sección expandida de "Kit Assembly"
  const [assemblyQuantity, setAssemblyQuantity] = useState(1);
  const [confirmAssemblyOpen, setConfirmAssemblyOpen] = useState(false);
  const [assemblyBinId, setAssemblyBinId] = useState<number>(0);
  const [assemblyBinCode, setAssemblyBinCode] = useState('');
  const [availableBins, setAvailableBins] = useState<Bin[]>([]);
  const [loadingAvailableBins, setLoadingAvailableBins] = useState(false);
  const [modalBinId, setModalBinId] = useState<number>(0);
  const [modalBinCode, setModalBinCode] = useState('');

  // Cargar bins disponibles y verificar si el kit ya tiene un BIN asignado
  useEffect(() => {
    async function loadKitBinInfo() {
      if (!isExpanded) return;

      try {
        setLoadingAvailableBins(true);
        const occupation = await checkKitOccupation(kit.id);
        
        if (occupation && occupation.isOccupied) {
          setAssemblyBinId(occupation.occupiedBin.id);
          setAssemblyBinCode(occupation.occupiedBin.binCode);
          console.log(' Kit has BIN assigned:', occupation.occupiedBin);
        } else {
          console.log(' Kit has no BIN assigned, loading available bins...');
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

  // Cargar bins disponibles cuando se abre el modal (si no hay BIN asignado)
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
          console.log(' Loaded available bins for modal:', bins);
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
      
      console.log(' Building kit with:', {
        kitId: kit.id,
        binCode: modalBinCode,
        binId: modalBinId,
        quantity: assemblyQuantity
      });
      
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
    console.log(' USE KIT clicked:', kit);
    onUseAsTemplate(kit);
  };

  const handleModalBinChange = (binId: string) => {
    const selectedBin = availableBins.find(b => b.id.toString() === binId);
    if (selectedBin) {
      setModalBinId(selectedBin.id);
      setModalBinCode(selectedBin.binCode);
      console.log(' Modal BIN Selected:', selectedBin);
    }
  };

  // Handler para el botón "+" que solo expande el kit
  const handleExpandAndFocusAssembly = () => {
    if (!isExpanded) {
      onToggleExpand(kit.id);
    }
    // scroll hacia la sección de assembly después de expandir
    setTimeout(() => {
      const assemblySection = document.getElementById(`kit-assembly-${kit.id}`);
      if (assemblySection) {
        assemblySection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 100);
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
          <div className="flex items-center space-x-3">
            {kit.imageUrl ? (
              <img src={kit.imageUrl} alt={kit.name} className="w-10 h-10 object-cover rounded" />
            ) : (
              <div className="w-10 h-10 bg-muted rounded flex items-center justify-center">
                <Package className="h-5 w-5 text-muted-foreground" />
              </div>
            )}
            <div>
              <p className="font-medium">{kit.name}</p>
              <p className="text-xs text-muted-foreground">{kit.binCode}</p>
            </div>
          </div>
        </TableCell>
        <TableCell className="max-w-xs">
          <p className="text-sm line-clamp-2">{kit.description || '-'}</p>
        </TableCell>
        <TableCell>
          <Badge variant="outline">{kit.items.length} items</Badge>
        </TableCell>
        <TableCell className="text-center">
          <Badge variant="secondary" className="font-semibold">{kit.quantity}</Badge>
        </TableCell>
        <TableCell className="text-right">
          <div className="flex justify-end space-x-2">
            {/* ✅ ACTUALIZADO: Botón "+" ahora solo expande el kit */}
            <Button 
              variant="outline" 
              size="sm" 
              title="Kit Assembly"
              onClick={handleExpandAndFocusAssembly}
            >
              <Plus className="h-4 w-4" />
            </Button>

            {/* Use Button */}
            <Button variant="outline" size="sm" title="Use kit" onClick={handleUseKit}>
              Clone
            </Button>

            {/* Delete Button - Solo si stock es 0 */}
            {kit.quantity === 0 && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="sm" title="Delete kit">
                    <Trash2 className="h-4 w-4 text-destructive" />
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
                    <AlertDialogAction onClick={() => onDeleteKit(kit.id)}>Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </TableCell>
      </TableRow>

      {/* SECCIÓN EXPANDIDA */}
      {isExpanded && (
        <TableRow>
          <TableCell colSpan={6} className="bg-muted/30 p-0">
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

              {/* ✅ AGREGADO: ID para scroll automático */}
              <div id={`kit-assembly-${kit.id}`} className="grid grid-cols-2 gap-4">
                {/* BIN Information */}
                <div className="p-4 border rounded-lg bg-card">
                  <h4 className="flex items-center mb-3 font-semibold text-sm">
                    <MapPin className="h-4 w-4 mr-2" />
                    BIN Location
                  </h4>
                  {loadingAvailableBins ? (
                    <div className="flex items-center justify-center p-4">
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground mr-2" />
                      <span className="text-sm text-muted-foreground">Loading BIN info...</span>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">BIN Code:</span>
                        <span className="font-mono font-medium">
                          {assemblyBinCode || <span className="text-muted-foreground">No BIN Assigned</span>}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Current Stock:</span>
                        <Badge variant="secondary" className="font-semibold">{kit.quantity}</Badge>
                      </div>
                      <div className="flex justify-between items-center text-xs text-muted-foreground">
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
                    {/* Quantity input */}
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
                        
                        {/* ✅ ACTUALIZADO: Botón ahora dice "Kit Building" */}
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
                                  
                                  {/* Selector de BIN en el modal (solo si no hay BIN asignado) */}
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
                                  
                                  {/* Mostrar BIN asignado o seleccionado */}
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
                                  
                                  {/* Items Required */}
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
                                disabled={
                                  isBuilding || 
                                  loadingAvailableBins || 
                                  (!assemblyBinCode && modalBinId === 0)
                                }
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
                    
                    {/* Resumen visual */}
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
    </React.Fragment>
  );
}