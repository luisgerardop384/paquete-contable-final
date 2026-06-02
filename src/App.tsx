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
    const activeAccountCodes = new Set<string>();
    policies.forEach((p) => {
      p.movements.forEach((m) => {
        activeAccountCodes.add(m.accountCode);
        if (m.subaccountCode) {
          activeAccountCodes.add(m.subaccountCode);
        }
      });
    });

    return (
      <div className="bg-white text-black min-h-screen p-0 m-0 select-none">
        {/* Real-time Dynamic CSS Injector to perfectly fit and style the PDF binder */}
        <style dangerouslySetInnerHTML={{ __html: `
          @media print {
            body {
              background: white !important;
              color: black !important;
              font-family: ui-sans-serif, system-ui, sans-serif !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .no-print {
              display: none !important;
            }
            .print-page-break {
              page-break-after: always !important;
              break-after: page !important;
              page-break-inside: avoid !important;
              break-inside: avoid !important;
              margin: 0 !important;
              padding: 10mm !important;
              min-height: 100vh !important;
              box-sizing: border-box !important;
            }
            table {
              font-size: 8.5px !important;
              width: 100% !important;
              border-collapse: collapse !important;
            }
            th, td {
              padding: 3px 5px !important;
              line-height: 1.2 !important;
            }
            h2, h3, h4 {
              margin-top: 4px !important;
              margin-bottom: 4px !important;
            }
            /* Hide empty states and logs in print */
            #scratchpad, .floating-calculator, button, nav, header, footer {
              display: none !important;
            }
          }
          @page {
            size: portrait;
            margin: 10mm;
          }
          .print-portrait {
            page: portrait;
          }
          .print-landscape {
            page: landscape;
            size: landscape;
          }
        `}} />
        
        {/* Page 1: Portada o Encabezado Ejecutivo */}
        <div className="print-page-break print-portrait flex justify-center items-center h-screen">
          <div className="w-full max-w-[800px]">
            <CompanyProfileTab />
          </div>
        </div>

        {/* Page 2: Catálogo de Cuentas */}
        <div className="print-page-break print-portrait">
          <div style={{ pageBreakAfter: 'avoid', breakAfter: 'avoid' }}>
            <ExcelHeader currentTab="Catalogo" />
          </div>
          <div className="mt-6 text-slate-800">
            <h3 className="text-sm font-sans font-extrabold text-slate-900 border-b border-gray-300 pb-2 mb-4 uppercase tracking-wider">
              Catálogo de Cuentas en Ejercicio (Solo Cuentas con Movimiento)
            </h3>
            <table className="w-full border-collapse text-[9.5px] font-sans">
              <thead>
                <tr className="bg-slate-100 border-b border-gray-300 font-mono text-[8px] uppercase tracking-wider text-gray-500">
                  <th className="border border-gray-200 px-3 py-1.5 text-left w-24">Código</th>
                  <th className="border border-gray-200 px-3 py-1.5 text-left">Nombre de la Cuenta / Subcuenta</th>
                  <th className="border border-gray-200 px-3 py-1.5 text-left w-36">Naturaleza / Nivel</th>
                </tr>
              </thead>
              <tbody>
                {accounts
                  .filter(acct => activeAccountCodes.has(acct.code))
                  .map((acct) => {
                    const subs = subaccounts.filter(sub => sub.parentCode === acct.code && activeAccountCodes.has(sub.code));
                    return (
                      <React.Fragment key={acct.code}>
                        <tr className="border font-semibold bg-white">
                          <td className="border border-gray-200 px-3 py-1 font-mono text-slate-900 font-bold">{acct.code}</td>
                          <td className="border border-gray-200 px-3 py-1 text-slate-900 font-extrabold">{acct.name}</td>
                          <td className="border border-gray-200 px-3 py-1 text-gray-500 text-[8.5px] font-mono">{acct.type}</td>
                        </tr>
                        {subs.map((sub) => (
                          <tr key={sub.code} className="border bg-slate-50/40 text-[8.5px]">
                            <td className="border border-gray-200 px-3 py-0.5 font-mono text-gray-500 pl-6">{sub.code}</td>
                            <td className="border border-gray-200 px-3 py-0.5 text-gray-600 pl-8 italic">↪ {sub.name}</td>
                            <td className="border border-gray-200 px-3 py-0.5 text-gray-400 font-mono italic">Subcuenta</td>
                          </tr>
                        ))}
                      </React.Fragment>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Page 3: Libro Diario */}
        <div className="print-page-break print-landscape">
          <div style={{ pageBreakAfter: 'avoid', breakAfter: 'avoid' }}>
            <ExcelHeader currentTab="Diario" />
          </div>
          <div className="mt-4" style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
            <JournalTab />
          </div>
        </div>

        {/* Page 4: Esquemas de Mayor */}
        <div className="print-page-break print-landscape">
          <div style={{ pageBreakAfter: 'avoid', breakAfter: 'avoid' }}>
            <ExcelHeader currentTab="Mayor" />
          </div>
          <div className="mt-4" style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
            <LedgerTab />
          </div>
        </div>

        {/* Page 5: Estado de Resultados */}
        <div className="print-page-break print-portrait">
          <div style={{ pageBreakAfter: 'avoid', breakAfter: 'avoid' }}>
            <ExcelHeader currentTab="ERe" />
          </div>
          <div className="mt-4" style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
            <IncomeStatementTab />
          </div>
        </div>

        {/* Page 6: Balance General */}
        <div className={`print-page-break ${balanceSheetFormat === 'Cuenta' ? 'print-landscape' : 'print-portrait'}`}>
          <div style={{ pageBreakAfter: 'avoid', breakAfter: 'avoid' }}>
            <ExcelHeader currentTab="ESFi" />
          </div>
          <div className="mt-4" style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
            <BalanceSheetTab />
          </div>
        </div>

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
