import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import { Badge } from '../../ui/badge';
import { ArrowLeft, Package, AlertTriangle, CheckCircle, Minus, Plus, Printer, Save, MessageSquare } from 'lucide-react';

interface Article {
  id: string;
  code: string;
  description: string;
  type: 'consumable' | 'non-consumable';
  zone: 'Good Condition' | 'Damaged' | 'Quarantine';
  totalRegistered: number;
  physicalCount?: number;
  status?: 'match' | 'discrepancy';
  observations?: string;
}

interface CycleCountViewProps {
  onBack: () => void;
  onComplete?: (completedData: {
    date: string;
    completedDate: string;
    zone: string;
    status: 'completed';
    countType: 'Annual' | 'Biannual' | 'Spot Check';
    auditor: string;
    totalItems: number;
    counted: number;
    discrepancies: number;
    articles: Article[];
  }) => void;
  onSaveProgress?: (progressData: {
    date: string;
    zone: string;
    status: 'in-progress';
    countType: 'Annual' | 'Biannual' | 'Spot Check';
    auditor: string;
    totalItems: number;
    counted: number;
    discrepancies: number;
    articles: Article[];
  }) => void;
  existingCountData?: {
    id?: number;
    articles: Article[];
    countType: 'Annual' | 'Biannual' | 'Spot Check';
    auditor: string;
    zone: string;
  };
}

const mockArticles: Article[] = [
  {
    id: '1',
    code: 'AMX01-ZGC-R01-L04-B01',
    description: 'Premium Electronic Components',
    type: 'non-consumable',
    zone: 'Good Condition',
    totalRegistered: 25
  },
  {
    id: '2',
    code: 'AMX01-ZGC-R02-L03-B05',
    description: 'Digital Multimeter Pro',
    type: 'non-consumable',
    zone: 'Good Condition',
    totalRegistered: 15
  },
  {
    id: '3',
    code: 'AMX01-ZDM-R01-L02-B03',
    description: 'Cracked Display Panel',
    type: 'non-consumable',
    zone: 'Damaged',
    totalRegistered: 8
  },
  {
    id: '4',
    code: 'AMX01-ZDM-R03-L01-B02',
    description: 'Used Battery Pack',
    type: 'consumable',
    zone: 'Damaged',
    totalRegistered: 12
  },
  {
    id: '5',
    code: 'AMX01-ZQT-R01-L01-B01',
    description: 'Unverified Components',
    type: 'non-consumable',
    zone: 'Quarantine',
    totalRegistered: 6
  },
  {
    id: '6',
    code: 'AMX01-ZGC-R03-L02-B04',
    description: 'Industrial Sensors',
    type: 'non-consumable',
    zone: 'Good Condition',
    totalRegistered: 32
  },
  {
    id: '7',
    code: 'AMX01-ZQT-R02-L03-B01',
    description: 'Testing Equipment',
    type: 'non-consumable',
    zone: 'Quarantine',
    totalRegistered: 4
  }
];

export function CycleCountView({ onBack, onComplete, onSaveProgress, existingCountData }: CycleCountViewProps) {
  // Initialize articles - if continuing, use existing data; otherwise use mock data
  const [articles, setArticles] = useState<Article[]>(() => {
    if (existingCountData?.articles) {
      // Convert existing count data to Article format with proper type
      return existingCountData.articles.map(a => ({
        id: a.code, // Use code as id if id is not available
        code: a.code,
        description: a.description,
        type: 'non-consumable' as const, // Default type
        zone: a.zone,
        totalRegistered: a.totalRegistered,
        physicalCount: a.physicalCount,
        status: a.status,
        observations: a.observations
      }));
    }
    return mockArticles;
  });
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedZone, setSelectedZone] = useState<string>(existingCountData?.zone || 'all');
  const [countType, setCountType] = useState<'Annual' | 'Biannual' | 'Spot Check'>(existingCountData?.countType || 'Annual');
  const [auditor, setAuditor] = useState<string>(existingCountData?.auditor || '');

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesZone = selectedZone === 'all' || article.zone === selectedZone;
    
    return matchesSearch && matchesZone;
  });

  const handleCountUpdate = (articleId: string, physicalCount: number, notes?: string) => {
    setArticles(prev => prev.map(article => {
      if (article.id === articleId) {
        const status = physicalCount === article.totalRegistered ? 'match' : 'discrepancy';
        
        return {
          ...article,
          physicalCount,
          status,
          observations: notes || article.observations
        };
      }
      return article;
    }));
  };

  const handleSaveCycleCount = () => {
    // Save cycle count to backend
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    
    // Filter only the articles from the selected zone (if not "all")
    const articlesToSave = selectedZone === 'all' 
      ? articles 
      : articles.filter(a => a.zone === selectedZone);
    
    const progressData = {
      date: `${year}-${month}-${day}`,
      zone: selectedZone,
      status: 'in-progress' as const,
      countType,
      auditor,
      totalItems: articlesToSave.length,
      counted: articlesToSave.filter(a => a.physicalCount !== undefined).length,
      discrepancies: articlesToSave.filter(a => a.status === 'discrepancy').length,
      articles: articlesToSave.map(a => ({
         id: a.id,
        type: a.type,
        code: a.code,
        description: a.description,
        zone: a.zone,
        totalRegistered: a.totalRegistered,
        physicalCount: a.physicalCount !== undefined ? a.physicalCount : 0,
        status: a.status,
        observations: a.observations
      }))
    };

    // Llamar al callback onSaveProgress
    if (onSaveProgress) {
      onSaveProgress(progressData);
    }
    
    alert('Cycle count progress saved successfully!');
  };

  const handleCompleteCycleCount = () => {
    // Filter articles by selected zone (if not "all")
    const articlesToCount = selectedZone === 'all' 
      ? articles 
      : articles.filter(a => a.zone === selectedZone);
    
    const countedArticles = articlesToCount.filter(a => a.status === 'match' || a.status === 'discrepancy');
    const discrepancies = articlesToCount.filter(a => a.status === 'discrepancy');
    
    // Verificar que todos los artículos de la zona hayan sido contados
    if (countedArticles.length < articlesToCount.length) {
      alert(`Please count all items in ${selectedZone === 'all' ? 'all zones' : selectedZone} before completing the cycle count.`);
      return;
    }

    // Verificar que se haya ingresado un auditor
    if (!auditor.trim()) {
      alert('Please enter an auditor name before completing the cycle count.');
      return;
    }

    // Preparar los datos del conteo completado
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    
    const completedData = {
      date: `${year}-${month}-${day}`,
      completedDate: `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`,
      zone: selectedZone,
      status: 'completed' as const,
      countType,
      auditor,
      totalItems: articlesToCount.length,
      counted: countedArticles.length,
      discrepancies: discrepancies.length,
      articles: articlesToCount.map(a => ({
        id: a.id,
        type: a.type,   
        code: a.code,
        description: a.description,
        zone: a.zone,
        totalRegistered: a.totalRegistered,
        physicalCount: a.physicalCount!,
        status: a.status!,
        observations: a.observations
      }))
    };

    // Llamar al callback onComplete
    if (onComplete) {
      onComplete(completedData);
    }
    
    alert('Cycle count completed successfully!');
  };

  const handlePrintAll = () => {
    window.print();
  };

  const zones = ['all', 'Good Condition', 'Damaged', 'Quarantine'];

  const countedArticles = articles.filter(a => a.status === 'match' || a.status === 'discrepancy');
  const pendingArticles = articles.filter(a => !a.status);
  const discrepancies = articles.filter(a => a.status === 'discrepancy');

  const getStatusBadge = (status: 'match' | 'discrepancy' | undefined) => {
    if (!status) return null;
    
    if (status === 'match') {
      return <Badge variant="default" className="bg-green-600">Match</Badge>;
    } else {
      return <Badge variant="destructive">Discrepancy</Badge>;
    }
  };

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
          <Button variant="outline" onClick={handlePrintAll}>
            <Printer className="h-4 w-4 mr-2" />
            Print All
          </Button>
          <Button variant="outline" onClick={handleSaveCycleCount}>
            <Save className="h-4 w-4 mr-2" />
            Save Progress
          </Button>
          <Button onClick={handleCompleteCycleCount}>
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
                placeholder="Search by code or item name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Zone</Label>
              <Select value={selectedZone} onValueChange={setSelectedZone}>
                <SelectTrigger className="w-48 mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {zones.map(zone => (
                    <SelectItem key={zone} value={zone}>
                      {zone === 'all' ? 'All Zones' : zone}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Count Type</Label>
              <Select value={countType} onValueChange={setCountType}>
                <SelectTrigger className="w-48 mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Annual">Annual</SelectItem>
                  <SelectItem value="Biannual">Biannual</SelectItem>
                  <SelectItem value="Spot Check">Spot Check</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Auditor</Label>
              <Input
                value={auditor}
                onChange={(e) => setAuditor(e.target.value)}
                placeholder="Enter auditor name"
                className="w-48 mt-1"
              />
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
                  <TableHead>Item</TableHead>
                  <TableHead className="text-right">Total Registered</TableHead>
                  <TableHead className="text-right">Physical Count</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Observations</TableHead>
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
                        <p className="text-xs text-muted-foreground">{article.zone}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {article.totalRegistered}
                    </TableCell>
                    <TableCell className="text-right">
                      {article.physicalCount !== undefined ? (
                        <span>{article.physicalCount}</span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(article.status)}
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <span className="text-sm text-muted-foreground">
                        {article.observations || '-'}
                      </span>
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
  const [observations, setObservations] = useState(article.observations || '');
  const [showObservations, setShowObservations] = useState(false);

  // Update local state when article changes
  React.useEffect(() => {
    setCountValue(article.physicalCount?.toString() || '');
    setObservations(article.observations || '');
  }, [article.physicalCount, article.observations]);

  const handleSubmit = () => {
    const quantity = parseInt(countValue);
    if (!isNaN(quantity) && quantity >= 0) {
      onUpdate(article.id, quantity, observations.trim() || undefined);
    }
  };

  const handleQuickAdjust = (adjustment: number) => {
    const currentValue = parseInt(countValue) || 0;
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
          placeholder="0"
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
        <Button
          size="sm"
          onClick={handleSubmit}
        >
          Count
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowObservations(!showObservations)}
          title="Add observations"
        >
          <MessageSquare className="h-3 w-3" />
        </Button>
      </div>
      {showObservations && (
        <Input
          type="text"
          value={observations}
          onChange={(e) => setObservations(e.target.value)}
          placeholder="Add observations..."
          className="w-full text-sm"
        />
      )}
    </div>
  );
}