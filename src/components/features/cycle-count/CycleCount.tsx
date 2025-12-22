import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '../../ui/table';
import { Clock, PlayCircle, Printer } from 'lucide-react';
import { useCycleCountHistory, CycleCountRecord } from './hooks/useCycleCountHistory';
import { generatePrintReport, generateExcelReport, generatePrintAllHistory } from './utils/reportGenerator';
import { HistoryTableRow } from './components/HistoryTableRow';

interface CycleCountProps {
  onStartCycleCount: () => void;
  onViewCycleCount: (record: CycleCountRecord) => void;
  onContinueCycleCount?: (record: CycleCountRecord) => void;
  onCompleteCycleCount?: (completedData: any) => void;
}

export function CycleCount({ onStartCycleCount, onViewCycleCount, onContinueCycleCount }: CycleCountProps) {
  const { history } = useCycleCountHistory();

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
    
    onStartCycleCount();
  };

  const handleViewReport = (record: CycleCountRecord) => {
    onViewCycleCount(record);
  };

  const handlePrintReport = (record: CycleCountRecord) => {
    generatePrintReport(record);
  };

  const handleDownloadReport = (record: CycleCountRecord) => {
    generateExcelReport(record);
  };

  const handlePrintAllHistory = () => {
    generatePrintAllHistory(history);
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
              {history.map((record) => (
                <HistoryTableRow
                  key={record.id}
                  record={record}
                  onView={handleViewReport}
                  onContinue={onContinueCycleCount}
                  onPrint={handlePrintReport}
                  onDownload={handleDownloadReport}
                />
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}