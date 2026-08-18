'use client';

import { useStore } from '@/store/useStore';
import { X, Building2, Package, Calendar, Tag } from 'lucide-react';
import type { BusinessSupplier } from '@/types';
import { formatCurrency, fromCents } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useMemo } from 'react';

interface SupplierHistoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  supplier: BusinessSupplier | null;
}

export default function SupplierHistoryDialog({ isOpen, onClose, supplier }: SupplierHistoryDialogProps) {
  const orders = useStore((s) => s.businessOrders);
  const products = useStore((s) => s.businessProducts);

  const history = useMemo(() => {
    if (!supplier) return [];

    const historyItems: {
      orderId: string;
      orderNumber: string;
      date: string;
      productName: string;
      quantity: number;
      unitCostPrice_cents: number;
      totalCost_cents: number;
    }[] = [];

    orders.forEach(order => {
      const orderItems = (order.items && order.items.length > 0)
        ? order.items
        : order.productName
        ? [{
            id: 'legacy',
            productName: order.productName,
            quantity: order.quantity || 1,
            unitCostPrice_cents: order.unitCostPrice_cents || 0,
            productId: (order as any).productId
          }]
        : [];

      orderItems.forEach(item => {
        const product = products.find(p => p.name === item.productName || p.id === (item as any).productId);
        if (product && product.supplierId === supplier.id) {
          historyItems.push({
            orderId: order.id,
            orderNumber: order.orderNumber,
            date: order.date,
            productName: item.productName,
            quantity: item.quantity || 1,
            unitCostPrice_cents: item.unitCostPrice_cents || 0,
            totalCost_cents: (item.unitCostPrice_cents || 0) * (item.quantity || 1)
          });
        }
      });
    });

    return historyItems.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [supplier, orders, products]);

  if (!isOpen || !supplier) return null;

  const totalSpent = history.reduce((acc, h) => acc + h.totalCost_cents, 0);

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center sm:block p-4 sm:p-0">
      <div 
        className="absolute sm:fixed inset-0 bg-zinc-950/50 backdrop-blur-sm animate-in fade-in duration-200" 
        onClick={onClose} 
      />
      <div className="relative sm:fixed sm:inset-y-0 sm:right-0 z-10 bg-white dark:bg-zinc-900 w-full max-w-2xl sm:max-w-none sm:w-[60%] lg:w-[50%] rounded-3xl sm:rounded-none sm:rounded-l-3xl shadow-xl overflow-hidden flex flex-col max-h-[90vh] sm:max-h-none sm:h-full animate-in fade-in sm:slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40">
          <div className="flex items-center gap-3">
            {supplier.avatarUrl ? (
              <img src={supplier.avatarUrl} alt={supplier.brandName} className="w-10 h-10 rounded-xl object-cover border border-zinc-200 dark:border-zinc-700" />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 flex items-center justify-center text-lg font-bold">
                <Building2 className="w-5 h-5" />
              </div>
            )}
            <div>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
                Historique: {supplier.brandName}
              </h2>
              <p className="text-xs text-zinc-500 font-medium">
                Total Achats : <span className="font-bold text-rose-600 dark:text-rose-400">{formatCurrency(totalSpent)}</span>
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 bg-zinc-200 dark:bg-zinc-800 rounded-full text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {history.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-zinc-500 p-10">
              <Package className="w-12 h-12 mb-4 text-zinc-300 dark:text-zinc-700" />
              <p className="text-center font-medium">Aucun achat enregistré avec ce fournisseur.</p>
              <p className="text-xs text-center mt-2 max-w-xs">Créez une vente incluant un produit lié à ce fournisseur pour le voir ici.</p>
            </div>
          ) : (
            <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden bg-white dark:bg-zinc-950">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Commande / Produit</TableHead>
                    <TableHead className="text-center">Qté</TableHead>
                    <TableHead className="text-right">Prix Achat</TableHead>
                    <TableHead className="text-right font-bold text-zinc-900 dark:text-zinc-100">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map((h, i) => (
                    <TableRow key={i} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                      <TableCell className="text-xs text-zinc-500 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(h.date).toLocaleDateString('fr-MA')}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-xs font-mono text-zinc-400">{h.orderNumber}</span>
                          <span className="text-sm font-semibold text-zinc-900 dark:text-white flex items-center gap-1.5">
                            <Tag className="w-3.5 h-3.5 text-zinc-400" /> {h.productName}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center font-mono font-medium">
                        x{h.quantity}
                      </TableCell>
                      <TableCell className="text-right text-sm text-zinc-600 dark:text-zinc-400">
                        {formatCurrency(h.unitCostPrice_cents)}
                      </TableCell>
                      <TableCell className="text-right text-sm font-bold text-rose-600 dark:text-rose-400">
                        {formatCurrency(h.totalCost_cents)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
