import { Card, CardContent, CardHeader, CardTitle } from '../../../ui/card';
import { Button } from '../../../ui/button';
import { Badge } from '../../../ui/badge';
import { Input } from '../../../ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../ui/table';
import { ArrowLeft, Printer, Download, CheckCircle, AlertTriangle, Save, Loader2 } from 'lucide-react';
import { CycleCountDetailViewProps } from '../types';
import { downloadCycleCountReport } from '../utils/excelUtils';
import { calculatePeriod } from '../utils/periodUtils';
import { StatusBadge } from '../components/StatusBadge';
import { AuditHeader } from '../components/AuditHeader';
import { ExecutiveSummary } from '../components/ExecutiveSummary';
import { useCycleCountAdjustments } from '../hooks/useCycleCountAdjustments';
import { useState, useEffect } from 'react';
import { getCycleCountDetail, getCycleCountStatistics, mapEntryToArticle, mapStatusNameToUIStatus } from '../services/cycleCountService';
import { useAppSelector } from '../../../../store/hooks';

export function CycleCountDetailView({ countData, onBack, onAdjustmentsApplied, keeperName }: CycleCountDetailViewProps & { keeperName?: string }) {
  const [isLoadingFromApi, setIsLoadingFromApi] = useState(false);
  const [loadedCountData, setLoadedCountData] = useState(countData);
  const user = useAppSelector(state => state.auth.user);
  
  // Use loadedCountData (from API or passed in)
  const currentCountData = loadedCountData || countData;
  
  // IMPORTANT: Call ALL hooks before any early returns
  // This hook must be called even if currentCountData is null (will handle it inside)
  const {
    adjustments,
    adjustmentReasons,
    isAdjustmentsApplied,
    handleAdjustmentChange,
    handleReasonChange,
    handleApplyAdjustments: applyAdjustments
  } = useCycleCountAdjustments(currentCountData);
  
  // Load from API if countData has an id but no articles
  useEffect(() => {
    const loadFromApi = async () => {
      console.log('🔧 [CycleCountDetailView] useEffect triggered with countData:', countData);
      
      if (countData?.id && (!countData.articles || countData.articles.length === 0)) {
        try {
          setIsLoadingFromApi(true);
          console.log('🔧 [CycleCountDetailView] Loading count data from API for ID:', countData.id);
          
          // Fetch full cycle count details
          const cycleCountDetail = await getCycleCountDetail(countData.id);
          console.log('✅ [CycleCountDetailView] Fetched cycle count detail:', cycleCountDetail);
          
          // Fetch statistics
          const stats = await getCycleCountStatistics(countData.id);
          console.log('✅ [CycleCountDetailView] Fetched statistics:', stats);
          
          // Map entries to articles
          const mappedArticles = cycleCountDetail.entries.map(entry => 
            mapEntryToArticle(entry, cycleCountDetail.zoneName || 'Good Condition')
          );
          
          console.log('🔧 [CycleCountDetailView] Mapped articles:', {
            count: mappedArticles.length,
            first: mappedArticles[0],
            firstImageUrl: mappedArticles[0]?.imageUrl,
            articlesWithImages: mappedArticles.filter(a => a.imageUrl).length
          });
          
          // Transform to CountedArticle format for the detail view
          const countedArticles = mappedArticles.map(article => ({
            code: article.code,
            entryId: (article as any).entryId || (article as any).id,
            description: article.description,
            zone: article.zone,
            totalRegistered: article.totalRegistered,
            physicalCount: article.physicalCount || 0,
            status: article.status || 'match',
            observations: article.observations,
            imageUrl: article.imageUrl
          }));
          
          // Determine countType from countData param or countName from API
          let countType: 'Annual' | 'Biannual' | 'Spot Check' = currentCountData?.countType || 'Annual';
          
          // If we don't have countType from param, try to determine from countName
          if (!currentCountData?.countType && cycleCountDetail.countName) {
            const countNameLower = cycleCountDetail.countName.toLowerCase();
            if (countNameLower.includes('biannual') || countNameLower.includes('semiannual')) {
              countType = 'Biannual';
            } else if (countNameLower.includes('spot') || countNameLower.includes('spot check')) {
              countType = 'Spot Check';
            }
          }
          
          // Build complete count data
          const completeCountData = {
            id: cycleCountDetail.id,
            date: new Date(cycleCountDetail.createdAt).toISOString().split('T')[0],
            completedDate: cycleCountDetail.completedAt 
              ? new Date(cycleCountDetail.completedAt).toLocaleString('sv-SE').replace('T', ' ').substring(0, 19)
              : undefined,
            zone: cycleCountDetail.zoneName || 'All Zones',
            status: mapStatusNameToUIStatus(cycleCountDetail.statusName),
            countType,
            auditor: keeperName || cycleCountDetail.completedByName || cycleCountDetail.createdByName,
            periodo: calculatePeriod(countType, new Date(cycleCountDetail.createdAt).toISOString().split('T')[0]),
            articles: countedArticles,
            totalItems: stats.totalEntries,
            counted: stats.countedEntries,
            discrepancies: stats.entriesWithVariance,
            adjustmentsApplied: false,
            countedByUserId: Number(user?.id) || 0 // Add userId for recount operations
          };
          
          setLoadedCountData(completeCountData);
          console.log('✅ [CycleCountDetailView] Loaded count data from API');
        } catch (error) {
          console.error('❌ [CycleCountDetailView] Error loading from API:', error);
          // Keep existing countData on error
        } finally {
          setIsLoadingFromApi(false);
        }
      }
    };
    
    loadFromApi();
  }, [countData?.id]);
  
  // NOW we can do early returns after all hooks are called
  if (isLoadingFromApi) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <Loader2 className="h-12 w-12 animate-spin text-muted-foreground mb-4" />
        <p className="text-lg text-muted-foreground">Loading cycle count details...</p>
      </div>
    );
  }
  
  if (!currentCountData) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <p className="text-lg text-muted-foreground">No count data available</p>
        <Button onClick={onBack} className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>
    );
  }
  
  // Validate that we have articles array
  if (!currentCountData.articles || !Array.isArray(currentCountData.articles)) {
    console.error('❌ [CycleCountDetailView] No articles in currentCountData:', currentCountData);
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <p className="text-lg text-muted-foreground">No articles data available</p>
        <Button onClick={onBack} className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>
    );
  }
  
  const accuracy = Math.round((1 - currentCountData.discrepancies / currentCountData.totalItems) * 100);
  const discrepancyArticles = currentCountData.articles.filter(a => a.status === 'discrepancy');

  // Log status to help debug
  console.log('🔍 [CycleCountDetailView] Current cycle count status:', {
    status: currentCountData.status,
    id: currentCountData.id,
    isCompleted: currentCountData.status === 'completed',
    hasDiscrepancies: discrepancyArticles.length
  });

  const handleApplyAdjustments = () => {
    applyAdjustments(discrepancyArticles, currentCountData, onAdjustmentsApplied);
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

      </div>

      {/* Print Header */}
      <div className="hidden print:block">
        <h1 className="text-3xl font-bold mb-4">Cycle Count Audit Report</h1>
      </div>

      {/* Audit Header */}
      <AuditHeader 
        completedDate={currentCountData.completedDate}
        date={currentCountData.date}
        countType={currentCountData.countType}
        auditor={currentCountData.auditor}
        zone={currentCountData.zone}
        periodo={currentCountData.periodo}
      />

      {/* Executive Summary (KPIs) */}
      <ExecutiveSummary 
        accuracy={accuracy}
        totalItems={currentCountData.totalItems}
        discrepancies={currentCountData.discrepancies}
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
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {discrepancyArticles.map((article, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-mono">{article.code}</TableCell>
                      <TableCell>
                        <div>
                          <p>{article.description}</p>
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
      )}

      {/* All Items Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5" />
            <span>All Items Detail ({currentCountData.articles.length})</span>
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
                {currentCountData.articles.map((article, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-mono">{article.code}</TableCell>
                    
                    <TableCell>
                      <div>
                        <p>{article.description}</p>
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
