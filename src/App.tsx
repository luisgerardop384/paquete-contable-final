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
import { Printer, Calculator, Eye, Briefcase } from 'lucide-react';

export default function App() {
  const { 
    activeTab, 
    setActiveTab, 
    companyHeader, 
    isScratchpadOpen, 
    setScratchpadOpen,
    isPrintingAll,
    policies = [],
    accounts = [],
    subaccounts = [],
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
    const chunkedPolicies = [];
    for (let i = 0; i < sortedPolicies.length; i += 4) {
      chunkedPolicies.push(sortedPolicies.slice(i, i + 4));
    }

    return (
      <div className="bg-white text-black min-h-screen p-0 m-0 print-pages-canvas select-none">
        
        {/* Page 1: Cover Page */}
        <div className="w-full relative flex justify-center items-center print-portrait print-portada-hoja-unica bg-white">
          <CompanyProfileTab />
        </div>

        {/* Page 2: Libro Diario */}
        <div className="print-page-break p-12 print-landscape">
          <div style={{ pageBreakAfter: 'avoid', breakAfter: 'avoid' }}>
            <ExcelHeader currentTab="Diario" />
          </div>
          <div className="mt-6" style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
            <JournalTab />
          </div>
        </div>

        {/* Page 3: Esquemas de Mayor */}
        <div className="print-page-break p-12 print-landscape">
          <div style={{ pageBreakAfter: 'avoid', breakAfter: 'avoid' }}>
            <ExcelHeader currentTab="Mayor" />
          </div>
          <div className="mt-6" style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
            <LedgerTab />
          </div>
        </div>

        {/* Page 4: Balanza de Comprobación */}
        <div className="print-page-break p-12 print-landscape">
          <div style={{ pageBreakAfter: 'avoid', breakAfter: 'avoid' }}>
            <ExcelHeader currentTab="Balanza" />
          </div>
          <div className="mt-6" style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
            <TrialBalanceTab />
          </div>
        </div>

        {/* Page 5: Estado de Costo de lo Vendido */}
        <div className="print-page-break p-12 print-portrait">
          <div style={{ pageBreakAfter: 'avoid', breakAfter: 'avoid' }}>
            <ExcelHeader currentTab="ECoPyV" />
          </div>
          <div className="mt-6" style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
            <CostOfGoodsTab />
          </div>
        </div>

        {/* Page 6: Estado de Resultados */}
        <div className="print-page-break p-12 print-portrait">
          <div style={{ pageBreakAfter: 'avoid', breakAfter: 'avoid' }}>
            <ExcelHeader currentTab="ERe" />
          </div>
          <div className="mt-6" style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
            <IncomeStatementTab />
          </div>
        </div>

        {/* Page 7: Balance General */}
        <div className={`print-page-break p-12 ${balanceSheetFormat === 'Cuenta' ? 'print-landscape' : 'print-portrait'}`}>
          <div style={{ pageBreakAfter: 'avoid', breakAfter: 'avoid' }}>
            <ExcelHeader currentTab="ESFi" />
          </div>
          <div className="mt-6" style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
            <BalanceSheetTab />
          </div>
        </div>

        {/* Page 8+: Sección de Pólizas ordenadas de 4 por hoja */}
        {chunkedPolicies.map((chunk, chunkIdx) => (
          <div 
            key={`chunk-page-${chunkIdx}`} 
            className="print-page-break p-12 print-portrait flex flex-col justify-between min-h-[92vh]"
            style={{ pageBreakAfter: 'always', breakAfter: 'page' }}
          >
            <div className="grid grid-cols-2 grid-rows-2 gap-4 h-[95vh] w-full">
              {chunk.map((pol) => {
                const totalDebit = pol.movements.reduce((sum, mov) => sum + (mov.debit || 0), 0);
                const totalCredit = pol.movements.reduce((sum, mov) => sum + (mov.credit || 0), 0);
                return (
                  <div key={`p-card-${pol.id}`} className="border border-gray-300 p-2 rounded flex flex-col justify-between h-full bg-white text-[10px] shadow-sm">
                    <div>
                      <div className="flex justify-between items-start border-b border-gray-300 pb-1 mb-1">
                        <div>
                          <h4 className="font-extrabold text-slate-900 leading-tight uppercase text-[9px]">
                            ZITÁCUARO IMPORTACIONES
                          </h4>
                          <span className="text-[7.5px] font-mono text-gray-400 block font-semibold">S.A. DE C.V.</span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-slate-800 bg-slate-100 px-1 py-0.2 rounded border border-gray-200 uppercase font-mono text-[7.5px]">
                            POL: {pol.type ? pol.type.toUpperCase() : 'DIARIO'} - {pol.number}
                          </span>
                          <p className="text-[7.5px] text-gray-400 font-mono mt-0.5">{pol.date}</p>
                        </div>
                      </div>

                      <div className="mb-1.5 bg-slate-50 border border-gray-150 p-1 rounded-sm text-[7.5px] leading-tight text-gray-700">
                        <span className="font-extrabold text-gray-400 uppercase text-[6.5px] block font-bold">Concepto:</span>
                        <span className="font-semibold block truncate max-w-full" title={pol.concept}>
                          {pol.concept || 'Concepto no especificado'}
                        </span>
                      </div>

                      <table className="w-full border-collapse border border-gray-200 text-[7.5px] font-sans">
                        <thead>
                          <tr className="bg-slate-100 border-b border-gray-200 text-gray-500 font-mono text-[6.5px] uppercase tracking-wide">
                            <th className="px-1 py-0.5 text-center border-r border-gray-200 font-bold w-12">Clave</th>
                            <th className="px-1 py-0.5 text-left border-r border-gray-200 font-bold">Cuenta - Registro</th>
                            <th className="px-1 py-0.5 text-right border-r border-gray-200 font-bold w-14">Debe ($)</th>
                            <th className="px-1 py-0.5 text-right font-bold w-14">Haber ($)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {pol.movements.map((mov, mIdx) => {
                            const foundAcct = accounts.find((a) => a.code === mov.accountCode);
                            const acctName = foundAcct ? foundAcct.name : 'Cuenta Auxiliar';
                            return (
                              <React.Fragment key={mIdx}>
                                <tr className="border-b border-gray-150 text-slate-800 h-5">
                                  <td className="border-r border-gray-200 text-center font-mono py-0.2 text-[7px] text-gray-500 font-semibold">
                                    {mov.accountCode}
                                  </td>
                                  <td className="border-r border-gray-200 px-1 font-bold truncate max-w-[120px] text-slate-800">
                                    {acctName}
                                  </td>
                                  <td className="border-r border-gray-200 px-1 text-right font-mono text-blue-900 font-bold">
                                    {mov.debit ? `$${mov.debit.toLocaleString('es-MX', { minimumFractionDigits: 2 })}` : ''}
                                  </td>
                                  <td className="px-1 text-right font-mono text-red-900 font-bold">
                                    {mov.credit ? `$${mov.credit.toLocaleString('es-MX', { minimumFractionDigits: 2 })}` : ''}
                                  </td>
                                </tr>

                                {mov.subaccountCode && (() => {
                                  const foundSub = subaccounts.find((s) => s.code === mov.subaccountCode && s.parentCode === mov.accountCode);
                                  const subName = foundSub ? foundSub.name : 'Subcuenta Detalle';
                                  return (
                                    <tr className="border-b border-gray-100 text-gray-400 italic text-[7px] h-4">
                                      <td className="border-r border-gray-200 text-center font-mono">
                                        {mov.subaccountCode}
                                      </td>
                                      <td className="border-r border-gray-200 px-1 truncate max-w-[120px] pl-2 font-normal text-gray-500">
                                        ↪ {subName}
                                      </td>
                                      <td className="border-r border-gray-200 px-1 text-right font-mono text-[6.5px]">
                                        {mov.debit ? `$${mov.debit.toLocaleString('es-MX', { minimumFractionDigits: 2 })}` : ''}
                                      </td>
                                      <td className="px-1 text-right font-mono text-[6.5px]">
                                        {mov.credit ? `$${mov.credit.toLocaleString('es-MX', { minimumFractionDigits: 2 })}` : ''}
                                      </td>
                                    </tr>
                                  );
                                })()}
                              </React.Fragment>
                            );
                          })}
                          <tr className="bg-slate-50 border-t border-gray-300 font-extrabold h-5 text-[7px] text-slate-900">
                            <td colSpan={2} className="px-1 text-right border-r border-gray-200 text-slate-650 font-mono uppercase font-bold text-[6px]">
                              Sumas:
                            </td>
                            <td className="border-r border-gray-200 px-1 text-right text-blue-950 font-mono font-black text-[7.5px]">
                              ${totalDebit.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                            </td>
                            <td className="px-1 text-right text-red-950 font-mono font-black text-[7.5px]">
                              ${totalCredit.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <div className="grid grid-cols-3 gap-1 text-[6px] text-center border-t border-gray-200 pt-1 mt-1 font-sans">
                      <div>
                        <div className="border-b border-gray-200 h-2 mx-auto max-w-[40px]"></div>
                        <span className="text-gray-400 block font-bold uppercase text-[5px]">Elaboró</span>
                        <span className="text-slate-800 font-extrabold block truncate">L.C. Luis Gerardo Perez</span>
                      </div>
                      <div>
                        <div className="border-b border-gray-200 h-2 mx-auto max-w-[40px]"></div>
                        <span className="text-gray-400 block font-bold uppercase text-[5px]">Revisó</span>
                        <span className="text-slate-800 font-extrabold block truncate">L.C. Gerardo Pérez</span>
                      </div>
                      <div>
                        <div className="border-b border-gray-200 h-2 mx-auto max-w-[40px]"></div>
                        <span className="text-gray-400 block font-bold uppercase text-[5px]">Autorizó</span>
                        <span className="text-slate-800 font-extrabold block truncate text-slate-705">Dir. Finanzas</span>
                      </div>
                    </div>
                  </div>
                );
              })}
              {chunk.length < 4 && Array.from({ length: 4 - chunk.length }).map((_, emptyIdx) => (
                <div key={`empty-cell-${emptyIdx}`} className="border border-dashed border-gray-200 p-2 rounded h-full bg-slate-50/20"></div>
              ))}
            </div>
          </div>
        ))}

      </div>
    );
  }

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
      <header className="no-print bg-white border-b border-gray-200 w-full flex flex-col md:flex-row justify-between items-center px-6 md:px-10 py-1 shadow-sm sticky top-0 z-40 select-none">
        <div className="flex items-center gap-2 py-2 truncate max-w-[300px]">
          <Briefcase className="text-emerald-600 hover:scale-105 transition" size={16} />
          <h2 className="font-sans font-black text-[12px] uppercase tracking-widest text-gray-800 truncate" title={companyHeader?.companyName}>
            {companyHeader?.companyName || 'Estudio Contable'}
          </h2>
          <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.2 rounded font-medium font-mono border border-gray-150">
            Perpetuos
          </span>
        </div>

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

        <div className="flex items-center gap-3 py-2 shrink-0">
          <button
            onClick={() => setScratchpadOpen(!isScratchpadOpen)}
            className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-gray-700 text-[11px] font-sans font-bold py-1.5 px-3 border border-gray-200 hover:border-gray-300 transition cursor-pointer rounded-lg shadow-sm h-8"
            id="btn-toggle-scratchpad"
          >
            <Calculator size={13} className="text-gray-500" />
            <span>Lápiz Contable</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-750 text-white text-[11px] font-sans font-extrabold py-1.5 px-4 shadow-sm hover:shadow-md transition duration-150 cursor-pointer rounded-lg h-8 border border-emerald-700"
            id="btn-print-pdf"
          >
            <Printer size={13} />
            <span>PDF Exportar</span>
          </button>
        </div>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-8 pb-16 printable-area select-none">
        <div className="bg-white border border-gray-200 p-6 md:p-10 shadow-lg rounded-2xl excel-container min-h-[600px] flex flex-col justify-start">
          {activeTab !== 'Portada' && activeTab !== 'Polizas' && (
            <ExcelHeader currentTab={activeTab} />
          )}

          <div className="mt-2 transition duration-200" id="worksheet-window">
            {renderActiveGrid()}
          </div>
        </div>
      </main>

      <Scratchpad />

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
