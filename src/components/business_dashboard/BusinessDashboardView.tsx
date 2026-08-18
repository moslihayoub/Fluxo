'use client';

import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TrendingUp, DollarSign, AlertCircle, Download, FileSpreadsheet, Users, ShoppingBag, Edit2, Plus, Upload } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie, Legend } from 'recharts';
import toast from 'react-hot-toast';
import BusinessImportDialog from './BusinessImportDialog';
import OrderDialog from '@/components/business_orders/OrderDialog';
import PayPalSupportCard from '@/components/widgets/PayPalSupportCard';
import GuestWarningBanner from '@/components/widgets/GuestWarningBanner';
import { ScrollReveal } from '@/components/ui/Animation';
import { cn, formatCurrency } from '@/lib/utils';

export default function BusinessDashboardView() {
  const orders = useStore((s) => s.businessOrders);
  const fees = useStore((s) => s.businessFees);
  const clients = useStore((s) => s.businessClients);
  const setActiveView = useStore((s) => s.setActiveView);
  const language = useStore((s) => s.language);
  
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false);

  // KPIs Calculations
  const totalCA = orders.reduce((acc, order) => acc + (Number(order.amountTTC_cents) || Number((order as any).totalAmount_cents) || Number((order as any).amountTTC) || 0), 0);
  const totalProfit = orders.reduce((acc, order) => acc + (Number(order.netProfit_cents) || Number((order as any).profit_cents) || Number((order as any).profit) || 0), 0);
  const totalPending = orders.reduce((acc, order) => acc + (Number(order.remainingBalance_cents) || Number((order as any).remaining_cents) || Number((order as any).remainingBalance) || 0), 0);
  const totalOrdersCount = orders.length;

  // --- Frais Metrics ---
  const totalFees = fees.reduce((sum, f) => sum + f.amount_cents, 0);
  
  const feesByCategoryMap = new Map<string, number>();
  fees.forEach(f => {
    const val = feesByCategoryMap.get(f.category) || 0;
    feesByCategoryMap.set(f.category, val + f.amount_cents);
  });
  const feesByCategory = Array.from(feesByCategoryMap.entries())
    .map(([name, val]) => ({ name, value: val }))
    .sort((a, b) => b.value - a.value);

  const topSuppliersMap = new Map<string, number>();
  fees.forEach(f => {
    const supp = f.supplierName || 'Divers';
    const val = topSuppliersMap.get(supp) || 0;
    topSuppliersMap.set(supp, val + f.amount_cents);
  });
  const topSuppliersData = Array.from(topSuppliersMap.entries())
    .map(([name, val]) => ({ name, value: val }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);


  // Chart data formatting
  const chartData = orders
    .reduce((acc, order) => {
      const dateStr = new Date(order.date).toLocaleDateString('fr-MA', { day: '2-digit', month: 'short' });
      const existing = acc.find(x => x.date === dateStr);
      const orderCA = Number(order.amountTTC_cents) || Number((order as any).totalAmount_cents) || Number((order as any).amountTTC) || 0;
      const orderProfit = Number(order.netProfit_cents) || Number((order as any).profit_cents) || Number((order as any).profit) || 0;
      if (existing) {
        existing.ca += orderCA;
        existing.profit += orderProfit;
      } else {
        acc.push({ date: dateStr, ca: orderCA, profit: orderProfit, rawDate: new Date(order.date).getTime() });
      }
      return acc;
    }, [] as { date: string, ca: number, profit: number, rawDate: number }[])
    .sort((a, b) => a.rawDate - b.rawDate)
    .slice(-7); // Keep last 7 days of activity

  // Product Data for Pie Chart
  const productDataMap = new Map<string, number>();
  orders.forEach(o => {
    const orderCA = Number(o.amountTTC_cents) || Number((o as any).totalAmount_cents) || Number((o as any).amountTTC) || 0;
    if (o.items && o.items.length > 0) {
      o.items.forEach(item => {
        const itemVal = (Number(item.unitSellingPrice_cents) || 0) * (Number(item.quantity) || 1);
        productDataMap.set(item.productName, (productDataMap.get(item.productName) || 0) + itemVal);
      });
    } else if (o.productName) {
      productDataMap.set(o.productName, (productDataMap.get(o.productName) || 0) + orderCA);
    }
  });
  const productData = Array.from(productDataMap.entries()).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 5);
  
  // Client Data for Bar Chart
  const clientDataMap = new Map<string, number>();
  orders.forEach(o => {
    const orderCA = Number(o.amountTTC_cents) || Number((o as any).totalAmount_cents) || Number((o as any).amountTTC) || 0;
    const client = clients.find(c => c.id === o.clientId);
    const displayName = client?.clientType === 'pro' && client.brandName ? client.brandName : (o.clientName || 'Client Divers');
    clientDataMap.set(displayName, (clientDataMap.get(displayName) || 0) + orderCA);
  });
  const clientData = Array.from(clientDataMap.entries()).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 5);

  const PIE_COLORS = ['#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#3b82f6'];

  // Custom tooltip for dark mode
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 border border-zinc-800 dark:border-zinc-200 rounded-lg p-3 shadow-xl text-xs">
        {label && <p className="font-bold mb-2">{label}</p>}
        {payload.map((p: any, i: number) => (
          <div key={i} className="flex items-center justify-between gap-4">
            <span style={{ color: p.color || p.payload?.fill }}>{p.name}</span>
            <span className="font-mono font-semibold tabular-nums">
              {formatCurrency(p.value)}
            </span>
          </div>
        ))}
      </div>
    );
  };

  const exportToCSV = () => {
    if (orders.length === 0) {
      toast.error('Aucune donnée à exporter.');
      return;
    }

    const headers = ['N° Commande', 'Date', 'Client', 'Produit', 'Qté', 'Total TTC', 'Avance', 'Reste', 'Bénéfice Net', 'Statut'];
    const rows = orders.map(o => [
      o.orderNumber,
      new Date(o.date).toLocaleDateString('fr-MA'),
      o.clientName,
      (o.items && o.items.length > 0) ? o.items.map(i => `${i.productName} (x${i.quantity})`).join(', ') : o.productName,
      (o.items && o.items.length > 0) ? o.items.reduce((acc, i) => acc + i.quantity, 0).toString() : (o.quantity || 1).toString(),
      o.amountTTC_cents.toString(),
      o.advancePaid_cents.toString(),
      o.remainingBalance_cents.toString(),
      o.netProfit_cents.toString(),
      o.paymentStatus
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(e => e.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `fluxo_export_ventes_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Export réussi !');
  };

  return (
    <ScrollReveal className="w-full max-w-6xl mx-auto p-4 space-y-6">
      <GuestWarningBanner />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white tracking-tight flex items-center gap-2">
            {language === 'fr' ? 'Tableau de Bord Pro' : 'Business Dashboard'}

          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            {language === 'fr' ? 'Aperçu général de votre activité professionnelle.' : 'General overview of your business activity.'}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsOrderDialogOpen(true)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-medium transition-colors shadow-sm text-sm"
          >
            <Plus className="w-4 h-4" /> {language === 'fr' ? 'Créer une vente' : 'New Sale'}
          </button>
          
          <button
            onClick={() => setShowImportDialog(true)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700 rounded-lg font-medium transition-colors shadow-sm text-sm"
          >
            <Upload className="w-4 h-4" /> {language === 'fr' ? 'Importer' : 'Import'}
          </button>

          {orders.length > 0 && (
            <button
              onClick={exportToCSV}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium transition-colors shadow-sm text-sm"
            >
              <FileSpreadsheet className="w-4 h-4" /> {language === 'fr' ? 'Exporter' : 'Export'}
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI: Chiffre d'affaires */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl shadow-sm hover:border-blue-500/30 transition-all">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">{language === 'fr' ? 'Chiffre d\'Affaires' : 'Revenue'}</h3>
          </div>
          <p className={`text-2xl font-black ${totalCA > 0 ? 'text-blue-600 dark:text-blue-400' : 'text-zinc-900 dark:text-white'}`}>
            {formatCurrency(totalCA, false, 'DH')}
          </p>
        </div>

        {/* KPI: Bénéfice net */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl shadow-sm hover:border-emerald-500/30 transition-all">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <DollarSign className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">{language === 'fr' ? 'Bénéfice Net' : 'Net Profit'}</h3>
          </div>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {formatCurrency(totalProfit, false, 'DH')}
          </p>
        </div>

        {/* KPI: Impayés */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl shadow-sm hover:border-rose-500/30 transition-all">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center text-rose-600 dark:text-rose-400">
              <AlertCircle className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">{language === 'fr' ? 'Reste à recouvrer' : 'Unpaid Balance'}</h3>
          </div>
          <p className="text-2xl font-black text-rose-600 dark:text-rose-400">
            {formatCurrency(totalPending, false, 'DH')}
          </p>
        </div>

        {/* KPI: Ventes */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl shadow-sm hover:border-violet-500/30 transition-all">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-violet-600 dark:text-violet-400">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">{language === 'fr' ? 'Ventes Totales' : 'Total Sales'}</h3>
          </div>
          <p className="text-2xl font-black text-zinc-900 dark:text-white">{totalOrdersCount} <span className="text-sm font-medium text-zinc-400">{language === 'fr' ? 'ventes' : 'sales'}</span></p>
        </div>
      </div>
      
      {/* Charts Section */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl shadow-sm">
        <h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-4">Évolution du Chiffre d'Affaires</h2>
        {chartData.length > 0 ? (
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#3f3f46" opacity={0.2} />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#71717a' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#71717a' }} tickFormatter={(val) => `${(val / 100).toFixed(0)} DH`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px', color: '#fff' }} 
                  formatter={(val: any) => [formatCurrency(val), '']}
                />
                <Line type="monotone" dataKey="ca" name="CA" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6' }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="profit" name="Bénéfice" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-72 w-full flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 text-zinc-400">
            <p className="text-sm">Aucune donnée de vente pour le moment.</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl shadow-sm">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-4">Top Produits (en CA)</h2>
          {productData.length > 0 ? (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={productData} dataKey="value" nameKey="name" cx="50%" cy="45%" innerRadius={45} outerRadius={75} paddingAngle={3}>
                    {productData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: '8px', fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 w-full flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 text-zinc-400">
              <p className="text-sm">Aucune donnée disponible.</p>
            </div>
          )}
        </div>

        {/* Top Clients */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl shadow-sm">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-4">Top Clients (en CA)</h2>
          {clientData.length > 0 ? (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={clientData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#3f3f46" opacity={0.2} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#71717a' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#71717a' }} tickFormatter={(val) => `${(val / 100).toFixed(0)} DH`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" name="Chiffre d'Affaires" radius={[4, 4, 0, 0]}>
                    {clientData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 w-full flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 text-zinc-400">
              <p className="text-sm">Aucune donnée disponible.</p>
            </div>
          )}
        </div>
      </div>

      
      <hr className="border-zinc-200 dark:border-zinc-800 my-8" />
      <div className="space-y-6 animate-in fade-in duration-300">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl shadow-sm hover:border-rose-500/30 transition-all">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center text-rose-600 dark:text-rose-400">
                <DollarSign className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">Total des Frais</h3>
            </div>
            <p className="text-2xl font-black text-rose-600 dark:text-rose-400">
              {formatCurrency(totalFees, false, 'DH')}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl shadow-sm">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-4">Répartition des Frais</h2>
            {feesByCategory.length > 0 ? (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={feesByCategory} dataKey="value" nameKey="name" cx="50%" cy="45%" innerRadius={45} outerRadius={75} paddingAngle={3}>
                      {feesByCategory.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '8px', fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 w-full flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 text-zinc-400">
                <p className="text-sm">Aucune donnée disponible.</p>
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl shadow-sm overflow-hidden flex flex-col">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-4">Top Fournisseurs</h2>
            <div className="flex-1 overflow-auto">
              {topSuppliersData.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fournisseur</TableHead>
                      <TableHead className="text-right">Total Dépensé</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topSuppliersData.map((supp, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-medium text-zinc-900 dark:text-white">{supp.name}</TableCell>
                        <TableCell className="text-right font-bold font-mono text-rose-500">
                          {formatCurrency(supp.value, false, 'DH')}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="h-full w-full min-h-[200px] flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 text-zinc-400">
                  <p className="text-sm">Aucune donnée disponible.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <PayPalSupportCard className="mt-8" />
      
      {showImportDialog && (
        <BusinessImportDialog onClose={() => setShowImportDialog(false)} />
      )}

      <OrderDialog
        isOpen={isOrderDialogOpen}
        onClose={() => setIsOrderDialogOpen(false)}
        order={null}
      />
    </ScrollReveal>
  );
}
