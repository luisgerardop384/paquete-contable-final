import React, { useState } from 'react';
import { useAccountingStore } from '../store';

export default function CatalogueTab() {
  const { accounts = [], subaccounts = [], addAccount, addSubaccount } = useAccountingStore();
  
  const [accountCode, setAccountCode] = useState('');
  const [accountName, setAccountName] = useState('');
  const [accountType, setAccountType] = useState<'Activo' | 'Pasivo' | 'Capital' | 'Resultados'>('Activo');
  
  const [parentCode, setParentCode] = useState('');
  const [subCode, setSubCode] = useState('');
  const [subName, setSubName] = useState('');

  const handleAddAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountCode || !accountName) return alert('Por favor llena todos los campos.');
    if (accounts.some(a => a.code === accountCode)) return alert('Esa clave ya existe.');

    if (typeof addAccount === 'function') {
      addAccount({
        code: accountCode,
        name: accountName.toUpperCase(),
        type: accountType
      });
      setAccountCode('');
      setAccountName('');
    }
  };

  const handleAddSubaccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!parentCode || !subCode || !subName) return alert('Por favor llena todos los campos.');
    if (subaccounts.some(s => s.parentCode === parentCode && s.code === subCode)) {
      return alert('Esa subcuenta ya existe para esta cuenta padre.');
    }

    if (typeof addSubaccount === 'function') {
      addSubaccount({
        code: subCode,
        parentCode: parentCode,
        name: subName.toUpperCase()
      });
      setSubCode('');
      setSubName('');
    } else {
      alert('Error: La función addSubaccount no está vinculada.');
    }
  };

  return (
    <div className="space-y-6 text-xs font-sans">
      
      {/* Sección Interactiva (Formularios) */}
      <div className="no-print grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 border border-gray-200 rounded-xl">
        
        {/* Formulario Cuenta de Mayor */}
        <form onSubmit={handleAddAccount} className="bg-white p-4 border border-gray-200 rounded-lg shadow-sm">
          <div className="border-b border-gray-150 pb-2 mb-3 text-slate-800 font-bold uppercase">
            <span>➕ Agregar Cuenta de Mayor</span>
          </div>
          <div className="grid grid-cols-2 gap-2 mb-2">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Código</label>
              <input type="text" placeholder="Ej. 100" value={accountCode} onChange={(e) => setAccountCode(e.target.value)} className="w-full border border-gray-300 rounded px-2 py-1 text-slate-800 font-mono" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Tipo</label>
              <select value={accountType} onChange={(e) => setAccountType(e.target.value as any)} className="w-full border border-gray-300 rounded px-2 py-1 text-slate-800">
                <option value="Activo">Activo</option>
                <option value="Pasivo">Pasivo</option>
                <option value="Capital">Capital</option>
                <option value="Resultados">Resultados</option>
              </select>
            </div>
          </div>
          <div className="mb-3">
            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Nombre</label>
            <input type="text" placeholder="Ej. BANCOS" value={accountName} onChange={(e) => setAccountName(e.target.value)} className="w-full border border-gray-300 rounded px-2 py-1 text-slate-800 uppercase" />
          </div>
          <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-1.5 px-3 rounded text-center">
            Registrar Cuenta
          </button>
        </form>

        {/* Formulario Subcuenta */}
        <form onSubmit={handleAddSubaccount} className="bg-white p-4 border border-gray-200 rounded-lg shadow-sm">
          <div className="border-b border-gray-150 pb-2 mb-3 text-slate-800 font-bold uppercase">
            <span>📂 Agregar Subcuenta</span>
          </div>
          <div className="mb-2">
            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Cuenta Padre</label>
            <select value={parentCode} onChange={(e) => setParentCode(e.target.value)} className="w-full border border-gray-300 rounded px-2 py-1 text-slate-800">
              <option value="">-- Selecciona Cuenta Padre --</option>
              {accounts.map(a => (
                <option key={a.code} value={a.code}>[{a.code}] {a.name}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-3 gap-2 mb-3">
            <div className="col-span-1">
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Clave Sub</label>
              <input type="text" placeholder="Ej. 01" value={subCode} onChange={(e) => setSubCode(e.target.value)} className="w-full border border-gray-300 rounded px-2 py-1 text-slate-800 font-mono" />
            </div>
            <div className="col-span-2">
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Nombre Subcuenta</label>
              <input type="text" placeholder="Ej. BANCOMER" value={subName} onChange={(e) => setSubName(e.target.value)} className="w-full border border-gray-300 rounded px-2 py-1 text-slate-800 uppercase" />
            </div>
          </div>
          <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-1.5 px-3 rounded text-center">
            Registrar Subcuenta
          </button>
        </form>
      </div>

      {/* Tabla del Catálogo */}
      <div className="border border-gray-300 bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full border-collapse text-left text-slate-800">
          <thead>
            <tr className="bg-slate-50 border-b border-gray-300 text-gray-500 font-mono uppercase text-[10px] font-bold py-2">
              <th className="px-4 py-2 border-r border-gray-200 w-24 text-center">Código</th>
              <th className="px-4 py-2 border-r border-gray-200">Estructura Cuenta / Auxiliar</th>
              <th className="px-4 py-2 text-center w-32">Tipo</th>
            </tr>
          </thead>
          <tbody>
            {accounts.map((acct) => {
              const associatedSubs = subaccounts.filter((s) => s.parentCode === acct.code);
              return (
                <React.Fragment key={acct.code}>
                  <tr className="border-b border-gray-200 bg-slate-50/40 font-bold text-slate-900 h-8">
                    <td className="px-4 border-r border-gray-200 font-mono text-center">{acct.code}</td>
                    <td className="px-4 border-r border-gray-200 uppercase">{acct.name}</td>
                    <td className="px-4 text-center">
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-slate-100 text-slate-600 border border-gray-200">
                        {acct.type}
                      </span>
                    </td>
                  </tr>
                  {associatedSubs.map((sub) => (
                    <tr key={`${acct.code}-${sub.code}`} className="border-b border-gray-150 text-gray-600 h-7 italic">
                      <td className="px-4 border-r border-gray-200 font-mono text-center text-gray-400 pl-6">{sub.code}</td>
                      <td className="px-4 border-r border-gray-200 pl-8 text-gray-500">↪ {sub.name}</td>
                      <td className="px-4 text-center font-mono text-[10px] text-gray-300">Subcuenta</td>
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
