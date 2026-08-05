'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { AppState, Month, Operation, OperationType, ActiveView } from '@/types';
import { generateId } from '@/lib/utils';
import { db, auth } from '@/lib/firebase';
import { doc, setDoc, deleteDoc, writeBatch } from 'firebase/firestore';
import toast from 'react-hot-toast';

// ── Default operation types ───────────────────────────────────
const DEFAULT_OPERATION_TYPES: OperationType[] = [
  { id: 'ot-1', label: 'Encaissement client', createdAt: new Date().toISOString() },
  { id: 'ot-2', label: 'Commission banque', createdAt: new Date().toISOString() },
  { id: 'ot-3', label: 'Abonnement', createdAt: new Date().toISOString() },
  { id: 'ot-4', label: 'Salaire', createdAt: new Date().toISOString() },
  { id: 'ot-5', label: 'Loyer', createdAt: new Date().toISOString() },
  { id: 'ot-6', label: 'Facture', createdAt: new Date().toISOString() },
  { id: 'ot-7', label: 'Frais divers', createdAt: new Date().toISOString() },
  { id: 'ot-8', label: 'Remboursement', createdAt: new Date().toISOString() },
];

// Helper to get user uid
const getUid = () => auth.currentUser?.uid;

// Helper to remove undefined values for Firebase
const cleanForFirebase = (obj: any) => {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, v]) => v !== undefined)
  );
};

// ── Store implementation ──────────────────────────────────────
const storeCreator = (set: any, get: any): AppState & { language: 'fr' | 'en'; setLanguage: (lang: 'fr' | 'en') => void } => ({
  // ── State ──────────────────────────────────────────────
  months: [],
  operations: [],
  operationTypes: DEFAULT_OPERATION_TYPES,
  activeMonthId: null,
  activeView: 'months',
  filter: 'all',
  language: 'fr',
  setLanguage: (language: 'fr' | 'en') => set({ language }),

  // ── Month actions ───────────────────────────────────────
  addMonth: (month: number, year: number) => {
    const existing = get().months.find(
      (m: Month) => m.month === month && m.year === year
    );
    if (existing) {
      return {
        success: false,
        error: 'Ce mois existe déjà, choisissez une autre combinaison.',
      };
    }
    const newMonth: Month = {
      id: generateId(),
      month,
      year,
      status: 'active',
      createdAt: new Date().toISOString(),
    };
    
    // Update local state
    set((state: AppState) => ({ months: [...state.months, newMonth] }));

    // Write to Firestore if authenticated
    const uid = getUid();
    if (uid) {
      setDoc(doc(db, 'users', uid, 'months', newMonth.id), newMonth).catch(console.error);
    }

    return { success: true };
  },

  archiveMonth: (id: string) => {
    set((state: AppState) => ({
      months: state.months.map((m) =>
        m.id === id ? { ...m, status: 'archived' } : m
      ),
      activeMonthId: state.activeMonthId === id ? null : state.activeMonthId,
    }));

    const uid = getUid();
    if (uid) {
      setDoc(doc(db, 'users', uid, 'months', id), { status: 'archived' }, { merge: true }).catch(console.error);
    }
  },

  deleteMonth: (id: string) => {
    set((state: AppState) => ({
      months: state.months.filter((m) => m.id !== id),
      operations: state.operations.filter((o) => o.monthId !== id),
      activeMonthId: state.activeMonthId === id ? null : state.activeMonthId,
    }));

    const uid = getUid();
    if (uid) {
      // Create a batch to delete the month and all its operations
      const batch = writeBatch(db);
      
      // Delete the month document
      batch.delete(doc(db, 'users', uid, 'months', id));
      
      // Delete all operations for this month
      const opsToDelete = get().operations.filter((o: Operation) => o.monthId === id);
      opsToDelete.forEach((op: Operation) => {
        batch.delete(doc(db, 'users', uid, 'operations', op.id));
      });
      
      batch.commit().catch(console.error);
    }
  },

  restoreMonth: (id: string) => {
    set((state: AppState) => ({
      months: state.months.map((m) =>
        m.id === id ? { ...m, status: 'active' } : m
      ),
    }));

    const uid = getUid();
    if (uid) {
      setDoc(doc(db, 'users', uid, 'months', id), { status: 'active' }, { merge: true }).catch(console.error);
    }
  },

  setActiveMonth: (id: string) => {
    set({ activeMonthId: id });
  },

  // ── Operation actions ───────────────────────────────────
  addOperation: (op) => {
    const newOp: Operation = {
      ...op,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };

    set((state: AppState) => ({ operations: [...state.operations, newOp] }));

    const uid = getUid();
    if (uid) {
      setDoc(doc(db, 'users', uid, 'operations', newOp.id), cleanForFirebase(newOp)).catch(console.error);
    } else {
      toast('Attention: Vos données ne sont sauvegardées que sur ce navigateur. Connectez-vous via le menu pour ne pas les perdre !', {
        icon: '⚠️',
        duration: 5000,
        style: {
          borderRadius: '10px',
          background: '#fff3cd',
          color: '#856404',
        },
      });
    }
  },

  updateOperation: (id, op) => {
    set((state: AppState) => ({
      operations: state.operations.map((o) =>
        o.id === id ? { ...o, ...op } : o
      ),
    }));

    const uid = getUid();
    if (uid) {
      setDoc(doc(db, 'users', uid, 'operations', id), cleanForFirebase(op), { merge: true }).catch(console.error);
    }
  },

  deleteOperation: (id) => {
    set((state: AppState) => ({
      operations: state.operations.filter((o) => o.id !== id),
    }));

    const uid = getUid();
    if (uid) {
      deleteDoc(doc(db, 'users', uid, 'operations', id)).catch(console.error);
    }
  },

  addOperations: (ops) => {
    const newOps: Operation[] = ops.map((op) => ({
      ...op,
      id: generateId(),
      createdAt: new Date().toISOString(),
    }));

    set((state: AppState) => ({ operations: [...state.operations, ...newOps] }));

    const uid = getUid();
    if (uid) {
      const batch = writeBatch(db);
      newOps.forEach(op => {
        const ref = doc(db, 'users', uid, 'operations', op.id);
        batch.set(ref, cleanForFirebase(op));
      });
      batch.commit().catch(console.error);
    }
  },

  // ── OperationType actions ────────────────────────────────
  addOperationType: (label: string, defaultAmount?: number, kind?: 'encaissement' | 'decaissement') => {
    const existing = get().operationTypes.find(
      (ot: OperationType) => ot.label.toLowerCase() === label.toLowerCase()
    );
    const uid = getUid();
    
    if (existing) {
      if ((defaultAmount !== undefined && existing.defaultAmount !== defaultAmount) || (kind !== undefined && existing.kind !== kind)) {
        const updated = { ...existing, defaultAmount: defaultAmount ?? existing.defaultAmount, kind: kind ?? existing.kind };
        set((state: AppState) => ({
          operationTypes: state.operationTypes.map(ot => ot.id === existing.id ? updated : ot)
        }));
        if (uid) {
          setDoc(doc(db, 'users', uid, 'operationTypes', existing.id), { defaultAmount: updated.defaultAmount, kind: updated.kind }, { merge: true }).catch(console.error);
        }
        return updated;
      }
      return existing;
    }

    const newType: OperationType = {
      id: generateId(),
      label,
      defaultAmount,
      kind,
      createdAt: new Date().toISOString(),
    };
    
    set((state: AppState) => ({
      operationTypes: [...state.operationTypes, newType],
    }));

    if (uid) {
      setDoc(doc(db, 'users', uid, 'operationTypes', newType.id), newType).catch(console.error);
    }
    
    return newType;
  },

  updateOperationType: (id: string, updates: Partial<OperationType>) => {
    set((state: AppState) => ({
      operationTypes: state.operationTypes.map((ot) =>
        ot.id === id ? { ...ot, ...updates } : ot
      ),
    }));

    const uid = getUid();
    if (uid) {
      setDoc(doc(db, 'users', uid, 'operationTypes', id), updates, { merge: true }).catch(console.error);
    }
  },

  deleteOperationType: (id: string) => {
    set((state: AppState) => ({
      operationTypes: state.operationTypes.filter((ot) => ot.id !== id),
    }));

    const uid = getUid();
    if (uid) {
      deleteDoc(doc(db, 'users', uid, 'operationTypes', id)).catch(console.error);
    }
  },

  // ── UI actions ───────────────────────────────────────────
  setActiveView: (view: ActiveView) => set({ activeView: view }),
  setFilter: (filter: 'all' | 'encaissement' | 'decaissement') => set({ filter }),
});

const _useStore = create<AppState>()(
  persist(storeCreator, {
    name: 'charges-encaissements-store',
    storage: typeof window !== 'undefined' ? createJSONStorage(() => localStorage) : undefined,
    partialize: (state) => ({
      months: state.months,
      operations: state.operations,
      operationTypes: state.operationTypes,
      activeMonthId: state.activeMonthId,
      activeView: state.activeView,
      filter: state.filter,
      language: state.language,
    }),
  })
);

// Singleton protection across Next.js HMR/chunks
const globalForStore = globalThis as unknown as { __STORE_INSTANCE_V2__?: typeof _useStore };
export const useStore = globalForStore.__STORE_INSTANCE_V2__ ?? _useStore;
if (process.env.NODE_ENV !== 'production') globalForStore.__STORE_INSTANCE_V2__ = useStore;
