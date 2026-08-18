'use client';

import { useEffect } from 'react';
import { useAuth } from './AuthProvider';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, writeBatch, doc } from 'firebase/firestore';
import { useStore } from '@/store/useStore';
import type { Month, Operation, OperationType, BusinessClient, BusinessCategory, BusinessProduct, BusinessOrder, BusinessFee, BusinessSettings, WorkspaceMode, BusinessSupplier } from '@/types';

export default function SyncManager({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const uid = user.uid;

    // Migrate local data to cloud on first connection
    const migrationKey = `hasMigratedToCloud_v2_${uid}`;
    if (!localStorage.getItem(migrationKey)) {
      const state = useStore.getState();
      const batch = writeBatch(db);
      
      state.months.forEach(m => batch.set(doc(db, 'users', uid, 'months', m.id), m));
      state.operations.forEach(o => batch.set(doc(db, 'users', uid, 'operations', o.id), o));
      state.operationTypes.forEach(ot => batch.set(doc(db, 'users', uid, 'operationTypes', ot.id), ot));
      
      state.businessClients.forEach(c => batch.set(doc(db, 'users', uid, 'businessClients', c.id), c));
      state.businessSuppliers.forEach(s => batch.set(doc(db, 'users', uid, 'businessSuppliers', s.id), s));
      state.businessCategories.forEach(c => batch.set(doc(db, 'users', uid, 'businessCategories', c.id), c));
      state.businessProducts.forEach(p => batch.set(doc(db, 'users', uid, 'businessProducts', p.id), p));
      state.businessOrders.forEach(o => batch.set(doc(db, 'users', uid, 'businessOrders', o.id), o));
      state.businessFees.forEach(f => batch.set(doc(db, 'users', uid, 'businessFees', f.id), f));

      batch.set(doc(db, 'users', uid, 'businessSettings', 'main'), state.businessSettings);
      batch.set(doc(db, 'users', uid, 'profile', 'main'), { 
        workspaceMode: state.workspaceMode
      });

      batch.commit().then(() => {
        localStorage.setItem(migrationKey, 'true');
        console.log("Migration v2 réussie.");
      }).catch(console.error);
    }

    // Unsubscribers
    const unsubs: (() => void)[] = [];

    // Simple collection listener helper
    const listenCollection = (colName: string, setStateFn: (data: any[]) => void) => {
      const q = query(collection(db, 'users', uid, colName));
      return onSnapshot(q, (snapshot) => {
        const items: any[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          // Normalize legacy float amounts to cents
          if (data.amount !== undefined && data.amount_cents === undefined) {
            data.amount_cents = Math.round(parseFloat(String(data.amount)) * 100);
          }
          if (data.amountHT !== undefined && data.amountHT_cents === undefined) {
            data.amountHT_cents = Math.round(parseFloat(String(data.amountHT)) * 100);
          }
          if (data.amountTVA !== undefined && data.amountTVA_cents === undefined) {
            data.amountTVA_cents = Math.round(parseFloat(String(data.amountTVA)) * 100);
          }
          if (data.amountTTC !== undefined && data.amountTTC_cents === undefined) {
            data.amountTTC_cents = Math.round(parseFloat(String(data.amountTTC)) * 100);
          }
          items.push(data);
        });
        setStateFn(items);
      });
    };

    unsubs.push(listenCollection('months', (data) => useStore.setState({ months: data as Month[] })));
    unsubs.push(listenCollection('operations', (data) => useStore.setState({ operations: data as Operation[] })));
    unsubs.push(listenCollection('operationTypes', (data) => {
      useStore.setState((state) => ({ operationTypes: data.length > 0 ? data as OperationType[] : state.operationTypes }));
    }));
    unsubs.push(listenCollection('businessClients', (data) => useStore.setState({ businessClients: data as BusinessClient[] })));
    unsubs.push(listenCollection('businessSuppliers', (data) => useStore.setState({ businessSuppliers: data as BusinessSupplier[] })));
    unsubs.push(listenCollection('businessCategories', (data) => useStore.setState({ businessCategories: data as BusinessCategory[] })));
    unsubs.push(listenCollection('businessProducts', (data) => useStore.setState({ businessProducts: data as BusinessProduct[] })));
    unsubs.push(listenCollection('businessOrders', (data) => useStore.setState({ businessOrders: data as BusinessOrder[] })));
    unsubs.push(listenCollection('businessFees', (data) => useStore.setState({ businessFees: data as BusinessFee[] })));

    // Single Document listeners
    unsubs.push(onSnapshot(doc(db, 'users', uid, 'businessSettings', 'main'), (doc) => {
      if (doc.exists()) {
        useStore.setState((state) => ({ businessSettings: { ...state.businessSettings, ...(doc.data() as BusinessSettings) } }));
      }
    }));
    unsubs.push(onSnapshot(doc(db, 'users', uid, 'profile', 'main'), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        useStore.setState({ 
          workspaceMode: data.workspaceMode as WorkspaceMode | null,
        });
      }
    }));

    return () => {
      unsubs.forEach(unsub => unsub());
    };
  }, [user]);

  return <>{children}</>;
}
