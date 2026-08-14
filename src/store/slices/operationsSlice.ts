import { StateCreator } from 'zustand';
import type { StoreState } from '../useStore';
import type { Operation, OperationType } from '@/types';
import { generateId, cleanForFirebase } from '@/lib/utils';
import { db, auth } from '@/lib/firebase';
import { doc, setDoc, deleteDoc, writeBatch } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { OperationSchema, OperationTypeSchema } from '@/lib/schemas';

const getUid = () => auth.currentUser?.uid;

// ── Default operation types ───────────────────────────────────
const DEFAULT_OPERATION_TYPES: OperationType[] = [
  { id: 'ot-1', label: 'Encaissement client', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), userId: 'system' },
  { id: 'ot-2', label: 'Commission banque', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), userId: 'system' },
  { id: 'ot-3', label: 'Abonnement', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), userId: 'system' },
  { id: 'ot-4', label: 'Salaire', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), userId: 'system' },
  { id: 'ot-5', label: 'Loyer', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), userId: 'system' },
  { id: 'ot-6', label: 'Facture', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), userId: 'system' },
  { id: 'ot-7', label: 'Frais divers', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), userId: 'system' },
  { id: 'ot-8', label: 'Remboursement', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), userId: 'system' },
];

export interface OperationsSlice {
  operations: Operation[];
  operationTypes: OperationType[];

  addOperation: (op: Omit<Operation, 'id' | 'createdAt' | 'updatedAt' | 'userId' | 'workspaceMode'>) => void;
  updateOperation: (id: string, op: Partial<Operation>) => void;
  deleteOperation: (id: string) => void;
  addOperations: (ops: Omit<Operation, 'id' | 'createdAt' | 'updatedAt' | 'userId' | 'workspaceMode'>[]) => void;

  addOperationType: (label: string, defaultAmount_cents?: number, kind?: 'encaissement' | 'decaissement') => OperationType;
  updateOperationType: (id: string, updates: Partial<OperationType>) => void;
  deleteOperationType: (id: string) => void;
}

export const createOperationsSlice: StateCreator<
  StoreState,
  [],
  [],
  OperationsSlice
> = (set, get) => ({
  operations: [],
  operationTypes: DEFAULT_OPERATION_TYPES,

  addOperation: (opData) => {
    const uid = getUid();
    const newOp: Operation = {
      ...opData,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId: uid || 'local-user',
      workspaceMode: get().workspaceMode || 'personal',
    };

    // Zod Validation
    const parsed = OperationSchema.safeParse(newOp);
    if (!parsed.success) {
      console.error('Validation failed for Operation:', parsed.error);
      toast.error('Données d\'opération invalides');
      return;
    }

    set((state) => ({ operations: [...state.operations, parsed.data] }));

    if (uid) {
      setDoc(doc(db, 'users', uid, 'operations', parsed.data.id), cleanForFirebase(parsed.data)).catch(console.error);
    }
  },

  updateOperation: (id, updates) => {
    const uid = getUid();
    const existingOp = get().operations.find((o) => o.id === id);
    if (!existingOp) return;

    const updatedOp = {
      ...existingOp,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    const parsed = OperationSchema.safeParse(updatedOp);
    if (!parsed.success) {
      console.error('Validation failed for Operation update:', parsed.error);
      toast.error('Données d\'opération invalides');
      return;
    }

    set((state) => ({
      operations: state.operations.map((o) => (o.id === id ? parsed.data : o)),
    }));

    if (uid) {
      setDoc(doc(db, 'users', uid, 'operations', id), cleanForFirebase(parsed.data), { merge: true }).catch(console.error);
    }
  },

  deleteOperation: (id) => {
    set((state) => ({
      operations: state.operations.filter((o) => o.id !== id),
    }));

    const uid = getUid();
    if (uid) {
      deleteDoc(doc(db, 'users', uid, 'operations', id)).catch(console.error);
    }
  },

  addOperations: (opsData) => {
    const uid = getUid();
    const currentMode = get().workspaceMode || 'personal';
    const newOps: Operation[] = opsData.map((opData) => {
      const newOp = {
        ...opData,
        id: generateId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        userId: uid || 'local-user',
        workspaceMode: currentMode,
      };
      
      const parsed = OperationSchema.safeParse(newOp);
      if (!parsed.success) {
         console.error('Validation failed for Operation:', parsed.error);
         throw new Error('Validation failed');
      }
      return parsed.data;
    });

    set((state) => ({ operations: [...state.operations, ...newOps] }));

    if (uid) {
      const batch = writeBatch(db);
      newOps.forEach((op) => {
        const ref = doc(db, 'users', uid, 'operations', op.id);
        batch.set(ref, cleanForFirebase(op));
      });
      batch.commit().catch(console.error);
    }
  },

  addOperationType: (label, defaultAmount_cents, kind) => {
    const uid = getUid();
    const existing = get().operationTypes.find(
      (ot) => ot.label.toLowerCase() === label.toLowerCase()
    );
    
    if (existing) {
      if ((defaultAmount_cents !== undefined && existing.defaultAmount_cents !== defaultAmount_cents) || (kind !== undefined && existing.kind !== kind)) {
        const updated = { 
          ...existing, 
          defaultAmount_cents: defaultAmount_cents ?? existing.defaultAmount_cents, 
          kind: kind ?? existing.kind,
          updatedAt: new Date().toISOString()
        };
        const parsed = OperationTypeSchema.safeParse(updated);
        if (parsed.success) {
          set((state) => ({
            operationTypes: state.operationTypes.map((ot) => ot.id === existing.id ? parsed.data : ot)
          }));
          if (uid) {
            setDoc(doc(db, 'users', uid, 'operationTypes', existing.id), { defaultAmount_cents: parsed.data.defaultAmount_cents, kind: parsed.data.kind, updatedAt: parsed.data.updatedAt }, { merge: true }).catch(console.error);
          }
          return parsed.data;
        }
      }
      return existing;
    }

    const newType: OperationType = {
      id: generateId(),
      label,
      defaultAmount_cents,
      kind,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId: uid || 'local-user',
    };
    
    const parsed = OperationTypeSchema.safeParse(newType);
    if (!parsed.success) {
      toast.error('Type d\'opération invalide');
      return existing || newType;
    }

    set((state) => ({
      operationTypes: [...state.operationTypes, parsed.data],
    }));

    if (uid) {
      setDoc(doc(db, 'users', uid, 'operationTypes', parsed.data.id), cleanForFirebase(parsed.data)).catch(console.error);
    }
    
    return parsed.data;
  },

  updateOperationType: (id, updates) => {
    const uid = getUid();
    const existingType = get().operationTypes.find((ot) => ot.id === id);
    if (!existingType) return;
    
    const updated = { ...existingType, ...updates, updatedAt: new Date().toISOString() };
    const parsed = OperationTypeSchema.safeParse(updated);
    
    if (parsed.success) {
      set((state) => ({
        operationTypes: state.operationTypes.map((ot) =>
          ot.id === id ? parsed.data : ot
        ),
      }));

      if (uid) {
        setDoc(doc(db, 'users', uid, 'operationTypes', id), cleanForFirebase(updates), { merge: true }).catch(console.error);
      }
    }
  },

  deleteOperationType: (id) => {
    set((state) => ({
      operationTypes: state.operationTypes.filter((ot) => ot.id !== id),
    }));

    const uid = getUid();
    if (uid) {
      deleteDoc(doc(db, 'users', uid, 'operationTypes', id)).catch(console.error);
    }
  },
});
