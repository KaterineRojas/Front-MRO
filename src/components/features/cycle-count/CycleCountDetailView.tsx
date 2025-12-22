import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Input } from '../../ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import { ArrowLeft, Printer, Download, CheckCircle, AlertTriangle, Save } from 'lucide-react';
import { CycleCountDetailViewProps } from './types';
import { downloadCycleCountReport } from './utils/excelUtils';
import { StatusBadge } from './components/StatusBadge';
import { AuditHeader } from './components/AuditHeader';
import { ExecutiveSummary } from './components/ExecutiveSummary';
import { useCycleCountAdjustments } from './hooks/useCycleCountAdjustments';

export function CycleCountDetailView({ countData, onBack, onAdjustmentsApplied }: CycleCountDetailViewProps) {
  const accuracy = Math.round((1 - countData.discrepancies / countData.totalItems) * 100);
  const discrepancyArticles = countData.articles.filter(a => a.status === 'discrepancy');
  
  const {
    adjustments,
    adjustmentReasons,
    isAdjustmentsApplied,
    handleAdjustmentChange,
    handleReasonChange,
    handleApplyAdjustments: applyAdjustments
  } = useCycleCountAdjustments(countData);

  const handleApplyAdjustments = () => {
    applyAdjustments(discrepancyArticles, countData, onAdjustmentsApplied);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    downloadCycleCountReport(countData);
  };

  return (
    <div className="space-y-6 print:space-y-4 cycle-count-detail">
      {/* Header */}
      <div className="flex items-center justify-between print:hidden">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Cycle Count
          </Button>
          <div>
            <h1>Cycle Count Audit Report</h1>
            <p className="text-muted-foreground">Detailed inventory count results</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Print Report
          </Button>
          <Button variant="outline" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Download Excel
          </Button>
        </div>
      </div>

      {/* Print Header */}
      <div className="hidden print:block">
        <h1 className="text-3xl font-bold mb-4">Cycle Count Audit Report</h1>
      </div>

      {/* Audit Header */}
      <AuditHeader 
        completedDate={countData.completedDate}
        date={countData.date}
        countType={countData.countType}
        auditor={countData.auditor}
        zone={countData.zone}
      />

      {/* Executive Summary (KPIs) */}
      <ExecutiveSummary 
        accuracy={accuracy}
        totalItems={countData.totalItems}
        discrepancies={countData.discrepancies}
      />

      {/* Discrepancies Table */}
      {discrepancyArticles.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <span>Discrepancies Detail ({discrepancyArticles.length})</span>
              </CardTitle>
              {!isAdjustmentsApplied && (
                <Button variant="default" onClick={handleApplyAdjustments} className="border-2 border-primary">
                  <Save className="h-4 w-4 mr-2" />
                  Apply Adjustments
                </Button>
              )}
              {isAdjustmentsApplied && (
                <Badge variant="default" className="bg-green-600 text-lg px-4 py-2">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Adjustments Applied
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
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
                    <TableHead>Adjustment</TableHead>
                    <TableHead>Reason</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {discrepancyArticles.map((article, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-mono">{article.code}</TableCell>
                      <TableCell>
                        <div>
                          <p>{article.description}</p>
                          <p className="text-xs text-muted-foreground">{article.zone}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">{article.totalRegistered}</TableCell>
                      <TableCell className="text-right">{article.physicalCount}</TableCell>
                      <TableCell><StatusBadge status={article.status} /></TableCell>
                      <TableCell className="max-w-[200px]">
                        <div className="truncate" title={article.observations || '-'}>
                          {article.observations || '-'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={adjustments[article.code] || ''}
                          onChange={(e) => handleAdjustmentChange(article.code, e.target.value)}
                          disabled={isAdjustmentsApplied}
                          className={`w-32 ${isAdjustmentsApplied ? 'bg-muted cursor-not-allowed' : ''}`}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="text"
                          value={adjustmentReasons[article.code] || ''}
                          onChange={(e) => handleReasonChange(article.code, e.target.value)}
                          disabled={isAdjustmentsApplied}
                          placeholder="Enter reason"
                          className={`w-48 ${isAdjustmentsApplied ? 'bg-muted cursor-not-allowed' : ''}`}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Items Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5" />
            <span>All Items Detail ({countData.articles.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
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
                </TableRow>
              </TableHeader>
              <TableBody>
                {countData.articles.map((article, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-mono">{article.code}</TableCell>
                    <TableCell>
                      <div>
                        <p>{article.description}</p>
                        <p className="text-xs text-muted-foreground">{article.zone}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">{article.totalRegistered}</TableCell>
                    <TableCell className="text-right">{article.physicalCount}</TableCell>
                    <TableCell><StatusBadge status={article.status} /></TableCell>
                    <TableCell className="max-w-[200px]">
                      <div className="truncate" title={article.observations || '-'}>
                        {article.observations || '-'}
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