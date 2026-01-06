import { LoanRequest } from '../types';

export function formatConditionText(condition: string): string {
  if (!condition || condition === 'good-condition') return 'Condition';
  if (condition === 'on-revision') return 'On Revision';
  if (condition === 'lost') return 'Lost';
  if (condition.includes('Good:') || condition.includes('Revision:') || condition.includes('Lost:')) {
    return condition;
  }
  return condition;
}

export function handlePrintSinglePacking(request: LoanRequest, packingItemQuantities: Record<string, number>): boolean {
  const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Checking List - ${request.requestNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 10px; }
            .request-card { border: 1px solid #ccc; margin-bottom: 20px; padding: 15px; page-break-inside: avoid; }
            .request-header { background-color: #f5f5f5; padding: 10px; margin: -15px -15px 15px -15px; }
            .items-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            .items-table th, .items-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            .items-table th { background-color: #f9f9f9; }
            .checkbox { width: 20px; height: 20px; border: 2px solid #333; display: inline-block; margin-right: 10px; }
            .priority-high { color: #ff6b35; font-weight: bold; }
            .priority-medium { color: #f7931e; font-weight: bold; }
            .priority-urgent { color: #dc3545; font-weight: bold; }
            .notes { background-color: #f8f9fa; padding: 10px; margin-top: 10px; border-left: 4px solid #007bff; }
            @media print { body { margin: 0; } .request-card { page-break-inside: avoid; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>CHECKING LIST - ${request.requestNumber}</h1>
            <p>Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
          </div>
          <div class="request-card">
            <div class="request-header">
              <h2>${request.requestNumber}</h2>
              <p><strong>Borrower:</strong> ${request.requesterName} (${request.requesterEmail})</p>
              <p><strong>Department:</strong> ${request.departmentId} | <strong>Project:</strong> ${request.projectId}</p>
              <p><strong>Priority:</strong> <span class="priority-${request.priority ?? 'low'}">${(request.priority ?? 'low').toUpperCase()}</span></p>
              <p><strong>Loan Date:</strong> ${request.createdAt} | <strong>Expected Return:</strong> ${request.expectedReturnDate}</p>
            </div>
            <h3>Items Checklist:</h3>
            <table class="items-table">
              <thead>
                <tr>
                  <th style="width: 30px;">✓</th>
                  <th>BIN Code</th>
                  <th>Description</th>
                  <th>Quantity</th>
                  <th>Unit</th>
                  <th>Verified By</th>
                </tr>
              </thead>
              <tbody>
                ${request.items.map(item => {
                  const itemKey = `${request.id}-${item.id}`;
                  const qty = packingItemQuantities[itemKey] !== undefined ? packingItemQuantities[itemKey] : item.quantityRequested;
                  return `
                    <tr>
                      <td><span class="checkbox"></span></td>
                      <td>${item.sku}</td>
                      <td>${item.articleDescription}</td>
                      <td>${qty}${qty !== item.quantityRequested ? ` (Original: ${item.quantityRequested})` : ''}</td>
                      <td>${item.unit}</td>
                      <td>________________</td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
            <div style="margin-top: 20px; border-top: 1px solid #ddd; padding-top: 15px;">
              <p><strong>Checked by:</strong> _________________________ <strong>Date:</strong> _____________</p>
              <p><strong>Signature:</strong> _________________________</p>
            </div>
          </div>
        </body>
      </html>
    `;

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
    return true;
  }

  return false;
}
