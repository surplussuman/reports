import React, { useState, useRef, useEffect } from 'react';
import { HiOutlineDownload, HiOutlineDocumentText, HiOutlineTable, HiOutlineDocument } from 'react-icons/hi';

const ExportDropdown = ({ onExportPDF, onExportExcel, onExportCSV, disabled }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleExport = (fn) => {
    fn();
    setOpen(false);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        disabled={disabled}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-purple to-brand-indigo text-white text-sm font-medium
          hover:shadow-lg hover:shadow-brand-purple/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <HiOutlineDownload className="w-4 h-4" />
        Export
        <svg className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl border border-gray-100 shadow-xl shadow-gray-200/50 overflow-hidden z-50 animate-fade-in">
          <div className="px-3 py-2 bg-gray-50 border-b border-gray-100">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Export Format</p>
          </div>
          <div className="py-1">
            <button
              onClick={() => handleExport(onExportPDF)}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-brand-light hover:text-brand-purple transition-colors"
            >
              <HiOutlineDocumentText className="w-4 h-4 text-red-500" />
              <div className="text-left">
                <p className="font-medium">PDF Report</p>
                <p className="text-xs text-gray-400">Summary + detailed analysis</p>
              </div>
            </button>
            <button
              onClick={() => handleExport(onExportExcel)}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-brand-light hover:text-brand-purple transition-colors"
            >
              <HiOutlineTable className="w-4 h-4 text-emerald-500" />
              <div className="text-left">
                <p className="font-medium">Excel (Multi-sheet)</p>
                <p className="text-xs text-gray-400">Multiple sheets with full data</p>
              </div>
            </button>
            <button
              onClick={() => handleExport(onExportCSV)}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-brand-light hover:text-brand-purple transition-colors"
            >
              <HiOutlineDocument className="w-4 h-4 text-blue-500" />
              <div className="text-left">
                <p className="font-medium">CSV</p>
                <p className="text-xs text-gray-400">Simple spreadsheet format</p>
              </div>
            </button>
          </div>
          <div className="px-3 py-2 bg-gray-50 border-t border-gray-100">
            <p className="text-[10px] text-gray-400">Exports filtered data if filters are active</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExportDropdown;
