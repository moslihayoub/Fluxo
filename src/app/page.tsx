'use client';

import { useStore } from '@/store/useStore';
import MonthsView from '@/components/months/MonthsView';
import OperationsView from '@/components/operations/OperationsView';
import DashboardView from '@/components/dashboard/DashboardView';
import CategoriesView from '@/components/categories/CategoriesView';

export default function Home() {
  const activeView = useStore((s) => s.activeView);

  return (
    <>
      <div key={activeView} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        {activeView === 'months' && <MonthsView />}
        {activeView === 'operations' && <OperationsView />}
        {activeView === 'categories' && <CategoriesView />}
        {activeView === 'dashboard' && <DashboardView />}
      </div>
    </>
  );
}
