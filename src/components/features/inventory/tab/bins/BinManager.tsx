import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../ui/card';
import { Button } from '../../../ui/button';
import { Input } from '../../../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '../../../ui/dialog';
import { Plus, Search, Package2, Warehouse } from 'lucide-react';
import { BinForm } from './BinForm';
import { BinTable } from './BinTable';
import { UseBinForm } from './UseBinForm';
import type { Bin } from './types';

const mockBins: Bin[] = [
  {
    id: 1,
    binCode: 'BIN-OFF-001',
    type: 'good-condition',
    description: 'Storage for office paper and writing supplies',
  },
  {
    id: 2,
    binCode: 'BIN-TECH-002',
    type: 'good-condition',
    description: 'IT equipment and electronics storage',
  },
  {
    id: 3,
    binCode: 'BIN-USB-003',
    type: 'good-condition',
    description: 'Cables and accessories bin',
  },
  {
    id: 4,
    binCode: 'BIN-TOOL-004',
    type: 'on-revision',
    description: 'Power tools and equipment storage',
  },
  {
    id: 5,
    binCode: 'BIN-SAFE-005',
    type: 'good-condition',
    description: 'PPE and safety gear storage',
  },
  {
    id: 6,
    binCode: 'BIN-STORAGE-001',
    type: 'good-condition',
    description: 'Main storage area',
  },
  {
    id: 8,
    binCode: 'BIN-SCRAP-001',
    type: 'scrap',
    description: 'Items for disposal',
  },
];

export function BinManager() {
  const [bins, setBins] = useState<Bin[]>(mockBins);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBin, setEditingBin] = useState<Bin | null>(null);

  const {
    formData,
    setFormData,
    filteredBins,
    handleEdit,
    handleSubmit,
    deleteBin,
    resetForm,
    searchTerm,
    setSearchTerm,
    typeFilter,
    setTypeFilter,
  } = UseBinForm(bins, setBins, editingBin, setEditingBin, setDialogOpen);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center text-2xl font-bold">
                <Warehouse className="h-6 w-6 mr-2" />
                Bins
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Organize storage locations and bin assignments
              </p>
            </div>
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
                    {editingBin
                      ? 'Update the bin information below.'
                      : 'Fill in the details to create a new bin.'}
                  </DialogDescription>
                </DialogHeader>
                <BinForm
                  formData={formData}
                  setFormData={setFormData}
                  handleSubmit={handleSubmit}
                  editingBin={editingBin}
                  onCancel={resetForm}
                />
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

          <BinTable bins={filteredBins} onEdit={handleEdit} onDelete={deleteBin} />
        </CardContent>
      </Card>
    </div>
  );
}
