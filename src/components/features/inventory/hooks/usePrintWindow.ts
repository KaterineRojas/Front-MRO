import { useCallback } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

export const usePrintWindow = () => {
  
  const printComponent = useCallback((component: React.ReactElement, title: string) => {
    // 1. Convertir React a HTML String
    const componentHtml = renderToStaticMarkup(component);

    // 2. Definir tus estilos (Los mismos que ya tenías)
    const styles = `
      body { font-family: Arial, sans-serif; padding: 20px; color: #000; -webkit-print-color-adjust: exact; }
      h1, h2 { text-align: center; }
      table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px; }
      th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
      th { background-color: #f3f4f6; font-weight: bold; }
      .text-right { text-align: right; }
      .text-center { text-align: center; }
      .header-flex { display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px; }
      .signatures { margin-top: 50px; display: flex; justify-content: space-between; page-break-inside: avoid; }
      .signature-block { width: 45%; }
      .signature-line { border-top: 1px solid #000; margin-top: 40px; }
      .success-badge { color: green; font-weight: bold; }
      .error-badge { color: red; font-weight: bold; }
    `;

    // 3. Crear un IFRAME invisible
    const iframe = document.createElement('iframe');
    // Lo sacamos de la vista del usuario
    iframe.style.position = 'absolute';
    iframe.style.width = '0px';
    iframe.style.height = '0px';
    iframe.style.border = 'none';
    document.body.appendChild(iframe);

    // 4. Escribir el contenido en el iframe
    const doc = iframe.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(`
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
      doc.close();

      // 5. Imprimir y Limpiar
      // Damos foco al iframe para que el navegador sepa qué imprimir
      iframe.contentWindow?.focus();
      
      // Un pequeño timeout es vital para asegurar que el contenido (y estilos) se renderizó en el iframe
      setTimeout(() => {
        iframe.contentWindow?.print();
        
        // Limpieza: Borramos el iframe después de que el usuario cierre el diálogo de impresión
        // (En la mayoría de navegadores, el JS se pausa mientras el diálogo está abierto, 
        // así que esto corre justo después de que el usuario hace click en Imprimir o Cancelar)
        setTimeout(() => {
             document.body.removeChild(iframe);
        }, 1000); 
      }, 500);
    }
  }, []);

  return printComponent;
};