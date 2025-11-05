import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import { createBinAsync, updateBinAsync, deleteBin, fetchBins } from '../../../../store/slices/inventorySlice';
import { Button } from '../../../ui/button';
import { Input } from '../../../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../ui/table';
import { Badge } from '../../../ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../../../ui/alert-dialog';
import { Plus, Search, Edit, Trash2, Package2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../ui/card';
import { CreateBinModal } from '../modals/CreateBinModal';

interface Bin {
  id: number;
  binCode: string;
  type: string; // ✅ Cambiado a string genérico
  description: string;
  totalQuantity: number;
}

type StockFilter = 'all' | 'empty' | 'with-stock';

export function BinManager() {
  const dispatch = useAppDispatch();
  const bins = useAppSelector((state) => state.inventory.bins);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBin, setEditingBin] = useState<Bin | null>(null);
  const [stockFilter, setStockFilter] = useState<StockFilter>('all');
  const [formData, setFormData] = useState<{
    binCode: string;
    type: string; // ✅ Cambiado a string genérico
    description: string;
  }>({
    binCode: '',
    type: '',
    description: ''
  });

  // ✅ Obtener tipos únicos dinámicamente del backend
  const uniqueTypes = Array.from(new Set(bins.map(bin => bin.type))).sort();

  const filteredBins = bins.filter(bin => {
    const matchesSearch = bin.binCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bin.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || bin.type === typeFilter;
    const totalQuantity = bin.totalQuantity ?? 0;
    const matchesStock =
      stockFilter === 'all' ||
      (stockFilter === 'empty' && totalQuantity === 0) ||
      (stockFilter === 'with-stock' && totalQuantity > 0);
    return matchesSearch && matchesType && matchesStock;
  });

  const resetForm = () => {
    setFormData({
      binCode: '',
      type: '',
      description: ''
    });
    setEditingBin(null);
  };

  // ✅ SIMPLIFICADO: Badge genérico sin colores hardcodeados
  const getTypeBadge = (type: string) => {
    return <Badge variant="secondary">{type}</Badge>;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const isDuplicate = bins.some(bin =>
      bin.binCode.toLowerCase() === formData.binCode.toLowerCase() &&
      bin.id !== editingBin?.id
    );

    if (isDuplicate) {
      alert(`Error: BIN Code "${formData.binCode}" already exists.`);
      return;
    }

    try {
      if (editingBin) {
        const hasStock = (editingBin.totalQuantity ?? 0) > 0;
        const dataToUpdate = hasStock 
          ? { 
              binCode: formData.binCode, 
              description: formData.description,
              type: editingBin.type
            }
          : formData;

        await dispatch(updateBinAsync({ id: editingBin.id, data: dataToUpdate })).unwrap();
        await dispatch(fetchBins()).unwrap();
        alert('Bin updated successfully!');
      } else {
        await dispatch(createBinAsync(formData)).unwrap();
        await dispatch(fetchBins()).unwrap();
        alert('Bin created successfully!');
      }

      resetForm();
      setDialogOpen(false);
    } catch (error) {
      console.error('Failed to save bin:', error);
      alert('Failed to save bin. Please try again.');
    }
  };

  const handleEdit = (bin: Bin) => {
    setEditingBin(bin);
    setFormData({
      binCode: bin.binCode,
      type: bin.type,
      description: bin.description
    });
    setDialogOpen(true);
  };

  const hasStock = editingBin ? (editingBin.totalQuantity ?? 0) > 0 : false;

  const handleDeleteBin = async (id: number) => {
    console.log('🔴 handleDeleteBin called with ID:', id);

    try {
      console.log('🔴 Dispatching deleteBin...');
      await dispatch(deleteBin(id)).unwrap();

      console.log('✅ deleteBin succeeded, fetching bins...');
      await dispatch(fetchBins()).unwrap();

      alert('Bin deleted successfully!');
    } catch (error: any) {
      console.error('❌ Failed to delete bin:', error);
      alert(`Failed to delete bin: ${error.message || error}`);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Package2 className="h-5 w-5 mr-2" />
            Bin Management
          </CardTitle>
          <Button onClick={() => {
            resetForm();
            setDialogOpen(true);
          }}>
            <Plus className="h-4 w-4 mr-2" />
            Register New Bin
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filtro de Stock */}
        <div className="mb-4 border-b">
          <div className="flex space-x-1">
            <Button
              variant={stockFilter === 'all' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setStockFilter('all')}
            >
              All Bins ({bins.length})
            </Button>
            <Button
              variant={stockFilter === 'empty' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setStockFilter('empty')}
            >
              Empty ({bins.filter(b => (b.totalQuantity ?? 0) === 0).length})
            </Button>
            <Button
              variant={stockFilter === 'with-stock' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setStockFilter('with-stock')}
            >
              With Stock ({bins.filter(b => (b.totalQuantity ?? 0) > 0).length})
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-4 mb-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search bins by code or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
          <div className="w-48">
            {/* ✅ Selector dinámico de tipos */}
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {uniqueTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">BIN Code</TableHead>
                <TableHead className="w-[150px]">Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="w-[120px] text-center">Total Quantity</TableHead>
                <TableHead className="w-[100px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBins.length > 0 ? (
                filteredBins.map((bin) => (
                  <TableRow key={bin.id}>
                    <TableCell className="font-mono font-medium">{bin.binCode}</TableCell>
                    <TableCell>{getTypeBadge(bin.type)}</TableCell>
                    <TableCell className="max-w-xs truncate" title={bin.description}>
                      {bin.description || 'N/A'}
                    </TableCell>
                    <TableCell className="text-center">
                      {bin.totalQuantity ?? 0}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(bin)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={bin.totalQuantity !== 0}
                              className={bin.totalQuantity !== 0 ? "opacity-50 cursor-not-allowed" : ""}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Bin</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{bin.binCode}"? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteBin(bin.id)}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    No bins found matching your criteria.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      <CreateBinModal
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editingBin={editingBin}
        formData={formData}
        onFormDataChange={setFormData}
        onSubmit={handleSubmit}
        hasStock={hasStock}
        availableTypes={uniqueTypes} // ✅ Pasar tipos disponibles al modal
      />
    </Card>
  );
}