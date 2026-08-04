// ============================================================
// Core domain types for Charges & Encaissements
// ============================================================

export type Kind = 'encaissement' | 'decaissement';

export type ActiveView = 'months' | 'operations' | 'dashboard' | 'categories';

export interface OperationType {
  id: string;
  label: string;
  createdAt: string; // ISO date string
  defaultAmount?: number; // Optional default amount for this category
  kind?: Kind; // Encaissement or decaissement
}

export interface Operation {
  id: string;
  monthId: string;
  label: string;
  operationTypeId?: string;
  operationTypeLabel: string;
  kind: Kind;
  amount: number; // always positive, kind determines sign
  createdAt: string; // ISO date string
  notes?: string;
}

export interface Month {
  id: string;
  month: number; // 1-12
  year: number;
  status: 'active' | 'archived';
  createdAt: string; // ISO date string
}

// For agent AI extraction preview
export interface ExtractedOperation {
  label: string;
  amount: number;
  kind: Kind;
  operationTypeSuggestion: string;
  date?: string; // YYYY-MM-DD
  notes?: string;
  selected?: boolean; // UI selection state
}

export interface AgentResponse {
  operations: ExtractedOperation[];
  summary: {
    totalEncaissement: number;
    totalDecaissement: number;
    count: number;
  };
}

// Zustand store shape
export interface AppState {
  // Data
  userUid?: string | null;
  months: Month[];
  operations: Operation[];
  operationTypes: OperationType[];

  // UI state
  activeMonthId: string | null;
  activeView: ActiveView;
  filter: 'all' | 'encaissement' | 'decaissement';

  // Month actions
  addMonth: (month: number, year: number) => { success: boolean; error?: string };
  archiveMonth: (id: string) => void;
  restoreMonth: (id: string) => void;
  setActiveMonth: (id: string) => void;

  // Operation actions
  addOperation: (op: Omit<Operation, 'id' | 'createdAt'>) => void;
  updateOperation: (id: string, op: Partial<Omit<Operation, 'id' | 'createdAt'>>) => void;
  deleteOperation: (id: string) => void;
  addOperations: (ops: Omit<Operation, 'id' | 'createdAt'>[]) => void;

  // OperationType actions
  addOperationType: (label: string, defaultAmount?: number) => OperationType;
  updateOperationType: (id: string, updates: Partial<OperationType>) => void;
  deleteOperationType: (id: string) => void;

  // UI actions
  setActiveView: (view: ActiveView) => void;
  setFilter: (filter: 'all' | 'encaissement' | 'decaissement') => void;
}

// Dashboard metrics
export interface MonthMetrics {
  monthId: string;
  monthLabel: string;
  totalEncaissement: number;
  totalDecaissement: number;
  solde: number;
}

export interface TypeMetrics {
  label: string;
  totalAmount: number;
  count: number;
}
