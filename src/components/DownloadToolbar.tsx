/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Printer } from 'lucide-react';

interface DownloadToolbarProps {
  reportId: string;
  fileName: string;
  orientation: 'portrait' | 'landscape';
}

export default function DownloadToolbar({ reportId, fileName, orientation }: DownloadToolbarProps) {
  const handlePrint = () => {
    // Asegura que el contenedor del reporte contenga el Encabezado Institucional completo antes de imprimir
    const reportElem = document.getElementById(reportId);
    if (reportElem) {
      reportElem.classList.add('print-focus');
    }
    document.body.classList.add('printing-active-report');

    // Dynamically inject orientation and print media size rules for flawless print/PDF margins
    const styleEl = document.createElement('style');
    styleEl.id = 'temp-pdf-orientation-style';
    styleEl.innerHTML = `
      @page {
        size: ${orientation === 'landscape' ? 'landscape' : 'portrait'} !important;
        margin: 15mm !important;
      }
      @media print {
        body {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
          background: white !important;
          background-color: white !important;
        }
        /* Completely hide navigation bar, app headers, sidebar elements, and tool panels when printing a single report */
        header, footer, nav, .no-print, [role="tablist"], button, .no-print-element {
          display: none !important;
        }
      }
    `;
    document.head.appendChild(styleEl);

    // Execute standard window trigger
    window.print();

    // Clean up style descriptors subsequently
    setTimeout(() => {
      if (reportElem) {
        reportElem.classList.remove('print-focus');
      }
      document.body.classList.remove('printing-active-report');
      const attached = document.getElementById('temp-pdf-orientation-style');
      if (attached) {
        attached.remove();
      }
    }, 1000);
  };

  return (
    <div className="no-print bg-slate-50 border border-gray-200 px-4 py-2.5 rounded-xl mb-5 flex flex-col sm:flex-row items-center justify-between gap-3 select-none">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
        <span className="text-[11.5px] font-bold text-slate-700 font-sans">
          Estudio Contable ─ Zitácuaro Importaciones, S.A. de C.V.
        </span>
      </div>
      
      <div className="flex items-center gap-2">
        {/* EXPORT TO PDF REAL BUTTON */}
        <button
          onClick={handlePrint}
          className="flex items-center gap-1.5 bg-[#111111] hover:bg-black text-white text-[11px] font-sans font-extrabold py-2 px-4 shadow-sm hover:shadow hover:scale-[1.01] transition duration-150 cursor-pointer rounded-lg border border-black"
          id={`btn-export-pdf-${reportId}`}
          title="Exportar Reporte Contable a PDF con Membrete Corporativo Completo"
        >
          <Printer size={13} />
          <span>Exportar a PDF</span>
        </button>
      </div>
    </div>
  );
}
