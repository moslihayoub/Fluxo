'use client';

import { useState } from 'react';
import { Package, Plus, Search, Tag, Settings2, Pencil, Trash2, Download, MoreHorizontal } from 'lucide-react';
import { useStore } from '@/store/useStore';
import type { BusinessProduct } from '@/types';
import { formatCurrency, fromCents } from '@/lib/utils';
import { exportToCSV } from '@/lib/exportUtils';
import ProductDialog from './ProductDialog';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { ScrollReveal } from '@/components/ui/Animation';

export default function BusinessProductsView() {
  const products = useStore((s) => s.businessProducts) || [];
  const categories = useStore((s) => s.businessCategories) || [];
  const suppliers = useStore((s) => s.businessSuppliers) || [];
  const globalSearch = useStore((s) => s.globalSearch) || '';
  const deleteProduct = useStore((s) => s.deleteBusinessProduct);
  const updateProduct = useStore((s) => s.updateBusinessProduct);
  
  const getCategoryName = (catId?: string) => {
    if (!catId) return '';
    const cat = categories.find(c => c.id === catId);
    if (!cat) return '';
    if (cat.parentId) {
      const parent = categories.find(p => p.id === cat.parentId);
      return parent ? `${parent.name} › ${cat.name}` : cat.name;
    }
    return cat.name;
  };

  const getSupplierName = (suppId?: string) => {
    if (!suppId) return '';
    return suppliers.find(s => s.id === suppId)?.brandName || '';
  };

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<BusinessProduct | undefined>();
  const [productToDelete, setProductToDelete] = useState<string | null>(null);

  const filteredProducts = products.filter(p => {
    const s = globalSearch.toLowerCase();
    return p.name.toLowerCase().includes(s);
  });

  const handleExport = () => {
    const headers = ['Nom du Produit', 'Description', 'Prix par défaut (MAD)', 'Actif'];
    const data = filteredProducts.map(p => [
      p.name,
      p.categoryId || '',
      p.defaultPrice_cents,
      p.isActive ? 'Oui' : 'Non'
    ]);
    exportToCSV('catalogue_produits', headers, data);
  };

  return (
    <ScrollReveal className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <Package className="w-7 h-7 text-violet-600 dark:text-violet-400" />
            Produits & Services
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Gérez votre catalogue de produits, prestations et leurs tarifs.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {products.length > 0 && (
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700/50 rounded-xl font-medium transition-colors shadow-sm"
            >
              <Download className="w-4 h-4" /> Exporter
            </button>
          )}
          <button
            onClick={() => {
              setEditingProduct(undefined);
              setIsDialogOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-medium transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5" />
            Ajouter
          </button>
        </div>
      </div>

      {/* List */}
      <div className="w-full">
        {filteredProducts.length === 0 ? (
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-zinc-50 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8 text-zinc-400" />
              </div>
              <h3 className="text-lg font-medium text-zinc-900 dark:text-white mb-1">Aucun produit</h3>
              <p className="text-zinc-500 dark:text-zinc-400 text-sm max-w-sm mx-auto mb-6">
                {globalSearch ? 'Aucun produit ne correspond à votre recherche.' : 'Ajoutez votre premier produit au catalogue.'}
              </p>
              {!globalSearch && (
                <button
                  onClick={() => setIsDialogOpen(true)}
                  className="text-violet-600 dark:text-violet-400 font-medium text-sm hover:underline"
                >
                  + Ajouter un produit
                </button>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* ── DESKTOP TABLE ── */}
            <div className="hidden sm:block overflow-x-auto rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">ID</TableHead>
                    <TableHead>Produit</TableHead>
                    <TableHead className="text-right">Prix (MAD)</TableHead>
                    <TableHead className="text-center">Statut</TableHead>
                    <TableHead className="text-right w-16">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => (
                    <TableRow key={product.id} className="group cursor-default">
                      <TableCell className="font-mono text-xs text-zinc-500">
                        {product.id.slice(0, 8)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${product.isActive ? 'bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400'}`}>
                            <Tag className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className={`font-medium ${product.isActive ? 'text-zinc-900 dark:text-white' : 'text-zinc-500 dark:text-zinc-400'}`}>
                                {product.name}
                              </h4>
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                                product.type === 'service'
                                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                  : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
                              }`}>
                                {product.type === 'service' ? 'Digital / Service' : 'Produit physique'}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                              {getCategoryName(product.categoryId) && (
                                <span className="text-xs text-zinc-500 dark:text-zinc-400 truncate max-w-xs">
                                  {getCategoryName(product.categoryId)}
                                </span>
                              )}
                              {getSupplierName(product.supplierId) && (
                                <span className="text-[10px] px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-400 font-medium">
                                  Fournisseur: {getSupplierName(product.supplierId)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="font-bold text-zinc-900 dark:text-white">
                          {formatCurrency(fromCents(product.defaultPrice_cents) || 0)}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <button
                          onClick={() => updateProduct(product.id, { isActive: !product.isActive })}
                          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                            product.isActive ? 'bg-violet-600' : 'bg-zinc-300 dark:bg-zinc-700'
                          }`}
                        >
                          <span
                            className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                              product.isActive ? 'translate-x-4' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger>
                            <button className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800 focus:outline-none">
                              <MoreHorizontal className="w-4 h-4" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => { setEditingProduct(product); setIsDialogOpen(true); }}>
                              <Pencil className="w-4 h-4 mr-2" />
                              Modifier
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => setProductToDelete(product.id)} className="text-rose-600 focus:bg-rose-50 focus:text-rose-600 dark:focus:bg-rose-900/20 dark:focus:text-rose-400">
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

            {/* ── MOBILE CARDS ── */}
            <div className="sm:hidden space-y-3">
              {filteredProducts.map((product) => (
                <Card key={product.id} className="border-zinc-200 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${product.isActive ? 'bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400'}`}>
                          <Tag className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className={`font-medium ${product.isActive ? 'text-zinc-900 dark:text-white' : 'text-zinc-500 dark:text-zinc-400'}`}>
                            {product.name}
                          </h4>
                          <span className="text-xs text-zinc-500 block mt-0.5">ID: {product.id.slice(0, 8)}</span>
                          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                            {getCategoryName(product.categoryId) && (
                              <span className="text-xs text-zinc-500 dark:text-zinc-400 truncate max-w-[150px]">
                                {getCategoryName(product.categoryId)}
                              </span>
                            )}
                            {getSupplierName(product.supplierId) && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-400 font-medium">
                                {getSupplierName(product.supplierId)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="relative ml-2 shrink-0 flex items-center gap-2">
                        <button
                          onClick={() => updateProduct(product.id, { isActive: !product.isActive })}
                          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                            product.isActive ? 'bg-violet-600' : 'bg-zinc-300 dark:bg-zinc-700'
                          }`}
                        >
                          <span
                            className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                              product.isActive ? 'translate-x-4' : 'translate-x-1'
                            }`}
                          />
                        </button>
                        <DropdownMenu>
                          <DropdownMenuTrigger>
                            <button className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors bg-zinc-50 dark:bg-zinc-800/50">
                              <MoreHorizontal className="w-4 h-4" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => { setEditingProduct(product); setIsDialogOpen(true); }}>
                              <Pencil className="w-4 h-4 mr-2" />
                              Modifier
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => setProductToDelete(product.id)} className="text-rose-600 focus:bg-rose-50 focus:text-rose-600 dark:focus:bg-rose-900/20 dark:focus:text-rose-400">
                              <Trash2 className="w-4 h-4 mr-2" />
                              Supprimer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        product.type === 'service'
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                          : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
                      }`}>
                        {product.type === 'service' ? 'Digital / Service' : 'Produit physique'}
                      </span>
                      <div className="font-bold text-zinc-900 dark:text-white">
                        {formatCurrency(fromCents(product.defaultPrice_cents) || 0)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>

      {isDialogOpen && (
        <ProductDialog
          product={editingProduct}
          onClose={() => setIsDialogOpen(false)}
        />
      )}

      <ConfirmDialog
        isOpen={!!productToDelete}
        title="Supprimer le produit"
        description="Êtes-vous sûr de vouloir supprimer ce produit du catalogue ? Cette action est irréversible."
        confirmText="Supprimer"
        onConfirm={() => {
          if (productToDelete) deleteProduct(productToDelete);
          setProductToDelete(null);
        }}
        onCancel={() => setProductToDelete(null)}
      />
    </ScrollReveal>
  );
}
