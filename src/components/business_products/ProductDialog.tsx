'use client';

import { useState, useEffect } from 'react';
import { Package, Laptop, X, CheckCircle2, Building2, Plus, Loader2 } from 'lucide-react';
import { useStore } from '@/store/useStore';
import type { BusinessProduct, BusinessSupplier } from '@/types';
import toast from 'react-hot-toast';
import { CategorySelector } from '@/components/ui/CategorySelector';
import { Input } from '@/components/ui/Input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/Select';
import { fromCents, toCents } from '@/lib/utils';
import SupplierDialog from '@/components/business_suppliers/SupplierDialog';

interface ProductDialogProps {
  product?: BusinessProduct;
  onClose: () => void;
}

export default function ProductDialog({ product, onClose }: ProductDialogProps) {
  const addProduct = useStore((s) => s.addBusinessProduct);
  const updateProduct = useStore((s) => s.updateBusinessProduct);
  const suppliers = useStore((s) => s.businessSuppliers) || [];

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSupplierDialogOpen, setIsSupplierDialogOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    name: product?.name || '',
    type: (product?.type || 'product') as 'product' | 'service',
    defaultPrice: product?.defaultPrice_cents ? fromCents(product.defaultPrice_cents).toString() : '',
    resellerPrice: product?.resellerPrice_cents ? fromCents(product.resellerPrice_cents).toString() : '',
    categoryId: product?.categoryId || '',
    supplierId: product?.supplierId || '',
    isActive: product !== undefined ? product.isActive : true,
    isFree: product?.isFree || false,
    discountRate: product?.discountRate?.toString() || '',
  });

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        type: (product.type || 'product') as 'product' | 'service',
        defaultPrice: product.defaultPrice_cents ? fromCents(product.defaultPrice_cents).toString() : '',
        resellerPrice: product.resellerPrice_cents ? fromCents(product.resellerPrice_cents).toString() : '',
        categoryId: product.categoryId || '',
        supplierId: product.supplierId || '',
        isActive: product.isActive,
        isFree: product.isFree || false,
        discountRate: product.discountRate?.toString() || '',
      });
    }
  }, [product]);

  const parsePriceToCents = (priceStr: string): number => {
    if (!priceStr) return 0;
    // Remove spaces, replace comma with dot
    const clean = priceStr.replace(/\s/g, '').replace(',', '.');
    const num = parseFloat(clean);
    return isNaN(num) ? 0 : toCents(num);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!formData.name.trim()) {
      toast.error('Le nom du produit est requis.');
      return;
    }
    
    setIsSubmitting(true);

    try {
      const defaultPriceInCents = parsePriceToCents(formData.defaultPrice);
      const resellerPriceInCents = formData.resellerPrice ? parsePriceToCents(formData.resellerPrice) : undefined;

      const payload = {
        name: formData.name.trim(),
        type: formData.type,
        defaultPrice_cents: defaultPriceInCents,
        resellerPrice_cents: resellerPriceInCents,
        categoryId: formData.categoryId || undefined,
        supplierId: formData.supplierId || undefined,
        isActive: formData.isActive,
        isFree: formData.isFree,
        discountRate: formData.discountRate ? parseFloat(formData.discountRate) : undefined,
      };

      if (product) {
        updateProduct(product.id, payload);
        toast.success(formData.type === 'service' ? 'Service mis à jour' : 'Produit mis à jour');
      } else {
        addProduct(payload);
        toast.success(formData.type === 'service' ? 'Service ajouté' : 'Produit ajouté');
      }

      onClose();
    } catch (err) {
      toast.error('Une erreur est survenue lors de l\'enregistrement');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-[100] flex items-center justify-center sm:block p-4 sm:p-0">
        <div className="absolute sm:fixed inset-0 bg-zinc-950/50 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose} />
        <div className="relative sm:fixed sm:inset-y-0 sm:right-0 z-10 bg-white dark:bg-zinc-900 w-full max-w-md sm:max-w-none sm:w-[50%] rounded-3xl sm:rounded-none sm:rounded-l-3xl shadow-xl overflow-hidden flex flex-col max-h-[90vh] sm:max-h-none sm:h-full animate-in fade-in sm:slide-in-from-right duration-300">
          
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-violet-100 dark:bg-violet-900/30 rounded-xl flex items-center justify-center">
                {formData.type === 'service' ? (
                  <Laptop className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                ) : (
                  <Package className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                )}
              </div>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
                {product 
                  ? (formData.type === 'service' ? 'Modifier le service' : 'Modifier le produit')
                  : (formData.type === 'service' ? 'Nouveau service / Digital' : 'Nouveau produit physique')}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            <form id="product-form" onSubmit={handleSubmit} className="space-y-6">
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
                    {formData.type === 'service' ? 'Nom du service / prestation *' : 'Nom du produit *'}
                  </label>
                  <Input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder={formData.type === 'service' ? 'Ex: Prestation dev web, Licence logiciel, Audit...' : 'Ex: T-shirt basique, Casque Bluetooth, Smartphone...'}
                    className="mt-1"
                    data-testid="product-name-input"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
                    Type de produit *
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, type: 'product' })}
                      className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                        formData.type === 'product'
                          ? 'border-violet-600 bg-violet-50/50 dark:bg-violet-950/20 text-violet-900 dark:text-violet-300 ring-2 ring-violet-500/20 font-medium'
                          : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-700'
                      }`}
                    >
                      <div className={`p-2 rounded-lg shrink-0 ${formData.type === 'product' ? 'bg-violet-600 text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'}`}>
                        <Package className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold">Produit Physique</div>
                        <div className="text-[10px] text-zinc-500 dark:text-zinc-400">Marchandise, stock</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, type: 'service' })}
                      className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                        formData.type === 'service'
                          ? 'border-violet-600 bg-violet-50/50 dark:bg-violet-950/20 text-violet-900 dark:text-violet-300 ring-2 ring-violet-500/20 font-medium'
                          : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-700'
                      }`}
                    >
                      <div className={`p-2 rounded-lg shrink-0 ${formData.type === 'service' ? 'bg-violet-600 text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'}`}>
                        <Laptop className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold">Digital / Service</div>
                        <div className="text-[10px] text-zinc-500 dark:text-zinc-400">Prestation, virtuel</div>
                      </div>
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <CategorySelector
                    value={formData.categoryId}
                    onChange={(id) => setFormData({ ...formData, categoryId: id })}
                    productType={formData.type}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
                      Prix public
                    </label>
                    <Input
                      type="number"
                      min="0"
                      step="any"
                      value={formData.defaultPrice}
                      onChange={(e) => setFormData({ ...formData, defaultPrice: e.target.value })}
                      placeholder="0.00"
                      iconRight={<span className="text-zinc-400 text-sm font-medium pr-2">MAD</span>}
                      data-testid="product-price-input"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
                      Prix revendeur (Achat)
                    </label>
                    <Input
                      type="number"
                      min="0"
                      step="any"
                      value={formData.resellerPrice}
                      onChange={(e) => setFormData({ ...formData, resellerPrice: e.target.value })}
                      placeholder="0.00"
                      iconRight={<span className="text-zinc-400 text-sm font-medium pr-2">MAD</span>}
                      data-testid="product-reseller-price-input"
                    />
                  </div>
                </div>

                {/* Association Fournisseur */}
                <div className="p-4 bg-zinc-50 dark:bg-zinc-800/60 rounded-xl border border-zinc-200 dark:border-zinc-700/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
                      Fournisseur associé (Optionnel)
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsSupplierDialogOpen(true)}
                      className="text-xs font-semibold text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Nouveau fournisseur
                    </button>
                  </div>

                  <Select
                    value={formData.supplierId}
                    onValueChange={(val) => setFormData({ ...formData, supplierId: val === 'none' ? '' : val })}
                  >
                    <SelectTrigger className="w-full h-10 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700">
                      <SelectValue placeholder="Sélectionner un fournisseur..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Aucun fournisseur</SelectItem>
                      {suppliers.map((supp) => (
                        <SelectItem key={supp.id} value={supp.id}>
                          {supp.brandName} {supp.contactName ? `(${supp.contactName})` : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <label className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 cursor-pointer">
                  <div>
                    <div className="text-sm font-medium text-zinc-900 dark:text-white">Actif dans le catalogue</div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Le produit sera proposé lors des ventes</div>
                  </div>
                  <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData.isActive ? 'bg-violet-600' : 'bg-zinc-300 dark:bg-zinc-700'}`}>
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.isActive ? 'translate-x-6' : 'translate-x-1'}`} />
                  </div>
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  />
                </label>
                
                {/* Promotions et gratuité */}
                <div className="pt-2 mt-2 border-t border-zinc-200 dark:border-zinc-800">
                  <h4 className="text-sm font-semibold text-zinc-900 dark:text-white mb-4">Prix et Promotions</h4>
                  
                  <label className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 cursor-pointer mb-4">
                    <div>
                      <div className="text-sm font-medium text-zinc-900 dark:text-white flex items-center gap-2">
                        Produit gratuit
                      </div>
                      <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Offrir ce produit à tous les clients</div>
                    </div>
                    <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData.isFree ? 'bg-violet-600' : 'bg-zinc-300 dark:bg-zinc-700'}`}>
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.isFree ? 'translate-x-6' : 'translate-x-1'}`} />
                    </div>
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={formData.isFree}
                      onChange={(e) => setFormData({ ...formData, isFree: e.target.checked })}
                    />
                  </label>

                  {!formData.isFree && (
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                        Promotion globale (%)
                      </label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        step="1"
                        value={formData.discountRate}
                        onChange={(e) => setFormData({ ...formData, discountRate: e.target.value })}
                        placeholder="Ex: 10 pour 10%"
                        className="mt-1"
                        iconRight={<span className="text-zinc-400 text-sm font-medium pr-2">%</span>}
                        data-testid="product-discount-input"
                      />
                    </div>
                  )}
                </div>
              </div>
              
            </form>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 flex justify-end gap-3 bg-zinc-50 dark:bg-zinc-800/40">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-xl font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              form="product-form"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-violet-600 dark:bg-violet-500 text-white rounded-xl font-bold hover:bg-violet-700 dark:hover:bg-violet-600 transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : product ? (
                <><CheckCircle2 className="w-4 h-4" /> Enregistrer</>
              ) : (
                <><Package className="w-4 h-4" /> Créer</>
              )}
            </button>
          </div>

        </div>
      </div>

      {/* Nested Supplier Dialog */}
      {isSupplierDialogOpen && (
        <SupplierDialog
          isOpen={isSupplierDialogOpen}
          onClose={() => setIsSupplierDialogOpen(false)}
          supplier={null}
        />
      )}
    </>
  );
}
