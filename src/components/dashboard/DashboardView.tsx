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
}: {
  title: string;
  value: string;
  sub?: string;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 hover:border-zinc-400 dark:hover:border-zinc-600 transition-all">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">{title}</p>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <p className="text-2xl font-bold font-mono tabular-nums text-zinc-900 dark:text-white">{value}</p>
      {sub && <p className="text-xs text-zinc-400 mt-1">{sub}</p>}
    </div>
  );
}

export default function DashboardView() {
  const { months, operations, operationTypes } = useStore();

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
    '#71717a', '#a1a1aa', '#d4d4d8', '#e4e4e7',
    '#52525b', '#3f3f46', '#27272a', '#18181b',
  ];

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Dashboard</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
          Vue globale de votre activité financière
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Solde global"
          value={formatCurrency(globalMetrics.soldeGlobal, true)}
          sub={`${months.length} mois`}
          icon={Wallet}
          color={globalMetrics.soldeGlobal >= 0
            ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
            : 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400'
          }
        />
        <KPICard
          title="Total encaissements"
          value={formatCurrency(globalMetrics.totalEncaissement)}
          sub="Toutes périodes"
          icon={TrendingUp}
          color="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
        />
        <KPICard
          title="Total décaissements"
          value={formatCurrency(globalMetrics.totalDecaissement)}
          sub="Toutes périodes"
          icon={TrendingDown}
          color="bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400"
        />
        <KPICard
          title="Opérations"
          value={globalMetrics.totalOps.toString()}
          sub={`${operationTypes.length} catégories`}
          icon={Activity}
          color="bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
        />
      </div>

      {/* Line chart */}
      {monthChartData.length > 0 ? (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-white mb-4">
            Encaissements vs Décaissements par mois
          </h2>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={monthChartData} margin={{ top: 4, right: 4, left: 4, bottom: 4 }}>
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
                name="Encaissements"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ r: 4, fill: '#10b981' }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="totalDecaissement"
                name="Décaissements"
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
          <p className="text-sm">Ajoutez des opérations pour voir les graphiques</p>
        </div>
      )}

      {/* Bar chart */}
      {typeChartData.length > 0 && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-white mb-4">
            Montants par catégorie d&apos;opération
          </h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={typeChartData} margin={{ top: 4, right: 4, left: 4, bottom: 4 }}>
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
              <Bar dataKey="totalAmount" name="Montant total" radius={[4, 4, 0, 0]}>
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
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-white">Récapitulatif par mois</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-100 dark:border-zinc-800">
                  <th className="text-left px-5 py-3 text-xs font-medium text-zinc-400 uppercase tracking-wider">Mois</th>
                  <th className="text-right px-5 py-3 text-xs font-medium text-zinc-400 uppercase tracking-wider">Encaissements</th>
                  <th className="text-right px-5 py-3 text-xs font-medium text-zinc-400 uppercase tracking-wider">Décaissements</th>
                  <th className="text-right px-5 py-3 text-xs font-medium text-zinc-400 uppercase tracking-wider">Solde</th>
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
        </div>
      )}
    </div>
  );
}
