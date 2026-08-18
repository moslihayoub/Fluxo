'use client';

import React, { useState } from 'react';
import { 
  Layers, Cpu, Sparkles, Database, ShieldCheck, 
  GitBranch, Server, Zap, Compass, CheckCircle2,
  Box, Smartphone, ArrowRight, Code, Terminal, Bot
} from 'lucide-react';
import { useStore } from '@/store/useStore';

export default function AdminStackView() {
  const store = useStore();
  const [activeSection, setActiveSection] = useState<'architecture' | 'ai_skills' | 'zero_float' | 'database' | 'sdd'>('architecture');

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Hero Card */}
      <div className="bg-gradient-to-r from-violet-950 via-zinc-900 to-zinc-950 text-white rounded-2xl p-6 border border-violet-900/50 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-violet-500/20 text-violet-300 rounded-full text-xs font-bold uppercase tracking-wider mb-3 border border-violet-500/30">
            <Layers className="w-3.5 h-3.5" />
            Spécification Technique & Conception
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            Stack Technique, Architecture & Méthodologie AI
          </h2>
          <p className="text-sm text-zinc-300 mt-2 max-w-2xl leading-relaxed">
            Cartographie complète de la conception de Fluxo : de la gestion de trésorerie zero-float à l'intégration de l'agent Gemini 2.0 Flash et la méthodologie Spec-Kit SDD.
          </p>

          {/* Quick Sub-navigation */}
          <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t border-zinc-800">
            {[
              { id: 'architecture', label: '1. Architecture Globale', icon: Layers },
              { id: 'ai_skills', label: '2. IA & Skills Méthodo', icon: Bot },
              { id: 'zero_float', label: '3. Moteur Zéro-Float', icon: ShieldCheck },
              { id: 'database', label: '4. Modèle Firestore', icon: Database },
              { id: 'sdd', label: '5. Méthodologie SDD', icon: GitBranch },
            ].map(item => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id as any)}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    isActive 
                      ? 'bg-white text-zinc-950 shadow-md scale-105' 
                      : 'bg-zinc-800/80 text-zinc-400 hover:text-white hover:bg-zinc-800'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* SECTION 1 : ARCHITECTURE GLOBALE */}
      {activeSection === 'architecture' && (
        <div className="space-y-6">
          {/* Visual Architecture Diagram */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
              <Layers className="w-5 h-5 text-violet-500" />
              Schéma de l'Architecture Multi-Couches
            </h3>

            {/* Diagram Container */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 my-6">
              {/* Layer 1: Client & PWA */}
              <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 flex flex-col justify-between">
                <div>
                  <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 text-[10px] font-bold rounded-md uppercase">
                    Couche Client
                  </span>
                  <h4 className="font-bold text-zinc-900 dark:text-white text-sm mt-2">Next.js 14 + PWA</h4>
                  <ul className="text-xs text-zinc-600 dark:text-zinc-400 mt-2 space-y-1">
                    <li>• App Router & Lazy Loading</li>
                    <li>• Service Worker offline (`sw.js`)</li>
                    <li>• Tailwind CSS + Base UI</li>
                    <li>• Lucide Icons & Recharts</li>
                  </ul>
                </div>
                <div className="mt-4 pt-3 border-t border-zinc-200 dark:border-zinc-800 text-[11px] text-zinc-400 font-mono">
                  Bundle: ~200 KB initial
                </div>
              </div>

              {/* Layer 2: State & Zero-Float */}
              <div className="bg-zinc-50 dark:bg-zinc-950 border border-violet-200 dark:border-violet-900/50 rounded-xl p-4 flex flex-col justify-between relative">
                <div>
                  <span className="px-2 py-0.5 bg-violet-100 dark:bg-violet-950/60 text-violet-700 dark:text-violet-400 text-[10px] font-bold rounded-md uppercase">
                    State & Calculs
                  </span>
                  <h4 className="font-bold text-zinc-900 dark:text-white text-sm mt-2">Zustand Slices + Zod</h4>
                  <ul className="text-xs text-zinc-600 dark:text-zinc-400 mt-2 space-y-1">
                    <li>• `operationsSlice.ts`</li>
                    <li>• `businessSlice.ts`</li>
                    <li>• Moteur Zéro-Float (Centimes)</li>
                    <li>• Validation stricte des schémas</li>
                  </ul>
                </div>
                <div className="mt-4 pt-3 border-t border-zinc-200 dark:border-zinc-800 text-[11px] text-violet-500 font-mono">
                  Local Persist + Reactivity
                </div>
              </div>

              {/* Layer 3: AI Engine */}
              <div className="bg-zinc-50 dark:bg-zinc-950 border border-amber-200 dark:border-amber-900/50 rounded-xl p-4 flex flex-col justify-between">
                <div>
                  <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 text-[10px] font-bold rounded-md uppercase">
                    Agent IA
                  </span>
                  <h4 className="font-bold text-zinc-900 dark:text-white text-sm mt-2">Gemini 2.0 Flash</h4>
                  <ul className="text-xs text-zinc-600 dark:text-zinc-400 mt-2 space-y-1">
                    <li>• `/api/finance-agent`</li>
                    <li>• OCR & Extraction Reçus</li>
                    <li>• Parsing structuré JSON</li>
                    <li>• Support multimodal PDF/Images</li>
                  </ul>
                </div>
                <div className="mt-4 pt-3 border-t border-zinc-200 dark:border-zinc-800 text-[11px] text-amber-500 font-mono">
                  Sub-second latency
                </div>
              </div>

              {/* Layer 4: Cloud Persistence */}
              <div className="bg-zinc-50 dark:bg-zinc-950 border border-emerald-200 dark:border-emerald-900/50 rounded-xl p-4 flex flex-col justify-between">
                <div>
                  <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold rounded-md uppercase">
                    Persistence Cloud
                  </span>
                  <h4 className="font-bold text-zinc-900 dark:text-white text-sm mt-2">Firebase Firestore</h4>
                  <ul className="text-xs text-zinc-600 dark:text-zinc-400 mt-2 space-y-1">
                    <li>• Google Auth Popup</li>
                    <li>• Sync multi-collections</li>
                    <li>• Real-time listeners `onSnapshot`</li>
                    <li>• Atomic Batch write support</li>
                  </ul>
                </div>
                <div className="mt-4 pt-3 border-t border-zinc-200 dark:border-zinc-800 text-[11px] text-emerald-500 font-mono">
                  9 sub-collections / UID
                </div>
              </div>
            </div>

            {/* Explanatory bullet points */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div className="p-4 bg-zinc-50 dark:bg-zinc-950/50 rounded-xl border border-zinc-200 dark:border-zinc-800">
                <h4 className="font-bold text-zinc-900 dark:text-white text-sm mb-1">Dual-Storage Hybride</h4>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  L'application fonctionne instantanément en <strong>Mode Invité</strong> (sauvegarde locale `localStorage` sous `charges-encaissements-store`) et se synchronise sans perte lors de la connexion Google sur Firestore.
                </p>
              </div>
              <div className="p-4 bg-zinc-50 dark:bg-zinc-950/50 rounded-xl border border-zinc-200 dark:border-zinc-800">
                <h4 className="font-bold text-zinc-900 dark:text-white text-sm mb-1">Architecture Modulaire Perso / Pro</h4>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Séparation étanche entre les flux de dépenses personnelles (Mois, Opérations, Catégories) et la gestion d'entreprise (Clients, Fournisseurs, Produits, Factures, Taxes) avec pont de reversement de bénéfices.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2 : IA & SKILLS METHODOLOGY */}
      {activeSection === 'ai_skills' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
              <Bot className="w-5 h-5 text-amber-500" />
              Intégration de l'Agent IA & Système de Skills
            </h3>

            {/* AI pipeline flow */}
            <div className="p-4 bg-gradient-to-br from-amber-500/5 via-violet-500/5 to-transparent border border-amber-200 dark:border-amber-900/30 rounded-xl mb-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                    1
                  </div>
                  <div>
                    <h5 className="font-bold text-sm text-zinc-900 dark:text-white">Input Multimodal</h5>
                    <p className="text-xs text-zinc-500">Factures, tickets de caisse, texte brut ou exports</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-zinc-400 hidden sm:block" />
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-950 text-violet-600 dark:text-violet-400 flex items-center justify-center font-bold">
                    2
                  </div>
                  <div>
                    <h5 className="font-bold text-sm text-zinc-900 dark:text-white">Gemini 2.0 Flash</h5>
                    <p className="text-xs text-zinc-500">Prompting système spécialisé trésorerie Maroc</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-zinc-400 hidden sm:block" />
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                    3
                  </div>
                  <div>
                    <h5 className="font-bold text-sm text-zinc-900 dark:text-white">Zod Validation</h5>
                    <p className="text-xs text-zinc-500">Conversion automatique en zero-float centimes</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Skills & Methodology details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800">
                <h4 className="font-bold text-zinc-900 dark:text-white text-sm mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-violet-500" />
                  Méthodologie Skills (`.agents/skills`)
                </h4>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  L'intelligence de développement repose sur le skill <code>methodology/SKILL.md</code>. Il impose des règles inviolables : vérification Chrome DevTools en temps réel, audits UXSpot MCP systématiques, et intégrité financière stricte sans régression.
                </p>
              </div>

              <div className="p-4 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800">
                <h4 className="font-bold text-zinc-900 dark:text-white text-sm mb-2 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  Sécurité & Clés API
                </h4>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Les requêtes passent par une route serveur sécurisée <code>/api/finance-agent</code>. La clé <code>GEMINI_API_KEY</code> n'est jamais exposée côté client.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3 : ZERO-FLOAT ENGINE */}
      {activeSection === 'zero_float' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
              Moteur Financier Zéro-Float (Integer Cents)
            </h3>

            <div className="bg-zinc-950 text-zinc-200 p-4 rounded-xl font-mono text-xs mb-6 overflow-x-auto">
              <p className="text-zinc-500">{'// 1. Saisie utilisateur (Dirhams) :'}</p>
              <p className="text-emerald-400">const amountMAD = 1200.50;</p>
              <p className="text-zinc-500 mt-2">{'// 2. Conversion en centimes entiers (Zero Float) :'}</p>
              <p className="text-violet-400">const amount_cents = Math.round(amountMAD * 100); // 120050</p>
              <p className="text-zinc-500 mt-2">{'// 3. Formatage pour affichage sécurisé :'}</p>
              <p className="text-blue-400">{'formatCurrency(amount_cents / 100); // "1.200,50 MAD"'}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30 rounded-xl">
                <h4 className="font-bold text-emerald-900 dark:text-emerald-300 text-sm mb-1">Précision Mathématique</h4>
                <p className="text-xs text-emerald-700 dark:text-emerald-400">
                  Élimination totale des erreurs de virgule flottante JavaScript (ex: `0.1 + 0.2 !== 0.3`).
                </p>
              </div>
              <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/30 rounded-xl">
                <h4 className="font-bold text-blue-900 dark:text-blue-300 text-sm mb-1">Règles Fiscales Exactes</h4>
                <p className="text-xs text-blue-700 dark:text-blue-400">
                  Calculs de TVA (20%) et d'impôt sur le revenu auto-entrepreneur (0.5% et 1.0%) sans arrondi parasite.
                </p>
              </div>
              <div className="p-4 bg-violet-50 dark:bg-violet-950/20 border border-violet-200 dark:border-violet-900/30 rounded-xl">
                <h4 className="font-bold text-violet-900 dark:text-violet-300 text-sm mb-1">Audit & Conformité</h4>
                <p className="text-xs text-violet-700 dark:text-violet-400">
                  Compatibilité directe avec les exports comptables, facturation légale et devis certifiés.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 4 : MODÈLE FIRESTORE */}
      {activeSection === 'database' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
              <Database className="w-5 h-5 text-violet-500" />
              Schéma des Collections Firestore (`users/{'{uid}'}/...`)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { name: 'months', label: 'Mois & Périodes', liveCount: store.months.length, desc: 'Identifiant du mois, label, solde de départ, état verrouillé.' },
                { name: 'operations', label: 'Opérations Perso', liveCount: store.operations.length, desc: 'Type entrée/sortie, montant_cents, catégorie, notes, sous-montants.' },
                { name: 'operationTypes', label: 'Catégories Perso', liveCount: store.operationTypes.length, desc: 'Nom, type (encaissement/décaissement), icône, montant par défaut.' },
                { name: 'businessOrders', label: 'Commandes Pro', liveCount: store.businessOrders.length, desc: 'Articles (items), quantité, coût, prix vente, statut paiement, TVA, marge.' },
                { name: 'businessClients', label: 'Clients Pro', liveCount: store.businessClients.length, desc: 'Nom, téléphone, email, total dépensé, statut VIP, type Particulier/Pro.' },
                { name: 'businessProducts', label: 'Catalogue Produits', liveCount: store.businessProducts.length, desc: 'Produits physiques/services, prix référence, liaison fournisseur & catégorie.' },
                { name: 'businessSuppliers', label: 'Fournisseurs', liveCount: store.businessSuppliers.length, desc: 'Marque, contact, type marchandise Physique/Digital, marchandises liées.' },
                { name: 'businessFees', label: 'Frais & Dépenses Pro', liveCount: store.businessFees.length, desc: 'Libellé, montant centimes, catégorie, liaison fournisseur, date.' },
                { name: 'businessCategories', label: 'Catégories Pro', liveCount: store.businessCategories.length, desc: 'Hiérarchie parent/enfant (Catégorie principale & Sous-catégories).' },
                { name: 'businessSettings', label: 'Paramètres Fiscaux', liveCount: 1, desc: 'Profil société/indépendant, taux TVA, taux IR, logo, coordonnées.' },
              ].map(col => (
                <div key={col.name} className="p-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono font-bold text-violet-600 dark:text-violet-400 text-xs">
                      {col.name}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-mono font-bold rounded">
                      {col.liveCount} {col.liveCount > 1 ? 'docs' : 'doc'}
                    </span>
                  </div>
                  <h5 className="font-semibold text-zinc-900 dark:text-white text-xs mb-1">{col.label}</h5>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-normal">{col.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SECTION 5 : MÉTHODOLOGIE SDD */}
      {activeSection === 'sdd' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
              <GitBranch className="w-5 h-5 text-blue-500" />
              Méthodologie Spec-Driven Development (SDD) & GitHub Spec-Kit
            </h3>

            <div className="space-y-3">
              {[
                { step: '1. Spécification & Contrat (Spec)', desc: 'Définition formelle des besoins dans STATUT.md et dans les schémas Zod avant tout développement.' },
                { step: '2. Développement Structuré par Composants & Standards UI', desc: 'Maintien de standards stricts : Sélecteurs 2-Cards, Sidebars "Détail..." (50% desktop, rounded-l-3xl), colonnes Date après ID.' },
                { step: '3. Audits UXSpot MCP & Accessibilité', desc: 'Vérification automatique des contrastes, des formulaires sans scroll excessif, et de l\'ergonomie mobile.' },
                { step: '4. Validation End-to-End en Direct (Navigateur Comet & DevTools MCP)', desc: 'Chaque modification est testée en direct sur le navigateur Comet avec captures d\'écran et interactions réelles.' },
              ].map(s => (
                <div key={s.step} className="p-3.5 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-bold text-xs text-zinc-900 dark:text-white">{s.step}</h5>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
