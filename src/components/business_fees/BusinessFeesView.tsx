'use client';

import { useStore } from '@/store/useStore';
import { Plus, Receipt, FileText } from 'lucide-react';
import { formatCurrency, fromCents } from '@/lib/utils';
import toast from 'react-hot-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import { ScrollReveal } from '@/components/ui/Animation';
export default function BusinessFeesView() {
  const fees = useStore((s) => s.businessFees);
  const globalSearch = useStore((s) => s.globalSearch);

  const filteredFees = fees.filter(fee => {
    if (!globalSearch) return true;
    const s = globalSearch.toLowerCase();
    return fee.label.toLowerCase().includes(s) || fee.category.toLowerCase().includes(s);
  });

  return (
    <ScrollReveal className="w-full max-w-6xl mx-auto p-4 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight flex items-center gap-2">
            Frais & Dépenses
          </h1>
          <p className="text-sm text-zinc-500 mt-1">Gérez vos charges fixes et variables (loyer, marketing, abonnements...).</p>
        </div>
      </div>

      {filteredFees.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-12 text-center shadow-sm">
          <div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-6">
            <Receipt className="w-10 h-10 text-zinc-400 dark:text-zinc-500" />
          </div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">Aucun frais enregistré</h2>
          <p className="text-zinc-500 dark:text-zinc-400 max-w-md mx-auto">
            {globalSearch ? 'Aucun frais ne correspond à votre recherche.' : 'Les frais seront affichés ici une fois synchronisés ou implémentés.'}
          </p>
        </div>
      ) : (
        <>
          {/* ── DESKTOP TABLE ── */}
          <div className="hidden sm:block overflow-x-auto rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Libellé</TableHead>
                  <TableHead>Catégorie</TableHead>
                  <TableHead className="text-right">Montant</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFees.map((fee) => (
                  <TableRow key={fee.id} className="group cursor-default hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                    <TableCell className="text-zinc-500 text-sm">
                      {new Date(fee.date).toLocaleDateString('fr-MA')}
                    </TableCell>
                    <TableCell className="font-medium text-zinc-900 dark:text-white">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-zinc-400" />
                        {fee.label}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200">
                        {fee.category}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-bold text-rose-600 dark:text-rose-400">
                      -{formatCurrency(fromCents(fee.amount_cents))}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* ── MOBILE LIST ── */}
          <div className="sm:hidden flex flex-col gap-3">
            {filteredFees.map((fee) => (
              <Card key={fee.id}>
                <CardContent className="p-4 flex flex-col gap-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0 text-zinc-500">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-medium text-zinc-900 dark:text-white">
                          {fee.label}
                        </h4>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                          {new Date(fee.date).toLocaleDateString('fr-MA')}
                        </p>
                      </div>
                    </div>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">
                      {fee.category}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-zinc-100 dark:border-zinc-800">
                    <span className="text-xs text-zinc-500 font-medium">Montant</span>
                    <span className="font-bold text-rose-600 dark:text-rose-400">-{formatCurrency(fromCents(fee.amount_cents))}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </ScrollReveal>
  );
}
