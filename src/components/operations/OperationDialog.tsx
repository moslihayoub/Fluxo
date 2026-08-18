'use client';

import { useState } from 'react';
import { X, TrendingUp, TrendingDown, Tag, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { generateId, fromCents, toCents, cn } from '@/lib/utils';
import type { Operation, SubAmount } from '@/types';
import { getTranslation } from '@/lib/i18n';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/Select';

interface OperationDialogProps {
  operation?: Operation;
  monthId: string;
  onClose: () => void;
}

export default function OperationDialog({ operation, monthId, onClose }: OperationDialogProps) {
  const { operationTypes, addOperation, updateOperation, addOperationType, language, businessOrders, businessFees, months } = useStore();
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(language, key);

  const [amount, setAmount] = useState(operation ? (fromCents(operation.amount_cents) || 0).toString() : '');
  const [kind, setKind] = useState<'encaissement' | 'decaissement'>(operation?.kind ?? 'encaissement');
  const [isProProfitSync, setIsProProfitSync] = useState(operation?.isProProfitSync ?? false);
  const [operationTypeLabel, setOperationTypeLabel] = useState(
    operation?.operationTypeLabel ?? (operation?.isProProfitSync ? 'Bénéfice Pro' : '')
  );
  const [operationTypeId, setOperationTypeId] = useState(
    operation?.isProProfitSync ? '__pro_profit__' : (operation?.operationTypeId ?? '')
  );
  const [notes, setNotes] = useState(operation?.notes ?? '');
  const [newTypeLabel, setNewTypeLabel] = useState('');
  const [addToList, setAddToList] = useState(true);
  const [isNewType, setIsNewType] = useState(false);
  const [hasSubAmounts, setHasSubAmounts] = useState(!!(operation?.subAmounts && operation.subAmounts.length > 0));
  const [subAmounts, setSubAmounts] = useState<SubAmount[]>(operation?.subAmounts ?? []);
  const [error, setError] = useState('');

  const isEditing = !!operation;

  // Calcul du bénéfice Pro (pour le mois ciblé si données présentes, ou global)
  const targetMonth = (months || []).find(m => m.id === monthId);
  let targetOrders = businessOrders || [];
  let targetFees = businessFees || [];
  if (targetMonth) {
    const mOrders = targetOrders.filter(o => {
      const d = new Date(o.date);
      return d.getMonth() + 1 === targetMonth.month && d.getFullYear() === targetMonth.year;
    });
    const mFees = targetFees.filter(f => {
      const d = new Date(f.date);
      return d.getMonth() + 1 === targetMonth.month && d.getFullYear() === targetMonth.year;
    });
    if (mOrders.length > 0 || mFees.length > 0) {
      targetOrders = mOrders;
      targetFees = mFees;
    }
  }

  const totalProRevenue = targetOrders.reduce((sum, order) => sum + (order.amountTTC_cents || 0), 0);
  const totalProCosts = targetOrders.reduce((sum, order) => sum + (order.items || []).reduce((itemSum, item) => itemSum + ((item.unitCostPrice_cents || 0) * (item.quantity || 1)), 0), 0);
  const totalProFees = targetFees.reduce((sum, fee) => sum + (fee.amount_cents || 0), 0);
  const totalProProfitCents = Math.max(0, totalProRevenue - totalProCosts - totalProFees);

  const handleTypeSelect = (value: string) => {
    if (value === '__new__') {
      setIsNewType(true);
      setIsProProfitSync(false);
      setOperationTypeId('');
      setOperationTypeLabel('');
    } else if (value === '__pro_profit__') {
      setIsNewType(false);
      setIsProProfitSync(true);
      setHasSubAmounts(false);
      setOperationTypeId('__pro_profit__');
      setOperationTypeLabel('Bénéfice Pro');
      setAmount((fromCents(totalProProfitCents) || 0).toString());
    } else {
      const found = operationTypes.find((ot) => ot.id === value);
      setIsNewType(false);
      setIsProProfitSync(false);
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
      if (amount.trim() === '') {
        parsedAmount = 0;
      } else if (isNaN(parsedAmount) || parsedAmount < 0) {
        setError('Le montant doit être un nombre positif ou nul.');
        return;
      }
    }

    let finalTypeId = operationTypeId === '__pro_profit__' ? undefined : operationTypeId;
    let finalTypeLabel = isProProfitSync ? (operationTypeLabel || 'Bénéfice Pro') : operationTypeLabel;

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
      amount_cents: isProProfitSync ? totalProProfitCents : parsedAmount,
      subAmounts: hasSubAmounts ? subAmounts : undefined,
      notes: notes.trim() || undefined,
      isProProfitSync,
    };

    if (isEditing && operation) {
      updateOperation(operation.id, opData);
    } else {
      addOperation(opData);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center sm:block p-4 sm:p-0">
      <div 
        className="absolute sm:fixed inset-0 bg-zinc-950/50 backdrop-blur-sm animate-in fade-in duration-200" 
        onClick={() => {
          if (typeof window !== 'undefined' && window.innerWidth < 640) {
            onClose();
          }
        }} 
      />
      <div className="relative sm:fixed sm:inset-y-0 sm:right-0 z-10 bg-white dark:bg-zinc-900 w-full max-w-md sm:max-w-none sm:w-[50%] rounded-3xl sm:rounded-none sm:rounded-l-3xl shadow-xl overflow-hidden flex flex-col max-h-[90vh] sm:max-h-none sm:h-full animate-in fade-in sm:slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-zinc-100 dark:bg-zinc-800 rounded-xl flex items-center justify-center text-zinc-900 dark:text-white">
              {kind === 'encaissement' ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
            </div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
              {isEditing ? t('ops.edit') : t('ops.new')}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          <form id="operation-form" onSubmit={handleSubmit} className="space-y-4">

            {/* 1. Type — encaissement / décaissement */}
          <div>
            <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
              {t('common.type')}
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setKind('encaissement')}
                className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                  kind === 'encaissement'
                    ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-300 ring-1 ring-emerald-500/20 font-medium'
                    : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-700'
                }`}
              >
                <div className={`p-2 rounded-lg shrink-0 ${kind === 'encaissement' ? 'bg-emerald-600 text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'}`}>
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold">{t('common.incomes')}</div>
                  <div className="text-[10px] text-zinc-500 dark:text-zinc-400">Recettes, entrées</div>
                </div>
              </button>
              <button
                type="button"
                onClick={() => {
                  setKind('decaissement');
                  if (isProProfitSync) {
                    setIsProProfitSync(false);
                    setOperationTypeId('');
                    setOperationTypeLabel('');
                    setAmount('');
                  }
                }}
                className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                  kind === 'decaissement'
                    ? 'border-rose-600 bg-rose-50/50 dark:bg-rose-950/20 text-rose-900 dark:text-rose-300 ring-1 ring-rose-500/20 font-medium'
                    : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-700'
                }`}
              >
                <div className={`p-2 rounded-lg shrink-0 ${kind === 'decaissement' ? 'bg-rose-600 text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'}`}>
                  <TrendingDown className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold">{t('common.expenses')}</div>
                  <div className="text-[10px] text-zinc-500 dark:text-zinc-400">Dépenses, sorties</div>
                </div>
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
                {/* Option spéciale Bénéfice Pro pour les entrées */}
                {kind === 'encaissement' && (
                  <SelectItem 
                    value="__pro_profit__" 
                    className="text-violet-600 dark:text-violet-400 font-semibold bg-violet-50/60 dark:bg-violet-950/30 focus:bg-violet-100 dark:focus:bg-violet-900/40 focus:text-violet-700 dark:focus:text-violet-300"
                  >
                    Bénéfice Pro
                  </SelectItem>
                )}
                {operationTypes.map((ot) => (
                  <SelectItem key={ot.id} value={ot.id}>{ot.label}</SelectItem>
                ))}
                {operationTypeId && !isNewType && operationTypeId !== '__pro_profit__' && !operationTypes.some(ot => ot.id === operationTypeId) && (
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
                    <div className="relative w-11 h-6 bg-zinc-300 peer-focus:outline-none rounded-full peer dark:bg-zinc-600 peer-checked:after:translate-x-full peer-checked:after:border-zinc-900 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white dark:after:bg-zinc-900 after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-zinc-600 peer-checked:bg-zinc-900 dark:peer-checked:bg-white dark:peer-checked:after:border-white"></div>
                  </div>
                </label>
              </div>
            )}
          </div>

          {/* 3. Montant */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                {t('common.amount')} <span className="text-zinc-400 font-normal lowercase">(optionnel)</span>
              </label>
              <label className={cn(
                "flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300",
                isProProfitSync ? "opacity-40 cursor-not-allowed" : "cursor-pointer"
              )}>
                <span className="font-medium text-xs">{t('ops.subAmounts')}</span>
                <div className="relative inline-flex items-center">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={hasSubAmounts}
                    onChange={(e) => {
                      if (!isProProfitSync) {
                        setHasSubAmounts(e.target.checked);
                      }
                    }}
                    disabled={isProProfitSync}
                  />
                  <div className="relative w-9 h-5 bg-zinc-300 peer-focus:outline-none rounded-full peer dark:bg-zinc-600 peer-checked:after:translate-x-full peer-checked:after:border-zinc-900 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white dark:after:bg-zinc-900 after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-zinc-600 peer-checked:bg-zinc-900 dark:peer-checked:bg-white dark:peer-checked:after:border-white"></div>
                </div>
              </label>
            </div>
            
            {!hasSubAmounts ? (
              <div className="relative">
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={isProProfitSync ? (totalProProfitCents / 100).toFixed(2) : amount}
                  onChange={(e) => { setAmount(e.target.value); setError(''); }}
                  placeholder="0,00"
                  disabled={isProProfitSync}
                  data-testid="operation-price-input"
                  className={cn(
                    "w-full px-3 py-2 pr-16 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm font-mono placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white transition-shadow",
                    isProProfitSync && "opacity-80 bg-zinc-50 dark:bg-zinc-900/50 text-violet-700 dark:text-violet-400 font-bold"
                  )}
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

          </form>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 flex justify-end gap-3 bg-zinc-50 dark:bg-zinc-800/40">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-xl font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
          >
            {t('common.cancel')}
          </button>
          <button
            type="submit"
            form="operation-form"
            data-testid="operation-submit-btn"
            className="px-6 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:hover:bg-zinc-100 dark:text-zinc-900 rounded-xl font-bold transition-colors shadow-sm flex items-center gap-2"
          >
            {isEditing ? <><CheckCircle2 className="w-4 h-4" /> {t('common.edit')}</> : <><Plus className="w-4 h-4" /> {t('common.add')}</>}
          </button>
        </div>
      </div>
    </div>
  );
}
