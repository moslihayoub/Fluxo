'use client';

import { useState } from 'react';
import { Package, X, Loader2, Boxes } from 'lucide-react';
import { useStore } from '@/store/useStore';
import type { BusinessMaterial, StockNature } from '@/types';
import toast from 'react-hot-toast';
import { Input } from '@/components/ui/Input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/Select';
import { fromCents, toCents } from '@/lib/utils';

interface MaterialDialogProps {
  material?: BusinessMaterial;
  onClose: () => void;
}

export default function MaterialDialog({ material, onClose }: MaterialDialogProps) {
  const addMaterial = useStore((s) => s.addBusinessMaterial);
  const updateMaterial = useStore((s) => s.updateBusinessMaterial);
  const suppliers = useStore((s) => s.businessSuppliers) || [];

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: material?.name || '',
    nature: (material?.nature || 'raw_material') as StockNature,
    unit: material?.unit || 'pièce',
    stockQuantity: material?.stockQuantity?.toString() || '0',
    minQuantityAlert: material?.minQuantityAlert?.toString() || '10',
    unitCostPrice: material?.unitCostPrice_cents ? fromCents(material.unitCostPrice_cents).toString() : '',
    supplierId: material?.supplierId || '',
    hasConversion: material?.hasConversion || false,
    capacityPerUnit: material?.capacityPerUnit?.toString() || '',
    consumptionUnit: material?.consumptionUnit || 'g',
  });

  const parsePriceToCents = (priceStr: string): number => {
    if (!priceStr) return 0;
    const clean = priceStr.replace(/\s/g, '').replace(',', '.');
    const num = parseFloat(clean);
    return isNaN(num) ? 0 : toCents(num);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!formData.name.trim()) {
      toast.error('Le nom de l\'article est requis.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        name: formData.name.trim(),
        nature: formData.nature,
        unit: formData.unit,
        stockQuantity: parseFloat(formData.stockQuantity) || 0,
        minQuantityAlert: parseFloat(formData.minQuantityAlert) || 0,
        unitCostPrice_cents: parsePriceToCents(formData.unitCostPrice),
        supplierId: formData.supplierId || undefined,
        hasConversion: formData.hasConversion,
        capacityPerUnit: formData.hasConversion ? parseFloat(formData.capacityPerUnit) : undefined,
        consumptionUnit: formData.hasConversion ? formData.consumptionUnit : undefined,
      };

      if (material) {
        updateMaterial(material.id, payload);
        toast.success('Article mis à jour avec succès');
      } else {
        addMaterial(payload);
        toast.success('Article ajouté au stock');
      }
      onClose();
    } catch (err) {
      toast.error('Une erreur est survenue');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center sm:justify-end">
      {/* Backdrop with desktop protection against accidental close */}
      <div
        className="absolute sm:fixed inset-0 bg-zinc-950/50 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={() => {
          if (typeof window !== 'undefined' && window.innerWidth < 640) {
            onClose();
          }
        }}
      />

      {/* Drawer container */}
      <div className="relative sm:fixed sm:inset-y-0 sm:right-0 z-10 bg-white dark:bg-zinc-900 w-full max-w-md sm:max-w-none sm:w-[50%] max-w-xl rounded-3xl sm:rounded-none sm:rounded-l-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] sm:max-h-none sm:h-full animate-in fade-in sm:slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-zinc-100 dark:bg-zinc-800 rounded-xl flex items-center justify-center text-zinc-900 dark:text-white">
              <Boxes className="w-5 h-5 text-violet-600 dark:text-violet-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
                {material ? "Détail de l'article" : "Nouvel article en stock"}
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {material ? "Consultez et modifiez les caractéristiques de l'article" : "Ajoutez une matière première, un composant ou un article"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <form id="material-form" onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
                Nature de l'article *
              </label>
              <Select
                value={formData.nature}
                onValueChange={(val: StockNature) => setFormData({ ...formData, nature: val })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="raw_material">Matière Première</SelectItem>
                  <SelectItem value="finished_product">Produit Fini (Revente directe)</SelectItem>
                  <SelectItem value="consumable">Consommable / Emballage</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
                Nom de l'article *
              </label>
              <Input
                autoFocus
                placeholder="Ex: Bobine PLA Bleu 1kg, Tissu Coton, Boîte carton..."
                value={formData.name}
                onChange={(e: any) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
                  Stock initial
                </label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.stockQuantity}
                  onChange={(e: any) => setFormData({ ...formData, stockQuantity: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
                  Unité de stockage
                </label>
                <Select
                  value={formData.unit}
                  onValueChange={(val: string) => setFormData({ ...formData, unit: val })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pièce">Pièce(s)</SelectItem>
                    <SelectItem value="g">Grammes (g)</SelectItem>
                    <SelectItem value="kg">Kilogrammes (kg)</SelectItem>
                    <SelectItem value="ml">Millilitres (ml)</SelectItem>
                    <SelectItem value="L">Litres (L)</SelectItem>
                    <SelectItem value="m">Mètres (m)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
                  Seuil d'alerte stock
                </label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.minQuantityAlert}
                  onChange={(e: any) => setFormData({ ...formData, minQuantityAlert: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
                  Coût pour 1 {formData.unit} (MAD)
                </label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.unitCostPrice}
                  onChange={(e: any) => setFormData({ ...formData, unitCostPrice: e.target.value })}
                  iconRight={<span className="text-zinc-400 text-sm font-medium pr-2">MAD</span>}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
                Fournisseur Habituel <span className="normal-case font-normal">(optionnel)</span>
              </label>
              <Select
                value={formData.supplierId}
                onValueChange={(val: string) => setFormData({ ...formData, supplierId: val === 'none' ? '' : val })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="— Sélectionner un fournisseur —" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">— Aucun —</SelectItem>
                  {suppliers.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.brandName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-6 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex items-center justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-xl text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            Annuler
          </button>
          <button
            type="submit"
            form="material-form"
            disabled={isSubmitting}
            className="px-6 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-medium transition-all shadow-sm flex items-center gap-2 disabled:opacity-50"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {material ? "Enregistrer" : "Créer l'article"}
          </button>
        </div>
      </div>
    </div>
  );
}
