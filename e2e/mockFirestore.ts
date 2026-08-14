// e2e/mockFirestore.ts
// Injecte un état localStorage avant chaque test pour simuler l'état de l'app.

import { test } from '@playwright/test';

// ── Store vide : workspaceMode=null → OnboardingView s'affiche ──────────────
export const emptyStore = {
  months: [],
  operations: [],
  operationTypes: [],
  businessClients: [],
  businessCategories: [],
  businessProducts: [],
  businessOrders: [],
  businessFees: [],
  businessSettings: {
    companyName: '',
    address: '',
    identifiers: [],
    countryCode: 'MA',
    currency: 'MAD',
    defaultTaxMode: 'HT',
    defaultTaxRate: 20,
    incomeTaxRateProduct: 0.5,
    incomeTaxRateService: 1.0,
    customPaymentMethods: [],
  },
  workspaceMode: null,
  businessProfileType: null,
  activeMonthId: null,
  activeView: 'months',
  filter: 'all',
  language: 'fr',
  currency: 'MAD',
  theme: 'system',
  globalSearch: '',
  isSearchModalOpen: false,
};

// ── Store Business "company" pré-configuré ────────────────────────────────────
// Utilisé par les specs Pro qui sautent l'OnboardingView.
// NOTE: n'importez QUE cet export depuis les specs Pro (sans `import './mockFirestore'`)
// afin d'éviter le beforeEach global ci-dessous.
export const businessStore = {
  ...emptyStore,
  workspaceMode: 'business',
  businessProfileType: 'company',  // ← valeur valide : 'freelance' | 'company'
  activeView: 'dashboard',
  businessProducts: [
    {
      id: 'prod-1',
      name: 'Licence Logiciel',
      type: 'product',
      defaultPrice_cents: 100000,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId: 'mock-user',
    },
    {
      id: 'prod-2',
      name: 'Prestation Dev',
      type: 'service',
      defaultPrice_cents: 50000,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId: 'mock-user',
    },
  ],
};

// ── Store Business "freelance" pré-configuré ─────────────────────────────────
export const freelanceStore = {
  ...businessStore,
  businessProfileType: 'freelance',
};

// ── beforeEach global : pour les specs qui importent ce fichier entier ────────
// (utilisé par personnel.spec.ts uniquement)
test.beforeEach(async ({ page }) => {
  await page.addInitScript((store) => {
    // Zustand persist stocke au format { state: {...}, version: 0 }
    window.localStorage.setItem('charges-encaissements-store', JSON.stringify({
      state: store,
      version: 0,
    }));
    // Masquer le toast invité pour éviter qu'il bloque les éléments
    window.sessionStorage.setItem('guest_toast_shown', 'true');
  }, emptyStore);
});

