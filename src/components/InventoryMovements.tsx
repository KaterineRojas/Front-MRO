import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from './ui/dialog';
import { Textarea } from './ui/textarea';
import { Plus, ArrowUpDown, TrendingUp, TrendingDown, RotateCcw, Calculator, Printer } from 'lucide-react';

interface Movement {
  id: number;
  type: 'entry' | 'exit' | 'adjustment';
  subtype: 'purchase' | 'return' | 'audit' | 'consumption' | 'loan' | 'sale';
  articleCode: string;
  articleDescription: string;
  quantity: number;
  unit: string;
  reference: string;
  notes: string;
  user: string;
  project: string;
  date: string;
  createdAt: string;
}

interface CycleCountItem {
  id: number;
  code: string;
  description: string;
  systemStock: number;
  physicalStock: number;
  unit: string;
  unitCost: number;
  totalValue: number;
  variance: number;
}

const mockMovements: Movement[] = [
  {
    id: 1,
    type: 'entry',
    subtype: 'purchase',
    articleCode: 'OFF-001',
    articleDescription: 'Office Paper A4 - 80gsm',
    quantity: 500,
    unit: 'sheets',
    reference: 'PO-2025-001',
    notes: 'Quarterly paper stock replenishment',
    user: 'Sarah Johnson',
    project: 'Office Supplies Replenishment',
    date: '2025-01-20',
    createdAt: '2025-01-20T10:30:00Z'
  },
  {
    id: 2,
    type: 'exit',
    subtype: 'loan',
    articleCode: 'TECH-002',
    articleDescription: 'Laptop Dell Latitude 5520',
    quantity: 1,
    unit: 'units',
    reference: 'LOAN-001',
    notes: 'Loan to Marketing team for presentation',
    user: 'Mike Chen',
    project: 'Product Launch Campaign',
    date: '2025-01-20',
    createdAt: '2025-01-20T14:15:00Z'
  },
  {
    id: 3,
    type: 'exit',
    subtype: 'consumption',
    articleCode: 'USB-003',
    articleDescription: 'USB Cable Type-C 2m',
    quantity: 2,
    unit: 'units',
    reference: 'CONS-001',
    notes: 'IT department setup new workstations',
    user: 'Anna Rodriguez',
    project: 'Workstation Setup Project',
    date: '2025-01-19',
    createdAt: '2025-01-19T09:45:00Z'
  },
  {
    id: 4,
    type: 'entry',
    subtype: 'return',
    articleCode: 'TECH-002',
    articleDescription: 'Laptop Dell Latitude 5520',
    quantity: 1,
    unit: 'units',
    reference: 'LOAN-001',
    notes: 'Returned from Marketing team',
    user: 'David Wilson',
    project: 'Product Launch Campaign',
    date: '2025-01-19',
    createdAt: '2025-01-19T16:20:00Z'
  },
  {
    id: 5,
    type: 'adjustment',
    subtype: 'audit',
    articleCode: 'OFF-001',
    articleDescription: 'Office Paper A4 - 80gsm',
    quantity: -50,
    unit: 'sheets',
    reference: 'AUD-2025-001',
    notes: 'Physical count adjustment - damaged paper found',
    user: 'Sarah Johnson',
    project: 'Monthly Audit Process',
    date: '2025-01-18',
    createdAt: '2025-01-18T11:00:00Z'
  }
];

const mockArticles = [
  { code: 'OFF-001', description: 'Office Paper A4 - 80gsm', unit: 'sheets' },
  { code: 'TECH-002', description: 'Laptop Dell Latitude 5520', unit: 'units' },
  { code: 'USB-003', description: 'USB Cable Type-C 2m', unit: 'units' },
  { code: 'PROJ-004', description: 'Projector Epson EB-X41', unit: 'units' }
];

const mockCycleCountItems: CycleCountItem[] = [
  {
    id: 1,
    code: 'OFF-001',
    description: 'Office Paper A4 - 80gsm',
    systemStock: 2500,
    physicalStock: 2500,
    unit: 'sheets',
    unitCost: 0.02,
    totalValue: 50.00,
    variance: 0
  },
  {
    id: 2,
    code: 'TECH-002',
    description: 'Laptop Dell Latitude 5520',
    systemStock: 15,
    physicalStock: 14,
    unit: 'units',
    unitCost: 1200.00,
    totalValue: 16800.00,
    variance: -1
  },
  {
    id: 3,
    code: 'USB-003',
    description: 'USB Cable Type-C 2m',
    systemStock: 5,
    physicalStock: 7,
    unit: 'units',
    unitCost: 8.99,
    totalValue: 62.93,
    variance: 2
  }
];

export function InventoryMovements() {
  const [movements, setMovements] = useState<Movement[]>(mockMovements);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [cycleCountOpen, setCycleCountOpen] = useState(false);
  const [cycleCountItems, setCycleCountItems] = useState<CycleCountItem[]>(mockCycleCountItems);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterSubtype, setFilterSubtype] = useState<string>('all');
  const [filterUser, setFilterUser] = useState<string>('all');
  const [filterProject, setFilterProject] = useState<string>('all');
  const [formData, setFormData] = useState({
    type: 'entry' as Movement['type'],
    subtype: 'purchase' as Movement['subtype'],
    articleCode: '',
    quantity: '',
    reference: '',
    notes: ''
  });

  const filteredMovements = movements.filter(movement => {
    if (filterType !== 'all' && movement.type !== filterType) return false;
    if (filterSubtype !== 'all' && movement.subtype !== filterSubtype) return false;
    if (filterUser !== 'all' && movement.user !== filterUser) return false;
    if (filterProject !== 'all' && movement.project !== filterProject) return false;
    return true;
  });

  const uniqueUsers = [...new Set(movements.map(m => m.user))];
  const uniqueProjects = [...new Set(movements.map(m => m.project))];

  const updatePhysicalStock = (id: number, newStock: number) => {
    setCycleCountItems(items => items.map(item => {
      if (item.id === id) {
        const variance = newStock - item.systemStock;
        const totalValue = newStock * item.unitCost;
        return {
          ...item,
          physicalStock: newStock,
          variance,
          totalValue
        };
      }
      return item;
    }));
  };

  const saveCycleCount = () => {
    // In a real application, this would save the cycle count adjustments
    console.log('Saving cycle count adjustments...', cycleCountItems);
    setCycleCountOpen(false);
  };

  const printCycleCount = () => {
    // Trigger print for cycle count table
    const printContent = document.getElementById('cycle-count-table');
    if (printContent) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Cycle Count Report - ${new Date().toLocaleDateString()}</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th, td { border: 1px solid #000; padding: 8px; text-align: left; font-size: 12px; }
                th { background-color: #f5f5f5; font-weight: bold; }
                h1 { margin-bottom: 10px; }
                .header { margin-bottom: 20px; }
              </style>
            </head>
            <body>
              <div class="header">
                <h1>Cycle Count Report</h1>
                <p>Date: ${new Date().toLocaleDateString()}</p>
                <p>Time: ${new Date().toLocaleTimeString()}</p>
              </div>
              ${printContent.innerHTML}
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  const selectedArticle = mockArticles.find(article => article.code === formData.articleCode);

  const getSubtypeOptions = (type: Movement['type']) => {
    switch (type) {
      case 'entry':
        return [
          { value: 'purchase', label: 'Purchase' },
          { value: 'return', label: 'Loan Return' }
        ];
      case 'exit':
        return [
          { value: 'consumption', label: 'Internal Consumption' },
          { value: 'loan', label: 'Loan' },
          { value: 'sale', label: 'Sale' }
        ];
      case 'adjustment':
        return [
          { value: 'audit', label: 'Audit Adjustment' }
        ];
      default:
        return [];
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedArticle) return;

    const newMovement: Movement = {
      id: Math.max(...movements.map(m => m.id), 0) + 1,
      type: formData.type,
      subtype: formData.subtype,
      articleCode: formData.articleCode,
      articleDescription: selectedArticle.description,
      quantity: parseInt(formData.quantity),
      unit: selectedArticle.unit,
      reference: formData.reference,
      notes: formData.notes,
      user: 'Current User', // In real app, this would be the logged-in user
      date: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString()
    };

    setMovements([newMovement, ...movements]);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      type: 'entry',
      subtype: 'purchase',
      articleCode: '',
      quantity: '',
      reference: '',
      notes: ''
    });
    setDialogOpen(false);
  };

  const getMovementIcon = (type: Movement['type']) => {
    switch (type) {
      case 'entry':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'exit':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      case 'adjustment':
        return <RotateCcw className="h-4 w-4 text-blue-600" />;
    }
  };

  const getMovementBadge = (type: Movement['type'], subtype: Movement['subtype']) => {
    const baseClass = "text-xs";
    switch (type) {
      case 'entry':
        return <Badge variant="default" className={baseClass}>
          {subtype === 'purchase' ? 'Purchase' : 'Return'}
        </Badge>;
      case 'exit':
        return <Badge variant="destructive" className={baseClass}>
          {subtype === 'consumption' ? 'Consumption' : subtype === 'loan' ? 'Loan' : 'Sale'}
        </Badge>;
      case 'adjustment':
        return <Badge variant="secondary" className={baseClass}>Adjustment</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Inventory Movements</h1>
          <p className="text-muted-foreground">
            Track all inventory entries, exits, and adjustments
          </p>
        </div>
        
      </div>

      {/* Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Movements</SelectItem>
                <SelectItem value="entry">Entries Only</SelectItem>
                <SelectItem value="exit">Exits Only</SelectItem>
                <SelectItem value="adjustment">Adjustments Only</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filterSubtype} onValueChange={setFilterSubtype}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by operation" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Operations</SelectItem>
                <SelectItem value="purchase">Purchase</SelectItem>
                <SelectItem value="loan">Loan</SelectItem>
                <SelectItem value="consumption">Consumption</SelectItem>
                <SelectItem value="return">Return</SelectItem>
                <SelectItem value="sale">Sale</SelectItem>
                <SelectItem value="audit">Audit</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterUser} onValueChange={setFilterUser}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by user" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                {uniqueUsers.map(user => (
                  <SelectItem key={user} value={user}>{user}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterProject} onValueChange={setFilterProject}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by project" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Projects</SelectItem>
                {uniqueProjects.map(project => (
                  <SelectItem key={project} value={project}>{project}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Movements Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ArrowUpDown className="h-5 w-5" />
            <span>Recent Movements ({filteredMovements.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Article</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMovements.map((movement) => (
                <TableRow key={movement.id}>
                  <TableCell>{movement.date}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getMovementIcon(movement.type)}
                      {getMovementBadge(movement.type, movement.subtype)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-mono text-sm">{movement.articleCode}</p>
                      <p className="text-xs text-muted-foreground">{movement.articleDescription}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={movement.type === 'exit' || (movement.type === 'adjustment' && movement.quantity < 0) ? 'text-red-600' : 'text-green-600'}>
                      {movement.type === 'exit' || (movement.type === 'adjustment' && movement.quantity < 0) ? '-' : '+'}
                      {Math.abs(movement.quantity)} {movement.unit}
                    </span>
                  </TableCell>
                  <TableCell className="font-mono text-sm">{movement.reference}</TableCell>
                  <TableCell>{movement.user}</TableCell>
                  <TableCell className="max-w-xs truncate">{movement.project}</TableCell>
                  <TableCell className="max-w-xs truncate">{movement.notes}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Cycle Count Dialog */}
      <Dialog open={cycleCountOpen} onOpenChange={setCycleCountOpen}>
        <DialogContent className="max-w-[98vw] w-full max-h-[95vh] h-full overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span className="flex items-center space-x-2">
                <Calculator className="h-5 w-5" />
                <span>Cycle Count</span>
              </span>
              <Button variant="outline" size="sm" onClick={printCycleCount}>
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
            </DialogTitle>
            <DialogDescription>
              Review and adjust inventory quantities
            </DialogDescription>
          </DialogHeader>
          
          <div className="overflow-auto flex-1">
            <div id="cycle-count-table">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>System Stock</TableHead>
                    <TableHead>Physical Count</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead>Unit Cost</TableHead>
                    <TableHead>Total Value</TableHead>
                    <TableHead>Variance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cycleCountItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-mono">{item.code}</TableCell>
                      <TableCell>{item.description}</TableCell>
                      <TableCell>{item.systemStock}</TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={item.physicalStock}
                          onChange={(e) => updatePhysicalStock(item.id, parseInt(e.target.value) || 0)}
                          className="w-20"
                        />
                      </TableCell>
                      <TableCell>{item.unit}</TableCell>
                      <TableCell>${item.unitCost.toFixed(2)}</TableCell>
                      <TableCell>${item.totalValue.toFixed(2)}</TableCell>
                      <TableCell>
                        <span className={`${
                          item.variance > 0 ? 'text-green-600' : 
                          item.variance < 0 ? 'text-red-600' : 
                          'text-gray-600'
                        }`}>
                          {item.variance > 0 ? '+' : ''}{item.variance}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setCycleCountOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveCycleCount}>
              Save Adjustments
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}