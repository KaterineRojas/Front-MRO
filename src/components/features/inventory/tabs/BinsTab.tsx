import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../ui/card';
import { Button } from '../../../ui/button';
import { Input } from '../../../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../ui/table';
import { Badge } from '../../../ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../../../ui/alert-dialog';
import { Plus, Search, Edit, Trash2, Package2 } from 'lucide-react';
import { CreateBinModal } from '../modals/CreateBinModal';

interface Bin {
  id: number;
  binCode: string;
  type: 'good-condition' | 'on-revision' | 'scrap';
  description: string;
}

interface Article {
  id: number;
  binCode: string;
  name: string;
  currentStock: number;
}

interface BinsTabProps {
  articles?: Article[];
}

const mockBins: Bin[] = [
  {
    id: 1,
    binCode: 'BIN-OFF-001',
    type: 'good-condition',
    description: 'Storage for office paper and writing supplies'
  },
  {
    id: 2,
    binCode: 'BIN-TECH-002',
    type: 'good-condition',
    description: 'IT equipment and electronics storage'
  },
  {
    id: 3,
    binCode: 'BIN-USB-003',
    type: 'good-condition',
    description: 'Cables and accessories bin'
  },
  {
    id: 4,
    binCode: 'BIN-TOOL-004',
    type: 'on-revision',
    description: 'Power tools and equipment storage'
  },
  {
    id: 5,
    binCode: 'BIN-SAFE-005',
    type: 'good-condition',
    description: 'PPE and safety gear storage'
  },
  {
    id: 6,
    binCode: 'BIN-STORAGE-001',
    type: 'good-condition',
    description: 'Main storage area'
  },
  {
    id: 7,
    binCode: 'BIN-BACKUP-002',
    type: 'good-condition',
    description: 'Backup storage'
  },
  {
    id: 8,
    binCode: 'BIN-SCRAP-001',
    type: 'scrap',
    description: 'Items for disposal'
  }
];

export function BinsTab({ articles = [] }: BinsTabProps) {
  const [bins, setBins] = useState<Bin[]>(mockBins);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBin, setEditingBin] = useState<Bin | null>(null);

  const filteredBins = bins.filter(bin => {
    const matchesSearch = bin.binCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bin.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || bin.type === typeFilter;
    return matchesSearch && matchesType;
  });

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

  // Get article count per bin
  const getArticleCount = (binCode: string) => {
    return articles.filter(article => article.binCode === binCode).length;
  };

  const handleBinSubmit = (binData: Omit<Bin, 'id'>, isEdit: boolean, editingBinId?: number) => {
    if (isEdit && editingBinId) {
      setBins(bins.map(bin =>
        bin.id === editingBinId
          ? { ...bin, ...binData }
          : bin
      ));
    } else {
      const newBin: Bin = {
        id: Math.max(...bins.map(b => b.id), 0) + 1,
        ...binData
      };
      setBins([...bins, newBin]);
    }
    setEditingBin(null);
  };

  const handleEdit = (bin: Bin) => {
    setEditingBin(bin);
    setDialogOpen(true);
  };

  const deleteBin = (id: number) => {
    setBins(bins.filter(bin => bin.id !== id));
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
            setEditingBin(null);
            setDialogOpen(true);
          }}>
            <Plus className="h-4 w-4 mr-2" />
            Create New Bin
          </Button>
        </div>
        
        <CreateBinModal
          open={dialogOpen}
          onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) setEditingBin(null);
          }}
          editingBin={editingBin}
          bins={bins}
          onSubmit={handleBinSubmit}
        />
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
                <TableHead>Quantity</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBins.map((bin) => {
                const articleCount = getArticleCount(bin.binCode);
                return (
                  <TableRow key={bin.id}>
                    <TableCell className="font-mono">{bin.binCode}</TableCell>
                    <TableCell>{getTypeBadge(bin.type)}</TableCell>
                    <TableCell>
                      <Badge variant={articleCount > 0 ? "default" : "outline"}>
                        {articleCount} {articleCount === 1 ? 'item' : 'items'}
                      </Badge>
                    </TableCell>
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
                            <Button 
                              variant="outline" 
                              size="sm"
                              disabled={articleCount > 0}
                              title={articleCount > 0 ? `Cannot delete bin with ${articleCount} item(s)` : 'Delete bin'}
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
                              <AlertDialogAction onClick={() => deleteBin(bin.id)}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
