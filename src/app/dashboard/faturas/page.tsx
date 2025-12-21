'use client';

import DashboardNav from '../../../component/DashboardNav';
import DashboardSidebar from '../../../component/DashboardSidebar';

export default function FaturasPage() {
  return (
    <div className="w-full relative flex ct-docs-disable-sidebar-content overflow-x-hidden bg-blueGray-100 dark:bg-gray-900 min-h-screen">
      <DashboardSidebar />
      <div className="relative md:ml-64 bg-blueGray-100 dark:bg-gray-900 w-full">
        <DashboardNav />

        <div className="px-4 md:px-6 mx-auto w-full pt-24 pb-10">
          <div className="rounded-3xl bg-white/90 dark:bg-gray-800/80 backdrop-blur-md border border-white/20 dark:border-gray-700/50 shadow-2xl p-5 sm:p-6">
            <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-white">Faturas</h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Sistema de faturas geradas no sistema.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
