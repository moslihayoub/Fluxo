'use client';

import { useStore } from '@/store/useStore';
import { formatCurrency, computeMonthTotals, getMonthLabel } from '@/lib/utils';
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';

import { getTranslation } from '@/lib/i18n';

export default function MetricsBar() {
  const { operations, months, activeMonthId, language } = useStore();
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(language, key);

  const activeMonth = months.find((m) => m.id === activeMonthId);
  const metrics = activeMonthId
    ? computeMonthTotals(operations, activeMonthId)
    : { totalEncaissement: 0, totalDecaissement: 0, solde: 0 };

  const label = activeMonth ? getMonthLabel(activeMonth, language) : t('common.noPeriodSelected');

  return (
    <div className="fixed top-0 sm:top-auto sm:bottom-0 left-0 right-0 z-40 border-b sm:border-b-0 sm:border-t border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 py-2">
        <div className="flex items-center justify-between">
          {/* Month label */}
          <p className="text-xs text-zinc-400 dark:text-zinc-500 font-medium hidden sm:block truncate max-w-[120px]">
            {label}
          </p>

          {/* Metrics */}
          <div className="flex gap-4 sm:gap-6 overflow-x-auto no-scrollbar pb-1 sm:pb-0 -mb-1 sm:mb-0">
            <div className="flex flex-col min-w-max">
              <span className="text-xs sm:text-sm font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-0.5 sm:mb-1">
                {t('common.incomes')}
              </span>
              <span className="flex items-center gap-1 sm:gap-1.5 text-sm sm:text-base font-mono font-bold text-emerald-600 dark:text-emerald-400">
                <TrendingUp className="w-4 h-4" />
                +{formatCurrency(metrics.totalEncaissement)}
              </span>
            </div>

            <div className="w-px h-6 sm:h-8 bg-zinc-200 dark:bg-zinc-800 self-center shrink-0" />

            <div className="flex flex-col min-w-max">
              <span className="text-xs sm:text-sm font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-0.5 sm:mb-1">
                {t('common.expenses')}
              </span>
              <span className="flex items-center gap-1 sm:gap-1.5 text-sm sm:text-base font-mono font-bold text-rose-600 dark:text-rose-500">
                <TrendingDown className="w-4 h-4" />
                −{formatCurrency(metrics.totalDecaissement)}
              </span>
            </div>

            <div className="w-px h-6 sm:h-8 bg-zinc-200 dark:bg-zinc-800 self-center shrink-0" />

            <div className="flex flex-col min-w-max">
              <span className="text-xs sm:text-sm font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider flex items-center gap-1 mb-0.5 sm:mb-1">
                <Wallet className="w-4 h-4" />
                {t('common.netBalance')}
              </span>
              <span className={`text-sm sm:text-base font-mono font-bold ${
                metrics.solde >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-500'
              }`}>
                {metrics.solde >= 0 ? '+' : '−'}{formatCurrency(Math.abs(metrics.solde))}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
