import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Input } from '../../ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import { ArrowLeft, Printer, Download, CheckCircle, AlertTriangle, TrendingUp, Save } from 'lucide-react';
import * as XLSX from 'xlsx';

interface CountedArticle {
  code: string;
  description: string;
  zone: string;
  totalRegistered: number;
  physicalCount: number;
  status: 'match' | 'discrepancy';
  observations?: string;
  adjustment?: number;
  adjustmentReason?: string;
}

interface DiscrepancyAdjustment {
  code: string;
  adjustedQuantity: number;
  reason: string;
}

interface CycleCountDetailData {
  id: number;
  date: string;
  completedDate?: string;
  zone: string;
  countType: 'Annual' | 'Biannual' | 'Spot Check';
  auditor: string;
  articles: CountedArticle[];
  totalItems: number;
  counted: number;
  discrepancies: number;
  adjustmentsApplied?: boolean;
}

interface CycleCountDetailViewProps {
  countData: CycleCountDetailData;
  onBack: () => void;
  onAdjustmentsApplied?: (updatedData: CycleCountDetailData) => void;
}

export function CycleCountDetailView({ countData, onBack, onAdjustmentsApplied }: CycleCountDetailViewProps) {
  const accuracy = Math.round((1 - countData.discrepancies / countData.totalItems) * 100);
  const discrepancyArticles = countData.articles.filter(a => a.status === 'discrepancy');
  
  // State for adjustments - Initialize from existing data if adjustments were already applied
  const [adjustments, setAdjustments] = React.useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    countData.articles.forEach(article => {
      if (article.adjustment !== undefined) {
        initial[article.code] = article.adjustment.toString();
      }
    });
    return initial;
  });
  
  const [adjustmentReasons, setAdjustmentReasons] = React.useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    countData.articles.forEach(article => {
      if (article.adjustmentReason) {
        initial[article.code] = article.adjustmentReason;
      }
    });
    return initial;
  });
  
  const [isAdjustmentsApplied, setIsAdjustmentsApplied] = React.useState(countData.adjustmentsApplied || false);

  const handleAdjustmentChange = (code: string, value: string) => {
    // Don't allow negative numbers
    const numValue = parseInt(value);
    if (value !== '' && (isNaN(numValue) || numValue < 0)) {
      return;
    }
    
    setAdjustments(prev => ({
      ...prev,
      [code]: value
    }));
  };

  const handleReasonChange = (code: string, value: string) => {
    setAdjustmentReasons(prev => ({
      ...prev,
      [code]: value
    }));
  };

  const handleApplyAdjustments = () => {
    const adjustmentsToApply: DiscrepancyAdjustment[] = [];
    
    discrepancyArticles.forEach(article => {
      const adjustedQty = adjustments[article.code];
      const reason = adjustmentReasons[article.code];
      
      if (adjustedQty && adjustedQty.trim() !== '') {
        const qty = parseInt(adjustedQty);
        if (!isNaN(qty) && qty >= 0) {
          adjustmentsToApply.push({
            code: article.code,
            adjustedQuantity: qty,
            reason: reason || 'Adjusted based on cycle count'
          });
        }
      }
    });
    
    if (adjustmentsToApply.length === 0) {
      alert('Please enter at least one adjustment quantity.');
      return;
    }
    
    // Here you would typically send this to your backend
    console.log('Applying adjustments:', adjustmentsToApply);
    
    const confirmMessage = `You are about to adjust ${adjustmentsToApply.length} item(s). This will update the inventory quantities. Do you want to proceed?`;
    
    if (window.confirm(confirmMessage)) {
      // Simulate API call
      alert('Inventory adjustments have been applied successfully!');
      
      // Don't clear the adjustments, just mark them as applied
      setIsAdjustmentsApplied(true);
      
      // Update the countData with adjustments
      const updatedArticles = countData.articles.map(article => {
        const adjustment = adjustments[article.code];
        const reason = adjustmentReasons[article.code];
        if (adjustment && !isNaN(parseInt(adjustment))) {
          return {
            ...article,
            adjustment: parseInt(adjustment),
            adjustmentReason: reason || 'Adjusted based on cycle count'
          };
        }
        return article;
      });
      
      const updatedData: CycleCountDetailData = {
        ...countData,
        articles: updatedArticles,
        adjustmentsApplied: true
      };
      
      if (onAdjustmentsApplied) {
        onAdjustmentsApplied(updatedData);
      }
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const accuracy = Math.round((1 - countData.discrepancies / countData.totalItems) * 100);
    const discrepancyArticles = countData.articles.filter(a => a.status === 'discrepancy');
    
    // Create Excel workbook
    const wb = XLSX.utils.book_new();
    
    // Create header data
    const headerData = [
      ['CYCLE COUNT AUDIT REPORT'],
      [''],
      ['AUDIT HEADER'],
      ['Date and Time:', countData.completedDate || countData.date],
      ['Count Type:', countData.countType],
      ['Auditor Responsible:', countData.auditor],
      ['Zone:', countData.zone],
      [''],
      ['EXECUTIVE SUMMARY'],
      ['Inventory Accuracy:', `${accuracy}%`],
      ['Total Items Reviewed:', countData.totalItems.toString()],
      ['Total Discrepancies:', countData.discrepancies.toString()],
      [''],
    ];
    
    // Add discrepancies section
    const discrepanciesData = [
      ['DISCREPANCIES DETAIL'],
      ['Code', 'Item', 'Zone', 'Total Registered', 'Physical Count', 'Status', 'Observations'],
      ...discrepancyArticles.map(article => [
        article.code,
        article.description,
        article.zone,
        article.totalRegistered,
        article.physicalCount,
        article.status,
        article.observations || ''
      ]),
      [''],
    ];
    
    // Add all items section
    const allItemsData = [
      ['ALL ITEMS DETAIL'],
      ['Code', 'Item', 'Zone', 'Total Registered', 'Physical Count', 'Status', 'Observations'],
      ...countData.articles.map(article => [
        article.code,
        article.description,
        article.zone,
        article.totalRegistered,
        article.physicalCount,
        article.status,
        article.observations || ''
      ]),
      [''],
      ['Generated on:', new Date().toLocaleString()]
    ];
    
    // Combine all data
    const allData = [...headerData, ...discrepanciesData, ...allItemsData];
    
    // Create worksheet
    const ws = XLSX.utils.aoa_to_sheet(allData);
    
    // Set column widths
    ws['!cols'] = [
      { wch: 25 }, // Code
      { wch: 35 }, // Item
      { wch: 18 }, // Zone
      { wch: 18 }, // Total Registered
      { wch: 18 }, // Physical Count
      { wch: 15 }, // Status
      { wch: 40 }  // Observations
    ];
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Cycle Count Report');
    
    // Generate Excel file
    XLSX.writeFile(wb, `cycle-count-report-${countData.date}.xlsx`);
  };

  const getStatusBadge = (status: 'match' | 'discrepancy') => {
    if (status === 'match') {
      return <Badge variant="default" className="bg-green-600">Match</Badge>;
    } else {
      return <Badge variant="destructive">Discrepancy</Badge>;
    }
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
      <Card>
        <CardHeader>
          <CardTitle>Audit Header</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Date and Time</p>
              <p className="text-lg">{countData.completedDate || countData.date}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Count Type</p>
              <p className="text-lg">{countData.countType}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Auditor Responsible</p>
              <p className="text-lg">{countData.auditor}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Zone</p>
              <p className="text-lg">{countData.zone}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Executive Summary (KPIs) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Executive Summary</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">Inventory Accuracy</p>
              <p className={`text-4xl ${accuracy >= 95 ? 'text-green-600' : 'text-orange-600'}`}>
                {accuracy}%
              </p>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">Total Items Reviewed</p>
              <p className="text-4xl">{countData.totalItems}</p>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">Total Discrepancies</p>
              <p className="text-4xl text-red-600">{countData.discrepancies}</p>
            </div>
          </div>
        </CardContent>
      </Card>

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
                      <TableCell>{getStatusBadge(article.status)}</TableCell>
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
                    <TableCell>{getStatusBadge(article.status)}</TableCell>
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