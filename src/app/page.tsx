'use client';

import dynamic from 'next/dynamic';
import { useStore } from '@/store/useStore';
import { useHydration } from '@/hooks/useHydration';
import OnboardingView from '@/components/layout/OnboardingView';
import { ErrorBoundary } from '@/components/ErrorBoundary';

// ─── Lazy-loaded views (réduit le bundle initial de ~653 KB à ~200 KB) ────────
const MonthsView = dynamic(() => import('@/components/months/MonthsView'), { ssr: false });
const OperationsView = dynamic(() => import('@/components/operations/OperationsView'), { ssr: false });
const DashboardView = dynamic(() => import('@/components/dashboard/DashboardView'), { ssr: false });
const CategoriesView = dynamic(() => import('@/components/categories/CategoriesView'), { ssr: false });
const BusinessOrdersView = dynamic(() => import('@/components/business_orders/BusinessOrdersView'), { ssr: false });
const BusinessClientsView = dynamic(() => import('@/components/business_clients/BusinessClientsView'), { ssr: false });
const NewSalePage = dynamic(() => import('@/components/business_orders/NewSalePage'), { ssr: false });
const BusinessDashboardView = dynamic(() => import('@/components/business_dashboard/BusinessDashboardView'), { ssr: false });
const BusinessFeesView = dynamic(() => import('@/components/business_fees/BusinessFeesView'), { ssr: false });
const BusinessSettingsView = dynamic(() => import('@/components/business_settings/BusinessSettingsView'), { ssr: false });
const BusinessProductsView = dynamic(() => import('@/components/business_products/BusinessProductsView'), { ssr: false });
const BusinessSuppliersView = dynamic(() => import('@/components/business_suppliers/BusinessSuppliersView'), { ssr: false });

import { PageTransition } from '@/components/ui/Animation';
import { AnimatePresence } from 'framer-motion';

export default function Home() {
  const isHydrated = useHydration();
  const activeView = useStore((s) => s.activeView);
  const workspaceMode = useStore((s) => s.workspaceMode);
  const businessProfileType = useStore((s) => s.businessProfileType);

  if (!isHydrated) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-3 border-zinc-900 dark:border-white border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!workspaceMode || (workspaceMode === 'business' && !businessProfileType)) {
    return <OnboardingView />;
  }

  return (
    <ErrorBoundary>
      <AnimatePresence mode="wait">
        <PageTransition 
          viewKey={activeView} 
          className={`w-full ${activeView !== 'dashboard' ? (workspaceMode === 'business' ? '' : 'pt-[52px] sm:pt-0') : ''}`}
        >
          {activeView === 'months' && <MonthsView />}
          {activeView === 'operations' && <OperationsView />}
          {activeView === 'categories' && <CategoriesView />}
          {activeView === 'dashboard' && workspaceMode === 'personal' && <DashboardView />}
          {(activeView === 'dashboard' || activeView === 'business_dashboard') && workspaceMode === 'business' && <BusinessDashboardView />}
          {activeView === 'business_clients' && <BusinessClientsView />}
          {activeView === 'business_suppliers' && <BusinessSuppliersView />}
          {activeView === 'business_products' && <BusinessProductsView />}
          {activeView === 'business_orders' && <BusinessOrdersView />}
          {activeView === 'business_fees' && <BusinessFeesView />}
          {(activeView === 'business_settings' || activeView === 'settings') && <BusinessSettingsView />}
          {activeView === 'new_sale' && <NewSalePage />}
        </PageTransition>
      </AnimatePresence>
    </ErrorBoundary>
  );
}
