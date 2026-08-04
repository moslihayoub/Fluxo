'use client';

import { useEffect } from 'react';
import { useAuth } from './AuthProvider';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, writeBatch, doc } from 'firebase/firestore';
import { useStore } from '@/store/useStore';
import type { Month, Operation, OperationType } from '@/types';

export default function SyncManager({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      // Do NOT clear store if logged out, so guest can use it
      return;
    }

    const uid = user.uid;

    // Migrate local data to cloud on first connection
    const migrationKey = `hasMigratedToCloud_${uid}`;
    if (!localStorage.getItem(migrationKey)) {
      const state = useStore.getState();
      const batch = writeBatch(db);
      
      state.months.forEach(m => batch.set(doc(db, 'users', uid, 'months', m.id), m));
      state.operations.forEach(o => batch.set(doc(db, 'users', uid, 'operations', o.id), o));
      
      // Only migrate custom operation types or all of them
      state.operationTypes.forEach(ot => batch.set(doc(db, 'users', uid, 'operationTypes', ot.id), ot));

      batch.commit().then(() => {
        localStorage.setItem(migrationKey, 'true');
        console.log("Migration des données locales vers le Cloud réussie.");
      }).catch(console.error);
    }

    // Listen to months
    const qMonths = query(collection(db, 'users', uid, 'months'));
    const unsubMonths = onSnapshot(qMonths, (snapshot) => {
      const months: Month[] = [];
      snapshot.forEach((doc) => months.push(doc.data() as Month));
      useStore.setState({ months });
    });

    // Listen to operations
    const qOps = query(collection(db, 'users', uid, 'operations'));
    const unsubOps = onSnapshot(qOps, (snapshot) => {
      const operations: Operation[] = [];
      snapshot.forEach((doc) => operations.push(doc.data() as Operation));
      useStore.setState({ operations });
    });

    // Listen to operationTypes
    const qTypes = query(collection(db, 'users', uid, 'operationTypes'));
    const unsubTypes = onSnapshot(qTypes, (snapshot) => {
      const operationTypes: OperationType[] = [];
      snapshot.forEach((doc) => operationTypes.push(doc.data() as OperationType));
      
      // If empty, we can initialize default types later, or let the store handle it.
      // But for now, we just sync.
      useStore.setState((state) => ({
        operationTypes: operationTypes.length > 0 ? operationTypes : state.operationTypes
      }));
    });

    return () => {
      unsubMonths();
      unsubOps();
      unsubTypes();
    };
  }, [user]);

  return <>{children}</>;
}
