import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { AppState, Month, Operation, OperationType, ActiveView } from '@/types';
import { generateId } from '@/lib/utils';

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

// ── Store implementation ──────────────────────────────────────
const storeCreator = (set: any, get: any): AppState => ({
  // ── State ──────────────────────────────────────────────
  months: [],
  operations: [],
  operationTypes: DEFAULT_OPERATION_TYPES,
  activeMonthId: null,
  activeView: 'months',
  filter: 'all',

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
    set((state: AppState) => ({ months: [...state.months, newMonth] }));
    return { success: true };
  },

  archiveMonth: (id: string) => {
    set((state: AppState) => ({
      months: state.months.map((m) =>
        m.id === id ? { ...m, status: 'archived' } : m
      ),
      activeMonthId: state.activeMonthId === id ? null : state.activeMonthId,
    }));
  },

  restoreMonth: (id: string) => {
    set((state: AppState) => ({
      months: state.months.map((m) =>
        m.id === id ? { ...m, status: 'active' } : m
      ),
    }));
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
  },

  updateOperation: (id, op) => {
    set((state: AppState) => ({
      operations: state.operations.map((o) =>
        o.id === id ? { ...o, ...op } : o
      ),
    }));
  },

  deleteOperation: (id) => {
    set((state: AppState) => ({
      operations: state.operations.filter((o) => o.id !== id),
    }));
  },

  addOperations: (ops) => {
    const newOps: Operation[] = ops.map((op) => ({
      ...op,
      id: generateId(),
      createdAt: new Date().toISOString(),
    }));
    set((state: AppState) => ({ operations: [...state.operations, ...newOps] }));
  },

  // ── OperationType actions ────────────────────────────────
  addOperationType: (label: string) => {
    const existing = get().operationTypes.find(
      (ot: OperationType) => ot.label.toLowerCase() === label.toLowerCase()
    );
    if (existing) return existing;

    const newType: OperationType = {
      id: generateId(),
      label,
      createdAt: new Date().toISOString(),
    };
    set((state: AppState) => ({
      operationTypes: [...state.operationTypes, newType],
    }));
    return newType;
  },

  // ── UI actions ───────────────────────────────────────────
  setActiveView: (view: ActiveView) => set({ activeView: view }),
  setFilter: (filter: 'all' | 'encaissement' | 'decaissement') => set({ filter }),
});

const _useStore = create<AppState>()(
  persist(storeCreator, {
    name: 'charges-encaissements-store',
    storage: createJSONStorage(() => localStorage),
    partialize: (state) => ({
      months: state.months,
      operations: state.operations,
      operationTypes: state.operationTypes,
      activeMonthId: state.activeMonthId,
      activeView: state.activeView,
      filter: state.filter,
    }),
  })
);

// Singleton protection across Next.js HMR/chunks
const globalForStore = globalThis as unknown as { __STORE_INSTANCE__?: typeof _useStore };
export const useStore = globalForStore.__STORE_INSTANCE__ ?? _useStore;
if (process.env.NODE_NODE_ENV !== 'production') globalForStore.__STORE_INSTANCE__ = useStore;
