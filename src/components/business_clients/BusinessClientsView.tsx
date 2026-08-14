'use client';

import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { Plus, Phone, MessageCircle, Mail, MapPin, Edit2, Trash2, Star, Percent, Users, Download } from 'lucide-react';
import type { BusinessClient } from '@/types';
import ClientDialog from './ClientDialog';
import { exportToCSV } from '@/lib/exportUtils';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal } from 'lucide-react';
import { ScrollReveal } from '@/components/ui/Animation';
export default function BusinessClientsView() {
  const clients = useStore((s) => s.businessClients) || [];
  const globalSearch = useStore((s) => s.globalSearch);
  const deleteClient = useStore((s) => s.deleteBusinessClient);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<BusinessClient | null>(null);

  const filteredClients = clients.filter(c => {
    const s = globalSearch.toLowerCase();
    return (
      (c.name || '').toLowerCase().includes(s) ||
      (c.email?.toLowerCase() || '').includes(s) ||
      (c.phone || '').includes(s)
    );
  });

  const handleEdit = (client: BusinessClient) => {
    setEditingClient(client);
    setIsDialogOpen(true);
  };

  const handleAdd = () => {
    setEditingClient(null);
    setIsDialogOpen(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD' }).format(amount);
  };

  const handleExport = () => {
    const headers = ['Nom', 'Email', 'Téléphone', 'Adresse', 'Total Dépensé (MAD)', 'Reste à Payer (MAD)', 'Client VIP', 'Réduction Par Défaut (%)'];
    const data = filteredClients.map(c => [
      c.name || 'Client Sans Nom',
      c.email || '',
      c.phone || '',
      c.address || '',
      c.totalSpent_cents,
      c.totalPending_cents,
      c.isVip ? 'Oui' : 'Non',
      c.defaultDiscountRate || 0
    ]);
    exportToCSV('clients', headers, data);
  };

  return (
    <ScrollReveal className="w-full max-w-6xl mx-auto p-4 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">Clients & CRM</h1>
          <p className="text-sm text-zinc-500">Gérez vos clients, leurs avantages et coordonnez vos ventes.</p>
        </div>
        {clients.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleExport}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 rounded-lg font-medium hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors shadow-sm"
              title="Exporter en CSV"
            >
              <Download className="w-4 h-4" /> Exporter
            </button>
            <button
              onClick={handleAdd}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-lg font-medium hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" /> Ajouter un client
            </button>
          </div>
        )}
      </div>

      {/* Search & Filters */}
      {/* Search has been moved to global Header */}

      {/* Clients Grid */}
      {filteredClients.length > 0 ? (
        <>
          {/* ── DESKTOP TABLE ── */}
          <div className="hidden sm:block overflow-x-auto rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">ID</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Adresse</TableHead>
                  <TableHead className="text-right">CA Généré</TableHead>
                  <TableHead className="text-right w-16">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.map((client) => (
                  <TableRow key={client.id} className="group cursor-default">
                    <TableCell className="font-mono text-xs text-zinc-500">
                      {client.id.slice(0, 8)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {client.avatarUrl ? (
                          <img src={client.avatarUrl} alt={client.name || 'Client'} className="w-8 h-8 rounded-full object-cover border border-zinc-200 dark:border-zinc-700" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 flex items-center justify-center text-sm font-bold">
                            {(client.name || '?').charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <h3 className="font-bold text-zinc-900 dark:text-white flex items-center gap-1.5 text-sm">
                            {client.name || 'Client Inconnu'}
                            {client.clientType === 'pro' && (
                              <span className="text-[9px] font-bold uppercase tracking-wider bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 px-1 py-0.5 rounded">Pro</span>
                            )}
                            {client.isVip && <Star className="w-3 h-3 text-amber-500 fill-amber-500" />}
                          </h3>
                          {client.defaultDiscountRate && (
                            <span className="inline-flex items-center gap-0.5 text-[9px] font-bold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 px-1 py-0.5 rounded mt-0.5">
                              <Percent className="w-2.5 h-2.5" /> Promo {client.defaultDiscountRate}%
                            </span>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1 text-xs text-zinc-600 dark:text-zinc-400">
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5" /> <a href={`tel:${client.phone}`} className="hover:underline hover:text-violet-500">{client.phone}</a>
                        </div>
                        {client.email && (
                          <div className="flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5" /> <a href={`mailto:${client.email}`} className="hover:underline hover:text-violet-500 truncate max-w-[150px]">{client.email}</a>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-zinc-600 dark:text-zinc-400 max-w-[200px] truncate">
                        <div className="flex flex-col gap-1.5">
                          {client.address && (
                            <div className="flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5 shrink-0" /> <span className="truncate">{client.address}</span>
                            </div>
                          )}
                          {client.city && (
                            <div className="flex items-center gap-1.5 text-zinc-500">
                              <span className="truncate">{client.city}</span>
                            </div>
                          )}
                        </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="font-black text-sm text-zinc-900 dark:text-white">
                        {formatCurrency(client.totalSpent_cents)}
                      </div>
                      {client.totalPending_cents > 0 && (
                        <div className="text-[10px] font-bold text-rose-500 mt-0.5">
                          Reste: {formatCurrency(client.totalPending_cents)}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger>
                          <button className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800 focus:outline-none">
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(client)}>
                            <Edit2 className="w-4 h-4 mr-2" />
                            Modifier
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => window.open(`https://wa.me/${client.phone.replace(/[^0-9]/g, '')}`, '_blank')} className="text-green-600 focus:text-green-600 focus:bg-green-50 dark:focus:bg-green-900/20">
                            <MessageCircle className="w-4 h-4 mr-2" />
                            WhatsApp
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => { if(confirm('Supprimer ce client ?')) deleteClient(client.id); }} className="text-rose-600 focus:bg-rose-50 focus:text-rose-600 dark:focus:bg-rose-900/20 dark:focus:text-rose-400">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* ── MOBILE LIST ── */}
          <div className="sm:hidden flex flex-col gap-3">
            {filteredClients.map((client) => (
              <Card key={client.id}>
                <CardContent className="p-4 flex flex-col gap-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {client.avatarUrl ? (
                        <img src={client.avatarUrl} alt={client.name || 'Client'} className="w-10 h-10 rounded-full object-cover border border-zinc-200 dark:border-zinc-700" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 flex items-center justify-center text-lg font-bold">
                          {(client.name || '?').charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <h3 className="font-bold text-zinc-900 dark:text-white flex items-center gap-1.5 text-base">
                          {client.name || 'Client Inconnu'}
                          {client.clientType === 'pro' && (
                            <span className="text-[10px] font-bold uppercase tracking-wider bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 px-1 py-0.5 rounded">Pro</span>
                          )}
                          {client.isVip && <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />}
                        </h3>
                        <span className="text-xs text-zinc-500 block mt-0.5">ID: {client.id.slice(0, 8)}</span>
                        {client.defaultDiscountRate && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded mt-0.5">
                            <Percent className="w-3 h-3" /> Promo {client.defaultDiscountRate}%
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="relative ml-2 shrink-0">
                      <DropdownMenu>
                        <DropdownMenuTrigger>
                          <button className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors bg-zinc-50 dark:bg-zinc-800/50">
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(client)}>
                            <Edit2 className="w-4 h-4 mr-2" />
                            Modifier
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => window.open(`https://wa.me/${client.phone.replace(/[^0-9]/g, '')}`, '_blank')} className="text-green-600 focus:text-green-600 focus:bg-green-50 dark:focus:bg-green-900/20">
                            <MessageCircle className="w-4 h-4 mr-2" />
                            WhatsApp
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => { if(confirm('Supprimer ce client ?')) deleteClient(client.id); }} className="text-rose-600 focus:bg-rose-50 focus:text-rose-600 dark:focus:bg-rose-900/20 dark:focus:text-rose-400">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5 text-sm text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800/30 p-2.5 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4" /> <a href={`tel:${client.phone}`} className="hover:underline hover:text-violet-500">{client.phone}</a>
                    </div>
                    {client.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4" /> <a href={`mailto:${client.email}`} className="hover:underline hover:text-violet-500 truncate">{client.email}</a>
                      </div>
                    )}
                    {client.address && (
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 shrink-0" /> <span className="truncate">{client.address}</span>
                        </div>
                        {client.city && <div className="pl-6 text-xs text-zinc-500">{client.city}</div>}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs text-zinc-500 font-medium">CA Généré</span>
                    <div className="text-right">
                      <span className="font-bold text-zinc-900 dark:text-white">{formatCurrency(client.totalSpent_cents)}</span>
                      {client.totalPending_cents > 0 && (
                        <div className="text-[10px] font-semibold text-rose-500">Reste: {formatCurrency(client.totalPending_cents)}</div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      ) : (
        <div className="text-center py-12 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 border-dashed">
          <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-zinc-400" />
          </div>
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">Aucun client trouvé</h3>
          <p className="text-zinc-500 text-sm mb-6 max-w-sm mx-auto">
            {globalSearch ? "Aucun client ne correspond à votre recherche." : "Vous n'avez pas encore de clients. Ajoutez votre premier client pour commencer."}
          </p>
          {!globalSearch && (
            <button onClick={handleAdd} className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-lg font-medium hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors shadow-sm">
              <Plus className="w-4 h-4" /> Ajouter mon premier client
            </button>
          )}
        </div>
      )}

      <ClientDialog 
        isOpen={isDialogOpen} 
        onClose={() => setIsDialogOpen(false)} 
        client={editingClient} 
      />
    </ScrollReveal>
  );
}
