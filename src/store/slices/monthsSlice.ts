import { StateCreator } from 'zustand';
import type { StoreState } from '../useStore';
import type { Month, Operation } from '@/types';
import { generateId, cleanForFirebase } from '@/lib/utils';
import { db, auth } from '@/lib/firebase';
import { doc, setDoc, deleteDoc, writeBatch } from 'firebase/firestore';
import { MonthSchema } from '@/lib/schemas';
import toast from 'react-hot-toast';

const getUid = () => auth.currentUser?.uid;

export interface MonthsSlice {
  months: Month[];
  activeMonthId: string | null;

  addMonth: (month: number, year: number) => { success: boolean; error?: string };
  archiveMonth: (id: string) => void;
  deleteMonth: (id: string) => void;
  restoreMonth: (id: string) => void;
  setActiveMonth: (id: string) => void;
}

export const createMonthsSlice: StateCreator<
  StoreState,
  [],
  [],
  MonthsSlice
> = (set, get) => ({
  months: [],
  activeMonthId: null,

  addMonth: (month, year) => {
    const existing = get().months.find(
      (m) => m.month === month && m.year === year
    );
    if (existing) {
      return {
        success: false,
        error: 'Ce mois existe déjà, choisissez une autre combinaison.',
      };
    }
    const uid = getUid();
    const newMonth: Month = {
      id: generateId(),
      month,
      year,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId: uid || 'local-user',
    };
    
    const parsed = MonthSchema.safeParse(newMonth);
    if (!parsed.success) {
      console.error(parsed.error);
      return { success: false, error: 'Mois invalide' };
    }

    set((state) => ({ months: [...state.months, parsed.data] }));

    if (uid) {
      setDoc(doc(db, 'users', uid, 'months', parsed.data.id), cleanForFirebase(parsed.data)).catch(console.error);
    }

    return { success: true };
  },

  archiveMonth: (id) => {
    set((state) => ({
      months: state.months.map((m) =>
        m.id === id ? { ...m, status: 'archived', updatedAt: new Date().toISOString() } : m
      ),
      activeMonthId: state.activeMonthId === id ? null : state.activeMonthId,
    }));

    const uid = getUid();
    if (uid) {
      setDoc(doc(db, 'users', uid, 'months', id), { status: 'archived', updatedAt: new Date().toISOString() }, { merge: true }).catch(console.error);
    }
  },

  deleteMonth: (id) => {
    set((state) => ({
      months: state.months.filter((m) => m.id !== id),
      operations: state.operations.filter((o) => o.monthId !== id),
      activeMonthId: state.activeMonthId === id ? null : state.activeMonthId,
    }));

    const uid = getUid();
    if (uid) {
      const batch = writeBatch(db);
      batch.delete(doc(db, 'users', uid, 'months', id));
      
      const opsToDelete = get().operations.filter((o) => o.monthId === id);
      opsToDelete.forEach((op) => {
        batch.delete(doc(db, 'users', uid, 'operations', op.id));
      });
      
      batch.commit().catch(console.error);
    }
  },

  restoreMonth: (id) => {
    set((state) => ({
      months: state.months.map((m) =>
        m.id === id ? { ...m, status: 'active', updatedAt: new Date().toISOString() } : m
      ),
    }));

    const uid = getUid();
    if (uid) {
      setDoc(doc(db, 'users', uid, 'months', id), { status: 'active', updatedAt: new Date().toISOString() }, { merge: true }).catch(console.error);
    }
  },

  setActiveMonth: (id) => {
    set({ activeMonthId: id });
  },
});
