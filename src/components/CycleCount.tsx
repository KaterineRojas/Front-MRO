import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { 
  Calculator, 
  PlayCircle, 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Printer,
  Download,
  Calendar,
  TrendingUp,
  Package
} from 'lucide-react';

interface CycleCountRecord {
  id: number;
  date: string;
  startedBy: string;
  status: 'in-progress' | 'completed';
  totalItems: number;
  counted: number;
  discrepancies: number;
  completedDate?: string;
}

interface CycleCountProps {
  onStartCycleCount: () => void;
  onViewCycleCount: (record: CycleCountRecord) => void;
}

const mockCycleCountHistory: CycleCountRecord[] = [
  {
    id: 1,
    date: '2025-09-25',
    startedBy: 'John Smith',
    status: 'completed',
    totalItems: 125,
    counted: 125,
    discrepancies: 8,
    completedDate: '2025-09-25'
  },
  {
    id: 2,
    date: '2025-08-28',
    startedBy: 'Jane Doe',
    status: 'completed',
    totalItems: 118,
    counted: 118,
    discrepancies: 5,
    completedDate: '2025-08-28'
  },
  {
    id: 3,
    date: '2025-07-30',
    startedBy: 'John Smith',
    status: 'completed',
    totalItems: 110,
    counted: 110,
    discrepancies: 12,
    completedDate: '2025-07-30'
  }
];

export function CycleCount({ onStartCycleCount, onViewCycleCount }: CycleCountProps) {
  const [history] = useState<CycleCountRecord[]>(mockCycleCountHistory);
  const [activeCycleCount, setActiveCycleCount] = useState<CycleCountRecord | null>(null);

  // Check if there's an active cycle count
  const hasActiveCycleCount = activeCycleCount !== null;
  const lastCompletedCount = history.find(h => h.status === 'completed');

  const handleStartCycleCount = () => {
    // Create new cycle count
    const newCycleCount: CycleCountRecord = {
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      startedBy: 'John Smith',
      status: 'in-progress',
      totalItems: 0,
      counted: 0,
      discrepancies: 0
    };
    setActiveCycleCount(newCycleCount);
    onStartCycleCount();
  };

  const handleViewReport = (record: CycleCountRecord) => {
    onViewCycleCount(record);
  };

  const handlePrintLastReport = () => {
    window.print();
  };

  const handleDownloadReport = (record: CycleCountRecord) => {
    // Create CSV content for the report
    const csvContent = [
      ['Cycle Count Report'],
      ['Date:', record.date],
      ['Started By:', record.startedBy],
      ['Status:', record.status],
      ['Total Items:', record.totalItems.toString()],
      ['Items Counted:', record.counted.toString()],
      ['Discrepancies:', record.discrepancies.toString()],
      ['Accuracy Rate:', `${Math.round((1 - record.discrepancies / record.totalItems) * 100)}%`],
      ['Completed Date:', record.completedDate || 'N/A'],
      [],
      ['Generated on:', new Date().toLocaleString()]
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `cycle-count-report-${record.date}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Cycle Count</h1>
          <p className="text-muted-foreground">
            Physical inventory count verification and history
          </p>
        </div>
      </div>

      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Last Count</p>
                    <p className="text-lg">
                      {lastCompletedCount ? lastCompletedCount.date : 'No data'}
                    </p>
                  </div>
                  <Calendar className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Items Counted</p>
                    <p className="text-2xl">
                      {lastCompletedCount ? lastCompletedCount.counted : '0'}
                    </p>
                  </div>
                  <Package className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Discrepancies</p>
                    <p className="text-2xl text-red-600">
                      {lastCompletedCount ? lastCompletedCount.discrepancies : '0'}
                    </p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Accuracy</p>
                    <p className="text-2xl text-green-600">
                      {lastCompletedCount 
                        ? `${Math.round((1 - lastCompletedCount.discrepancies / lastCompletedCount.totalItems) * 100)}%`
                        : '0%'}
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Active or New Cycle Count */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calculator className="h-5 w-5" />
                  <span>Current Cycle Count</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {hasActiveCycleCount ? (
                  <>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Status</span>
                        <Badge variant="outline" className="text-orange-600 border-orange-600">
                          <Clock className="h-3 w-3 mr-1" />
                          In Progress
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Started</span>
                        <span>{activeCycleCount.date}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Started By</span>
                        <span>{activeCycleCount.startedBy}</span>
                      </div>
                    </div>
                    <Button className="w-full" onClick={handleStartCycleCount}>
                      <PlayCircle className="h-4 w-4 mr-2" />
                      Continue Count
                    </Button>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-muted-foreground">
                      No active cycle count. Start a new count to verify physical inventory against system records.
                    </p>
                    <Button className="w-full" onClick={handleStartCycleCount}>
                      <PlayCircle className="h-4 w-4 mr-2" />
                      Start New Cycle Count
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>Last Completed Count</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {lastCompletedCount ? (
                  <>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Date</span>
                        <span>{lastCompletedCount.date}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Total Items</span>
                        <span>{lastCompletedCount.totalItems}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Discrepancies</span>
                        <Badge variant="destructive">{lastCompletedCount.discrepancies}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Accuracy Rate</span>
                        <span className="text-green-600">
                          {Math.round((1 - lastCompletedCount.discrepancies / lastCompletedCount.totalItems) * 100)}%
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <Button 
                        variant="outline"
                        onClick={handlePrintLastReport}
                      >
                        <Printer className="h-4 w-4 mr-2" />
                        Print
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => handleDownloadReport(lastCompletedCount)}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                      <Button 
                        onClick={() => handleViewReport(lastCompletedCount)}
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        View
                      </Button>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No completed cycle counts yet. Start your first count to begin tracking inventory accuracy.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Summary Chart */}
          {lastCompletedCount && (
            <Card>
              <CardHeader>
                <CardTitle>Recent Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {history.slice(0, 5).map((record) => {
                    const accuracy = Math.round((1 - record.discrepancies / record.totalItems) * 100);
                    return (
                      <div key={record.id} className="flex items-center space-x-4">
                        <div className="w-24 text-sm">{record.date}</div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <div className="w-full bg-muted rounded-full h-2">
                              <div 
                                className="bg-green-600 h-2 rounded-full" 
                                style={{ width: `${accuracy}%` }}
                              />
                            </div>
                            <span className="text-sm w-12">{accuracy}%</span>
                          </div>
                          <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                            <span>{record.totalItems} items</span>
                            <span>{record.discrepancies} discrepancies</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
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
                    <TableHead>Started By</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Total Items</TableHead>
                    <TableHead>Counted</TableHead>
                    <TableHead>Discrepancies</TableHead>
                    <TableHead>Accuracy</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map((record) => {
                    const accuracy = record.status === 'completed'
                      ? Math.round((1 - record.discrepancies / record.totalItems) * 100)
                      : 0;
                    
                    return (
                      <TableRow key={record.id}>
                        <TableCell>{record.date}</TableCell>
                        <TableCell>{record.startedBy}</TableCell>
                        <TableCell>
                          {record.status === 'completed' ? (
                            <Badge variant="default" className="bg-green-600">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Completed
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-orange-600 border-orange-600">
                              <Clock className="h-3 w-3 mr-1" />
                              In Progress
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>{record.totalItems}</TableCell>
                        <TableCell>{record.counted}</TableCell>
                        <TableCell>
                          {record.discrepancies > 0 ? (
                            <Badge variant="destructive">{record.discrepancies}</Badge>
                          ) : (
                            <Badge variant="default" className="bg-green-600">0</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className={accuracy >= 95 ? 'text-green-600' : 'text-orange-600'}>
                            {accuracy}%
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewReport(record)}
                            >
                              <FileText className="h-4 w-4 mr-1" />
                              View
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handlePrintLastReport}
                            >
                              <Printer className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDownloadReport(record)}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}