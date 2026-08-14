'use client';

import { useState, useRef } from 'react';
import { Upload, X, FileText, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { generateId } from '@/lib/utils';
import type { BusinessOrder } from '@/types';
import toast from 'react-hot-toast';

interface ImportDialogProps {
  onClose: () => void;
}

// Simplified CSV parser that handles commas and semicolons
function parseCSVWithHeaders(text: string): { headers: string[], rows: Record<string, string>[] } {
  const lines = text.split('\n').filter(l => l.trim().length > 0);
  if (lines.length === 0) return { headers: [], rows: [] };
  
  const separator = lines[0].includes(';') ? ';' : ',';
  const headers = lines[0].split(separator).map(h => h.trim().replace(/^"|"$/g, ''));
  
  const rows = lines.slice(1).map(line => {
    const values = line.split(separator).map(v => v.trim().replace(/^"|"$/g, ''));
    const rowObj: Record<string, string> = {};
    headers.forEach((header, index) => {
      rowObj[header] = values[index] || '';
    });
    return rowObj;
  });
  
  return { headers, rows };
}

type RequiredField = 'clientName' | 'productName' | 'amountTTC' | 'date';

const EXPECTED_FIELDS: { key: RequiredField; label: string; required: boolean }[] = [
  { key: 'date', label: 'Date', required: true },
  { key: 'clientName', label: 'Client (Nom)', required: true },
  { key: 'productName', label: 'Produit vendu', required: true },
  { key: 'amountTTC', label: 'Montant Total (TTC)', required: true },
];

export default function BusinessImportDialog({ onClose }: ImportDialogProps) {
  const { addBusinessOrder } = useStore();
  const fileRef = useRef<HTMLInputElement>(null);
  
  const [step, setStep] = useState<1 | 2>(1);
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');
  
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [csvRows, setCsvRows] = useState<Record<string, string>[]>([]);
  const [mapping, setMapping] = useState<Record<RequiredField, string>>({
    clientName: '',
    productName: '',
    amountTTC: '',
    date: ''
  });

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setError('');

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const text = ev.target?.result as string;
        const { headers, rows } = parseCSVWithHeaders(text);
        
        if (headers.length === 0 || rows.length === 0) {
          setError('Le fichier semble vide ou mal formaté.');
          return;
        }
        
        setCsvHeaders(headers);
        setCsvRows(rows);
        
        // Auto-mapping attempt
        const autoMap = { ...mapping };
        headers.forEach(h => {
          const lowerH = h.toLowerCase();
          if (lowerH.includes('client') || lowerH.includes('nom')) autoMap.clientName = h;
          else if (lowerH.includes('produit') || lowerH.includes('article')) autoMap.productName = h;
          else if (lowerH.includes('montant') || lowerH.includes('prix') || lowerH.includes('total') || lowerH.includes('ttc')) autoMap.amountTTC = h;
          else if (lowerH.includes('date')) autoMap.date = h;
        });
        setMapping(autoMap);
        setStep(2);
      } catch (err) {
        setError('Erreur lors de la lecture du fichier CSV.');
      }
    };
    reader.readAsText(file, 'utf-8');
  };

  const handleMappingChange = (fieldKey: RequiredField, csvHeader: string) => {
    setMapping(prev => ({ ...prev, [fieldKey]: csvHeader }));
  };

  const handleImport = () => {
    // Validation
    const missingFields = EXPECTED_FIELDS.filter(f => f.required && !mapping[f.key]);
    if (missingFields.length > 0) {
      setError(`Veuillez associer toutes les colonnes requises (${missingFields.map(f => f.label).join(', ')}).`);
      return;
    }

    try {
      let importedCount = 0;
      csvRows.forEach(row => {
        const amountStr = row[mapping.amountTTC];
        // Clean amount string (remove currency symbols, replace comma with dot)
        if (!amountStr) return;
        const amountVal = parseFloat(amountStr.replace(/[^\d.,-]/g, '').replace(',', '.'));
        
        if (isNaN(amountVal)) return; // Skip invalid rows

        const dateStr = row[mapping.date];
        let dateObj = new Date();
        if (dateStr) {
          const parsed = new Date(dateStr);
          if (!isNaN(parsed.getTime())) {
            dateObj = parsed;
          }
        }

        const newOrder: Omit<BusinessOrder, 'id' | 'createdAt'> = {
          orderNumber: `CMD-${generateId().substring(0,6).toUpperCase()}`,
          date: dateObj.toISOString(),
          clientName: row[mapping.clientName] || 'Client Inconnu',
          items: [{
            id: generateId(),
            productName: row[mapping.productName] || 'Produit',
            quantity: 1,
            unitCostPrice_cents: 0,
            unitSellingPrice_cents: amountVal,
            isFree: false
          }],
          taxMode: 'HT', // default
          amountHT_cents: amountVal,
          amountTVA_cents: 0,
          amountTTC_cents: amountVal,
          shippingFee_cents: 0,
          extraFees: [],
          totalFees_cents: 0,
          paymentStatus: 'paid', // Assume paid for simple import
          advancePaid_cents: amountVal,
          remainingBalance_cents: 0,
          netProfit_cents: amountVal,
          updatedAt: new Date().toISOString(),
          userId: 'auto',
        };
        addBusinessOrder(newOrder);
        importedCount++;
      });
      
      toast.success(`${importedCount} ventes importées avec succès !`);
      onClose();
    } catch (err) {
      setError("Erreur lors de l'importation des données.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center sm:block p-4 sm:p-0">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose} />
      <div className="relative sm:fixed sm:inset-y-0 sm:right-0 z-10 w-full max-w-lg sm:max-w-none sm:w-[50%] bg-white dark:bg-zinc-900 rounded-xl sm:rounded-none sm:rounded-l-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 animate-in fade-in sm:slide-in-from-right duration-300 max-h-[90vh] sm:max-h-none sm:h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-zinc-100 dark:border-zinc-800">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Importer des ventes</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {step === 1 && (
            <div className="space-y-4">
              <p className="text-sm text-zinc-500">Sélectionnez votre fichier Excel exporté au format CSV (séparé par des virgules ou points-virgules).</p>
              
              <div
                onClick={() => fileRef.current?.click()}
                className="border-2 border-dashed border-zinc-200 dark:border-zinc-700 rounded-xl p-8 text-center cursor-pointer hover:border-violet-400 dark:hover:border-violet-500 transition-colors bg-zinc-50 dark:bg-zinc-900/50"
              >
                <input ref={fileRef} type="file" accept=".csv" onChange={handleFile} className="hidden" />
                <Upload className="w-10 h-10 text-zinc-400 mx-auto mb-3" />
                <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Cliquez pour sélectionner un fichier CSV</p>
                <p className="text-xs text-zinc-400 mt-1">Vos données restent sur votre appareil</p>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-3 py-3">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="bg-violet-50 dark:bg-violet-900/20 border border-violet-100 dark:border-violet-800 rounded-lg p-3 text-sm text-violet-700 dark:text-violet-300">
                <strong className="block mb-1">Correspondance des colonnes</strong>
                Associez les colonnes de votre fichier ({fileName}) avec les champs attendus par Fluxo.
              </div>
              
              <div className="space-y-4">
                {EXPECTED_FIELDS.map(field => (
                  <div key={field.key} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-3">
                    <label className="text-sm font-medium text-zinc-900 dark:text-white flex items-center gap-1.5">
                      {field.label}
                      {field.required && <span className="text-rose-500">*</span>}
                    </label>
                    <select
                      value={mapping[field.key]}
                      onChange={(e) => handleMappingChange(field.key, e.target.value)}
                      className="bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-900 dark:text-white w-full sm:w-48 focus:outline-none focus:ring-2 focus:ring-violet-500"
                    >
                      <option value="">-- Ignorer / Sélectionner --</option>
                      {csvHeaders.map(h => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>

              {error && (
                <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-3 py-3">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40 flex justify-end gap-3 shrink-0">
          <button onClick={onClose} className="px-6 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
            Annuler
          </button>
          {step === 2 && (
            <button
              onClick={handleImport}
              className="px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-bold transition-colors shadow-sm flex items-center justify-center gap-2"
            >
              Lancer l'importation <CheckCircle2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
