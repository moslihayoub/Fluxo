'use client';

import { useState } from 'react';
import { Plus, Pencil, Trash2, Upload, Download, Bot, Filter, TrendingUp } from 'lucide-react';
import { useStore } from '@/store/useStore';
import {
  formatCurrency,
  getMonthLabel,
  exportCSV,
  computeMonthTotals,
  MONTH_NAMES,
} from '@/lib/utils';
import type { Operation } from '@/types';
import OperationDialog from './OperationDialog';
import ImportDialog from './ImportDialog';
import AgentDialog from '@/components/agent/AgentDialog';

// ── Operations Table ──────────────────────────────────────────
function OperationsTable({
  operations,
  monthId,
  onEdit,
  onDelete,
}: {
  operations: Operation[];
  monthId: string;
  onEdit: (op: Operation) => void;
  onDelete: (id: string) => void;
}) {
  if (operations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-20 px-4 text-zinc-400 dark:text-zinc-500 bg-zinc-50/50 dark:bg-zinc-900/50 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 m-4">
        <div className="w-12 h-12 mb-3 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
          <TrendingUp className="w-6 h-6 text-zinc-300 dark:text-zinc-600" />
        </div>
        <p className="text-sm font-semibold text-zinc-900 dark:text-white">Aucune opération pour ce mois</p>
        <p className="text-xs mt-1 max-w-[200px]">Commencez par ajouter une nouvelle opération ou importez votre relevé bancaire.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto -mx-1">
      <table className="w-full text-sm min-w-[500px]">
        <thead>
          <tr className="border-b border-zinc-100 dark:border-zinc-800">
            <th className="text-left px-2 py-2.5 text-xs font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Libellé</th>
            <th className="text-left px-2 py-2.5 text-xs font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wider hidden sm:table-cell">Catégorie</th>
            <th className="text-left px-2 py-2.5 text-xs font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Type</th>
            <th className="text-right px-2 py-2.5 text-xs font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Montant</th>
            <th className="text-right px-2 py-2.5 text-xs font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wider w-16">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
          {operations.map((op) => (
            <tr key={op.id} className="group hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
              <td className="px-2 py-3">
                <p className="font-medium text-zinc-900 dark:text-white text-sm truncate max-w-[160px]" title={op.label}>
                  {op.label}
                </p>
                {op.notes && <p className="text-xs text-zinc-400 truncate max-w-[160px]">{op.notes}</p>}
              </td>
              <td className="px-2 py-3 hidden sm:table-cell">
                <span className="text-xs text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full">
                  {op.operationTypeLabel}
                </span>
              </td>
              <td className="px-2 py-3">
                <span className={`inline-flex items-center text-xs px-2 py-0.5 rounded-full font-medium ${
                  op.kind === 'encaissement'
                    ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                    : 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400'
                }`}>
                  {op.kind === 'encaissement' ? '+' : '−'}
                </span>
              </td>
              <td className="px-2 py-3 text-right">
                <span className={`font-mono tabular-nums font-semibold text-sm ${
                  op.kind === 'encaissement'
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-rose-600 dark:text-rose-400'
                }`}>
                  {op.kind === 'encaissement' ? '+' : '−'}{formatCurrency(op.amount)}
                </span>
              </td>
              <td className="px-2 py-3 text-right">
                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => onEdit(op)}
                    className="p-1 rounded text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    title="Modifier"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDelete(op.id)}
                    className="p-1 rounded text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
                    title="Supprimer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── OperationsView ────────────────────────────────────────────
export default function OperationsView() {
  const {
    months,
    operations,
    activeMonthId,
    setActiveMonth,
    deleteOperation,
    filter,
    setFilter,
  } = useStore();

  const [showOpDialog, setShowOpDialog] = useState(false);
  const [editingOp, setEditingOp] = useState<Operation | undefined>();
  const [showImport, setShowImport] = useState(false);
  const [showAgent, setShowAgent] = useState(false);

  const activeMonths = months
    .filter((m) => m.status === 'active')
    .sort((a, b) => b.year - a.year || b.month - a.month);
  const archivedMonths = months
    .filter((m) => m.status === 'archived')
    .sort((a, b) => b.year - a.year || b.month - a.month);

  const currentMonth = months.find((m) => m.id === activeMonthId);
  const monthOps = operations
    .filter((op) => op.monthId === activeMonthId)
    .filter((op) => filter === 'all' || op.kind === filter)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const metrics = activeMonthId ? computeMonthTotals(operations, activeMonthId) : null;

  const handleEdit = (op: Operation) => {
    setEditingOp(op);
    setShowOpDialog(true);
  };

  const handleCloseOpDialog = () => {
    setShowOpDialog(false);
    setEditingOp(undefined);
  };

  const handleExportMonth = () => {
    if (!currentMonth) return;
    const ops = operations.filter((op) => op.monthId === activeMonthId);
    const monthLabel = `${MONTH_NAMES[currentMonth.month - 1]}-${currentMonth.year}`;
    exportCSV(ops, months, `encaissements-${monthLabel}.csv`);
  };

  const handleExportAll = () => {
    exportCSV(operations, months, 'encaissements-tous-les-mois.csv');
  };

  return (
    <div className="h-full">
      {/* Title */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Opérations</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
          Sélectionnez un mois pour gérer ses opérations
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        {/* ── Left: Month List ── */}
        <div className="w-full md:w-56 flex-shrink-0">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
            {months.length === 0 ? (
              <p className="text-sm text-zinc-400 p-4 text-center">Aucun mois disponible</p>
            ) : (
              <>
                {activeMonths.length > 0 && (
                  <div>
                    <p className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider px-3 pt-3 pb-1">
                      Actifs
                    </p>
                    {activeMonths.map((m) => {
                      const t = computeMonthTotals(operations, m.id);
                      return (
                        <button
                          key={m.id}
                          onClick={() => setActiveMonth(m.id)}
                          className={`w-full text-left px-3 py-2.5 flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors ${
                            activeMonthId === m.id
                              ? 'bg-zinc-100 dark:bg-zinc-800 border-l-2 border-zinc-900 dark:border-white'
                              : ''
                          }`}
                        >
                          <span className={`text-sm font-medium truncate ${
                            activeMonthId === m.id ? 'text-zinc-900 dark:text-white' : 'text-zinc-600 dark:text-zinc-400'
                          }`}>
                            {getMonthLabel(m)}
                          </span>
                          <span className={`text-[10px] font-mono tabular-nums ml-1 ${
                            t.solde >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'
                          }`}>
                            {t.solde >= 0 ? '+' : ''}{(t.solde / 1000).toFixed(1)}k
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
                {archivedMonths.length > 0 && (
                  <div className="border-t border-zinc-100 dark:border-zinc-800">
                    <p className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider px-3 pt-3 pb-1">
                      Archivés
                    </p>
                    {archivedMonths.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => setActiveMonth(m.id)}
                        className={`w-full text-left px-3 py-2.5 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors opacity-60 ${
                          activeMonthId === m.id ? 'bg-zinc-100 dark:bg-zinc-800 border-l-2 border-zinc-400' : ''
                        }`}
                      >
                        <span className="text-sm text-zinc-500 dark:text-zinc-500 truncate block">
                          {getMonthLabel(m)}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* ── Right: Operations Panel ── */}
        <div className="flex-1 min-w-0 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl">
          {!activeMonthId ? (
            <div className="flex flex-col items-center justify-center py-20 text-zinc-400 dark:text-zinc-600">
              <p className="text-sm font-medium">Sélectionnez un mois</p>
              <p className="text-xs mt-1">dans la liste à gauche</p>
            </div>
          ) : (
            <>
              {/* Toolbar */}
              <div className="p-4 border-b border-zinc-100 dark:border-zinc-800">
                <div className="flex flex-wrap items-center gap-2">
                  {/* Month title */}
                  <div className="flex-1 min-w-0">
                    <h2 className="text-sm font-semibold text-zinc-900 dark:text-white truncate">
                      {currentMonth ? getMonthLabel(currentMonth) : ''}
                    </h2>
                    {metrics && (
                      <p className="text-xs text-zinc-400 mt-0.5">
                        {metrics.count} opération{metrics.count > 1 ? 's' : ''} ·{' '}
                        Solde&nbsp;
                        <span className={`font-mono ${metrics.solde >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'}`}>
                          {formatCurrency(metrics.solde, true)}
                        </span>
                      </p>
                    )}
                  </div>

                  {/* Filter */}
                  <div className="flex rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-700 text-xs">
                    {(['all', 'encaissement', 'decaissement'] as const).map((f) => (
                      <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-2.5 py-1.5 font-medium transition-colors ${
                          filter === f
                            ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900'
                            : 'bg-white dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-700'
                        }`}
                      >
                        {f === 'all' ? 'Tout' : f === 'encaissement' ? 'Entrées' : 'Sorties'}
                      </button>
                    ))}
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setShowImport(true)}
                      title="Importer CSV"
                      className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white transition-colors"
                    >
                      <Upload className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={handleExportMonth}
                      title="Exporter ce mois (CSV)"
                      className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={handleExportAll}
                      title="Exporter tout (CSV)"
                      className="hidden sm:flex p-2 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white transition-colors text-xs items-center gap-1"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Tout
                    </button>
                    <button
                      disabled
                      title="Fonctionnalité d'intelligence artificielle disponible prochainement !"
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-zinc-200 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 text-xs font-medium cursor-not-allowed transition-all"
                    >
                      <Bot className="w-3.5 h-3.5 opacity-50" />
                      Agent
                    </button>
                    <button
                      onClick={() => setShowOpDialog(true)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-xs font-medium hover:bg-zinc-700 dark:hover:bg-zinc-100 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Ajouter
                    </button>
                  </div>
                </div>
              </div>

              {/* Table */}
              <div className="p-4">
                <OperationsTable
                  operations={monthOps}
                  monthId={activeMonthId}
                  onEdit={handleEdit}
                  onDelete={deleteOperation}
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Dialogs */}
      {showOpDialog && activeMonthId && (
        <OperationDialog
          operation={editingOp}
          monthId={activeMonthId}
          onClose={handleCloseOpDialog}
        />
      )}
      {showImport && activeMonthId && (
        <ImportDialog monthId={activeMonthId} onClose={() => setShowImport(false)} />
      )}
      {showAgent && activeMonthId && (
        <AgentDialog defaultMonthId={activeMonthId} onClose={() => setShowAgent(false)} />
      )}
    </div>
  );
}
