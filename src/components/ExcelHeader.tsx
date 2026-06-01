/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useAccountingStore } from '../store';
import { TabType } from '../types';
import { Building2 } from 'lucide-react';

interface ExcelHeaderProps {
  currentTab: TabType;
}

export default function ExcelHeader({ currentTab }: ExcelHeaderProps) {
  // Translate tab names into formal report names
  const getDocumentTitle = () => {
    switch (currentTab) {
      case 'Portada':
        return 'ORGANIZACIÓN Y PORTADA INSTITUCIONAL';
      case 'Diario':
        return 'LIBRO DIARIO GENERAL';
      case 'Mayor':
        return 'LIBRO MAYOR GENERAL (ESQUEMAS DE MAYOR)';
      case 'Balanza':
        return 'BALANZA DE COMPROBACIÓN CONTABLE';
      case 'ECoPyV':
        return 'ESTADO DE COSTOS DE PRODUCCIÓN Y LO VENDIDO';
      case 'ERe':
        return 'ESTADO DE RESULTADOS INTEGRAL';
      case 'ESFi':
        return 'ESTADO DE SITUACIÓN FINANCIERA (BALANCE GENERAL)';
      case 'Catalogo':
        return 'CATÁLOGO GENERAL DE CUENTAS';
      default:
        return 'REPORTE CONTABLE OFICIAL';
    }
  };

  return (
    <div className="w-full bg-white text-[#111111] font-sans border-b-2 border-double border-emerald-800 pb-3 mb-6 page-break-avoid">
      <div className="flex flex-col items-center justify-center text-center">
        
        {/* Landmark Business Landmark Logo */}
        <div className="w-14 h-14 flex items-center justify-center bg-emerald-50 border border-emerald-200 text-emerald-850 rounded-xl mb-2.5 shadow-sm">
          <Building2 size={28} className="text-emerald-700" />
        </div>

        {/* Highlighted Corporate Name */}
        <h1 className="text-xl lg:text-2xl font-black tracking-wider text-slate-900 leading-tight">
          ZITÁCUARO IMPORTACIONES, S.A. DE C.V.
        </h1>
        
        {/* R.F.C. & Address details */}
        <div className="text-[11px] text-gray-650 font-sans mt-1 flex flex-wrap justify-center gap-x-3 gap-y-1 font-medium">
          <span><strong>R.F.C.:</strong> ZIM-980415G34</span>
          <span className="text-gray-300">|</span>
          <span><strong>Domicilio Fiscal:</strong> Av. Revolución Sur #142, Col. Centro, C.P. 61500</span>
        </div>
        
        {/* Cintillo Verde Ejecutivo with the name of the Report */}
        <div className="w-full bg-emerald-800 text-white font-black text-[12px] uppercase py-2 tracking-widest text-center mt-3 shadow-xs rounded-lg select-none">
          {getDocumentTitle()}
        </div>

        {/* Corporate Period & Metadata details */}
        <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-x-2 gap-y-1 text-xs text-slate-700 mt-2.5 font-sans px-2 pt-0.5">
          <div className="text-center md:text-left h-5 flex items-center justify-center md:justify-start">
            <span className="font-semibold text-gray-500">Método de Registro:</span> 
            <span className="ml-1 font-mono text-slate-800 font-bold bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">Inventarios Perpetuos</span>
          </div>
          <div className="text-center h-5 flex items-center justify-center">
            <span className="font-semibold text-gray-500 font-sans">Periodo Contable:</span> 
            <span className="ml-1 font-extrabold text-slate-800 font-mono">Del 01 de Enero de 2026 al 31 de Diciembre de 2026</span>
          </div>
          <div className="text-center md:text-right h-5 flex items-center justify-center md:justify-end">
            <span className="font-semibold text-gray-500">Área:</span> 
            <span className="ml-1 text-slate-800 font-mono font-bold">Dirección de Finanzas y Contabilidad</span>
          </div>
        </div>

        {/* Fine bottom border meta-information & extreme right location */}
        <div className="w-full flex justify-between items-center text-[10px] text-gray-400 mt-2 font-mono border-t border-dashed border-gray-250 pt-1.5 px-2">
          <span>Expresado en Pesos Mexicanos (MXN) ─ Sin IVA</span>
          <span className="font-extrabold text-emerald-800 uppercase tracking-wider bg-emerald-50/50 px-2 py-0.5 rounded border border-emerald-100">
            Zitácuaro, Michoacán, México
          </span>
        </div>
      </div>
    </div>
  );
}
