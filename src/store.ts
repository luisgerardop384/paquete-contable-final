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
  addSubaccount: (arg1: string | Subaccount, name?: string) => void;
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
  addAccount: (newAccount: Account) => void;
}

const DEFAULT_ACCOUNTS: Account[] = [
  // Specific exercise accounts
  { code: '101.00', name: 'Caja', type: 'Deudora' },
  { code: '102.00', name: 'Bancos', type: 'Deudora' },
  { code: '120.00', name: 'Almacén', type: 'Deudora' },
  { code: '104.00', name: 'Clientes', type: 'Deudora' },
  { code: '106.00', name: 'Documentos por Cobrar', type: 'Deudora' },
  { code: '151.00', name: 'Terrenos', type: 'Deudora' },
  { code: '160.00', name: 'Equipo de Reparto', type: 'Deudora' },
  { code: '201.00', name: 'Proveedores', type: 'Acreedora' },
  { code: '203.00', name: 'Documentos por Pagar', type: 'Acreedora' },
  { code: '301.00', name: 'Capital Social', type: 'Acreedora' },
  { code: '401.00', name: 'Ventas', type: 'Acreedora' },
  { code: '760.00', name: 'Productos Financieros', type: 'Acreedora' },
  { code: '501.00', name: 'Costo de Ventas', type: 'Deudora' },
  { code: '601.00', name: 'Gastos de Venta y Distribución', type: 'Deudora' },
  { code: '602.00', name: 'Gastos de Administración', type: 'Deudora' },
  { code: '900.00', name: 'Pérdida y Ganancias', type: 'Mixta' },
  { code: '354.00', name: 'Utilidad del Ejercicio', type: 'Acreedora' }
];

const DEFAULT_SUBACCOUNTS: Subaccount[] = [
  { code: '602.01', name: 'Renta de Oficinas', parentCode: '602.00' },
  { code: '602.02', name: 'Sueldos y Salarios', parentCode: '602.00' },
  { code: '602.03', name: 'Luz y Teléfono de Admin', parentCode: '602.00' },
  { code: '601.01', name: 'Comisiones a Vendedores', parentCode: '601.00' },
  { code: '601.02', name: 'Propaganda y Publicidad', parentCode: '601.00' }
];

const DEFAULT_COMPANY_HEADER: CompanyHeader = {
  logoText: '🏬',
  companyName: 'ZITÁCUARO IMPORTACIONES, S.A. DE C.V.',
  rfc: 'ZIM-980415G34',
  address: 'Av. Revolución Sur #142, Col. Centro, C.P. 61500',
  startDate: '2020-01-01',
  endDate: '2020-12-31',
  area: 'Dirección de Finanzas y Contabilidad',
  cityCountry: 'Zitácuaro, Michoacán, México'
};

const initialEntries = [
  {
    id: 'a1',
    date: '2020-12-01',
    type: 'Diario',
    number: 1,
    concept: 'REG. SALDOS INICIALES',
    items: [
      { accountCode: '101.00', accountName: 'CAJA', debit: 25000.00, credit: 0 },
      { accountCode: '102.00', accountName: 'BANCOS', debit: 38500.00, credit: 0 },
      { accountCode: '120.00', accountName: 'ALMACÉN', debit: 710750.00, credit: 0 },
      { accountCode: '104.00', accountName: 'CLIENTES', debit: 12400.00, credit: 0 },
      { accountCode: '106.00', accountName: 'DOCUMENTOS POR COBRAR', debit: 92640.00, credit: 0 },
      { accountCode: '160.00', accountName: 'EQUIPO DE REPARTO', debit: 115000.00, credit: 0 },
      { accountCode: '151.00', accountName: 'TERRENOS', debit: 500000.00, credit: 0 },
      { accountCode: '201.00', accountName: 'PROVEEDORES', debit: 0, credit: 15680.00 },
      { accountCode: '203.00', accountName: 'DOCUMENTOS POR PAGAR', debit: 0, credit: 142000.00 },
      { accountCode: '301.00', accountName: 'CAPITAL SOCIAL', debit: 0, credit: 1336610.00 }
    ]
  },
  {
    id: 'a2',
    date: '2020-12-03',
    type: 'Ingreso',
    number: 1,
    concept: 'REG. VENTAS DE MERCANCÍAS EFECTUADAS',
    items: [
      { accountCode: '102.00', accountName: 'BANCOS', debit: 205000.00, credit: 0 },
      { accountCode: '501.00', accountName: 'COSTO DE VENTAS', debit: 123000.00, credit: 0 },
      { accountCode: '401.00', accountName: 'VENTAS', debit: 0, credit: 205000.00 },
      { accountCode: '120.00', accountName: 'ALMACÉN', debit: 0, credit: 123000.00 }
    ]
  },
  {
    id: 'a3',
    date: '2020-12-05',
    type: 'Egreso',
    number: 1,
    concept: 'REG. REBAJAS Y DESCUENTOS S/VENTAS',
    items: [
      { accountCode: '401.00', accountName: 'VENTAS', debit: 10250.00, credit: 0 },
      { accountCode: '102.00', accountName: 'BANCOS', debit: 0, credit: 10250.00 }
    ]
  },
  {
    id: 'a4',
    date: '2020-12-08',
    type: 'Egreso',
    number: 1,
    concept: 'REG. COMPRAS MERCANCÍAS EFECTUADAS',
    items: [
      { accountCode: '120.00', accountName: 'ALMACÉN', debit: 155000.00, credit: 0 },
      { accountCode: '102.00', accountName: 'BANCOS', debit: 0, credit: 155000.00 }
    ]
  },
  {
    id: 'a5',
    date: '2020-12-10',
    type: 'Ingreso',
    number: 2,
    concept: 'REG. REBAJAS Y DESCUENTOS S/COMPRAS',
    items: [
      { accountCode: '102.00', accountName: 'BANCOS', debit: 6200.00, credit: 0 },
      { accountCode: '120.00', accountName: 'ALMACÉN', debit: 0, credit: 6200.00 }
    ]
  },
  {
    id: 'a6',
    date: '2020-12-12',
    type: 'Egreso',
    number: 2,
    concept: 'REG. GASTOS DE FÁBRICA EFECTUADOS',
    items: [
      { accountCode: '120.00', accountName: 'ALMACÉN', debit: 7000.00, credit: 0 },
      { accountCode: '102.00', accountName: 'BANCOS', debit: 0, credit: 7000.00 }
    ]
  },
  {
    id: 'a7',
    date: '2020-12-15',
    type: 'Diario',
    number: 2,
    concept: 'REG. INTERESES DEVENGADOS A FAVOR',
    items: [
      { accountCode: '101.00', accountName: 'CAJA', debit: 2000.00, credit: 0 },
      { accountCode: '760.00', accountName: 'PRODUCTOS FINANCIEROS', debit: 0, credit: 2000.00 }
    ]
  },
  {
    id: 'a8',
    date: '2020-12-20',
    type: 'Egreso',
    number: 2,
    concept: 'REG. DEVOLUCIONES SOBRE VENTAS',
    items: [
      { accountCode: '401.00', accountName: 'VENTAS', debit: 20000.00, credit: 0 },
      { accountCode: '120.00', accountName: 'ALMACÉN', debit: 12000.00, credit: 0 },
      { accountCode: '102.00', accountName: 'BANCOS', debit: 0, credit: 20000.00 },
      { accountCode: '501.00', accountName: 'COSTO DE VENTAS', debit: 0, credit: 12000.00 }
    ]
  },
  {
    id: 'a9',
    date: '2020-12-28',
    type: 'Diario',
    number: 3,
    concept: 'REG. GASTOS DE OPERACIÓN EFECTUADOS',
    items: [
      { accountCode: '601.00', accountName: 'GASTOS DE VENTA Y DISTRIBUCIÓN', debit: 1925.00, credit: 0 },
      { accountCode: '602.00', accountName: 'GASTOS DE ADMINISTRACIÓN', debit: 1575.00, credit: 0 },
      { accountCode: '203.00', accountName: 'DOCUMENTOS POR PAGAR', debit: 0, credit: 3500.00 }
    ]
  },
  {
    id: 'a10',
    date: '2020-12-28',
    type: 'Ingreso',
    number: 3,
    concept: 'REG. DEVOLUCIONES SOBRE COMPRAS',
    items: [
      { accountCode: '102.00', accountName: 'BANCOS', debit: 11000.00, credit: 0 },
      { accountCode: '120.00', accountName: 'ALMACÉN', debit: 0, credit: 11000.00 }
    ]
  },
  {
    id: 'a11',
    date: '2020-12-28',
    type: 'Egreso',
    number: 3,
    concept: 'REG. GASTOS DE OPERACIÓN EFECTUADOS',
    items: [
      { accountCode: '203.00', accountName: 'DOCUMENTOS POR PAGAR', debit: 3500.00, credit: 0 },
      { accountCode: '102.00', accountName: 'BANCOS', debit: 0, credit: 3500.00 }
    ]
  },
  {
    id: 'aj1',
    date: '2020-12-30',
    type: 'Diario',
    number: 4,
    concept: 'REG. AJUSTE PARA EL RESULTADO EN VENTAS',
    items: [
      { accountCode: '401.00', accountName: 'VENTAS', debit: 111000.00, credit: 0 },
      { accountCode: '501.00', accountName: 'COSTO DE VENTAS', debit: 0, credit: 111000.00 }
    ]
  },
  {
    id: 'aj2',
    date: '2020-12-30',
    type: 'Diario',
    number: 5,
    concept: 'REG. AJUSTE CTAS. RESULTADO ACREEDORAS',
    items: [
      { accountCode: '401.00', accountName: 'VENTAS', debit: 63750.00, credit: 0 },
      { accountCode: '760.00', accountName: 'PRODUCTOS FINANCIEROS', debit: 2000.00, credit: 0 },
      { accountCode: '900.00', accountName: 'PÉRDIDA Y GANANCIAS', debit: 0, credit: 65750.00 }
    ]
  },
  {
    id: 'aj3',
    date: '2020-12-30',
    type: 'Diario',
    number: 6,
    concept: 'REG. AJUSTE CTAS. RESULTADO DEUDORAS',
    items: [
      { accountCode: '900.00', accountName: 'PÉRDIDA Y GANANCIAS', debit: 3500.00, credit: 0 },
      { accountCode: '601.00', accountName: 'GASTOS DE VENTA Y DISTRIBUCIÓN', debit: 0, credit: 1925.00 },
      { accountCode: '602.00', accountName: 'GASTOS DE ADMINISTRACIÓN', debit: 0, credit: 1575.00 }
    ]
  },
  {
    id: 'aj4',
    date: '2020-12-30',
    type: 'Diario',
    number: 7,
    concept: 'REG. AJUSTE P/UTILIDAD ANTES DE IMPTO.',
    items: [
      { accountCode: '900.00', accountName: 'PÉRDIDA Y GANANCIAS', debit: 62250.00, credit: 0 },
      { accountCode: '354.00', accountName: 'UTILIDAD DEL EJERCICIO', debit: 0, credit: 62250.00 }
    ]
  }
];

const DEMO_POLICIES: Policy[] = initialEntries.map(entry => {
  const prefix = entry.type === 'Diario' ? 'D' : entry.type === 'Ingreso' ? 'I' : entry.type === 'Egreso' ? 'E' : 'C';
  const numStr = entry.number < 10 ? `0${entry.number}` : String(entry.number);
  const isAdj = entry.id.startsWith('aj');
  return {
    id: entry.id,
    number: `${prefix}-${numStr}`,
    date: entry.date,
    type: entry.type as 'Diario' | 'Ingreso' | 'Egreso' | 'Cheque',
    concept: entry.concept,
    reference: '',
    author: 'L.C. Gerardo Pérez',
    isAdjustment: isAdj,
    movements: entry.items.map(it => ({
      accountCode: it.accountCode,
      subaccountCode: null,
      debit: it.debit || null,
      credit: it.credit || null
    }))
  };
});

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

  let initialHeader = getStored<CompanyHeader>('header', DEFAULT_COMPANY_HEADER);
  let initialPolicies = getStored<Policy[]>('policies', DEMO_POLICIES);
  let initialAccounts = getStored<Account[]>('accounts', DEFAULT_ACCOUNTS);

  // Auto-migration for schema/data refresh in AI Studio dev environment
  const isOldDemo = initialPolicies.some(p => p.concept === 'Apertura de saldos iniciales de la empresa') ||
                    initialPolicies.some(p => p.movements.some(m => m.accountCode === '103.00')) ||
                    initialPolicies.length !== 15;
  const missingNewAccounts = !initialAccounts.some(a => a.code === '760.00');

  if (isOldDemo || missingNewAccounts) {
    initialHeader = DEFAULT_COMPANY_HEADER;
    initialPolicies = DEMO_POLICIES;
    initialAccounts = DEFAULT_ACCOUNTS;
    saveStored('header', DEFAULT_COMPANY_HEADER);
    saveStored('policies', DEMO_POLICIES);
    saveStored('accounts', DEFAULT_ACCOUNTS);
  }
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
    addSubaccount: (arg1, name) => set((state) => {
      if (typeof arg1 === 'object') {
        const next = [...state.subaccounts, arg1];
        saveStored('subaccounts', next);
        return { subaccounts: next };
      } else {
        const parentCode = arg1;
        const subName = name || '';
        // Calculate a unique code under parentCode: parentCode + .XX
        const siblings = state.subaccounts.filter(s => s.parentCode === parentCode);
        const nextNum = siblings.length + 1;
        const formattedNum = nextNum < 10 ? `0${nextNum}` : `${nextNum}`;
        const code = `${parentCode}.${formattedNum}`;
        
        const next = [...state.subaccounts, { code, name: subName, parentCode }];
        saveStored('subaccounts', next);
        return { subaccounts: next };
      }
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
    
    accounts: initialAccounts,
    addAccount: (newAccount) => set((state) => {
      const next = [...state.accounts, newAccount];
      saveStored('accounts', next);
      return { accounts: next };
    })
  };
});
