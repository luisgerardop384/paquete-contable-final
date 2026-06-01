/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useAccountingStore } from '../store';
import { Sparkles, Calculator, Trash2, X } from 'lucide-react';

export default function Scratchpad() {
  const { scratchpadText, setScratchpadText, isScratchpadOpen, setScratchpadOpen } = useAccountingStore();

  const handleClear = () => {
    setScratchpadText('/* Lápiz Contable */\n');
  };

  if (!isScratchpadOpen) return null;

  return (
    <div className="fixed top-20 right-4 z-40 w-80 bg-amber-50 border border-amber-300 shadow-xl font-mono text-xs no-print select-none">
      <div className="bg-amber-100 border-b border-amber-300 px-3 py-1.5 flex justify-between items-center text-amber-900 font-bold">
        <div className="flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
          <Calculator size={14} className="text-amber-700" />
          <span>Lápiz Contable</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleClear}
            className="text-amber-700 hover:text-red-700 transition"
            title="Limpiar block"
          >
            <Trash2 size={13} />
          </button>
          <button
            onClick={() => setScratchpadOpen(false)}
            className="text-amber-700 hover:text-black transition"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      <div className="p-2 bg-amber-50/70 border-b border-amber-200 text-[10px] text-amber-800 leading-normal">
        Escribe operaciones matemáticas secundarias y el sistema las resolverá automáticamente abajo para agilizar tus asientos.
      </div>

      <textarea
        className="w-full h-64 bg-transparent p-3 resize-none focus:outline-none text-amber-950 font-mono text-[12px] leading-relaxed"
        style={{
          backgroundImage: 'linear-gradient(rgba(0,0,0,0.05) 1px, transparent 1px)',
          backgroundSize: '100% 1.5rem',
          lineHeight: '1.5rem'
        }}
        value={scratchpadText}
        onChange={(e) => setScratchpadText(e.target.value)}
        placeholder="Escribe cuentas matemáticas de ejemplo aquí..."
      />

      {/* Basic client-side math scanner inside scratchpad */}
      <div className="bg-amber-100/60 p-2 text-[10px] border-t border-amber-200">
        <div className="font-bold text-amber-900 mb-1">Últimos Resultados Calculados:</div>
        <div className="max-h-24 overflow-y-auto space-y-1 text-amber-800 select-all font-mono">
          {scratchpadText
            .split('\n')
            .filter((line) => line.includes('=') || /[\dd+*/().-]+/.test(line))
            .map((line, idx) => {
              // Try evaluating anything before '=' or evaluate the arithmetic string if it contains calculations
              const trimmed = line.trim();
              if (!trimmed) return null;
              
              // If user typed 'x = 1000 + 400', calculate and show nicely
              let expression = trimmed;
              if (trimmed.includes('=')) {
                expression = trimmed.split('=')[0];
              }
              // Clean comments and letters
              const purified = expression.replace(/\/\*[\s\S]*?\*\/|([^0-9+\-*/().])|(\/\/.*)/g, '').trim();
              if (purified && /[0-9]/.test(purified) && /[+\-*/()]+/.test(purified)) {
                try {
                  // Safe math evaluation
                  const san = purified.replace(/[^0-9+\-*/().]/g, '');
                  const res = Function(`"use strict"; return (${san})`)();
                  if (typeof res === 'number' && !isNaN(res) && isFinite(res)) {
                    return (
                      <div key={idx} className="flex justify-between hover:bg-amber-200/50 px-1 py-0.5">
                        <span className="truncate max-w-[140px] text-gray-500">{purified}</span>
                        <span className="font-bold text-[#111111]">= {res.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                      </div>
                    );
                  }
                } catch {
                  // Ignore parse errors
                }
              }
              return null;
            })}
        </div>
      </div>
    </div>
  );
}
