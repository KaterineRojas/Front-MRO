import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import { ArrowLeft, Package, Printer, Save, CheckCircle } from 'lucide-react';
import { CycleCountViewProps } from './types';
import { useInventoryCount } from './hooks/useInventoryCount';
import { StatusBadge } from './components/StatusBadge';
import { CountSummaryCards } from './components/CountSummaryCards';
import { CountFilters } from './components/CountFilters';
import { CountInput } from './components/CountInput';
import { generatePrintCountInProgress } from './utils/reportGenerator';

export function CycleCountView({ onBack, onComplete, onSaveProgress, existingCountData }: CycleCountViewProps) {
  const {
    filteredArticles,
    countedArticles,
    pendingArticles,
    discrepancies,
    searchTerm,
    selectedZone,
    countType,
    auditor,
    articles,
    setSearchTerm,
    setSelectedZone,
    setCountType,
    setAuditor,
    handleCountUpdate,
    handleSaveCycleCount,
    handleCompleteCycleCount
  } = useInventoryCount(existingCountData, onComplete, onSaveProgress);

  const handlePrintAll = () => {
    generatePrintCountInProgress({
      articles: filteredArticles,
      countType,
      auditor,
      zone: selectedZone === 'all' ? 'All Zones' : selectedZone,
      date: new Date().toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    });
  };

  const zones = ['all', 'Good Condition', 'Damaged', 'Quarantine'];

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
      <CountSummaryCards
        totalItems={articles.length}
        countedItems={countedArticles.length}
        pendingItems={pendingArticles.length}
        discrepanciesCount={discrepancies.length}
      />

      {/* Filters */}
      <CountFilters
        searchTerm={searchTerm}
        selectedZone={selectedZone}
        countType={countType}
        auditor={auditor}
        zones={zones}
        onSearchChange={setSearchTerm}
        onZoneChange={setSelectedZone}
        onCountTypeChange={setCountType}
        onAuditorChange={setAuditor}
      />

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
                      {article.status && <StatusBadge status={article.status} />}
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