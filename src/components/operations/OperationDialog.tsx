'use client';

import { useState } from 'react';
import { X, TrendingUp, TrendingDown, Tag, Plus } from 'lucide-react';
import { useStore } from '@/store/useStore';
import type { Operation } from '@/types';

interface OperationDialogProps {
  operation?: Operation;
  monthId: string;
  onClose: () => void;
}

export default function OperationDialog({ operation, monthId, onClose }: OperationDialogProps) {
  const { operationTypes, addOperation, updateOperation, addOperationType } = useStore();

  const [amount, setAmount] = useState(operation?.amount.toString() ?? '');
  const [kind, setKind] = useState<'encaissement' | 'decaissement'>(operation?.kind ?? 'encaissement');
  const [operationTypeLabel, setOperationTypeLabel] = useState(operation?.operationTypeLabel ?? '');
  const [operationTypeId, setOperationTypeId] = useState(operation?.operationTypeId ?? '');
  const [notes, setNotes] = useState(operation?.notes ?? '');
  const [newTypeLabel, setNewTypeLabel] = useState('');
  const [addToList, setAddToList] = useState(true);
  const [isNewType, setIsNewType] = useState(false);
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
      
      if (found?.defaultAmount !== undefined) {
        setAmount(found.defaultAmount.toString());
      }
      if (found?.kind !== undefined) {
        setKind(found.kind);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount.replace(',', '.'));

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Le montant doit être un nombre positif.');
      return;
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
      amount: parsedAmount,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md bg-white dark:bg-zinc-900 rounded-xl shadow-2xl border border-zinc-200 dark:border-zinc-800 animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-zinc-100 dark:border-zinc-800">
          <h2 className="text-base font-semibold text-zinc-900 dark:text-white">
            {isEditing ? 'Modifier l\'opération' : 'Nouvelle opération'}
          </h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">

          {/* 1. Type — encaissement / décaissement */}
          <div>
            <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
              Type
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
                Encaissement
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
                Décaissement
              </button>
            </div>
          </div>

          {/* 2. Catégorie */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
              <span className="flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5" />
                Catégorie
              </span>
            </label>
            <select
              value={isNewType ? '__new__' : operationTypeId}
              onChange={(e) => { handleTypeSelect(e.target.value); setError(''); }}
              className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white transition-shadow"
            >
              <option value="">— Choisir une catégorie —</option>
              {operationTypes.map((ot) => (
                <option key={ot.id} value={ot.id}>{ot.label}</option>
              ))}
              <option value="__new__">+ Nouvelle catégorie</option>
            </select>

            {isNewType && (
              <div className="mt-2 space-y-2">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Plus className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-zinc-400" />
                    <input
                      type="text"
                      value={newTypeLabel}
                      onChange={(e) => setNewTypeLabel(e.target.value)}
                      placeholder="Nom de la catégorie"
                      className="w-full pl-8 pr-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white transition-shadow"
                    />
                  </div>
                </div>
                <label className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={addToList}
                    onChange={(e) => setAddToList(e.target.checked)}
                    className="rounded border-zinc-300 dark:border-zinc-600"
                  />
                  Ajouter à la liste des catégories
                </label>
              </div>
            )}
          </div>

          {/* 3. Montant */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
              Montant (MAD) *
            </label>
            <div className="relative">
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={amount}
                onChange={(e) => { setAmount(e.target.value); setError(''); }}
                placeholder="0,00"
                className="w-full px-3 py-2 pr-16 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm font-mono placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white transition-shadow"
              />
              <span className="absolute right-3 top-2.5 text-xs font-semibold text-zinc-400 dark:text-zinc-500">
                DH
              </span>
            </div>
          </div>

          {/* 4. Notes */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
              Notes <span className="text-zinc-400 font-normal">(optionnel)</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Informations complémentaires..."
              rows={2}
              className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white transition-shadow resize-none"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-sm font-medium hover:bg-zinc-700 dark:hover:bg-zinc-100 transition-colors"
            >
              {isEditing ? 'Mettre à jour' : 'Ajouter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
