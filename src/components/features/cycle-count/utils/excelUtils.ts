import * as XLSX from 'xlsx';
import { CycleCountDetailData } from '../types';

export function downloadCycleCountReport(countData: CycleCountDetailData): void {
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
}
