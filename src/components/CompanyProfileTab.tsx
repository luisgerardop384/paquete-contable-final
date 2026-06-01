/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useAccountingStore } from '../store';
import { Sparkles, RefreshCcw, Trash2, Eye, Printer } from 'lucide-react';

export default function CompanyProfileTab() {
  const { 
    companyHeader, 
    setCompanyHeader, 
    policies, 
    loadDemoPolicies, 
    clearAllPolicies,
    setIsPrintingAll 
  } = useAccountingStore();

  const handlePrintFullBook = () => {
    setIsPrintingAll(true);
    // Let React repaint first to stack all reports in the DOM
    setTimeout(() => {
      window.print();
      // Settle down after dialog closes
      setTimeout(() => {
        setIsPrintingAll(false);
      }, 1200);
    }, 200);
  };

  const handleFieldChange = (field: string, value: string) => {
    setCompanyHeader({ [field]: value });
  };

  return (
    <div className="w-full flex flex-col items-center gap-8 bg-transparent">
      
      {/* NO-PRINT Floating Control Operations Deck */}
      <div className="no-print w-full max-w-[800px] bg-slate-50 border border-gray-200 rounded-xl p-4 flex flex-col sm:flex-row gap-3 justify-between items-center text-xs text-gray-600">
        <div className="flex items-center gap-2">
          <Eye size={16} className="text-emerald-600" />
          <p className="font-sans font-medium">
            <strong>Modo Portada Viva:</strong> Haga clic directamente sobre cualquier texto de la hoja para editar la Razón Social y fechas del membrete.
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto shrink-0 justify-end">
          <button
            onClick={handlePrintFullBook}
            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-sans font-extrabold grid grid-flow-col gap-1.5 items-center cursor-pointer transition shadow-sm rounded-lg text-[11px]"
            id="btn-portada-print-all"
            title="Exportar toda la papelería del periodo en un libro PDF integrado"
          >
            <Printer size={12} />
            <span>Exportar Paquete Contable Completo</span>
          </button>

          <button
            onClick={loadDemoPolicies}
            className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-gray-200 hover:border-gray-300 font-sans font-bold grid grid-flow-col gap-1.5 items-center cursor-pointer transition shadow-sm rounded-lg text-emerald-800 text-[11px]"
            id="btn-portada-restore-demo"
          >
            <RefreshCcw size={12} />
            <span>Reestablecer Clásicos</span>
          </button>
          
          <button
            onClick={clearAllPolicies}
            className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100/80 border border-rose-200 font-sans font-bold grid grid-flow-col gap-1.5 items-center cursor-pointer transition shadow-sm rounded-lg text-rose-700 text-[11px]"
            id="btn-portada-clear-all"
          >
            <Trash2 size={12} />
            <span>Borrar Pólizas</span>
          </button>
        </div>
      </div>

      {/* PORTADA LETTER PAPER SHEET VISUAL REPRESENTATION */}
      <div 
        className="w-full max-w-[800px] min-h-[1050px] bg-white border border-gray-200 rounded-lg shadow-xl p-12 sm:p-20 flex flex-col justify-between text-[#111111] font-sans relative"
        style={{ contentVisibility: 'auto' }}
        id="executive-cover-sheet"
      >
        {/* Subtle Decorative Margin Borders (Watermark Line) */}
        <div className="absolute inset-6 border border-gray-100 rounded pointer-events-none select-none" />

        {/* 1. Centered Header / Corporate Symbol */}
        <div className="flex flex-col items-center justify-center text-center mt-12 z-10">
          <div className="relative group">
            <input
              type="text"
              className="text-4xl w-14 h-14 text-center bg-transparent border-b border-transparent hover:border-gray-200 focus:border-emerald-600 focus:bg-amber-50 outline-none rounded transition font-bold select-all"
              value={companyHeader.logoText || '🏢'}
              onChange={(e) => handleFieldChange('logoText', e.target.value)}
              title="Pulse para cambiar el logotipo (emoji)"
            />
            <span className="no-print absolute -bottom-5 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 text-[8px] font-mono text-gray-400 bg-slate-100 px-1.5 py-0.5 rounded pointer-events-none transition whitespace-nowrap">
              EDITAR LOGO
            </span>
          </div>

          <div className="w-full mt-6 relative group px-4">
            <input
              type="text"
              className="w-full text-center text-lg sm:text-xl font-extrabold tracking-tight text-gray-900 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-emerald-600 focus:bg-amber-50 outline-none rounded transition select-all py-1 font-sans uppercase"
              value={companyHeader.companyName}
              onChange={(e) => handleFieldChange('companyName', e.target.value.toUpperCase())}
              placeholder="RAZÓN SOCIAL DE LA COMPAÑÍA"
            />
            <span className="no-print absolute -bottom-5 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 text-[8px] font-mono text-gray-400 bg-slate-100 px-1.5 py-0.5 rounded pointer-events-none transition whitespace-nowrap">
              EDITAR RAZÓN SOCIAL
            </span>
          </div>

          <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 font-mono text-[11px] text-gray-500 max-w-[500px]">
            <div className="relative group">
              <span className="font-sans font-extrabold text-[9px] text-gray-400 uppercase tracking-widest block mb-0.5">REGISTRO DE CONTRIBUYENTE</span>
              <input
                type="text"
                className="w-full text-center bg-transparent border-b border-transparent hover:border-gray-350 focus:border-emerald-600 focus:bg-amber-50 outline-none rounded py-0.5 font-bold text-gray-800"
                value={companyHeader.rfc}
                onChange={(e) => handleFieldChange('rfc', e.target.value.toUpperCase())}
                placeholder="R.F.C."
              />
            </div>
            <div className="relative group">
              <span className="font-sans font-extrabold text-[9px] text-gray-400 uppercase tracking-widest block mb-0.5">DOMICILIO FISCAL OFICIAL</span>
              <input
                type="text"
                className="w-full text-center bg-transparent border-b border-transparent hover:border-gray-35"
                value={companyHeader.address}
                onChange={(e) => handleFieldChange('address', e.target.value)}
                placeholder="Domicilio Fiscal"
              />
            </div>
          </div>
        </div>

        {/* 2. Primary Title of Portada (Document Centerpiece) */}
        <div className="text-center my-16 z-10">
          <div className="inline-block border-y-2 border-double border-gray-400 py-4 px-10 bg-slate-50/50 w-full max-w-[620px]">
            <span className="text-[10px] font-mono font-extrabold text-emerald-800 tracking-widest uppercase block mb-1">
              ESTUDIO CONTABLE COADYUVANTE
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-gray-950 uppercase tracking-wider font-sans leading-relaxed">
              PORTADA DE INFORMACIÓN FINANCIERA
            </h2>
            <div className="h-[1px] w-12 bg-gray-300 mx-auto my-3" />
            <p className="text-[11px] font-serif italic text-gray-500 max-w-[420px] mx-auto leading-relaxed">
              Expedientes integrados bajo el método normativo de registros mercantiles.
            </p>
          </div>
        </div>

        {/* 3. Operational Regulatory Details */}
        <div className="w-full max-w-[580px] mx-auto bg-slate-50/30 border border-gray-150 rounded-xl p-6 space-y-4 text-xs z-10">
          <div className="flex justify-between items-center border-b border-gray-200 pb-2">
            <span className="text-gray-400 font-extrabold uppercase tracking-widest text-[9px]">MÉTODO DE INVENTARIOS</span>
            <strong className="text-gray-800 font-sans">INVENTARIOS PERPETUOS SIN IVA</strong>
          </div>

          <div className="flex justify-between items-center border-b border-gray-200 pb-2">
            <span className="text-gray-400 font-extrabold uppercase tracking-widest text-[9px]">EVALUACIÓN VALORATIVA</span>
            <strong className="text-gray-800 font-sans">COSTO ADQUISITIVO DEL PERIODO</strong>
          </div>

          {/* Inline Edit Period Block */}
          <div className="flex justify-between items-center border-b border-gray-200 pb-2 gap-4">
            <span className="text-gray-400 font-extrabold uppercase tracking-widest text-[9px] shrink-0">PERIODO ANALIZADO</span>
            <div className="flex items-center gap-1.5 font-mono text-[11px] font-bold text-slate-800 shrink-0">
              <span>Del</span>
              <input
                type="date"
                className="bg-transparent border-b border-transparent hover:border-gray-300 focus:border-emerald-600 focus:bg-amber-50 rounded px-1 outline-none font-bold text-center"
                value={companyHeader.startDate}
                onChange={(e) => handleFieldChange('startDate', e.target.value)}
              />
              <span>al</span>
              <input
                type="date"
                className="bg-transparent border-b border-transparent hover:border-gray-300 focus:border-emerald-600 focus:bg-amber-50 rounded px-1 outline-none font-bold text-center"
                value={companyHeader.endDate}
                onChange={(e) => handleFieldChange('endDate', e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-400 font-extrabold uppercase tracking-widest text-[9px]">RESPONSABILIDAD</span>
            <input
              type="text"
              className="bg-transparent border-b border-transparent hover:border-gray-300 focus:border-emerald-600 focus:bg-amber-50 rounded px-2 outline-none font-bold text-gray-800 text-right max-w-[280px]"
              value={companyHeader.area}
              onChange={(e) => handleFieldChange('area', e.target.value)}
              placeholder="Responsabilidad"
            />
          </div>
        </div>

        {/* 4. Letter Page Footer Bottom details */}
        <div className="mt-12 border-t border-gray-200 pt-6 flex flex-col sm:flex-row justify-between items-center text-[10px] text-gray-400 font-mono text-center gap-2 z-10">
          <span>CIFRAS EXPRESADAS EN PESOS MEXICANOS (MXN)</span>
          <div className="relative group">
            <input
              type="text"
              className="text-center sm:text-right bg-transparent border-b border-transparent hover:border-gray-300 focus:border-emerald-600 focus:bg-amber-50 rounded px-2 outline-none text-[10.5px] font-bold text-gray-500 uppercase font-mono max-w-[280px]"
              value={companyHeader.cityCountry}
              onChange={(e) => handleFieldChange('cityCountry', e.target.value)}
              placeholder="Ciudad y País"
            />
          </div>
        </div>
      </div>
      
    </div>
  );
}
