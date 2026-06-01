/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useAccountingStore } from './store';
import { TabType } from './types';
import ExcelHeader from './components/ExcelHeader';
import CompanyProfileTab from './components/CompanyProfileTab';
import PolicyManagerTab from './components/PolicyManagerTab';
import JournalTab from './components/JournalTab';
import LedgerTab from './components/LedgerTab';
import TrialBalanceTab from './components/TrialBalanceTab';
import CostOfGoodsTab from './components/CostOfGoodsTab';
import IncomeStatementTab from './components/IncomeStatementTab';
import BalanceSheetTab from './components/BalanceSheetTab';
import CatalogueTab from './components/CatalogueTab';
import Scratchpad from './components/Scratchpad';
import { Printer, Calculator, FileSpreadsheet, Eye, ChevronRight, Briefcase } from 'lucide-react';

export default function App() {
  const { 
    activeTab, 
    setActiveTab, 
    companyHeader, 
    isScratchpadOpen, 
    setScratchpadOpen,
    isPrintingAll,
    policies,
    accounts,
    subaccounts,
    balanceSheetFormat
  } = useAccountingStore();

  const sortedPolicies = [...(policies || [])].sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    if (a.isAdjustment !== b.isAdjustment) return a.isAdjustment ? 1 : -1;
    return a.number.localeCompare(b.number);
  });

  const handlePrint = () => {
    window.print();
  };

  // If we are compiler-sequencing all sheets as an integrated binder
  if (isPrintingAll) {
    return (
      <div className="bg-white text-black min-h-screen p-0 m-0 print-pages-canvas select-none">
        
        {/* Page 1: Cover Page */}
        <div className="w-full relative flex justify-center items-center print-portrait print-portada-hoja-unica bg-white">
          <CompanyProfileTab />
        </div>

        {/* Page 2: Libro Diario */}
        <div className="print-page-break p-12 print-landscape">
          <ExcelHeader currentTab="Diario" />
          <div className="mt-6">
            <JournalTab />
          </div>
        </div>

        {/* Page 3: Esquemas de Mayor */}
        <div className="print-page-break p-12 print-landscape">
          <ExcelHeader currentTab="Mayor" />
          <div className="mt-6">
            <LedgerTab />
          </div>
        </div>

        {/* Page 4: Balanza de Comprobación */}
        <div className="print-page-break p-12 print-landscape">
          <ExcelHeader currentTab="Balanza" />
          <div className="mt-6">
            <TrialBalanceTab />
          </div>
        </div>

        {/* Page 5: Estado de Costo de lo Vendido */}
        <div className="print-page-break p-12 print-portrait">
          <ExcelHeader currentTab="ECoPyV" />
          <div className="mt-6">
            <CostOfGoodsTab />
          </div>
        </div>

        {/* Page 6: Estado de Resultados */}
        <div className="print-page-break p-12 print-portrait">
          <ExcelHeader currentTab="ERe" />
          <div className="mt-6">
            <IncomeStatementTab />
          </div>
        </div>

        {/* Page 7: Balance General */}
        <div className={`print-page-break p-12 ${balanceSheetFormat === 'Cuenta' ? 'print-landscape' : 'print-portrait'}`}>
          <ExcelHeader currentTab="ESFi" />
          <div className="mt-6">
            <BalanceSheetTab />
          </div>
        </div>

        {/* Page 8+: Sección de Pólizas individuales automáticas */}
        {sortedPolicies.map((pol, pIdx) => {
          const totalDebit = pol.movements.reduce((sum, mov) => sum + (mov.debit || 0), 0);
          const totalCredit = pol.movements.reduce((sum, mov) => sum + (mov.credit || 0), 0);
          return (
            <div key={`p-form-${pol.id}`} className="print-page-break p-12 print-portrait flex flex-col justify-between min-h-[92vh]">
              <div>
                {/* Micro mini letterhead */}
                <div className="flex justify-between items-start border-b-2 border-slate-800 pb-3 mb-5">
                  <div>
                    <h4 className="text-sm font-black text-slate-900 tracking-tight uppercase">
                      ZITÁCUARO IMPORTACIONES, S.A. DE C.V.
                    </h4>
                    <p className="text-[10px] font-mono text-gray-500">
                      RFC: ZIM-980415G34 | Domicilio Fiscal: Av. Revolución Sur #142, Col. Centro, C.P. 61500
                    </p>
                  </div>
                  <div className="text-right">
                    <h3 className="text-xs font-black text-emerald-950 uppercase select-none bg-emerald-50 px-2.5 py-1 rounded border border-emerald-100 font-mono">
                      PÓLIZA DE {pol.type ? pol.type.toUpperCase() : 'DIARIO'} ─ {pol.number}
                    </h3>
                    <p className="text-[10px] text-gray-400 font-mono mt-1 font-bold">Fecha de Registro: {pol.date}</p>
                  </div>
                </div>

                {/* Concept and reference meta card */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50/70 border border-gray-200 rounded-xl p-4 text-[11px] mb-6 font-sans">
                  <div>
                    <span className="font-extrabold text-gray-400 uppercase text-[9px] tracking-wider block">Concepto General de la Operación:</span>
                    <span className="font-bold text-slate-800">{pol.concept || 'Sin concepto'}</span>
                  </div>
                  <div>
                    <span className="font-extrabold text-gray-400 uppercase text-[9px] tracking-wider block">Documento de Comprobación y Soporte:</span>
                    <span className="font-mono text-slate-700 font-bold">{pol.reference || 'Ninguno (Interno)'}</span>
                  </div>
                  <div className="md:col-span-2 flex justify-between items-center text-[10px] text-gray-400 font-mono pt-2 border-t border-dashed border-gray-200 mt-1">
                    <span>Área: Dirección de Finanzas y Contabilidad</span>
                    <span>Auxiliar Operante: <strong>L.C. Luis Gerardo Perez</strong></span>
                  </div>
                </div>

                {/* Movements Table */}
                <table className="w-full border-collapse border border-gray-300 text-[11.5px] font-sans">
                  <thead>
                    <tr className="bg-slate-50 border-b border-gray-300 text-gray-405 font-mono text-[9px] uppercase tracking-wide">
                      <th className="w-20 px-2 py-1.5 text-center border-r border-gray-300 font-bold">Clave</th>
                      <th className="px-3 py-1.5 text-left border-r border-gray-300 font-bold">Cuenta - Subcuenta Registro</th>
                      <th className="w-28 px-3 py-1.5 text-right border-r border-gray-300 font-bold">Debe ($)</th>
                      <th className="w-28 px-3 py-1.5 text-right font-bold">Haber ($)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pol.movements.map((mov, mIdx) => {
                      const foundAcct = accounts.find((a) => a.code === mov.accountCode);
                      const acctName = foundAcct ? foundAcct.name : 'Cuenta Auxiliar';
                      return (
                        <React.Fragment key={mIdx}>
                          {/* Parent row */}
                          <tr className="border-b border-gray-200 text-slate-850 h-7.5">
                            <td className="border-r border-gray-300 text-center font-mono py-1 font-semibold text-gray-650">
                              {mov.accountCode}
                            </td>
                            <td className="border-r border-gray-300 px-3 font-bold text-slate-800">
                              {acctName}
                            </td>
                            <td className="border-r border-gray-300 px-3 text-right font-mono text-blue-900 font-bold">
                              {mov.debit ? `$ ${mov.debit.toLocaleString('es-MX', { minimumFractionDigits: 2 })}` : ''}
                            </td>
                            <td className="px-3 text-right font-mono text-red-900 font-bold">
                              {mov.credit ? `$ ${mov.credit.toLocaleString('es-MX', { minimumFractionDigits: 2 })}` : ''}
                            </td>
                          </tr>
                          
                          {/* Subaccount row if specified */}
                          {mov.subaccountCode && (() => {
                            const foundSub = subaccounts.find((s) => s.code === mov.subaccountCode && s.parentCode === mov.accountCode);
                            const subName = foundSub ? foundSub.name : 'Subcuenta Detalle';
                            return (
                              <tr className="border-b border-gray-150 text-gray-500 italic text-[10.5px] h-6">
                                <td className="border-r border-gray-300 text-center font-mono py-0.5">
                                  {mov.subaccountCode}
                                </td>
                                <td className="border-r border-gray-300 pl-8 py-0.5">
                                  ↪ {mov.subaccountCode} Subcuenta {subName}
                                </td>
                                <td className="border-r border-gray-300 px-3 text-right font-mono text-gray-400">
                                  {mov.debit ? `$ ${mov.debit.toLocaleString('es-MX', { minimumFractionDigits: 2 })}` : ''}
                                </td>
                                <td className="px-3 text-right font-mono text-gray-400">
                                  {mov.credit ? `$ ${mov.credit.toLocaleString('es-MX', { minimumFractionDigits: 2 })}` : ''}
                                </td>
                              </tr>
                            );
                          })()}
                        </React.Fragment>
                      );
                    })}
                    <tr className="bg-slate-50 border-t-2 border-b-4 border-double border-slate-900 font-extrabold h-9">
                      <td colSpan={2} className="px-3 py-1 text-right border-r border-gray-300 text-slate-800 font-mono text-[9px] uppercase font-bold">
                        SUMAS IGUALES DE PÓLIZA:
                      </td>
                      <td className="border-r border-gray-300 px-3 text-right text-blue-950 font-mono font-black text-xs">
                        ${totalDebit.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-3 text-right text-red-950 font-mono font-black text-xs">
                        ${totalCredit.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Recuadros de firmas */}
              <div className="grid grid-cols-3 gap-6 text-[10px] text-center font-sans mt-auto border-t border-gray-300 pt-5">
                <div>
                  <div className="border-b border-gray-300 mx-auto max-w-[130px] h-9"></div>
                  <span className="font-extrabold text-slate-500 block uppercase mt-1 tracking-wider text-[8.5px]">Elaboró</span>
                  <span className="text-slate-800 font-black text-[11px] block text-[11px]">L.C. Luis Gerardo Perez</span>
                  <span className="text-[9.5px] text-gray-400 font-mono italic">Auxiliar Contable</span>
                </div>
                <div>
                  <div className="border-b border-gray-300 mx-auto max-w-[130px] h-9"></div>
                  <span className="font-extrabold text-slate-500 block uppercase mt-1 tracking-wider text-[8.5px]">Revisó</span>
                  <span className="text-slate-800 font-black text-[11px] block text-[11px]">L.C. Gerardo Pérez</span>
                  <span className="text-[9.5px] text-gray-400 font-mono italic">Contralor General</span>
                </div>
                <div>
                  <div className="border-b border-gray-300 mx-auto max-w-[130px] h-9"></div>
                  <span className="font-extrabold text-slate-500 block uppercase mt-1 tracking-wider text-[8.5px]">Autorizó</span>
                  <span className="text-slate-800 font-bold block text-[11px]">Director de Finanzas</span>
                  <span className="text-[9.5px] text-gray-400 font-mono italic">Dirección Estatal</span>
                </div>
              </div>
            </div>
          );
        })}

      </div>
    );
  }

  // Render active sheet grid according to chosen executive tab selection
  const renderActiveGrid = () => {
    switch (activeTab) {
      case 'Portada':
        return <CompanyProfileTab />;
      case 'Polizas':
        return <PolicyManagerTab />;
      case 'Diario':
        return <JournalTab />;
      case 'Mayor':
        return <LedgerTab />;
      case 'Balanza':
        return <TrialBalanceTab />;
      case 'ECoPyV':
        return <CostOfGoodsTab />;
      case 'ERe':
        return <IncomeStatementTab />;
      case 'ESFi':
        return <BalanceSheetTab />;
      case 'Catalogo':
        return <CatalogueTab />;
      default:
        return <CompanyProfileTab />;
    }
  };

  // Sutil top navigation highlights styling
  const getNavBtnStyles = (tab: TabType) => {
    const isActive = activeTab === tab;
    const base = "relative px-3 py-3 text-[11px] font-sans font-extrabold tracking-wider uppercase transition-all duration-200 cursor-pointer select-none whitespace-nowrap ";
    
    if (isActive) {
      return base + "text-emerald-700 font-extrabold border-b-[3px] border-emerald-600";
    }
    return base + "text-gray-500 hover:text-emerald-600 border-b-[3px] border-transparent";
  };

  return (
    <div className="min-h-screen text-[#111111] flex flex-col bg-slate-50" id="main-frame">
      
      {/* 1. SUTIL TOP NAVIGATION BAR (NO-PRINT): High elegance compact header */}
      <header className="no-print bg-white border-b border-gray-200 w-full flex flex-col md:flex-row justify-between items-center px-6 md:px-10 py-1 shadow-sm sticky top-0 z-40 select-none">
        
        {/* Brand label & Workspace Metadata */}
        <div className="flex items-center gap-2 py-2 truncate max-w-[300px]">
          <Briefcase className="text-emerald-600 hover:scale-105 transition" size={16} />
          <h2 className="font-sans font-black text-[12px] uppercase tracking-widest text-gray-800 truncate" title={companyHeader.companyName}>
            {companyHeader.companyName || 'Estudio Contable'}
          </h2>
          <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.2 rounded font-medium font-mono border border-gray-150">
            Perpetuos
          </span>
        </div>

        {/* Horizontal Navigation Buttons List */}
        <nav className="flex items-center overflow-x-auto max-w-full scrollbar-none gap-1 pl-4">
          <button onClick={() => setActiveTab('Portada')} className={getNavBtnStyles('Portada')} id="btn-nav-portada">
            [Portada]
          </button>
          <button onClick={() => setActiveTab('Polizas')} className={getNavBtnStyles('Polizas')} id="btn-nav-polizas">
            [Gestor de Pólizas]
          </button>
          <button onClick={() => setActiveTab('Diario')} className={getNavBtnStyles('Diario')} id="btn-nav-diario">
            [Libro Diario]
          </button>
          <button onClick={() => setActiveTab('Mayor')} className={getNavBtnStyles('Mayor')} id="btn-nav-mayor">
            [Esquemas de Mayor]
          </button>
          <button onClick={() => setActiveTab('Balanza')} className={getNavBtnStyles('Balanza')} id="btn-nav-balanza">
            [Balanza de Comprobación]
          </button>
          <button onClick={() => setActiveTab('ECoPyV')} className={getNavBtnStyles('ECoPyV')} id="btn-nav-ecopyv">
            [Costo de Ventas]
          </button>
          <button onClick={() => setActiveTab('ERe')} className={getNavBtnStyles('ERe')} id="btn-nav-ere">
            [Estado de Resultados]
          </button>
          <button onClick={() => setActiveTab('ESFi')} className={getNavBtnStyles('ESFi')} id="btn-nav-esfi">
            [Balance General]
          </button>
          <button onClick={() => setActiveTab('Catalogo')} className={getNavBtnStyles('Catalogo')} id="btn-nav-catalogo">
            [Catálogo]
          </button>
        </nav>

        {/* Floating Utilities Controls */}
        <div className="flex items-center gap-3 py-2 shrink-0">
          {/* Lápiz Contable floating panel toggler */}
          <button
            onClick={() => setScratchpadOpen(!isScratchpadOpen)}
            className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-gray-700 text-[11px] font-sans font-bold py-1.5 px-3 border border-gray-200 hover:border-gray-300 transition cursor-pointer rounded-lg shadow-sm h-8"
            id="btn-toggle-scratchpad"
            title="Desplegar bloc de notas aritméticas coadyuvantes"
          >
            <Calculator size={13} className="text-gray-500" />
            <span>Lápiz Contable</span>
          </button>

          {/* Core window.print PDF exporter */}
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-750 text-white text-[11px] font-sans font-extrabold py-1.5 px-4 shadow-sm hover:shadow-md transition duration-150 cursor-pointer rounded-lg h-8 border border-emerald-700"
            id="btn-print-pdf"
            title="Exportar Reporte a PDF en formato Oficial CARTA"
          >
            <Printer size={13} />
            <span>PDF Exportar</span>
          </button>
        </div>
      </header>

      {/* Main ledger canvas document */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-8 pb-16 printable-area select-none">
        
        {/* The general layout is extremely polished under the "Estudio Contable Ejecutivo" guidelines */}
        <div className="bg-white border border-gray-200 p-6 md:p-10 shadow-lg rounded-2xl excel-container min-h-[600px] flex flex-col justify-start">
          
          {/* Unified dynamic institutional letterhead ONLY printed on financial statement sheets */}
          {activeTab !== 'Portada' && activeTab !== 'Polizas' && (
            <ExcelHeader currentTab={activeTab} />
          )}

          {/* Active sheet view panel */}
          <div className="mt-2 transition duration-200" id="worksheet-window">
            {renderActiveGrid()}
          </div>
        </div>
      </main>

      {/* Floating mathematical calculator scratchpad panel */}
      <Scratchpad />

      {/* SUTIL FOOTER TAG DECK (NO-PRINT): Placed at the bottom edge as a secondary visual spreadsheet tabs ribbon */}
      <footer className="no-print bg-white border-t border-gray-200 select-none pb-1">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-2 text-[10.5px] text-gray-400 font-mono">
          <div className="flex items-center gap-1.5">
            <Eye size={12} className="text-gray-400" />
            <span>Expediente Contable Digital Oficial ─ Zitácuaro Importaciones, S.A.</span>
          </div>
          <span>Cifras Sin IVA (Inventarios Perpetuos)</span>
        </div>
      </footer>
    </div>
  );
}
