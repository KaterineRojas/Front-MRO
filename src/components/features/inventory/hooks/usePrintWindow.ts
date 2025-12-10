import { useCallback } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

export const usePrintWindow = () => {

    const printComponent = useCallback((component: React.ReactElement, title: string) => {
        const componentHtml = renderToStaticMarkup(component);

        const styles = `
      body { font-family: Arial, sans-serif; padding: 20px; color: #000; }
      h1, h2 { text-align: center; }
      table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px; }
      th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
      th { background-color: #f3f4f6; font-weight: bold; }
      .text-right { text-align: right; }
      .text-center { text-align: center; }
      .mb-4 { margin-bottom: 1rem; }
      .font-bold { font-weight: bold; }
      .header-flex { display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px; }
      .signatures { margin-top: 50px; display: flex; justify-content: space-between; }
      .signature-block { width: 45%; }
      .signature-line { border-top: 1px solid #000; margin-top: 40px; }
      .success-badge { color: green; font-weight: bold; }
      .error-badge { color: red; font-weight: bold; }
    `;

        const printWindow = window.open('', '_blank', 'width=900,height=600');

        if (printWindow) {
            printWindow.document.write(`
        <html>
          <head>
            <title>${title}</title>
            <style>${styles}</style>
          </head>
          <body>
            ${componentHtml}
          </body>
        </html>
      `);

            printWindow.document.close(); 
            printWindow.focus();

            setTimeout(() => {
                printWindow.print();
                // Opcional: printWindow.close(); 
            }, 250);
        }
    }, []);

    return printComponent;
};