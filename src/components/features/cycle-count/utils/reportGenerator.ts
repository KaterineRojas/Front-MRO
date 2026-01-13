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
  imageUrl?: string;
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
        <title>&nbsp;</title>
        <style>
                  @media print {
              @page { 
                margin: 0; /* Esto elimina los encabezados y pies de página del navegador */
              }            
            }
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
          <div><strong>Date:</strong> ${record.date}</div>
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

// Generate print report for all history records with full details
export function generatePrintAllHistory(records: CycleCountRecord[]) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow pop-ups to print the report');
    return;
  }

  const currentDate = new Date().toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Generate detailed report for each record
  const reportsHTML = records.map((record, index) => {
    const accuracy = Math.round((1 - record.discrepancies / record.totalItems) * 100);
    const discrepancyArticles = record.articles.filter(a => a.status === 'discrepancy');

    return `
      <div class="report-section" style="page-break-after: ${index < records.length - 1 ? 'always' : 'auto'};">
        <h1>Cycle Count Audit Report #${record.id}</h1>
        
        <div class="header-info">
          <h2>Audit Header</h2>
          <div><strong>Date:</strong> ${record.date}</div>
          <div><strong>Count Type:</strong> ${record.countType}</div>
          <div><strong>Auditor Responsible:</strong> ${record.auditor}</div>
          <div><strong>Zone:</strong> ${record.zone === 'all' ? 'All Zones' : record.zone}</div>
          <div><strong>Status:</strong> <span class="status-badge status-${record.status}">${record.status === 'completed' ? 'Completed' : 'In Progress'}</span></div>
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
        ` : '<p style="color: #22c55e; font-weight: bold;">No discrepancies found!</p>'}
        
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
      </div>
    `;
  }).join('');

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>All Cycle Count Reports - ${currentDate}</title>
      <style>
      @media print {
  @page {
    /* Esto elimina los encabezados (título/URL) y pies de página (fecha/página) */
    margin: 0;
  }
    
}
        body { 
          font-family: 'Segoe UI', sans-serif; 
          padding: 20px;
          max-width: 1200px;
          margin: 0 auto;
        }
        h1 { 
          font-size: 24px; 
          margin-bottom: 20px;
          color: #333;
          border-bottom: 2px solid #333;
          padding-bottom: 10px;
        }
        h2 { 
          font-size: 18px; 
          margin-top: 30px; 
          margin-bottom: 10px;
          color: #555;
        }
        .report-section {
          margin-bottom: 40px;
        }
        .header-info { 
          margin-bottom: 20px;
          background-color: #f9f9f9;
          padding: 15px;
          border-radius: 8px;
        }
        .header-info div { 
          margin: 5px 0; 
        }
        .summary { 
          display: flex; 
          gap: 20px; 
          margin: 20px 0;
          flex-wrap: wrap;
        }
        .summary-item { 
          border: 1px solid #ddd; 
          padding: 15px; 
          border-radius: 8px;
          flex: 1;
          min-width: 200px;
        }
        table { 
          width: 100%; 
          border-collapse: collapse; 
          margin: 20px 0; 
        }
        th, td { 
          border: 1px solid #ddd; 
          padding: 8px; 
          text-align: left; 
        }
        th { 
          background-color: #f4f4f4;
          font-weight: 600;
        }
        tr:nth-child(even) {
          background-color: #fafafa;
        }
        .badge { 
          display: inline-block; 
          padding: 4px 8px; 
          border-radius: 4px; 
          font-size: 12px;
          font-weight: 600;
        }
        .badge-match { 
          background-color: #22c55e; 
          color: white; 
        }
        .badge-discrepancy { 
          background-color: #ef4444; 
          color: white; 
        }
        .status-badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
        }
        .status-completed {
          background-color: #dcfce7;
          color: #166534;
        }
        .status-in-progress {
          background-color: #fef3c7;
          color: #854d0e;
        }
        @media print {
          body {
            padding: 10px;
          }
          .report-section {
            page-break-inside: avoid;
          }
          table {
            page-break-inside: auto;
          }
          tr {
            page-break-inside: avoid;
            page-break-after: auto;
          }
        }
      </style>
    </head>
    <body>
      <div style="text-align: center; margin-bottom: 40px;">
        <h1 style="font-size: 28px; border: none;">All Cycle Count Reports</h1>
        <p style="color: #666;">Generated on ${currentDate}</p>
        <p style="color: #666;">Total Reports: ${records.length}</p>
      </div>

      ${reportsHTML}
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

// Types for in-progress count printing
interface Article {
  id: string;
  code: string;
  description: string;
  type: 'consumable' | 'non-consumable';
  zone: 'Good Condition' | 'Damaged' | 'Quarantine';
  totalRegistered: number;
  physicalCount?: number;
  status?: 'match' | 'discrepancy';
  observations?: string;
  imageUrl?: string;
}

interface CountInProgressData {
  articles: Article[];
  countType: string;
  auditor: string;
  zone: string;
  date: string;
}

export function generatePrintCountInProgress(data: CountInProgressData) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const countedArticles = data.articles.filter(a => a.physicalCount !== undefined);
  const discrepancies = data.articles.filter(a => a.status === 'discrepancy');

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>&nbsp;</title>
        <style>
                @media print {
            @page { 
              margin: 0; /* Esto elimina los encabezados y pies de página del navegador */
            }
          }
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
          .badge-pending { background-color: #f59e0b; color: white; }
        </style>
      </head>
      <body>
        <h1>Physical Inventory Count Report</h1>
        
        <div class="header-info">
          <h2>Count Information</h2>
          <div><strong>Date:</strong> ${data.date}</div>
          <div><strong>Count Type:</strong> ${data.countType}</div>
          <div><strong>Auditor:</strong> ${data.auditor}</div>
          <div><strong>Zone:</strong> ${data.zone === 'all' ? 'All Zones' : data.zone}</div>
        </div>
        
        <h2>All Items (${data.articles.length})</h2>
        <table>
          <thead>
            <tr>
              <th>Code</th>
              <th>Item</th>
              <th>Total Registered</th>
              <th>Physical Count</th>
              <th>Status</th>
              <th>Observations</th>
            </tr>
          </thead>
          <tbody>
            ${data.articles.map(article => {
              let statusBadge = '<span class="badge badge-pending">Pending</span>';
              if (article.status === 'match') {
                statusBadge = '<span class="badge badge-match">Match</span>';
              } else if (article.status === 'discrepancy') {
                statusBadge = '<span class="badge badge-discrepancy">Discrepancy</span>';
              }
              
              return `
                <tr>
                  <td>${article.code}</td>
                  <td>${article.description}</td>
                  <td>${article.totalRegistered}</td>
                  <td>${article.physicalCount !== undefined ? article.physicalCount : '-'}</td>
                  <td>${statusBadge}</td>
                  <td>${article.observations || '-'}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
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


