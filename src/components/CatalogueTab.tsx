/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useAccountingStore } from '../store';

export default function CatalogueTab() {
  const { accounts, subaccounts, addSubaccount, deleteSubaccount } = useAccountingStore();
  const [newSubName, setNewSubName] = useState('');
  const [activeParentCode, setActiveParentCode] = useState<string | null>(null);

  const handleAdd = (parentCode: string) => {
    if (!newSubName.trim()) return;
    addSubaccount(parentCode, newSubName.trim());
    setNewSubName('');
    setActiveParentCode(null);
  };

  return (
    <div className="w-full bg-white select-none">
      <div className="text-xs text-info bg-slate-50 border-l-4 border-slate-400 p-2.5 mb-4 font-sans no-print">
        <strong>Estructura de Catálogo Tradicional:</strong> Códigos enteros para cuentas de balance y resultados. Las cuentas de resultados deudoras de Gastos (51 y 52) admiten subcuentas analíticas configurables dinámicamente para registrar conceptos detallados de Rentas, Luz, Teléfono, Comisiones, etc.
      </div>

      <div className="border border-gray-300 bg-white text-[13px] overflow-x-auto">
        <div className="bg-gray-100 border-b border-gray-300 text-xs px-3 py-1 font-mono text-gray-500 flex justify-between items-center no-print">
          <span>CATALOGO_CUENTAS.xlsx</span>
          <span>Modo Lectura/Edición</span>
        </div>

        <table className="w-full border-collapse" id="tbl-catalogue">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-300 text-xs text-gray-700 font-mono">
              <th className="w-8 border-r border-gray-300 text-[10px] text-gray-400 text-center py-1"></th>
              <th className="w-24 border-r border-gray-300 px-3 py-1 text-left">Código</th>
              <th className="w-72 border-r border-gray-300 px-3 py-1 text-left">Nombre de la Cuenta / Subcuenta</th>
              <th className="w-32 border-r border-gray-300 px-3 py-1 text-left">Naturaleza</th>
              <th className="px-3 py-1 text-left no-print">Controles / Acción Auxiliar</th>
            </tr>
          </thead>
          <tbody>
            {accounts.map((acct, idx) => {
              // Find matching subaccounts for this accounts
              const subsForAccount = subaccounts.filter(sub => sub.parentCode === acct.code);
              const isExpenseAccount = acct.code === '51' || acct.code === '52';

              return (
                <React.Fragment key={acct.code}>
                  {/* Parent row */}
                  <tr className="border-b border-gray-300 hover:bg-slate-50/50">
                    <td className="bg-gray-50 border-r border-gray-300 text-[10px] font-mono text-gray-400 text-center py-1 select-none">
                      {idx + 1}
                    </td>
                    <td className="border-r border-gray-300 px-3 py-1 font-mono font-bold text-gray-800">
                      {acct.code}
                    </td>
                    <td className="border-r border-gray-300 px-3 py-1 font-semibold text-[#111111]">
                      {acct.name}
                    </td>
                    <td className="border-r border-gray-300 px-3 py-1">
                      <span className={`px-1.5 py-0.5 text-xs font-mono font-medium ${
                        acct.type === 'Deudora' 
                          ? 'bg-blue-50 text-blue-800 border border-blue-200' 
                          : acct.type === 'Acreedora'
                          ? 'bg-amber-50 text-amber-800 border border-amber-200'
                          : 'bg-indigo-50 text-indigo-800 border border-indigo-200'
                      }`}>
                        {acct.type}
                      </span>
                    </td>
                    <td className="px-3 py-1 text-xs no-print">
                      {isExpenseAccount && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setActiveParentCode(activeParentCode === acct.code ? null : acct.code);
                              setNewSubName('');
                            }}
                            className="bg-green-100 hover:bg-green-200 text-green-800 font-bold px-2 py-0.5 border border-green-300 text-[11px] font-sans transition cursor-pointer"
                          >
                            {activeParentCode === acct.code ? '✕ Cancelar' : '┼ Añadir Subcuenta'}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>

                  {/* Add subaccount form inline if selected */}
                  {isExpenseAccount && activeParentCode === acct.code && (
                    <tr className="bg-green-50/40 border-b border-gray-300 no-print">
                      <td className="bg-gray-100 border-r border-gray-300 text-[10px] text-gray-400 text-center py-1">┼</td>
                      <td className="border-r border-gray-300 px-3 py-1 text-[11px] font-mono text-gray-400 italic">
                        Autocompletar
                      </td>
                      <td className="border-r border-gray-300 px-2 py-1" colSpan={2}>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            placeholder="Nombre de la subcuenta ej. Honorarios"
                            className="w-full bg-white border border-gray-300 px-2 py-0.5 text-xs text-[#111111]"
                            value={newSubName}
                            onChange={(e) => setNewSubName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleAdd(acct.code);
                            }}
                            autoFocus
                          />
                          <button
                            onClick={() => handleAdd(acct.code)}
                            className="bg-green-700 text-white font-bold px-3 py-0.5 text-xs border border-green-800 cursor-pointer"
                          >
                            Guardar
                          </button>
                        </div>
                      </td>
                      <td className="px-3 py-1"></td>
                    </tr>
                  )}

                  {/* Nested Subaccounts */}
                  {subsForAccount.map((sub, sIdx) => (
                    <tr key={sub.code} className="border-b border-gray-200 bg-gray-50/30 hover:bg-slate-50/40">
                      <td className="bg-gray-50 border-r border-gray-300 text-[10px] font-mono text-gray-300 text-center py-0.5 select-none">
                        {idx + 1}.{sIdx + 1}
                      </td>
                      <td className="border-r border-gray-300 px-3 py-0.5 font-mono text-xs text-gray-500 pl-6">
                        {sub.code}
                      </td>
                      <td className="border-r border-gray-300 px-3 py-0.5 text-xs text-gray-600 pl-8 italic">
                        {sub.name}
                      </td>
                      <td className="border-r border-gray-300 px-3 py-0.5 font-mono text-xs text-gray-500">
                        Heredado
                      </td>
                      <td className="px-3 py-0.5 text-xs no-print">
                        <button
                          onClick={() => deleteSubaccount(sub.code)}
                          className="text-red-600 hover:text-red-800 hover:underline font-mono text-[10px] font-bold cursor-pointer"
                          title={`Eliminar subcuenta ${sub.code}`}
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
