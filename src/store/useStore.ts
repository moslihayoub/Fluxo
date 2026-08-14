'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

import { createUiSlice, type UiSlice } from './slices/uiSlice';
import { createOperationsSlice, type OperationsSlice } from './slices/operationsSlice';
import { createBusinessSlice, type BusinessSlice } from './slices/businessSlice';
import { createMonthsSlice, type MonthsSlice } from './slices/monthsSlice';

export type StoreState = UiSlice & OperationsSlice & BusinessSlice & MonthsSlice;

const storeCreator = (...args: Parameters<typeof createUiSlice>) => ({
  ...createUiSlice(...args),
  ...createOperationsSlice(...args),
  ...createBusinessSlice(...args),
  ...createMonthsSlice(...args),
});

const _useStore = create<StoreState>()(
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
      workspaceMode: state.workspaceMode,
      businessProfileType: state.businessProfileType,
      businessClients: state.businessClients,
      businessSuppliers: state.businessSuppliers,
      businessCategories: state.businessCategories,
      businessProducts: state.businessProducts,
      businessOrders: state.businessOrders,
      businessFees: state.businessFees,
      businessSettings: state.businessSettings,
      language: state.language,
      currency: state.currency,
      theme: state.theme,
      linkProGainsToPerso: state.linkProGainsToPerso,
    }),
  })
);

// Singleton protection across Next.js HMR/chunks
const globalForStore = globalThis as unknown as { __STORE_INSTANCE_V2__?: typeof _useStore };
export const useStore = globalForStore.__STORE_INSTANCE_V2__ ?? _useStore;
if (process.env.NODE_ENV !== 'production') globalForStore.__STORE_INSTANCE_V2__ = useStore;
