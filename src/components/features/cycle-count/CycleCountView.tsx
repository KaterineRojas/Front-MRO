import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import { Badge } from '../../ui/badge';
import { Textarea } from '../../ui/textarea';
import { ArrowLeft, Package, Download, AlertTriangle, CheckCircle, Minus, Plus, Printer, Save } from 'lucide-react';

interface Article {
  id: string;
  code: string;
  description: string;
  type: 'consumable' | 'non-consumable';
  category: string;
  totalRegistered: number; // Total en sistema
  onLoan: number; // Prestados
  expectedInWarehouse: number; // Esperado en almacén (totalRegistered - onLoan)
  physicalCount?: number; // Conteo físico
  difference?: number; // Diferencia (physicalCount - expectedInWarehouse)
  unit: string;
  location: string;
  status?: 'pending' | 'counted' | 'discrepancy' | 'reviewed';
  notes?: string;
}

interface CycleCountViewProps {
  onBack: () => void;
}

const mockArticles: Article[] = [
  {
    id: '1',
    code: 'ELEC-001',
    description: 'Digital Multimeter',
    type: 'non-consumable',
    category: 'Electronics',
    totalRegistered: 10,
    onLoan: 5,
    expectedInWarehouse: 5,
    unit: 'pcs',
    location: 'A1-001',
    status: 'pending'
  },
  {
    id: '2',
    code: 'CONS-015',
    description: 'AA Batteries',
    type: 'consumable',
    category: 'Batteries',
    totalRegistered: 120,
    onLoan: 0,
    expectedInWarehouse: 120,
    unit: 'pcs',
    location: 'B2-012',
    status: 'pending'
  },
  {
    id: '3',
    code: 'TOOL-029',
    description: 'Screwdriver Set',
    type: 'non-consumable',
    category: 'Tools',
    totalRegistered: 12,
    onLoan: 4,
    expectedInWarehouse: 8,
    unit: 'sets',
    location: 'C1-005',
    status: 'pending'
  },
  {
    id: '4',
    code: 'TECH-042',
    description: 'Laptop Dell Latitude',
    type: 'non-consumable',
    category: 'Technology',
    totalRegistered: 20,
    onLoan: 15,
    expectedInWarehouse: 5,
    unit: 'units',
    location: 'IT-001',
    status: 'pending'
  },
  {
    id: '5',
    code: 'OFF-008',
    description: 'Office Paper A4',
    type: 'consumable',
    category: 'Office Supplies',
    totalRegistered: 500,
    onLoan: 0,
    expectedInWarehouse: 500,
    unit: 'sheets',
    location: 'STORAGE-A',
    status: 'pending'
  }
];

export function CycleCountView({ onBack }: CycleCountViewProps) {
  const [articles, setArticles] = useState<Article[]>(mockArticles);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
    const matchesLocation = selectedLocation === 'all' || article.location.startsWith(selectedLocation);
    const matchesStatus = statusFilter === 'all' || (article.status || 'pending') === statusFilter;
    
    return matchesSearch && matchesCategory && matchesLocation && matchesStatus;
  });

  const handleCountUpdate = (articleId: string, physicalCount: number, notes?: string) => {
    setArticles(prev => prev.map(article => {
      if (article.id === articleId) {
        const difference = physicalCount - article.expectedInWarehouse;
        const status = difference === 0 ? 'counted' : 'discrepancy';
        
        return {
          ...article,
          physicalCount,
          difference,
          status,
          notes: notes || article.notes
        };
      }
      return article;
    }));
  };

  const handleSaveCycleCount = () => {
    // Save cycle count to backend
    alert('Cycle count saved successfully!');
  };

  const handlePrintAll = () => {
    window.print();
  };

  const handlePrintByCategory = () => {
    // Create print content filtered by selected category
    const printWindow = window.open('', '', 'height=600,width=800');
    if (!printWindow) return;

    const categoryArticles = articles.filter(article => 
      selectedCategory === 'all' ? true : article.category === selectedCategory
    );

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Cycle Count Report - ${selectedCategory === 'all' ? 'All Categories' : selectedCategory}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { font-size: 24px; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .header { margin-bottom: 20px; }
            .summary { margin: 20px 0; }
            @media print {
              button { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Physical Inventory Count Report</h1>
            <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
            <p><strong>Category:</strong> ${selectedCategory === 'all' ? 'All Categories' : selectedCategory}</p>
            <p><strong>Total Items:</strong> ${categoryArticles.length}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>Code</th>
                <th>Description</th>
                <th>Location</th>
                <th>Total Registered</th>
                <th>On Loan</th>
                <th>Expected in Warehouse</th>
                <th>Physical Count</th>
                <th>Difference</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${categoryArticles.map(article => `
                <tr>
                  <td>${article.code}</td>
                  <td>${article.description}</td>
                  <td>${article.location}</td>
                  <td>${article.totalRegistered} ${article.unit}</td>
                  <td>${article.onLoan} ${article.unit}</td>
                  <td>${article.expectedInWarehouse} ${article.unit}</td>
                  <td>${article.physicalCount !== undefined ? article.physicalCount + ' ' + article.unit : 'Not counted'}</td>
                  <td>${article.difference !== undefined ? (article.difference >= 0 ? '+' : '') + article.difference : '-'}</td>
                  <td>${article.status || 'pending'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="summary">
            <p><strong>Summary:</strong></p>
            <p>Total Items: ${categoryArticles.length}</p>
            <p>Counted: ${categoryArticles.filter(a => a.status === 'counted' || a.status === 'discrepancy').length}</p>
            <p>Pending: ${categoryArticles.filter(a => a.status === 'pending').length}</p>
            <p>Discrepancies: ${categoryArticles.filter(a => a.status === 'discrepancy').length}</p>
          </div>
          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: 'outline', label: 'Pending', icon: Package },
      counted: { variant: 'default', label: 'Counted', icon: CheckCircle },
      discrepancy: { variant: 'destructive', label: 'Discrepancy', icon: AlertTriangle },
      reviewed: { variant: 'secondary', label: 'Reviewed', icon: CheckCircle }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant as any} className="flex items-center space-x-1">
        <Icon className="h-3 w-3" />
        <span>{config.label}</span>
      </Badge>
    );
  };

  const getDifferenceBadge = (difference: number | undefined) => {
    if (difference === undefined) return null;
    
    if (difference === 0) {
      return <Badge variant="default" className="bg-green-600">Match</Badge>;
    } else if (difference > 0) {
      return <Badge variant="secondary" className="bg-blue-600">+{difference}</Badge>;
    } else {
      return <Badge variant="destructive">{difference}</Badge>;
    }
  };

  const categories = ['all', ...Array.from(new Set(articles.map(a => a.category)))];
  const locations = ['all', ...Array.from(new Set(articles.map(a => a.location.split('-')[0])))];

  const countedArticles = articles.filter(a => a.status === 'counted' || a.status === 'discrepancy');
  const pendingArticles = articles.filter(a => a.status === 'pending');
  const discrepancies = articles.filter(a => a.status === 'discrepancy');

  return (
    <div className="space-y-6">
      {/* Header with back button */}
      <div className="sticky top-0 z-10 bg-background pb-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Cycle Count
          </Button>
          <div>
            <h1>Physical Inventory Count</h1>
            <p className="text-muted-foreground">Count and verify physical inventory</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            onClick={handlePrintByCategory}
            disabled={selectedCategory === 'all'}
          >
            <Printer className="h-4 w-4 mr-2" />
            Print by Category
          </Button>
          <Button variant="outline" onClick={handlePrintAll}>
            <Printer className="h-4 w-4 mr-2" />
            Print All
          </Button>
          <Button variant="outline" onClick={handleSaveCycleCount}>
            <Save className="h-4 w-4 mr-2" />
            Save Progress
          </Button>
          <Button onClick={handleSaveCycleCount}>
            <CheckCircle className="h-4 w-4 mr-2" />
            Complete Count
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Items</p>
                <p className="text-2xl">{articles.length}</p>
              </div>
              <Package className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Counted</p>
                <p className="text-2xl text-green-600">{countedArticles.length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl text-orange-600">{pendingArticles.length}</p>
              </div>
              <Package className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Discrepancies</p>
                <p className="text-2xl text-red-600">{discrepancies.length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-64">
              <Label htmlFor="search">Search</Label>
              <Input
                id="search"
                placeholder="Search by code or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Category</Label>
              <div className="flex items-center space-x-2 mt-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrintByCategory}
                  disabled={selectedCategory === 'all'}
                >
                  <Printer className="h-4 w-4 mr-2" />
                  Print by Category
                </Button>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category === 'all' ? 'All Categories' : category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Location</Label>
              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger className="w-32 mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {locations.map(location => (
                    <SelectItem key={location} value={location}>
                      {location === 'all' ? 'All' : location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32 mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="counted">Counted</SelectItem>
                  <SelectItem value="discrepancy">Discrepancy</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Count Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Package className="h-5 w-5" />
            <span>Inventory Items ({filteredArticles.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="review-table-container">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead className="text-right">Total Registered</TableHead>
                  <TableHead className="text-right">On Loan</TableHead>
                  <TableHead className="text-right">Expected in Warehouse</TableHead>
                  <TableHead className="text-right">Physical Count</TableHead>
                  <TableHead className="text-right">Difference</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredArticles.map((article) => (
                  <TableRow key={article.id}>
                    <TableCell className="font-mono">{article.code}</TableCell>
                    <TableCell>
                      <div>
                        <p>{article.description}</p>
                        <p className="text-xs text-muted-foreground">{article.category}</p>
                      </div>
                    </TableCell>
                    <TableCell>{article.location}</TableCell>
                    <TableCell className="text-right">
                      {article.totalRegistered} {article.unit}
                    </TableCell>
                    <TableCell className="text-right">
                      {article.onLoan > 0 ? (
                        <Badge variant="outline" className="text-blue-600 border-blue-600">
                          {article.onLoan} {article.unit}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">0</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {article.expectedInWarehouse} {article.unit}
                    </TableCell>
                    <TableCell className="text-right">
                      {article.physicalCount !== undefined ? (
                        <span>{article.physicalCount} {article.unit}</span>
                      ) : (
                        <span className="text-muted-foreground">Not counted</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {article.difference !== undefined && getDifferenceBadge(article.difference)}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(article.status || 'pending')}
                    </TableCell>
                    <TableCell>
                      <CountInput
                        article={article}
                        onUpdate={handleCountUpdate}
                      />
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

interface CountInputProps {
  article: Article;
  onUpdate: (articleId: string, physicalCount: number, notes?: string) => void;
}

function CountInput({ article, onUpdate }: CountInputProps) {
  const [countValue, setCountValue] = useState(article.physicalCount?.toString() || '');
  const [notes, setNotes] = useState(article.notes || '');
  const [showNotes, setShowNotes] = useState(false);

  const handleSubmit = () => {
    const quantity = parseInt(countValue);
    if (!isNaN(quantity) && quantity >= 0) {
      onUpdate(article.id, quantity, notes.trim() || undefined);
    }
  };

  const handleQuickAdjust = (adjustment: number) => {
    const currentValue = parseInt(countValue) || article.expectedInWarehouse;
    const newValue = Math.max(0, currentValue + adjustment);
    setCountValue(newValue.toString());
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-1">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleQuickAdjust(-1)}
          disabled={parseInt(countValue) <= 0}
        >
          <Minus className="h-3 w-3" />
        </Button>
        <Input
          type="number"
          value={countValue}
          onChange={(e) => setCountValue(e.target.value)}
          placeholder={article.expectedInWarehouse.toString()}
          className="w-20 text-center"
          min="0"
        />
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleQuickAdjust(1)}
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>
      <div className="flex space-x-1">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowNotes(!showNotes)}
        >
          Notes
        </Button>
        <Button
          size="sm"
          onClick={handleSubmit}
          disabled={!countValue}
        >
          Count
        </Button>
      </div>
      {showNotes && (
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add notes about this count..."
          className="mt-1"
          rows={2}
        />
      )}
    </div>
  );
}