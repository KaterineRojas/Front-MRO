import React, { useState } from 'react';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { createBinAsync, updateBinAsync, deleteBin as deleteBinAction } from '../store/slices/inventorySlice';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from './ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { Textarea } from './ui/textarea';
import { Plus, Search, Edit, Trash2, Package2 } from 'lucide-react';

interface Bin {
  id: number;
  binCode: string;
  type: 'good-condition' | 'on-revision' | 'scrap';
  description: string;
}

export function BinManager() {
  const dispatch = useAppDispatch();
  const bins = useAppSelector((state) => state.inventory.bins);
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

  const filteredBins = bins.filter(bin => {
    const matchesSearch = bin.binCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bin.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || bin.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const resetForm = () => {
    setFormData({
      binCode: '',
      type: 'good-condition',
      description: ''
    });
    setEditingBin(null);
    setDialogOpen(false);
  };

  const getTypeBadge = (type: Bin['type']) => {
    switch (type) {
      case 'good-condition':
        return <Badge className="bg-green-600">Good Condition</Badge>;
      case 'on-revision':
        return <Badge className="bg-yellow-600">On Revision</Badge>;
      case 'scrap':
        return <Badge variant="destructive">Scrap</Badge>;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check for duplicate bin code
    const isDuplicate = bins.some(bin => 
      bin.binCode.toLowerCase() === formData.binCode.toLowerCase() && 
      bin.id !== editingBin?.id
    );
    
    if (isDuplicate) {
      alert(`Error: BIN Code "${formData.binCode}" already exists. Please use a different code.`);
      return;
    }
    
    if (editingBin) {
      // Update existing bin
      dispatch(updateBinAsync({ id: editingBin.id, data: formData }));
    } else {
      // Create new bin
      dispatch(createBinAsync(formData));
    }
    
    resetForm();
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

  const deleteBin = (id: number) => {
    setBins(bins.filter(bin => bin.id !== id));
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <Package2 className="h-5 w-5 mr-2" />
              Bin Management
            </CardTitle>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Bin
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingBin ? 'Edit Bin' : 'Create New Bin'}</DialogTitle>
                  <DialogDescription>
                    {editingBin ? 'Update the bin information below.' : 'Fill in the details to create a new bin.'}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="binCode">BIN Code *</Label>
                    <Input
                      id="binCode"
                      value={formData.binCode}
                      onChange={(e) => setFormData({...formData, binCode: e.target.value})}
                      placeholder="e.g., BIN-OFF-001"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="type">Type *</Label>
                    <Select 
                      value={formData.type} 
                      onValueChange={(value: 'good-condition' | 'on-revision' | 'scrap') => setFormData({...formData, type: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
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
                    />
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={resetForm}>
                      Cancel
                    </Button>
                    <Button type="submit">
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
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue />
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

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>BIN Code</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBins.map((bin) => (
                  <TableRow key={bin.id}>
                    <TableCell className="font-mono">{bin.binCode}</TableCell>
                    <TableCell>{getTypeBadge(bin.type)}</TableCell>
                    <TableCell className="max-w-md truncate" title={bin.description}>
                      {bin.description}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(bin)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm">
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
                              <AlertDialogAction onClick={() => deleteBin(bin.id)}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
