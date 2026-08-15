'use client';

import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { Plus, Phone, MessageCircle, Building2, Truck, Package, ShoppingBag, DollarSign } from 'lucide-react';
import type { BusinessSupplier } from '@/types';
import SupplierDialog from './SupplierDialog';
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
import { MoreHorizontal, Edit2, Trash2 } from 'lucide-react';

import { formatCurrency, fromCents } from '@/lib/utils';
import { ScrollReveal } from '@/components/ui/Animation';

export default function BusinessSuppliersView() {
  const suppliers = useStore((s) => s.businessSuppliers) || [];
  const products = useStore((s) => s.businessProducts) || [];
  const orders = useStore((s) => s.businessOrders) || [];
  
  const globalSearch = useStore((s) => s.globalSearch) || '';
  const deleteSupplier = useStore((s) => s.deleteBusinessSupplier);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<BusinessSupplier | null>(null);

  const filteredSuppliers = suppliers.filter(s => {
    const search = globalSearch.toLowerCase();
    return (
      (s.brandName || '').toLowerCase().includes(search) ||
      (s.contactName?.toLowerCase() || '').includes(search) ||
      (s.phone || '').includes(search)
    );
  });

  const handleEdit = (supplier: BusinessSupplier) => {
    setEditingSupplier(supplier);
    setIsDialogOpen(true);
  };

  const handleAdd = () => {
    setEditingSupplier(null);
    setIsDialogOpen(true);
  };

  // KPI Calculations per supplier
  const getSupplierStats = (supplierId: string) => {
    const supplierProducts = (products || []).filter(p => p.supplierId === supplierId);
    const productCount = supplierProducts.length;
    
    // Distinct categories
    const categoryIds = new Set(supplierProducts.map(p => p.categoryId).filter(Boolean));
    const categoryCount = categoryIds.size;
    
    // Number of sales involving this supplier's products
    let salesCount = 0;
    let totalPurchaseValue_cents = 0; // Total purchase cost for this supplier's sold items
    
    (orders || []).forEach(order => {
      let orderHasSupplierProduct = false;
      const orderItems = (order.items && order.items.length > 0)
        ? order.items
        : order.productName
        ? [{
            id: 'legacy',
            productName: order.productName,
            quantity: order.quantity || 1,
            unitCostPrice_cents: order.unitCostPrice_cents || 0,
            unitSellingPrice_cents: order.unitSellingPrice_cents || 0,
          }]
        : [];

      orderItems.forEach(item => {
        const product = (products || []).find(p => p.name === item.productName || p.id === (item as any).productId);
        if (product && product.supplierId === supplierId) {
          orderHasSupplierProduct = true;
          totalPurchaseValue_cents += ((item.unitCostPrice_cents || 0) * (item.quantity || 1));
        }
      });
      if (orderHasSupplierProduct) {
        salesCount++;
      }
    });

    return { productCount, categoryCount, salesCount, totalPurchaseValue: fromCents(totalPurchaseValue_cents), totalPurchaseValue_cents };
  };

  const globalStats = suppliers.reduce((acc, s) => {
    const stats = getSupplierStats(s.id);
    acc.totalProducts += stats.productCount;
    acc.totalPurchaseValue_cents += stats.totalPurchaseValue_cents;
    return acc;
  }, { totalProducts: 0, totalPurchaseValue_cents: 0 });

  return (
    <ScrollReveal className="w-full max-w-6xl mx-auto p-4 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">Fournisseurs</h1>
          <p className="text-sm text-zinc-500">Gérez vos fournisseurs et suivez vos achats.</p>
        </div>
        {suppliers.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleAdd}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-lg font-medium hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" /> Ajouter un fournisseur
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl shadow-sm hover:border-violet-500/30 transition-all">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-violet-600 dark:text-violet-400">
              <Building2 className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">Total Fournisseurs</h3>
          </div>
          <p className="text-2xl font-black text-zinc-900 dark:text-white">
            {suppliers.length}
          </p>
        </div>
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl shadow-sm hover:border-blue-500/30 transition-all">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Package className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">Produits Sourcés</h3>
          </div>
          <p className="text-2xl font-black text-zinc-900 dark:text-white">
            {globalStats.totalProducts}
          </p>
        </div>
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl shadow-sm hover:border-rose-500/30 transition-all">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center text-rose-600 dark:text-rose-400">
              <DollarSign className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">Total Achats (Est.)</h3>
          </div>
          <p className="text-2xl font-black text-rose-600 dark:text-rose-400">
            {formatCurrency(fromCents(globalStats.totalPurchaseValue_cents))}
          </p>
        </div>
      </div>

      {filteredSuppliers.length > 0 ? (
        <>
          {/* ── DESKTOP TABLE ── */}
          <div className="hidden sm:block overflow-x-auto rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">ID</TableHead>
                  <TableHead>Marque</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Marchandise</TableHead>
                  <TableHead className="text-center">Produits</TableHead>
                  <TableHead className="text-center">Ventes (Nb)</TableHead>
                  <TableHead className="text-right">Total Achat</TableHead>
                  <TableHead className="text-right w-16">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSuppliers.map((supplier) => {
                  const stats = getSupplierStats(supplier.id);
                  return (
                    <TableRow key={supplier.id} className="group cursor-default">
                      <TableCell className="font-mono text-xs text-zinc-500">
                        {supplier.id.slice(0, 8)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {supplier.avatarUrl ? (
                            <img src={supplier.avatarUrl} alt={supplier.brandName} className="w-8 h-8 rounded-lg object-cover border border-zinc-200 dark:border-zinc-700" />
                          ) : (
                            <div className="w-8 h-8 rounded-lg bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 flex items-center justify-center text-sm font-bold">
                              <Building2 className="w-4 h-4" />
                            </div>
                          )}
                          <div>
                            <h3 className="font-bold text-zinc-900 dark:text-white text-sm">
                              {supplier.brandName}
                            </h3>
                            {supplier.contactName && (
                              <span className="text-xs text-zinc-500">
                                {supplier.contactName}
                              </span>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1 text-xs text-zinc-600 dark:text-zinc-400">
                          {supplier.phone && (
                            <div className="flex items-center gap-1.5">
                              <Phone className="w-3.5 h-3.5" /> <a href={`tel:${supplier.phone}`} className="hover:underline hover:text-violet-500">{supplier.phone}</a>
                            </div>
                          )}
                          {supplier.whatsapp && (
                            <div className="flex items-center gap-1.5 text-green-600">
                              <MessageCircle className="w-3.5 h-3.5" /> <a href={`https://wa.me/${supplier.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" className="hover:underline">WhatsApp</a>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs font-medium bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded text-zinc-700 dark:text-zinc-300">
                          {supplier.merchandiseType || 'Non spécifié'}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex flex-col items-center justify-center">
                          <span className="text-sm font-bold text-zinc-900 dark:text-white">{stats.productCount}</span>
                          <span className="text-[10px] text-zinc-500">{stats.categoryCount} cat.</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center font-medium text-zinc-900 dark:text-white">
                        {stats.salesCount}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="font-black text-sm text-zinc-900 dark:text-white">
                          {formatCurrency(stats.totalPurchaseValue)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger>
                            <button className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800 focus:outline-none">
                              <MoreHorizontal className="w-4 h-4" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(supplier)}>
                              <Edit2 className="w-4 h-4 mr-2" />
                              Modifier
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => { if(confirm('Supprimer ce fournisseur ?')) deleteSupplier(supplier.id); }} className="text-rose-600 focus:bg-rose-50 focus:text-rose-600 dark:focus:bg-rose-900/20 dark:focus:text-rose-400">
                              <Trash2 className="w-4 h-4 mr-2" />
                              Supprimer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* ── MOBILE LIST ── */}
          <div className="sm:hidden flex flex-col gap-3">
            {filteredSuppliers.map((supplier) => {
              const stats = getSupplierStats(supplier.id);
              return (
                <Card key={supplier.id}>
                  <CardContent className="p-4 flex flex-col gap-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        {supplier.avatarUrl ? (
                          <img src={supplier.avatarUrl} alt={supplier.brandName} className="w-10 h-10 rounded-xl object-cover border border-zinc-200 dark:border-zinc-700" />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 flex items-center justify-center text-lg font-bold">
                            <Building2 className="w-5 h-5" />
                          </div>
                        )}
                        <div>
                          <h3 className="font-bold text-zinc-900 dark:text-white flex items-center gap-1.5 text-base">
                            {supplier.brandName}
                          </h3>
                          <span className="text-xs text-zinc-500">
                            ID: {supplier.id.slice(0, 8)}
                          </span>
                        </div>
                      </div>
                      <div className="relative ml-2 shrink-0">
                        <DropdownMenu>
                          <DropdownMenuTrigger>
                            <button className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors bg-zinc-50 dark:bg-zinc-800/50">
                              <MoreHorizontal className="w-4 h-4" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(supplier)}>
                              <Edit2 className="w-4 h-4 mr-2" />
                              Modifier
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => { if(confirm('Supprimer ce fournisseur ?')) deleteSupplier(supplier.id); }} className="text-rose-600 focus:bg-rose-50 focus:text-rose-600 dark:focus:bg-rose-900/20 dark:focus:text-rose-400">
                              <Trash2 className="w-4 h-4 mr-2" />
                              Supprimer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm bg-zinc-50 dark:bg-zinc-800/30 p-2.5 rounded-lg">
                      <div className="flex flex-col">
                        <span className="text-xs text-zinc-500">Contact</span>
                        <span className="font-medium text-zinc-900 dark:text-white">{supplier.contactName || '-'}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs text-zinc-500">Marchandise</span>
                        <span className="font-medium text-zinc-900 dark:text-white truncate">{supplier.merchandiseType || '-'}</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5 text-sm text-zinc-600 dark:text-zinc-400">
                      {supplier.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4" /> <a href={`tel:${supplier.phone}`} className="hover:underline hover:text-violet-500">{supplier.phone}</a>
                        </div>
                      )}
                      {supplier.whatsapp && (
                        <div className="flex items-center gap-2 text-green-600">
                          <MessageCircle className="w-4 h-4" /> <a href={`https://wa.me/${supplier.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" className="hover:underline">WhatsApp</a>
                        </div>
                      )}
                    </div>

                    <hr className="border-zinc-100 dark:border-zinc-800" />
                    
                    <div className="grid grid-cols-3 gap-2 text-center pt-1">
                      <div>
                        <div className="text-xs text-zinc-500">Produits</div>
                        <div className="font-bold text-zinc-900 dark:text-white">{stats.productCount}</div>
                      </div>
                      <div>
                        <div className="text-xs text-zinc-500">Ventes</div>
                        <div className="font-bold text-zinc-900 dark:text-white">{stats.salesCount}</div>
                      </div>
                      <div>
                        <div className="text-xs text-zinc-500">Total</div>
                        <div className="font-bold text-zinc-900 dark:text-white text-xs mt-0.5">{formatCurrency(stats.totalPurchaseValue)}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </>
      ) : (
        <div className="text-center py-12 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 border-dashed">
          <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Truck className="w-8 h-8 text-zinc-400" />
          </div>
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">Aucun fournisseur trouvé</h3>
          <p className="text-zinc-500 text-sm mb-6 max-w-sm mx-auto">
            {globalSearch ? "Aucun fournisseur ne correspond à votre recherche." : "Vous n'avez pas encore de fournisseurs. Ajoutez votre premier fournisseur pour commencer."}
          </p>
          {!globalSearch && (
            <button onClick={handleAdd} className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-lg font-medium hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors shadow-sm">
              <Plus className="w-4 h-4" /> Ajouter mon premier fournisseur
            </button>
          )}
        </div>
      )}

      <SupplierDialog 
        isOpen={isDialogOpen} 
        onClose={() => setIsDialogOpen(false)} 
        supplier={editingSupplier} 
      />
    </ScrollReveal>
  );
}
