/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useAccountingStore } from '../store';
import { Policy, Movement } from '../types';
import { Plus, Trash2, CheckCircle, AlertTriangle, Printer, FileText, ChevronRight, Sparkles } from 'lucide-react';

export default function PolicyManagerTab() {
  const { policies, accounts, subaccounts, addPolicy, deletePolicy, companyHeader } = useAccountingStore();

  // Active view: either 'capture' or a specific saved policy's ID
  const [selectedPolicyId, setSelectedPolicyId] = useState<string | null>(null);

  // Policy capture form state
  const [polNumber, setPolNumber] = useState('');
  const [polDate, setPolDate] = useState('2026-01-01');
  const [polType, setPolType] = useState<'Ingreso' | 'Egreso' | 'Diario' | 'Cheque'>('Diario');
  const [polConcept, setPolConcept] = useState('');
  const [polReference, setPolReference] = useState('');
  const [polAuthor, setPolAuthor] = useState('');
  const [polIsAdjustment, setPolIsAdjustment] = useState(false);

  // Draft movements array state
  const [draftMovements, setDraftMovements] = useState<Movement[]>([
    { accountCode: '', subaccountCode: null, debit: null, credit: null },
    { accountCode: '', subaccountCode: null, debit: null, credit: null }
  ]);

  // Set sequence default policy number
  useEffect(() => {
    if (selectedPolicyId === null) {
      const count = policies.length + 1;
      const prefix = polIsAdjustment ? 'A' : 'P';
      const formatted = `${prefix}-${count < 10 ? '0' : ''}${count}`;
      setPolNumber(formatted);
      
      if (policies.length > 0) {
        setPolDate(policies[policies.length - 1].date);
        setPolAuthor(policies[policies.length - 1].author || 'L.C. Luis Gerardo Perez');
      } else {
        setPolDate(companyHeader.startDate || '2026-01-01');
        setPolAuthor('L.C. Luis Gerardo Perez');
      }
    }
  }, [policies, companyHeader.startDate, polIsAdjustment, selectedPolicyId]);

  // Handle switching toggles
  const handleStartCapture = () => {
    setSelectedPolicyId(null);
    setPolConcept('');
    setPolReference('');
    setPolIsAdjustment(false);
    setDraftMovements([
      { accountCode: '', subaccountCode: null, debit: null, credit: null },
      { accountCode: '', subaccountCode: null, debit: null, credit: null }
    ]);
  };

  // Live calculation assistants
  const draftDebits = draftMovements.reduce((sum, m) => sum + (m.debit || 0), 0);
  const draftCredits = draftMovements.reduce((sum, m) => sum + (m.credit || 0), 0);
  const isBalanced = Math.abs(draftDebits - draftCredits) < 0.01 && (draftDebits > 0);

  const handleAddDraftRow = () => {
    setDraftMovements([...draftMovements, { accountCode: '', subaccountCode: null, debit: null, credit: null }]);
  };

  const handleRemoveDraftRow = (index: number) => {
    if (draftMovements.length <= 2) return;
    setDraftMovements(draftMovements.filter((_, idx) => idx !== index));
  };

  const handleUpdateMovement = (index: number, fields: Partial<Movement>) => {
    const next = draftMovements.map((m, idx) => {
      if (idx !== index) return m;
      const updated = { ...m, ...fields };
      
      // Reset subaccount if root parent account code changes
      if (fields.accountCode !== undefined) {
        updated.subaccountCode = null;
      }
      
      // Rule of the void: if Debit is entered, nullify Credit, and vice versa
      if (fields.debit !== undefined && fields.debit !== null && fields.debit > 0) {
        updated.credit = null;
      }
      if (fields.credit !== undefined && fields.credit !== null && fields.credit > 0) {
        updated.debit = null;
      }

      return updated;
    });
    setDraftMovements(next);
  };

  const handleSavePolicy = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!polNumber.trim()) {
      alert('Por favor introduce el número de póliza.');
      return;
    }
    if (!polConcept.trim()) {
      alert('Por favor especifica el concepto central.');
      return;
    }
    if (!isBalanced) {
      alert('La póliza no está cuadrada. El Debe y el Haber deben coincidir.');
      return;
    }

    // Filter valid rows
    const cleanMovements = draftMovements.filter(
      (m) => m.accountCode && ((m.debit || 0) > 0 || (m.credit || 0) > 0)
    );

    if (cleanMovements.length < 2) {
      alert('Una póliza requiere al menos dos movimientos de partida doble.');
      return;
    }

    const newPolId = `p-${Date.now()}`;
    const newPol: Policy = {
      id: newPolId,
      number: polNumber.toUpperCase(),
      date: polDate,
      type: polType,
      concept: polConcept,
      reference: polReference,
      author: polAuthor,
      movements: cleanMovements,
      isAdjustment: polIsAdjustment
    };

    addPolicy(newPol);
    
    // Select the saved policy for visual print view
    setSelectedPolicyId(newPolId);
  };

  // Find currently selected policy
  const activePolicy = policies.find(p => p.id === selectedPolicyId);

  // Formatting helper
  const formatCellAmount = (value: number | null | undefined) => {
    if (value === null || value === undefined || value === 0) return '';
    return value.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const handlePrintActivePolicy = () => {
    // Asegura que el contenedor del reporte contenga el Encabezado Institucional completo antes de imprimir
    const reportElem = document.getElementById('printable-policy-sheet');
    if (reportElem) {
      reportElem.classList.add('print-focus');
    }
    document.body.classList.add('printing-active-report');

    const styleEl = document.createElement('style');
    styleEl.id = 'temp-pdf-orientation-style';
    styleEl.innerHTML = `
      @page {
        size: portrait !important;
        margin: 15mm !important;
      }
      @media print {
        body {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
          background: white !important;
          background-color: white !important;
        }
        /* Completely hide navigation bar, app headers, sidebar elements, and tool panels when printing a single report */
        header, footer, nav, .no-print, [role="tablist"], button, .no-print-element {
          display: none !important;
        }
        #main-frame, main, .printable-area {
          padding: 0 !important;
          margin: 0 !important;
          background: white !important;
        }
        .excel-container {
          border: none !important;
          box-shadow: none !important;
          padding: 0 !important;
        }
        #printable-policy-sheet {
          border: none !important;
          padding: 0 !important;
          margin: 0 !important;
        }
      }
    `;
    document.head.appendChild(styleEl);

    // native print trigger as requested
    window.print();

    // Clean up style descriptors subsequently
    setTimeout(() => {
      if (reportElem) {
        reportElem.classList.remove('print-focus');
      }
      document.body.classList.remove('printing-active-report');
      const attached = document.getElementById('temp-pdf-orientation-style');
      if (attached) {
        attached.remove();
      }
    }, 1000);
  };

  return (
    <div className="w-full flex flex-col lg:flex-row gap-6 bg-transparent select-none min-h-[500px]">
      
      {/* LEFT SIDEBAR: Polizas Directory */}
      <div className="w-full lg:w-80 bg-white border border-gray-200 rounded-xl p-4 flex flex-col no-print">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-extrabold text-[12px] uppercase tracking-wider text-gray-500 font-sans">
            📁 Directorio de Pólizas
          </h3>
          <span className="font-mono text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold">
            Total: {policies.length}
          </span>
        </div>

        {/* Create new action button */}
        <button
          onClick={handleStartCapture}
          className={`w-full py-2 px-3 border rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm cursor-pointer mb-3 ${
            selectedPolicyId === null
              ? 'bg-emerald-50 text-emerald-800 border-emerald-300 ring-2 ring-emerald-100'
              : 'bg-emerald-700 hover:bg-emerald-800 text-white border-emerald-800'
          }`}
          id="btn-sidebar-new-pol"
        >
          <Plus size={14} />
          <span>Nueva Póliza Diario</span>
        </button>

        {/* Scrollable list of registered policies */}
        <div className="flex-1 overflow-y-auto max-h-[500px] space-y-2 pr-1">
          {policies.length === 0 ? (
            <div className="text-center py-8 text-gray-400 italic text-[11px]">
              No hay pólizas creadas. Pulse arriba para asentar.
            </div>
          ) : (
            policies
              .sort((a, b) => b.number.localeCompare(a.number))
              .map((pol) => {
                const isActive = pol.id === selectedPolicyId;
                const debitsTotal = pol.movements.reduce((sum, m) => sum + (m.debit || 0), 0);
                
                return (
                  <div
                    key={pol.id}
                    onClick={() => setSelectedPolicyId(pol.id)}
                    className={`p-2.5 rounded-lg border transition cursor-pointer text-left relative group ${
                      isActive
                        ? 'bg-blue-50 border-blue-300 ring-1 ring-blue-200'
                        : 'bg-slate-50/50 hover:bg-slate-50 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-mono font-bold text-xs text-gray-800 flex items-center gap-1">
                        <FileText size={12} className={isActive ? 'text-blue-600' : 'text-gray-400'} />
                        {pol.number}
                      </span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded font-mono ${
                        pol.isAdjustment
                          ? 'bg-red-50 text-red-700 border border-red-200'
                          : pol.type === 'Ingreso'
                          ? 'bg-emerald-50 text-emerald-700'
                          : pol.type === 'Egreso'
                          ? 'bg-rose-50 text-rose-700'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {pol.isAdjustment ? 'Ajuste' : pol.type}
                      </span>
                    </div>

                    <p className="text-[11px] text-gray-600 truncate mt-1.5 font-medium leading-none">
                      {pol.concept}
                    </p>

                    <div className="flex justify-between items-center mt-2 border-t border-dashed border-gray-200 pt-1.5 text-[10px] text-gray-400">
                      <span>{pol.date}</span>
                      <span className="font-mono font-bold text-gray-700">
                        ${debitsTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    {/* Left hover deleting trigger */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`¿Eliminar la póliza ${pol.number} definitivamente?`)) {
                          deletePolicy(pol.id);
                          if (selectedPolicyId === pol.id) {
                            handleStartCapture();
                          }
                        }
                      }}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 bg-red-100 text-red-700 hover:bg-red-200 p-1 rounded transition text-xs cursor-pointer no-print"
                      title="Eliminar póliza"
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                );
              })
          )}
        </div>
      </div>

      {/* RIGHT WORKSPACE CARD: Document or Form layout */}
      <div className="flex-1 bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col justify-between">
        
        {selectedPolicyId === null ? (
          
          /* VIEW A: INTERACTIVE CAPTURE FORM */
          <div>
            <div className="border-b border-gray-100 pb-3 mb-5 flex justify-between items-center text-[#111111]">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span className="font-sans font-extrabold text-[12px] uppercase tracking-wider text-gray-700">
                  Ficha de Captura Contable (Póliza de Diario)
                </span>
              </div>
              <span className="text-[10px] font-bold font-mono bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-full">
                Inventarios Perpetuos
              </span>
            </div>

            <form onSubmit={handleSavePolicy} className="grid grid-cols-1 md:grid-cols-6 gap-4 text-xs">
              <div className="flex flex-col gap-1 md:col-span-1">
                <label className="font-sans font-extrabold text-[10px] text-gray-400 uppercase tracking-wider">Póliza No.</label>
                <input
                  type="text"
                  required
                  className="border border-gray-200 rounded-lg p-2 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none font-mono font-bold"
                  value={polNumber}
                  onChange={(e) => setPolNumber(e.target.value)}
                  placeholder="e.g. P-01"
                  id="txt-poliza-no"
                />
              </div>

              <div className="flex flex-col gap-1 md:col-span-1">
                <label className="font-sans font-extrabold text-[10px] text-gray-400 uppercase tracking-wider">Fecha</label>
                <input
                  type="date"
                  required
                  className="border border-gray-200 rounded-lg p-1.5 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none font-mono text-emerald-800 font-medium"
                  value={polDate}
                  onChange={(e) => setPolDate(e.target.value)}
                  id="txt-poliza-fecha"
                />
              </div>

              <div className="flex flex-col gap-1 md:col-span-1">
                <label className="font-sans font-extrabold text-[10px] text-gray-400 uppercase tracking-wider">Tipo Póliza</label>
                <select
                  className="border border-gray-200 rounded-lg p-2 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none font-sans font-medium bg-white"
                  value={polType}
                  onChange={(e) => setPolType(e.target.value as any)}
                  id="sel-poliza-tipo"
                >
                  <option value="Ingreso">Ingreso</option>
                  <option value="Egreso">Egreso</option>
                  <option value="Diario">Diario</option>
                  <option value="Cheque">Cheque</option>
                </select>
              </div>

              <div className="flex flex-col gap-1 md:col-span-2">
                <label className="font-sans font-extrabold text-[10px] text-gray-400 uppercase tracking-wider">Concepto Central</label>
                <input
                  type="text"
                  required
                  className="border border-gray-200 rounded-lg p-2 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none text-[#111111]"
                  value={polConcept}
                  onChange={(e) => setPolConcept(e.target.value)}
                  placeholder="Describa brevemente la operación comercial..."
                  id="txt-poliza-concepto"
                />
              </div>

              <div className="flex items-center gap-2 md:col-span-1 self-end pb-3 pl-1">
                <input
                  type="checkbox"
                  id="chk-ajuste-port"
                  className="w-4 h-4 text-emerald-600 border-gray-300 rounded cursor-pointer mt-0.5"
                  checked={polIsAdjustment}
                  onChange={(e) => setPolIsAdjustment(e.target.checked)}
                />
                <label htmlFor="chk-ajuste-port" className="font-sans font-bold text-[11px] text-red-700 cursor-pointer select-none">
                  ⚙️ Ajuste Cierre
                </label>
              </div>

              <div className="flex flex-col gap-1 md:col-span-3">
                <label className="font-sans font-extrabold text-[10px] text-gray-400 uppercase tracking-wider">Comprobante de Soporte (Opcional)</label>
                <input
                  type="text"
                  className="border border-gray-200 rounded-lg p-2 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
                  value={polReference}
                  onChange={(e) => setPolReference(e.target.value)}
                  placeholder="e.g. Factura No. F-402, Comprobante Bancario"
                  id="txt-poliza-comprobante"
                />
              </div>

              <div className="flex flex-col gap-1 md:col-span-3">
                <label className="font-sans font-extrabold text-[10px] text-gray-400 uppercase tracking-wider">Quien Elaboró</label>
                <input
                  type="text"
                  required
                  className="border border-gray-200 rounded-lg p-2 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none font-mono"
                  value={polAuthor}
                  onChange={(e) => setPolAuthor(e.target.value)}
                  id="txt-poliza-autor"
                />
              </div>

              <div className="md:col-span-6 mt-2">
                <div className="bg-slate-50 font-sans text-[11px] border-t border-x border-gray-200 text-gray-500 p-2.5 rounded-t-xl font-bold flex justify-between items-center">
                  <span className="uppercase tracking-wider">Partida Doble (Cargos y Abonos)</span>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                    isBalanced ? "bg-emerald-100 text-emerald-800 font-bold" : "bg-amber-100 text-amber-800 font-medium"
                  }`}>
                    {isBalanced ? "⚖️ REGISTRO CUADRADO" : "⚠️ ASIENTO DESCUADRADO"}
                  </span>
                </div>
                
                <table className="w-full border-collapse border border-gray-200 text-xs">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 font-mono text-gray-400 text-[10px] uppercase">
                      <th className="w-56 px-2 py-2 text-left border-r border-gray-200">Clave Cuenta</th>
                      <th className="px-2 py-2 text-left border-r border-gray-200">Subcuenta (Para Gastos 51/52)</th>
                      <th className="w-36 px-2 py-2 text-right border-r border-gray-200">Debe ($)</th>
                      <th className="w-36 px-2 py-2 text-right border-r border-gray-200">Haber ($)</th>
                      <th className="w-12 text-center py-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {draftMovements.map((move, idx) => {
                      const filteredSubs = subaccounts.filter((sub) => sub.parentCode === move.accountCode);
                      const isExpense = move.accountCode === '51' || move.accountCode === '52';

                      return (
                        <tr key={idx} className="border-b border-gray-200 hover:bg-slate-50/50">
                          {/* Account Selection */}
                          <td className="p-1.5 border-r border-gray-200">
                            <select
                              className="w-full bg-white border border-gray-100 rounded p-1 outline-none font-mono text-[11px]"
                              value={move.accountCode}
                              onChange={(e) => handleUpdateMovement(idx, { accountCode: e.target.value })}
                              id={`sel-acct-${idx}`}
                            >
                              <option value="">-- Seleccionar Cuenta --</option>
                              {accounts.map((ac) => (
                                <option key={ac.code} value={ac.code}>
                                  {ac.code} - {ac.name} ({ac.type})
                                </option>
                              ))}
                            </select>
                          </td>

                          {/* Subaccount Selection */}
                          <td className="p-1.5 border-r border-gray-200">
                            {isExpense ? (
                              <select
                                className="w-full bg-white border border-gray-100 rounded p-1 outline-none text-[11px] italic font-medium"
                                value={move.subaccountCode || ''}
                                onChange={(e) => handleUpdateMovement(idx, { subaccountCode: e.target.value || null })}
                                id={`sel-subacct-${idx}`}
                              >
                                <option value="">Ninguno / Sin Subcuenta</option>
                                {filteredSubs.map((sub) => (
                                  <option key={sub.code} value={sub.code}>
                                    {sub.code} {sub.name}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <span className="text-gray-400 pl-2 text-[10px] font-mono select-none">No aplica</span>
                            )}
                          </td>

                          {/* Debit Value */}
                          <td className="p-1.5 border-r border-gray-200">
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              placeholder="0.00"
                              className="w-full text-right p-1 bg-transparent border-0 focus:outline-none font-mono text-blue-900 font-bold"
                              value={move.debit === null ? '' : move.debit}
                              onChange={(e) => {
                                const val = e.target.value === '' ? null : parseFloat(e.target.value);
                                handleUpdateMovement(idx, { debit: val });
                              }}
                              id={`txt-debe-${idx}`}
                            />
                          </td>

                          {/* Credit Value */}
                          <td className="p-1.5 border-r border-gray-200">
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              placeholder="0.00"
                              className="w-full text-right p-1 bg-transparent border-0 focus:outline-none font-mono text-red-900 font-bold"
                              value={move.credit === null ? '' : move.credit}
                              onChange={(e) => {
                                const val = e.target.value === '' ? null : parseFloat(e.target.value);
                                handleUpdateMovement(idx, { credit: val });
                              }}
                              id={`txt-haber-${idx}`}
                            />
                          </td>

                          {/* Action Delete row */}
                          <td className="p-1 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveDraftRow(idx)}
                              className="text-gray-400 hover:text-red-600 transition p-1 cursor-pointer"
                              disabled={draftMovements.length <= 2}
                              id={`btn-quitar-mov-${idx}`}
                            >
                              <Trash2 size={13} className="mx-auto" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {/* Subtotals & Plus buttons */}
                <div className="flex font-mono text-[11px] p-2 bg-slate-50 border border-t-0 border-gray-200 text-gray-500 rounded-b-xl items-center">
                  <button
                    type="button"
                    onClick={handleAddDraftRow}
                    className="bg-emerald-600 text-white font-bold py-1 px-3 rounded-lg hover:bg-emerald-700 flex items-center gap-1 cursor-pointer shadow-sm text-xs"
                    id="btn-agregar-mov"
                  >
                    <Plus size={13} /> Añadir Movimiento
                  </button>
                  
                  <div className="ml-auto flex gap-6 text-[11px] text-[#111111] font-bold">
                    <div>
                      Suma Debe: <span className="text-blue-800 font-mono">${draftDebits.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div>
                      Suma Haber: <span className="text-red-800 font-mono">${draftCredits.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Save Póliza */}
              <div className="md:col-span-6 flex justify-end gap-3 border-t border-gray-100 pt-3.5">
                {!isBalanced && draftDebits > 0 && (
                  <span className="text-red-700 font-bold text-[11px] flex items-center gap-1.5 animate-pulse">
                    <AlertTriangle size={14} /> Asiento descuadrado por ${Math.abs(draftDebits - draftCredits).toLocaleString('es-MX', { minimumFractionDigits: 2 })}.
                  </span>
                )}
                <button
                  type="submit"
                  disabled={!isBalanced}
                  className={`font-sans text-xs font-extrabold py-2 px-5 rounded-lg cursor-pointer flex items-center gap-1 shadow-sm transition ${
                    isBalanced
                      ? 'bg-emerald-700 text-white hover:bg-emerald-800 border border-emerald-800'
                      : 'bg-gray-200 text-gray-400 border border-gray-300 cursor-not-allowed'
                  }`}
                  id="btn-registrar-poliza"
                >
                  <CheckCircle size={14} /> Guardar & Registrar Póliza
                </button>
              </div>
            </form>
          </div>
          
        ) : (
          
          /* VIEW B: OFFICIAL DOCUMENT FORMAT LISTED READY FOR PRINTING */
          <div className="p-1 flex-1 flex flex-col justify-between">
            {/* Header controls inside workspace page */}
            <div className="no-print bg-slate-50 p-2.5 rounded-lg border border-gray-200 flex justify-between items-center mb-6">
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-700">
                <CheckCircle size={14} className="text-green-600" />
                <span>Póliza registrada con éxito. Archivo de Póliza Oficial listo.</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleStartCapture}
                  className="bg-white hover:bg-gray-50 text-[11px] font-sans font-bold border border-gray-300 px-3 py-1.5 flex items-center gap-1 cursor-pointer transition text-gray-750 rounded-lg shadow-sm"
                >
                  <Plus size={12} /> Nueva Captura
                </button>
                <button
                  onClick={handlePrintActivePolicy}
                  className="bg-emerald-600 hover:bg-emerald-700 text-[11px] font-sans font-extrabold text-white px-4 py-1.5 flex items-center gap-1.5 cursor-pointer transition shadow-sm rounded-lg"
                  id="btn-print-active-policy"
                >
                  <Printer size={13} /> Imprimir / Guardar Póliza en PDF
                </button>
              </div>
            </div>

            {/* PAPER: Printable Official Document Sheet (Póliza de Diario) */}
            <div className="bg-white p-6 border border-gray-200 rounded-lg flex-1 min-h-[480px] flex flex-col justify-between" id="printable-policy-sheet">
              <div>
                {/* Micro mini letterhead */}
                <div className="flex justify-between items-start border-b border-gray-300 pb-3 mb-4">
                  <div>
                    <h4 className="text-sm font-black text-slate-900 tracking-tight uppercase">
                      ZITÁCUARO IMPORTACIONES, S.A. DE C.V.
                    </h4>
                    <p className="text-[10px] font-mono text-gray-500">
                      RFC: ZIM-980415G34 | Domicilio Fiscal: Av. Revolución Sur #142, Col. Centro, C.P. 61500
                    </p>
                  </div>
                  <div className="text-right">
                    <h3 className="text-xs font-extrabold text-[#111111] uppercase select-all bg-emerald-50 text-emerald-850 px-2.5 py-1 rounded border border-emerald-100">
                      PÓLIZA DE {activePolicy?.type ? activePolicy.type.toUpperCase() : 'DIARIO'} ─ {activePolicy?.number}
                    </h3>
                    <p className="text-[10px] text-gray-400 font-mono mt-1">Fecha de Registro: {activePolicy?.date}</p>
                  </div>
                </div>

                {/* Conceptual fields block */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-[11.5px] border border-gray-200 rounded-lg p-3 bg-gray-50/50 mb-4 leading-relaxed">
                  <div>
                    <span className="font-extrabold text-gray-400 uppercase text-[9px] tracking-wider block">Concepto de Operación:</span>
                    <strong className="text-gray-800 text-[12px]">{activePolicy?.concept}</strong>
                  </div>
                  <div>
                    <span className="font-extrabold text-gray-400 uppercase text-[9px] tracking-wider block">Documento de Soporte:</span>
                    <span className="font-mono text-gray-700">{activePolicy?.reference || 'N/A'}</span>
                  </div>
                  <div className="mt-1 md:col-span-2 flex justify-between items-center text-[10px] text-gray-400 font-mono pt-1.5 border-t border-dashed border-gray-250">
                    <span>Área: Dirección de Finanzas y Contabilidad</span>
                    <span>Auxiliar: <strong>L.C. Luis Gerardo Perez</strong></span>
                  </div>
                </div>

                {/* Movements Grid */}
                <table className="w-full border-collapse border border-gray-300 text-[11px] mb-8 font-sans">
                  <thead>
                    <tr className="bg-slate-50 border-b border-gray-300 text-gray-400 font-mono font-bold text-[9px] uppercase">
                      <th className="w-20 px-2 py-1.5 text-center border-r border-gray-300 select-none">Clave</th>
                      <th className="px-2 py-1.5 text-left border-r border-gray-300">Cuenta - Subcuenta Contable</th>
                      <th className="w-28 px-2 py-1.5 text-right border-r border-gray-300">Debe ($)</th>
                      <th className="w-28 px-2 py-1.5 text-right font-semibold">Haber ($)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activePolicy?.movements.map((mov, mIdx) => {
                      const foundAcct = accounts.find((a) => a.code === mov.accountCode);
                      const acctName = foundAcct ? foundAcct.name : 'Cuenta Desconocida';
                      const foundSub = mov.subaccountCode ? subaccounts.find((s) => s.code === mov.subaccountCode) : null;

                      return (
                        <React.Fragment key={mIdx}>
                          {/* Account line */}
                          <tr className="border-b border-gray-200 hover:bg-slate-50/20 text-slate-800 font-medium">
                            <td className="border-r border-gray-300 text-center font-mono py-1 text-gray-600">
                              {mov.accountCode}
                            </td>
                            <td className="border-r border-gray-300 px-2 font-bold">
                              {acctName}
                            </td>
                            <td className="border-r border-gray-300 px-2 text-right font-mono text-blue-900 font-bold">
                              {formatCellAmount(mov.debit)}
                            </td>
                            <td className="px-2 text-right font-mono text-red-900 font-bold">
                              {formatCellAmount(mov.credit)}
                            </td>
                          </tr>

                          {/* Subaccount row details if assigned */}
                          {foundSub && (
                            <tr className="border-b border-gray-100 bg-gray-50/10 italic text-[10px]">
                              <td className="border-r border-gray-300 text-center text-gray-400 font-mono">
                                {foundSub.code}
                              </td>
                              <td className="border-r border-gray-300 px-6 text-gray-500">
                                ↪ {foundSub.name}
                              </td>
                              <td className="border-r border-gray-300 px-2 text-right font-mono text-gray-400">
                                {formatCellAmount(mov.debit || mov.credit)}
                              </td>
                              <td></td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}

                    {/* Double Underline Totals */}
                    <tr className="bg-slate-50 border-b-4 border-double border-slate-900 font-semibold h-9">
                      <td colSpan={2} className="px-3 py-1.5 font-bold text-right border-r border-gray-300 text-[#111111] font-mono text-[9.5px] uppercase">
                        SUMAS IGUALES DE PÓLIZA:
                      </td>
                      <td className="border-r border-gray-300 px-2 text-right font-black text-blue-950 font-mono text-xs">
                        ${activePolicy?.movements.reduce((s, m) => s + (m.debit || 0), 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-2 text-right font-black text-red-950 font-mono text-xs">
                        ${activePolicy?.movements.reduce((s, m) => s + (m.credit || 0), 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Signature lines bottom block */}
              <div className="grid grid-cols-3 gap-6 text-[10.5px] text-center font-sans mt-8 border-t border-gray-200 pt-6">
                <div>
                  <div className="border-b border-gray-300 pb-1 mx-auto max-w-[150px] h-10 select-none"></div>
                  <span className="font-extrabold text-slate-500 block uppercase mt-1 tracking-wider text-[9px]">Elaboró</span>
                  <span className="text-slate-800 font-extrabold text-[11px] block">L.C. Luis Gerardo Perez</span>
                  <span className="text-[10px] text-gray-400 font-mono">Auxiliar Contable</span>
                </div>
                <div>
                  <div className="border-b border-gray-300 pb-1 mx-auto max-w-[150px] h-10 select-none"></div>
                  <span className="font-extrabold text-slate-500 block uppercase mt-1 tracking-wider text-[9px]">Revisó</span>
                  <span className="text-slate-800 font-extrabold text-[11px] block">L.C. Gerardo Pérez</span>
                  <span className="text-[10px] text-gray-400 font-mono">Contralor General</span>
                </div>
                <div>
                  <div className="border-b border-gray-300 pb-1 mx-auto max-w-[150px] h-10 select-none"></div>
                  <span className="font-extrabold text-slate-500 block uppercase mt-1 tracking-wider text-[9px]">Autorizó</span>
                  <span className="text-slate-800 font-bold block text-[11px]">Director de Finanzas</span>
                  <span className="text-[10px] text-gray-400 font-mono">Dirección General</span>
                </div>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
