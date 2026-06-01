/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useAccountingStore } from '../store';
import DownloadToolbar from './DownloadToolbar';

export default function JournalTab() {
  const { policies, accounts, subaccounts } = useAccountingStore();

  // Helper formatting for currency values
  const formatCellAmountVal = (value: number | null | undefined) => {
    if (value === null || value === undefined || value === 0) return '';
    return value.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // Sort policies chronologically (date, adjustment, number)
  const sortedPolicies = [...policies].sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    if (a.isAdjustment !== b.isAdjustment) return a.isAdjustment ? 1 : -1;
    return a.number.localeCompare(b.number);
  });

  // Calculate global totals
  const totalDebits = policies.reduce((sum, p) => {
    return sum + p.movements.reduce((ps, m) => ps + (m.debit || 0), 0);
  }, 0);
  const totalCredits = policies.reduce((sum, p) => {
    return sum + p.movements.reduce((ps, m) => ps + (m.credit || 0), 0);
  }, 0);

  return (
    <div className="w-full bg-white select-none print-landscape">
      
      {/* 1. DOWNLOAD TOOLBAR COMPONENT */}
      <DownloadToolbar 
        reportId="reporte-libro-diario" 
        fileName="Libro_Diario_General.doc" 
        orientation="landscape" 
      />

      {/* 2. MAIN JOURNAL LIST BY POLICIES WITH WRAPPER ID FOR WORD/PDF EXPORTS */}
      {sortedPolicies.length === 0 ? (
        <div className="border border-gray-200 rounded-xl p-12 text-center text-gray-400 italic">
          No se han registrado pólizas. Diríjase al "Gestor de Pólizas" para asentar operaciones comerciales.
        </div>
      ) : (
        <div id="reporte-libro-diario" className="p-1">
          {/* Cover/header tag for Word exported documents */}
          <div className="hidden doc-only-header py-4 text-center font-bold font-sans">
            <h3>ZITÁCUARO IMPORTACIONES, S.A. DE C.V. ─ LIBRO DIARIO GENERAL</h3>
          </div>

          <div className="space-y-6">
            {sortedPolicies.map((pol, pIdx) => {
              const isAdjText = pol.isAdjustment ? ' [ASIENTO DE AJUSTE]' : '';
              
              // Standardized seat heading text strictly as requested
              const formattedReference = pol.reference ? `(Doc: ${pol.reference})` : '(No Ref)';
              const headerText = `Asiento Contable N° ${pIdx + 1} - Póliza: ${pol.type} ${pol.number} | Concepto: ${pol.concept} ${formattedReference}${isAdjText} — Auxiliar: L.C. Luis Gerardo Perez`;

              // Helper variables to determine first debit/credit row index inside this specific policy
              let firstDebitIndex = -1;
              let firstCreditIndex = -1;
              let firstPartialIndex = -1;

              // Generate rows for this policy to inspect indexes
              interface LocalRow {
                isSubaccount: boolean;
                date: string;
                code: string;
                name: string;
                isDebitNormal: boolean;
                partial: number | null;
                debit: number | null;
                credit: number | null;
              }

              const localRows: LocalRow[] = [];
              pol.movements.forEach((mov) => {
                const foundAcct = accounts.find((a) => a.code === mov.accountCode);
                const acctName = foundAcct ? foundAcct.name : 'Cuenta Desconocida';
                const isDebitNormal = (mov.debit || 0) > 0;

                // Parent Account row
                localRows.push({
                  isSubaccount: false,
                  date: pol.date,
                  code: mov.accountCode,
                  name: acctName,
                  isDebitNormal,
                  partial: null,
                  debit: mov.debit || null,
                  credit: mov.credit || null
                });

                // Subaccount row if assigned
                if (mov.subaccountCode) {
                  const foundSub = subaccounts.find((s) => s.code === mov.subaccountCode && s.parentCode === mov.accountCode);
                  const subName = foundSub ? foundSub.name : 'Subcuenta Desconocida';
                  localRows.push({
                    isSubaccount: true,
                    date: pol.date,
                    code: mov.subaccountCode,
                    name: `↪ ${mov.subaccountCode} ${subName}`,
                    isDebitNormal,
                    partial: mov.debit || mov.credit || null,
                    debit: null,
                    credit: null
                  });
                }
              });

              // Find first indexes inside this policy for formatting "$"
              localRows.forEach((r, idx) => {
                if (firstDebitIndex === -1 && r.debit && r.debit > 0) firstDebitIndex = idx;
                if (firstCreditIndex === -1 && r.credit && r.credit > 0) firstCreditIndex = idx;
                if (firstPartialIndex === -1 && r.partial && r.partial > 0) firstPartialIndex = idx;
              });

              // Pastel backgrounds for corporate aesthetics based on policy category
              const getPastelBgClass = (pType: string) => {
                switch (pType) {
                  case 'Ingreso':
                    return 'bg-emerald-50/20 border-emerald-100';
                  case 'Egreso':
                    return 'bg-amber-50/15 border-amber-100';
                  default:
                    return 'bg-blue-50/20 border-blue-100';
                }
              };

              return (
                <div 
                  key={pol.id} 
                  className={`rounded-xl border p-4 shadow-xs page-break-avoid font-sans transition-all hover:shadow-sm ${getPastelBgClass(pol.type)}`}
                >
                  {/* Policy card header */}
                  <div className="bg-white/80 backdrop-blur-xs text-slate-800 border-b border-gray-150 px-4 py-2.5 rounded-lg font-extrabold text-[11px] mb-3 tracking-wide">
                    {headerText}
                  </div>

                  {/* Simplified spreadsheet grid with exactly 6 columns */}
                  <table className="w-full border-collapse text-[11.5px]">
                    <thead>
                      <tr className="bg-slate-50/50 border-b border-gray-200 text-[10px] font-mono text-gray-400 uppercase tracking-widest h-8 select-none font-bold">
                        <th className="w-24 border-r border-gray-150 text-left px-3 font-bold">Fecha</th>
                        <th className="w-20 border-r border-gray-150 text-center font-bold">Claves</th>
                        <th className="border-r border-gray-150 text-left px-4 font-bold">Cuentas - Subcuentas Contables / Libro Diario</th>
                        <th className="w-28 border-r border-gray-150 text-right px-4 font-bold">Parcial</th>
                        <th className="w-32 border-r border-gray-150 text-right px-4 font-bold">Debe (Cargo)</th>
                        <th className="w-32 text-right px-4 font-bold">Haber (Abono)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {localRows.map((r, idx) => {
                        const amountTextDebit = formatCellAmountVal(r.debit);
                        const amountTextCredit = formatCellAmountVal(r.credit);
                        const amountTextPartial = formatCellAmountVal(r.partial);

                        // Custom indentation: Cargos go left-aligned; Abonos go right-oriented; subaccounts align relative to parent
                        let indentStyleClass = "pl-2 font-bold text-slate-800";
                        if (r.isSubaccount) {
                          indentStyleClass = r.isDebitNormal 
                            ? "pl-6 italic text-gray-650 font-medium text-[11px]" 
                            : "pl-14 italic text-gray-650 font-medium text-[11px]";
                        } else if (!r.isDebitNormal) {
                          indentStyleClass = "pl-10 font-bold text-slate-800";
                        }

                        return (
                          <tr 
                            key={`${pol.id}-r-${idx}`} 
                            className="border-b border-slate-100 hover:bg-white/50 h-7.5"
                          >
                            {/* [Fecha] */}
                            <td className="border-r border-gray-150 px-3 font-mono text-gray-500 text-[10.5px]">
                              {idx === 0 ? r.date : ''}
                            </td>

                            {/* [Claves] */}
                            <td className="border-r border-gray-150 text-center font-mono font-medium text-gray-650 text-[11px]">
                              {r.code}
                            </td>

                            {/* [Cuentas - Subcuentas Contables] */}
                            <td className="border-r border-gray-150 px-2 truncate max-w-[400px]">
                              <span className={indentStyleClass}>
                                {r.name}
                              </span>
                            </td>

                            {/* [Parcial] */}
                            <td className="border-r border-gray-150 px-4 text-right font-mono text-xs text-gray-500">
                              {amountTextPartial 
                                ? (idx === firstPartialIndex ? `$ ${amountTextPartial}` : amountTextPartial) 
                                : ''}
                            </td>

                            {/* [Debe (Cargo)] */}
                            <td className="border-r border-gray-150 px-4 text-right font-mono text-xs font-semibold text-blue-900 bg-blue-50/5">
                              {amountTextDebit 
                                ? (idx === firstDebitIndex ? `$ ${amountTextDebit}` : amountTextDebit) 
                                : ''}
                            </td>

                            {/* [Haber (Abono)] */}
                            <td className="px-4 text-right font-mono text-xs font-semibold text-red-900 bg-red-50/5">
                              {amountTextCredit 
                                ? (idx === firstCreditIndex ? `$ ${amountTextCredit}` : amountTextCredit) 
                                : ''}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              );
            })}

            {/* 3. DOUBLE-UNDERLINED COMPREHENSIVE BOTTOM JOURNAL GRAND TOTALS */}
            <div className="border border-gray-200 rounded-xl overflow-hidden bg-slate-50 p-5 flex flex-col sm:flex-row justify-between items-center text-xs gap-4 shadow-xs mt-8">
              <span className="font-extrabold text-gray-700 uppercase tracking-widest text-[11px] font-sans">
                ∑ SUMAS IGUALES DEL LIBRO DIARIO GENERAL (PERIODO CONTABLE):
              </span>
              <div className="flex gap-10 items-center font-bold">
                <div className="text-right">
                  <span className="text-[9.5px] text-gray-400 font-mono block uppercase">Total Cargos (Debe)</span>
                  <span className="font-mono font-black text-blue-900 border-b-[3.5px] border-double border-black text-[14px]">
                    $ {totalDebits.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[9.5px] text-gray-400 font-mono block uppercase">Total Abonos (Haber)</span>
                  <span className="font-mono font-black text-red-900 border-b-[3.5px] border-double border-black text-[14px]">
                    $ {totalCredits.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
