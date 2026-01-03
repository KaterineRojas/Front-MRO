import { Card, CardContent, CardHeader, CardTitle } from '../../../ui/card';
import { Button } from '../../../ui/button';
import { Table, TableBody, TableHead, TableHeader, TableRow, TableCell } from '../../../ui/table';
import { Clock, PlayCircle, Printer, Loader2 } from 'lucide-react';
import { useCycleCountHistory, CycleCountRecord } from '../hooks/useCycleCountHistory';
import { generatePrintReport, generateExcelReport, generatePrintAllHistory } from '../utils/reportGenerator';
import { HistoryTableRow } from '../components/HistoryTableRow';
import { StartCycleCountModal } from '../modals/StartCycleCountModal';
import { useState } from 'react';

interface CycleCountProps {
  onStartCycleCount: (data: { countName: string; zone: string; countType: 'Annual' | 'Biannual' | 'Spot Check'; auditor: string }) => void;
  onViewCycleCount: (record: CycleCountRecord) => void;
  onContinueCycleCount?: (record: CycleCountRecord) => void;
  onCompleteCycleCount?: (completedData: any) => void;
  keeperName: string;
}

export function CycleCount({ onStartCycleCount, onViewCycleCount, onContinueCycleCount, keeperName }: CycleCountProps) {
  const { history, isLoading } = useCycleCountHistory();
  const [showStartModal, setShowStartModal] = useState(false);

  const handleStartCycleCount = () => {
    // Check if there's already an in-progress count
    const inProgressCount = history.find(record => record.status === 'in-progress');
    
    if (inProgressCount) {
      const confirmStart = window.confirm(
        'There is already a cycle count in progress. Starting a new count will keep the existing count. Do you want to continue?'
      );
      
      if (!confirmStart) {
        return;
      }
    }
    
    setShowStartModal(true);
  };

  const handleConfirmStart = (data: { countName: string; zone: string; countType: 'Annual' | 'Biannual' | 'Spot Check'; auditor: string }) => {
    onStartCycleCount(data);
  };

  const handleViewReport = (record: CycleCountRecord) => {
    onViewCycleCount(record);
  };

  const handlePrintReport = async (record: CycleCountRecord) => {
    // Load full record with keeperName as auditor
    const { getCycleCountWithArticles } = await import('../services/cycleCountService');
    try {
      const fullRecord = await getCycleCountWithArticles(record.id, keeperName);
      generatePrintReport(fullRecord);
    } catch (error) {
      console.error('Error loading cycle count for printing:', error);
      // Fallback to the record as-is
      generatePrintReport(record);
    }
  };

  const handleDownloadReport = async (record: CycleCountRecord) => {
    // Load full record with keeperName as auditor
    const { getCycleCountWithArticles } = await import('../services/cycleCountService');
    try {
      const fullRecord = await getCycleCountWithArticles(record.id, keeperName);
      generateExcelReport(fullRecord);
    } catch (error) {
      console.error('Error loading cycle count for download:', error);
      // Fallback to the record as-is
      generateExcelReport(record);
    }
  };

  const handlePrintAllHistory = async () => {
    // Need to load full article details for each cycle count before printing
    const { getCycleCountWithArticles } = await import('../services/cycleCountService');
    
    try {
      const recordsWithArticles = await Promise.all(
        history.map(async (record) => {
          // Load articles from API, use keeperName as auditor
          const fullRecord = await getCycleCountWithArticles(record.id, keeperName);
          return fullRecord;
        })
      );
      
      generatePrintAllHistory(recordsWithArticles);
    } catch (error) {
      console.error('Error loading cycle count details for printing:', error);
      alert('Failed to load cycle count details for printing. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cycle Count</h1>
          <p className="text-muted-foreground">
            Physical inventory count verification and history
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handlePrintAllHistory} variant="outline">
            <Printer className="h-4 w-4 mr-2" />
            Print All
          </Button>
          <Button onClick={handleStartCycleCount}>
            <PlayCircle className="h-4 w-4 mr-2" />
            Start New Cycle Count
          </Button>
        </div>
      </div>

      {/* History Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Cycle Count History</span>
            </span>
            <span className="text-sm text-muted-foreground">
              {history.length} total counts
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Zone</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Total Items</TableHead>
                <TableHead>Counted</TableHead>
                <TableHead>Discrepancies</TableHead>
                <TableHead>Accuracy</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={9} className="h-32 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">Loading cycle counts...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : history.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="h-32 text-center text-muted-foreground">
                    No cycle counts found
                  </TableCell>
                </TableRow>
              ) : (
                history.map((record) => (
                  <HistoryTableRow
                    key={record.id}
                    record={record}
                    onView={handleViewReport}
                    onContinue={onContinueCycleCount}
                    onPrint={handlePrintReport}
                    onDownload={handleDownloadReport}
                  />
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <StartCycleCountModal
        open={showStartModal}
        onClose={() => setShowStartModal(false)}
        onConfirm={handleConfirmStart}
        keeperName={keeperName}
      />
    </div>
  );
}
