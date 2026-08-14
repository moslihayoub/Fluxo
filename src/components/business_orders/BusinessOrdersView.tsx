'use client';

import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { Plus, Search, ShoppingBag, Package, Trash2, Edit2, Calendar, FileText, CheckCircle2, AlertCircle, Clock, Download } from 'lucide-react';
import type { BusinessOrder } from '@/types';
import OrderDialog from './OrderDialog';
import InvoiceDialog from './InvoiceDialog';
import { exportToCSV } from '@/lib/exportUtils';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal } from 'lucide-react';
import { ScrollReveal } from '@/components/ui/Animation';
export default function BusinessOrdersView() {
  const orders = useStore((s) => s.businessOrders);
  const globalSearch = useStore((s) => s.globalSearch);
  const deleteOrder = useStore((s) => s.deleteBusinessOrder);
  const updateOrder = useStore((s) => s.updateBusinessOrder);
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<BusinessOrder | null>(null);
  
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<BusinessOrder | null>(null);

  const handleMarkAsPaid = (order: BusinessOrder) => {
    updateOrder(order.id, {
      advancePaid_cents: order.amountTTC_cents,
      remainingBalance_cents: 0,
      paymentStatus: 'paid'
    });
  };

  const filteredOrders = orders.filter(o => {
    const s = globalSearch.toLowerCase();
    return (
      o.orderNumber.toLowerCase().includes(s) || 
      (o.clientName || '').toLowerCase().includes(s) ||
      (o.items || []).some(item => (item.productName || '').toLowerCase().includes(s)) ||
      (o.productName || '').toLowerCase().includes(s) // Fallback for old orders
    );
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleEdit = (order: BusinessOrder) => {
    setEditingOrder(order);
    setIsDialogOpen(true);
  };

  const handleAdd = () => {
    setEditingOrder(null);
    setIsDialogOpen(true);
  };

  const handleInvoice = (order: BusinessOrder) => {
    setSelectedInvoiceOrder(order);
    setIsInvoiceOpen(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD' }).format(amount);
  };

  const handleExport = () => {
    const headers = [
      'Numéro de Commande', 'Date', 'Client', 'Produit', 'Quantité', 
      'Montant HT (MAD)', 'Montant TVA (MAD)', 'Montant TTC (MAD)', 
      'Avance Payée (MAD)', 'Reste à Payer (MAD)', 'Statut'
    ];
    const data = filteredOrders.map(o => [
      o.orderNumber,
      new Date(o.date).toLocaleDateString('fr-MA'),
      o.clientName,
      (o.items && o.items.length > 0) ? o.items.map(i => `${i.productName} (x${i.quantity})`).join(', ') : o.productName,
      (o.items && o.items.length > 0) ? o.items.reduce((acc, i) => acc + i.quantity, 0) : o.quantity,
      o.amountHT_cents,
      o.amountTVA_cents,
      o.amountTTC_cents,
      o.advancePaid_cents,
      o.remainingBalance_cents,
      o.paymentStatus === 'paid' ? 'Payé' : o.paymentStatus === 'partial' ? 'Partiel' : 'Impayé'
    ]);
    exportToCSV('ventes', headers, data);
  };

  const getStatusBadge = (status: BusinessOrder['paymentStatus']) => {
    switch(status) {
      case 'paid':
        return <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wider"><CheckCircle2 className="w-3 h-3" /> Payé</span>;
      case 'partial':
        return <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wider"><Clock className="w-3 h-3" /> Partiel</span>;
      case 'unpaid':
        return <span className="inline-flex items-center gap-1 bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wider"><AlertCircle className="w-3 h-3" /> Impayé</span>;
    }
  };

  return (
    <ScrollReveal className="w-full max-w-6xl mx-auto p-4 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight flex items-center gap-2">
            Gestion des Ventes
          </h1>
          <p className="text-sm text-zinc-500">Suivez vos commandes, paiements et générez vos factures.</p>
        </div>
        {orders.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleExport}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 rounded-lg font-medium hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors shadow-sm"
              title="Exporter en CSV"
            >
              <Download className="w-4 h-4" /> Exporter
            </button>
            <button
              onClick={handleAdd}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-medium transition-all shadow-md shadow-violet-500/20"
            >
              <Plus className="w-4 h-4" /> Nouvelle Vente
            </button>
          </div>
        )}
      </div>

      {/* Search & Filters */}
      {/* Search has been moved to global Header */}

      {/* Orders List */}
      {filteredOrders.length > 0 ? (
        <>
          {/* ── DESKTOP TABLE ── */}
          <div className="hidden sm:block overflow-x-auto rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>N° Commande</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Articles</TableHead>
                  <TableHead className="text-right">Montant</TableHead>
                  <TableHead className="text-center">Statut</TableHead>
                  <TableHead className="text-right w-16">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.id} className="group cursor-default">
                    <TableCell className="font-mono font-medium text-xs">
                      {order.orderNumber}
                    </TableCell>
                    <TableCell className="text-xs text-zinc-500 whitespace-nowrap">
                      {new Date(order.date).toLocaleDateString('fr-MA', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </TableCell>
                    <TableCell className="font-semibold text-zinc-900 dark:text-zinc-100">
                      {order.clientName}
                    </TableCell>
                    <TableCell>
                      <p className="font-medium text-zinc-900 dark:text-zinc-100 text-sm truncate max-w-[200px]" title={(order.items && order.items.length > 0) ? order.items.map(i => i.productName).join(', ') : order.productName}>
                        {(order.items && order.items.length > 0) 
                          ? (order.items.length === 1 
                              ? <>{order.items[0].productName} <span className="text-zinc-400 text-sm font-normal">x{order.items[0].quantity}</span></> 
                              : <>{order.items.length} articles</>
                            )
                          : <>{order.productName} <span className="text-zinc-400 text-sm font-normal">x{order.quantity}</span></>
                        }
                      </p>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="font-black text-sm text-zinc-900 dark:text-white">
                        {formatCurrency(order.amountTTC_cents)}
                      </div>
                      {order.remainingBalance_cents > 0 && (
                        <div className="text-xs font-bold text-rose-500">
                          Reste: {formatCurrency(order.remainingBalance_cents)}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {getStatusBadge(order.paymentStatus)}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger className="inline-flex items-center justify-center h-8 px-2.5 text-xs font-semibold gap-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                          <MoreHorizontal className="w-3.5 h-3.5 text-zinc-500" />
                          Actions
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {order.paymentStatus !== 'paid' && (
                            <DropdownMenuItem onClick={() => handleMarkAsPaid(order)} className="text-emerald-600 focus:text-emerald-600 focus:bg-emerald-50 dark:focus:bg-emerald-900/20">
                              <CheckCircle2 className="w-4 h-4 mr-2" />
                              Être payé
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => handleInvoice(order)} className="text-blue-600 focus:text-blue-600 focus:bg-blue-50 dark:focus:bg-blue-900/20">
                            <FileText className="w-4 h-4 mr-2" />
                            Facture
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEdit(order)}>
                            <Edit2 className="w-4 h-4 mr-2" />
                            Modifier
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => { if(confirm('Supprimer cette commande ?')) deleteOrder(order.id); }} className="text-rose-600 focus:bg-rose-50 focus:text-rose-600 dark:focus:bg-rose-900/20 dark:focus:text-rose-400">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* ── MOBILE LIST ── */}
          <div className="sm:hidden flex flex-col gap-3">
            {filteredOrders.map((order) => (
              <Card key={order.id}>
                <CardContent className="p-4 flex flex-col gap-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono font-bold text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded">
                          {order.orderNumber}
                        </span>
                        <span className="text-xs text-zinc-500 flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> {new Date(order.date).toLocaleDateString('fr-MA', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                      <h3 className="font-bold text-zinc-900 dark:text-white text-base truncate">
                        {(order.items && order.items.length > 0) 
                          ? (order.items.length === 1 
                              ? <>{order.items[0].productName} <span className="text-zinc-400 text-sm font-normal">x{order.items[0].quantity}</span></> 
                              : <>{order.items.length} articles</>
                            )
                          : <>{order.productName} <span className="text-zinc-400 text-sm font-normal">x{order.quantity}</span></>
                        }
                      </h3>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400 flex items-center gap-1 truncate mt-0.5">
                        Client: <span className="font-semibold text-zinc-800 dark:text-zinc-200">{order.clientName}</span>
                      </p>
                    </div>
                    <div className="relative ml-2 shrink-0">
                      <DropdownMenu>
                        <DropdownMenuTrigger className="inline-flex items-center justify-center h-8 px-2 text-xs font-semibold gap-1 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                          <MoreHorizontal className="w-3.5 h-3.5" />
                          Actions
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {order.paymentStatus !== 'paid' && (
                            <DropdownMenuItem onClick={() => handleMarkAsPaid(order)} className="text-emerald-600 focus:text-emerald-600 focus:bg-emerald-50 dark:focus:bg-emerald-900/20">
                              <CheckCircle2 className="w-4 h-4 mr-2" />
                              Être payé
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => handleInvoice(order)} className="text-blue-600 focus:text-blue-600 focus:bg-blue-50 dark:focus:bg-blue-900/20">
                            <FileText className="w-4 h-4 mr-2" />
                            Facture
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEdit(order)}>
                            <Edit2 className="w-4 h-4 mr-2" />
                            Modifier
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => { if(confirm('Supprimer cette commande ?')) deleteOrder(order.id); }} className="text-rose-600 focus:bg-rose-50 focus:text-rose-600 dark:focus:bg-rose-900/20 dark:focus:text-rose-400">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-zinc-100 dark:border-zinc-800">
                    <div>
                      <div className="font-black text-lg text-zinc-900 dark:text-white">
                        {formatCurrency(order.amountTTC_cents)}
                      </div>
                      {order.remainingBalance_cents > 0 && (
                        <div className="text-xs font-bold text-rose-500">
                          Reste: {formatCurrency(order.remainingBalance_cents)}
                        </div>
                      )}
                    </div>
                    <div>
                      {getStatusBadge(order.paymentStatus)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      ) : (
        <div className="text-center py-16 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 border-dashed">
          <div className="w-16 h-16 bg-violet-50 dark:bg-violet-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="w-8 h-8 text-violet-500" />
          </div>
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">Aucune vente enregistrée</h3>
          <p className="text-zinc-500 text-sm mb-6 max-w-sm mx-auto">
            {globalSearch ? 'Aucune commande ne correspond à votre recherche.' : "Vous n'avez pas encore de commandes. Créez votre première vente."}
          </p>
          <button onClick={handleAdd} className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-violet-500/25">
            <Plus className="w-5 h-5" /> Enregistrer une vente
          </button>
        </div>
      )}

      <OrderDialog 
        isOpen={isDialogOpen} 
        onClose={() => setIsDialogOpen(false)} 
        order={editingOrder} 
      />

      <InvoiceDialog
        isOpen={isInvoiceOpen}
        onClose={() => setIsInvoiceOpen(false)}
        order={selectedInvoiceOrder}
      />
    </ScrollReveal>
  );
}
