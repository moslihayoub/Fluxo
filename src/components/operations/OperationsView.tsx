'use client';

import { useState, useMemo } from 'react';
import { Plus, Pencil, Trash2, Upload, Download, Bot, Filter, TrendingUp, TrendingDown, MoreHorizontal, Eye } from 'lucide-react';
import { useStore } from '@/store/useStore';
import {
  formatCurrency,
  getMonthLabel,
  exportCSV,
  computeMonthTotals,
  MONTH_NAMES,
  generateId,
  fromCents,
} from '@/lib/utils';
import type { Operation } from '@/types';
import OperationDialog from './OperationDialog';
import ImportDialog from './ImportDialog';
import AgentDialog from '@/components/agent/AgentDialog';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { getTranslation } from '@/lib/i18n';
import { ScrollReveal } from '@/components/ui/Animation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"

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
  const language = useStore((s) => s.language);
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(language, key);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [opToDelete, setOpToDelete] = useState<string | null>(null);

  if (operations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-20 px-4 text-zinc-400 dark:text-zinc-500 bg-zinc-50/50 dark:bg-zinc-900/50 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 m-4">
        <div className="w-12 h-12 mb-3 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
          <TrendingUp className="w-6 h-6 text-zinc-300 dark:text-zinc-600" />
        </div>
        <p className="text-sm font-semibold text-zinc-900 dark:text-white">{t('ops.emptyMonth')}</p>
        <p className="text-xs mt-1 max-w-[200px]">{t('ops.emptyMonthSub')}</p>
      </div>
    );
  }

  return (
    <div className="-mx-1 sm:mx-0">
      {/* ── DESKTOP TABLE ── */}
      <div className="hidden sm:block overflow-x-auto rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('ops.label')}</TableHead>
              <TableHead>{t('common.category')}</TableHead>
              <TableHead>{t('common.type')}</TableHead>
              <TableHead className="text-right">{t('common.amount')}</TableHead>
              <TableHead className="text-right w-16">{t('common.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {operations.map((op) => (
              <TableRow key={op.id} className="group cursor-default">
                <TableCell className="font-medium">
                  <p className="truncate max-w-[160px]" title={op.label}>
                    {op.label}
                  </p>
                  {op.notes && <p className="text-xs text-zinc-500 truncate max-w-[160px]">{op.notes}</p>}
                </TableCell>
                <TableCell>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full">
                    {op.operationTypeLabel}
                  </span>
                </TableCell>
                <TableCell>
                  <span className={`inline-flex items-center text-xs px-2 py-0.5 rounded-full font-medium ${
                    op.kind === 'encaissement'
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                      : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
                  }`}>
                    {op.kind === 'encaissement' ? '+' : '−'}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <span className={`font-mono tabular-nums font-semibold text-sm ${
                    op.kind === 'encaissement'
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-rose-600 dark:text-rose-400'
                  }`}>
                    {op.kind === 'encaissement' ? '+' : '−'}{formatCurrency(op.amount_cents || 0)}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  {!(op as any).isVirtual && (
                    <DropdownMenu>
                      <DropdownMenuTrigger className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800 focus:outline-none">
                        <MoreHorizontal className="w-4 h-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(op)}>
                          <Eye className="w-4 h-4 mr-2" />
                          {t('common.details')}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEdit(op)}>
                          <Pencil className="w-4 h-4 mr-2" />
                          {t('common.edit')}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => setOpToDelete(op.id)} className="text-rose-600 focus:bg-rose-50 focus:text-rose-600 dark:focus:bg-rose-900/20 dark:focus:text-rose-400">
                          <Trash2 className="w-4 h-4 mr-2" />
                          {t('common.delete')}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* ── MOBILE LIST ── */}
      <div className="sm:hidden flex flex-col gap-3 p-2">
        {operations.map((op) => (
          <Card key={op.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex flex-col min-w-0">
                  <p className="font-semibold text-sm truncate">{op.label}</p>
                  {op.notes && <p className="text-xs text-zinc-500 truncate mt-0.5">{op.notes}</p>}
                </div>
                <div className="relative ml-2 shrink-0">
                  {!(op as any).isVirtual && (
                    <DropdownMenu>
                      <DropdownMenuTrigger className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800 focus:outline-none">
                        <MoreHorizontal className="w-4 h-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(op)}>
                        <Eye className="w-4 h-4 mr-2" />
                        {t('common.details')}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onEdit(op)}>
                        <Pencil className="w-4 h-4 mr-2" />
                        {t('common.edit')}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => setOpToDelete(op.id)} className="text-rose-600 focus:bg-rose-50 focus:text-rose-600 dark:focus:bg-rose-900/20 dark:focus:text-rose-400">
                        <Trash2 className="w-4 h-4 mr-2" />
                        {t('common.delete')}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  )}
                </div>
              </div>
              
              <div className="flex items-center justify-between mt-3">
                <span className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800/50 px-2 py-1 rounded-md uppercase tracking-wider truncate max-w-[120px]">
                  {op.operationTypeLabel}
                </span>
                
                <span className={`font-mono tabular-nums font-bold text-sm ${
                  op.kind === 'encaissement'
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-rose-600 dark:text-rose-400'
                }`}>
                  {op.kind === 'encaissement' ? '+' : '−'}{formatCurrency(op.amount_cents || 0)}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <ConfirmDialog
        isOpen={!!opToDelete}
        title={t('common.delete')}
        description={t('ops.confirmDelete')}
        onConfirm={() => {
          if (opToDelete) onDelete(opToDelete);
        }}
        onCancel={() => setOpToDelete(null)}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
      />
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
    deleteMonth,
    filter,
    setFilter,
    workspaceMode,
    linkProGainsToPerso,
    businessOrders,
    language,
  } = useStore();
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(language, key);

  const [showOpDialog, setShowOpDialog] = useState(false);
  const [editingOp, setEditingOp] = useState<Operation | undefined>();
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isAgentOpen, setIsAgentOpen] = useState(false);
  const [monthToDelete, setMonthToDelete] = useState<string | null>(null);

  const activeMonths = months
    .filter((m) => m.status === 'active')
    .sort((a, b) => b.year - a.year || b.month - a.month);
  const archivedMonths = months
    .filter((m) => m.status === 'archived')
    .sort((a, b) => b.year - a.year || b.month - a.month);

  const currentMonth = months.find((m) => m.id === activeMonthId);
  
  const currentOperations = useMemo(() => {
    return operations.filter((op) => 
      workspaceMode === 'business' 
        ? op.workspaceMode === 'business' 
        : (op.workspaceMode === 'personal' || !op.workspaceMode)
    );
  }, [operations, workspaceMode]);

  const monthOps = currentOperations
    .filter((op) => op.monthId === activeMonthId)
    .filter((op) => filter === 'all' || op.kind === filter)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const metrics = activeMonthId ? computeMonthTotals(currentOperations, activeMonthId) : null;

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
    const ops = currentOperations.filter((op) => op.monthId === activeMonthId);
    const monthLabel = `${MONTH_NAMES[currentMonth.month - 1]}-${currentMonth.year}`;
    exportCSV(ops, months, `encaissements-${monthLabel}.csv`);
  };

  const [showMobileActions, setShowMobileActions] = useState(false);

  return (
    <ScrollReveal className="h-full">
      {/* Title */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">{t('ops.title')}</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
          {t('ops.subtitle')}
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        {/* ── Left: Month List ── */}
        <div className="w-full md:w-56 flex-shrink-0">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
            {months.length === 0 ? (
              <p className="text-sm text-zinc-400 p-4 text-center">{t('ops.noMonths')}</p>
            ) : (
              <>
                {activeMonths.length > 0 && (
                  <div>
                    <p className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider px-3 pt-3 pb-1">
                      {t('periods.active')}
                    </p>
                    {activeMonths.map((m) => {
                      const t = computeMonthTotals(currentOperations, m.id);
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
                          <span className={`text-base sm:text-sm font-medium truncate ${
                            activeMonthId === m.id ? 'text-zinc-900 dark:text-white' : 'text-zinc-600 dark:text-zinc-400'
                          }`}>
                            {getMonthLabel(m)}
                          </span>
                          <span className={`text-xs sm:text-[10px] font-mono tabular-nums ml-1 ${
                            t.solde >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'
                          }`}>
                            {t.solde >= 0 ? '+' : ''}{(fromCents(t.solde) / 1000).toFixed(1)}k
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
                {archivedMonths.length > 0 && (
                  <div className="border-t border-zinc-100 dark:border-zinc-800">
                    <p className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider px-3 pt-3 pb-1">
                      {t('periods.archived')}
                    </p>
                    {archivedMonths.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => setActiveMonth(m.id)}
                        className={`w-full text-left px-3 py-2.5 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors opacity-60 ${
                          activeMonthId === m.id ? 'bg-zinc-100 dark:bg-zinc-800 border-l-2 border-zinc-400' : ''
                        }`}
                      >
                        <span className="text-base sm:text-sm text-zinc-500 dark:text-zinc-500 truncate block">
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
              <p className="text-sm font-medium">{t('ops.selectMonth')}</p>
              <p className="text-xs mt-1">{t('ops.selectMonthSub')}</p>
            </div>
          ) : (
            <>
              {/* Toolbar */}
              <div className="p-4 border-b border-zinc-100 dark:border-zinc-800">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-2">
                  {/* Mobile Layout: Title -> Filters -> Info */}
                  <div className="flex-1 min-w-0 flex flex-col gap-3 sm:gap-0">
                    <h2 className="text-base sm:text-sm font-semibold text-zinc-900 dark:text-white truncate">
                      {currentMonth ? getMonthLabel(currentMonth) : ''}
                    </h2>
                    
                    {/* Filter (Mobile) with action button */}
                    <div className="flex sm:hidden gap-2 w-full">
                      {metrics && metrics.count > 0 && (
                        <div className="flex flex-1 rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-700 text-xs">
                          {(['all', 'encaissement', 'decaissement'] as const).map((f) => (
                            <button
                              key={`mobile-${f}`}
                              onClick={() => setFilter(f)}
                              className={`px-2 py-2 font-medium transition-colors flex-1 text-center ${
                                filter === f
                                  ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900'
                                  : 'bg-white dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-700'
                              }`}
                            >
                              {f === 'all' ? t('common.all') : f === 'encaissement' ? t('common.incomes') : t('common.expenses')}
                            </button>
                          ))}
                        </div>
                      )}
                      <button
                        onClick={() => setShowMobileActions(true)}
                        className={`p-2 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors flex-shrink-0 ${!(metrics && metrics.count > 0) ? 'ml-auto' : ''}`}
                      >
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                    </div>

                    {metrics && (
                      <p className="text-xs text-zinc-400 sm:mt-0.5">
                        {metrics.count} opération{metrics.count > 1 ? 's' : ''} ·{' '}
                        Solde&nbsp;
                        <span className={`font-mono ${metrics.solde >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'}`}>
                          {formatCurrency(metrics.solde, true)}
                        </span>
                      </p>
                    )}
                  </div>

                  {/* Filter (Desktop) */}
                  {metrics && metrics.count > 0 && (
                    <div className="hidden sm:flex rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-700 text-xs">
                      {(['all', 'encaissement', 'decaissement'] as const).map((f) => (
                        <button
                          key={`desktop-${f}`}
                          onClick={() => setFilter(f)}
                          className={`px-2.5 py-1.5 font-medium transition-colors ${
                            filter === f
                              ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900'
                              : 'bg-white dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-700'
                          }`}
                        >
                          {f === 'all' ? t('common.all') : f === 'encaissement' ? t('common.incomes') : t('common.expenses')}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setIsImportOpen(true)}
                      title={t('common.import')}
                      className="hidden sm:flex p-2 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white transition-colors"
                    >
                      <Upload className="w-3.5 h-3.5" />
                    </button>
                    {metrics && metrics.count > 0 && (
                      <>
                        <button
                          onClick={handleExportMonth}
                          title={t('ops.exportMonth')}
                          className="hidden sm:flex p-2 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white transition-colors text-xs items-center gap-1"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            const ops = currentOperations.filter(op => op.monthId === activeMonthId);
                            if (ops.length === 0) {
                              deleteMonth(activeMonthId!);
                            } else {
                              setMonthToDelete(activeMonthId);
                            }
                          }}
                          title={t('common.delete')}
                          className="hidden sm:flex p-2 rounded-lg border border-zinc-200 dark:border-zinc-700 text-rose-500 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors text-xs items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                    <button
                      disabled
                      title="Fonctionnalité d'intelligence artificielle disponible prochainement !"
                      className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-lg bg-zinc-200 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 text-xs font-medium cursor-not-allowed transition-all"
                    >
                      <Bot className="w-3.5 h-3.5 opacity-50" />
                      Agent
                    </button>
                    <button
                      onClick={() => setShowOpDialog(true)}
                      data-testid="add-operation-btn"
                      className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-xs font-medium hover:bg-zinc-700 dark:hover:bg-zinc-100 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      {t('common.add')}
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

      {/* FAB for Mobile */}
      <button
        onClick={() => setShowOpDialog(true)}
        data-testid="add-operation-btn"
        aria-label="Ajouter une opération"
        className="sm:hidden fixed bottom-20 right-4 z-40 w-14 h-14 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Mobile Actions Drawer */}
      {showMobileActions && (
        <>
          <div className="fixed inset-0 z-40 bg-black/20 dark:bg-black/50 backdrop-blur-sm sm:hidden" onClick={() => setShowMobileActions(false)} />
          <div className="fixed bottom-0 left-0 right-0 w-full bg-white dark:bg-zinc-800 rounded-t-2xl shadow-[0_-8px_30px_rgba(0,0,0,0.12)] z-50 overflow-hidden pb-safe animate-in slide-in-from-bottom-full duration-200 sm:hidden">
            <div className="w-10 h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-full mx-auto my-3" />
            <div className="px-4 pb-2 text-sm font-semibold text-zinc-400">{t('common.actions')}</div>
            <button
              onClick={() => { setIsImportOpen(true); setShowMobileActions(false); }}
              className="w-full flex items-center gap-3 px-5 py-4 text-base text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
            >
              <Upload className="w-5 h-5" />
              Importer CSV
            </button>
            <button
              onClick={() => { handleExportMonth(); setShowMobileActions(false); }}
              className="w-full flex items-center gap-3 px-5 py-4 text-base text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
            >
              <Download className="w-5 h-5" />
              {t('ops.exportMonth')}
            </button>
            <button
              onClick={() => {
                if (activeMonthId) {
                  const ops = currentOperations.filter(op => op.monthId === activeMonthId);
                  if (ops.length === 0) {
                    deleteMonth(activeMonthId);
                  } else {
                    setMonthToDelete(activeMonthId);
                  }
                }
                setShowMobileActions(false);
              }}
              className="w-full flex items-center gap-3 px-5 py-4 text-base text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
            >
              <Trash2 className="w-5 h-5" />
              {t('common.delete')}
            </button>
          </div>
        </>
      )}

      {/* Dialogs */}
      {showOpDialog && activeMonthId && (
        <OperationDialog
          operation={editingOp}
          monthId={activeMonthId}
          onClose={handleCloseOpDialog}
        />
      )}
      {isImportOpen && activeMonthId && (
        <ImportDialog monthId={activeMonthId} onClose={() => setIsImportOpen(false)} />
      )}
      {isAgentOpen && activeMonthId && (
        <AgentDialog
          defaultMonthId={activeMonthId}
          onClose={() => setIsAgentOpen(false)}
        />
      )}

      <ConfirmDialog
        isOpen={!!monthToDelete}
        title={t('common.delete')}
        description={t('periods.confirmDelete')}
        onConfirm={() => {
          if (monthToDelete) deleteMonth(monthToDelete);
        }}
        onCancel={() => setMonthToDelete(null)}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
      />
    </ScrollReveal>
  );
}
