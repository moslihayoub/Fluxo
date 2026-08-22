import { StateCreator } from 'zustand';
import type { ActiveView, WorkspaceMode } from '@/types';
import type { StoreState } from '../useStore';
import { db, auth } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';

const getUid = () => auth.currentUser?.uid;

const saveProfileSetting = (key: string, value: any) => {
  const uid = getUid();
  if (uid) {
    setDoc(doc(db, 'users', uid, 'profile', 'main'), { [key]: value }, { merge: true }).catch(console.error);
  }
};

export interface UiSlice {
  activeView: ActiveView;
  filter: 'all' | 'encaissement' | 'decaissement';
  language: 'fr' | 'en';
  currency: string;
  theme: 'light' | 'dark' | 'system';
  globalSearch: string;
  isSearchModalOpen: boolean;
  workspaceMode: WorkspaceMode | null;

  linkProGainsToPerso: boolean;
  
  setActiveView: (view: ActiveView) => void;
  setFilter: (filter: 'all' | 'encaissement' | 'decaissement') => void;
  setLanguage: (language: 'fr' | 'en') => void;
  setCurrency: (currency: string) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setGlobalSearch: (search: string) => void;
  setIsSearchModalOpen: (isOpen: boolean) => void;
  setWorkspaceMode: (mode: WorkspaceMode | null) => void;

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
  workspaceMode: 'personal',

  linkProGainsToPerso: false,

  setActiveView: (view) => set({ activeView: view }),
  setFilter: (filter) => set({ filter }),
  setLanguage: (language) => {
    set({ language });
    saveProfileSetting('language', language);
  },
  setCurrency: (currency) => {
    set({ currency });
    saveProfileSetting('currency', currency);
  },
  setTheme: (theme) => {
    set({ theme });
    saveProfileSetting('theme', theme);
  },
  setGlobalSearch: (globalSearch) => set({ globalSearch }),
  setIsSearchModalOpen: (isSearchModalOpen) => set({ isSearchModalOpen }),
  setWorkspaceMode: (mode) => {
    set({ workspaceMode: mode });
    saveProfileSetting('workspaceMode', mode);
  },

  setLinkProGainsToPerso: (link) => {
    set({ linkProGainsToPerso: link });
    saveProfileSetting('linkProGainsToPerso', link);
  },
});
