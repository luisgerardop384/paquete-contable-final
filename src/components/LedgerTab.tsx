/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useAccountingStore } from '../store';
import DownloadToolbar from './DownloadToolbar';

export default function LedgerTab() {
  const { accounts, policies } = useAccountingStore();

  // Aggregate movements by account code
  const getAccountTData = (accountCode: string) => {
    const debits: { date: string; policyNum: string; amount: number; isAdj: boolean }[] = [];
    const credits: { date: string; policyNum: string; amount: number; isAdj: boolean }[] = [];

    policies.forEach((pol) => {
      pol.movements.forEach((mov) => {
        if (mov.accountCode === accountCode) {
          if (mov.debit && mov.debit > 0) {
            debits.push({
              date: pol.date,
              policyNum: pol.number,
              amount: mov.debit,
              isAdj: pol.isAdjustment
            });
          }
          if (mov.credit && mov.credit > 0) {
            credits.push({
              date: pol.date,
              policyNum: pol.number,
              amount: mov.credit,
              isAdj: pol.isAdjustment
            });
          }
        }
      });
    });

    const sumDebits = debits.reduce((sum, d) => sum + d.amount, 0);
    const sumCredits = credits.reduce((sum, c) => sum + c.amount, 0);

    const netValue = sumDebits - sumCredits;
    const balanceDeudor = netValue > 0 ? netValue : 0;
    const balanceAcreedor = netValue < 0 ? Math.abs(netValue) : 0;
    const isZeroBalance = Math.abs(netValue) < 0.01;

    // Has any adjustment transactions registered
    const hasAdjustment = debits.some(d => d.isAdj) || credits.some(c => c.isAdj);
    
    // IsResultsAccount check for automatic results closing, but also any ledger account can be settled hasAdjustment
    const isSaldada = isZeroBalance && (sumDebits > 0) && hasAdjustment;

    return {
      debits,
      credits,
      sumDebits,
      sumCredits,
      balanceDeudor,
      balanceAcreedor,
      isSaldada,
      hasTransactions: (debits.length > 0 || credits.length > 0)
    };
  };

  // Only show accounts that have registered transactions
  const activeAccounts = accounts.filter((ac) => {
    const data = getAccountTData(ac.code);
    return data.hasTransactions;
  });

  return (
    <div className="w-full bg-white select-none">
      
      {/* 1. DOWNLOAD TOOLBAR COMPONENT */}
      <DownloadToolbar 
        reportId="reporte-esquemas-mayor" 
        fileName="Libro_Mayor_General.doc" 
        orientation="landscape" 
      />

      {activeAccounts.length === 0 ? (
        <div className="text-center py-16 border border-gray-200 rounded-xl text-gray-400 italic">
          No hay movimientos comerciales registrados. Diríjase al "Gestor de Pólizas" para asentar pólizas.
        </div>
      ) : (
        <div id="reporte-esquemas-mayor" className="p-1">
          {/* Cover/header tag for Word exported documents */}
          <div className="hidden doc-only-header py-4 text-center font-bold">
            <h3>LIBRO MAYOR GENERAL - CUENTAS T</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ledger-grid-print">
            {activeAccounts.map((acct) => {
              const data = getAccountTData(acct.code);
              const maxLength = Math.max(data.debits.length, data.credits.length);

              return (
                <div
                  key={acct.code}
                  className="bg-white border border-gray-200 rounded-xl p-4 hover:border-gray-300 transition flex flex-col justify-between page-break-avoid relative overflow-hidden"
                  id={`ledger-t-${acct.code}`}
                >
                  {/* Account code and name */}
                  <div className="bg-slate-50 border-b border-gray-200 font-mono text-[10px] text-gray-400 flex justify-between px-3 py-1 -mt-4 -mx-4 mb-3 rounded-t-xl font-bold">
                    <span>CUENTA NO. {acct.code}</span>
                    <span className="uppercase">{acct.type}</span>
                  </div>

                  {/* T Account Name Header */}
                  <div className="text-center font-extrabold text-[12px] text-gray-900 border-b-2 border-black pb-1.5 mb-2 select-all font-sans uppercase tracking-wider">
                    {acct.name}
                  </div>

                  {/* T Account Body (Left: Debit | Right: Credit) */}
                  <div className="grid grid-cols-2 relative min-h-[140px] text-[11px] font-sans">
                    {/* Vertical division line */}
                    <div className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-black select-none pointer-events-none" />

                    {/* DEBIT Column (Debe) - Left */}
                    <div className="pr-3 py-1 space-y-1">
                      {data.debits.map((deb, dIdx) => (
                        <div key={`deb-${dIdx}`} className="flex justify-between items-center text-blue-900 font-mono hover:bg-blue-50/20 px-1 rounded">
                          <span className="text-[9px] text-gray-400 truncate max-w-[45px] font-medium select-none" title={deb.date}>
                            {deb.policyNum}{deb.isAdj ? '(A)' : ''}
                          </span>
                          <span className="font-semibold">{deb.amount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                        </div>
                      ))}
                      {data.debits.length < maxLength && 
                        Array.from({ length: maxLength - data.debits.length }).map((_, fIdx) => (
                          <div key={`d-fill-${fIdx}`} className="h-4 select-none" />
                        ))
                      }
                    </div>

                    {/* CREDIT Column (Haber) - Right */}
                    <div className="pl-3 py-1 space-y-1">
                      {data.credits.map((crd, cIdx) => (
                        <div key={`crd-${cIdx}`} className="flex justify-between items-center text-red-900 font-mono hover:bg-rose-50/20 px-1 rounded">
                          <span className="font-semibold">{crd.amount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                          <span className="text-[9px] text-gray-400 truncate max-w-[45px] font-medium select-none text-right" title={crd.date}>
                            {crd.isAdj ? '(A)' : ''}{crd.policyNum}
                          </span>
                        </div>
                      ))}
                      {data.credits.length < maxLength && 
                        Array.from({ length: maxLength - data.credits.length }).map((_, fIdx) => (
                          <div key={`c-fill-${fIdx}`} className="h-4 select-none" />
                        ))
                      }
                    </div>
                  </div>

                  {/* Subtotals & Net Balance */}
                  <div className="mt-3 border-t border-black pt-1.5 block">
                    {/* Totals Row */}
                    <div className="grid grid-cols-2 text-[10.5px] font-mono leading-none font-bold">
                      <div className="pr-3 text-right text-blue-900 flex justify-between">
                        <span className="text-[9px] text-gray-400 select-none font-normal">MD</span>
                        <span>${data.sumDebits.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="pl-3 text-right text-red-900 flex justify-between">
                        <span className="text-[9px] text-gray-400 select-none font-normal font-sans">MA</span>
                        <span>${data.sumCredits.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="w-full h-[1px] bg-gray-300 my-1.5 select-none" />

                    {/* Net Balances Row */}
                    <div className="grid grid-cols-2 text-[11px] font-mono">
                      {/* Deudor balance check */}
                      <div className="pr-3 text-right text-blue-900">
                        {data.balanceDeudor > 0 && (
                          <div className="flex justify-between font-bold">
                            <span className="text-[9px] text-gray-400 font-normal">SD</span>
                            <span className="underline decoration-double">${data.balanceDeudor.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Acreedor balance check */}
                      <div className="pl-3 text-right text-red-900">
                        {data.balanceAcreedor > 0 && (
                          <div className="flex justify-between font-bold">
                            <span className="text-[9px] text-gray-400 font-normal">SA</span>
                            <span className="underline decoration-double">${data.balanceAcreedor.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Settle/Cortes Check "CUENTA SALDADA" double horizontal lines */}
                    {data.isSaldada && (
                      <div className="mt-2.5">
                        {/* Elegant double horizontal red lines as requested */}
                        <div className="w-full border-t-4 border-double border-red-500 my-1 py-1 text-center font-mono text-[9px] font-black tracking-widest text-red-650 bg-red-50/50 rounded-sm">
                          CUENTA SALDADA
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
