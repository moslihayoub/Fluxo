import { useState, useEffect, useRef } from 'react';
import { X, ShoppingBag, User, DollarSign, Percent, Info, MapPin, Phone, Truck, FileText, CheckCircle2, ChevronRight } from 'lucide-react';
import { useStore } from '@/store/useStore';
import type { BusinessOrder, PaymentStatus, OrderItem } from '@/types';
import { generateId, fromCents, toCents } from '@/lib/utils';
import toast from 'react-hot-toast';
import { Combobox } from '@/components/ui/Combobox';
import { Input } from '@/components/ui/Input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/Select';
import { PhoneInput } from '@/components/ui/PhoneInput';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CategorySelector } from '@/components/ui/CategorySelector';
import { XCircle, ChevronDown } from 'lucide-react';

interface OrderDialogProps {
  isOpen: boolean;
  onClose: () => void;
  order: BusinessOrder | null;
}

export default function OrderDialog({ isOpen, onClose, order }: OrderDialogProps) {
  const firstNameInputRef = useRef<HTMLInputElement>(null);
  const addOrder = useStore((s) => s.addBusinessOrder);
  const updateOrder = useStore((s) => s.updateBusinessOrder);
  const addBusinessClient = useStore((s) => s.addBusinessClient);
  const addBusinessProduct = useStore((s) => s.addBusinessProduct);
  const addBusinessSupplier = useStore((s) => s.addBusinessSupplier);
  const clients = useStore((s) => s.businessClients);
  const suppliers = useStore((s) => s.businessSuppliers) || [];
  const products = useStore((s) => s.businessProducts) || [];
  const businessProfileType = useStore((s) => s.businessProfileType);
  const businessSettings = useStore((s) => s.businessSettings);
  const setBusinessSettings = useStore((s) => s.setBusinessSettings);
  const customPaymentMethods = useStore((s) => s.businessSettings.customPaymentMethods || []);

  const clientOptions = clients.map(c => ({ id: c.id, label: `${c.name} ${c.isVip ? '⭐' : ''} ${c.phone ? `(${c.phone})` : ''}`.trim(), client: c }));
  const supplierOptions = suppliers.map(s => ({ id: s.id, label: s.brandName, supplier: s }));
  const productOptions = products.filter(p => p.isActive).map(p => ({ id: p.id, label: p.name, product: p }));

  const defaultPaymentMethods = ['Espèces', 'Virement bancaire', 'Chèque', 'Carte bancaire', 'TPE', 'Paiement à la livraison'];
  const allPaymentMethods = Array.from(new Set([...defaultPaymentMethods, ...customPaymentMethods]));

  const [formData, setFormData] = useState({
    clientId: '',
    clientFirstName: '',
    clientLastName: '',
    clientName: '',
    clientPhone: '',
    clientAddress: '',
    items: [] as OrderItem[],
    discountRate: 0,
    shippingFee_cents: 0,
    advancePaid_cents: 0,
    paymentMethod: 'Espèces',
    customPaymentMethod: '',
  });

  useEffect(() => {
    if (isOpen) {
      if (order) {
        const nameParts = (order.clientName || '').split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ');
        setFormData({
          clientId: order.clientId || '',
          clientFirstName: firstName,
          clientLastName: lastName,
          clientName: order.clientName,
          clientPhone: order.clientPhone || '',
          clientAddress: order.clientAddress || '',
          items: order.items?.length > 0 ? order.items : (order.productName ? [{
            id: generateId(),
            productName: order.productName,
            quantity: order.quantity || 1,
            unitCostPrice_cents: order.unitCostPrice_cents || 0,
            unitSellingPrice_cents: order.unitSellingPrice_cents || 0,
            isFree: order.isFree || false,
          }] : []),
          discountRate: order.discountRate || 0,
          shippingFee_cents: order.shippingFee_cents || 0,
          advancePaid_cents: order.advancePaid_cents || 0,
          paymentMethod: order.paymentMethod || 'Espèces',
          customPaymentMethod: '',
        });
      } else {
        setFormData({
          clientId: '',
          clientFirstName: '',
          clientLastName: '',
          clientName: '',
          clientPhone: '',
          clientAddress: '',
          items: [{
            id: generateId(),
            productName: '',
            quantity: 1,
            unitCostPrice_cents: 0,
            unitSellingPrice_cents: 0,
            isFree: false,
          }],
          discountRate: 0,
          shippingFee_cents: 0,
          advancePaid_cents: 0,
          paymentMethod: 'Espèces',
          customPaymentMethod: '',
        });
      }
    }
  }, [isOpen, order]);

  // Handle Client Selection
  // (Logic moved directly to Combobox onChange for simplicity and closures)

  // Calculations
  const taxMode = (businessProfileType === 'company' ? 'TVA' : 'HT') as 'TVA' | 'HT';
  const taxRate = taxMode === 'TVA' ? 20 : 0;
  
  const subtotalBeforeDiscount = formData.items.reduce((acc, item) => {
    const basePrice = item.isFree ? 0 : item.unitSellingPrice_cents;
    return acc + (basePrice * item.quantity);
  }, 0);
  
  const discountAmount = (subtotalBeforeDiscount * (formData.discountRate || 0)) / 100;
  
  const amountHT = subtotalBeforeDiscount - discountAmount;
  const amountTVA = taxMode === 'TVA' ? (amountHT * 0.2) : 0;
  const amountTTC = amountHT + amountTVA + (formData.shippingFee_cents || 0);
  
  const remainingBalance = Math.max(0, amountTTC - formData.advancePaid_cents);
  const advancePercent = amountTTC > 0 ? Math.min(100, Math.max(0, (formData.advancePaid_cents / amountTTC) * 100)) : 0;
  
  let paymentStatus: PaymentStatus = 'unpaid';
  if (remainingBalance === 0 && amountTTC > 0) paymentStatus = 'paid';
  else if (formData.advancePaid_cents > 0) paymentStatus = 'partial';
  // If cart is fully free
  if (amountTTC === 0 && formData.items.length > 0 && formData.items.every(i => i.isFree)) paymentStatus = 'paid';

  // Cost & Profit
  const totalCost = formData.items.reduce((acc, item) => acc + (item.unitCostPrice_cents * item.quantity), 0);
  const netProfit = amountHT - totalCost;

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.items.length === 0 || formData.items.some(i => !i.productName || i.quantity < 1)) {
      toast.error('Veuillez remplir correctement tous les articles.');
      return;
    }

    const finalPaymentMethod = formData.paymentMethod === 'Autre' && formData.customPaymentMethod.trim() !== '' 
      ? formData.customPaymentMethod.trim() 
      : formData.paymentMethod;

    if (finalPaymentMethod && !defaultPaymentMethods.includes(finalPaymentMethod) && !customPaymentMethods.includes(finalPaymentMethod)) {
      setBusinessSettings({
        ...businessSettings,
        customPaymentMethods: [...customPaymentMethods, finalPaymentMethod]
      });
    }

    // Determine final client name
    const finalClientName = formData.clientId 
      ? formData.clientName 
      : [formData.clientFirstName, formData.clientLastName].filter(Boolean).join(' ').trim();

    let finalClientId = formData.clientId;

    // Auto-create client if not exists and name is provided
    if (!finalClientId && finalClientName) {
      const newClientId = generateId();
      const newClient = {
        id: newClientId,
        name: finalClientName,
        phone: formData.clientPhone,
        address: formData.clientAddress,
        type: 'individual' as const,
        ordersCount: 0,
        totalSpent: 0,
        defaultDiscountRate: 0,
        isVip: false
      };
      addBusinessClient(newClient as any);
      finalClientId = newClientId;
    }

    // Auto-create suppliers & products
    formData.items.forEach(item => {
      let finalSupplierId = item.supplierId;
      if (item.supplierId && !suppliers.find(s => s.id === item.supplierId)) {
        // It's a new brand name, create the supplier
        finalSupplierId = generateId();
        addBusinessSupplier({
          brandName: item.supplierId,
          phone: '',
        });
      }

      if (item.saveToCatalog && item.productName) {
        const existing = products.find(p => p.name.toLowerCase() === item.productName.toLowerCase());
        if (!existing) {
          addBusinessProduct({
            name: item.productName,
            type: 'product',
            defaultPrice_cents: item.unitSellingPrice_cents,
            categoryId: item.categoryId || '',
            supplierId: finalSupplierId || '',
            isActive: true,
          });
        }
      }
    });

    const payload = {
      orderNumber: order?.orderNumber || `CMD-${Date.now().toString().slice(-6)}`,
      date: order?.date || new Date().toISOString(),
      clientId: finalClientId || undefined,
      clientName: finalClientName || 'Client Divers',
      clientPhone: formData.clientPhone,
      clientAddress: formData.clientAddress,
      
      items: formData.items,
      
      // Fallback for older single-item readers just in case
      productName: formData.items[0]?.productName || '',
      quantity: formData.items[0]?.quantity || 1,
      unitCostPrice_cents: formData.items[0]?.unitCostPrice_cents || 0,
      unitSellingPrice_cents: formData.items[0]?.unitSellingPrice_cents || 0,
      isFree: formData.items[0]?.isFree || false,
      
      discountRate: formData.discountRate,
      discountAmount,
      
      taxMode,
      taxRate,
      amountHT_cents: amountHT,
      amountTVA_cents: amountTVA,
      amountTTC_cents: amountTTC,
      
      shippingFee_cents: formData.shippingFee_cents,
      extraFees: [],
      totalFees: formData.shippingFee_cents,
      
      paymentMethod: finalPaymentMethod,
      paymentStatus,
      advancePaid_cents: formData.advancePaid_cents,
      remainingBalance,
      
      netProfit_cents: netProfit,
      totalFees_cents: 0,
      remainingBalance_cents: remainingBalance,
    };

    if (order) {
      updateOrder(order.id, payload);
      toast.success('Commande modifiée');
    } else {
      addOrder(payload);
      toast.success('Commande ajoutée');
    }
    onClose();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD' }).format(amount);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center sm:block p-4 sm:p-0">
      <div 
        className="absolute sm:fixed inset-0 bg-zinc-950/60 backdrop-blur-sm animate-in fade-in duration-200" 
        onClick={() => {
          if (typeof window !== 'undefined' && window.innerWidth < 640) {
            onClose();
          }
        }} 
      />
      <div className="relative sm:fixed sm:inset-y-0 sm:right-0 z-10 bg-white dark:bg-zinc-900 w-full max-w-2xl sm:max-w-none sm:w-[50%] rounded-3xl sm:rounded-none sm:rounded-l-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] sm:max-h-none sm:h-full animate-in fade-in sm:slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-zinc-900 dark:text-white" />
            </div>{order ? 'Modifier la vente' : 'Nouvelle Vente'}
          </h2>
          <button onClick={onClose} className="p-2 bg-zinc-200 dark:bg-zinc-800 rounded-full text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 md:p-8">
          <form id="order-form" onSubmit={handleSubmit} className="space-y-8">
            
            {/* Section: Client */}
            <section className="space-y-4">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <User className="w-4 h-4 text-zinc-900 dark:text-white" /> Informations Client
              </h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase mb-1 block">Rechercher un client existant</label>
                  <Combobox
                    options={clientOptions}
                    value={formData.clientId}
                    clearOnSelect={true}
                    allowCustom={true}
                    customLabel="Ajouter"
                    onChange={(val, opt) => {
                      if (opt) {
                        // Case 1: Existing client selected -> Populate inputs & clear search bar
                        const nameParts = (opt.client.name || '').split(' ');
                        const firstName = nameParts[0] || '';
                        const lastName = nameParts.slice(1).join(' ');
                        setFormData(prev => ({
                          ...prev,
                          clientId: opt.id,
                          clientFirstName: firstName,
                          clientLastName: lastName,
                          clientName: opt.client.name,
                          clientPhone: opt.client.phone || '',
                          clientAddress: opt.client.address || '',
                          discountRate: opt.client.defaultDiscountRate || 0,
                        }));
                      } else if (val) {
                        // Case 2: Custom search term added (+ Ajouter "xxx") -> Fill name & focus Prénom input
                        const nameParts = val.trim().split(' ');
                        const firstName = nameParts[0] || '';
                        const lastName = nameParts.slice(1).join(' ');
                        setFormData(prev => ({
                          ...prev,
                          clientId: '',
                          clientFirstName: firstName,
                          clientLastName: lastName,
                          clientName: val.trim(),
                        }));
                        setTimeout(() => {
                          firstNameInputRef.current?.focus();
                          firstNameInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }, 50);
                      }
                    }}
                    placeholder="Chercher par nom ou téléphone..."
                  />
                  {!formData.clientId && formData.clientFirstName === '' && formData.clientLastName === '' && (
                    <p className="text-xs text-zinc-500 mt-1">Vous pouvez rechercher un client ou saisir ses informations ci-dessous.</p>
                  )}
                </div>

                <div className="md:col-span-1">
                  <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase mb-1 block">Prénom *</label>
                  <Input 
                    ref={firstNameInputRef}
                    type="text" 
                    placeholder="Prénom du client" 
                    value={formData.clientFirstName}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        clientId: '', // Reset clientId if edited manually
                        clientFirstName: e.target.value
                      });
                    }}
                  />
                </div>
                
                <div className="md:col-span-1">
                  <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase mb-1 block">Nom (Optionnel)</label>
                  <Input 
                    type="text" 
                    placeholder="Nom du client" 
                    value={formData.clientLastName}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        clientId: '',
                        clientLastName: e.target.value
                      });
                    }}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase block mb-1">Téléphone</label>
                  <PhoneInput 
                    value={formData.clientPhone} 
                    onChange={val => {
                      // Autocomplete check if a client with this phone exists
                      const existingClient = clients.find(c => c.phone && c.phone.replace(/\D/g, '') === val.replace(/\D/g, ''));
                      if (existingClient && !formData.clientId) {
                        const nameParts = (existingClient.name || '').split(' ');
                        setFormData({
                          ...formData,
                          clientId: existingClient.id,
                          clientFirstName: nameParts[0] || '',
                          clientLastName: nameParts.slice(1).join(' '),
                          clientName: existingClient.name,
                          clientPhone: val,
                          clientAddress: existingClient.address || '',
                          discountRate: existingClient.defaultDiscountRate || 0,
                        });
                        toast.success('Client auto-complété depuis le téléphone !');
                      } else {
                        setFormData({...formData, clientPhone: val});
                      }
                    }} 
                    placeholder="6 12 34 56 78" 
                  />
                </div>
              </div>
            </section>

            <hr className="border-zinc-100 dark:border-zinc-800" />

            {/* Section: Produit & Prix */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-zinc-900 dark:text-white" /> Détails de la commande
                </h3>
                <button
                  type="button"
                  onClick={() => setFormData({
                    ...formData,
                    items: [...formData.items, { id: generateId(), productName: '', quantity: 1, unitCostPrice_cents: 0, unitSellingPrice_cents: 0, isFree: false }]
                  })}
                  className="text-xs font-semibold px-3 py-1.5 bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400 rounded-lg hover:bg-violet-200 transition-colors"
                >
                  + Ajouter un article
                </button>
              </div>
              
              <div className="space-y-4">
                {formData.items.map((item, index) => (
                  <div key={item.id} className="relative p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
                    {formData.items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, items: formData.items.filter(i => i.id !== item.id) })}
                        className="absolute top-2 right-2 p-1.5 text-zinc-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                    <div className="space-y-4">
                      {/* 1. Recherche catalogue */}
                      <div className="pr-8">
                        <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase block mb-1.5">Rechercher un produit existant</label>
                        <Combobox
                          options={productOptions}
                          value=""
                          clearOnSelect={true}
                          allowCustom={false}
                          onChange={(val, opt) => {
                            if (opt) {
                              setFormData(prev => {
                                const newItems = [...prev.items];
                                const currentItem = newItems[index] || item;
                                const product = opt.product;
                                const client = clients.find(c => c.id === prev.clientId);
                                const isClientFree = client?.freeProductIds?.includes(product.id) || false;
                                const isGloballyFree = product.isFree || false;
                                const isFree = isClientFree || isGloballyFree;

                                newItems[index] = {
                                  ...currentItem,
                                  productName: product.name,
                                  unitSellingPrice_cents: product.defaultPrice_cents || currentItem.unitSellingPrice_cents,
                                  unitCostPrice_cents: currentItem.unitCostPrice_cents,
                                  isFree: isFree,
                                  categoryId: product.categoryId || currentItem.categoryId,
                                  supplierId: product.supplierId || currentItem.supplierId,
                                };
                                return { ...prev, items: newItems };
                              });
                            }
                          }}
                          placeholder="Chercher dans le catalogue..."
                        />
                      </div>

                      {/* 2. Nom du produit + Toggle enregistrer dans catalogue au dessous */}
                      <div className="space-y-2">
                        <div>
                          <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase block mb-1.5">Nom du Produit *</label>
                          <Input
                            type="text"
                            placeholder="Saisissez le nom de l'article"
                            value={item.productName}
                            onChange={(e) => {
                              setFormData(prev => {
                                const newItems = [...prev.items];
                                newItems[index] = { ...newItems[index], productName: e.target.value };
                                return { ...prev, items: newItems };
                              });
                            }}
                          />
                        </div>

                        {/* Option Enregistrer dans le catalogue sous le nom du produit */}
                        <div className="pt-1">
                          <label className="relative inline-flex items-center cursor-pointer gap-2 select-none group">
                            <input
                              type="checkbox"
                              className="sr-only peer"
                              checked={item.saveToCatalog ?? false}
                              onChange={(e) => {
                                const val = e.target.checked;
                                setFormData(prev => {
                                  const newItems = [...prev.items];
                                  newItems[index] = { ...newItems[index], saveToCatalog: val };
                                  return { ...prev, items: newItems };
                                });
                              }}
                            />
                            <div className="relative w-9 h-5 bg-zinc-200 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-zinc-600 peer-checked:bg-violet-600"></div>
                            <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-200 transition-colors">
                              Enregistrer cet article dans mon catalogue produit permanent
                            </span>
                          </label>
                        </div>
                      </div>

                      {/* 3. Catégorie (Pleine largeur pour aérer les actions Créer / Annuler) */}
                      <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/60">
                        <CategorySelector
                          value={item.categoryId || ''}
                          onChange={(catId) => {
                            setFormData(prev => {
                              const newItems = [...prev.items];
                              newItems[index] = { ...newItems[index], categoryId: catId };
                              return { ...prev, items: newItems };
                            });
                          }}
                        />
                      </div>

                      {/* 4. Fournisseur (Au dessous de la catégorie) */}
                      <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/60">
                        <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase block mb-1">
                          Fournisseur (Optionnel)
                        </label>
                        <Combobox
                          options={supplierOptions}
                          value={item.supplierId || ''}
                          onChange={(val, opt) => {
                            setFormData(prev => {
                              const newItems = [...prev.items];
                              newItems[index] = { ...newItems[index], supplierId: opt ? opt.id : val };
                              return { ...prev, items: newItems };
                            });
                          }}
                          placeholder="Saisir ou choisir un fournisseur"
                          allowCustom={true}
                          customLabel="Nouveau fournisseur :"
                        />
                      </div>

                      {/* 4. Quantité, Prix de vente, Prix de revient et Article gratuit sur la même rangée */}
                      <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/60">
                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                          {/* Quantité */}
                          <div className="sm:col-span-2">
                            <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase block mb-1">Qté *</label>
                            <Input 
                              type="number" 
                              min="1" 
                              required 
                              placeholder="1"
                              data-testid="order-quantity-input" 
                              value={item.quantity === 0 ? '' : item.quantity} 
                              onChange={e => {
                                const raw = e.target.value;
                                const val = raw === '' ? 0 : (parseInt(raw) || 0);
                                setFormData(prev => {
                                  const newItems = [...prev.items];
                                  newItems[index] = { ...newItems[index], quantity: val };
                                  return { ...prev, items: newItems };
                                });
                              }} 
                            />
                          </div>

                          {/* Prix de vente unitaire & Prix de revient unitaire */}
                          {!item.isFree ? (
                            <>
                              <div className="sm:col-span-4">
                                <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase block mb-1">Prix de vente unitaire</label>
                                <Input 
                                  type="number" 
                                  min="0" 
                                  placeholder="0"
                                  data-testid={`order-item-${item.id}-selling-price`} 
                                  value={item.unitSellingPrice_cents === 0 ? '' : item.unitSellingPrice_cents} 
                                  onChange={e => {
                                    const raw = e.target.value;
                                    const val = raw === '' ? 0 : (parseFloat(raw) || 0);
                                    setFormData(prev => {
                                      const newItems = [...prev.items];
                                      newItems[index] = { ...newItems[index], unitSellingPrice_cents: val };
                                      return { ...prev, items: newItems };
                                    });
                                  }} 
                                />
                              </div>
                              <div className="sm:col-span-3">
                                <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase block mb-1">Prix de revient</label>
                                <Input 
                                  type="number" 
                                  min="0" 
                                  placeholder="0"
                                  data-testid={`order-item-${item.id}-cost-price`} 
                                  value={item.unitCostPrice_cents === 0 ? '' : item.unitCostPrice_cents} 
                                  onChange={e => {
                                    const raw = e.target.value;
                                    const val = raw === '' ? 0 : (parseFloat(raw) || 0);
                                    setFormData(prev => {
                                      const newItems = [...prev.items];
                                      newItems[index] = { ...newItems[index], unitCostPrice_cents: val };
                                      return { ...prev, items: newItems };
                                    });
                                  }} 
                                />
                              </div>
                            </>
                          ) : (
                            <div className="sm:col-span-7 flex items-center h-10 px-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                              Article offert (0 MAD)
                            </div>
                          )}

                          {/* Toggle Article gratuit (à droite des prix sur la même ligne) */}
                          <div className="sm:col-span-3 flex items-center justify-end h-10 pb-1">
                            <label className="relative inline-flex items-center cursor-pointer select-none">
                              <input 
                                type="checkbox" 
                                className="sr-only peer" 
                                checked={item.isFree} 
                                onChange={e => {
                                  const val = e.target.checked;
                                  setFormData(prev => {
                                    const newItems = [...prev.items];
                                    newItems[index] = { ...newItems[index], isFree: val };
                                    return { ...prev, items: newItems };
                                  });
                                }} 
                              />
                              <div className="relative w-9 h-5 bg-zinc-200 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                              <span className="ml-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300">Gratuit</span>
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <hr className="border-zinc-100 dark:border-zinc-800" />

            {/* Section: Promo & Frais */}
            <section className="space-y-4">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <Percent className="w-4 h-4 text-zinc-900 dark:text-white" /> Promo & Frais annexes
              </h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase flex items-end justify-between h-5 mb-1">
                    <span>Réduction globale (%)</span>
                    {formData.discountRate > 0 && <span className="text-emerald-500 font-bold lowercase tracking-normal">- {formatCurrency(discountAmount)}</span>}
                  </label>
                  <Input 
                    type="number" 
                    min="0" 
                    max="100" 
                    placeholder="0"
                    data-testid="order-discount-rate" 
                    value={formData.discountRate === 0 ? '' : formData.discountRate} 
                    onChange={e => {
                      const raw = e.target.value;
                      const val = raw === '' ? 0 : (parseFloat(raw) || 0);
                      setFormData({...formData, discountRate: val});
                    }} 
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase flex items-end h-5 mb-1">
                    Frais de livraison (MAD)
                  </label>
                  <Input 
                    type="number" 
                    min="0" 
                    placeholder="0"
                    data-testid="order-shipping-fee" 
                    value={formData.shippingFee_cents === 0 ? '' : formData.shippingFee_cents} 
                    onChange={e => {
                      const raw = e.target.value;
                      const val = raw === '' ? 0 : (parseFloat(raw) || 0);
                      setFormData({...formData, shippingFee_cents: val});
                    }} 
                  />
                </div>
              </div>
            </section>

            <hr className="border-zinc-100 dark:border-zinc-800" />

            {/* Section: Paiement */}
            <section className="space-y-4">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-zinc-900 dark:text-white" /> Paiement (Total à payer: {formatCurrency(amountTTC)})
                </div>
              </h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase block mb-2">
                    Moyen de paiement
                  </label>
                  <Select
                    value={defaultPaymentMethods.includes(formData.paymentMethod) || customPaymentMethods.includes(formData.paymentMethod) ? formData.paymentMethod : 'Autre'}
                    onValueChange={(val) => {
                      setFormData({
                        ...formData,
                        paymentMethod: val,
                        customPaymentMethod: val === 'Autre' ? '' : formData.customPaymentMethod
                      });
                    }}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Choisir un paiement..." />
                    </SelectTrigger>
                    <SelectContent>
                      {allPaymentMethods.map(m => (
                        <SelectItem key={m} value={m}>{m}</SelectItem>
                      ))}
                      <SelectItem value="Autre">Autre...</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.paymentMethod === 'Autre' && (
                  <div>
                    <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase block mb-2">
                      Précisez le paiement
                    </label>
                    <Input
                      type="text"
                      placeholder="ex: Wafacash, Western Union..."
                      value={formData.customPaymentMethod}
                      onChange={(e) => setFormData({...formData, customPaymentMethod: e.target.value})}
                      className="mt-1"
                      iconRight={<ChevronRight className="w-4 h-4" />}
                    />
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase flex items-center gap-2">
                    <span>Avance perçue</span>
                    {remainingBalance > 0 && <span className="text-rose-500 font-bold lowercase tracking-normal font-sans">(Reste: {formatCurrency(remainingBalance)})</span>}
                  </label>

                  {/* Segmented Tab Switcher: Payé : Oui / Non */}
                  <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800/80 p-1 rounded-xl shrink-0">
                    <span className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 px-2 uppercase tracking-wider">Payé ?</span>
                    <button
                      type="button"
                      disabled={amountTTC <= 0}
                      onClick={() => setFormData({ ...formData, advancePaid_cents: amountTTC })}
                      className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                        amountTTC > 0 && remainingBalance === 0
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white disabled:opacity-40 disabled:cursor-not-allowed'
                      }`}
                    >
                      Oui
                    </button>
                    <button
                      type="button"
                      disabled={amountTTC <= 0}
                      onClick={() => setFormData({ ...formData, advancePaid_cents: 0 })}
                      className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                        formData.advancePaid_cents === 0
                          ? 'bg-rose-600 text-white shadow-sm'
                          : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white disabled:opacity-40 disabled:cursor-not-allowed'
                      }`}
                    >
                      Non
                    </button>
                  </div>
                </div>

                {/* Dual Input Fields: MAD and % */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 block mb-1">Montant en Dirhams (MAD)</label>
                    <Input
                      type="number"
                      min="0"
                      max={amountTTC}
                      placeholder="0"
                      data-testid="order-advance-paid"
                      value={formData.advancePaid_cents === 0 ? '' : formData.advancePaid_cents}
                      onChange={(e) => {
                        const raw = e.target.value;
                        const val = raw === '' ? 0 : (parseFloat(raw) || 0);
                        setFormData({ ...formData, advancePaid_cents: Math.min(val, amountTTC) });
                      }}
                      className="text-base font-bold text-emerald-600 dark:text-emerald-400 h-11"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 block mb-1">Pourcentage d'avance (%)</label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      placeholder="0%"
                      value={advancePercent === 0 ? '' : Math.round(advancePercent * 10) / 10}
                      onChange={(e) => {
                        const raw = e.target.value;
                        const pct = raw === '' ? 0 : (parseFloat(raw) || 0);
                        const calculatedAmount = Math.min(amountTTC, (pct / 100) * amountTTC);
                        setFormData({ ...formData, advancePaid_cents: Math.round(calculatedAmount * 100) / 100 });
                      }}
                      className="text-base font-bold text-emerald-600 dark:text-emerald-400 h-11"
                      iconRight={<Percent className="w-4 h-4 text-zinc-400" />}
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Récapitulatif (Invisible à l'impression, juste pour le vendeur) */}
            <div className="bg-zinc-50 dark:bg-zinc-950 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Sous-total articles</span>
                <span className="font-semibold">{formatCurrency(subtotalBeforeDiscount)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-sm text-emerald-600">
                  <span>Réduction ({formData.discountRate}%)</span>
                  <span className="font-semibold">-{formatCurrency(discountAmount)}</span>
                </div>
              )}
              {taxMode === 'TVA' && (
                <div className="flex justify-between text-sm border-t border-zinc-100 dark:border-zinc-800 pt-1 mt-1">
                  <span className="text-zinc-500">TVA (20%)</span>
                  <span className="font-semibold">{formatCurrency(amountTVA)}</span>
                </div>
              )}
              {formData.shippingFee_cents > 0 && (
                <div className="flex justify-between text-sm text-blue-600 dark:text-blue-400">
                  <span>Livraison</span>
                  <span className="font-semibold">+{formatCurrency(formData.shippingFee_cents)}</span>
                </div>
              )}
              <div className="flex justify-between text-base border-t border-zinc-200 dark:border-zinc-700 mt-2 pt-2">
                <span className="font-bold text-zinc-900 dark:text-white">Total Client (TTC)</span>
                <span className="font-black text-violet-600 dark:text-violet-400">{formatCurrency(amountTTC)}</span>
              </div>
              {!formData.items.every(i => i.isFree) && (
                <div className="flex justify-between text-sm border-t border-dashed border-emerald-200 dark:border-emerald-900/30 mt-2 pt-2 text-emerald-600 dark:text-emerald-400">
                  <span className="font-semibold flex items-center gap-1"><Info className="w-3 h-3" /> Bénéfice net estimé</span>
                  <span className="font-bold">+{formatCurrency(netProfit)}</span>
                </div>
              )}
            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-xl font-medium hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
          >
            Annuler
          </button>
          <button
            type="submit"
            form="order-form"
            onClick={(e) => {
              const form = document.getElementById('order-form') as HTMLFormElement;
              if (form && typeof form.requestSubmit === 'function') {
                e.preventDefault();
                form.requestSubmit();
              }
            }}
            className="px-6 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-violet-500/25 flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-5 h-5" />
            {order ? 'Enregistrer' : 'Valider la vente'}
          </button>
        </div>

      </div>
    </div>
  );
}
