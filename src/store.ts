/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { create } from 'zustand';
import { Account, Subaccount, Policy, CompanyHeader, TabType, Movement } from './types';

interface AccountingState {
  // Navigation & UI
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  
  // Printing full package state
  isPrintingAll: boolean;
  setIsPrintingAll: (val: boolean) => void;

  // Balance Sheet Format Selection ('Reporte' | 'Cuenta')
  balanceSheetFormat: 'Reporte' | 'Cuenta';
  setBalanceSheetFormat: (val: 'Reporte' | 'Cuenta') => void;
  
  // Company Profile / Portada
  companyHeader: CompanyHeader;
  setCompanyHeader: (header: Partial<CompanyHeader>) => void;
  
  // Custom Expense Subaccounts
  subaccounts: Subaccount[];
  addSubaccount: (parentCode: string, name: string) => void;
  deleteSubaccount: (code: string) => void;
  
  // Ledger/Policy state
  policies: Policy[];
  addPolicy: (policy: Policy) => void;
  deletePolicy: (id: string) => void;
  updatePolicy: (id: string, updated: Policy) => void;
  clearAllPolicies: () => void;
  loadDemoPolicies: () => void;
  
  // Scratchpad
  scratchpadText: string;
  setScratchpadText: (text: string) => void;
  isScratchpadOpen: boolean;
  setScratchpadOpen: (open: boolean) => void;
  
  // Standard Accounts list (Read-only reference)
  accounts: Account[];
}

const DEFAULT_ACCOUNTS: Account[] = [
  { code: '1', name: 'Caja', type: 'Deudora' },
  { code: '2', name: 'Bancos', type: 'Deudora' },
  { code: '3', name: 'Almacén', type: 'Deudora' },
  { code: '4', name: 'Clientes', type: 'Deudora' },
  { code: '5', name: 'Documentos por Cobrar', type: 'Deudora' },
  { code: '6', name: 'Edificios', type: 'Deudora' },
  { code: '6-D', name: 'Depreciación Acumulada de Edificios', type: 'Acreedora', isDepreciation: true, parentAssetCode: '6' },
  { code: '7', name: 'Mobiliario y Equipo', type: 'Deudora' },
  { code: '7-D', name: 'Depreciación Acumulada de Mobiliario', type: 'Acreedora', isDepreciation: true, parentAssetCode: '7' },
  { code: '8', name: 'Equipo de Cómputo', type: 'Deudora' },
  { code: '8-D', name: 'Depreciación Acumulada de Equipo de Cómputo', type: 'Acreedora', isDepreciation: true, parentAssetCode: '8' },
  { code: '9', name: 'Equipo de Transporte', type: 'Deudora' },
  { code: '9-D', name: 'Depreciación Acumulada de Equipo de Transporte', type: 'Acreedora', isDepreciation: true, parentAssetCode: '9' },
  { code: '10', name: 'Papelería y Útiles', type: 'Deudora' },
  { code: '20', name: 'Proveedores', type: 'Acreedora' },
  { code: '21', name: 'Documentos por Pagar', type: 'Acreedora' },
  { code: '22', name: 'Contribuciones por Pagar / Impuestos', type: 'Acreedora' },
  { code: '30', name: 'Capital Social', type: 'Acreedora' },
  { code: '31', name: 'Utilidades de Ejercicios Anteriores', type: 'Acreedora' },
  { code: '40', name: 'Ventas', type: 'Acreedora' },
  { code: '41', name: 'Productos Financieros / Otros Ingresos', type: 'Acreedora' },
  { code: '50', name: 'Costo de Ventas', type: 'Deudora' },
  { code: '51', name: 'Gastos de Administración', type: 'Deudora' },
  { code: '52', name: 'Gastos de Venta y Distribución', type: 'Deudora' },
  { code: '53', name: 'Gasto por Depreciación de Activos', type: 'Deudora' },
  { code: '60', name: 'Pérdidas y Ganancias', type: 'Mixta' } // Temporary closing account
];

const DEFAULT_SUBACCOUNTS: Subaccount[] = [
  { code: '51.01', name: 'Renta de Oficinas', parentCode: '51' },
  { code: '51.02', name: 'Sueldos y Salarios', parentCode: '51' },
  { code: '51.03', name: 'Luz y Teléfono', parentCode: '51' },
  { code: '52.01', name: 'Renta del Local Comercial', parentCode: '52' },
  { code: '52.02', name: 'Comisiones', parentCode: '52' },
  { code: '52.03', name: 'Propaganda y Publicidad', parentCode: '52' }
];

const DEFAULT_COMPANY_HEADER: CompanyHeader = {
  logoText: '🏬',
  companyName: 'ZITÁCUARO IMPORTACIONES, S.A. DE C.V.',
  rfc: 'ZIM-980415G34',
  address: 'Av. Revolución Sur #142, Col. Centro, C.P. 61500',
  startDate: '2026-01-01',
  endDate: '2026-12-31',
  area: 'Dirección de Finanzas y Contabilidad',
  cityCountry: 'Zitácuaro, Michoacán, México'
};

const DEMO_POLICIES: Policy[] = [
  {
    id: 'p-1',
    number: 'P-01',
    date: '2026-01-02',
    type: 'Diario',
    concept: 'Apertura de saldos iniciales de la empresa',
    reference: 'Esc. Pública 9821',
    author: 'L.C. Gerardo Pérez',
    isAdjustment: false,
    movements: [
      { accountCode: '1', debit: 50000, credit: null },
      { accountCode: '2', debit: 800000, credit: null },
      { accountCode: '3', debit: 450000, credit: null },
      { accountCode: '4', debit: 120000, credit: null },
      { accountCode: '6', debit: 1200000, credit: null },
      { accountCode: '7', debit: 150000, credit: null },
      { accountCode: '8', debit: 80000, credit: null },
      { accountCode: '20', debit: null, credit: 300000 },
      { accountCode: '30', debit: null, credit: 2550000 }
    ]
  },
  {
    id: 'p-2',
    number: 'P-02',
    date: '2026-01-15',
    type: 'Ingreso',
    concept: 'Registro de venta de mercancía al contado comercial',
    reference: 'Factura F-301',
    author: 'L.C. Gerardo Pérez',
    isAdjustment: false,
    movements: [
      { accountCode: '4', debit: 180000, credit: null },
      { accountCode: '40', debit: null, credit: 180000 }
    ]
  },
  {
    id: 'p-2a',
    number: 'P-03',
    date: '2026-01-15',
    type: 'Diario',
    concept: 'Costo de lo vendido según salida de Almacén por venta F-301',
    reference: 'Salida Almacén S-03',
    author: 'L.C. Gerardo Pérez',
    isAdjustment: false,
    movements: [
      { accountCode: '50', debit: 90000, credit: null },
      { accountCode: '3', debit: null, credit: 90000 }
    ]
  },
  {
    id: 'p-3',
    number: 'P-04',
    date: '2026-01-20',
    type: 'Egreso',
    concept: 'Pago del recibo telefónico e internet de oficinas',
    reference: 'Factura TEL-881',
    author: 'L.C. Gerardo Pérez',
    isAdjustment: false,
    movements: [
      { accountCode: '51', subaccountCode: '51.03', debit: 8500, credit: null },
      { accountCode: '2', debit: null, credit: 8500 }
    ]
  },
  {
    id: 'p-4',
    number: 'P-05',
    date: '2026-01-28',
    type: 'Egreso',
    concept: 'Pago de renta mensual del local comercial',
    reference: 'Factura REC-45',
    author: 'L.C. Gerardo Pérez',
    isAdjustment: false,
    movements: [
      { accountCode: '52', subaccountCode: '52.01', debit: 12000, credit: null },
      { accountCode: '2', debit: null, credit: 12000 }
    ]
  },
  {
    id: 'p-5',
    number: 'P-06',
    date: '2026-02-05',
    type: 'Ingreso',
    concept: 'Cobro de intereses ganados en cuenta de Bancos',
    reference: 'EdoCta Bancomer',
    author: 'L.C. Gerardo Pérez',
    isAdjustment: false,
    movements: [
      { accountCode: '2', debit: 3200, credit: null },
      { accountCode: '41', debit: null, credit: 3200 }
    ]
  },
  {
    id: 'p-adj-1',
    number: 'A-01',
    date: '2026-12-31',
    type: 'Diario',
    concept: 'Depreciación anual acumulada del Mobiliario y Equipo',
    reference: 'Papeles de Trabajo Dep',
    author: 'L.C. Gerardo Pérez',
    isAdjustment: true,
    movements: [
      { accountCode: '53', debit: 1500, credit: null },
      { accountCode: '7-D', debit: null, credit: 1500 }
    ]
  }
];

export const useAccountingStore = create<AccountingState>((set) => {
  // Load initial states from localStorage safely
  const getStored = <T>(key: string, backup: T): T => {
    try {
      const stored = localStorage.getItem(`accounting_${key}`);
      return stored ? JSON.parse(stored) : backup;
    } catch {
      return backup;
    }
  };

  const saveStored = <T>(key: string, val: T) => {
    try {
      localStorage.setItem(`accounting_${key}`, JSON.stringify(val));
    } catch (e) {
      console.error(e);
    }
  };

  const initialHeader = getStored<CompanyHeader>('header', DEFAULT_COMPANY_HEADER);
  const initialPolicies = getStored<Policy[]>('policies', DEMO_POLICIES);
  const initialSubaccounts = getStored<Subaccount[]>('subaccounts', DEFAULT_SUBACCOUNTS);
  const initialScratchpadText = getStored<string>('scratchpad', '/* Bloque de Notas y Lápiz Contable */\n// Realiza cálculos aritméticos sencillos rápido\n800000 - 8500 - 12000 = 779500\n150000 * 0.10 = 15000\n\n');
  const initialBalanceSheetFormat = getStored<'Reporte' | 'Cuenta'>('balanceSheetFormat', 'Cuenta');

  return {
    activeTab: 'Portada',
    setActiveTab: (tab) => set({ activeTab: tab }),
    
    isPrintingAll: false,
    setIsPrintingAll: (val) => set({ isPrintingAll: val }),

    balanceSheetFormat: initialBalanceSheetFormat,
    setBalanceSheetFormat: (format) => set(() => {
      saveStored('balanceSheetFormat', format);
      return { balanceSheetFormat: format };
    }),
    
    companyHeader: initialHeader,
    setCompanyHeader: (updated) => set((state) => {
      const next = { ...state.companyHeader, ...updated };
      saveStored('header', next);
      return { companyHeader: next };
    }),
    
    subaccounts: initialSubaccounts,
    addSubaccount: (parentCode, name) => set((state) => {
      // Calculate a unique code under parentCode: parentCode + .XX
      const siblings = state.subaccounts.filter(s => s.parentCode === parentCode);
      const nextNum = siblings.length + 1;
      const formattedNum = nextNum < 10 ? `0${nextNum}` : `${nextNum}`;
      const code = `${parentCode}.${formattedNum}`;
      
      const next = [...state.subaccounts, { code, name, parentCode }];
      saveStored('subaccounts', next);
      return { subaccounts: next };
    }),
    deleteSubaccount: (code) => set((state) => {
      const next = state.subaccounts.filter(s => s.code !== code);
      saveStored('subaccounts', next);
      return { subaccounts: next };
    }),
    
    policies: initialPolicies,
    addPolicy: (policy) => set((state) => {
      const next = [...state.policies, policy];
      saveStored('policies', next);
      return { policies: next };
    }),
    deletePolicy: (id) => set((state) => {
      const next = state.policies.filter(p => p.id !== id);
      saveStored('policies', next);
      return { policies: next };
    }),
    updatePolicy: (id, updated) => set((state) => {
      const next = state.policies.map(p => p.id === id ? updated : p);
      saveStored('policies', next);
      return { policies: next };
    }),
    clearAllPolicies: () => set(() => {
      saveStored('policies', []);
      return { policies: [] };
    }),
    loadDemoPolicies: () => set(() => {
      saveStored('policies', DEMO_POLICIES);
      return { policies: DEMO_POLICIES };
    }),
    
    scratchpadText: initialScratchpadText,
    setScratchpadText: (text) => set(() => {
      saveStored('scratchpad', text);
      return { scratchpadText: text };
    }),
    isScratchpadOpen: false,
    setScratchpadOpen: (open) => set({ isScratchpadOpen: open }),
    
    accounts: DEFAULT_ACCOUNTS
  };
});
