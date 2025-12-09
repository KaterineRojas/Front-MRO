interface KitItemMissing {
  id: number;
  name: string;
  category: string;
  missingQuantity: number;
  totalQuantity: number;
}
interface LoanItem {
  id: number;
  articleName: string;
  articleBinCode: string;
}
interface LoanRequest {
  id: number;
  requestNumber: string;
  borrower: string;
  items: LoanItem[];
}

export const handlePrintMissingKitItems = (
  pendingKitReturn: { requestId: number, itemId: number } | null,
  filteredReturns: LoanRequest[],
  missingKitItems: KitItemMissing[]
) => {
  if (!pendingKitReturn) return;
  
  const { requestId, itemId } = pendingKitReturn;
  const request = filteredReturns.find(r => r.id === requestId);
  const kitItem = request?.items.find(i => i.id === itemId);
  
  if (!request || !kitItem) return;
  const missingItemsTableRows = missingKitItems.map(item => `
      <tr>
        <td>${item.name}</td>
        <td>${item.category}</td>
        <td>${item.missingQuantity}</td>
        <td>${item.totalQuantity}</td>
      </tr>
    `).join('');
  
  const printWindow = window.open('', '', 'width=800,height=600');
  if (printWindow) {
    printWindow.document.write(`
      <html>
        <head>
          <title>Missing Kit Items - ${kitItem.articleName}</title>
          <style>
            body {
              font-family: 'Segoe UI Variable', 'Segoe UI', sans-serif;
              padding: 20px;
              color: #191C37;
            }
            h1 {
              color: #191C37;
              border-bottom: 2px solid #568FCB;
              padding-bottom: 10px;
            }
            h2 {
              color: #568FCB;
              margin-top: 20px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 12px;
              text-align: left;
            }
            th {
              background-color: #568FCB;
              color: white;
            }
            tr:nth-child(even) {
              background-color: #F3F2F8;
            }
            .header-info {
              margin-bottom: 20px;
            }
            .info-row {
              margin: 5px 0;
            }
            @media print {
              button { display: none; }
            }
          </style>
        </head>
        <body>
          <h1>Missing Kit Items Report</h1>
          <div class="header-info">
            <div class="info-row"><strong>Kit Name:</strong> ${kitItem.articleName}</div>
            <div class="info-row"><strong>BIN Code:</strong> ${kitItem.articleBinCode}</div>
            <div class="info-row"><strong>Request Number:</strong> ${request.requestNumber}</div>
            <div class="info-row"><strong>Borrower:</strong> ${request.borrower}</div>
            <div class="info-row"><strong>Date:</strong> ${new Date().toLocaleDateString()}</div>
          </div>
          <h2>Items to Restock (${missingKitItems.length})</h2>
          <table>
            <thead>
              <tr>
                <th>Item Name</th>
                <th>Category</th>
                <th>Missing Quantity</th>
                <th>Total Required</th>
              </tr>
            </thead>
            <tbody>
              ${missingItemsTableRows}
            </tbody>
          </table>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  }
};
