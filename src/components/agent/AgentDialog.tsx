'use client';

import { useState, useRef } from 'react';
import { X, Bot, Send, FileText, Loader2, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { formatCurrency, getMonthLabel } from '@/lib/utils';
import type { ExtractedOperation, Kind } from '@/types';

interface AgentDialogProps {
  defaultMonthId: string;
  onClose: () => void;
}

type Tab = 'text' | 'file';
type Step = 'input' | 'preview' | 'done';

const SYSTEM_PROMPT = `Tu es un expert comptable et analyste financier. Tu vas analyser un relevé bancaire, un export CSV ou du texte brut de transactions et extraire les opérations financières.

RÈGLES STRICTES :
- Ignore les lignes de solde initial, solde final, et totaux récapitulatifs
- Ignore les en-têtes de colonnes et titres
- Interprète correctement débit/crédit : débit = décaissement, crédit = encaissement
- Les montants négatifs = décaissement, positifs = encaissement
- Normalise les dates au format YYYY-MM-DD
- Si la date est absente, utilise null
- Propose des catégories simples et pertinentes pour operationTypeSuggestion
- Réponds UNIQUEMENT en JSON valide, sans texte, sans markdown, sans balises`;

export default function AgentDialog({ defaultMonthId, onClose }: AgentDialogProps) {
  const { months, operationTypes, addOperations } = useStore();
  const activeMonths = months.filter((m) => m.status === 'active');

  const [tab, setTab] = useState<Tab>('text');
  const [textInput, setTextInput] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileContent, setFileContent] = useState('');
  const [targetMonthId, setTargetMonthId] = useState(defaultMonthId);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<Step>('input');
  const [extractedOps, setExtractedOps] = useState<ExtractedOperation[]>([]);
  const [summary, setSummary] = useState({ totalEncaissement: 0, totalDecaissement: 0, count: 0 });
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setError('');
    const reader = new FileReader();
    reader.onload = (ev) => {
      setFileContent(ev.target?.result as string ?? '');
    };
    reader.readAsText(file, 'utf-8');
  };

  const handleSubmit = async () => {
    const content = tab === 'text' ? textInput : fileContent;
    if (!content.trim()) { setError('Veuillez fournir un relevé à analyser.'); return; }

    setLoading(true);
    setError('');
    try {
      let data;
      // Try API route first
      const res = await fetch('/api/finance-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inputType: tab, content, operationTypes }),
      }).catch(() => null);

      if (res && res.ok) {
        data = await res.json();
      } else if (res && res.status !== 404) {
        // The server route exists but returned an error (e.g., 500, 502, 429)
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.error || `Erreur serveur: ${res.status}`);
      } else {
        // Fallback for static GitHub Pages export (404 Not Found): call Gemini directly
        const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
        if (!apiKey) throw new Error("Clé API Gemini client manquante (NEXT_PUBLIC_GEMINI_API_KEY).");
        
        const existingTypes = operationTypes.map((ot) => ot.label).join(', ');
        const typeContext = existingTypes ? `\nTypes d'opérations existants : ${existingTypes}` : '';
        const userMessage = `Voici un relevé bancaire à analyser :${typeContext}\n---\n${content}\n---`;

        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
              contents: [{ role: 'user', parts: [{ text: userMessage }] }],
              generationConfig: { temperature: 0.1, responseMimeType: 'application/json' },
            }),
          }
        );

        if (!geminiRes.ok) {
          const errData = await geminiRes.json().catch(() => null);
          throw new Error(errData?.error?.message || 'Erreur de connexion à Gemini (Client)');
        }

        const geminiData = await geminiRes.json();
        const rawText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
        const clean = rawText.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim();
        const parsed = JSON.parse(clean);

        const ops = (parsed.operations ?? []).map((op: any) => ({
          label: String(op.label ?? 'Opération'),
          amount_cents: Math.abs(parseFloat(String(op.amount_cents ?? 0))),
          kind: op.kind === 'encaissement' || op.kind === 'decaissement' ? op.kind : 'decaissement',
          operationTypeSuggestion: String(op.operationTypeSuggestion ?? 'Frais divers'),
          selected: true,
        }));

        data = {
          operations: ops,
          summary: {
            totalEncaissement: ops.filter((o: any) => o.kind === 'encaissement').reduce((s: number, o: any) => s + o.amount_cents, 0),
            totalDecaissement: ops.filter((o: any) => o.kind === 'decaissement').reduce((s: number, o: any) => s + o.amount_cents, 0),
            count: ops.length,
          },
        };
      }

      setExtractedOps(data.operations.map((op: ExtractedOperation) => ({ ...op, selected: true })));
      setSummary(data.summary);
      setStep('preview');
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'analyse par l\'agent AI.');
    } finally {
      setLoading(false);
    }
  };

  const toggleOp = (i: number) => {
    setExtractedOps((ops) => ops.map((op, idx) => idx === i ? { ...op, selected: !op.selected } : op));
  };

  const toggleAll = () => {
    const allSelected = extractedOps.every((op) => op.selected);
    setExtractedOps((ops) => ops.map((op) => ({ ...op, selected: !allSelected })));
  };

  const updateKind = (i: number, kind: Kind) => {
    setExtractedOps((ops) => ops.map((op, idx) => idx === i ? { ...op, kind } : op));
  };

  const updateCategory = (i: number, cat: string) => {
    setExtractedOps((ops) => ops.map((op, idx) => idx === i ? { ...op, operationTypeSuggestion: cat } : op));
  };

  const handleApply = () => {
    const selected = extractedOps.filter((op) => op.selected);
    if (selected.length === 0) { setError('Sélectionnez au moins une opération.'); return; }

    addOperations(
      selected.map((op) => ({
        monthId: targetMonthId,
        label: op.operationTypeSuggestion,
        operationTypeLabel: op.operationTypeSuggestion,
        kind: op.kind,
        amount_cents: op.amount_cents,
        notes: op.notes ?? undefined,
      }))
    );
    setStep('done');
  };

  const handleReset = () => {
    setStep('input');
    setExtractedOps([]);
    setTextInput('');
    setFileContent('');
    setFileName('');
    setError('');
  };

  const targetMonth = months.find((m) => m.id === targetMonthId);
  const selectedCount = extractedOps.filter((op) => op.selected).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-xl shadow-2xl border border-zinc-200 dark:border-zinc-800 animate-scale-in flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-zinc-900 dark:text-white">Agent AI</h2>
              <p className="text-xs text-zinc-400">Extraction automatique de relevés</p>
            </div>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {/* ── STEP: INPUT ── */}
          {step === 'input' && (
            <div className="space-y-4">
              {/* Tabs */}
              <div className="flex rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-700 p-0.5 bg-zinc-50 dark:bg-zinc-800 gap-0.5">
                {(['text', 'file'] as Tab[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => { setTab(t); setError(''); }}
                    className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${
                      tab === t
                        ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm'
                        : 'text-zinc-500 dark:text-zinc-400'
                    }`}
                  >
                    {t === 'text' ? '📝 Texte' : '📂 Fichier'}
                  </button>
                ))}
              </div>

              {tab === 'text' ? (
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Collez votre relevé bancaire ou export CSV
                  </label>
                  <textarea
                    value={textInput}
                    onChange={(e) => { setTextInput(e.target.value); setError(''); }}
                    placeholder="01/01/2024 Virement client ABC +1500.00&#10;05/01/2024 Loyer -800.00&#10;10/01/2024 Facture Orange -45.99..."
                    rows={8}
                    className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm font-mono placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white transition-shadow resize-none"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Fichier CSV, TXT ou PDF
                  </label>
                  <div
                    onClick={() => fileRef.current?.click()}
                    className="border-2 border-dashed border-zinc-200 dark:border-zinc-700 rounded-xl p-8 text-center cursor-pointer hover:border-zinc-400 dark:hover:border-zinc-500 transition-colors"
                  >
                    <input ref={fileRef} type="file" accept=".csv,.txt,.pdf" onChange={handleFile} className="hidden" />
                    <FileText className="w-8 h-8 text-zinc-400 mx-auto mb-2" />
                    {fileName ? (
                      <p className="text-sm font-medium text-zinc-900 dark:text-white">{fileName}</p>
                    ) : (
                      <p className="text-sm text-zinc-500 dark:text-zinc-400">Cliquez pour sélectionner</p>
                    )}
                  </div>
                </div>
              )}

              {/* Month selector */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Mois cible
                </label>
                <select
                  value={targetMonthId}
                  onChange={(e) => setTargetMonthId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white transition-shadow"
                >
                  {activeMonths.length === 0 ? (
                    <option value="">Aucun mois actif disponible</option>
                  ) : (
                    activeMonths.map((m) => (
                      <option key={m.id} value={m.id}>{getMonthLabel(m)}</option>
                    ))
                  )}
                </select>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={loading || activeMonths.length === 0}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-medium hover:from-violet-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Analyse en cours...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Demander à l&apos;agent
                  </>
                )}
              </button>
            </div>
          )}

          {/* ── STEP: PREVIEW ── */}
          {step === 'preview' && (
            <div className="space-y-4">
              {/* Summary */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-zinc-50 dark:bg-zinc-800 rounded-lg p-3 text-center">
                  <p className="text-xs text-zinc-400 mb-1">Opérations</p>
                  <p className="text-lg font-bold text-zinc-900 dark:text-white">{summary.count}</p>
                </div>
                <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-3 text-center">
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 mb-1">Entrées</p>
                  <p className="text-sm font-bold font-mono text-emerald-700 dark:text-emerald-300 tabular-nums">
                    {formatCurrency(summary.totalEncaissement)}
                  </p>
                </div>
                <div className="bg-rose-50 dark:bg-rose-900/20 rounded-lg p-3 text-center">
                  <p className="text-xs text-rose-600 dark:text-rose-400 mb-1">Sorties</p>
                  <p className="text-sm font-bold font-mono text-rose-700 dark:text-rose-300 tabular-nums">
                    {formatCurrency(summary.totalDecaissement)}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  {selectedCount}/{extractedOps.length} sélectionné(s) →{' '}
                  <span className="font-medium">{targetMonth ? getMonthLabel(targetMonth) : ''}</span>
                </p>
                <button onClick={toggleAll} className="text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-white underline">
                  {extractedOps.every((op) => op.selected) ? 'Tout désélectionner' : 'Tout sélectionner'}
                </button>
              </div>

              {/* Table */}
              <div className="max-h-72 overflow-y-auto rounded-lg border border-zinc-200 dark:border-zinc-700">
                <table className="w-full text-xs">
                  <thead className="sticky top-0 bg-zinc-50 dark:bg-zinc-800">
                    <tr>
                      <th className="w-8 px-2 py-2"></th>
                      <th className="text-left px-2 py-2 text-zinc-500 font-medium">Libellé</th>
                      <th className="text-left px-2 py-2 text-zinc-500 font-medium">Catégorie</th>
                      <th className="text-left px-2 py-2 text-zinc-500 font-medium">Type</th>
                      <th className="text-right px-2 py-2 text-zinc-500 font-medium">Montant</th>
                    </tr>
                  </thead>
                  <tbody>
                    {extractedOps.map((op, i) => (
                      <tr
                        key={i}
                        className={`border-t border-zinc-100 dark:border-zinc-800 transition-colors ${
                          op.selected ? '' : 'opacity-40'
                        }`}
                      >
                        <td className="px-2 py-1.5 text-center">
                          <div className="relative inline-flex items-center">
                            <input
                              type="checkbox"
                              className="sr-only peer"
                              checked={op.selected}
                              onChange={() => toggleOp(i)}
                            />
                            <div className="relative w-9 h-5 bg-zinc-200 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-violet-600"></div>
                          </div>
                        </td>
                        <td className="px-2 py-1.5 text-zinc-700 dark:text-zinc-300 max-w-[120px] truncate" title={op.label}>
                          {op.label}
                        </td>
                        <td className="px-2 py-1.5">
                          <input
                            type="text"
                            value={op.operationTypeSuggestion}
                            onChange={(e) => updateCategory(i, e.target.value)}
                            className="w-full px-1.5 py-0.5 rounded border border-zinc-200 dark:border-zinc-700 bg-transparent text-zinc-600 dark:text-zinc-400 text-xs focus:outline-none focus:ring-1 focus:ring-zinc-400"
                          />
                        </td>
                        <td className="px-2 py-1.5">
                          <select
                            value={op.kind}
                            onChange={(e) => updateKind(i, e.target.value as Kind)}
                            className={`text-xs px-1.5 py-0.5 rounded border focus:outline-none cursor-pointer ${
                              op.kind === 'encaissement'
                                ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400'
                                : 'bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400'
                            }`}
                          >
                            <option value="encaissement">Entrée</option>
                            <option value="decaissement">Sortie</option>
                          </select>
                        </td>
                        <td className={`px-2 py-1.5 text-right font-mono tabular-nums font-medium ${
                          op.kind === 'encaissement' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                        }`}>
                          {op.kind === 'encaissement' ? '+' : '−'}{formatCurrency(op.amount_cents)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {error && (
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              )}
            </div>
          )}

          {/* ── STEP: DONE ── */}
          {step === 'done' && (
            <div className="text-center py-10 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-lg font-semibold text-zinc-900 dark:text-white">Importation réussie !</p>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                  {selectedCount} opération{selectedCount > 1 ? 's' : ''} ajoutée{selectedCount > 1 ? 's' : ''} à{' '}
                  {targetMonth ? getMonthLabel(targetMonth) : 'ce mois'}
                </p>
              </div>
              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors mx-auto"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Analyser un autre relevé
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        {step === 'preview' && (
          <div className="p-5 border-t border-zinc-100 dark:border-zinc-800 flex gap-2">
            <button onClick={handleReset} className="flex-1 px-4 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
              Retour
            </button>
            <button
              onClick={handleApply}
              className="flex-1 px-4 py-2.5 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-medium hover:from-violet-700 hover:to-indigo-700 transition-all"
            >
              Appliquer {selectedCount} opération{selectedCount > 1 ? 's' : ''}
            </button>
          </div>
        )}
        {(step === 'input' || step === 'done') && (
          <div className="p-5 border-t border-zinc-100 dark:border-zinc-800">
            <button onClick={onClose} className="w-full px-4 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
              Fermer
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
