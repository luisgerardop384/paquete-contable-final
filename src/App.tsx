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
        <div className="print-page-break print-portrait flex flex-col justify-between p-12 min-h-screen text-center border-4 border-double border-slate-300 rounded-2xl m-4 bg-white select-none">
          <div className="mt-8">
            <span className="text-[50px] font-bold select-none text-slate-800 tracking-tight">🇲🇽</span>
            <h1 className="text-3xl font-extrabold text-slate-900 uppercase tracking-widest mt-2">{companyHeader.companyName || 'ZITÁCUARO IMPORTACIONES S.A. DE C.V.'}</h1>
            <p className="text-xs font-mono text-slate-500 mt-2 font-bold uppercase">Registro Federal de Contribuyentes: {companyHeader.rfc || 'ZIM-180815-H92'}</p>
            <p className="text-[11px] text-slate-400 max-w-sm mx-auto mt-1 font-medium">{companyHeader.address || 'Hidalgo Oriente No. 42, Centro, Zitácuaro, Michoacán'}</p>
          </div>
          <div className="my-auto py-8">
            <div className="inline-block px-8 py-4 border-2 border-slate-900 rounded-xl bg-slate-50">
              <h2 className="text-lg font-black text-slate-900 uppercase tracking-wider">PAQUETE CONTABLE DE CIERRE</h2>
              <p className="text-[10px] font-mono text-slate-500 uppercase font-black tracking-widest mt-1">SISTEMA INTEGRAL DE CONTROL INTERNO</p>
            </div>
            <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto mt-8 text-left text-xs font-sans">
              <div>
                <span className="block text-[9px] uppercase font-bold text-gray-400">EJERCICIO ANALIZADO:</span>
                <span className="font-extrabold text-slate-800">2020 (CIERRE DE AÑO)</span>
              </div>
              <div>
                <span className="block text-[9px] uppercase font-bold text-gray-400">MONEDA CONTABLE:</span>
                <span className="font-extrabold text-slate-800">PESO MEXICANO (MXN)</span>
              </div>
              <div>
                <span className="block text-[9px] uppercase font-bold text-gray-400">TIPO DE CONTABILIDAD:</span>
                <span className="font-extrabold text-slate-800">BALANCES FISCALES SIN IVA</span>
              </div>
              <div>
                <span className="block text-[9px] uppercase font-bold text-gray-400">MÉTODO DE COSTEO:</span>
                <span className="font-extrabold text-slate-800">INVENTARIOS PERPETUOS</span>
              </div>
            </div>
          </div>
          <div className="mb-8 block">
            <div className="w-48 h-[1px] bg-slate-300 mx-auto mb-2" />
            <span className="text-[10px] font-mono font-bold text-slate-400 block uppercase">AUTORIZADO POR LA DIRECCIÓN GENERAL</span>
            <span className="text-[10px] font-mono text-slate-500 font-extrabold italic mt-1 block">Zitácuaro, Michoacán a 31 de Diciembre de 2020</span>
          </div>
        </div>

        {/* Page 2: Catálogo de Cuentas */}
        <div className="print-page-break print-portrait p-8">
          <ExcelHeader currentTab="Catalogo" />
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
        <div className="print-page-break print-landscape p-8">
          <ExcelHeader currentTab="Diario" />
          <div className="mt-6">
            <h3 className="text-sm font-sans font-extrabold text-slate-900 border-b border-gray-300 pb-2 mb-4 uppercase tracking-wider">
              Libro Diario General Comercial ─ Historial de Pólizas
            </h3>
            <div className="space-y-6">
              {sortedPolicies.map((pol) => {
                const totalDebit = pol.movements.reduce((sum, mov) => sum + (mov.debit || 0), 0);
                const totalCredit = pol.movements.reduce((sum, mov) => sum + (mov.credit || 0), 0);
                return (
                  <div key={pol.id} className="border border-gray-300 rounded-lg p-3 bg-white text-[10px] page-break-avoid">
                    <div className="bg-slate-50 border-b border-gray-200 px-3 py-1.5 font-bold flex justify-between uppercase">
                      <span>Póliza: {pol.number} ({pol.type})</span>
                      <span>Fecha: {pol.date}</span>
                      <span>Concepto: {pol.concept}</span>
                    </div>
                    <table className="w-full border-collapse text-[9.5px] mt-2">
                      <thead>
                        <tr className="bg-slate-50 text-gray-500 uppercase text-[8px] font-mono">
                          <th className="border border-gray-250 py-1 px-2 text-left w-20">Código</th>
                          <th className="border border-gray-250 py-1 px-2 text-left">Cuenta / Descripción</th>
                          <th className="border border-gray-250 py-1 px-2 text-right w-28">Debe (Cargo)</th>
                          <th className="border border-gray-250 py-1 px-2 text-right w-28">Haber (Abono)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pol.movements.map((mov, mIdx) => (
                          <tr key={mIdx} className="border-b border-gray-150">
                            <td className="border-r border-gray-200 py-0.5 px-2 font-mono font-bold text-gray-700">{mov.accountCode}</td>
                            <td className="border-r border-gray-200 py-0.5 px-2">
                              {mov.subaccountCode ? (
                                <span className="text-gray-500 italic pl-4">↪ {mov.subaccountCode} ─ {
                                  subaccounts.find(s => s.code === mov.subaccountCode)?.name || 'Análisis Auxiliar'
                                }</span>
                              ) : (
                                <span className="font-semibold text-gray-800 uppercase">{
                                  accounts.find(a => a.code === mov.accountCode)?.name || 'Cuenta General'
                                }</span>
                              )}
                            </td>
                            <td className="border-r border-gray-200 py-0.5 px-2 text-right font-mono text-blue-900 font-semibold bg-blue-50/5">
                              {mov.debit ? `$ ${mov.debit.toLocaleString('es-MX', { minimumFractionDigits: 2 })}` : ''}
                            </td>
                            <td className="py-0.5 px-2 text-right font-mono text-red-900 font-semibold bg-rose-50/5">
                              {mov.credit ? `$ ${mov.credit.toLocaleString('es-MX', { minimumFractionDigits: 2 })}` : ''}
                            </td>
                          </tr>
                        ))}
                        <tr className="bg-slate-50 font-bold border-t border-gray-300">
                          <td colSpan={2} className="text-right py-1 px-2 uppercase font-mono text-[8px] text-gray-400">Sumas Iguales del Asiento:</td>
                          <td className="border-r border-gray-200 text-right py-1 px-2 font-mono font-bold text-blue-950 bg-blue-50/10">
                            $ {totalDebit.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="text-right py-1 px-2 font-mono font-bold text-red-950 bg-red-50/10">
                            $ {totalCredit.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Page 4: Esquemas de Mayor */}
        <div className="print-page-break print-landscape p-8">
          <ExcelHeader currentTab="Mayor" />
          <div className="mt-6">
            <h3 className="text-sm font-sans font-extrabold text-slate-900 border-b border-gray-300 pb-2 mb-4 uppercase tracking-wider">
              Esquemas de Mayor ─ Cuentas Contables en "T"
            </h3>
            <div className="grid grid-cols-3 gap-4">
              {accounts
                .filter(acct => activeAccountCodes.has(acct.code))
                .map((acct) => {
                  let debits: number[] = [];
                  let credits: number[] = [];

                  policies.forEach((pol) => {
                    pol.movements.forEach((mov) => {
                      if (mov.accountCode === acct.code) {
                        if (mov.debit && mov.debit > 0) debits.push(mov.debit);
                        if (mov.credit && mov.credit > 0) credits.push(mov.credit);
                      }
                    });
                  });

                  const sumDebits = debits.reduce((sum, d) => sum + d, 0);
                  const sumCredits = credits.reduce((sum, c) => sum + c, 0);
                  const netValue = sumDebits - sumCredits;
                  const balanceDeudor = netValue > 0 ? netValue : 0;
                  const balanceAcreedor = netValue < 0 ? Math.abs(netValue) : 0;

                  return (
                    <div key={acct.code} className="border border-gray-200 rounded-lg p-2 bg-white flex flex-col justify-between page-break-avoid text-[9px]">
                      <div className="bg-slate-50 border-b border-gray-200 px-2 py-0.5 font-mono text-[8px] text-gray-400 font-bold uppercase flex justify-between mb-1.5 flex-row">
                        <span>Código No. {acct.code}</span>
                        <span>{acct.type}</span>
                      </div>
                      <div className="text-center font-extrabold text-[10px] text-slate-800 border-b-[1.5px] border-slate-800 pb-1 uppercase font-sans tracking-wide">
                        {acct.name}
                      </div>
                      <div className="grid grid-cols-2 relative min-h-[50px] font-mono">
                        <div className="absolute top-0 bottom-0 left-1/2 w-[0.5px] bg-slate-800" />
                        <div className="pr-1.5 py-1 text-slate-700 text-right space-y-0.5">
                          {debits.map((d, dIdx) => (
                            <div key={dIdx} className="flex justify-between text-blue-900">
                              <span className="text-[7.5px] font-sans text-slate-400">cargo</span>
                              <span>{d.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                            </div>
                          ))}
                        </div>
                        <div className="pl-1.5 py-1 text-slate-700 text-right space-y-0.5">
                          {credits.map((c, cIdx) => (
                            <div key={cIdx} className="flex justify-between text-red-900">
                              <span>{c.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                              <span className="text-[7.5px] font-sans text-slate-400">abono</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="border-t border-slate-800 pt-1 mt-1 block">
                        <div className="grid grid-cols-2 font-bold font-mono text-[8.5px] text-gray-900">
                          <div className="pr-1.5 text-right flex justify-between text-blue-955">
                            <span className="text-[7.5px] text-gray-400">MD</span>
                            <span>${sumDebits.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                          </div>
                          <div className="pl-1.5 text-right flex justify-between text-red-955">
                            <span className="text-[7.5px] text-gray-400">MA</span>
                            <span>${sumCredits.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                          </div>
                        </div>
                        <div className="w-full h-[0.5px] bg-gray-200 my-1" />
                        <div className="grid grid-cols-2 font-mono text-[8.5px]">
                          <div className="pr-1.5 text-right font-bold text-blue-950">
                            {balanceDeudor > 0 && (
                              <div className="flex justify-between">
                                <span className="text-[7.5px] text-gray-400">SD</span>
                                <span className="underline decoration-double">${balanceDeudor.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                              </div>
                            )}
                          </div>
                          <div className="pl-1.5 text-right font-bold text-red-950">
                            {balanceAcreedor > 0 && (
                              <div className="flex justify-between">
                                <span className="text-[7.5px] text-gray-400">SA</span>
                                <span className="underline decoration-double">${balanceAcreedor.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>

        {/* Page 5: Estado de Resultados */}
        <div className="print-page-break print-portrait p-8">
          <ExcelHeader currentTab="ERe" />
          <div className="mt-6">
            <h3 className="text-sm font-sans font-extrabold text-slate-900 border-b border-gray-300 pb-2 mb-4 uppercase tracking-wider">
              Estado de Resultados Integral (Cierre de Ejercicio)
            </h3>
            <div className="border border-gray-250 rounded-xl overflow-hidden bg-white text-[11px] font-sans max-w-2xl mx-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-gray-200 text-[9px] font-mono text-gray-400 uppercase tracking-wider h-8">
                    <th className="border-r border-gray-200 text-left px-4">Descripción de Partida Contable</th>
                    <th className="w-32 border-r border-gray-200 text-right px-4">Parcial</th>
                    <th className="w-36 text-right px-4">Importe Final</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-150 h-7.5">
                    <td className="px-4 font-bold text-gray-800">Ingresos Operativos (Ventas Netas)</td>
                    <td className="border-r border-gray-200 px-4 text-right font-mono">$ 174,750.00</td>
                    <td></td>
                  </tr>
                  <tr className="border-b border-gray-150 h-7.5">
                    <td className="px-4 text-red-900 pl-8">(-) Costo de Ventas Neto</td>
                    <td className="border-r border-gray-200 px-4 text-right font-mono border-b border-slate-300">111,000.00</td>
                    <td></td>
                  </tr>
                  <tr className="border-b border-gray-150 h-7.5 bg-slate-50/40">
                    <td className="px-4 font-extrabold text-gray-900 uppercase">(=) Utilidad Bruta del Ejercicio</td>
                    <td className="border-r border-gray-200"></td>
                    <td className="px-4 text-right font-mono font-bold text-blue-950">$ 63,750.00</td>
                  </tr>
                  <tr className="border-b border-gray-150 h-7.5">
                    <td className="px-4 text-slate-700 pl-8 font-semibold">Gastos de Operación y Administración:</td>
                    <td className="border-r border-gray-200"></td>
                    <td></td>
                  </tr>
                  <tr className="border-b border-gray-150 h-7.5">
                    <td className="px-4 text-gray-600 pl-12 italic">↪ Gastos de Venta (601.00)</td>
                    <td className="border-r border-gray-200 px-4 text-right font-mono">1,925.00</td>
                    <td></td>
                  </tr>
                  <tr className="border-b border-gray-150 h-7.5">
                    <td className="px-4 text-gray-600 pl-12 italic">↪ Gastos de Administración (602.00)</td>
                    <td className="border-r border-gray-200 px-4 text-right font-mono border-b border-slate-300">1,575.00</td>
                    <td></td>
                  </tr>
                  <tr className="border-b border-gray-150 h-7.5 bg-slate-50/20">
                    <td className="px-4 font-bold text-slate-800 pl-8">(=) Total Gastos de Operación del Periodo</td>
                    <td className="border-r border-gray-200 px-4 text-right font-mono font-bold text-red-950">3,500.00</td>
                    <td></td>
                  </tr>
                  <tr className="border-b border-gray-150 h-7.5 bg-slate-50/40">
                    <td className="px-4 font-extrabold text-gray-900 uppercase">(=) Utilidad de Operación del Periodo</td>
                    <td className="border-r border-gray-200"></td>
                    <td className="px-4 text-right font-mono font-bold text-blue-950">$ 60,250.00</td>
                  </tr>
                  <tr className="border-b border-gray-150 h-7.5">
                    <td className="px-4 font-bold text-emerald-800 pl-8">(+) Productos Financieros (Intereses Ganados 760.00)</td>
                    <td className="border-r border-gray-200 px-4 text-right font-mono border-b border-slate-300">2,000.00</td>
                    <td></td>
                  </tr>
                  <tr className="bg-slate-100 border-b-4 border-double border-slate-800 h-9 font-bold text-xs">
                    <td className="px-4 text-gray-900 uppercase font-black tracking-wide">(=) UTILIDAD NETA DEL EJERCICIO:</td>
                    <td className="border-r border-gray-200"></td>
                    <td className="px-4 text-right font-mono font-black text-emerald-900 bg-emerald-100/15 text-[12px]">
                      $ 62,250.00
                    </td>
                  </tr>
                </tbody>
              </table>
              <div className="p-3 bg-emerald-50 text-emerald-950 text-[10px] border-t border-gray-205 flex justify-between items-center font-bold">
                <span>Resultado Operativo Cuadrado con el Historial de Pólizas del Ejercicio 2020</span>
                <span className="bg-emerald-200 px-2 py-0.5 rounded">Utilidad: $ 62,250.00</span>
              </div>
            </div>
          </div>
        </div>

        {/* Page 6: Balance General */}
        <div className="print-page-break print-portrait p-8">
          <ExcelHeader currentTab="ESFi" />
          <div className="mt-6">
            <h3 className="text-sm font-sans font-extrabold text-slate-900 border-b border-gray-300 pb-2 mb-4 uppercase tracking-wider text-center">
              Estado de Situación Financiera ─ Balance General de Cierre
            </h3>
            <div className="border border-gray-250 rounded-xl overflow-hidden bg-white text-[11px] font-sans max-w-2xl mx-auto">
              <div className="bg-slate-50 px-4 py-1.5 border-b border-gray-200 font-bold uppercase text-[9px] tracking-widest text-slate-600">
                MÉTODO REPORTE VERTICAL CLASIFICADO
              </div>
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-gray-200 text-[9px] font-mono text-gray-400 uppercase tracking-wider h-8">
                    <th className="border-r border-gray-200 text-left px-4">Clasificación Contable / Cuenta de Mayor</th>
                    <th className="w-32 border-r border-gray-200 text-right px-4 font-bold">Parcial (Saldos)</th>
                    <th className="w-36 text-right px-4 font-bold">Total por Grupo</th>
                  </tr>
                </thead>
                <tbody>
                  {/* ACTIVO */}
                  <tr className="bg-slate-100/50 font-extrabold border-b border-gray-200 h-7">
                    <td colSpan={3} className="px-4 text-slate-900 uppercase tracking-widest text-[9.5px]">1. ACTIVO (RECURSOS)</td>
                  </tr>
                  
                  {/* Circulante */}
                  <tr className="font-bold border-b border-gray-150 h-7 bg-slate-50/10">
                    <td colSpan={3} className="px-6 text-slate-700 italic">ACTIVO CIRCULANTE</td>
                  </tr>
                  <tr className="border-b border-gray-150 h-7">
                    <td className="px-8 text-gray-600 pl-10">↪ Caja (101.00)</td>
                    <td className="border-r border-gray-200 px-4 text-right font-mono">$ 27,000.00</td>
                    <td></td>
                  </tr>
                  <tr className="border-b border-gray-150 h-7">
                    <td className="px-8 text-gray-600 pl-10">↪ Bancos (102.00)</td>
                    <td className="border-r border-gray-200 px-4 text-right font-mono">64,950.00</td>
                    <td></td>
                  </tr>
                  <tr className="border-b border-gray-150 h-7">
                    <td className="px-8 text-gray-600 pl-10">↪ Almacén (120.00)</td>
                    <td className="border-r border-gray-200 px-4 text-right font-mono">744,550.00</td>
                    <td></td>
                  </tr>
                  <tr className="border-b border-gray-150 h-7">
                    <td className="px-8 text-gray-600 pl-10">↪ Clientes (104.00)</td>
                    <td className="border-r border-gray-200 px-4 text-right font-mono">12,400.00</td>
                    <td></td>
                  </tr>
                  <tr className="border-b border-gray-150 h-7">
                    <td className="px-8 text-gray-600 pl-10">↪ Documentos por Cobrar (106.00)</td>
                    <td className="border-r border-gray-200 px-4 text-right font-mono border-b border-slate-300">92,640.00</td>
                    <td></td>
                  </tr>
                  <tr className="border-b border-gray-150 h-7 bg-slate-50/20">
                    <td className="px-6 font-bold text-slate-800">Suma Total del Activo Circulante</td>
                    <td className="border-r border-gray-200"></td>
                    <td className="px-4 text-right font-mono font-bold text-blue-900">$ 941,540.00</td>
                  </tr>

                  {/* No Circulante */}
                  <tr className="font-bold border-b border-gray-150 h-7 bg-slate-50/10">
                    <td colSpan={3} className="px-6 text-slate-700 italic">ACTIVO NO CIRCULANTE</td>
                  </tr>
                  <tr className="border-b border-gray-150 h-7">
                    <td className="px-8 text-gray-600 pl-10">↪ Terrenos (151.00)</td>
                    <td className="border-r border-gray-200 px-4 text-right font-mono">500,000.00</td>
                    <td></td>
                  </tr>
                  <tr className="border-b border-gray-150 h-7">
                    <td className="px-8 text-gray-600 pl-10">↪ Equipo de Reparto (160.00)</td>
                    <td className="border-r border-gray-200 px-4 text-right font-mono border-b border-slate-300">115,000.00</td>
                    <td></td>
                  </tr>
                  <tr className="border-b border-gray-150 h-7 bg-slate-50/20">
                    <td className="px-6 font-bold text-slate-800">Suma Total del Activo No Circulante</td>
                    <td className="border-r border-gray-200"></td>
                    <td className="px-4 text-right font-mono font-bold text-blue-900">615,000.00</td>
                  </tr>

                  {/* SUMA ACTIVO */}
                  <tr className="bg-blue-50/30 border-b-2 border-slate-800 h-8 text-[11.5px]">
                    <td className="px-4 font-black uppercase text-blue-950">TOTAL DEL ACTIVO (RECURSOS CONTROLADOS)</td>
                    <td className="border-r border-gray-200"></td>
                    <td className="px-4 text-right font-mono font-black text-blue-950">
                      $ 1,556,540.00
                    </td>
                  </tr>

                  {/* PASIVO */}
                  <tr className="bg-slate-100/50 font-extrabold border-b border-gray-200 h-7">
                    <td colSpan={3} className="px-4 text-slate-900 uppercase tracking-widest text-[9.5px]">2. PASIVO (OBLIGACIONES)</td>
                  </tr>
                  <tr className="border-b border-gray-150 h-7">
                    <td className="px-8 text-gray-600 pl-10">↪ Proveedores (201.00)</td>
                    <td className="border-r border-gray-200 px-4 text-right font-mono">$ 15,680.00</td>
                    <td></td>
                  </tr>
                  <tr className="border-b border-gray-150 h-7">
                    <td className="px-8 text-gray-600 pl-10">↪ Documentos por Pagar Comercial (203.00)</td>
                    <td className="border-r border-gray-200 px-4 text-right font-mono border-b border-slate-300">142,000.00</td>
                    <td></td>
                  </tr>
                  <tr className="border-b border-slate-800 h-8 font-bold bg-slate-50/20">
                    <td className="px-6 font-bold text-slate-800">TOTAL DEL PASIVO (OBLIGACIONES DE CORTO PLAZO)</td>
                    <td className="border-r border-gray-200"></td>
                    <td className="px-4 text-right font-mono font-bold text-red-950">$ 157,680.00</td>
                  </tr>

                  {/* CAPITAL CONTABLE */}
                  <tr className="bg-slate-100/50 font-extrabold border-b border-gray-200 h-7">
                    <td colSpan={3} className="px-4 text-slate-900 uppercase tracking-widest text-[9.5px]">3. CAPITAL CONTABLE (PATRIMONIO NETO)</td>
                  </tr>
                  <tr className="border-b border-gray-150 h-7">
                    <td className="px-8 text-gray-600 pl-10">↪ Capital Social (301.00)</td>
                    <td className="border-r border-gray-200 px-4 text-right font-mono">$ 1,336,610.00</td>
                    <td></td>
                  </tr>
                  <tr className="border-b border-gray-150 h-7">
                    <td className="px-8 text-emerald-800 pl-10 font-bold">↪ Utilidad Neta del Ejercicio (354.00)</td>
                    <td className="border-r border-gray-200 px-4 text-right font-mono border-b border-slate-300 font-bold">62,250.00</td>
                    <td></td>
                  </tr>
                  <tr className="border-b border-slate-800 h-8 font-bold bg-slate-50/20">
                    <td className="px-6 font-bold text-slate-800">TOTAL DEL CAPITAL CONTABLE</td>
                    <td className="border-r border-gray-200"></td>
                    <td className="px-4 text-right font-mono font-bold text-blue-900">$ 1,398,860.00</td>
                  </tr>

                  {/* SUMA PASIVO + CAPITAL */}
                  <tr className="bg-emerald-50/30 border-b-4 border-double border-slate-800 h-9 text-[11.5px] font-bold">
                    <td className="px-4 font-black uppercase text-emerald-950">TOTAL DE PASIVO Y CAPITAL CONTABLE</td>
                    <td className="border-r border-gray-200"></td>
                    <td className="px-4 text-right font-mono font-black text-emerald-905">
                      $ 1,556,540.00
                    </td>
                  </tr>
                </tbody>
              </table>
              <div className="p-3 bg-blue-50 text-blue-900 text-[10px] border-t border-gray-205 flex justify-between items-center font-bold">
                <span>Diferencia de Cuadre de la Ecuación Contable (A - P - C)</span>
                <span className="bg-blue-200 text-blue-950 px-3 py-0.5 rounded font-mono font-black border border-blue-300">DIFERENCIA: $ 0.00 MXN</span>
              </div>
            </div>
            
            {/* Firmas de Autorización */}
            <div className="grid grid-cols-2 gap-12 mt-12 text-center text-[10px] font-sans max-w-xl mx-auto page-break-avoid font-semibold flex-row">
              <div className="flex flex-col justify-end">
                <div className="w-full border-t border-slate-400 mx-auto mb-1.5" />
                <span className="text-gray-900 font-extrabold block uppercase">C.P. GERARDO MARTÍNEZ RIVERA</span>
                <span className="text-gray-400 font-bold block">Contralor General del Ejercicio</span>
              </div>
              <div className="flex flex-col justify-end">
                <div className="w-full border-t border-slate-400 mx-auto mb-1.5" />
                <span className="text-gray-900 font-extrabold block uppercase">LIC. ROBERTO SILVA LANDA</span>
                <span className="text-gray-400 font-bold block">Director de Zitácuaro Importaciones</span>
              </div>
            </div>
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
