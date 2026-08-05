'use client';

import { useState, useEffect } from 'react';
import { Plus, Archive, RotateCcw, Eye, TrendingUp, TrendingDown, Trash2, Download, CheckSquare, Square } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { formatCurrency, computeMonthTotals, getMonthLabel, MONTH_NAMES, exportCSV } from '@/lib/utils';
import type { Month } from '@/types';
import { getTranslation } from '@/lib/i18n';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

// ── New Month Dialog ──────────────────────────────────────────
function NewMonthDialog({ onClose }: { onClose: () => void }) {
  const { addMonth } = useStore();
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const { language } = useStore();
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(language, key);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = addMonth(month, year);
    if (!result.success) {
      setError(result.error ?? t('common.error'));
    } else {
      onClose();
    }
  };

  const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 3 + i);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-sm bg-white dark:bg-zinc-900 rounded-xl shadow-2xl border border-zinc-200 dark:border-zinc-800 animate-scale-in">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">
            {t('periods.new')}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                {t('periods.month')}
              </label>
              <select
                value={month}
                onChange={(e) => { setMonth(+e.target.value); setError(''); }}
                className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white transition-shadow"
              >
                {MONTH_NAMES.map((name, i) => (
                  <option key={i} value={i + 1}>{name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                {t('periods.year')}
              </label>
              <select
                value={year}
                onChange={(e) => { setYear(+e.target.value); setError(''); }}
                className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white transition-shadow"
              >
                {years.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

            {error && (
              <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
              >
                {t('common.cancel')}
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-sm font-medium hover:bg-zinc-700 dark:hover:bg-zinc-100 transition-colors"
              >
                {t('common.add')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// ── Month Card ────────────────────────────────────────────────
function MonthCard({ month, isSelectionMode, isSelected, onSelect, onLongPress }: { month: Month, isSelectionMode: boolean, isSelected: boolean, onSelect: (id: string) => void, onLongPress: () => void }) {
  const { operations, archiveMonth, deleteMonth, restoreMonth, setActiveMonth, setActiveView, language } = useStore();
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(language, key);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const metrics = computeMonthTotals(operations, month.id);

  const handleViewOperations = () => {
    setActiveMonth(month.id);
    setActiveView('operations');
  };

  return (
    <>
    <div 
      className={`group bg-white dark:bg-zinc-900 border ${isSelected ? 'border-zinc-900 dark:border-white ring-1 ring-zinc-900 dark:ring-white' : 'border-zinc-200 dark:border-zinc-800'} rounded-xl p-5 hover:border-zinc-400 dark:hover:border-zinc-600 transition-all duration-200 hover:shadow-lg dark:hover:shadow-zinc-900/50 animate-slide-up relative cursor-pointer sm:cursor-auto`}
      onClick={(e) => {
        if (isSelectionMode) {
          e.preventDefault();
          onSelect(month.id);
        }
      }}
      onContextMenu={(e) => {
        // Prevent default context menu on long press/right click to start selection
        e.preventDefault();
        onLongPress();
      }}
      onTouchStart={() => {
        // Simple long press detection for mobile
        const timer = setTimeout(onLongPress, 500);
        (window as any).longPressTimer = timer;
      }}
      onTouchEnd={() => clearTimeout((window as any).longPressTimer)}
      onTouchMove={() => clearTimeout((window as any).longPressTimer)}
    >
      {/* Selection Overlay Checkbox (if in selection mode) */}
      {isSelectionMode && (
        <div className="absolute top-4 right-4 z-10" onClick={(e) => { e.stopPropagation(); onSelect(month.id); }}>
          {isSelected ? (
            <CheckSquare className="w-6 h-6 text-zinc-900 dark:text-white" />
          ) : (
            <Square className="w-6 h-6 text-zinc-400" />
          )}
        </div>
      )}

      {/* Header */}
      <div className={`flex items-start justify-between mb-4 ${isSelectionMode ? 'pr-8' : ''}`}>
        <div>
          <h3 className="font-semibold text-zinc-900 dark:text-white text-base">
            {getMonthLabel(month)}
          </h3>
          <span
            className={`inline-flex items-center text-xs px-2 py-0.5 rounded-full font-medium mt-1 ${
              month.status === 'active'
                ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'
            }`}
          >
            {month.status === 'active' ? t('periods.active') : t('periods.archived')}
          </span>
        </div>
        <div className="text-right">
          <p className={`text-lg font-bold tabular-nums font-mono ${
            metrics.solde >= 0
              ? 'text-zinc-900 dark:text-white'
              : 'text-red-600 dark:text-red-400'
          }`}>
            {formatCurrency(metrics.solde, true)}
          </p>
          <p className="text-xs text-zinc-400">{metrics.count} op{metrics.count > 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* Metrics row */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-2.5">
          <div className="flex items-center gap-1 mb-1">
            <TrendingUp className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">{t('common.incomes')}</span>
          </div>
          <p className="text-sm font-semibold font-mono tabular-nums text-emerald-700 dark:text-emerald-300">
            {formatCurrency(metrics.totalEncaissement)}
          </p>
        </div>
        <div className="bg-rose-50 dark:bg-rose-900/20 rounded-lg p-2.5">
          <div className="flex items-center gap-1 mb-1">
            <TrendingDown className="w-3 h-3 text-rose-600 dark:text-rose-400" />
            <span className="text-xs text-rose-600 dark:text-rose-400 font-medium">{t('common.expenses')}</span>
          </div>
          <p className="text-sm font-semibold font-mono tabular-nums text-rose-700 dark:text-rose-300">
            {formatCurrency(metrics.totalDecaissement)}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 relative z-10" onClick={e => isSelectionMode && e.stopPropagation()}>
        <button
          onClick={handleViewOperations}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-xs font-medium hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-colors"
        >
          <Eye className="w-3.5 h-3.5" />
          {t('menu.operations')}
        </button>
        {month.status === 'active' ? (
          <>
            <button
              onClick={() => archiveMonth(month.id)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 text-xs font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
              title={t('common.archive')}
            >
              <Archive className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                if (metrics.count === 0) {
                  deleteMonth(month.id);
                } else {
                  setShowDeleteConfirm(true);
                }
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-red-200 dark:border-red-900/50 text-red-500 dark:text-red-400 text-xs font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              title={t('common.delete')}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => restoreMonth(month.id)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 text-xs font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
              title={t('common.restore')}
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                if (metrics.count === 0) {
                  deleteMonth(month.id);
                } else {
                  setShowDeleteConfirm(true);
                }
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-red-200 dark:border-red-900/50 text-red-500 dark:text-red-400 text-xs font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              title={t('common.delete')}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </>
        )}
      </div>
    </div>

    {/* Delete Confirmation Dialog */}
    <ConfirmDialog
      isOpen={showDeleteConfirm}
      title={`${t('common.delete')} ${getMonthLabel(month)}?`}
      description={t('periods.deleteConfirm').replace('{month}', getMonthLabel(month))}
      onConfirm={() => deleteMonth(month.id)}
      onCancel={() => setShowDeleteConfirm(false)}
      confirmText={t('common.delete')}
      cancelText={t('common.cancel')}
    />
    </>
  );
}

// ── MonthsView ────────────────────────────────────────────────
export default function MonthsView() {
  const { months, operations, language } = useStore();
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(language, key);
  const [showDialog, setShowDialog] = useState(false);
  
  // Multi-selection state
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedMonthIds, setSelectedMonthIds] = useState<Set<string>>(new Set());
  const [showMultiDeleteConfirm, setShowMultiDeleteConfirm] = useState(false);

  const activeMonths = months
    .filter((m) => m.status === 'active')
    .sort((a, b) => b.year - a.year || b.month - a.month);
  const archivedMonths = months
    .filter((m) => m.status === 'archived')
    .sort((a, b) => b.year - a.year || b.month - a.month);

  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    setSelectedMonthIds(new Set());
  };

  const toggleMonthSelection = (id: string) => {
    const newSet = new Set(selectedMonthIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedMonthIds(newSet);
  };

  const handleExportSelected = () => {
    if (selectedMonthIds.size === 0) return;
    const opsToExport = operations.filter(op => selectedMonthIds.has(op.monthId));
    exportCSV(opsToExport, months, `export-operations-${selectedMonthIds.size}-mois.csv`);
    setIsSelectionMode(false);
    setSelectedMonthIds(new Set());
  };
  const handleDeleteSelected = () => {
    if (selectedMonthIds.size === 0) return;
    Array.from(selectedMonthIds).forEach((id) => useStore.getState().deleteMonth(id));
    setIsSelectionMode(false);
    setSelectedMonthIds(new Set());
    setShowMultiDeleteConfirm(false);
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">{t('menu.periods')}</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
            {activeMonths.length > 0 ? `${activeMonths.length} ` + t('periods.active') : ''}
            {archivedMonths.length > 0 && ` · ${archivedMonths.length} ` + t('periods.archived')}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {isSelectionMode ? (
            <>
              <button
                onClick={toggleSelectionMode}
                className="px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={() => setShowMultiDeleteConfirm(true)}
                disabled={selectedMonthIds.size === 0}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Trash2 className="w-4 h-4" />
                {t('common.delete')} ({selectedMonthIds.size})
              </button>
              <button
                onClick={handleExportSelected}
                disabled={selectedMonthIds.size === 0}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-4 h-4" />
                {t('ops.export')} ({selectedMonthIds.size})
              </button>
            </>
          ) : (
            <>
              <button
                onClick={toggleSelectionMode}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors shadow-sm"
              >
                <CheckSquare className="w-4 h-4" />
                {t('common.select')}
              </button>
              <button
                onClick={() => setShowDialog(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-sm font-medium hover:bg-zinc-700 dark:hover:bg-zinc-100 transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" />
                {t('periods.new')}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Active months */}
      {activeMonths.length === 0 && archivedMonths.length === 0 ? (
        <div className="text-center py-20 text-zinc-400 dark:text-zinc-600">
          <div className="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto mb-4">
            <Plus className="w-7 h-7" />
          </div>
          <p className="font-medium text-zinc-600 dark:text-zinc-400">{t('periods.emptyTitle')}</p>
          <p className="text-sm mt-1">{t('periods.emptyDesc')}</p>
          <button
            onClick={() => setShowDialog(true)}
            className="mt-4 px-4 py-2 rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-sm font-medium hover:bg-zinc-700 dark:hover:bg-zinc-100 transition-colors"
          >
            {t('periods.new')}
          </button>
        </div>
      ) : (
        <>
          {activeMonths.length > 0 && (
            <section>
              <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-3">
                {t('periods.active')}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeMonths.map((m) => (
                  <MonthCard 
                    key={m.id} 
                    month={m} 
                    isSelectionMode={isSelectionMode}
                    isSelected={selectedMonthIds.has(m.id)}
                    onSelect={toggleMonthSelection}
                    onLongPress={() => {
                      if (!isSelectionMode) {
                        setIsSelectionMode(true);
                        toggleMonthSelection(m.id);
                      }
                    }}
                  />
                ))}
              </div>
            </section>
          )}

          {archivedMonths.length > 0 && (
            <section>
              <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-3">
                {t('periods.archived')}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 opacity-75">
                {archivedMonths.map((m) => (
                  <MonthCard 
                    key={m.id} 
                    month={m}
                    isSelectionMode={isSelectionMode}
                    isSelected={selectedMonthIds.has(m.id)}
                    onSelect={toggleMonthSelection}
                    onLongPress={() => {
                      if (!isSelectionMode) {
                        setIsSelectionMode(true);
                        toggleMonthSelection(m.id);
                      }
                    }}
                  />
                ))}
              </div>
            </section>
          )}
        </>
      )}

      {showDialog && <NewMonthDialog onClose={() => setShowDialog(false)} />}
      
      {/* Multi-Delete Confirmation Dialog */}
      {showMultiDeleteConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowMultiDeleteConfirm(false)} />
          <div className="relative z-10 w-full max-w-sm bg-white dark:bg-zinc-900 rounded-xl shadow-2xl border border-zinc-200 dark:border-zinc-800 p-6 animate-scale-in">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">
              {t('common.delete')} {selectedMonthIds.size} {t('menu.periods')}?
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
              Toutes les opérations associées à ces {selectedMonthIds.size} périodes seront perdues. Cette action est irréversible.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowMultiDeleteConfirm(false)}
                className="flex-1 px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handleDeleteSelected}
                className="flex-1 px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors"
              >
                {t('common.delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
