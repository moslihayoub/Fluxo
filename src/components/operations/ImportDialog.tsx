'use client';

import { useState, useRef } from 'react';
import { Upload, X, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { parseCSV, formatCurrency, fromCents } from '@/lib/utils';
import type { Kind } from '@/types';

interface ImportDialogProps {
  monthId: string;
  onClose: () => void;
}

interface PreviewRow {
  label: string;
  amount_cents: number;
  kind: Kind;
  selected: boolean;
}

export default function ImportDialog({ monthId, onClose }: ImportDialogProps) {
  const { addOperations } = useStore();
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<PreviewRow[]>([]);
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');
  const [applied, setApplied] = useState(false);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setError('');
    setApplied(false);

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const text = ev.target?.result as string;
        const rows = parseCSV(text);
        if (rows.length === 0) {
          setError('Aucune opération trouvée dans ce fichier.');
          return;
        }
        setPreview(
          rows.map((r) => ({
            label: r.label,
            amount_cents: Math.abs(r.amount_cents),
            kind: r.amount_cents >= 0 ? 'encaissement' : 'decaissement',
            selected: true,
          }))
        );
      } catch {
        setError('Erreur lors de la lecture du fichier CSV.');
      }
    };
    reader.readAsText(file, 'utf-8');
  };

  const toggleRow = (i: number) => {
    setPreview((p) => p.map((row, idx) => idx === i ? { ...row, selected: !row.selected } : row));
  };

  const toggleAll = () => {
    const allSelected = preview.every((r) => r.selected);
    setPreview((p) => p.map((r) => ({ ...r, selected: !allSelected })));
  };

  const handleApply = () => {
    const selected = preview.filter((r) => r.selected);
    if (selected.length === 0) { setError('Sélectionnez au moins une ligne.'); return; }

    addOperations(
      selected.map((r) => ({
        monthId,
        label: r.label,
        operationTypeLabel: 'Import CSV',
        kind: r.kind,
        amount_cents: r.amount_cents,
      }))
    );
    setApplied(true);
  };

  const totalEncaissement = preview.filter((r) => r.selected && r.kind === 'encaissement').reduce((s, r) => s + r.amount_cents, 0);
  const totalDecaissement = preview.filter((r) => r.selected && r.kind === 'decaissement').reduce((s, r) => s + r.amount_cents, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg bg-white dark:bg-zinc-900 rounded-xl shadow-2xl border border-zinc-200 dark:border-zinc-800 animate-scale-in max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-zinc-100 dark:border-zinc-800">
          <h2 className="text-base font-semibold text-zinc-900 dark:text-white">Importer un relevé CSV</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* File input */}
          <div
            onClick={() => fileRef.current?.click()}
            className="border-2 border-dashed border-zinc-200 dark:border-zinc-700 rounded-xl p-8 text-center cursor-pointer hover:border-zinc-400 dark:hover:border-zinc-500 transition-colors"
          >
            <input ref={fileRef} type="file" accept=".csv,.txt" onChange={handleFile} className="hidden" />
            <Upload className="w-8 h-8 text-zinc-400 mx-auto mb-2" />
            {fileName ? (
              <div>
                <p className="text-sm font-medium text-zinc-900 dark:text-white flex items-center justify-center gap-1.5">
                  <FileText className="w-4 h-4" /> {fileName}
                </p>
                <p className="text-xs text-zinc-400 mt-1">Cliquer pour changer</p>
              </div>
            ) : (
              <div>
                <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Cliquez pour sélectionner un fichier</p>
                <p className="text-xs text-zinc-400 mt-1">CSV ou TXT, colonnes libellé + montant</p>
              </div>
            )}
          </div>

          {error && (
            <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {applied && (
            <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg px-3 py-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              {preview.filter((r) => r.selected).length} opérations importées avec succès !
            </div>
          )}

          {/* Preview table */}
          {preview.length > 0 && !applied && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Aperçu — {preview.filter((r) => r.selected).length}/{preview.length} sélectionné(s)
                </p>
                <button onClick={toggleAll} className="text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-white underline">
                  {preview.every((r) => r.selected) ? 'Tout désélectionner' : 'Tout sélectionner'}
                </button>
              </div>

              <div className="max-h-52 overflow-y-auto rounded-lg border border-zinc-200 dark:border-zinc-700">
                <table className="w-full text-xs">
                  <thead className="sticky top-0 bg-zinc-50 dark:bg-zinc-800">
                    <tr>
                      <th className="w-8 px-2 py-2"></th>
                      <th className="text-left px-2 py-2 text-zinc-500 font-medium">Libellé</th>
                      <th className="text-right px-2 py-2 text-zinc-500 font-medium">Montant</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((row, i) => (
                      <tr
                        key={i}
                        onClick={() => toggleRow(i)}
                        className={`cursor-pointer border-t border-zinc-100 dark:border-zinc-800 transition-colors ${
                          row.selected ? 'bg-white dark:bg-zinc-900' : 'bg-zinc-50 dark:bg-zinc-800/50 opacity-50'
                        }`}
                      >
                        <td className="px-2 py-1.5 text-center">
                          <div className="relative inline-flex items-center">
                            <input
                              type="checkbox"
                              className="sr-only peer"
                              checked={row.selected}
                              onChange={() => toggleRow(i)}
                              onClick={(e) => e.stopPropagation()}
                            />
                            <div className="relative w-9 h-5 bg-zinc-200 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-violet-600"></div>
                          </div>
                        </td>
                        <td className="px-2 py-1.5 text-zinc-700 dark:text-zinc-300 truncate max-w-[200px]">{row.label}</td>
                        <td className={`px-2 py-1.5 text-right font-mono tabular-nums font-medium ${
                          row.kind === 'encaissement' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                        }`}>
                          {row.kind === 'encaissement' ? '+' : '−'}{formatCurrency(row.amount_cents)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Summary */}
              <div className="mt-3 flex gap-3 text-xs">
                <span className="text-emerald-600 dark:text-emerald-400 font-mono">
                  Entrées : +{formatCurrency(totalEncaissement)}
                </span>
                <span className="text-rose-600 dark:text-rose-400 font-mono">
                  Sorties : −{formatCurrency(totalDecaissement)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-zinc-100 dark:border-zinc-800 flex gap-2">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
            {applied ? 'Fermer' : 'Annuler'}
          </button>
          {preview.length > 0 && !applied && (
            <button
              onClick={handleApply}
              className="flex-1 px-4 py-2.5 rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-sm font-medium hover:bg-zinc-700 dark:hover:bg-zinc-100 transition-colors"
            >
              Importer {preview.filter((r) => r.selected).length} ligne(s)
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
