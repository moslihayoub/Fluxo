'use client';

import BusinessDashboard from './BusinessDashboard';

import { useMemo, useState } from 'react';
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
import { computeMonthTotals, formatCurrency, getMonthLabel, MONTH_NAMES, fromCents } from '@/lib/utils';
import { TrendingUp, TrendingDown, Wallet, Activity, ChevronDown, Check, X } from 'lucide-react';
import type { MonthMetrics, TypeMetrics } from '@/types';
import { getTranslation } from '@/lib/i18n';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/Select';
import PayPalSupportCard from '@/components/widgets/PayPalSupportCard';
import GuestWarningBanner from '@/components/widgets/GuestWarningBanner';
import { ScrollReveal } from '@/components/ui/Animation';

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
  const { months, operations: allOperations, operationTypes, language, businessOrders, businessClients, businessSuppliers, workspaceMode, linkProGainsToPerso } = useStore();
  
  const operations = useMemo(() => {
    let ops = allOperations.filter(op => 
      workspaceMode === 'business' 
        ? op.workspaceMode === 'business' 
        : (op.workspaceMode === 'personal' || !op.workspaceMode)
    );

    if (workspaceMode !== 'business' && linkProGainsToPerso) {
      months.forEach(m => {
        const proOps = allOperations.filter(op => op.workspaceMode === 'business' && op.monthId === m.id);
        const proIncomes = proOps.filter(o => o.kind === 'encaissement').reduce((acc, o) => acc + (o.amount_cents || 0), 0);
        const proExpenses = proOps.filter(o => o.kind === 'decaissement').reduce((acc, o) => acc + (o.amount_cents || 0), 0);
        
        let proSales = 0;
        let proCosts = 0;
        (businessOrders || []).forEach(o => {
          const d = new Date(o.date);
          if (d.getMonth() + 1 === m.month && d.getFullYear() === m.year) {
            proSales += o.amountTTC_cents || 0;
            const itemsCost = (o.items || []).reduce((acc, item) => acc + ((item.unitCostPrice_cents || 0) * (item.quantity || 1)), 0);
            const legacyCost = (o.unitCostPrice_cents || 0) * (o.quantity || 1);
            proCosts += (o.items && o.items.length > 0) ? itemsCost : legacyCost;
          }
        });

        const monthGains = (proIncomes + proSales) - (proExpenses + proCosts);

        if (monthGains > 0) {
          ops.push({
            id: `pro-gains-${m.id}`,
            monthId: m.id,
            label: 'Bénéfices Activité Pro',
            operationTypeLabel: 'Revenus Pro',
            kind: 'encaissement',
            amount_cents: monthGains,
            createdAt: new Date(m.year, m.month - 1, 28).toISOString(),
            updatedAt: new Date().toISOString(),
            userId: 'auto',
            workspaceMode: 'personal',
            notes: 'Généré automatiquement'
          });
        }
      });
    }

    return ops;
  }, [allOperations, workspaceMode, linkProGainsToPerso, months, businessOrders]);
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(language, key);
  
  const [timeRange, setTimeRange] = useState<'1m'|'3m'|'6m'|'12m'|'all'>('1m');
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  const timeRangeOptions = [
    { value: '1m', label: t('dash.filter1m') },
    { value: '3m', label: t('dash.filter3m') },
    { value: '6m', label: t('dash.filter6m') },
    { value: '12m', label: t('dash.filter12m') },
    { value: 'all', label: t('dash.allPeriods') },
  ] as const;

  const currentRangeLabel = timeRangeOptions.find(o => o.value === timeRange)?.label;

  const filteredMonths = useMemo(() => {
    const sorted = months.slice().sort((a, b) => b.year - a.year || b.month - a.month);
    if (timeRange === '1m') return sorted.slice(0, 1);
    if (timeRange === '3m') return sorted.slice(0, 3);
    if (timeRange === '6m') return sorted.slice(0, 6);
    if (timeRange === '12m') return sorted.slice(0, 12);
    return sorted;
  }, [months, timeRange]);

  const filteredMonthIds = useMemo(() => new Set(filteredMonths.map(m => m.id)), [filteredMonths]);

  const filteredOperations = useMemo(() => {
    return operations.filter(op => filteredMonthIds.has(op.monthId));
  }, [operations, filteredMonthIds]);

  // Global metrics
  const globalMetrics = useMemo(() => {
    const totalEncaissement_cents = filteredOperations
      .filter((op) => op.kind === 'encaissement')
      .reduce((s, op) => s + (op.amount_cents || 0), 0);
    const totalDecaissement_cents = filteredOperations
      .filter((op) => op.kind === 'decaissement')
      .reduce((s, op) => s + (op.amount_cents || 0), 0);
    return {
      soldeGlobal: fromCents(totalEncaissement_cents - totalDecaissement_cents),
      totalEncaissement: fromCents(totalEncaissement_cents),
      totalDecaissement: fromCents(totalDecaissement_cents),
      totalOps: filteredOperations.length,
    };
  }, [filteredOperations]);

  // Business metrics
  const businessMetrics = useMemo(() => {
    const filteredOrders = (businessOrders || []).filter(o => {
      return true;
    });
    
    let totalSales_cents = 0;
    let totalCosts_cents = 0;
    
    filteredOrders.forEach(o => {
      totalSales_cents += o.amountTTC_cents || 0;
      const itemsCost = (o.items || []).reduce((acc, item) => acc + ((item.unitCostPrice_cents || 0) * (item.quantity || 1)), 0);
      const legacyCost = (o.unitCostPrice_cents || 0) * (o.quantity || 1);
      totalCosts_cents += (o.items && o.items.length > 0) ? itemsCost : legacyCost;
    });

    return {
      totalSales: fromCents(totalSales_cents),
      totalCosts: fromCents(totalCosts_cents),
      clientsCount: (businessClients || []).length,
      suppliersCount: (businessSuppliers || []).length,
    };
  }, [businessOrders, businessClients, businessSuppliers]);

  // Per-month data for line chart (active months, sorted by date)
  const monthChartData = useMemo<MonthMetrics[]>(() => {
    return filteredMonths
      .slice()
      .sort((a, b) => a.year - b.year || a.month - b.month)
      .map((m) => {
        const t = computeMonthTotals(operations, m.id);
        return {
          monthId: m.id,
          monthLabel: `${MONTH_NAMES[m.month - 1].slice(0, 3)} ${m.year}`,
          totalEncaissement: fromCents(t.totalEncaissement),
          totalDecaissement: fromCents(t.totalDecaissement),
          solde: fromCents(t.solde),
        };
      });
  }, [filteredMonths, operations]);

  // Per-type data for bar chart
  const typeChartData = useMemo<TypeMetrics[]>(() => {
    const map = new Map<string, TypeMetrics>();
    for (const op of filteredOperations) {
      const key = op.operationTypeLabel;
      if (!map.has(key)) {
        map.set(key, { label: key, totalAmount: 0, count: 0 });
      }
      const entry = map.get(key)!;
      entry.totalAmount += fromCents(op.amount_cents) || 0;
      entry.count++;
    }
    return Array.from(map.values())
      .sort((a, b) => b.totalAmount - a.totalAmount)
      .slice(0, 8);
  }, [filteredOperations]);

  const CHART_COLORS = [
    '#3b82f6', '#10b981', '#f59e0b', '#ef4444',
    '#8b5cf6', '#ec4899', '#14b8a6', '#f97316',
  ];

  return (
    <div className="space-y-6">
      <GuestWarningBanner />

      {/* Title & Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">{t('dash.title')}</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
            {t('dash.subtitle')}
          </p>
        </div>
        
        {/* Desktop Shadcn Select */}
        <div className="hidden sm:block w-48">
          <Select
            value={timeRange}
            onValueChange={(val) => setTimeRange(val as any)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1m">{t('dash.filter1m')}</SelectItem>
              <SelectItem value="3m">{t('dash.filter3m')}</SelectItem>
              <SelectItem value="6m">{t('dash.filter6m')}</SelectItem>
              <SelectItem value="12m">{t('dash.filter12m')}</SelectItem>
              <SelectItem value="all">{t('dash.allPeriods')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Mobile Drawer Trigger */}
        <button
          onClick={() => setIsFilterDrawerOpen(true)}
          className="flex sm:hidden items-center gap-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm rounded-lg px-4 py-2.5 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors w-full justify-between"
        >
          <span className="font-medium">{currentRangeLabel}</span>
          <ChevronDown className="w-4 h-4 text-zinc-400" />
        </button>
      </div>

      {/* Filter Drawer / Modal (Mobile Only) */}
      {isFilterDrawerOpen && (
        <div className="fixed inset-0 z-50 flex sm:hidden items-center justify-center p-0 bg-zinc-900/60 backdrop-blur-sm">
          {/* Mobile Overlay to close */}
          <div className="absolute inset-0" onClick={() => setIsFilterDrawerOpen(false)} />
          
          <div className="relative bg-white dark:bg-zinc-900 w-full max-w-md sm:rounded-2xl rounded-t-2xl mt-auto sm:mt-0 max-h-[90vh] flex flex-col slide-in-from-bottom animate-in duration-300">
            {/* Handle for mobile */}
            <div className="w-12 h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full mx-auto my-3 sm:hidden" />
            
            <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Sélectionner la période</h2>
              <button 
                onClick={() => setIsFilterDrawerOpen(false)}
                className="p-2 -mr-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors hidden sm:block"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-2">
              {timeRangeOptions.map((option) => {
                const isActive = timeRange === option.value;
                return (
                  <button
                    key={option.value}
                    onClick={() => {
                      setTimeRange(option.value as any);
                      setIsFilterDrawerOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-left transition-colors ${
                      isActive 
                        ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400' 
                        : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
                    }`}
                  >
                    <span className={`text-base sm:text-sm ${isActive ? 'font-semibold' : 'font-medium'}`}>
                      {option.label}
                    </span>
                    {isActive && <Check className="w-5 h-5" />}
                  </button>
                );
              })}
            </div>
            {/* Safe area padding for mobile */}
            <div className="h-6 sm:hidden" />
          </div>
        </div>
      )}

      {workspaceMode === 'business' ? (
        <BusinessDashboard filteredMonths={filteredMonths} />
      ) : (
        <>
          {/* Operational KPI cards */}
          <ScrollReveal className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title={t('dash.balance')}
          value={formatCurrency(globalMetrics.soldeGlobal, true)}
          sub={timeRange === 'all' ? `${filteredMonths.length} ${t('dash.months')}` : (timeRange === '1m' ? t('dash.filter1m') : t(`dash.filter${timeRange}` as Parameters<typeof getTranslation>[1]))}
          icon={Wallet}
          color={globalMetrics.soldeGlobal >= 0
            ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
            : 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400'
          }
        />
        <KPICard
          title={t('dash.totalIncomes')}
          value={formatCurrency(globalMetrics.totalEncaissement)}
          sub={timeRange === 'all' ? t('dash.allPeriods') : (timeRange === '1m' ? t('dash.filter1m') : t(`dash.filter${timeRange}` as Parameters<typeof getTranslation>[1]))}
          icon={TrendingUp}
          color="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
          valueColor="text-emerald-600 dark:text-emerald-400"
        />
        <KPICard
          title={t('dash.totalExpenses')}
          value={formatCurrency(globalMetrics.totalDecaissement)}
          sub={timeRange === 'all' ? t('dash.allPeriods') : (timeRange === '1m' ? t('dash.filter1m') : t(`dash.filter${timeRange}` as Parameters<typeof getTranslation>[1]))}
          icon={TrendingDown}
          color="bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400"
          valueColor="text-rose-600 dark:text-rose-500"
        />
        <KPICard
          title={t('dash.opsCount')}
          value={globalMetrics.totalOps.toString()}
          sub={`${operationTypes.length} catégories`}
          icon={Activity}
          color="bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400"
          valueColor="text-sky-600 dark:text-sky-400"
        />
      </ScrollReveal>

      {/* Line chart */}
      <ScrollReveal delay={0.1} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 sm:p-6">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-white mb-4">
          {t('dash.chartTitle')}
        </h2>
        {monthChartData.length > 0 ? (
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
        ) : (
          <div className="flex items-center justify-center h-[240px] text-zinc-400 text-sm">
            {t('dash.chartEmpty')}
          </div>
        )}
      </ScrollReveal>

      {/* Bar chart */}
      <ScrollReveal delay={0.2} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 sm:p-6">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-white mb-4">
          {t('dash.catChartTitle')}
        </h2>
        {typeChartData.length > 0 ? (
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
        ) : (
          <div className="flex items-center justify-center h-[240px] text-zinc-400 text-sm">
            {t('dash.chartEmpty')}
          </div>
        )}
      </ScrollReveal>

      {/* Detail table per month */}
      {monthChartData.length > 0 && (
        <ScrollReveal delay={0.25} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
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
                      m.solde > 0 ? 'text-blue-600 dark:text-blue-400' : m.solde < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-zinc-900 dark:text-white'
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
                    m.solde > 0 ? 'text-blue-600 dark:text-blue-400' : m.solde < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-zinc-900 dark:text-white'
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
        </ScrollReveal>
      )}
        </>
      )}
      <PayPalSupportCard className="mt-8" />
    </div>
  );
}
