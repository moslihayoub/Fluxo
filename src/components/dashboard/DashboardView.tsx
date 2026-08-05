'use client';

import { useMemo } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from 'recharts';
import { useStore } from '@/store/useStore';
import { computeMonthTotals, formatCurrency, getMonthLabel, MONTH_NAMES } from '@/lib/utils';
import { TrendingUp, TrendingDown, Wallet, Activity } from 'lucide-react';
import type { MonthMetrics, TypeMetrics } from '@/types';
import { getTranslation } from '@/lib/i18n';

// Custom tooltip for dark mode
const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg p-3 shadow-xl text-xs">
      <p className="font-medium text-zinc-900 dark:text-white mb-2">{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center justify-between gap-4">
          <span style={{ color: p.color }}>{p.name}</span>
          <span className="font-mono font-semibold text-zinc-900 dark:text-white tabular-nums">
            {formatCurrency(p.value)}
          </span>
        </div>
      ))}
    </div>
  );
};

// KPI Card
function KPICard({
  title,
  value,
  sub,
  icon: Icon,
  color,
  valueColor,
}: {
  title: string;
  value: string;
  sub?: string;
  icon: React.ElementType;
  color: string;
  valueColor?: string;
}) {
  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 hover:border-zinc-400 dark:hover:border-zinc-600 transition-all">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">{title}</p>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <p className={`text-2xl font-bold font-mono tabular-nums ${valueColor || 'text-zinc-900 dark:text-white'}`}>{value}</p>
      {sub && <p className="text-xs text-zinc-400 mt-1">{sub}</p>}
    </div>
  );
}

export default function DashboardView() {
  const { months, operations, operationTypes, language } = useStore();
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(language, key);

  // Global metrics
  const globalMetrics = useMemo(() => {
    const allOps = operations;
    const totalEncaissement = allOps
      .filter((op) => op.kind === 'encaissement')
      .reduce((s, op) => s + op.amount, 0);
    const totalDecaissement = allOps
      .filter((op) => op.kind === 'decaissement')
      .reduce((s, op) => s + op.amount, 0);
    return {
      soldeGlobal: totalEncaissement - totalDecaissement,
      totalEncaissement,
      totalDecaissement,
      totalOps: allOps.length,
    };
  }, [operations]);

  // Per-month data for line chart (active months, sorted by date)
  const monthChartData = useMemo<MonthMetrics[]>(() => {
    return months
      .slice()
      .sort((a, b) => a.year - b.year || a.month - b.month)
      .map((m) => {
        const t = computeMonthTotals(operations, m.id);
        return {
          monthId: m.id,
          monthLabel: `${MONTH_NAMES[m.month - 1].slice(0, 3)} ${m.year}`,
          totalEncaissement: t.totalEncaissement,
          totalDecaissement: t.totalDecaissement,
          solde: t.solde,
        };
      });
  }, [months, operations]);

  // Per-type data for bar chart
  const typeChartData = useMemo<TypeMetrics[]>(() => {
    const map = new Map<string, TypeMetrics>();
    for (const op of operations) {
      const key = op.operationTypeLabel;
      if (!map.has(key)) {
        map.set(key, { label: key, totalAmount: 0, count: 0 });
      }
      const entry = map.get(key)!;
      entry.totalAmount += op.amount;
      entry.count++;
    }
    return Array.from(map.values())
      .sort((a, b) => b.totalAmount - a.totalAmount)
      .slice(0, 8);
  }, [operations]);

  const CHART_COLORS = [
    '#3b82f6', '#10b981', '#f59e0b', '#ef4444',
    '#8b5cf6', '#ec4899', '#14b8a6', '#f97316',
  ];

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">{t('dash.title')}</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
          {t('dash.subtitle')}
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title={t('dash.balance')}
          value={formatCurrency(globalMetrics.soldeGlobal, true)}
          sub={`${months.length} ${t('dash.months')}`}
          icon={Wallet}
          color={globalMetrics.soldeGlobal >= 0
            ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
            : 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400'
          }
        />
        <KPICard
          title={t('dash.totalIncomes')}
          value={formatCurrency(globalMetrics.totalEncaissement)}
          sub={t('dash.allPeriods')}
          icon={TrendingUp}
          color="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
          valueColor="text-emerald-600 dark:text-emerald-400"
        />
        <KPICard
          title={t('dash.totalExpenses')}
          value={formatCurrency(globalMetrics.totalDecaissement)}
          sub={t('dash.allPeriods')}
          icon={TrendingDown}
          color="bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400"
          valueColor="text-rose-600 dark:text-rose-400"
        />
        <KPICard
          title={t('dash.opsCount')}
          value={globalMetrics.totalOps.toString()}
          sub={`${operationTypes.length} ${t('dash.categories')}`}
          icon={Activity}
          color="bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400"
          valueColor="text-sky-600 dark:text-sky-400"
        />
      </div>

      {/* Line chart */}
      {monthChartData.length > 0 ? (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 sm:p-6">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-white mb-4">
            {t('dash.chartTitle')}
          </h2>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={monthChartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="monthLabel" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                formatter={(val) => (
                  <span className="text-xs text-zinc-600 dark:text-zinc-400">{val}</span>
                )}
              />
              <Line
                type="monotone"
                dataKey="totalEncaissement"
                name={t('common.incomes')}
                stroke="#10b981"
                strokeWidth={2}
                dot={{ r: 4, fill: '#10b981' }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="totalDecaissement"
                name={t('common.expenses')}
                stroke="#f43f5e"
                strokeWidth={2}
                dot={{ r: 4, fill: '#f43f5e' }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-8 text-center text-zinc-400">
          <p className="text-sm">{t('dash.chartEmpty')}</p>
        </div>
      )}

      {/* Bar chart */}
      {typeChartData.length > 0 && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 sm:p-6">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-white mb-4">
            {t('dash.catChartTitle')}
          </h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={typeChartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                interval={0}
                angle={-20}
                textAnchor="end"
                height={50}
              />
              <YAxis
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="totalAmount" name={t('common.total')} radius={[4, 4, 0, 0]}>
                {typeChartData.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Detail table per month */}
      {monthChartData.length > 0 && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-white">{t('dash.recapTitle')}</h2>
          </div>
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-100 dark:border-zinc-800">
                  <th className="text-left px-5 py-3 text-xs font-medium text-zinc-400 uppercase tracking-wider">{t('periods.selectMonth')}</th>
                  <th className="text-right px-5 py-3 text-xs font-medium text-zinc-400 uppercase tracking-wider">{t('common.incomes')}</th>
                  <th className="text-right px-5 py-3 text-xs font-medium text-zinc-400 uppercase tracking-wider">{t('common.expenses')}</th>
                  <th className="text-right px-5 py-3 text-xs font-medium text-zinc-400 uppercase tracking-wider">{t('common.total')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {[...monthChartData].reverse().map((m) => (
                  <tr key={m.monthId} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                    <td className="px-5 py-3 font-medium text-zinc-900 dark:text-white">{m.monthLabel}</td>
                    <td className="px-5 py-3 text-right font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(m.totalEncaissement)}
                    </td>
                    <td className="px-5 py-3 text-right font-mono tabular-nums text-rose-600 dark:text-rose-400">
                      {formatCurrency(m.totalDecaissement)}
                    </td>
                    <td className={`px-5 py-3 text-right font-mono tabular-nums font-semibold ${
                      m.solde >= 0 ? 'text-zinc-900 dark:text-white' : 'text-rose-600 dark:text-rose-400'
                    }`}>
                      {formatCurrency(m.solde, true)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile List */}
          <div className="sm:hidden divide-y divide-zinc-100 dark:divide-zinc-800">
            {[...monthChartData].reverse().map((m) => (
              <div key={m.monthId} className="p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-zinc-900 dark:text-white">{m.monthLabel}</span>
                  <span className={`font-mono tabular-nums font-bold ${
                    m.solde >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                  }`}>
                    {formatCurrency(m.solde, true)}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                  <div className="bg-emerald-50 dark:bg-emerald-900/20 p-2.5 rounded-lg border border-emerald-100 dark:border-emerald-900/30">
                    <div className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mb-1">
                      <TrendingUp className="w-3.5 h-3.5" /> {t('common.incomes')}
                    </div>
                    <div className="font-mono tabular-nums font-semibold text-emerald-700 dark:text-emerald-300">
                      {formatCurrency(m.totalEncaissement)}
                    </div>
                  </div>
                  <div className="bg-rose-50 dark:bg-rose-900/20 p-2.5 rounded-lg border border-rose-100 dark:border-rose-900/30">
                    <div className="text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1 mb-1">
                      <TrendingDown className="w-3.5 h-3.5" /> {t('common.expenses')}
                    </div>
                    <div className="font-mono tabular-nums font-semibold text-rose-700 dark:text-rose-300">
                      {formatCurrency(m.totalDecaissement)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
