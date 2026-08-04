'use client';

import { useState, useMemo } from 'react';
import {
  Tag,
  Plus,
  Pencil,
  Trash2,
  Eye,
  X,
  ChevronRight,
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Search,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { formatCurrency, getMonthLabel, MONTH_NAMES } from '@/lib/utils';
import type { OperationType, Operation } from '@/types';

// ── Add / Edit Category Dialog ────────────────────────────────
function CategoryDialog({
  category,
  onClose,
}: {
  category?: OperationType;
  onClose: () => void;
}) {
  const { operationTypes, addOperationType } = useStore();
  const [label, setLabel] = useState(category?.label ?? '');
  const [defaultAmount, setDefaultAmount] = useState<string>(category?.defaultAmount?.toString() ?? '');
  const [kind, setKind] = useState<'encaissement' | 'decaissement' | undefined>(category?.kind);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim()) { setError('Le nom est requis.'); return; }
    
    const parsedAmount = defaultAmount ? parseFloat(defaultAmount) : undefined;
    if (defaultAmount && isNaN(parsedAmount!)) {
      setError('Montant par défaut invalide.');
      return;
    }

    if (!category) {
      // New category
      const exists = operationTypes.find(
        (ot) => ot.label.toLowerCase() === label.trim().toLowerCase()
      );
      if (exists) { setError('Cette catégorie existe déjà.'); return; }
      addOperationType(label.trim(), parsedAmount, kind);
    } else {
      // Edit: rename the type in the store + update all linked operations
      useStore.setState((state) => ({
        operationTypes: state.operationTypes.map((ot) =>
          ot.id === category.id ? { ...ot, label: label.trim(), defaultAmount: parsedAmount, kind } : ot
        ),
        operations: state.operations.map((op) =>
          op.operationTypeId === category.id || op.operationTypeLabel === category.label
            ? { ...op, operationTypeLabel: label.trim() }
            : op
        ),
      }));
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-sm bg-white dark:bg-zinc-900 rounded-xl shadow-2xl border border-zinc-200 dark:border-zinc-800 animate-scale-in">
        <div className="flex items-center justify-between p-5 border-b border-zinc-100 dark:border-zinc-800">
          <h2 className="text-base font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
            <Tag className="w-4 h-4" />
            {category ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
          </h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300">
            <X className="w-4 h-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
              Nom de la catégorie *
            </label>
            <input
              type="text"
              autoFocus
              value={label}
              onChange={(e) => { setLabel(e.target.value); setError(''); }}
              placeholder="Ex: Encaissement client"
              className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white transition-shadow"
            />
          </div>
          
          <div>
            <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
              Type (Optionnel)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setKind(kind === 'encaissement' ? undefined : 'encaissement')}
                className={`flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all border ${
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
                onClick={() => setKind(kind === 'decaissement' ? undefined : 'decaissement')}
                className={`flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all border ${
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

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
              Montant par défaut (Optionnel)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={defaultAmount}
              onChange={(e) => { setDefaultAmount(e.target.value); setError(''); }}
              placeholder="Ex: 3400.00"
              className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white transition-shadow font-mono"
            />
          </div>
          {error && (
            <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2 flex items-center gap-2">
              <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
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
              {category ? 'Enregistrer' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Delete Confirm Dialog ─────────────────────────────────────
function DeleteConfirmDialog({
  category,
  affectedCount,
  onConfirm,
  onClose,
}: {
  category: OperationType;
  affectedCount: number;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-sm bg-white dark:bg-zinc-900 rounded-xl shadow-2xl border border-zinc-200 dark:border-zinc-800 animate-scale-in">
        <div className="p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
            </div>
            <div>
              <h3 className="font-semibold text-zinc-900 dark:text-white">Supprimer la catégorie</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">&ldquo;{category.label}&rdquo;</p>
            </div>
          </div>
          {affectedCount > 0 && (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg px-3 py-2 mb-4">
              <p className="text-xs text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                {affectedCount} opération{affectedCount > 1 ? 's' : ''} utilisent cette catégorie.
                Elles ne seront pas supprimées mais perdront leur catégorie.
              </p>
            </div>
          )}
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-4 py-2.5 rounded-lg bg-rose-600 text-white text-sm font-medium hover:bg-rose-700 transition-colors flex items-center justify-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Supprimer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Category Detail Panel ─────────────────────────────────────
function CategoryDetailPanel({
  category,
  onBack,
}: {
  category: OperationType;
  onBack: () => void;
}) {
  const { operations, months } = useStore();
  const monthMap = useMemo(
    () => new Map(months.map((m) => [m.id, m])),
    [months]
  );

  const catOps = useMemo(
    () =>
      operations
        .filter(
          (op) =>
            op.operationTypeId === category.id ||
            op.operationTypeLabel === category.label
        )
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [operations, category]
  );

  const totalEnc = catOps
    .filter((op) => op.kind === 'encaissement')
    .reduce((s, op) => s + op.amount, 0);
  const totalDec = catOps
    .filter((op) => op.kind === 'decaissement')
    .reduce((s, op) => s + op.amount, 0);

  return (
    <div className="animate-fade-in">
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white mb-4 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour aux catégories
      </button>

      {/* Category header */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 mb-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
            <Tag className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">{category.label}</h2>
            <p className="text-sm text-zinc-500">{catOps.length} opération{catOps.length > 1 ? 's' : ''}</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-zinc-50 dark:bg-zinc-800 rounded-lg p-3 text-center">
            <p className="text-xs text-zinc-400 mb-1">Total</p>
            <p className="text-sm font-bold font-mono tabular-nums text-zinc-900 dark:text-white">{catOps.length}</p>
          </div>
          <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-3 text-center">
            <p className="text-xs text-emerald-600 dark:text-emerald-400 mb-1 flex items-center justify-center gap-0.5">
              <TrendingUp className="w-3 h-3" /> Entrées
            </p>
            <p className="text-xs font-bold font-mono tabular-nums text-emerald-700 dark:text-emerald-300 truncate">{formatCurrency(totalEnc)}</p>
          </div>
          <div className="bg-rose-50 dark:bg-rose-900/20 rounded-lg p-3 text-center">
            <p className="text-xs text-rose-600 dark:text-rose-400 mb-1 flex items-center justify-center gap-0.5">
              <TrendingDown className="w-3 h-3" /> Sorties
            </p>
            <p className="text-xs font-bold font-mono tabular-nums text-rose-700 dark:text-rose-300 truncate">{formatCurrency(totalDec)}</p>
          </div>
        </div>
      </div>

      {/* Operations list */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-zinc-100 dark:border-zinc-800">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">Opérations liées</h3>
        </div>
        {catOps.length === 0 ? (
          <div className="text-center py-10 text-zinc-400">
            <CheckCircle2 className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">Aucune opération pour cette catégorie</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {catOps.map((op) => {
              const month = monthMap.get(op.monthId);
              const monthLabel = month
                ? `${MONTH_NAMES[month.month - 1].slice(0, 3)} ${month.year}`
                : '—';
              return (
                <div key={op.id} className="flex items-center justify-between px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                  <div className="flex-1 min-w-0 mr-3">
                    <p className="text-sm font-medium text-zinc-900 dark:text-white truncate">{op.label}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-zinc-400">{monthLabel}</span>
                      {op.notes && (
                        <span className="text-xs text-zinc-400 truncate max-w-[150px]">· {op.notes}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                      op.kind === 'encaissement'
                        ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                        : 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400'
                    }`}>
                      {op.kind === 'encaissement' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    </span>
                    <span className={`font-mono tabular-nums text-sm font-semibold ${
                      op.kind === 'encaissement' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                    }`}>
                      {op.kind === 'encaissement' ? '+' : '−'}{formatCurrency(op.amount)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ── CategoriesView ────────────────────────────────────────────
export default function CategoriesView() {
  const { operationTypes, operations } = useStore();
  const [search, setSearch] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [editingCat, setEditingCat] = useState<OperationType | undefined>();
  const [deletingCat, setDeletingCat] = useState<OperationType | undefined>();
  const [selectedCat, setSelectedCat] = useState<OperationType | undefined>();

  // Compute per-category stats
  const categoryStats = useMemo(() => {
    return operationTypes.map((ot) => {
      const ops = operations.filter(
        (op) => op.operationTypeId === ot.id || op.operationTypeLabel === ot.label
      );
      const totalEnc = ops
        .filter((op) => op.kind === 'encaissement')
        .reduce((s, op) => s + op.amount, 0);
      const totalDec = ops
        .filter((op) => op.kind === 'decaissement')
        .reduce((s, op) => s + op.amount, 0);
      return { ...ot, count: ops.length, totalEnc, totalDec, solde: totalEnc - totalDec };
    });
  }, [operationTypes, operations]);

  const filtered = categoryStats.filter((c) =>
    c.label.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = (cat: OperationType) => {
    // Remove the operation type from the store
    useStore.setState((state) => ({
      operationTypes: state.operationTypes.filter((ot) => ot.id !== cat.id),
      // Keep operations but clear their type reference
      operations: state.operations.map((op) =>
        op.operationTypeId === cat.id
          ? { ...op, operationTypeId: undefined, operationTypeLabel: 'Non catégorisé' }
          : op
      ),
    }));
    setDeletingCat(undefined);
  };

  // Show detail view
  if (selectedCat) {
    return (
      <CategoryDetailPanel category={selectedCat} onBack={() => setSelectedCat(undefined)} />
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <Tag className="w-6 h-6" />
            Catégories
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
            {operationTypes.length} catégorie{operationTypes.length > 1 ? 's' : ''} ·{' '}
            {operations.length} opération{operations.length > 1 ? 's' : ''} au total
          </p>
        </div>
        <button
          onClick={() => { setEditingCat(undefined); setShowDialog(true); }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-sm font-medium hover:bg-zinc-700 dark:hover:bg-zinc-100 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Nouvelle catégorie
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher une catégorie..."
          className="w-full pl-9 pr-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white transition-shadow"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3 top-2.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Categories list */}
      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto mb-4">
            <Tag className="w-7 h-7 text-zinc-400" />
          </div>
          <p className="font-medium text-zinc-600 dark:text-zinc-400">
            {search ? 'Aucun résultat' : 'Aucune catégorie'}
          </p>
          {!search && (
            <button
              onClick={() => setShowDialog(true)}
              className="mt-4 px-4 py-2 rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-sm font-medium hover:bg-zinc-700 dark:hover:bg-zinc-100 transition-colors"
            >
              Créer une catégorie
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-12 gap-2 px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-100 dark:border-zinc-800">
            <div className="col-span-5 sm:col-span-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Catégorie</div>
            <div className="col-span-2 hidden sm:block text-xs font-semibold text-zinc-400 uppercase tracking-wider">Type</div>
            <div className="col-span-2 hidden sm:block text-xs font-semibold text-zinc-400 uppercase tracking-wider text-right">Défaut</div>
            <div className="col-span-2 sm:col-span-1 text-xs font-semibold text-zinc-400 uppercase tracking-wider text-center">Ops</div>
            <div className="col-span-3 sm:col-span-2 text-xs font-semibold text-zinc-400 uppercase tracking-wider text-right">Total</div>
            <div className="col-span-2 sm:col-span-2 text-xs font-semibold text-zinc-400 uppercase tracking-wider text-right">Actions</div>
          </div>

          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {filtered.map((cat) => (
              <div
                key={cat.id}
                className="group grid grid-cols-12 gap-2 px-4 py-3.5 items-center hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors"
              >
                {/* Name */}
                <div className="col-span-5 sm:col-span-3 flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center flex-shrink-0 group-hover:bg-zinc-200 dark:group-hover:bg-zinc-700 transition-colors">
                    <Tag className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-medium text-zinc-900 dark:text-white truncate">
                      {cat.label}
                    </span>
                  </div>
                </div>

                {/* Type */}
                <div className="col-span-2 hidden sm:flex items-center">
                  {cat.kind ? (
                    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                      cat.kind === 'encaissement' 
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' 
                        : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
                    }`}>
                      {cat.kind === 'encaissement' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      <span className="truncate max-w-[80px]">{cat.kind === 'encaissement' ? 'Entrée' : 'Sortie'}</span>
                    </span>
                  ) : (
                    <span className="text-xs text-zinc-400">—</span>
                  )}
                </div>

                {/* Défaut */}
                <div className="col-span-2 hidden sm:block text-right">
                  <span className="text-xs font-mono tabular-nums text-zinc-600 dark:text-zinc-300">
                    {cat.defaultAmount !== undefined ? formatCurrency(cat.defaultAmount) : '—'}
                  </span>
                </div>

                {/* Count badge */}
                <div className="col-span-2 sm:col-span-1 flex justify-center">
                  <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full font-semibold ${
                    cat.count > 0
                      ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400'
                  }`}>
                    {cat.count}
                  </span>
                </div>

                {/* Total (Solde) */}
                <div className="col-span-3 sm:col-span-2 text-right">
                  {cat.solde !== 0 ? (
                    <span className={`text-xs font-mono tabular-nums font-medium ${
                      cat.solde > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                    }`}>
                      {cat.solde > 0 ? '+' : ''}{formatCurrency(cat.solde)}
                    </span>
                  ) : (
                    <span className="text-xs font-mono text-zinc-400">—</span>
                  )}
                </div>

                {/* Actions */}
                <div className="col-span-2 flex items-center justify-end gap-1">
                  <button
                    onClick={() => setSelectedCat(cat)}
                    title="Voir le détail"
                    className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => { setEditingCat(cat); setShowDialog(true); }}
                    title="Modifier"
                    className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeletingCat(cat)}
                    title="Supprimer"
                    className="p-1.5 rounded-md text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setSelectedCat(cat)}
                    className="hidden sm:flex items-center gap-1 ml-1 text-xs text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
                  >
                    Détail <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dialogs */}
      {showDialog && (
        <CategoryDialog
          category={editingCat}
          onClose={() => { setShowDialog(false); setEditingCat(undefined); }}
        />
      )}
      {deletingCat && (
        <DeleteConfirmDialog
          category={deletingCat}
          affectedCount={
            operations.filter(
              (op) => op.operationTypeId === deletingCat.id || op.operationTypeLabel === deletingCat.label
            ).length
          }
          onConfirm={() => handleDelete(deletingCat)}
          onClose={() => setDeletingCat(undefined)}
        />
      )}
    </div>
  );
}
