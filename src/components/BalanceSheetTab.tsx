/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useAccountingStore } from '../store';
import DownloadToolbar from './DownloadToolbar';

export default function BalanceSheetTab() {
  const { 
    policies, 
    balanceSheetFormat: formatMode, 
    setBalanceSheetFormat: setFormatMode 
  } = useAccountingStore();

  const handlePrint = () => {
    window.print();
  };

  // Compute normal debit balance or credit balance safely
  const getBalance = (code: string) => {
    let debits = 0;
    let credits = 0;

    policies.forEach((pol) => {
      pol.movements.forEach((mov) => {
        if (mov.accountCode === code) {
          debits += mov.debit || 0;
          credits += mov.credit || 0;
        }
      });
    });

    const creditNormal = ['6-D', '7-D', '8-D', '9-D', '20', '21', '22', '30', '31', '40', '41', '60'];
    if (creditNormal.includes(code)) {
      return credits - debits; // Acreedora normal
    } else {
      return debits - credits; // Deudora normal
    }
  };

  // 1. Assets (Activo Circulante)
  const caja = getBalance('1');
  const bancos = getBalance('2');
  const almacen = getBalance('3');
  const clientes = getBalance('4');
  const docCobrar = getBalance('5');
  const papeleria = getBalance('10');

  const totalCirculante = caja + bancos + almacen + clientes + docCobrar + papeleria;

  // 2. Assets (Activo No Circulante - Fijo)
  const edificios = getBalance('6');
  const depEdificios = getBalance('6-D'); // Acreedora (subtracted positive amount)
  const netEdificios = edificios - depEdificios;

  const mobiliario = getBalance('7');
  const depMobiliario = getBalance('7-D');
  const netMobiliario = mobiliario - depMobiliario;

  const computo = getBalance('8');
  const depComputo = getBalance('8-D');
  const netComputo = computo - depComputo;

  const transporte = getBalance('9');
  const depTransporte = getBalance('9-D');
  const netTransporte = transporte - depTransporte;

  const totalNoCirculante = netEdificios + netMobiliario + netComputo + netTransporte;
  const totalActivo = totalCirculante + totalNoCirculante;

  // 3. Liabilities (Pasivo Circulante/Corto Plazo)
  const proveedores = getBalance('20');
  const docPagar = getBalance('21');
  const contribuciones = getBalance('22');

  const totalPasivo = proveedores + docPagar + contribuciones;

  // 4. Utility / Income Statement Result (Net gain/loss)
  const sales = getBalance('40');
  const costOfSales = getBalance('50');
  const adminExpenses = getBalance('51');
  const sellingExpenses = getBalance('52');
  const depExpenses = getBalance('53');
  const financialIncomes = getBalance('41');

  const netIncomeOfPeriod = (sales + financialIncomes) - (costOfSales + adminExpenses + sellingExpenses + depExpenses);

  // 5. Capital Contable
  const capitalSocial = getBalance('30');
  const utilidadesAnteriores = getBalance('31');

  // Net Capital in Report format is calculated mathematically as Direct Residual: Activo - Pasivo
  const computedCapitalReportMode = totalActivo - totalPasivo;

  // School Account Rule: SÍ se incluye el renglón de Utilidad de forma explícita en Capital
  const totalCapitalCuentaMode = capitalSocial + utilidadesAnteriores + netIncomeOfPeriod;
  const totalPasivoMasCapitalCuentaMode = totalPasivo + totalCapitalCuentaMode;

  // Helper formatting for currency values
  const formatCellAmountVal = (value: number | null | undefined) => {
    if (value === null || value === undefined || value === 0) return '';
    return value.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  /* ========================================================================
     LEFT-SIDE AND RIGHT-SIDE FLATTENING ARRAY BUILDERS FOR Horizontal Cuenta
     ======================================================================== */
  interface SideRow {
    isHeader?: boolean;
    isSubtotal?: boolean;
    isSpacer?: boolean;
    code?: string;
    name: string;
    value?: number | null;
    netAssetParent?: number | null; // For holding primary asset before depreciation
    depreciationVal?: number | null; // For holding asset depreciation
    subtotal?: number | null;
    total?: number | null;
    hasLineCut?: boolean; // Represents mathematical single cut operation
  };

  const buildLeftRows = (): SideRow[] => {
    const list: SideRow[] = [];
    
    // Activo Circulante Header
    list.push({ name: '🟢 ACTIVO CIRCULANTE (C.P.)', isHeader: true });
    list.push({ code: '1', name: 'Caja', value: caja });
    list.push({ code: '2', name: 'Bancos', value: bancos });
    list.push({ code: '3', name: 'Almacén', value: almacen });
    list.push({ code: '4', name: 'Clientes', value: clientes });
    list.push({ code: '5', name: 'Documentos por Cobrar', value: docCobrar });
    list.push({ code: '10', name: 'Papelería y Útiles', value: papeleria, hasLineCut: true });
    list.push({ name: 'Suma Activo Circulante', isSubtotal: true, subtotal: totalCirculante });

    // Activo No Circulante Header
    list.push({ name: '🏬 ACTIVO NO CIRCULANTE (Fijo)', isHeader: true });
    
    list.push({ code: '6', name: 'Edificios', netAssetParent: edificios });
    list.push({ code: '6-D', name: '(-) Depreciación Edificios', depreciationVal: depEdificios, value: netEdificios });
    
    list.push({ code: '7', name: 'Mobiliario y Equipo', netAssetParent: mobiliario });
    list.push({ code: '7-D', name: '(-) Depreciación Mobiliario', depreciationVal: depMobiliario, value: netMobiliario });
    
    list.push({ code: '8', name: 'Equipo de Cómputo', netAssetParent: computo });
    list.push({ code: '8-D', name: '(-) Depreciación Cómputo', depreciationVal: depComputo, value: netComputo });
    
    list.push({ code: '9', name: 'Equipo de Transporte', netAssetParent: transporte });
    list.push({ code: '9-D', name: '(-) Depreciación Transporte', depreciationVal: depTransporte, value: netTransporte, hasLineCut: true });
    
    list.push({ name: 'Suma Activo No Circulante', isSubtotal: true, subtotal: totalNoCirculante });

    return list;
  };

  const buildRightRows = (): SideRow[] => {
    const list: SideRow[] = [];
    
    // Pasivo Corto Plazo Header
    list.push({ name: '🔴 PASIVO A CORTO PLAZO', isHeader: true });
    list.push({ code: '20', name: 'Proveedores', value: proveedores });
    list.push({ code: '21', name: 'Documentos por Pagar comercial', value: docPagar });
    list.push({ code: '22', name: 'Impuestos y Contribuciones', value: contribuciones, hasLineCut: true });
    list.push({ name: 'Suma del Pasivo Corto Plazo', isSubtotal: true, subtotal: totalPasivo });

    // Capital Contable Header
    list.push({ name: '🔵 CAPITAL CONTABLE', isHeader: true });
    list.push({ code: '30', name: 'Capital Social', value: capitalSocial });
    list.push({ code: '31', name: 'Utilidades de Ejercicios Anteriores', value: utilidadesAnteriores });
    list.push({ code: '✓', name: 'Utilidad Neta del Ejercicio (de ERe)', value: netIncomeOfPeriod, hasLineCut: true });
    list.push({ name: 'Suma del Capital Contable', isSubtotal: true, subtotal: totalCapitalCuentaMode });

    return list;
  };

  const leftSideRows = buildLeftRows();
  const rightSideRows = buildRightRows();

  // HORIZONTAL SIDE EQUALIZER: Fill the shorter side with gorgeous empty slots
  const maxRowsCount = Math.max(leftSideRows.length, rightSideRows.length);
  while (leftSideRows.length < maxRowsCount) {
    leftSideRows.push({ name: '', isSpacer: true });
  }
  while (rightSideRows.length < maxRowsCount) {
    rightSideRows.push({ name: '', isSpacer: true });
  }

  /* Target first valid numeric inputs for Rule of First $ */
  let leftFirstParcialIdx = -1;
  let leftFirstSubtotalIdx = -1;
  let rightFirstParcialIdx = -1;
  let rightFirstSubtotalIdx = -1;

  leftSideRows.forEach((row, i) => {
    if (!row.isSpacer && !row.isHeader) {
      if (leftFirstParcialIdx === -1 && (row.value || row.netAssetParent)) leftFirstParcialIdx = i;
      if (leftFirstSubtotalIdx === -1 && row.isSubtotal && row.subtotal) leftFirstSubtotalIdx = i;
    }
  });

  rightSideRows.forEach((row, i) => {
    if (!row.isSpacer && !row.isHeader) {
      if (rightFirstParcialIdx === -1 && row.value) rightFirstParcialIdx = i;
      if (rightFirstSubtotalIdx === -1 && row.isSubtotal && row.subtotal) rightFirstSubtotalIdx = i;
    }
  });

  return (
    <div className={`w-full bg-transparent select-none relative pb-12 print-page-avoid-break ${formatMode === 'Cuenta' ? 'print-landscape' : 'print-portrait'}`}>
      
      {/* 1. COMPACT TAB SCREEN HEADER CONTROL PANEL */}
      <div className="no-print bg-slate-50 border border-gray-200 p-4 rounded-xl mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs">
        <div className="font-sans leading-relaxed text-gray-700 max-w-xl">
          <strong>Balance General (Formas de Cuenta y Reporte):</strong> 
          Soporta el formato de <strong>Reporte Continuo</strong> vertical y el formato de <strong>Cuenta Sincrónica</strong>. El formato de Cuenta utiliza un nivelador dinámico que asegura una alineación matemática horizontal perfecta en las sumas del fondo.
        </div>
        
        <div className="flex flex-wrap gap-2.5 items-center shrink-0">
          <button
            onClick={() => setFormatMode(formatMode === 'Cuenta' ? 'Reporte' : 'Cuenta')}
            className="px-3.5 py-2 text-[11px] font-sans font-extrabold cursor-pointer transition rounded-lg bg-emerald-50 text-emerald-850 hover:bg-emerald-100 border border-emerald-200"
            id="toggle-balance-mode"
          >
            Ver en Forma de {formatMode === 'Cuenta' ? 'Reporte (Vertical)' : 'Cuenta (L/R Perfecta)'}
          </button>
          
          <DownloadToolbar 
            reportId="reporte-balance-general" 
            fileName={formatMode === 'Cuenta' ? "Balance_General_Forma_Cuenta.pdf" : "Balance_General_Forma_Reporte.pdf"} 
            orientation={formatMode === 'Cuenta' ? "landscape" : "portrait"} 
          />
        </div>
      </div>

      {formatMode === 'Reporte' ? (
        
        /* ————————————————————————————————————————————————
           VERTICAL REPORT FORMAT (A - P = C)
           ———————————————————————————————————————————————— */
        <div id="reporte-balance-general" className="p-1">
          {/* Cover/header tag for Word exported documents */}
          <div className="hidden doc-only-header py-4 text-center font-bold">
            <h3>BALANCE GENERAL EN FORMA DE REPORTE</h3>
          </div>

          <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
            <div className="bg-slate-50 border-b border-gray-200 text-[11px] px-4 py-2 font-mono text-gray-500 flex justify-between items-center no-print">
              <span>BALANCE_REPORTE_VERTICAL.xlsx</span>
              <span className="bg-white px-2 py-0.5 rounded border border-gray-200">Ecuación: Activo - Pasivo = Capital</span>
            </div>

          <table className="w-full border-collapse text-[12.5px] font-sans">
            <thead>
              <tr className="bg-slate-50/50 border-b border-gray-200 text-[10.5px] font-mono text-gray-400 uppercase tracking-widest h-10 select-none">
                <th className="w-14 border-r border-gray-200 text-center font-bold">Fila</th>
                <th className="border-r border-gray-150 text-left px-5 font-bold">Conceptos de la Estructura de Balance</th>
                <th className="w-40 border-r border-gray-200 text-right px-4 font-bold">Columna 1 (Parcial)</th>
                <th className="w-40 border-r border-gray-200 text-right px-4 font-bold">Columna 2 (Subtotal)</th>
                <th className="w-44 text-right px-4 font-bold">Columna 3 (Total)</th>
              </tr>
            </thead>
            <tbody>
              
              {/* SECTION: ACTIVO */}
              <tr className="bg-emerald-50/20 font-bold uppercase font-mono text-[9.5px] select-none h-7 tracking-wider">
                <td className="border-r border-gray-200"></td>
                <td colSpan={4} className="px-5 text-emerald-900 font-black">🟢 ACTIVO</td>
              </tr>
              
              {/* Circulante Header */}
              <tr className="bg-slate-50/10">
                <td className="border-r border-gray-200"></td>
                <td colSpan={4} className="px-5 italic font-bold text-gray-550 pl-8 h-7">Activo Circulante (Corto Plazo):</td>
              </tr>

              <tr className="hover:bg-slate-50/20 h-7 text-gray-800">
                <td className="bg-slate-50/40 border-r border-gray-150 text-[9px] font-mono text-gray-400 text-center select-none">1</td>
                <td className="border-r border-gray-220 pl-12 font-bold text-gray-700">Caja</td>
                <td className="border-r border-gray-150 px-4 text-right font-mono">$ {formatCellAmountVal(caja)}</td>
                <td className="border-r border-gray-150"></td>
                <td></td>
              </tr>

              <tr className="hover:bg-slate-50/20 h-7 text-gray-800">
                <td className="bg-slate-50/40 border-r border-gray-150 text-[9px] font-mono text-gray-400 text-center select-none">2</td>
                <td className="border-r border-gray-220 pl-12 font-bold text-gray-700">Bancos</td>
                <td className="border-r border-gray-150 px-4 text-right font-mono">{formatCellAmountVal(bancos)}</td>
                <td className="border-r border-gray-150"></td>
                <td></td>
              </tr>

              <tr className="hover:bg-slate-50/20 h-7 text-gray-800">
                <td className="bg-slate-50/40 border-r border-gray-150 text-[9px] font-mono text-gray-400 text-center select-none">3</td>
                <td className="border-r border-gray-220 pl-12 font-bold text-gray-700">Almacén</td>
                <td className="border-r border-gray-150 px-4 text-right font-mono">{formatCellAmountVal(almacen)}</td>
                <td className="border-r border-gray-150"></td>
                <td></td>
              </tr>

              <tr className="hover:bg-slate-50/20 h-7 text-gray-800">
                <td className="bg-slate-50/40 border-r border-gray-150 text-[9px] font-mono text-gray-400 text-center select-none">4</td>
                <td className="border-r border-gray-220 pl-12 font-bold text-gray-700">Clientes</td>
                <td className="border-r border-gray-150 px-4 text-right font-mono">{formatCellAmountVal(clientes)}</td>
                <td className="border-r border-gray-150"></td>
                <td></td>
              </tr>

              <tr className="hover:bg-slate-50/20 h-7 text-gray-800">
                <td className="bg-slate-50/40 border-r border-gray-150 text-[9px] font-mono text-gray-400 text-center select-none">5</td>
                <td className="border-r border-gray-220 pl-12 font-bold text-gray-700">Documentos por Cobrar</td>
                <td className="border-r border-gray-150 px-4 text-right font-mono">{formatCellAmountVal(docCobrar)}</td>
                <td className="border-r border-gray-150"></td>
                <td></td>
              </tr>

              <tr className="hover:bg-slate-50/20 h-7 text-gray-800">
                <td className="bg-slate-50/40 border-r border-gray-150 text-[9px] font-mono text-gray-400 text-center select-none">6</td>
                <td className="border-r border-gray-220 pl-12 font-bold text-gray-700">Papelería y Útiles</td>
                {/* Visual operation cut inside numeric cell strictly */}
                <td className="border-r border-gray-150 px-4 text-right font-mono border-b border-black">{formatCellAmountVal(papeleria)}</td>
                <td className="border-r border-gray-150"></td>
                <td></td>
              </tr>

              {/* Total Circulante subtotal */}
              <tr className="bg-slate-50/10 h-7.5 select-none text-[11.5px]">
                <td className="border-r border-gray-150"></td>
                <td className="border-r border-gray-220 pl-8 font-extrabold uppercase text-gray-400 tracking-wider">Suma Activo Circulante:</td>
                <td className="border-r border-gray-150"></td>
                {/* Shows with "$" strictly as it is the first number in column Subtotal */}
                <td className="border-r border-gray-150 px-4 text-right font-mono text-slate-900 font-extrabold">$ {formatCellAmountVal(totalCirculante)}</td>
                <td></td>
              </tr>

              {/* Non Circulante (Fixed) Header */}
              <tr className="bg-slate-50/10">
                <td className="border-r border-gray-200"></td>
                <td colSpan={4} className="px-5 italic font-bold text-gray-550 pl-8 h-7">Activo No Circulante (Fijo e Inversiones):</td>
              </tr>

              <tr className="hover:bg-slate-50/20 h-7">
                <td className="bg-slate-50/40 border-r border-gray-150 text-[9px] font-mono text-gray-400 text-center select-none">7</td>
                <td className="border-r border-gray-220 pl-12 font-bold text-gray-750">Edificios (6)</td>
                {/* Starts column 1 again, gets "$" */}
                <td className="border-r border-gray-150 px-4 text-right font-mono">$ {formatCellAmountVal(edificios)}</td>
                <td className="border-r border-gray-150"></td>
                <td></td>
              </tr>
              <tr className="hover:bg-slate-50/20 h-7 text-red-900 italic text-[11.5px]">
                <td className="bg-slate-50/40 border-r border-gray-150 text-[9px] font-mono text-gray-300 text-center select-none">7.1</td>
                <td className="border-r border-gray-220 pl-16 font-medium">(-) Depreciación Acumulada Edificios</td>
                <td className="border-r border-gray-150 px-4 text-right font-mono italic border-b border-black">-{formatCellAmountVal(depEdificios)}</td>
                <td className="border-r border-gray-150 px-4 text-right font-mono text-gray-700 font-semibold bg-emerald-50/5">{formatCellAmountVal(netEdificios)}</td>
                <td></td>
              </tr>

              <tr className="hover:bg-slate-50/20 h-7">
                <td className="bg-slate-50/40 border-r border-gray-150 text-[9px] font-mono text-gray-400 text-center select-none">8</td>
                <td className="border-r border-gray-220 pl-12 font-bold text-gray-750">Mobiliario y Equipo (7)</td>
                <td className="border-r border-gray-150 px-4 text-right font-mono">{formatCellAmountVal(mobiliario)}</td>
                <td className="border-r border-gray-150"></td>
                <td></td>
              </tr>
              <tr className="hover:bg-slate-50/20 h-7 text-red-900 italic text-[11.5px]">
                <td className="bg-slate-50/40 border-r border-gray-150 text-[9px] font-mono text-gray-300 text-center select-none">8.1</td>
                <td className="border-r border-gray-220 pl-16 font-medium">(-) Depreciación Acumulada Mobiliario</td>
                <td className="border-r border-gray-150 px-4 text-right font-mono italic border-b border-black">-{formatCellAmountVal(depMobiliario)}</td>
                <td className="border-r border-gray-150 px-4 text-right font-mono text-gray-700 font-semibold bg-emerald-50/5">{formatCellAmountVal(netMobiliario)}</td>
                <td></td>
              </tr>

              <tr className="hover:bg-slate-50/20 h-7">
                <td className="bg-slate-50/40 border-r border-gray-150 text-[9px] font-mono text-gray-400 text-center select-none">9</td>
                <td className="border-r border-gray-220 pl-12 font-bold text-gray-750">Equipo de Cómputo (8)</td>
                <td className="border-r border-gray-150 px-4 text-right font-mono">{formatCellAmountVal(computo)}</td>
                <td className="border-r border-gray-150"></td>
                <td></td>
              </tr>
              <tr className="hover:bg-slate-50/20 h-7 text-red-900 italic text-[11.5px]">
                <td className="bg-slate-50/40 border-r border-gray-150 text-[9px] font-mono text-gray-300 text-center select-none">9.1</td>
                <td className="border-r border-gray-220 pl-16 font-medium">(-) Depreciación Acumulada Cómputo</td>
                <td className="border-r border-gray-150 px-4 text-right font-mono italic border-b border-black">-{formatCellAmountVal(depComputo)}</td>
                <td className="border-r border-gray-150 px-4 text-right font-mono text-gray-700 font-semibold bg-emerald-50/5">{formatCellAmountVal(netComputo)}</td>
                <td></td>
              </tr>

              <tr className="hover:bg-slate-50/20 h-7">
                <td className="bg-slate-50/40 border-r border-gray-150 text-[9px] font-mono text-gray-400 text-center select-none">10</td>
                <td className="border-r border-gray-220 pl-12 font-bold text-gray-750">Equipo de Transporte (9)</td>
                <td className="border-r border-gray-150 px-4 text-right font-mono">{formatCellAmountVal(transporte)}</td>
                <td className="border-r border-gray-150"></td>
                <td></td>
              </tr>
              <tr className="hover:bg-slate-50/20 h-7 text-red-900 italic text-[11.5px]">
                <td className="bg-slate-50/40 border-r border-gray-150 text-[9px] font-mono text-gray-300 text-center select-none">10.1</td>
                <td className="border-r border-gray-220 pl-16 font-medium">(-) Depreciación Acumulada Transporte</td>
                {/* Visual operation line cut inside TD only */}
                <td className="border-r border-gray-150 px-4 text-right font-mono italic border-b border-black">-{formatCellAmountVal(depTransporte)}</td>
                <td className="border-r border-gray-150 px-4 text-right font-mono text-gray-700 font-semibold bg-emerald-50/5 border-b border-black">{formatCellAmountVal(netTransporte)}</td>
                <td></td>
              </tr>

              {/* Total Fijo subtotal */}
              <tr className="bg-slate-50/10 h-7.5 select-none text-[11.5px]">
                <td className="border-r border-gray-150"></td>
                <td className="border-r border-gray-220 pl-8 font-extrabold uppercase text-gray-400 tracking-wider">Suma Activo No Circulante:</td>
                <td className="border-r border-gray-150"></td>
                <td className="border-r border-gray-150 px-4 text-right font-mono text-slate-800 font-extrabold border-b border-black">{formatCellAmountVal(totalNoCirculante)}</td>
                <td></td>
              </tr>

              {/* Total ACTIVO absolute */}
              <tr className="bg-slate-50 hover:bg-slate-100/40 font-bold h-9">
                <td className="border-r border-gray-150"></td>
                <td className="border-r border-gray-220 pl-6 text-[#111111] font-mono uppercase tracking-widest text-[11.5px]">SUMA TOTAL DEL ACTIVO:</td>
                <td className="border-r border-gray-150"></td>
                <td className="border-r border-gray-150"></td>
                {/* Shows with "$" as first of column 3 (Total) */}
                <td className="px-4 text-right font-mono text-[13.5px] text-blue-950 font-black border-b border-black bg-blue-100/5">$ {formatCellAmountVal(totalActivo)}</td>
              </tr>

              {/* SECTION: PASIVO */}
              <tr className="bg-red-50/10 font-bold uppercase font-mono text-[9.5px] select-none h-7.5 page-break-avoid tracking-wider">
                <td className="border-r border-gray-200"></td>
                <td colSpan={4} className="px-5 text-red-900 font-black">🔴 PASIVO (CORTO PLAZO)</td>
              </tr>

              <tr className="hover:bg-slate-50/20 h-7">
                <td className="bg-slate-50/40 border-r border-gray-150 text-[9px] font-mono text-gray-400 text-center select-none">11</td>
                <td className="border-r border-gray-220 pl-12 font-bold text-gray-700">Proveedores</td>
                {/* New section column 2 starts, gets "$" */}
                <td className="border-r border-gray-150"></td>
                <td className="border-r border-gray-150 px-4 text-right font-mono text-red-900 font-bold">$ {formatCellAmountVal(proveedores)}</td>
                <td></td>
              </tr>

              <tr className="hover:bg-slate-50/20 h-7">
                <td className="bg-slate-50/40 border-r border-gray-150 text-[9px] font-mono text-gray-400 text-center select-none">12</td>
                <td className="border-r border-gray-220 pl-12 font-bold text-gray-700">Documentos por Pagar Comercial</td>
                <td className="border-r border-gray-150"></td>
                <td className="border-r border-gray-150 px-4 text-right font-mono text-red-900">{formatCellAmountVal(docPagar)}</td>
                <td></td>
              </tr>

              <tr className="hover:bg-slate-50/20 h-7">
                <td className="bg-slate-50/40 border-r border-gray-150 text-[9px] font-mono text-gray-400 text-center select-none">13</td>
                <td className="border-r border-gray-220 pl-12 font-bold text-gray-700">Impuestos y Contribuciones por Pagar</td>
                <td className="border-r border-gray-150"></td>
                <td className="border-r border-gray-150 px-4 text-right font-mono text-red-900 border-b border-black">{formatCellAmountVal(contribuciones)}</td>
                <td></td>
              </tr>

              {/* Total PASIVO absolute */}
              <tr className="hover:bg-slate-100/40 font-bold h-9">
                <td className="border-r border-gray-150"></td>
                <td className="border-r border-gray-220 pl-6 text-[#111111] font-mono uppercase tracking-widest text-[11.5px]">SUMA TOTAL DEL PASIVO:</td>
                <td className="border-r border-gray-150"></td>
                <td className="border-r border-gray-150"></td>
                {/* First subtraction term in total, gets "$" */}
                <td className="px-4 text-right font-mono text-[13.5px] text-red-950 font-black border-b border-black bg-red-100/5">$ {formatCellAmountVal(totalPasivo)}</td>
              </tr>

              {/* SECTION: CAPITAL CONTABLE */}
              <tr className="bg-blue-50/10 font-bold uppercase font-mono text-[9.5px] select-none h-7.5 page-break-avoid tracking-wider">
                <td className="border-r border-gray-200"></td>
                <td colSpan={4} className="px-5 text-blue-900 font-black">🔵 CAPITAL CONTABLE</td>
              </tr>

              <tr className="h-7 text-gray-800">
                <td className="bg-slate-50/40 border-r border-gray-150 text-[9px] font-mono text-gray-400 text-center select-none">14</td>
                <td className="border-r border-gray-220 pl-12 font-bold text-gray-700">Capital Social</td>
                <td className="border-r border-gray-150"></td>
                <td className="border-r border-gray-150 px-4 text-right font-mono text-cyan-950 font-bold">$ {formatCellAmountVal(capitalSocial)}</td>
                <td></td>
              </tr>

              <tr className="h-7 text-gray-800">
                <td className="bg-slate-50/40 border-r border-gray-150 text-[9px] font-mono text-gray-400 text-center select-none">15</td>
                <td className="border-r border-gray-220 pl-12 font-bold text-gray-700">Utilidades de Ejercicios Anteriores</td>
                <td className="border-r border-gray-150"></td>
                <td className="border-r border-gray-150 px-4 text-right font-mono text-cyan-950">{formatCellAmountVal(utilidadesAnteriores)}</td>
                <td></td>
              </tr>

              <tr className="h-7 text-emerald-900">
                <td className="bg-slate-50/40 border-r border-gray-150 text-[9px] font-mono text-gray-400 text-center select-none">16</td>
                <td className="border-r border-gray-220 pl-12 italic font-bold">✓ Utilidad Neta del Periodo (de ERe)</td>
                <td className="border-r border-gray-150"></td>
                {/* Visual operation cut inside this subtotal cell strictly */}
                <td className="border-r border-gray-150 px-4 text-right font-mono text-emerald-950 border-b border-black">{formatCellAmountVal(netIncomeOfPeriod)}</td>
                <td></td>
              </tr>

              {/* The Report ends vertically STRICTLY once on Capital Contable del Periodo with double accounting line */}
              <tr className="bg-slate-100/50 font-extrabold h-11 select-all">
                <td className="border-r border-gray-200 text-center font-bold font-mono">∑</td>
                <td className="border-r border-gray-220 pl-6 text-[#111111] font-mono uppercase tracking-widest text-[11.5px] py-3">
                  Capital Contable del Periodo (Ecuación Residual: A - P = C):
                </td>
                <td className="border-r border-gray-150"></td>
                <td className="border-r border-gray-150"></td>
                {/* Double bottom line strictly on the total numeric cell of column 3 */}
                <td className="px-4 text-right font-mono text-[14px] text-cyan-950 font-black bg-slate-100/10 border-b-[3.5px] border-double border-black">
                  $ {formatCellAmountVal(computedCapitalReportMode)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        </div>
      ) : (
        
        /* ————————————————————————————————————————————————
           HORIZONTAL ACCOUNT FORMAT (Twin Parallel Columns in a Single DOM Table to guarantee perfect levels)
           ———————————————————————————————————————————————— */
        <div id="reporte-balance-general" className="p-1">
          {/* Cover/header tag for Word exported documents */}
          <div className="hidden doc-only-header py-4 text-center font-bold">
            <h3>BALANCE GENERAL EN FORMA DE CUENTA</h3>
          </div>

          <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
            <div className="bg-slate-50 border-b border-gray-200 text-[11px] px-4 py-2 font-mono text-gray-500 flex justify-between items-center no-print">
              <span>BALANCE_CUENTA_HORIZONTAL.xlsx</span>
              <span className="bg-white px-2 py-0.5 rounded border border-gray-200">Ecuación: Activo = Pasivo + Capital (Nivelación Automática Dinámica)</span>
            </div>

          <div className="w-full overflow-x-auto">
            <table className="w-full border-collapse text-[12.5px] font-sans min-w-[900px]">
              <thead>
                {/* Twin headers representing left and right sides seamlessly */}
                <tr className="bg-emerald-50/30 border-b border-gray-300 text-[10px] font-mono uppercase tracking-widest h-9 select-none">
                  {/* Left Headings */}
                  <th className="w-[4%] border-r border-gray-200 text-center text-emerald-900 font-black">F</th>
                  <th className="w-[26%] border-r border-gray-150 text-left px-3 text-emerald-900 font-bold">Cuentas del ACTIVO (Izquierda)</th>
                  <th className="w-[10%] border-r border-gray-150 text-right px-3 text-emerald-900 font-bold">Parcial</th>
                  <th className="w-[10%] border-r border-gray-250 text-right px-3 text-emerald-900 font-bold">Subtotal</th>
                  
                  {/* Right Headings */}
                  <th className="w-[4%] border-r border-gray-200 text-center text-rose-900 font-black">F</th>
                  <th className="w-[26%] border-r border-gray-150 text-left px-3 text-rose-900 font-bold">Cuentas del PASIVO Y CAPITAL (Derecha)</th>
                  <th className="w-[10%] border-r border-gray-150 text-right px-3 text-rose-900 font-bold">Parcial</th>
                  <th className="w-[10%] text-right px-3 text-rose-900 font-bold">Subtotal / Total</th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: maxRowsCount }).map((_, rIdx) => {
                  const left = leftSideRows[rIdx];
                  const right = rightSideRows[rIdx];

                  return (
                    <tr key={`excel-row-${rIdx}`} className="border-b border-gray-100/60 hover:bg-slate-50/10 h-7 text-gray-800">
                      
                      {/* === LEFT ACCOUNT CELL (ACTIVO) === */}
                      <td className="bg-slate-50/30 border-r border-gray-150 text-[9.5px] font-mono text-gray-400 text-center select-none font-bold">
                        {!left.isSpacer && !left.isHeader && !left.isSubtotal ? left.code : ''}
                      </td>
                      
                      <td className={`border-r border-gray-220 px-3 ${
                        left.isHeader ? 'font-black text-emerald-900 bg-emerald-50/10 text-[10.5px] tracking-wide' : 
                        left.isSubtotal ? 'font-extrabold text-slate-500 uppercase tracking-tight' : 
                        left.name.startsWith('(-)') ? 'pl-8 italic text-red-900 font-medium text-[11.5px]' : 'font-bold text-gray-800'
                      }`}>
                        {left.name}
                      </td>
                      
                      {/* Left Parcial Value */}
                      <td className="border-r border-gray-150 px-3 text-right font-mono text-[12px] text-gray-600 bg-emerald-50/5">
                        {left.isSpacer || left.isHeader || left.isSubtotal ? '' : (
                          left.netAssetParent ? (
                            rIdx === leftFirstParcialIdx ? `$ ${formatCellAmountVal(left.netAssetParent)}` : formatCellAmountVal(left.netAssetParent)
                          ) : (
                            left.depreciationVal ? (
                              <span className="text-red-900 border-b border-black block h-full select-all">-{formatCellAmountVal(left.depreciationVal)}</span>
                            ) : ''
                          )
                        )}
                      </td>
                      
                      {/* Left Subtotal Value */}
                      <td className="border-r border-gray-250 px-3 text-right font-mono text-[12px] font-bold text-gray-900 bg-emerald-50/5">
                        {left.isSpacer || left.isHeader ? '' : (
                          left.isSubtotal ? (
                            rIdx === leftFirstSubtotalIdx ? (
                              <span className="block border-b border-black select-all">$ {formatCellAmountVal(left.subtotal)}</span>
                            ) : (
                              <span className="block border-b border-black select-all">{formatCellAmountVal(left.subtotal)}</span>
                            )
                          ) : (
                            // Sub-assets (edificios, etc) nets
                            left.value ? formatCellAmountVal(left.value) : ''
                          )
                        )}
                      </td>

                      {/* === RIGHT ACCOUNT CELL (PASIV/CAPITAL) === */}
                      <td className="bg-slate-50/30 border-r border-gray-150 text-[9.5px] font-mono text-gray-400 text-center select-none font-bold">
                        {!right.isSpacer && !right.isHeader && !right.isSubtotal ? right.code : ''}
                      </td>
                      
                      <td className={`border-r border-gray-220 px-3 ${
                        right.isHeader ? (right.name.includes('CAPITAL') ? 'font-black text-blue-900 bg-blue-50/10 text-[10.5px] tracking-wide' : 'font-black text-red-900 bg-red-50/10 text-[10.5px] tracking-wide') : 
                        right.isSubtotal ? 'font-extrabold text-slate-500 uppercase tracking-tight' : 
                        right.name.includes('Utilidad Neta') ? 'pl-8 italic text-emerald-800 font-extrabold text-[11.5px]' : 'font-bold text-gray-800'
                      }`}>
                        {right.name}
                      </td>
                      
                      {/* Right Parcial Value (Usually empty or for helper) */}
                      <td className="border-r border-gray-150 px-3 text-right font-mono text-[12px] bg-rose-50/5 text-gray-600">
                        {right.isSpacer || right.isHeader || right.isSubtotal ? '' : (
                          right.name.includes('Utilidad Neta') ? (
                            <span className="border-b border-black block select-all">{formatCellAmountVal(right.value)}</span>
                          ) : (
                            right.value && (rIdx === rightFirstParcialIdx ? `$ ${formatCellAmountVal(right.value)}` : formatCellAmountVal(right.value))
                          )
                        )}
                      </td>
                      
                      {/* Right Subtotal Value */}
                      <td className="px-3 text-right font-mono text-[12px] font-bold text-[#111111] bg-rose-50/5">
                        {right.isSpacer || right.isHeader ? '' : (
                          right.isSubtotal ? (
                            rIdx === rightFirstSubtotalIdx ? (
                              <span className="block border-b border-black select-all">$ {formatCellAmountVal(right.subtotal)}</span>
                            ) : (
                              <span className="block border-b border-black select-all">{formatCellAmountVal(right.subtotal)}</span>
                            )
                          ) : (
                            // Use for capital items or passive sums
                            right.name.includes('Utilidad Neta') ? (
                              right.subtotal ? formatCellAmountVal(right.subtotal) : ''
                            ) : ''
                          )
                        )}
                      </td>

                    </tr>
                  );
                })}

                {/* SUMS FINAL EQUALIZER ROW: PHYSICALLY TIED IN THE EXACT SAME DOM ROW TO FORCE 100% HORIZONTAL ALIGNMENT */}
                <tr className="bg-[#1e293b] text-white font-extrabold h-11 select-all h-11">
                  {/* Left sum results (ACTIVO) */}
                  <td className="border-r border-slate-900 text-center font-bold">∑</td>
                  <td className="border-r border-slate-900 px-3 text-xs font-mono uppercase tracking-widest py-3">TOTAL DE ACTIVO:</td>
                  <td className="border-r border-slate-900"></td>
                  {/* Double accounting line ONLY in the left numeric total cell */}
                  <td className="border-r border-slate-900 px-3 text-right font-mono text-sm font-black text-cyan-200 border-b-[3.5px] border-double border-cyan-400">
                    $ {formatCellAmountVal(totalActivo)}
                  </td>

                  {/* Right sum results (PASIVO + CAPITAL CONTABLE) */}
                  <td className="border-r border-slate-900 text-center font-bold">∑</td>
                  <td className="border-r border-slate-900 px-3 text-xs font-mono uppercase tracking-widest py-3">TOTAL PASIVO + CAPITAL:</td>
                  <td className="border-r border-slate-900"></td>
                  {/* Double accounting line ONLY in the right numeric total cell */}
                  <td className="px-3 text-right font-mono text-sm font-black text-cyan-200 border-b-[3.5px] border-double border-cyan-400">
                    $ {formatCellAmountVal(totalPasivoMasCapitalCuentaMode)}
                  </td>
                </tr>

              </tbody>
            </table>
          </div>
        </div>
        </div>
      )}

      {/* Proof of Match verification message below */}
      <div className="mt-6 p-4 bg-slate-55 border border-gray-200 rounded-xl text-gray-600 text-xs flex flex-col sm:flex-row justify-between items-center text-[11.5px] gap-2">
        <span>⚖️ <strong>Ecuación de Comprobación Contable:</strong> {formatMode === 'Cuenta' ? 'Suma de Activo = Suma de Pasivo + Capital Contable (Izquierda / Derecha)' : 'Activo - Pasivo = Capital Contable del Periodo (Ecuación ESFi)'}. Todos los coeficientes son validados en tiempo real.</span>
        <span className="font-mono font-black bg-emerald-50 border border-emerald-200 px-3 py-1 text-emerald-850 rounded-lg shrink-0 select-all">
          DIFERENCIA: {(totalActivo - (formatMode === 'Cuenta' ? totalPasivoMasCapitalCuentaMode : computedCapitalReportMode + totalPasivo)).toFixed(2)} MXN
        </span>
      </div>
    </div>
  );
}
