import React from 'react';
import { X, Printer, Download } from 'lucide-react';
import { DocumentPreview } from './DocumentPreview';
import type { BusinessOrder } from '@/types';

interface DocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: BusinessOrder;
  documentType: 'invoice' | 'delivery' | 'order';
}

export function DocumentModal({ isOpen, onClose, order, documentType }: DocumentModalProps) {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 print:hidden animate-fade-in">
        <div className="bg-zinc-100 dark:bg-zinc-900 w-full max-w-5xl h-[90vh] rounded-2xl flex flex-col overflow-hidden shadow-2xl border border-zinc-200 dark:border-zinc-800 animate-scale-in">
          
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
            <h2 className="font-bold text-lg text-zinc-900 dark:text-white">
              Aperçu du document
            </h2>
            <div className="flex items-center gap-3">
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-zinc-900 rounded-xl font-medium transition-colors text-sm"
              >
                <Printer className="w-4 h-4" />
                Imprimer / PDF
              </button>
              <button
                onClick={onClose}
                className="p-2 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Scrollable Preview Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-zinc-100/50 dark:bg-zinc-900">
            {/* We wrap it in a div that won't print here, because the print area is separate */}
            <div className="shadow-xl mx-auto rounded-lg overflow-hidden bg-white max-w-4xl">
              <DocumentPreview order={order} documentType={documentType} />
            </div>
          </div>
        </div>
      </div>

      {/* Print Only Area */}
      {isOpen && (
        <div id="print-area" className="hidden print:block absolute inset-0 bg-white z-[100]">
          <DocumentPreview order={order} documentType={documentType} />
        </div>
      )}
    </>
  );
}
