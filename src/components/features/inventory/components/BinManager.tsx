import React, { useState } from 'react';
import { useAppDispatch } from '../../../../store';
import { useAppSelector } from '../../../../store';
import { createBinAsync, updateBinAsync, deleteBin as deleteBinAction } from '../../../../store/slices/inventorySlice';
import { Button } from '../../../ui/button';
import { Input } from '../../../ui/input';
import { Label } from '../../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../ui/table';
import { Badge } from '../../../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '../../../ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../../../ui/alert-dialog';
import { Textarea } from '../../../ui/textarea';
import { Plus, Search, Edit, Trash2, Package2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../ui/card';

interface Bin {
  id: number;
  binCode: string;
  type: 'good-condition' | 'on-revision' | 'scrap';
  description: string;
}

export function BinManager() {
  // Inicialización de Redux hooks
  const dispatch = useAppDispatch();
  const bins = useAppSelector((state) => state.inventory.bins);
  
  // Estados locales
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBin, setEditingBin] = useState<Bin | null>(null);
  const [formData, setFormData] = useState<{
    binCode: string;
    type: 'good-condition' | 'on-revision' | 'scrap';
    description: string;
  }>({
    binCode: '',
    type: 'good-condition',
    description: ''
  });

  // Lógica de filtrado de bins
  const filteredBins = bins.filter(bin => {
    const matchesSearch = bin.binCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bin.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || bin.type === typeFilter;
    return matchesSearch && matchesType;
  });

  // Reseteo de formulario
  const resetForm = () => {
    setFormData({
      binCode: '',
      type: 'good-condition',
      description: ''
    });
    setEditingBin(null);
    setDialogOpen(false);
  };

  // Lógica para el badge (etiqueta de estado)
  const getTypeBadge = (type: Bin['type']) => {
    switch (type) {
      case 'good-condition':
        return <Badge className="bg-green-600 hover:bg-green-700">Good Condition</Badge>;
      case 'on-revision':
        return <Badge className="bg-yellow-600 hover:bg-yellow-700">On Revision</Badge>;
      case 'scrap':
        return <Badge variant="destructive">Scrap</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  // Manejo del envío del formulario (Crear o Editar)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check for duplicate bin code
    const isDuplicate = bins.some(bin => 
      bin.binCode.toLowerCase() === formData.binCode.toLowerCase() && 
      bin.id !== editingBin?.id
    );
    
    if (isDuplicate) {
      // Usar un modal o toast en lugar de alert()
      console.error(`Error: BIN Code "${formData.binCode}" already exists. Please use a different code.`);
      return;
    }
    
    if (editingBin) {
      // Update existing bin (assuming updateBinAsync uses dispatch)
      dispatch(updateBinAsync({ id: editingBin.id, data: formData }));
    } else {
      // Create new bin (assuming createBinAsync uses dispatch)
      dispatch(createBinAsync(formData));
    }
    
    resetForm();
  };

  // Manejo de la edición
  const handleEdit = (bin: Bin) => {
    setEditingBin(bin);
    setFormData({
      binCode: bin.binCode,
      type: bin.type,
      description: bin.description
    });
    setDialogOpen(true);
  };

  // FUNCIÓN CORREGIDA: Usa dispatch para borrar el bin del store de Redux
  const handleDeleteBin = (id: number) => {
    // Despacha la acción de Redux para eliminar el bin
    dispatch(deleteBinAction(id));
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center text-2xl font-bold">
              <Package2 className="h-6 w-6 mr-3 text-indigo-600" />
              Bin Management
            </CardTitle>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm} className="bg-indigo-600 hover:bg-indigo-700 transition duration-150">
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Bin
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle className="text-xl font-semibold">{editingBin ? 'Edit Bin' : 'Create New Bin'}</DialogTitle>
                  <DialogDescription>
                    {editingBin ? 'Update the bin information below.' : 'Fill in the details to create a new bin.'}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                  <div>
                    <Label htmlFor="binCode">BIN Code *</Label>
                    <Input
                      id="binCode"
                      value={formData.binCode}
                      onChange={(e) => setFormData({...formData, binCode: e.target.value})}
                      placeholder="e.g., BIN-OFF-001"
                      required
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="type">Type *</Label>
                    <Select 
                      value={formData.type} 
                      onValueChange={(value: 'good-condition' | 'on-revision' | 'scrap') => setFormData({...formData, type: value})}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select Bin Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="good-condition">Good Condition</SelectItem>
                        <SelectItem value="on-revision">On Revision</SelectItem>
                        <SelectItem value="scrap">Scrap</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      placeholder="Description of this bin..."
                      rows={3}
                      className="mt-1"
                    />
                  </div>

                  <div className="flex justify-end space-x-2 pt-4">
                    <Button type="button" variant="outline" onClick={resetForm}>
                      Cancel
                    </Button>
                    <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">
                      {editingBin ? 'Update Bin' : 'Create Bin'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search bins by code or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-10 rounded-lg shadow-sm"
                />
              </div>
            </div>
            <div className="w-48">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="h-10 rounded-lg shadow-sm">
                  <SelectValue placeholder="Filter by Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="good-condition">Good Condition</SelectItem>
                  <SelectItem value="on-revision">On Revision</SelectItem>
                  <SelectItem value="scrap">Scrap</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-xl border shadow-lg overflow-hidden">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead className="w-[150px] font-semibold text-gray-700">BIN Code</TableHead>
                  <TableHead className="w-[150px] font-semibold text-gray-700">Type</TableHead>
                  <TableHead className="font-semibold text-gray-700">Description</TableHead>
                  <TableHead className="w-[100px] text-right font-semibold text-gray-700">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBins.length > 0 ? (
                  filteredBins.map((bin) => (
                    <TableRow key={bin.id}>
                      <TableCell className="font-mono font-medium">{bin.binCode}</TableCell>
                      <TableCell>{getTypeBadge(bin.type)}</TableCell>
                      <TableCell className="max-w-xs truncate text-sm text-gray-600" title={bin.description}>
                        {bin.description || 'N/A'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700"
                            onClick={() => handleEdit(bin)}
                            title="Edit Bin"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="text-red-600 hover:bg-red-50 hover:text-red-700" title="Delete Bin">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action will permanently delete the BIN "{bin.binCode}". This cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteBin(bin.id)} className="bg-red-600 hover:bg-red-700">
                                  Delete Permanently
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
                    <TableCell colSpan={4} className="h-24 text-center text-gray-500">
                      No bins found matching your criteria.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}