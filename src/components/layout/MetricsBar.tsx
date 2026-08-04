'use client';

import { useStore } from '@/store/useStore';
import { formatCurrency, computeMonthTotals, getMonthLabel } from '@/lib/utils';
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';

export default function MetricsBar() {
  const { operations, months, activeMonthId } = useStore();

  const activeMonth = months.find((m) => m.id === activeMonthId);
  const metrics = activeMonthId
    ? computeMonthTotals(operations, activeMonthId)
    : { totalEncaissement: 0, totalDecaissement: 0, solde: 0 };

  const label = activeMonth ? getMonthLabel(activeMonth) : 'Aucun mois sélectionné';

  return (
    <div className="fixed top-0 sm:top-auto sm:bottom-0 left-0 right-0 z-40 border-b sm:border-b-0 sm:border-t border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 py-2">
        <div className="flex items-center justify-between">
          {/* Month label */}
          <p className="text-xs text-zinc-400 dark:text-zinc-500 font-medium hidden sm:block truncate max-w-[120px]">
            {label}
          </p>

          {/* Metrics */}
          <div className="flex items-center gap-2 sm:gap-4 flex-1 sm:flex-none justify-around sm:justify-end">
            {/* Encaissements */}
            <div className="flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
              <div>
                <p className="text-[10px] text-zinc-400 dark:text-zinc-500 leading-none">Encaissements</p>
                <p className="text-sm font-mono font-semibold text-emerald-600 dark:text-emerald-400 leading-tight tabular-nums">
                  {formatCurrency(metrics.totalEncaissement)}
                </p>
              </div>
            </div>

            <div className="w-px h-6 bg-zinc-200 dark:bg-zinc-800" />

            {/* Décaissements */}
            <div className="flex items-center gap-1.5">
              <TrendingDown className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />
              <div>
                <p className="text-[10px] text-zinc-400 dark:text-zinc-500 leading-none">Décaissements</p>
                <p className="text-sm font-mono font-semibold text-rose-600 dark:text-rose-400 leading-tight tabular-nums">
                  {formatCurrency(metrics.totalDecaissement)}
                </p>
              </div>
            </div>

            <div className="w-px h-6 bg-zinc-200 dark:bg-zinc-800" />

            {/* Solde */}
            <div className="flex items-center gap-1.5">
              <Wallet className="w-3.5 h-3.5 text-zinc-500 flex-shrink-0" />
              <div>
                <p className="text-[10px] text-zinc-400 dark:text-zinc-500 leading-none">Solde</p>
                <p
                  className={`text-sm font-mono font-bold leading-tight tabular-nums ${
                    metrics.solde >= 0
                      ? 'text-zinc-900 dark:text-white'
                      : 'text-rose-600 dark:text-rose-400'
                  }`}
                >
                  {formatCurrency(metrics.solde, true)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
