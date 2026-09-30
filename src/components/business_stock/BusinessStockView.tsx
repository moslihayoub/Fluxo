'use client';

import { useState } from 'react';
import { Package, Plus, Search, AlertTriangle, CheckCircle2, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { useStore } from '@/store/useStore';
import type { BusinessMaterial } from '@/types';
import { formatCurrency, fromCents } from '@/lib/utils';
import MaterialDialog from './MaterialDialog';
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
} from "@/components/ui/dropdown-menu";
import { ScrollReveal } from '@/components/ui/Animation';

export default function BusinessStockView() {
  const materials = useStore((s) => s.businessMaterials) || [];
  const suppliers = useStore((s) => s.businessSuppliers) || [];
  const globalSearch = useStore((s) => s.globalSearch) || '';
  const deleteMaterial = useStore((s) => s.deleteBusinessMaterial);
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<BusinessMaterial | undefined>();
  const [materialToDelete, setMaterialToDelete] = useState<string | null>(null);

  const getSupplierName = (id?: string) => {
    if (!id) return '';
    return suppliers.find(s => s.id === id)?.brandName || '';
  };

  const getNatureLabel = (nature: string) => {
    switch(nature) {
      case 'raw_material': return 'Matière Première';
      case 'finished_product': return 'Produit Fini';
      case 'consumable': return 'Consommable';
      default: return nature;
    }
  };

  const filteredMaterials = materials.filter(m => 
    m.name.toLowerCase().includes(globalSearch.toLowerCase())
  );

  const totalValue = materials.reduce((acc, m) => acc + (m.stockQuantity * m.unitCostPrice_cents), 0);
  const lowStockCount = materials.filter(m => m.stockQuantity <= m.minQuantityAlert).length;

  return (
    <ScrollReveal className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <Package className="w-7 h-7 text-violet-600 dark:text-violet-400" />
            Stock & Matières
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Gérez vos matières premières, consommables et produits finis.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setEditingMaterial(undefined);
              setIsDialogOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-medium transition-all shadow-sm"
          >
            <Plus className="w-5 h-5" /> Ajouter
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Total Articles</p>
                <p className="text-2xl font-bold text-zinc-900 dark:text-white mt-1">{materials.length}</p>
              </div>
              <div className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-xl">
                <Package className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Valeur en Stock</p>
                <p className="text-2xl font-bold text-zinc-900 dark:text-white mt-1">{formatCurrency(fromCents(totalValue))}</p>
              </div>
              <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Ruptures & Alertes</p>
                <p className={`text-2xl font-bold mt-1 ${lowStockCount > 0 ? 'text-red-600 dark:text-red-400' : 'text-zinc-900 dark:text-white'}`}>
                  {lowStockCount}
                </p>
              </div>
              <div className={`p-3 rounded-xl ${lowStockCount > 0 ? 'bg-red-100 dark:bg-red-900/30' : 'bg-zinc-100 dark:bg-zinc-800'}`}>
                <AlertTriangle className={`w-5 h-5 ${lowStockCount > 0 ? 'text-red-600 dark:text-red-400' : 'text-zinc-700 dark:text-zinc-300'}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-zinc-50/50 dark:bg-zinc-900/50">
              <TableRow>
                <TableHead className="w-[300px]">Article</TableHead>
                <TableHead>Nature</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Coût Unitaire</TableHead>
                <TableHead>Valeur</TableHead>
                <TableHead>Fournisseur</TableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMaterials.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-zinc-500">
                    Aucun article en stock.
                  </TableCell>
                </TableRow>
              ) : (
                filteredMaterials.map((item) => {
                  const isLow = item.stockQuantity <= item.minQuantityAlert;
                  const value = formatCurrency(fromCents(item.stockQuantity * item.unitCostPrice_cents));
                  return (
                    <TableRow key={item.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50">
                      <TableCell>
                        <div className="font-medium text-zinc-900 dark:text-white">{item.name}</div>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                          {getNatureLabel(item.nature)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className={`flex items-center gap-1.5 font-medium ${isLow ? 'text-red-600 dark:text-red-400' : 'text-zinc-900 dark:text-white'}`}>
                          {item.stockQuantity} {item.unit}
                          {isLow && <AlertTriangle className="w-3.5 h-3.5" />}
                        </div>
                      </TableCell>
                      <TableCell>{formatCurrency(fromCents(item.unitCostPrice_cents))}</TableCell>
                      <TableCell className="font-medium">{value}</TableCell>
                      <TableCell className="text-zinc-500">{getSupplierName(item.supplierId) || '-'}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors">
                            <MoreHorizontal className="w-4 h-4 text-zinc-500" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuItem onClick={() => { setEditingMaterial(item); setIsDialogOpen(true); }}>
                              <Pencil className="w-4 h-4 mr-2" /> Modifier
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={() => setMaterialToDelete(item.id)}>
                              <Trash2 className="w-4 h-4 mr-2" /> Supprimer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {isDialogOpen && (
        <MaterialDialog 
          material={editingMaterial} 
          onClose={() => {
            setIsDialogOpen(false);
            setEditingMaterial(undefined);
          }} 
        />
      )}

      {materialToDelete && (
        <ConfirmDialog
          isOpen={true}
          title="Supprimer l'article ?"
          description="Cette action est irréversible. Les produits qui utilisent cet article dans leur composition pourraient être affectés."
          confirmText="Supprimer"
          onConfirm={() => {
            deleteMaterial(materialToDelete);
            setMaterialToDelete(null);
          }}
          onCancel={() => setMaterialToDelete(null)}
        />
      )}
    </ScrollReveal>
  );
}
