'use client';

import React, { useMemo } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell
} from 'recharts';
import { useStore } from '@/store/useStore';
import { formatCurrency, getMonthLabel, MONTH_NAMES, fromCents } from '@/lib/utils';
import { TrendingUp, TrendingDown, Wallet, Activity, Users, ShoppingCart, Percent } from 'lucide-react';
import { getTranslation } from '@/lib/i18n';
import { KPICard, CustomTooltip } from './DashboardShared';

const CHART_COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444',
  '#8b5cf6', '#ec4899', '#14b8a6', '#f97316',
];

export default function BusinessDashboard({ 
  filteredMonths 
}: { 
  filteredMonths: any[] 
}) {
  const { language, businessOrders, businessFees, businessClients, businessSuppliers } = useStore();
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(language, key);

  // Filter orders and fees based on filteredMonths
  const filteredMonthIds = useMemo(() => new Set(filteredMonths.map(m => m.id)), [filteredMonths]);

  const monthOrders = useMemo(() => {
    return (businessOrders || []).filter(o => {
      const d = new Date(o.date);
      const monthId = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      return filteredMonthIds.has(monthId);
    });
  }, [businessOrders, filteredMonthIds]);

  const monthFees = useMemo(() => {
    return (businessFees || []).filter(f => {
      const d = new Date(f.date);
      const monthId = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      return filteredMonthIds.has(monthId);
    });
  }, [businessFees, filteredMonthIds]);

  // Financial KPIs
  const financialMetrics = useMemo(() => {
    let totalSales = 0;
    let totalCosts = 0;
    let totalTVA = 0;

    monthOrders.forEach(o => {
      totalSales += o.amountTTC_cents || 0;
      totalTVA += o.amountTVA_cents || 0;
      
      const itemsCost = (o.items || []).reduce((acc, item) => acc + ((item.unitCostPrice_cents || 0) * (item.quantity || 1)), 0);
      const legacyCost = (o.unitCostPrice_cents || 0) * (o.quantity || 1);
      totalCosts += (o.items && o.items.length > 0) ? itemsCost : legacyCost;
    });

    const totalFees = monthFees.reduce((acc, f) => acc + f.amount_cents, 0);
    const netProfit = totalSales - totalTVA - totalCosts - totalFees;

    return {
      sales: fromCents(totalSales),
      costs: fromCents(totalCosts),
      fees: fromCents(totalFees),
      tva: fromCents(totalTVA),
      netProfit: fromCents(netProfit),
      margin: totalSales > 0 ? (netProfit / totalSales) * 100 : 0
    };
  }, [monthOrders, monthFees]);

  // Operational KPIs
  const opMetrics = useMemo(() => {
    const activeClients = new Set(monthOrders.map(o => o.clientId).filter(Boolean));
    const activeSuppliersFromOrders = new Set(
      monthOrders.flatMap(o => (o.items || []).map(i => i.supplierId).filter(Boolean))
    );
    const activeSuppliersFromFees = new Set(monthFees.map(f => f.supplierName).filter(Boolean));
    
    return {
      ordersCount: monthOrders.length,
      clientsCount: activeClients.size,
      suppliersCount: activeSuppliersFromOrders.size + activeSuppliersFromFees.size,
    };
  }, [monthOrders, monthFees]);

  // Chart 1: CA vs Costs (Achats + Frais) per month
  const monthChartData = useMemo(() => {
    return filteredMonths
      .slice()
      .sort((a, b) => a.year - b.year || a.month - b.month)
      .map((m) => {
        const monthId = m.id;
        const ordersInMonth = (businessOrders || []).filter(o => {
          const d = new Date(o.date);
          return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` === monthId;
        });
        const feesInMonth = (businessFees || []).filter(f => {
          const d = new Date(f.date);
          return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` === monthId;
        });

        let sales = 0;
        let costs = 0;
        ordersInMonth.forEach(o => {
          sales += o.amountTTC_cents || 0;
          const itemsCost = (o.items || []).reduce((acc, item) => acc + ((item.unitCostPrice_cents || 0) * (item.quantity || 1)), 0);
          const legacyCost = (o.unitCostPrice_cents || 0) * (o.quantity || 1);
          costs += (o.items && o.items.length > 0) ? itemsCost : legacyCost;
        });
        const fees = feesInMonth.reduce((acc, f) => acc + f.amount_cents, 0);

        return {
          monthId: m.id,
          monthLabel: `${MONTH_NAMES[m.month - 1].slice(0, 3)} ${m.year}`,
          sales: fromCents(sales),
          costs: fromCents(costs),
          fees: fromCents(fees),
          profit: fromCents(sales - costs - fees)
        };
      });
  }, [filteredMonths, businessOrders, businessFees]);

  // Chart 2: Top Suppliers (By Costs + Fees)
  const supplierChartData = useMemo(() => {
    const map = new Map<string, number>();
    
    monthOrders.forEach(o => {
      if (o.paymentStatus === 'paid' || o.paymentStatus === 'partial') {
        (o.items || []).forEach(item => {
          const cost = (item.unitCostPrice_cents || 0) * (item.quantity || 1);
          const supplierId = item.supplierId || 'unknown';
          map.set(supplierId, (map.get(supplierId) || 0) + cost);
        });
      }
    });

    monthFees.forEach(f => {
      if (f.supplierName) {
        map.set(f.supplierName, (map.get(f.supplierName) || 0) + f.amount_cents);
      }
    });

    return Array.from(map.entries())
      .map(([name, amount_cents]) => ({ name, amount: fromCents(amount_cents) }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5); // Top 5
  }, [monthOrders, monthFees, businessSuppliers]);

  return (
    <div className="space-y-6">
      {/* Financial KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Résultat Net"
          value={formatCurrency(financialMetrics.netProfit, true)}
          sub="CA - Achats - Frais"
          icon={Activity}
          color={financialMetrics.netProfit >= 0
            ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
            : 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400'
          }
        />
        <KPICard
          title="Chiffre d'Affaires"
          value={formatCurrency(financialMetrics.sales)}
          sub="Ventes TTC"
          icon={TrendingUp}
          color="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
          valueColor="text-blue-600 dark:text-blue-400"
        />
        <KPICard
          title="Coût d'Achats"
          value={formatCurrency(financialMetrics.costs)}
          sub="Coût de revient"
          icon={TrendingDown}
          color="bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400"
          valueColor="text-amber-600 dark:text-amber-500"
        />
        <KPICard
          title="Total Frais"
          value={formatCurrency(financialMetrics.fees)}
          sub="Dépenses d'exploitation"
          icon={Wallet}
          color="bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400"
          valueColor="text-rose-600 dark:text-rose-500"
        />
      </div>

      {/* Operational KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Commandes"
          value={opMetrics.ordersCount.toString()}
          icon={ShoppingCart}
          color="bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
        />
        <KPICard
          title="Clients Actifs"
          value={opMetrics.clientsCount.toString()}
          icon={Users}
          color="bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400"
        />
        <KPICard
          title="Fournisseurs Actifs"
          value={opMetrics.suppliersCount.toString()}
          icon={Users}
          color="bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400"
        />
        <KPICard
          title="TVA Collectée"
          value={formatCurrency(financialMetrics.tva)}
          icon={Percent}
          color="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
        />
      </div>

      {/* Line chart */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 sm:p-6">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-white mb-4">
          Évolution CA vs Dépenses
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
                dataKey="sales"
                name="Chiffre d'Affaires"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ r: 4, fill: '#3b82f6' }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="costs"
                name="Dépenses & Frais"
                stroke="#f43f5e"
                strokeWidth={2}
                dot={{ r: 4, fill: '#f43f5e' }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-[240px] text-zinc-400 text-sm">
            Aucune donnée pour la période sélectionnée
          </div>
        )}
      </div>

      {/* Bar chart */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 sm:p-6">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-white mb-4">
          Top 5 Fournisseurs (Dépenses)
        </h2>
        {supplierChartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={supplierChartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="name"
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
              <Bar dataKey="amount" name="Total Dépensé" radius={[4, 4, 0, 0]}>
                {supplierChartData.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-[240px] text-zinc-400 text-sm">
            Aucune donnée
          </div>
        )}
      </div>

      {/* Detail table per month */}
      {monthChartData.length > 0 && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-white">Récapitulatif Financier</h2>
          </div>
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-100 dark:border-zinc-800">
                  <th className="text-left px-5 py-3 text-xs font-medium text-zinc-400 uppercase tracking-wider">Mois</th>
                  <th className="text-right px-5 py-3 text-xs font-medium text-zinc-400 uppercase tracking-wider">C.A.</th>
                  <th className="text-right px-5 py-3 text-xs font-medium text-zinc-400 uppercase tracking-wider">Achats</th>
                  <th className="text-right px-5 py-3 text-xs font-medium text-zinc-400 uppercase tracking-wider">Frais</th>
                  <th className="text-right px-5 py-3 text-xs font-medium text-zinc-400 uppercase tracking-wider">Résultat Net</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {[...monthChartData].reverse().map((m) => (
                  <tr key={m.monthId} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                    <td className="px-5 py-3 font-medium text-zinc-900 dark:text-white">{m.monthLabel}</td>
                    <td className="px-5 py-3 text-right font-mono tabular-nums text-blue-600 dark:text-blue-400">
                      {formatCurrency(m.sales)}
                    </td>
                    <td className="px-5 py-3 text-right font-mono tabular-nums text-amber-600 dark:text-amber-400">
                      {formatCurrency(m.costs)}
                    </td>
                    <td className="px-5 py-3 text-right font-mono tabular-nums text-rose-600 dark:text-rose-400">
                      {formatCurrency(m.fees)}
                    </td>
                    <td className={`px-5 py-3 text-right font-mono tabular-nums font-semibold ${
                      m.profit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                    }`}>
                      {formatCurrency(m.profit, true)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="sm:hidden divide-y divide-zinc-100 dark:divide-zinc-800">
            {[...monthChartData].reverse().map((m) => (
              <div key={m.monthId} className="p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-zinc-900 dark:text-white">{m.monthLabel}</span>
                  <span className={`font-mono tabular-nums font-bold ${
                    m.profit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                  }`}>
                    {formatCurrency(m.profit, true)}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-2.5 rounded-lg border border-blue-100 dark:border-blue-900/30">
                    <div className="text-xs text-blue-600 dark:text-blue-400 mb-1">C.A.</div>
                    <div className="font-mono tabular-nums font-semibold text-blue-700 dark:text-blue-300">
                      {formatCurrency(m.sales)}
                    </div>
                  </div>
                  <div className="bg-rose-50 dark:bg-rose-900/20 p-2.5 rounded-lg border border-rose-100 dark:border-rose-900/30">
                    <div className="text-xs text-rose-600 dark:text-rose-400 mb-1">Achats + Frais</div>
                    <div className="font-mono tabular-nums font-semibold text-rose-700 dark:text-rose-300">
                      {formatCurrency(m.costs + m.fees)}
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
