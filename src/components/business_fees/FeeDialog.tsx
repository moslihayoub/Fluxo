'use client';

import { useState, useEffect } from 'react';
import { X, Receipt, Calendar, FileText, DollarSign, Building2, Tag, CheckCircle2, Loader2, Plus, Users } from 'lucide-react';
import { useStore } from '@/store/useStore';
import type { BusinessFee } from '@/types';
import toast from 'react-hot-toast';
import { Input } from '@/components/ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Combobox } from '@/components/ui/Combobox';
import { fromCents, toCents, generateId } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface FeeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  fee: BusinessFee | null;
}

const DEFAULT_CATEGORIES = [
  'Loyer',
  'Salaires',
  'Marketing & Publicité',
  'Abonnements Logiciels',
  'Électricité & Internet',
  'Fournitures de bureau',
  'Transport & Déplacements',
  'Impôts & Taxes',
  'Frais bancaires',
  'Autre'
];

export default function FeeDialog({ isOpen, onClose, fee }: FeeDialogProps) {
  const addFee = useStore((s) => s.addBusinessFee);
  const updateFee = useStore((s) => s.updateBusinessFee);
  const suppliers = useStore((s) => s.businessSuppliers);
  
  const supplierOptions = suppliers.map(s => ({ id: s.brandName, label: s.brandName }));

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isNewSupplier, setIsNewSupplier] = useState(false);
  
  const [supplierMode, setSupplierMode] = useState<'existing' | 'new'>(fee?.supplierId ? 'existing' : 'existing');
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    label: '',
    amount: '',
    category: 'Loyer',
    customCategory: '',
    supplierName: '',
    supplierId: '',
  });

  useEffect(() => {
    if (isOpen) {
      if (fee) {
        setIsNewSupplier(!fee.supplierId);
        const isDefaultCat = ['Loyer', 'Électricité & Eau', 'Internet & Téléphone', 'Logiciels & Abonnements', 'Salaires', 'Marketing & Pub', 'Autre'].includes(fee.category);
        setFormData({
          date: fee.date.split('T')[0],
          label: fee.label,
          amount: fee.amount_cents === 0 ? '' : fromCents(fee.amount_cents).toString(),
          category: isDefaultCat ? fee.category : 'Autre',
          customCategory: isDefaultCat ? '' : fee.category,
          supplierName: fee.supplierName || '',
          supplierId: fee.supplierId || '',
        });
      } else {
        setIsNewSupplier(false);
        setFormData({
          date: new Date().toISOString().split('T')[0],
          label: '',
          amount: '',
          category: 'Loyer',
          customCategory: '',
          supplierName: '',
          supplierId: '',
        });
      }
    }
  }, [isOpen, fee, suppliers]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!formData.label.trim() || !formData.amount) {
      toast.error('Le libellé et le montant sont obligatoires');
      return;
    }

    const finalCategory = formData.category === 'Autre' && formData.customCategory.trim() 
      ? formData.customCategory.trim() 
      : formData.category;

    setIsSubmitting(true);

    try {
      const selectedSupplierName = !isNewSupplier 
        ? formData.supplierId 
        : formData.supplierName.trim();

      const payload = {
        date: new Date(formData.date).toISOString(),
        label: formData.label.trim(),
        amount_cents: toCents(parseFloat(formData.amount) || 0),
        category: finalCategory,
        supplierName: selectedSupplierName || undefined,
        supplierId: !isNewSupplier ? (formData.supplierId || undefined) : undefined,
      };

      if (fee) {
        updateFee(fee.id, payload);
        toast.success('Frais modifié');
      } else {
        addFee({ ...payload, id: generateId() } as any);
        toast.success('Frais ajouté');
      }

      onClose();
    } catch (err) {
      toast.error("Erreur lors de l'enregistrement");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center sm:block p-4 sm:p-0">
      <div 
        className="absolute sm:fixed inset-0 bg-zinc-950/50 backdrop-blur-sm animate-in fade-in duration-200" 
        onClick={() => {
          if (typeof window !== 'undefined' && window.innerWidth < 640) {
            onClose();
          }
        }} 
      />
      <div className="relative sm:fixed sm:inset-y-0 sm:right-0 z-10 bg-white dark:bg-zinc-900 w-full max-w-md sm:max-w-none sm:w-[50%] rounded-3xl sm:rounded-none sm:rounded-l-3xl shadow-xl overflow-hidden flex flex-col max-h-[90vh] sm:max-h-none sm:h-full animate-in fade-in sm:slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white flex items-center justify-center">
              <Receipt className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
              {fee ? 'Détail du frais' : 'Ajouter un frais'}
            </h2>
          </div>
          
          <button onClick={onClose} className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-full text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          <form id="fee-form" onSubmit={handleSubmit} className="space-y-6">
            
            <div className="space-y-4">
              
              {/* 1. Date */}
              <div>
                <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase block mb-1">
                  Date du frais *
                </label>
                <Input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  iconLeft={<Calendar className="w-4 h-4" />}
                />
              </div>

              {/* 2. Fournisseur (Optionnel) */}
              <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/60">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase">
                    Fournisseur (Optionnel)
                  </label>
                  
                  {/* Toggle Existant / Nouveau */}
                  <div className="flex bg-zinc-100 dark:bg-zinc-800/80 p-0.5 rounded-lg border border-zinc-200 dark:border-zinc-700/50">
                    <button
                      type="button"
                      className={cn(
                        "px-3 py-1 text-[11px] font-bold rounded-md transition-all",
                        !isNewSupplier
                          ? "bg-white dark:bg-zinc-900 text-violet-700 dark:text-violet-400 shadow-xs border border-zinc-200/50 dark:border-zinc-700/50"
                          : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                      )}
                      onClick={() => {
                        setIsNewSupplier(false);
                        setFormData({ ...formData, supplierName: '' });
                      }}
                    >
                      <span className="flex items-center gap-1"><Users className="w-3 h-3" /> Existant</span>
                    </button>
                    <button
                      type="button"
                      className={cn(
                        "px-3 py-1 text-[11px] font-bold rounded-md transition-all",
                        isNewSupplier
                          ? "bg-violet-600 text-white shadow-xs"
                          : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                      )}
                      onClick={() => {
                        setIsNewSupplier(true);
                        setFormData({ ...formData, supplierId: '' });
                      }}
                    >
                      <span className="flex items-center gap-1"><Plus className="w-3 h-3" /> Nouveau</span>
                    </button>
                  </div>
                </div>
                
                {!isNewSupplier ? (
                  <Select
                    value={formData.supplierId}
                    onValueChange={(val) => setFormData({ ...formData, supplierId: val })}
                  >
                    <SelectTrigger className="w-full h-11 bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 rounded-xl">
                      <SelectValue placeholder="Sélectionner un fournisseur existant" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-xl">
                      {supplierOptions.map(opt => (
                        <SelectItem key={opt.id} value={opt.id} className="cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800">
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    type="text"
                    value={formData.supplierName}
                    onChange={(e) => setFormData({ ...formData, supplierName: e.target.value })}
                    placeholder="Saisissez le nom librement..."
                    iconLeft={<Building2 className="w-4 h-4" />}
                  />
                )}
              </div>

              {/* 3. Catégorie */}
              <div>
                <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase block mb-1">
                  Catégorie
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10 pointer-events-none text-zinc-400">
                    <Tag className="w-4 h-4" />
                  </div>
                  <Select
                    value={formData.category}
                    onValueChange={(val) => setFormData({ ...formData, category: val })}
                  >
                    <SelectTrigger className="w-full pl-9 h-11 bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 rounded-xl">
                      <SelectValue placeholder="Choisir une catégorie" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-xl">
                      {DEFAULT_CATEGORIES.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {formData.category === 'Autre' && (
                <div>
                  <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase block mb-1">
                    Précisez la catégorie
                  </label>
                  <Input
                    type="text"
                    required
                    value={formData.customCategory}
                    onChange={(e) => setFormData({ ...formData, customCategory: e.target.value })}
                    placeholder="Ex: Entretien local"
                  />
                </div>
              )}

              {/* 4. Prix (MAD) */}
              <div>
                <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase block mb-1">
                  Montant (MAD) *
                </label>
                <Input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="0.00"
                  iconLeft={<DollarSign className="w-4 h-4" />}
                />
              </div>

              {/* 5. Libellé / Description */}
              <div>
                <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase block mb-1">
                  Libellé / Description *
                </label>
                <Input
                  type="text"
                  required
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  placeholder="Ex: Facture Redal Mars"
                  iconLeft={<FileText className="w-4 h-4" />}
                />
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
            form="fee-form"
            disabled={isSubmitting}
            className="px-6 py-2.5 bg-violet-600 dark:bg-violet-500 text-white rounded-xl font-bold hover:bg-violet-700 dark:hover:bg-violet-600 transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : fee ? (
              <><CheckCircle2 className="w-4 h-4" /> Enregistrer</>
            ) : (
              <><Receipt className="w-4 h-4" /> Créer</>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
