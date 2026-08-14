'use client';

import { useState } from 'react';
import { User, Briefcase, Building2, UserCircle, ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useStore } from '@/store/useStore';
import type { WorkspaceMode, BusinessProfileType } from '@/types';

export default function OnboardingView() {
  const workspaceMode = useStore((s) => s.workspaceMode);
  const setWorkspaceMode = useStore((s) => s.setWorkspaceMode);
  const setBusinessProfileType = useStore((s) => s.setBusinessProfileType);
  const setActiveView = useStore((s) => s.setActiveView);
  
  const [selectedMode, setSelectedMode] = useState<WorkspaceMode | null>(workspaceMode);
  const [selectedProfile, setSelectedProfile] = useState<BusinessProfileType | null>(null);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 px-4 py-8 overflow-y-auto">
      <div className="w-full max-w-4xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-500">
        
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-zinc-900 dark:bg-white mx-auto flex items-center justify-center shadow-xl mb-6">
            <span className="text-white dark:text-zinc-900 text-2xl font-black tracking-tighter font-mono">FX</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
            Bienvenue sur Fluxo
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-lg max-w-lg mx-auto">
            {selectedMode === 'business' 
              ? 'Sélectionnez votre profil vendeur pour adapter la fiscalité (TVA).'
              : 'Choisissez votre univers pour adapter l\'application à vos besoins.'}
          </p>
        </div>

        {!selectedMode ? (
          <div className="grid sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
            {/* Mode Personnel */}
            <button
              onClick={() => {
                setSelectedMode('personal');
                setWorkspaceMode('personal');
                setBusinessProfileType(null);
                setActiveView('dashboard');
              }}
              className="text-left group relative flex flex-col p-6 rounded-3xl border-2 border-transparent bg-white dark:bg-zinc-900 shadow-sm hover:shadow-md hover:border-zinc-200 dark:hover:border-zinc-800 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4 text-blue-600 dark:text-blue-400">
                <User className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">Mode Personnel</h3>
              <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-6 flex-1">
                Suivi de budget familial, gestion des dépenses courantes, épargne et pointage de trésorerie mois par mois.
              </p>
              <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-300 mb-6">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Gestion des Dépenses & Recettes</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Archives mensuelles</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Statistiques personnelles</li>
              </ul>
              <div className="mt-auto flex items-center text-blue-600 dark:text-blue-400 font-medium text-sm group-hover:translate-x-1 transition-transform">
                Démarrer <ArrowRight className="w-4 h-4 ml-1" />
              </div>
            </button>

            {/* Mode Business */}
            <button
              onClick={() => setSelectedMode('business')}
              className="text-left group relative flex flex-col p-6 rounded-3xl border-2 border-transparent bg-white dark:bg-zinc-900 shadow-sm hover:shadow-md hover:border-violet-500/50 dark:hover:border-violet-400/50 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center mb-4 text-violet-600 dark:text-violet-400">
                <Briefcase className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">Mode Business Pro</h3>
              <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-6 flex-1">
                Idéal pour les vendeurs e-commerce, Instagram/WhatsApp, ou les commerces physiques.
              </p>
              <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-300 mb-6">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Calculateur de Bénéfice & Marge</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Factures & Bons de livraison</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Gestion des Avances & Clients</li>
              </ul>
              <div className="mt-auto flex items-center text-violet-600 dark:text-violet-400 font-medium text-sm group-hover:translate-x-1 transition-transform">
                Sélectionner <ArrowRight className="w-4 h-4 ml-1" />
              </div>
            </button>
          </div>
        ) : selectedMode === 'business' ? (
          <div className="max-w-3xl mx-auto animate-in slide-in-from-right-8 fade-in duration-300">
            <button 
              onClick={() => setSelectedMode(null)}
              className="flex items-center text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-1" /> Retour au choix du mode
            </button>
            
            <div className="grid sm:grid-cols-2 gap-4">
              {/* Profil Indépendant */}
              <button
                onClick={() => {
                  setSelectedProfile('freelance');
                  setWorkspaceMode('business');
                  setBusinessProfileType('freelance');
                  setActiveView('dashboard');
                }}
                className={`text-left flex flex-col p-6 rounded-2xl border-2 transition-all duration-200 relative ${
                  selectedProfile === 'freelance' 
                    ? 'border-zinc-900 ring-2 ring-zinc-900 bg-zinc-50 dark:border-white dark:ring-white dark:bg-zinc-800 shadow-md' 
                    : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700'
                }`}
              >
                {selectedProfile === 'freelance' && <CheckCircle2 className="absolute top-6 right-6 w-6 h-6 text-zinc-900 dark:text-white animate-in zoom-in-50" />}
                <UserCircle className="w-8 h-8 text-violet-500 mb-3" />
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-1">Vendeur Indépendant</h3>
                <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-4">Auto-entrepreneur, vente en ligne informelle (Instagram, WhatsApp).</p>
                <div className="mt-auto inline-flex items-center rounded-full bg-zinc-100 dark:bg-zinc-800 px-2.5 py-0.5 text-xs font-semibold text-zinc-600 dark:text-zinc-300 w-fit">
                  Vente sans TVA (HT) par défaut
                </div>
              </button>

              {/* Profil Entreprise */}
              <button
                onClick={() => {
                  setSelectedProfile('company');
                  setWorkspaceMode('business');
                  setBusinessProfileType('company');
                  setActiveView('dashboard');
                }}
                className={`text-left flex flex-col p-6 rounded-2xl border-2 transition-all duration-200 relative ${
                  selectedProfile === 'company' 
                    ? 'border-zinc-900 ring-2 ring-zinc-900 bg-zinc-50 dark:border-white dark:ring-white dark:bg-zinc-800 shadow-md' 
                    : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700'
                }`}
              >
                {selectedProfile === 'company' && <CheckCircle2 className="absolute top-6 right-6 w-6 h-6 text-zinc-900 dark:text-white animate-in zoom-in-50" />}
                <Building2 className="w-8 h-8 text-violet-500 mb-3" />
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-1">Professionnel / Entreprise</h3>
                <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-4">Société immatriculée ou boutique physique assujettie à la TVA.</p>
                <div className="mt-auto inline-flex items-center rounded-full bg-zinc-100 dark:bg-zinc-800 px-2.5 py-0.5 text-xs font-semibold text-zinc-600 dark:text-zinc-300 w-fit">
                  Vente avec TVA (20%) par défaut
                </div>
              </button>
            </div>
          </div>
        ) : null}

      </div>
    </div>
  );
}
