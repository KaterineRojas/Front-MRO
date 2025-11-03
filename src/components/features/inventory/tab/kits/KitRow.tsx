import React, { useState, useEffect } from 'react';
import { Button } from '../../../ui/button';
import { Badge } from '../../../ui/badge';
import { TableCell, TableRow, TableBody, TableHead, TableHeader, Table } from '../../../ui/table';
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
} from '../../../ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../../ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../ui/select';
import { Input } from '../../../ui/input';
import { Label } from '../../../ui/label';
import { ChevronDown, ChevronRight, Trash2, Package, Loader2 } from 'lucide-react';
import type { KitRowProps } from './types';
import { BinSelector } from '../../components/BinSelector';
import { getKitCurrentBin } from '@/services/binsService';
import { createPhysicalKit } from '@/services/kitsService';

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
  const [createOpen, setCreateOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [binCode, setBinCode] = useState('');
  const [loadingBin, setLoadingBin] = useState(false);
  const [isBinLocked, setIsBinLocked] = useState(false);
  const [isBuilding, setIsBuilding] = useState(false);

  // Load current bin when modal opens and kit has stock
  useEffect(() => {
    async function loadCurrentBin() {
      if (!createOpen || kit.quantity === 0) {
        return;
      }

      try {
        setLoadingBin(true);
        const currentBin = await getKitCurrentBin(kit.id);
        setBinCode(currentBin);
        setIsBinLocked(true);
      } catch (err) {
        console.error('Error loading kit current bin:', err);
      } finally {
        setLoadingBin(false);
      }
    }

    if (createOpen) {
      if (kit.quantity === 0) {
        // Reset for new kit build
        setBinCode('');
        setIsBinLocked(false);
      } else {
        loadCurrentBin();
      }
    }
  }, [createOpen, kit.id, kit.quantity]);

  const handleCreateKits = async () => {
    if (!binCode) {
      alert('Please select a BIN location');
      return;
    }

    try {
      setIsBuilding(true);
      await createPhysicalKit({
        kitId: kit.id,
        binCode: binCode,
        quantity: quantity,
        notes: `Built ${quantity} kit(s) of ${kit.name}`,
      });

      alert(`✓ Successfully built ${quantity} kit(s) of ${kit.name} in BIN: ${binCode}`);
      setCreateOpen(false);

      // Reset for next use if it was a new build
      if (!isBinLocked) {
        setBinCode('');
      }
      setQuantity(1);

      // Refresh the kit list to show updated stock
      onRefreshKits();
    } catch (error) {
      console.error('Error building kit:', error);

      // Extract and show the error message from the backend
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`Unable to build kit\n\nReason: ${errorMessage}`);
    } finally {
      setIsBuilding(false);
    }
  };

  const handleUseKit = () => {
    // Create a new kit based on the current kit (use as template)
    onUseAsTemplate(kit);
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
            {kit.imageUrl && (
              <img src={kit.imageUrl} alt={kit.name} className="w-10 h-10 object-cover rounded" />
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
            {/* Build Button with Modal */}
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" title="Build kits">
                  Build
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Build Kits</DialogTitle>
                  <DialogDescription>
                    Select a BIN location and specify how many "{kit.name}" kits you'd like to assemble.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="binCode">BIN Location *</Label>
                    {loadingBin ? (
                      <div className="flex items-center justify-center p-4 border rounded-md">
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground mr-2" />
                        <span className="text-sm text-muted-foreground">Loading current BIN...</span>
                      </div>
                    ) : isBinLocked && binCode ? (
                      <Select value={binCode} onValueChange={setBinCode}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select bin" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={binCode}>{binCode}</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <BinSelector
                        value={binCode}
                        onValueChange={setBinCode}
                        placeholder="Select a BIN location for the built kits"
                        required
                        binPurpose={0}
                        disabled={false}
                      />
                    )}
                    <p className="text-xs text-muted-foreground">
                      {isBinLocked
                        ? "This kit already has stock in this BIN. Adding more kits will be stored in the same location."
                        : "Select where the assembled kits will be stored"}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                      placeholder="Enter quantity"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setCreateOpen(false)} disabled={isBuilding}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateKits} disabled={isBuilding || !binCode}>
                    {isBuilding ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Building...
                      </>
                    ) : (
                      'Build'
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Use Button */}
            <Button variant="outline" size="sm" title="Use kit" onClick={handleUseKit}>
              Use
            </Button>

            {/* Delete Button */}
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
          </div>
        </TableCell>
      </TableRow>
      {isExpanded && (
        <TableRow>
          <TableCell colSpan={6} className="bg-muted/30 p-0">
            <div className="p-4">
              <h4 className="flex items-center mb-3">
                <Package className="h-4 w-4 mr-2" />
                Items in this kit
              </h4>
              <div className="rounded-md border bg-card">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-20">Image</TableHead>
                      <TableHead>Sku</TableHead>
                      <TableHead>Name & Description</TableHead>
                      <TableHead>Quantity</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {kit.items.map((item, index) => {
                      const article = articles.find((a) => a.sku === item.articleSku);
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
                          <TableCell className="font-mono">{item.articleSku}</TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{item.articleName}</p>
                              {item.articleDescription && (
                                <p className="text-sm text-muted-foreground">{item.articleDescription}</p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">x{item.quantity}</Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
              <div className="flex gap-4 text-sm mt-3">
                <div>
                  <span className="text-muted-foreground">Created:</span>
                  <span className="ml-2">{kit.createdAt}</span>
                </div>
              </div>
            </div>
          </TableCell>
        </TableRow>
      )}
    </React.Fragment>
  );
}
