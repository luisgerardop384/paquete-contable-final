/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useAccountingStore } from '../store';
import DownloadToolbar from './DownloadToolbar';

export default function IncomeStatementTab() {
  const { policies, subaccounts } = useAccountingStore();

  // Helper to fetch net balance of an account
  const getAccountNetBalance = (codeOrCodes: string | string[], includeAdjustments: boolean = false) => {
    let debits = 0;
    let credits = 0;
    const codes = Array.isArray(codeOrCodes) ? codeOrCodes : [codeOrCodes];

    policies.forEach((pol) => {
      if (!includeAdjustments && pol.isAdjustment) return;
      pol.movements.forEach((mov) => {
        if (codes.includes(mov.accountCode)) {
          debits += mov.debit || 0;
          credits += mov.credit || 0;
        }
      });
    });

    // Accounts have different normal balances
    const normalDeudora = [
      '1', '101.00', '2', '102.00', '3', '120.00', '4', '104.00', '5', '106.00',
      '6', '7', '8', '9', '160.00', '151.00', '10', '50', '501.00', '51', '52', '53',
      '601.00', '602.00', '601', '602'
    ];
    const isNormalDeudora = codes.some(c => normalDeudora.includes(c));
    if (isNormalDeudora) {
      return debits - credits; // Debit normal balance
    } else {
      return credits - debits; // Credit normal balance
    }
  };

  // Helper to fetch net balance specifically for a subaccount
  const getSubaccountNetBalance = (parentCode: string, subCode: string) => {
    let debits = 0;
    let credits = 0;

    policies.forEach((pol) => {
      if (pol.isAdjustment) return;
      pol.movements.forEach((mov) => {
        if (mov.accountCode === parentCode && mov.subaccountCode === subCode) {
          debits += mov.debit || 0;
          credits += mov.credit || 0;
        }
      });
    });

    return debits - credits;
  };

  // 1. Revenues
  const sales = Math.max(0, getAccountNetBalance(['40', '401.00'], false));
  
  // 2. Cost of sales
  const costOfSales = Math.max(0, getAccountNetBalance(['50', '501.00'], false));

  // 3. Brute utility
  const grossProfit = sales - costOfSales;

  // 4. Operating Expenses
  const adminExpenses = Math.max(0, getAccountNetBalance(['51', '602.00', '602'], false));
  const sellingExpenses = Math.max(0, getAccountNetBalance(['52', '601.00', '601'], false));
  const depreciationExpenses = Math.max(0, getAccountNetBalance('53', false));

  const totalOperatingExpenses = adminExpenses + sellingExpenses + depreciationExpenses;

  // 5. Operating Profit
  const operatingProfit = grossProfit - totalOperatingExpenses;

  // 6. Other incomes / Financial products
  const financialProducts = Math.max(0, getAccountNetBalance(['41', '760.00', '760'], false));

  // 7. Net Profit/Loss of Period
  const explicitUtility = Math.max(0, getAccountNetBalance(['354.00', '354'], true));
  const netIncome = explicitUtility > 0 ? explicitUtility : (operatingProfit + financialProducts);

  // Compile subaccount list details for 51 and 52
  const subs51 = subaccounts
    .filter((s) => s.parentCode === '51')
    .map((s) => ({ ...s, balance: getSubaccountNetBalance('51', s.code) }))
    .filter((s) => s.balance > 0);

  const subs52 = subaccounts
    .filter((s) => s.parentCode === '52')
    .map((s) => ({ ...s, balance: getSubaccountNetBalance('52', s.code) }))
    .filter((s) => s.balance > 0);

  // Formatting helpers for rendering cells
  const formatVal = (v: number | null | undefined) => {
    if (v === null || v === undefined || v <= 0) return '';
    return v.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <div className="w-full bg-white select-none">
      
      {/* 1. DOWNLOAD TOOLBAR COMPONENT */}
      <DownloadToolbar 
        reportId="reporte-estado-resultados" 
        fileName="Estado_Resultados.pdf" 
        orientation="portrait" 
      />

      {/* 2. EXCEL COMPLIANT TABLE WINDOW */}
      <div id="reporte-estado-resultados" className="p-1">
        
        {/* Cover/header tag for Word exported documents */}
        <div className="hidden doc-only-header py-4 text-center font-bold">
          <h3>ESTADO DE RESULTADOS INTEGRAL</h3>
        </div>

        <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
          <div className="bg-slate-50 border-b border-gray-200 text-[11px] px-4 py-2 font-mono text-gray-500 flex justify-between items-center no-print">
            <span className="font-bold tracking-wider">ESTADO_RESULTADOS.xlsx</span>
            <span className="bg-white px-2 py-0.5 rounded border border-gray-200">Solo Lectura</span>
          </div>

          <table className="w-full border-collapse text-[12.5px] font-sans">
          <thead>
            <tr className="bg-slate-50/50 border-b border-gray-200 text-[10.5px] font-mono text-gray-400 uppercase tracking-widest h-10 select-none">
              <th className="w-14 border-r border-gray-200 text-center select-none font-bold">Fila</th>
              <th className="border-r border-gray-200 text-left px-4 font-bold">Estructura del Estado de Resultados de Operación</th>
              <th className="w-40 border-r border-gray-200 text-right px-4 font-bold">Columna 1 (Parcial)</th>
              <th className="w-40 border-r border-gray-200 text-right px-4 font-bold">Columna 2 (Subtotal)</th>
              <th className="w-44 text-right px-4 font-bold">Columna 3 (Total)</th>
            </tr>
          </thead>
          <tbody>
            
            {/* Sales — En la columna final (Total), primer número de la columna llema "$" obligatoriamente */}
            <tr className="hover:bg-slate-50/20 h-8 text-gray-800">
              <td className="bg-slate-50/40 border-r border-gray-150 text-[10px] font-mono text-gray-400 text-center select-none">1</td>
              <td className="border-r border-gray-220 px-4 font-bold text-gray-800 uppercase tracking-tight">
                VENTAS NETAS
              </td>
              <td className="border-r border-gray-150"></td>
              <td className="border-r border-gray-150"></td>
              <td className="px-4 text-right font-mono font-black text-slate-900">
                $ {formatVal(sales)}
              </td>
            </tr>

            {/* Cost of Sales — En la columna final (Total), justo abajo de Ventas Netas con línea de resta */}
            <tr className="hover:bg-slate-50/20 h-8 text-gray-800">
              <td className="bg-slate-50/40 border-r border-gray-150 text-[10px] font-mono text-gray-400 text-center select-none">2</td>
              <td className="border-r border-gray-220 px-4 text-gray-600 pl-8 font-semibold">
                (-) Costo de Ventas
              </td>
              <td className="border-r border-gray-150"></td>
              <td className="border-r border-gray-150"></td>
              {/* OPERATION CUT LINE: Only applied inside this cellular item, does not cross descriptive text! */}
              <td className="px-4 text-right font-mono text-red-900 border-b border-black decoration-solid">
                {formatVal(costOfSales)}
              </td>
            </tr>

            {/* Utilidad Bruta — En la columna final, primer número después de un corte, lleva "$" */}
            <tr className="bg-slate-50/30 hover:bg-slate-50/50 h-8.5">
              <td className="bg-slate-100/50 border-r border-gray-150 text-[10px] font-mono text-gray-400 text-center select-none">3</td>
              <td className="border-r border-gray-220 px-4 font-extrabold text-[#111111] uppercase tracking-wide">
                (=) UTILIDAD BRUTA
              </td>
              <td className="border-r border-gray-150"></td>
              <td className="border-r border-gray-150"></td>
              <td className="px-4 text-right font-mono font-black text-[#1e3a8a] bg-blue-50/10">
                $ {formatVal(grossProfit)}
              </td>
            </tr>

            {/* Section Header */}
            <tr className="bg-slate-100/70 select-none font-mono text-[9.5px] text-gray-400 uppercase tracking-widest h-6 page-break-avoid">
              <td className="border-r border-gray-110"></td>
              <td colSpan={4} className="px-4 font-black">📂 GASTOS GENERALES DE OPERACIÓN</td>
            </tr>

            {/* Gastos de Administración (Aggregation goes into Column 2 / Subtotal) */}
            <tr className="hover:bg-slate-50/20 h-7.5">
              <td className="bg-slate-50/40 border-r border-gray-150 text-[10px] font-mono text-gray-400 text-center select-none">4</td>
              <td className="border-r border-gray-220 px-4 font-extrabold text-gray-700 pl-8">
                Gastos de Administración
              </td>
              <td className="border-r border-gray-150"></td>
              {/* First amount of subtotal column gets "$" */}
              <td className="border-r border-gray-150 px-4 text-right font-mono font-semibold text-gray-800">
                $ {formatVal(adminExpenses)}
              </td>
              <td></td>
            </tr>

            {/* GA Subaccounts (Details go into Column 1 / Parcial) */}
            {subs51.map((sub, sIdx) => (
              <tr key={sub.code} className="bg-slate-50/5 hover:bg-slate-50/20 text-[12px] h-6.5 page-break-avoid font-sans">
                <td className="bg-slate-50/30 border-r border-gray-150 text-[10px] font-mono text-gray-300 text-center select-none">4.{sIdx + 1}</td>
                <td className="border-r border-gray-220 text-gray-500 italic pl-14 font-medium">
                  ↪ {sub.code} {sub.name}
                </td>
                {/* First number of column Parcial gets "$" */}
                <td className="border-r border-gray-150 px-4 text-right font-mono text-[11px] text-gray-500">
                  {sIdx === 0 ? `$ ${formatVal(sub.balance)}` : formatVal(sub.balance)}
                </td>
                <td className="border-r border-gray-150"></td>
                <td></td>
              </tr>
            ))}

            {/* Gastos de Venta (Aggregation goes into Column 2 / Subtotal) */}
            <tr className="hover:bg-slate-50/20 h-7.5">
              <td className="bg-slate-50/40 border-r border-gray-150 text-[10px] font-mono text-gray-400 text-center select-none">5</td>
              <td className="border-r border-gray-220 px-4 font-extrabold text-gray-700 pl-8">
                Gastos de Venta
              </td>
              <td className="border-r border-gray-150"></td>
              <td className="border-r border-gray-150 px-4 text-right font-mono font-semibold text-gray-800">
                {formatVal(sellingExpenses)}
              </td>
              <td></td>
            </tr>

            {/* GV Subaccounts (Details go into Column 1 / Parcial) */}
            {subs52.map((sub, sIdx) => (
              <tr key={sub.code} className="bg-slate-50/5 hover:bg-slate-50/20 text-[12px] h-6.5 page-break-avoid font-sans">
                <td className="bg-slate-50/30 border-r border-gray-150 text-[10px] font-mono text-gray-300 text-center select-none">5.{sIdx + 1}</td>
                <td className="border-r border-gray-220 text-gray-500 italic pl-14 font-medium">
                  ↪ {sub.code} {sub.name}
                </td>
                {/* If previous column started, we keep clean decimals except if it meets the sign condition */}
                <td className="border-r border-gray-150 px-4 text-right font-mono text-[11px] text-gray-500">
                  {sIdx === 0 && subs51.length === 0 ? `$ ${formatVal(sub.balance)}` : formatVal(sub.balance)}
                </td>
                <td className="border-r border-gray-150"></td>
                <td></td>
              </tr>
            ))}

            {/* Depreciación de Activos (Subtotal Column, gets line of operation as last operating expenses addend) */}
            <tr className="hover:bg-slate-50/20 h-7.5">
              <td className="bg-slate-50/40 border-r border-gray-150 text-[10px] font-mono text-gray-400 text-center select-none">6</td>
              <td className="border-r border-gray-220 px-4 font-semibold text-gray-600 pl-8">
                Depreciaciones de Activos Operativos
              </td>
              <td className="border-r border-gray-150"></td>
              {/* Operational top/bottom borders ONLY on specific numeric cell */}
              <td className="border-r border-gray-150 px-4 text-right font-mono text-gray-800 border-b border-black">
                {formatVal(depreciationExpenses)}
              </td>
              <td></td>
            </tr>

            {/* Suma de Gastos de Operación (Total added together, goes into Column 3 / Total) */}
            <tr className="hover:bg-slate-50/10 h-8">
              <td className="bg-slate-50/30 border-r border-gray-150 text-[10px] font-mono text-gray-400 text-center select-none">7</td>
              <td className="border-r border-gray-220 px-4 font-bold text-gray-700 pl-10 uppercase tracking-tight">
                (=) Suma de Gastos de Operación
              </td>
              <td className="border-r border-gray-150"></td>
              <td className="border-r border-gray-150"></td>
              {/* This is subtracted from gross profit, border-b is the subtraction line for Operating Profit */}
              <td className="px-4 text-right font-mono text-[#475569] border-b border-black font-semibold">
                {formatVal(totalOperatingExpenses)}
              </td>
            </tr>

            {/* Utilidad de Operación — Column 3 / Total, carries "$" immediately after visual cut */}
            <tr className="bg-slate-50/20 hover:bg-slate-50/40 h-8.5">
              <td className="bg-slate-100/50 border-r border-gray-150 text-[10px] font-mono text-gray-400 text-center select-none">8</td>
              <td className="border-r border-gray-220 px-4 font-extrabold text-gray-800 uppercase tracking-wide">
                (=) UTILIDAD DE OPERACIÓN
              </td>
              <td className="border-r border-gray-150"></td>
              <td className="border-r border-gray-150"></td>
              <td className="px-4 text-right font-mono font-black text-slate-800">
                $ {formatVal(operatingProfit)}
              </td>
            </tr>

            {/* Financial Incomes / Productos Financieros (Column 3 / Total with visual cut line) */}
            <tr className="hover:bg-slate-50/20 h-8 text-teal-900">
              <td className="bg-slate-50/40 border-r border-gray-150 text-[10px] font-mono text-gray-400 text-center select-none">9</td>
              <td className="border-r border-gray-220 px-4 font-semibold italic text-teal-850 pl-8">
                (+) Productos Financieros / Otros Rendimientos
              </td>
              <td className="border-r border-gray-150"></td>
              <td className="border-r border-gray-150"></td>
              <td className="px-4 text-right font-mono font-bold text-teal-700 border-b border-black">
                {formatVal(financialProducts)}
              </td>
            </tr>

            {/* UTILIDAD NETA DEL EJERCICIO (Final Result with Double Closing Line in column 3 only!) */}
            <tr className="bg-emerald-50/50 hover:bg-emerald-100/30 h-11">
              <td className="bg-gray-100/50 border-r border-gray-200 text-[10.5px] font-mono text-gray-450 text-center select-none font-bold py-3">10</td>
              <td className="border-r border-gray-220 px-4 font-extrabold text-emerald-950 uppercase tracking-wide text-[12.5px]">
                (=) UTILIDAD NETA DEL EJERCICIO
              </td>
              <td className="border-r border-gray-150"></td>
              <td className="border-r border-gray-150"></td>
              {/* DOUBLE BORDER BOTTOM applied strictly inside this cell as requested */}
              <td className="px-4 text-right font-mono text-[14.5px] font-black text-emerald-900 bg-emerald-50/10 border-b-[3.5px] border-double border-black">
                $ {formatVal(netIncome)}
              </td>
            </tr>

          </tbody>
        </table>
      </div>
      </div>
    </div>
  );
}
