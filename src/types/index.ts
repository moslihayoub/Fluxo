// ============================================================
// Core domain types for Charges & Encaissements
// ============================================================

export type Kind = 'encaissement' | 'decaissement';

export type ActiveView =
  | 'months'
  | 'operations'
  | 'dashboard'
  | 'business_dashboard'
  | 'categories'
  | 'settings'
  | 'business_clients'
  | 'business_products'
  | 'business_orders'
  | 'business_suppliers'
  | 'business_fees'
  | 'business_settings'
  | 'new_sale';

export interface OperationType {
  id: string;
  label: string;
  createdAt: string; // ISO date string
  updatedAt: string;
  userId: string;
  defaultAmount_cents?: number; // Optional default amount for this category
  kind?: Kind; // Encaissement or decaissement
}

export interface SubAmount {
  id: string;
  label: string;
  value_cents: number;
}

export interface Operation {
  id: string;
  monthId: string;
  label: string;
  operationTypeId?: string;
  operationTypeLabel: string;
  kind: Kind;
  amount_cents: number; // always positive, kind determines sign
  subAmounts?: SubAmount[];
  createdAt: string; // ISO date string
  updatedAt: string;
  userId: string;
  notes?: string;
  workspaceMode?: WorkspaceMode; // 'business' or 'personal' (fallback to personal if missing)
}

export interface Month {
  id: string;
  month: number; // 1-12
  year: number;
  status: 'active' | 'archived';
  createdAt: string; // ISO date string
  updatedAt: string;
  userId: string;
}

// For agent AI extraction preview
export interface ExtractedOperation {
  label: string;
  amount_cents: number;
  kind: Kind;
  operationTypeSuggestion: string;
  date?: string; // YYYY-MM-DD
  notes?: string;
  selected?: boolean; // UI selection state
}

export interface AgentResponse {
  operations: ExtractedOperation[];
  summary: {
    totalEncaissement_cents: number;
    totalDecaissement_cents: number;
    count: number;
  };
}

// ============================================================
// Business Pro Domain Types
// ============================================================
export type WorkspaceMode = 'personal' | 'business';
export type BusinessProfileType = 'freelance' | 'company';
export type TaxMode = 'HT' | 'TVA';
export type PaymentStatus = 'paid' | 'partial' | 'unpaid';

export interface ExtraFee {
  id: string;
  label: string;
  amount_cents: number;
}

export interface BusinessCategory {
  id: string;
  name: string;
  parentId?: string; // If undefined, it's a main category
  createdAt: string;
  updatedAt: string;
  userId: string;
}

export interface BusinessSupplier {
  id: string;
  brandName: string;
  avatarUrl?: string;
  contactName?: string;
  contactFirstName?: string;
  contactLastName?: string;
  phone: string;
  whatsapp?: string;
  city?: string;
  address?: string;
  email?: string;
  website?: string;
  socialLinks?: {
    insta?: string;
    fb?: string;
    tiktok?: string;
    other?: string;
  };
  merchandiseType?: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

export interface BusinessProduct {
  id: string;
  name: string;
  type: 'product' | 'service'; // NOUVEAU: différéncier produit physique vs prestation de service
  defaultPrice_cents: number;
  resellerPrice_cents?: number; // NOUVEAU: prix spécial revendeur
  categoryId?: string; // Optionnel
  supplierId?: string; // Optionnel
  isActive: boolean;
  isFree?: boolean; // NOUVEAU: si c'est gratuit globalement
  discountRate?: number; // NOUVEAU: % promotion globale
  createdAt: string;
  updatedAt: string;
  userId: string;
}

export interface BusinessClient {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  phone: string;
  email?: string;
  avatarUrl?: string;
  address?: string;
  city?: string;
  clientType?: 'perso' | 'pro';
  
  // Nouveaux champs pour les règles commerciales
  isVip?: boolean; // Client spécifique/privilégié
  defaultDiscountRate?: number; // Promo par pourcentage automatique pour ce client
  freeProductIds?: string[]; // Liste de produits offerts spécifiquement à ce client
  
  totalSpent_cents: number;
  totalPending_cents: number;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

export interface OrderItem {
  id: string; // Unique ID for the item in the cart
  productName: string;
  quantity: number;
  unitCostPrice_cents: number;
  unitSellingPrice_cents: number;
  isFree?: boolean; // If this specific item was given for free
  categoryId?: string; // Optional category ID
  supplierId?: string; // Optional supplier ID
  saveToCatalog?: boolean; // If true, saves product to global catalog
}

export interface BusinessOrder {
  id: string;
  orderNumber: string;
  date: string;
  clientId?: string;
  clientName: string;
  clientPhone?: string;
  clientEmail?: string;
  clientAddress?: string;
  
  items: OrderItem[];
  
  // Legacy fields for backward compatibility (will be migrated automatically on read)
  productName?: string;
  quantity?: number;
  unitCostPrice_cents?: number;
  unitSellingPrice_cents?: number;
  isFree?: boolean; 
  
  // Règles commerciales globales
  discountRate?: number; // Promo par pourcentage global (ex: 10 pour 10%)
  discountAmount_cents?: number; // Montant de la réduction en valeur absolue
  
  taxMode: TaxMode;
  taxRate?: number;
  amountHT_cents: number;
  amountTVA_cents: number;
  amountTTC_cents: number;
  
  shippingFee_cents: number;
  extraFees: ExtraFee[];
  totalFees_cents: number;
  
  paymentMethod?: 'cash' | 'transfer' | 'check' | 'card' | 'tpe' | 'cod' | string;
  documentType?: 'invoice' | 'delivery_note' | 'receipt';
  invoiceNumber?: string;
  deliveryNoteNumber?: string;
  
  paymentStatus: PaymentStatus;
  advancePaid_cents: number;
  remainingBalance_cents: number;
  dueDate?: string;
  
  netProfit_cents: number;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

export interface BusinessFee {
  id: string;
  date: string;
  label: string;
  amount_cents: number;
  category: string;
  supplierName?: string; // Nom du fournisseur
  createdAt: string;
  updatedAt: string;
  userId: string;
}

export interface LegalIdentifier {
  id: string;
  label: string;
  value: string;
}

export interface BusinessSettings {
  // 1. Profil & Entreprise
  companyName: string;
  address: string;
  city?: string;
  country?: string;
  phone?: string;
  email?: string;
  logoBase64?: string;
  identifiers: LegalIdentifier[];
  
  // 2. Localisation & Devises
  countryCode: string; // ex: 'MA', 'FR'
  currency: string; // ex: 'MAD', 'EUR'
  
  // 3. Fiscalité & Taxes
  defaultTaxMode: TaxMode;
  defaultTaxRate: number; // ex: 20
  incomeTaxRateProduct: number; // ex: 0.5 (IR pour commerce AE au Maroc)
  incomeTaxRateService: number; // ex: 1.0 (IR pour service AE au Maroc)
  
  // 4. Documents
  invoiceFooterText?: string;
  legalNotice?: string;
  paymentInstructions?: string; // RIB / Instructions
  customPaymentMethods: string[];
  
  // 5. Integrations & Sync
  syncProfitToPerso?: boolean;
}

// Zustand store shape
export interface AppState {
  // Data
  userUid?: string | null;
  language: 'fr' | 'en';
  setLanguage: (lang: 'fr' | 'en') => void;
  currency: string;
  setCurrency: (currency: string) => void;
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;

  months: Month[];
  operations: Operation[];
  operationTypes: OperationType[];

  // Business Data
  businessClients: BusinessClient[];
  businessSuppliers: BusinessSupplier[];
  businessCategories: BusinessCategory[];
  businessProducts: BusinessProduct[];
  businessOrders: BusinessOrder[];
  businessFees: BusinessFee[];
  businessSettings: BusinessSettings;

  // UI state
  workspaceMode: WorkspaceMode | null;
  businessProfileType: BusinessProfileType | null;
  activeMonthId: string | null;
  activeView: ActiveView | string;
  filter: 'all' | 'encaissement' | 'decaissement';
  globalSearch: string;
  setGlobalSearch: (search: string) => void;
  isSearchModalOpen: boolean;
  setIsSearchModalOpen: (isOpen: boolean) => void;
  
  // Settings transverses
  linkProGainsToPerso: boolean;
  setLinkProGainsToPerso: (link: boolean) => void;

  // Month actions
  addMonth: (month: number, year: number) => { success: boolean; error?: string };
  archiveMonth: (id: string) => void;
  deleteMonth: (id: string) => void;
  restoreMonth: (id: string) => void;
  setActiveMonth: (id: string) => void;

  // Operation actions
  addOperation: (op: Omit<Operation, 'id' | 'createdAt'>) => void;
  updateOperation: (id: string, op: Partial<Omit<Operation, 'id' | 'createdAt'>>) => void;
  deleteOperation: (id: string) => void;
  addOperations: (ops: Omit<Operation, 'id' | 'createdAt'>[]) => void;

  // OperationType actions
  addOperationType: (label: string, defaultAmount?: number, kind?: Kind) => OperationType;
  updateOperationType: (id: string, updates: Partial<OperationType>) => void;
  deleteOperationType: (id: string) => void;
  
  // Business Actions
  setWorkspaceMode: (mode: WorkspaceMode | null) => void;
  setBusinessProfileType: (profile: BusinessProfileType | null) => void;
  addBusinessClient: (client: Omit<BusinessClient, 'id' | 'createdAt' | 'totalSpent' | 'totalPending'>) => void;
  updateBusinessClient: (id: string, updates: Partial<Omit<BusinessClient, 'id' | 'createdAt'>>) => void;
  deleteBusinessClient: (id: string) => void;
  
  addBusinessSupplier: (supplier: Omit<BusinessSupplier, 'id' | 'createdAt'>) => void;
  updateBusinessSupplier: (id: string, updates: Partial<Omit<BusinessSupplier, 'id' | 'createdAt'>>) => void;
  deleteBusinessSupplier: (id: string) => void;
  
  addBusinessCategory: (category: Omit<BusinessCategory, 'id' | 'createdAt'>) => BusinessCategory | void;
  updateBusinessCategory: (id: string, updates: Partial<Omit<BusinessCategory, 'id' | 'createdAt'>>) => void;
  deleteBusinessCategory: (id: string) => void;

  addBusinessProduct: (product: Omit<BusinessProduct, 'id' | 'createdAt'>) => void;
  updateBusinessProduct: (id: string, updates: Partial<Omit<BusinessProduct, 'id' | 'createdAt'>>) => void;
  deleteBusinessProduct: (id: string) => void;

  addBusinessOrder: (order: Omit<BusinessOrder, 'id' | 'createdAt'>) => void;
  updateBusinessOrder: (id: string, updates: Partial<Omit<BusinessOrder, 'id' | 'createdAt'>>) => void;
  deleteBusinessOrder: (id: string) => void;
  addBusinessFee: (fee: Omit<BusinessFee, 'id' | 'createdAt'>) => void;
  updateBusinessFee: (id: string, updates: Partial<Omit<BusinessFee, 'id' | 'createdAt'>>) => void;
  deleteBusinessFee: (id: string) => void;
  
  updateBusinessSettings: (settings: Partial<BusinessSettings>) => void;

  // UI actions
  setActiveView: (view: ActiveView | string) => void;
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
