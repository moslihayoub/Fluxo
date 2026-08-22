import { StateCreator } from 'zustand';
import type { StoreState } from '../useStore';
import type { BusinessClient, BusinessSupplier, BusinessCategory, BusinessProduct, BusinessOrder, BusinessFee, BusinessSettings } from '@/types';
import { generateId, cleanForFirebase } from '@/lib/utils';
import { db, auth } from '@/lib/firebase';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { 
  BusinessClientSchema, 
  BusinessSupplierSchema, 
  BusinessCategorySchema, 
  BusinessProductSchema, 
  BusinessOrderSchema, 
  BusinessFeeSchema 
} from '@/lib/schemas';

const getUid = () => auth.currentUser?.uid;

export interface BusinessSlice {
  businessClients: BusinessClient[];
  businessSuppliers: BusinessSupplier[];
  businessCategories: BusinessCategory[];
  businessProducts: BusinessProduct[];
  businessOrders: BusinessOrder[];
  businessFees: BusinessFee[];
  businessSettings: BusinessSettings;

  setBusinessSettings: (settings: BusinessSettings) => void;

  addBusinessClient: (client: Omit<BusinessClient, 'id' | 'createdAt' | 'updatedAt' | 'userId' | 'totalSpent_cents' | 'totalPending_cents'>) => void;
  updateBusinessClient: (id: string, updates: Partial<BusinessClient>) => void;
  deleteBusinessClient: (id: string) => void;

  addBusinessSupplier: (supplier: Omit<BusinessSupplier, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => BusinessSupplier | undefined;
  updateBusinessSupplier: (id: string, updates: Partial<BusinessSupplier>) => void;
  deleteBusinessSupplier: (id: string) => void;

  addBusinessCategory: (category: Omit<BusinessCategory, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => BusinessCategory | void;
  updateBusinessCategory: (id: string, updates: Partial<BusinessCategory>) => void;
  deleteBusinessCategory: (id: string) => void;

  addBusinessProduct: (product: Omit<BusinessProduct, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => void;
  updateBusinessProduct: (id: string, updates: Partial<BusinessProduct>) => void;
  deleteBusinessProduct: (id: string) => void;

  addBusinessOrder: (order: Omit<BusinessOrder, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => void;
  updateBusinessOrder: (id: string, updates: Partial<BusinessOrder>) => void;
  deleteBusinessOrder: (id: string) => void;

  addBusinessFee: (fee: Omit<BusinessFee, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => void;
  updateBusinessFee: (id: string, updates: Partial<BusinessFee>) => void;
  deleteBusinessFee: (id: string) => void;
}

export const createBusinessSlice: StateCreator<
  StoreState,
  [],
  [],
  BusinessSlice
> = (set, get) => ({
  businessClients: [],
  businessSuppliers: [],
  businessCategories: [],
  businessProducts: [],
  businessOrders: [],
  businessFees: [],
  businessSettings: {
    companyName: '',
    address: '',
    identifiers: [],
    countryCode: 'MA',
    currency: 'MAD',
    defaultTaxMode: 'HT',
    defaultTaxRate: 20,
    incomeTaxRateProduct: 0.5,
    incomeTaxRateService: 1.0,
    customPaymentMethods: []
  },

  setBusinessSettings: (settings) => {
    set({ businessSettings: settings });
    const uid = getUid();
    if (uid) {
      setDoc(doc(db, 'users', uid, 'businessSettings', 'main'), cleanForFirebase(settings), { merge: true }).catch(console.error);
    }
  },

  // ── Business Clients ─────────────────────────────────────
  addBusinessClient: (clientData) => {
    const uid = getUid();
    const newClient: BusinessClient = {
      ...clientData,
      id: generateId(),
      totalSpent_cents: 0,
      totalPending_cents: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId: uid || 'local-user',
    };
    const parsed = BusinessClientSchema.safeParse(newClient);
    if (!parsed.success) {
      console.error(parsed.error);
      toast.error('Client invalide');
      return;
    }
    set((state) => ({ businessClients: [...state.businessClients, parsed.data] }));
    if (uid) setDoc(doc(db, 'users', uid, 'businessClients', parsed.data.id), cleanForFirebase(parsed.data)).catch(console.error);
  },

  updateBusinessClient: (id, updates) => {
    const uid = getUid();
    const existing = get().businessClients.find(c => c.id === id);
    if (!existing) return;
    const updated = { ...existing, ...updates, updatedAt: new Date().toISOString() };
    const parsed = BusinessClientSchema.safeParse(updated);
    if (!parsed.success) {
      toast.error('Mise à jour client invalide');
      return;
    }
    set((state) => ({
      businessClients: state.businessClients.map((c) => c.id === id ? parsed.data : c),
    }));
    if (uid) setDoc(doc(db, 'users', uid, 'businessClients', id), cleanForFirebase(updates), { merge: true }).catch(console.error);
  },

  deleteBusinessClient: (id) => {
    set((state) => ({ businessClients: state.businessClients.filter((c) => c.id !== id) }));
    const uid = getUid();
    if (uid) deleteDoc(doc(db, 'users', uid, 'businessClients', id)).catch(console.error);
  },

  // ── Business Suppliers ───────────────────────────────────
  addBusinessSupplier: (supplierData) => {
    const uid = getUid();
    const newSupplier: BusinessSupplier = {
      ...supplierData,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId: uid || 'local-user',
    };
    const parsed = BusinessSupplierSchema.safeParse(newSupplier);
    if (!parsed.success) {
      console.error(parsed.error);
      toast.error('Fournisseur invalide');
      return undefined;
    }
    set((state) => ({ businessSuppliers: [...state.businessSuppliers, parsed.data] }));
    const uid_ = getUid();
    if (uid_) setDoc(doc(db, 'users', uid_, 'businessSuppliers', parsed.data.id), cleanForFirebase(parsed.data)).catch(console.error);
    return parsed.data;
  },

  updateBusinessSupplier: (id, updates) => {
    const uid = getUid();
    const existing = get().businessSuppliers.find(s => s.id === id);
    if (!existing) return;
    const updated = { ...existing, ...updates, updatedAt: new Date().toISOString() };
    const parsed = BusinessSupplierSchema.safeParse(updated);
    if (!parsed.success) return;
    set((state) => ({
      businessSuppliers: state.businessSuppliers.map((s) => s.id === id ? parsed.data : s),
    }));
    if (uid) setDoc(doc(db, 'users', uid, 'businessSuppliers', id), cleanForFirebase(updates), { merge: true }).catch(console.error);
  },

  deleteBusinessSupplier: (id) => {
    set((state) => ({ businessSuppliers: state.businessSuppliers.filter((s) => s.id !== id) }));
    const uid = getUid();
    if (uid) deleteDoc(doc(db, 'users', uid, 'businessSuppliers', id)).catch(console.error);
  },

  // ── Business Categories ──────────────────────────────────
  addBusinessCategory: (categoryData) => {
    const uid = getUid();
    const newCategory: BusinessCategory = {
      ...categoryData,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId: uid || 'local-user',
    };
    const parsed = BusinessCategorySchema.safeParse(newCategory);
    if (!parsed.success) return;
    set((state) => ({ businessCategories: [...state.businessCategories, parsed.data] }));
    if (uid) setDoc(doc(db, 'users', uid, 'businessCategories', parsed.data.id), cleanForFirebase(parsed.data)).catch(console.error);
    return parsed.data;
  },

  updateBusinessCategory: (id, updates) => {
    const uid = getUid();
    const existing = get().businessCategories.find(c => c.id === id);
    if (!existing) return;
    const updated = { ...existing, ...updates, updatedAt: new Date().toISOString() };
    const parsed = BusinessCategorySchema.safeParse(updated);
    if (!parsed.success) return;
    set((state) => ({
      businessCategories: state.businessCategories.map((c) => c.id === id ? parsed.data : c),
    }));
    if (uid) setDoc(doc(db, 'users', uid, 'businessCategories', id), cleanForFirebase(updates), { merge: true }).catch(console.error);
  },

  deleteBusinessCategory: (id) => {
    set((state) => ({ businessCategories: state.businessCategories.filter((c) => c.id !== id) }));
    const uid = getUid();
    if (uid) deleteDoc(doc(db, 'users', uid, 'businessCategories', id)).catch(console.error);
  },

  // ── Business Products ────────────────────────────────────
  addBusinessProduct: (productData) => {
    const uid = getUid();
    const newProduct: BusinessProduct = {
      ...productData,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId: uid || 'local-user',
    };
    const parsed = BusinessProductSchema.safeParse(newProduct);
    if (!parsed.success) {
      console.error(parsed.error);
      toast.error('Produit invalide');
      return;
    }
    set((state) => ({ businessProducts: [...state.businessProducts, parsed.data] }));
    if (uid) setDoc(doc(db, 'users', uid, 'businessProducts', parsed.data.id), cleanForFirebase(parsed.data)).catch(console.error);
  },

  updateBusinessProduct: (id, updates) => {
    const uid = getUid();
    const existing = get().businessProducts.find(p => p.id === id);
    if (!existing) return;
    const updated = { ...existing, ...updates, updatedAt: new Date().toISOString() };
    const parsed = BusinessProductSchema.safeParse(updated);
    if (!parsed.success) return;
    set((state) => ({
      businessProducts: state.businessProducts.map((p) => p.id === id ? parsed.data : p),
    }));
    if (uid) setDoc(doc(db, 'users', uid, 'businessProducts', id), cleanForFirebase(updates), { merge: true }).catch(console.error);
  },

  deleteBusinessProduct: (id) => {
    set((state) => ({ businessProducts: state.businessProducts.filter((p) => p.id !== id) }));
    const uid = getUid();
    if (uid) deleteDoc(doc(db, 'users', uid, 'businessProducts', id)).catch(console.error);
  },

  // ── Business Orders ──────────────────────────────────────
  addBusinessOrder: (orderData) => {
    const uid = getUid();
    const newOrder: BusinessOrder = {
      ...orderData,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId: uid || 'local-user',
    };
    const parsed = BusinessOrderSchema.safeParse(newOrder);
    if (!parsed.success) {
      console.error(parsed.error);
      toast.error('Commande invalide');
      return;
    }
    set((state) => ({ businessOrders: [...state.businessOrders, parsed.data] }));
    if (uid) setDoc(doc(db, 'users', uid, 'businessOrders', parsed.data.id), cleanForFirebase(parsed.data)).catch(console.error);
  },

  updateBusinessOrder: (id, updates) => {
    const uid = getUid();
    const existing = get().businessOrders.find(o => o.id === id);
    if (!existing) return;
    const updated = { ...existing, ...updates, updatedAt: new Date().toISOString() };
    const parsed = BusinessOrderSchema.safeParse(updated);
    if (!parsed.success) return;
    set((state) => ({
      businessOrders: state.businessOrders.map((o) => o.id === id ? parsed.data : o),
    }));
    if (uid) setDoc(doc(db, 'users', uid, 'businessOrders', id), cleanForFirebase(updates), { merge: true }).catch(console.error);
  },

  deleteBusinessOrder: (id) => {
    set((state) => ({ businessOrders: state.businessOrders.filter((o) => o.id !== id) }));
    const uid = getUid();
    if (uid) deleteDoc(doc(db, 'users', uid, 'businessOrders', id)).catch(console.error);
  },

  // ── Business Fees ────────────────────────────────────────
  addBusinessFee: (feeData) => {
    const uid = getUid();
    const newFee: BusinessFee = {
      ...feeData,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId: uid || 'local-user',
    };
    const parsed = BusinessFeeSchema.safeParse(newFee);
    if (!parsed.success) {
      console.error(parsed.error);
      toast.error('Frais invalide');
      return;
    }
    set((state) => ({ businessFees: [...state.businessFees, parsed.data] }));
    if (uid) setDoc(doc(db, 'users', uid, 'businessFees', parsed.data.id), cleanForFirebase(parsed.data)).catch(console.error);
  },

  updateBusinessFee: (id, updates) => {
    const uid = getUid();
    const existing = get().businessFees.find(f => f.id === id);
    if (!existing) return;
    const updated = { ...existing, ...updates, updatedAt: new Date().toISOString() };
    const parsed = BusinessFeeSchema.safeParse(updated);
    if (!parsed.success) return;
    set((state) => ({
      businessFees: state.businessFees.map((f) => f.id === id ? parsed.data : f),
    }));
    if (uid) setDoc(doc(db, 'users', uid, 'businessFees', id), cleanForFirebase(updates), { merge: true }).catch(console.error);
  },

  deleteBusinessFee: (id) => {
    set((state) => ({ businessFees: state.businessFees.filter((f) => f.id !== id) }));
    const uid = getUid();
    if (uid) deleteDoc(doc(db, 'users', uid, 'businessFees', id)).catch(console.error);
  },
});
