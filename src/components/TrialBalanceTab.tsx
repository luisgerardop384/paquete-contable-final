/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useAccountingStore } from '../store';
import DownloadToolbar from './DownloadToolbar';

export default function TrialBalanceTab() {
  const { accounts, policies } = useAccountingStore();

  // Calculate sum of Debits and Credits and derive trial balances
  const getBalanzaRows = () => {
    return accounts.map((acct) => {
      let sumDebits = 0;
      let sumCredits = 0;

      policies.forEach((pol) => {
        pol.movements.forEach((mov) => {
          if (mov.accountCode === acct.code) {
            sumDebits += mov.debit || 0;
            sumCredits += mov.credit || 0;
          }
        });
      });

      const netValue = sumDebits - sumCredits;
      const saldoDeudor = netValue > 0 ? netValue : 0;
      const saldoAcreedor = netValue < 0 ? Math.abs(netValue) : 0;
      const hasMovements = (sumDebits > 0 || sumCredits > 0);

      return {
        code: acct.code,
        name: acct.name,
        type: acct.type,
        saldoDeudor,
        saldoAcreedor,
        hasMovements
      };
    }).filter(row => row.hasMovements);
  };

  const rows = getBalanzaRows();

  // Find the exact indexes of the very first rendered values of each column for currency formatting
  let firstDeudorIdx = -1;
  let firstAcreedorIdx = -1;

  rows.forEach((row, idx) => {
    if (firstDeudorIdx === -1 && row.saldoDeudor > 0) firstDeudorIdx = idx;
    if (firstAcreedorIdx === -1 && row.saldoAcreedor > 0) firstAcreedorIdx = idx;
  });

  // Helper formatting for currency values
  const formatCellAmountVal = (value: number | null | undefined) => {
    if (value === null || value === undefined || value === 0) return '';
    return value.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const renderCellWithSign = (value: number, rowIndex: number, firstIdx: number) => {
    if (value <= 0) return '';
    const formatted = formatCellAmountVal(value);
    return rowIndex === firstIdx ? `$ ${formatted}` : formatted;
  };

  // Calculate sum totals of balances
  const totalDeudor = rows.reduce((sum, r) => sum + r.saldoDeudor, 0);
  const totalAcreedor = rows.reduce((sum, r) => sum + r.saldoAcreedor, 0);

  return (
    <div className="w-full bg-white select-none">
      
      {/* 1. DOWNLOAD TOOLBAR COMPONENT */}
      <DownloadToolbar 
        reportId="reporte-balanza-comprobacion" 
        fileName="Balanza_Comprobacion.pdf" 
        orientation="portrait" 
      />

      {/* 2. MAIN SHEET VIEW */}
      <div id="reporte-balanza-comprobacion" className="p-1">
        
        {/* Cover/header tag for Word exported documents */}
        <div className="hidden doc-only-header py-4 text-center font-bold">
          <h3>BALANZA DE COMPROBACIÓN</h3>
        </div>

        <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
          <div className="bg-slate-50 border-b border-gray-200 text-[11px] px-4 py-2 font-mono text-gray-500 flex justify-between items-center no-print">
            <span className="font-bold tracking-wider">BALANZA_COMPROBACION.xlsx</span>
            <span className="bg-white px-2 py-0.5 rounded border border-gray-250">Solo Lectura</span>
          </div>

        <table className="w-full border-collapse text-[12px] font-sans">
          <thead>
            <tr className="bg-slate-50/50 border-b border-gray-200 text-[10px] font-mono text-gray-400 uppercase tracking-wider h-9">
              <th className="w-12 border-r border-gray-200 text-center select-none font-bold">Fila</th>
              <th className="w-24 border-r border-gray-200 text-center">Código</th>
              <th className="border-r border-gray-200 text-left px-4">Nombre de la Cuenta Contable</th>
              <th className="w-48 border-r border-gray-200 text-right px-4">Saldo Deudor</th>
              <th className="w-48 text-right px-4">Saldo Acreedor</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-12 text-gray-400 italic">
                  No hay movimientos para generar la Balanza de Comprobación. Regístrelos en la sección de Pólizas.
                </td>
              </tr>
            ) : (
              rows.map((row, idx) => (
                <tr key={row.code} className="border-b border-gray-150 hover:bg-slate-50/40 page-break-avoid h-7.5">
                  {/* Excel Row Num */}
                  <td className="bg-slate-50 border-r border-gray-150 text-[10px] font-mono text-gray-400 text-center select-none">
                    {idx + 1}
                  </td>

                  {/* Account Code */}
                  <td className="border-r border-gray-150 text-center font-mono font-bold text-gray-700">
                    {row.code}
                  </td>

                  {/* Account Name */}
                  <td className="border-r border-gray-150 px-4 font-semibold text-gray-800 uppercase">
                    {row.name}
                  </td>

                  {/* Saldo Deudor with Regla del Vacio & Rule of first $ */}
                  <td className="border-r border-gray-150 px-4 text-right font-mono text-xs text-blue-900 bg-blue-50/5">
                    {renderCellWithSign(row.saldoDeudor, idx, firstDeudorIdx)}
                  </td>

                  {/* Saldo Acreedor with Regla del Vacio & Rule of first $ */}
                  <td className="px-4 text-right font-mono text-xs text-red-900 bg-red-50/5">
                    {renderCellWithSign(row.saldoAcreedor, idx, firstAcreedorIdx)}
                  </td>
                </tr>
              ))
            )}

            {/* Sumas Iguales Footer Row with Horizontal Alignment and Double-Line Border */}
            <tr className="bg-slate-50 border-b-4 border-double border-black font-semibold text-xs select-none h-10">
              <td className="border-r border-gray-200 bg-slate-100 text-[10px] text-gray-400 text-center font-bold">
                ∑
              </td>
              <td colSpan={2} className="px-4 py-2 font-bold text-right border-r border-gray-200 text-slate-700 text-xs uppercase select-all">
                Sumas Iguales de Comprobación:
              </td>
              <td className="border-r border-gray-200 px-4 text-right font-extrabold text-blue-950 font-mono text-[13px] bg-blue-100/20 select-all">
                $ {totalDeudor.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </td>
              <td className="px-4 text-right font-extrabold text-red-950 font-mono text-[13px] bg-red-100/20 select-all">
                $ {totalAcreedor.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      </div>
    </div>
  );
}
