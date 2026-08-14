'use client';

import { useState } from 'react';
import { X, TrendingUp, TrendingDown, Tag, Plus, Trash2 } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { generateId, fromCents, toCents } from '@/lib/utils';
import type { Operation, SubAmount } from '@/types';
import { getTranslation } from '@/lib/i18n';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/Select';

interface OperationDialogProps {
  operation?: Operation;
  monthId: string;
  onClose: () => void;
}

export default function OperationDialog({ operation, monthId, onClose }: OperationDialogProps) {
  const { operationTypes, addOperation, updateOperation, addOperationType, language } = useStore();
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(language, key);

  const [amount, setAmount] = useState(operation ? (fromCents(operation.amount_cents) || 0).toString() : '');
  const [kind, setKind] = useState<'encaissement' | 'decaissement'>(operation?.kind ?? 'encaissement');
  const [operationTypeLabel, setOperationTypeLabel] = useState(operation?.operationTypeLabel ?? '');
  const [operationTypeId, setOperationTypeId] = useState(operation?.operationTypeId ?? '');
  const [notes, setNotes] = useState(operation?.notes ?? '');
  const [newTypeLabel, setNewTypeLabel] = useState('');
  const [addToList, setAddToList] = useState(true);
  const [isNewType, setIsNewType] = useState(false);
  const [hasSubAmounts, setHasSubAmounts] = useState(!!(operation?.subAmounts && operation.subAmounts.length > 0));
  const [subAmounts, setSubAmounts] = useState<SubAmount[]>(operation?.subAmounts ?? []);
  const [error, setError] = useState('');

  const isEditing = !!operation;

  const handleTypeSelect = (value: string) => {
    if (value === '__new__') {
      setIsNewType(true);
      setOperationTypeId('');
      setOperationTypeLabel('');
    } else {
      const found = operationTypes.find((ot) => ot.id === value);
      setIsNewType(false);
      setOperationTypeId(found?.id ?? '');
      setOperationTypeLabel(found?.label ?? '');
      
      if (found?.defaultAmount_cents !== undefined) {
        setAmount((fromCents(found.defaultAmount_cents) || 0).toString());
      }
      if (found?.kind !== undefined) {
        setKind(found.kind);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    let parsedAmount = toCents(amount.replace(',', '.'));
    
    if (hasSubAmounts) {
      if (subAmounts.length === 0) {
        setError('Ajoutez au moins un sous-montant.');
        return;
      }
      for (const sub of subAmounts) {
        if (!sub.label.trim()) {
          setError('Le libellé de chaque sous-montant est requis.');
          return;
        }
        if (isNaN(sub.value_cents) || sub.value_cents <= 0) {
          setError('La valeur de chaque sous-montant doit être un nombre positif.');
          return;
        }
      }
      parsedAmount = subAmounts.reduce((acc, curr) => acc + (Number(curr.value_cents) || 0), 0);
    } else {
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        setError('Le montant doit être un nombre positif.');
        return;
      }
    }

    let finalTypeId = operationTypeId;
    let finalTypeLabel = operationTypeLabel;

    if (isNewType) {
      if (!newTypeLabel.trim()) { setError('Saisissez un libellé de catégorie.'); return; }
      finalTypeLabel = newTypeLabel.trim();
      if (addToList) {
        const created = addOperationType(finalTypeLabel, undefined, kind);
        finalTypeId = created.id;
      }
    }

    if (!finalTypeLabel) {
      setError('Veuillez sélectionner ou créer une catégorie.');
      return;
    }

    const opData = {
      monthId,
      label: finalTypeLabel, // label auto-set from category
      operationTypeId: finalTypeId || undefined,
      operationTypeLabel: finalTypeLabel,
      kind,
      amount_cents: parsedAmount,
      subAmounts: hasSubAmounts ? subAmounts : undefined,
      notes: notes.trim() || undefined,
    };

    if (isEditing && operation) {
      updateOperation(operation.id, opData);
    } else {
      addOperation(opData);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full h-full sm:w-[450px] bg-white dark:bg-zinc-900 shadow-2xl sm:border-l border-zinc-200 dark:border-zinc-800 flex flex-col animate-in slide-in-from-bottom sm:slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-zinc-100 dark:border-zinc-800 shrink-0">
          <h2 className="text-base font-semibold text-zinc-900 dark:text-white">
            {isEditing ? t('ops.edit') : t('ops.new')}
          </h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-5 space-y-4 overflow-y-auto flex-1">

            {/* 1. Type — encaissement / décaissement */}
          <div>
            <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
              {t('common.type')}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setKind('encaissement')}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all border ${
                  kind === 'encaissement'
                    ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                    : 'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 hover:border-emerald-300 hover:text-emerald-600'
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                {t('common.incomes')}
              </button>
              <button
                type="button"
                onClick={() => setKind('decaissement')}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all border ${
                  kind === 'decaissement'
                    ? 'bg-rose-600 border-rose-600 text-white shadow-sm'
                    : 'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 hover:border-rose-300 hover:text-rose-600'
                }`}
              >
                <TrendingDown className="w-4 h-4" />
                {t('common.expenses')}
              </button>
            </div>
          </div>

          {/* 2. Catégorie */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
              <span className="flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5" />
                {t('common.category')}
              </span>
            </label>
            <Select
              value={isNewType ? '__new__' : operationTypeId}
              onValueChange={(val) => { handleTypeSelect(val); setError(''); }}
            >
              <SelectTrigger>
                <SelectValue placeholder="— Choisir une catégorie —">
                  {isNewType ? `+ ${t('cat.new')}` : (operationTypeLabel || undefined)}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {operationTypes.map((ot) => (
                  <SelectItem key={ot.id} value={ot.id}>{ot.label}</SelectItem>
                ))}
                {operationTypeId && !isNewType && !operationTypes.some(ot => ot.id === operationTypeId) && (
                  <SelectItem value={operationTypeId}>{operationTypeLabel || operationTypeId}</SelectItem>
                )}
                <SelectItem value="__new__">+ {t('cat.new')}</SelectItem>
              </SelectContent>
            </Select>

            {isNewType && (
              <div className="mt-2 space-y-2">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Plus className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-zinc-400" />
                    <input
                      type="text"
                      value={newTypeLabel}
                      onChange={(e) => setNewTypeLabel(e.target.value)}
                      placeholder={t('cat.label')}
                      className="w-full pl-8 pr-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white transition-shadow"
                    />
                  </div>
                </div>
                <label className="flex items-center justify-between p-3 mt-2 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200 dark:border-zinc-700/50 cursor-pointer transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800">
                  <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Ajouter à la liste des catégories</span>
                  <div className="relative inline-flex items-center">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={addToList}
                      onChange={(e) => setAddToList(e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-violet-600"></div>
                  </div>
                </label>
              </div>
            )}
          </div>

          {/* 3. Montant */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                {t('common.amount')} *
              </label>
              <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300 cursor-pointer">
                <span className="font-medium text-xs">{t('ops.subAmounts')}</span>
                <div className="relative inline-flex items-center">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={hasSubAmounts}
                    onChange={(e) => setHasSubAmounts(e.target.checked)}
                  />
                  <div className="w-9 h-5 bg-zinc-200 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-violet-600"></div>
                </div>
              </label>
            </div>
            
            {!hasSubAmounts ? (
              <div className="relative">
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={amount}
                  onChange={(e) => { setAmount(e.target.value); setError(''); }}
                  placeholder="0,00"
                  data-testid="operation-price-input"
                  className="w-full px-3 py-2 pr-16 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm font-mono placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white transition-shadow"
                />
                <span className="absolute right-3 top-2.5 text-xs font-semibold text-zinc-400 dark:text-zinc-500">
                  DH
                </span>
              </div>
            ) : (
              <div className="space-y-3 bg-zinc-50 dark:bg-zinc-900/50 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800">
                {subAmounts.map((sub, index) => (
                  <div key={sub.id} className="flex gap-2 pb-3 mb-3 border-b border-zinc-200 dark:border-zinc-700/50 last:border-0 last:pb-0 last:mb-0 items-center">
                    <input
                      type="text"
                      placeholder={t('ops.subLabel')}
                      value={sub.label}
                      onChange={(e) => setSubAmounts(subAmounts.map((s) => (s.id === sub.id ? { ...s, label: e.target.value } : s)))}
                      className="flex-1 text-sm bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white transition-shadow placeholder:text-zinc-400 dark:placeholder:text-zinc-500 dark:text-white"
                    />
                    <div className="relative w-36 sm:w-40 shrink-0">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0,00"
                        value={sub.value_cents === 0 ? '' : fromCents(sub.value_cents)}
                        onChange={(e) => {
                          const newSubs = [...subAmounts];
                          const val = e.target.value;
                          newSubs[index].value_cents = val === '' ? 0 : toCents(val);
                          setSubAmounts(newSubs);
                          setError('');
                        }}
                        className="w-full px-3 py-2 pr-8 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm font-mono text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white"
                      />
                      <span className="absolute right-2.5 top-2.5 text-xs font-semibold text-zinc-400">
                        DH
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSubAmounts(subAmounts.filter(s => s.id !== sub.id))}
                      className="p-2 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                
                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={() => setSubAmounts([...subAmounts, { id: generateId(), label: '', value_cents: 0 }])}
                    className="flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    {t('ops.addSubAmount')}
                  </button>
                  <div className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                    {t('common.total')}: <span className="font-mono font-bold text-zinc-900 dark:text-white">{fromCents(subAmounts.reduce((acc, curr) => acc + (Number(curr.value_cents) || 0), 0)).toFixed(2)} DH</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 4. Notes */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
              {t('ops.notes')}
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t('ops.notesPlaceholder')}
              rows={2}
              className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white transition-shadow resize-none"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          </div>
          <div className="p-5 border-t border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 shrink-0 pb-safe">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
              >
                {t('common.cancel')}
              </button>
              <button
                type="submit"
                data-testid="operation-submit-btn"
                className="flex-1 px-4 py-2.5 rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-sm font-medium hover:bg-zinc-700 dark:hover:bg-zinc-100 transition-colors"
              >
                {isEditing ? t('common.edit') : t('common.add')}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
