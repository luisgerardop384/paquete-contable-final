/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Subaccount {
  code: string; // e.g. "51.01"
  name: string;
  parentCode: string; // e.g. "51"
}

export interface Account {
  code: string; // e.g. "1", "6-D", "51"
  name: string;
  type: 'Deudora' | 'Acreedora' | 'Mixta';
  isDepreciation?: boolean;
  parentAssetCode?: string; // e.g. for "6-D", it references "6"
}

export interface Movement {
  accountCode: string;
  subaccountCode?: string | null; // e.g. "51.01" if any
  debit: number | null;
  credit: number | null;
}

export interface Policy {
  id: string;
  number: string; // e.g., P-01
  date: string;
  type: 'Ingreso' | 'Egreso' | 'Diario' | 'Cheque';
  concept: string;
  reference: string; // Factura, etc.
  author: string;
  movements: Movement[];
  isAdjustment: boolean; // True if it is an adjusting closing entry
}

export interface CompanyHeader {
  logoText: string;
  companyName: string;
  rfc: string;
  address: string;
  startDate: string;
  endDate: string;
  area: string;
  cityCountry: string;
}

export type TabType = 
  | 'Portada' 
  | 'Polizas'
  | 'Diario' 
  | 'Mayor' 
  | 'Balanza' 
  | 'ECoPyV'
  | 'ERe' 
  | 'ESFi' 
  | 'Catalogo';
