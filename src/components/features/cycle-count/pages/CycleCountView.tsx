import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../ui/card';
import { Button } from '../../../ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../ui/table';
import { ArrowLeft, Package, Printer, Save, CheckCircle } from 'lucide-react';
import { CycleCountViewProps } from '../types';
import { useInventoryCount } from '../hooks/useInventoryCount';
import { StatusBadge } from '../components/StatusBadge';
import { CountSummaryCards } from '../components/CountSummaryCards';
import { CountFilters } from '../components/CountFilters';
import { CountInput } from '../components/CountInput';
import { generatePrintCountInProgress } from '../utils/reportGenerator';
import { ResolveDiscrepanciesModal } from '../modals/ResolveDiscrepanciesModal';
import { recordCycleCountEntry, completeCycleCount, recordBatchCount, getCycleCountDetail, resumeCycleCount } from '../services/cycleCountService';
import { toast } from 'sonner';
import { useAppSelector } from '../../../../store/hooks';

export function CycleCountView({ onBack, onComplete, onSaveProgress, existingCountData, initialConfig }: CycleCountViewProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const user = useAppSelector(state => state.auth.user);
  
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
    handleCountUpdate,
    handleSaveCycleCount,
    handleCompleteCycleCount,
    sendPendingCounts
  } = useInventoryCount(existingCountData, onComplete, onSaveProgress, initialConfig);

  const handleCompleteClick = async () => {
    // Check if there are pending items - must be counted first
    console.log('🔍 [handleCompleteClick] Total articles:', articles.length);
    console.log('🔍 [handleCompleteClick] Pending articles:', pendingArticles.length);
    console.log('🔍 [handleCompleteClick] Counted articles:', countedArticles.length);
    console.log('🔍 [handleCompleteClick] Pending items:', pendingArticles);
    
    if (pendingArticles.length > 0) {
      toast.error(`Cannot complete: ${pendingArticles.length} items still need to be counted in the table`);
      return;
    }

    // First, send any pending counts to backend (without pausing/navigating)
    try {
      await sendPendingCounts();
    } catch (error) {
      console.error('Error saving counts before completion:', error);
      toast.error('Failed to save counts. Please try again.');
      return;
    }

    if (discrepancies.length > 0) {
      // Open modal to resolve discrepancies with final values
      setIsModalOpen(true);
    } else {
      // All items counted and no discrepancies, complete directly
      handleCompleteCycleCount();
    }
  };

  const handleConfirmDiscrepancies = async (recounts: Record<string, { newCount: number; reason: string }>) => {
    if (!existingCountData?.id) {
      toast.error('Cycle count ID not found');
      return;
    }

    console.log('🔍 [handleConfirmDiscrepancies] Starting...');
    console.log('🔍 [handleConfirmDiscrepancies] Discrepancies:', discrepancies);
    console.log('🔍 [handleConfirmDiscrepancies] Recounts received:', recounts);

    setIsSubmitting(true);
    try {
      // Record final counts for discrepancy items only
      const discrepanciesWithRecounts = discrepancies.filter(article => {
        const hasRecount = recounts[article.code]?.newCount !== undefined;
        console.log(`🔍 Article ${article.code}: hasRecount=${hasRecount}, recount=`, recounts[article.code]);
        return hasRecount;
      });

      console.log('🔍 [handleConfirmDiscrepancies] Discrepancies with recounts:', discrepanciesWithRecounts.length);

      const recountPromises = discrepanciesWithRecounts.map(article => {
        const recount = recounts[article.code];
        console.log(`🔍 Recording recount for ${article.code}:`, {
          entryId: article.entryId,
          physicalCount: recount.newCount,
          notes: recount.reason,
          countedByUserId: user?.id
        });
        return recordCycleCountEntry({
          entryId: article.entryId!,
          physicalCount: recount.newCount,
          notes: recount.reason || '',
         countedByUserId: Number(user?.id) || 0
        });
      });

      console.log('🔍 [handleConfirmDiscrepancies] Sending', recountPromises.length, 'recounts...');
      await Promise.all(recountPromises);
      console.log('✅ [handleConfirmDiscrepancies] All recounts sent successfully');
      
      // Now complete the cycle count directly (without using hook's handler)
      console.log('🔍 [handleConfirmDiscrepancies] Calling completeCycleCount...');
      await completeCycleCount(existingCountData.id);
      
      toast.success('Cycle count completed successfully!');
      setIsModalOpen(false);
      
      // Navigate back to history
      if (onComplete) {
        onComplete({
          id: existingCountData.id,
          date: new Date().toISOString().split('T')[0],
          zone: selectedZone,
          status: 'completed' as const,
          countType,
          auditor,
          totalItems: articles.length,
          counted: countedArticles.length,
          discrepancies: 0, // All resolved now
          articles: articles.map(a => ({
            id: a.id,
            type: a.type,
            code: a.code,
            description: a.description,
            zone: a.zone,
            totalRegistered: a.totalRegistered,
            physicalCount: a.physicalCount || 0,
            status: 'match' as const,
            observations: a.observations
          }))
        } as any );
      }
    } catch (error) {
      console.error('Error completing cycle count:', error);
      toast.error('Failed to complete cycle count. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
  
  // Check if there are no articles for the selected zone
  const hasNoArticles = filteredArticles.length === 0 && articles.length === 0;

  return (
    <div className="space-y-6">
      {hasNoArticles && (
        <div className="bg-yellow-50 dark:bg-yellow-900/30 border-l-4 border-yellow-400 dark:border-yellow-600 p-4 rounded">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400 dark:text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                <strong>No items found in the selected zone.</strong> The warehouse does not have any items in the <strong>{selectedZone === 'all' ? 'All Zones' : selectedZone}</strong> zone. Please go back and select a different zone.
              </p>
            </div>
          </div>
        </div>
      )}
      
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
          <Button onClick={handleCompleteClick}>
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

      {/* Resolve Discrepancies Modal */}
      <ResolveDiscrepanciesModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        discrepancies={discrepancies as any}
        onConfirm={handleConfirmDiscrepancies}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
