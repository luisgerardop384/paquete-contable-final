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
      <div className="bg-white text-black min-h-screen p-0 m-0 select-none print-canvas-binder">
        
        {/* INYECTOR DE REGLAS CSS EXCLUSIVAS PARA IMPRESIÓN PDF PERFECTA */}
        <style dangerouslySetInnerHTML={{__html: `
          @media print {
            body { background: white; color: black; }
            .no-print { display: none !important; }
            
            /* 1. PORTADA: Hoja única forzada */
            .print-portada-hoja-unica {
              page-break-before: always;
              page-break-after: always !important;
              break-after: page !important;
              height: 99vh !important;
              display: flex !important;
              flex-direction: column !important;
              justify-content: center !important;
              align-items: center !important;
            }

            /* Forzar saltos de hoja limpios entre secciones principales */
            .print-page-break {
              page-break-before: always !important;
              break-before: page !important;
              page-break-inside: avoid !important;
              margin: 0 !important;
              padding: 2.5rem !important;
            }

            /* Configuración de Orientación Dinámica */
            .print-portrait { page: portrait; }
            .print-landscape { page: landscape; }

            @page print-portrait { size: letter portrait; margin: 1.5cm; }
            @page print-landscape { size: letter landscape; margin: 1.5cm; }

            /* Evitar textos huerfanos */
            h2, h3, h4, .excel-header-block {
              page-break-after: avoid !important;
              break-after: avoid !important;
            }

            /* 2. OPTIMIZACIÓN LIBRO DIARIO (Se controla en JournalTab, pero blindamos el contenedor) */
            table { page-break-inside: auto !important; width: 100% !important; border-collapse: collapse !important; }
            tr { page-break-inside: avoid !important; page-break-after: auto !important; }
            thead { display: table-header-group !important; }

            /* 3. OPTIMIZACIÓN ESQUEMAS DE MAYOR: 3 Cuentas en T por Fila */
            .ledger-grid-print-container {
              display: grid !important;
              grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
              gap: 16px !important;
              width: 100% !important;
              page-break-inside: auto !important;
            }
            .ledger-grid-print-container > div {
              page-break-inside: avoid !important;
              break-inside: avoid !important;
              margin-bottom: 8px !important;
            }

            /* 5. SECCIÓN PÓLIZAS: Una por hoja impecable con firmas abajo */
            .print-poliza-page {
              page-break-before: always !important;
              break-before: page !important;
              page-break-after: always !important;
              break-after: page !important;
              height: 94vh !important;
              display: flex !important;
              flex-direction: column !important;
              justify-content: justify !important;
            }
            .print-poliza-firmas {
              margin-top: auto !important;
              padding-top: 1.5rem !important;
              border-top: 1px solid #cbd5e1 !important;
            }
          }
        `}} />

        {/* Page 1: Cover Page (Portada) */}
        <div className="w-full relative print-portrait print-portada-hoja-unica bg-white">
          <CompanyProfileTab />
        </div>

        {/* Page 2: Libro Diario */}
        <div className="print-page-break print-landscape">
          <ExcelHeader currentTab="Diario" />
          <div className="mt-4">
            <JournalTab />
          </div>
        </div>

        {/* Page 3: Esquemas de Mayor (Libro Mayor) */}
        <div className="print-page-break print-landscape">
          <ExcelHeader currentTab="Mayor" />
          <div className="mt-4 ledger-grid-print-container">
            <LedgerTab />
          </div>
        </div>

        {/* Page 4: Balanza de Comprobación */}
        <div className="print-page-break print-landscape">
          <ExcelHeader currentTab="Balanza" />
          <div className="mt-4">
            <TrialBalanceTab />
          </div>
        </div>

        {/* Page 5: Estado de Costo de lo Vendido */}
        <div className="print-page-break print-portrait">
          <ExcelHeader currentTab="ECoPyV" />
          <div className="mt-4">
            <CostOfGoodsTab />
          </div>
        </div>

        {/* Page 6: Estado de Resultados */}
        <div className="print-page-break print-portrait">
          <ExcelHeader currentTab="ERe" />
          <div className="mt-4">
            <IncomeStatementTab />
          </div>
        </div>

        {/* Page 7: Balance General */}
        <div className={`print-page-break ${balanceSheetFormat === 'Cuenta' ? 'print-landscape' : 'print-portrait'}`}>
          <ExcelHeader currentTab="ESFi" />
          <div className="mt-4">
            <BalanceSheetTab />
          </div>
        </div>

        {/* Page 8+: Sección de Pólizas individuales automáticas */}
        {sortedPolicies.map((pol, pIdx) => {
          const totalDebit = pol.movements.reduce((sum, mov) => sum + (mov.debit || 0), 0);
          const totalCredit = pol.movements.reduce((sum, mov) => sum + (mov.credit || 0), 0);
          return (
            <div key={`p-form-${pol.id}`} className="print-poliza-page p-12 print-portrait">
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

              {/* Recuadros de firmas físicas al calce forzados al fondo */}
              <div className="grid grid-cols-3 gap-6 text-[10px] text-center font-sans print-poliza-firmas">
                <div>
                  <div className="border-b border-gray-300 mx-auto max-w-[130px] h-9"></div>
                  <span className="font-extrabold text-slate-500 block uppercase mt-1 tracking-wider text-[8.5px]">Elaboró</span>
                  <span className="text-slate-800 font-black text-[11px] block">L.C. Luis Gerardo Perez</span>
                  <span className="text-[9.5px] text-gray-400 font-mono italic">Auxiliar Contable</span>
                </div>
                <div>
                  <div className="border-b border-gray-300 mx-auto max-w-[130px] h-9"></div>
                  <span className="font-extrabold text-slate-500 block uppercase mt-1 tracking-wider text-[8.5px]">Revisó</span>
                  <span className="text-slate-800 font-black text-[11px] block">L.C. Gerardo Pérez</span>
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
