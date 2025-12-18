import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import { 
  Clock, 
  CheckCircle, 
  PlayCircle, 
  FileText, 
  Printer,
  Download
} from 'lucide-react';
import * as XLSX from 'xlsx';

interface CountedArticle {
  code: string;
  description: string;
  zone: string;
  totalRegistered: number;
  physicalCount: number;
  status: 'match' | 'discrepancy';
  observations?: string;
}

interface CycleCountRecord {
  id: number;
  date: string;
  completedDate?: string;
  zone: string;
  status: 'in-progress' | 'completed';
  countType: 'Annual' | 'Biannual' | 'Spot Check';
  auditor: string;
  totalItems: number;
  counted: number;
  discrepancies: number;
  articles: CountedArticle[];
}

interface CycleCountProps {
  onStartCycleCount: () => void;
  onViewCycleCount: (record: CycleCountRecord) => void;
  onContinueCycleCount?: (record: CycleCountRecord) => void;
  onCompleteCycleCount?: (completedData: any) => void;
}

const mockCycleCountHistory: CycleCountRecord[] = [
  {
    id: 1,
    date: '2025-09-25',
    completedDate: '2025-09-25 14:30:00',
    zone: 'All Zones',
    status: 'completed',
    countType: 'Annual',
    auditor: 'Felicia',
    totalItems: 7,
    counted: 7,
    discrepancies: 2,
    articles: [
      {
        code: 'AMX01-ZGC-R01-L04-B01',
        description: 'Premium Electronic Components',
        zone: 'Good Condition',
        totalRegistered: 25,
        physicalCount: 23,
        status: 'discrepancy',
        observations: 'Found 2 units missing from expected count'
      },
      {
        code: 'AMX01-ZGC-R02-L03-B05',
        description: 'Digital Multimeter Pro',
        zone: 'Good Condition',
        totalRegistered: 15,
        physicalCount: 15,
        status: 'match'
      },
      {
        code: 'AMX01-ZDM-R01-L02-B03',
        description: 'Cracked Display Panel',
        zone: 'Damaged',
        totalRegistered: 8,
        physicalCount: 8,
        status: 'match'
      },
      {
        code: 'AMX01-ZDM-R03-L01-B02',
        description: 'Used Battery Pack',
        zone: 'Damaged',
        totalRegistered: 12,
        physicalCount: 14,
        status: 'discrepancy',
        observations: 'Found 2 additional units not previously registered'
      },
      {
        code: 'AMX01-ZQT-R01-L01-B01',
        description: 'Unverified Components',
        zone: 'Quarantine',
        totalRegistered: 6,
        physicalCount: 6,
        status: 'match'
      },
      {
        code: 'AMX01-ZGC-R03-L02-B04',
        description: 'Industrial Sensors',
        zone: 'Good Condition',
        totalRegistered: 32,
        physicalCount: 32,
        status: 'match'
      },
      {
        code: 'AMX01-ZQT-R02-L03-B01',
        description: 'Testing Equipment',
        zone: 'Quarantine',
        totalRegistered: 4,
        physicalCount: 4,
        status: 'match'
      }
    ]
  },
  {
    id: 2,
    date: '2025-08-28',
    completedDate: '2025-08-28 16:45:00',
    zone: 'Good Condition',
    status: 'completed',
    countType: 'Biannual',
    auditor: 'Marcus',
    totalItems: 7,
    counted: 7,
    discrepancies: 1,
    articles: [
      {
        code: 'AMX01-ZGC-R01-L04-B01',
        description: 'Premium Electronic Components',
        zone: 'Good Condition',
        totalRegistered: 27,
        physicalCount: 27,
        status: 'match'
      },
      {
        code: 'AMX01-ZGC-R02-L03-B05',
        description: 'Digital Multimeter Pro',
        zone: 'Good Condition',
        totalRegistered: 15,
        physicalCount: 14,
        status: 'discrepancy',
        observations: 'One unit found damaged and moved to damaged zone'
      },
      {
        code: 'AMX01-ZDM-R01-L02-B03',
        description: 'Cracked Display Panel',
        zone: 'Damaged',
        totalRegistered: 8,
        physicalCount: 8,
        status: 'match'
      },
      {
        code: 'AMX01-ZDM-R03-L01-B02',
        description: 'Used Battery Pack',
        zone: 'Damaged',
        totalRegistered: 10,
        physicalCount: 10,
        status: 'match'
      },
      {
        code: 'AMX01-ZQT-R01-L01-B01',
        description: 'Unverified Components',
        zone: 'Quarantine',
        totalRegistered: 6,
        physicalCount: 6,
        status: 'match'
      },
      {
        code: 'AMX01-ZGC-R03-L02-B04',
        description: 'Industrial Sensors',
        zone: 'Good Condition',
        totalRegistered: 30,
        physicalCount: 30,
        status: 'match'
      },
      {
        code: 'AMX01-ZQT-R02-L03-B01',
        description: 'Testing Equipment',
        zone: 'Quarantine',
        totalRegistered: 4,
        physicalCount: 4,
        status: 'match'
      }
    ]
  },
  {
    id: 3,
    date: '2025-07-30',
    completedDate: '2025-07-30 10:15:00',
    zone: 'Damaged',
    status: 'completed',
    countType: 'Spot Check',
    auditor: 'Felicia',
    totalItems: 7,
    counted: 7,
    discrepancies: 3,
    articles: [
      {
        code: 'AMX01-ZGC-R01-L04-B01',
        description: 'Premium Electronic Components',
        zone: 'Good Condition',
        totalRegistered: 30,
        physicalCount: 28,
        status: 'discrepancy',
        observations: 'Missing 2 units'
      },
      {
        code: 'AMX01-ZGC-R02-L03-B05',
        description: 'Digital Multimeter Pro',
        zone: 'Good Condition',
        totalRegistered: 16,
        physicalCount: 16,
        status: 'match'
      },
      {
        code: 'AMX01-ZDM-R01-L02-B03',
        description: 'Cracked Display Panel',
        zone: 'Damaged',
        totalRegistered: 7,
        physicalCount: 9,
        status: 'discrepancy',
        observations: '2 additional units found'
      },
      {
        code: 'AMX01-ZDM-R03-L01-B02',
        description: 'Used Battery Pack',
        zone: 'Damaged',
        totalRegistered: 10,
        physicalCount: 8,
        status: 'discrepancy',
        observations: '2 units disposed'
      },
      {
        code: 'AMX01-ZQT-R01-L01-B01',
        description: 'Unverified Components',
        zone: 'Quarantine',
        totalRegistered: 5,
        physicalCount: 5,
        status: 'match'
      },
      {
        code: 'AMX01-ZGC-R03-L02-B04',
        description: 'Industrial Sensors',
        zone: 'Good Condition',
        totalRegistered: 28,
        physicalCount: 28,
        status: 'match'
      },
      {
        code: 'AMX01-ZQT-R02-L03-B01',
        description: 'Testing Equipment',
        zone: 'Quarantine',
        totalRegistered: 4,
        physicalCount: 4,
        status: 'match'
      }
    ]
  }
];

export function CycleCount({ onStartCycleCount, onViewCycleCount, onContinueCycleCount, onCompleteCycleCount }: CycleCountProps) {
  // Combinar el historial mock con el guardado en sessionStorage
  const [history, setHistory] = useState<CycleCountRecord[]>(() => {
    const savedHistory = sessionStorage.getItem('cycleCountHistory');
    const dynamicHistory = savedHistory ? JSON.parse(savedHistory) : [];
    return [...dynamicHistory, ...mockCycleCountHistory];
  });

  // Actualizar el historial cuando cambie el sessionStorage
  React.useEffect(() => {
    const savedHistory = sessionStorage.getItem('cycleCountHistory');
    const dynamicHistory = savedHistory ? JSON.parse(savedHistory) : [];
    setHistory([...dynamicHistory, ...mockCycleCountHistory]);
  }, []);

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
    // Create a temporary element with the report content to print
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const accuracy = Math.round((1 - record.discrepancies / record.totalItems) * 100);
    const discrepancyArticles = record.articles.filter(a => a.status === 'discrepancy');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Cycle Count Audit Report</title>
          <style>
            body { font-family: 'Segoe UI', sans-serif; padding: 20px; }
            h1 { font-size: 24px; margin-bottom: 20px; }
            h2 { font-size: 18px; margin-top: 30px; margin-bottom: 10px; }
            .header-info { margin-bottom: 20px; }
            .header-info div { margin: 5px 0; }
            .summary { display: flex; gap: 20px; margin: 20px 0; }
            .summary-item { border: 1px solid #ddd; padding: 15px; border-radius: 8px; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f4f4f4; }
            .badge { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 12px; }
            .badge-match { background-color: #22c55e; color: white; }
            .badge-discrepancy { background-color: #ef4444; color: white; }
          </style>
        </head>
        <body>
          <h1>Cycle Count Audit Report</h1>
          
          <div class="header-info">
            <h2>Audit Header</h2>
            <div><strong>Date and Time:</strong> ${record.completedDate || record.date}</div>
            <div><strong>Count Type:</strong> ${record.countType}</div>
            <div><strong>Auditor Responsible:</strong> ${record.auditor}</div>
            <div><strong>Zone:</strong> ${record.zone === 'all' ? 'All Zones' : record.zone}</div>
          </div>
          
          <div class="summary">
            <div class="summary-item">
              <div><strong>Inventory Accuracy</strong></div>
              <div style="font-size: 32px; color: ${accuracy >= 95 ? '#22c55e' : '#f59e0b'}">${accuracy}%</div>
            </div>
            <div class="summary-item">
              <div><strong>Total Items Reviewed</strong></div>
              <div style="font-size: 32px;">${record.totalItems}</div>
            </div>
            <div class="summary-item">
              <div><strong>Total Discrepancies</strong></div>
              <div style="font-size: 32px; color: #ef4444;">${record.discrepancies}</div>
            </div>
          </div>
          
          ${discrepancyArticles.length > 0 ? `
            <h2>Discrepancies Detail (${discrepancyArticles.length})</h2>
            <table>
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Item</th>
                  <th>Zone</th>
                  <th>Total Registered</th>
                  <th>Physical Count</th>
                  <th>Status</th>
                  <th>Observations</th>
                </tr>
              </thead>
              <tbody>
                ${discrepancyArticles.map(article => `
                  <tr>
                    <td>${article.code}</td>
                    <td>${article.description}</td>
                    <td>${article.zone}</td>
                    <td>${article.totalRegistered}</td>
                    <td>${article.physicalCount}</td>
                    <td><span class="badge badge-discrepancy">Discrepancy</span></td>
                    <td>${article.observations || '-'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          ` : ''}
          
          <h2>All Items Detail (${record.articles.length})</h2>
          <table>
            <thead>
              <tr>
                <th>Code</th>
                <th>Item</th>
                <th>Zone</th>
                <th>Total Registered</th>
                <th>Physical Count</th>
                <th>Status</th>
                <th>Observations</th>
              </tr>
            </thead>
            <tbody>
              ${record.articles.map(article => `
                <tr>
                  <td>${article.code}</td>
                  <td>${article.description}</td>
                  <td>${article.zone}</td>
                  <td>${article.totalRegistered}</td>
                  <td>${article.physicalCount}</td>
                  <td><span class="badge badge-${article.status === 'match' ? 'match' : 'discrepancy'}">${article.status === 'match' ? 'Match' : 'Discrepancy'}</span></td>
                  <td>${article.observations || '-'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div style="margin-top: 40px;">
            <p><strong>Generated on:</strong> ${new Date().toLocaleString()}</p>
          </div>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const handleDownloadReport = (record: CycleCountRecord) => {
    const accuracy = Math.round((1 - record.discrepancies / record.totalItems) * 100);
    const discrepancyArticles = record.articles.filter(a => a.status === 'discrepancy');
    
    // Create Excel workbook
    const wb = XLSX.utils.book_new();
    
    // Create header data
    const headerData = [
      ['CYCLE COUNT AUDIT REPORT'],
      [''],
      ['AUDIT HEADER'],
      ['Date and Time:', record.completedDate || record.date],
      ['Count Type:', record.countType],
      ['Auditor Responsible:', record.auditor],
      ['Zone:', record.zone === 'all' ? 'All Zones' : record.zone],
      [''],
      ['EXECUTIVE SUMMARY'],
      ['Inventory Accuracy:', `${accuracy}%`],
      ['Total Items Reviewed:', record.totalItems.toString()],
      ['Total Discrepancies:', record.discrepancies.toString()],
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
      ...record.articles.map(article => [
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
    XLSX.writeFile(wb, `cycle-count-report-${record.date}.xlsx`);
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
        <Button onClick={handleStartCycleCount}>
          <PlayCircle className="h-4 w-4 mr-2" />
          Start New Cycle Count
        </Button>
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
              {history.map((record) => {
                const accuracy = record.status === 'completed'
                  ? Math.round((1 - record.discrepancies / record.totalItems) * 100)
                  : 0;
                
                return (
                  <TableRow key={record.id}>
                    <TableCell>{record.date}</TableCell>
                    <TableCell>{record.zone === 'all' ? 'All Zones' : record.zone}</TableCell>
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
                      {record.status === 'completed' ? (
                        <span className={accuracy >= 95 ? 'text-green-600' : 'text-orange-600'}>
                          {accuracy}%
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        {record.status === 'in-progress' ? (
                          <>
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => onContinueCycleCount && onContinueCycleCount(record)}
                            >
                              <PlayCircle className="h-4 w-4 mr-1" />
                              Resume
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handlePrintReport(record)}
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
                          </>
                        ) : (
                          <>
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
                              onClick={() => handlePrintReport(record)}
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
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}