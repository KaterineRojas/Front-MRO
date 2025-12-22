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
  adjustmentsApplied?: boolean;
}

export function generatePrintReport(record: CycleCountRecord) {
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
}

export function generateExcelReport(record: CycleCountRecord) {
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
}
