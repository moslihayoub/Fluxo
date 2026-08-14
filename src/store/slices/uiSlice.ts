import { StateCreator } from 'zustand';
import type { ActiveView, WorkspaceMode, BusinessProfileType } from '@/types';
import type { StoreState } from '../useStore';

export interface UiSlice {
  activeView: ActiveView;
  filter: 'all' | 'encaissement' | 'decaissement';
  language: 'fr' | 'en';
  currency: string;
  theme: 'light' | 'dark' | 'system';
  globalSearch: string;
  isSearchModalOpen: boolean;
  workspaceMode: WorkspaceMode | null;
  businessProfileType: BusinessProfileType | null;
  linkProGainsToPerso: boolean;
  
  setActiveView: (view: ActiveView) => void;
  setFilter: (filter: 'all' | 'encaissement' | 'decaissement') => void;
  setLanguage: (language: 'fr' | 'en') => void;
  setCurrency: (currency: string) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setGlobalSearch: (search: string) => void;
  setIsSearchModalOpen: (isOpen: boolean) => void;
  setWorkspaceMode: (mode: WorkspaceMode | null) => void;
  setBusinessProfileType: (type: BusinessProfileType | null) => void;
  setLinkProGainsToPerso: (link: boolean) => void;
}

export const createUiSlice: StateCreator<
  StoreState,
  [],
  [],
  UiSlice
> = (set) => ({
  activeView: 'months',
  filter: 'all',
  language: 'fr',
  currency: 'MAD',
  theme: 'system',
  globalSearch: '',
  isSearchModalOpen: false,
  workspaceMode: null,
  businessProfileType: null,
  linkProGainsToPerso: false,

  setActiveView: (view) => set({ activeView: view }),
  setFilter: (filter) => set({ filter }),
  setLanguage: (language) => set({ language }),
  setCurrency: (currency) => set({ currency }),
  setTheme: (theme) => set({ theme }),
  setGlobalSearch: (globalSearch) => set({ globalSearch }),
  setIsSearchModalOpen: (isSearchModalOpen) => set({ isSearchModalOpen }),
  setWorkspaceMode: (mode) => set({ workspaceMode: mode }),
  setBusinessProfileType: (type) => set({ businessProfileType: type }),
  setLinkProGainsToPerso: (link) => set({ linkProGainsToPerso: link }),
});
