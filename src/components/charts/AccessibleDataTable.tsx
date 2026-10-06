import React, { useState } from 'react';
import { Table, Eye, EyeOff } from 'lucide-react';

interface AccessibleDataTableProps {
  title: string;
  headers: string[];
  rows: (string | number)[][];
  caption?: string;
  totalRow?: (string | number)[];
}

export const AccessibleDataTable: React.FC<AccessibleDataTableProps> = ({
  title,
  headers,
  rows,
  caption,
  totalRow,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mt-3 border-t border-slate-100 pt-2">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-brand-blue font-medium transition-colors"
        aria-expanded={isOpen}
      >
        <Table className="w-3.5 h-3.5" />
        <span>{isOpen ? 'Hide Accessible Data Table' : 'View Accessible Data Table'}</span>
        {isOpen ? <EyeOff className="w-3.5 h-3.5 ml-1 text-slate-400" /> : <Eye className="w-3.5 h-3.5 ml-1 text-slate-400" />}
      </button>

      {isOpen && (
        <div className="mt-2 overflow-x-auto rounded-lg border border-slate-200 bg-slate-50/70 p-2">
          {caption && <p className="text-[11px] text-slate-500 mb-1.5">{caption}</p>}
          <table className="w-full text-left text-xs text-slate-700 border-collapse">
            <caption className="sr-only">{title}</caption>
            <thead>
              <tr className="border-b border-slate-200 bg-slate-100 font-semibold text-slate-800">
                {headers.map((h, i) => (
                  <th key={i} className="px-3 py-1.5">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rIdx) => (
                <tr key={rIdx} className="border-b border-slate-200/60 hover:bg-slate-100/50">
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} className="px-3 py-1.5">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
              {totalRow && (
                <tr className="bg-slate-200/80 font-bold border-t-2 border-slate-300">
                  {totalRow.map((cell, idx) => (
                    <td key={idx} className="px-3 py-1.5">
                      {cell}
                    </td>
                  ))}
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
