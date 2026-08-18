# 📊 STATUT & HISTORIQUE DU PROJET — Fluxo (Charges & Encaissements)

**Date & Heure :** 18 Août 2026  
**Application :** Fluxo (Charges & Encaissements)  
**URL Live :** `https://fluxofinance.vercel.app/`  
**Environnement :** Next.js 14 (App Router), TypeScript, Tailwind CSS, Zustand, Firebase (Auth/Firestore), Recharts, Gemini 2.0 Flash, PWA, Spec-Kit (SDD), UXSpot MCP, shadcn/ui.

---

## 📜 1. Historique & Évolution des Demandes

### Phase 1 : Scaffolding & Initialisation
- Scaffolding d'un projet Next.js 14 avec App Router et TypeScript.
- Mise en place de Zustand pour la gestion d'état globale avec persistance `localStorage` (Guest mode).
- Configuration de la palette noir & blanc SaaS (dark/light mode).
- Définition du Service Worker `sw.js` et du `manifest.json` pour la PWA.

### Phase 2 : Fonctionnalités de base
- **Gestion des mois :** Création, archivage, restauration, validation contre les doublons.
- **Vue Opérations :** Filtres (Tout / Encaissements / Décaissements), export CSV (mois ou global), import CSV client.
- **MetricsBar :** Barre fixe en bas de l'écran avec 3 métriques (Total encaissements, Total décaissements, Solde).
- **Dashboard :** 4 cartes KPIs + graphiques interactifs Recharts + tableau récapitulatif.
- **Agent AI :** Connexion à Google Gemini (`gemini-2.0-flash`) pour l'extraction intelligente d'opérations via fichiers ou texte brut.

### Phase 3 : Personnalisation Métier & Catégories
- **Devise MAD :** Utilisation du Dirham marocain (`MAD`) avec formatage `fr-MA`.
- **Gestionnaire de Catégories :** Liste des catégories, recherche, édition rétroactive, modale de suppression, et vue détaillée de l'historique par catégorie.
- **Ordre & Simplification (Dialog Opération) :** Le libellé est auto-rempli. Ordre strict : Type → Catégorie → Montant → Notes.

### Phase 4 : Déploiement, Firebase & Expérience Mobile 📱
- **Intégration Firebase :**
   - **Authentification (Google Auth) :** Connexion sécurisée (`signInWithPopup`).
   - **Firestore (Base de données) :** Sauvegarde cloud automatique des opérations, types et mois synchronisée avec le compte utilisateur (`users/{uid}/...`).
   - Mode "Invité" maintenu via `localStorage` si l'utilisateur ne souhaite pas se connecter.
- **Refonte Mobile UX (Audit UXSpot) :**
   - Navigation mobile optimisée : Menu burger plein écran, et bottom navigation.
   - Listes fluides : Remplacement de l'effet "cartes dans une carte" par des listes épurées pour aérer l'interface.
   - Tiroirs d'actions (Bottom Sheet).
- **CI/CD Vercel :** Déploiement continu configuré via GitHub. Gestion sécurisée des erreurs d'initialisation SSG (`auth/invalid-api-key`) lors de la compilation sur Vercel.

### Phase 5 : "Settings Hub", Fiscalité (Auto-entrepreneur) & Documents
1. **Refonte des paramètres (Hub de Paramétrage) :** Création d'une vue à onglets (Profil, Localisation, Fiscalité, Documents).
2. **Internationalisation (Localisation) :** Paramétrage manuel du pays et de la devise.
3. **Fiscalité :** Prise en charge des statuts (Auto-entrepreneur avec taux fixes 0.5% ou 1% selon Produit/Service, et Société avec gestion TVA).
4. **Génération de documents :** Factures, Bons de Commande, Bons de Livraison, exports PDF et envois WhatsApp/Email.

### Phase 6 : Pages Techniques Bilingues & Résilience Réseau 🛡️
1. **Page 404 (Page Introuvable) :** `src/app/not-found.tsx` avec design SaaS épuré, directement intégré au layout.
2. **Page 500 (Erreur Serveur / Application) :** `src/app/error.tsx` et `ErrorBoundary.tsx` avec bouton `Réessayer` (`reset()`) et navigation retour.
3. **Page 502 / 503 (Bad Gateway / Maintenance) :** `src/app/502/page.tsx` avec badge de sécurité des données locales et rafraîchissement.
4. **Détection Hors-Ligne (OfflineDetector) :** `src/components/tech/OfflineDetector.tsx` alertant discrètement l'utilisateur sans bloquer son travail en mode local.

### Phase 7 : Console d'Administration, Logs Système & Stack Architecture AI ⚙️
1. **Accès Sécurisé Administrateur :** Activé automatiquement pour `moslihayoub@gmail.com` et en environnement de développement local (`localhost`).
2. **Journal & Télémétrie Système (`AdminLogsView.tsx`) :**
   - Surveillance de l'utilisation mémoire `localStorage` (en KB).
   - Suivi en temps réel de l'état de synchronisation des 9 sous-collections Firestore.
   - Intégrité 100% zéro-float certifiée.
   - Terminal d'audit en direct (`fluxo://system/audit.log`) avec filtres par niveau (INFO, WARN, ERROR, SUCCESS).
   - Boutons d'export Dump JSON complet de l'état Zustand et copie des logs.
3. **Architecture & Conception AI (`AdminStackView.tsx`) :**
   - Schémas interactifs multi-couches : Client Next.js 14 PWA, Zustand Slices, Agent Gemini 2.0 Flash, Firestore Sync.
   - Documentation du moteur financier zéro-float (centimes entiers).
   - Pipeline de l'Agent IA (prompts multimodaux, parsing Zod, skills).
   - Cartographie des relations de la base de données Firestore.
   - Méthodologie SDD (Spec-Driven Development) & GitHub Spec-Kit.

### Phase 8 : Standardisation UI 2-Cards, Refonte Sidebars & Intégration Date (17 Août 2026) 💎
1. **Sélecteur Visuel 2 Cartes (Clients & Fournisseurs) :**
   - Remplacement des switchs de header par un sélecteur à 2 cartes interactives placé dans le formulaire sous l'avatar/logo.
   - Client : **Particulier** (`User`, bleu) / **Professionnel** (`Building2`, violet).
   - Fournisseur : **Physique** (`Package`, bleu) / **Digital** (`Laptop`, violet).
2. **Harmonisation des Titres en "Détail..." :**
   - Remplacement de "Modifier..." par **"Détail..."** sur tous les tiroirs (`Détail du client`, `Détail du fournisseur`, `Détail du produit`, `Détail du service`, `Détail du frais`, `Détail de la vente`, `Détail de l'opération`).
3. **Optimisation des Tableaux Métier :**
   - Suppression de la colonne redondante "Total Achat" sur la page Fournisseurs.
   - Ajout systématique de la colonne **Date** immédiatement après la colonne **ID** sur toutes les tables (Clients, Fournisseurs, Produits, Frais/Dépenses, Ventes).
4. **Correction et Standardisation Sidebar Feedback :**
   - Refonte de `FeedbackWidget.tsx` avec `createPortal` pour adopter le layout sidebar standardisé (`rounded-l-3xl`, z-[120], fond flouté, header avec croix et footer d'actions).
5. **Harmonisation Header Mode Switcher :**
   - Sélecteur segmenté dual-pill ergonomique `[ 👤 Perso ] [ 🏢 Pro ]`.
6. **Bénéfice Pro Sync :**
   - Synchronisation à la demande dans l'espace Perso sans lignes fantômes forcées.

### Phase 9 : Suppression Totale de l'Onboarding & Unification Paramètres (18 Août 2026) ⚡
1. **Accès Immédiat sans Blocage :**
   - Suppression définitive de `OnboardingView.tsx` et du flag `hasCompletedOnboarding`.
   - L'utilisateur accède instantanément à l'espace sans étape préliminaire forcée.
2. **Refonte des Paramètres "Fiscalité & Identifiants" :**
   - Regroupement des informations légales (ICE, SIRET, IF, RC, CNSS) au sein de la section unifiée **"Fiscalité & Identifiants"** dans `BusinessSettingsView.tsx`.
   - L'utilisateur configure librement son mode de vente (TVA / Hors TVA), son pays, sa devise et ses taux de taxe sans friction.
3. **Synchronisation Bénéfice Pro vers Perso :**
   - Toggle d'activation direct dans les paramètres Pro (`syncProfitToPerso`).
   - Insertion propre dans les catégories Perso avec badge en surbrillance épuré **Bénéfice Pro**.

### Phase 10 : Raffinements UI FigJam, Déploiement v1.9 & Intégration Skill shadcn/ui (18 Août 2026) 🎨
1. **Homogénéisation Thématique & Couleurs (Perso = Noir / Pro = Violet) :**
   - Espace Perso : Boutons d'actions et tiroirs en Noir/Zinc (`bg-zinc-900 text-white dark:bg-white dark:text-zinc-900`).
   - Espace Pro : Boutons d'actions, tiroirs et badges en Violet (`bg-violet-600 hover:bg-violet-700 text-white shadow-sm`).
2. **Standardisation des Tiroirs Latéraux (Drawers / Sheets) :**
   - `OperationDialog.tsx` & `CategoriesView.tsx` : Remplacement des popups modales centrales par des tiroirs glissants depuis la droite (`w-full sm:w-[50%] max-w-xl`).
   - `OrderDialog.tsx` : Épuration du CTA secondaire d'ajout d'article et footer standardisé.
   - `SupplierDialog.tsx` & `BusinessSuppliersView.tsx` : Avatars unifiés en forme circulaire (`rounded-full` et `shape="circle"`), colonne `Catégories` dédiée dans le tableau.
   - `FeeDialog.tsx` & `BusinessFeesView.tsx` : Dropdowns étendus à 100% de la largeur des inputs (`w-full`) et footer d'actions violet.
3. **Résolution des Chevauchements Graphiques (Pro Dashboard) :**
   - Conversion des graphiques Top Produits et Répartition des Frais en **Donuts épurés** (`innerRadius={45} outerRadius={75}`).
   - Suppression des labels de tranches imbriqués, intégration d'une légende inférieure et `CustomTooltip`.
4. **Intégration du Skill Officiel `shadcn/ui` :**
   - Création de `.agents/skills/shadcn-ui/SKILL.md` (règles Open Code, composition, base-nova, tokens CSS variables).
   - Intégration dans la méthodologie `.agents/skills/methodology/SKILL.md` (Section 7).
5. **Validation & Déploiement Live :**
   - `npm run lint` & `npx tsc --noEmit` validés avec **0 erreur, 0 warning**.
   - Build de production Next.js 14 compilé et déployé sur `https://fluxofinance.vercel.app/`.

### Phase 11 : Harmonisation Complète UI, Primitives Shadcn & 100% Tiroirs Latéraux (18 Août 2026) 🚀
1. **Nouvelles Primitives Shadcn UI (`src/components/ui/`) :**
   - `switch.tsx` : Interrupteur accessible (@base-ui/react) avec états thématisés Perso (Noir/Zinc) et Pro (Violet).
   - `tooltip.tsx` : Infobulles contextuelles pour les termes fiscaux et légaux.
   - `popover.tsx` : Popovers interactifs riches pour les filtres et sélecteurs complexes.
   - `skeleton.tsx` : États de chargement fluides (shimmer) pour les listes et les cartes KPIs.
2. **Élimination des Reliquats de `<select>` Natifs :**
   - Migration de `AgentDialog.tsx` (Mois cible) et `BusinessImportDialog.tsx` (Mapping CSV) vers le composant Shadcn Web `Select.tsx`.
3. **Harmonisation 100% Tiroirs Latéraux (Sidebar Drawers) :**
   - Migration de `AgentDialog.tsx` et `BusinessImportDialog.tsx` du format modale centrale flottante vers le format standard de tiroir latéral glissant droit (`sm:w-[50%]`, `rounded-l-3xl`, header croix, footer d'actions).
4. **Correction Thématique et Intégration Switch :**
   - `ConfirmDialog.tsx` : Rétablissement du support complet du mode clair (`bg-white dark:bg-zinc-900`, `text-zinc-900 dark:text-white`).
   - `BusinessSettingsView.tsx` : Remplacement du toggle manuel par le composant `Switch` shadcn.
5. **Validation Globale & Compilation :**
   - 0 erreur ESLint / TypeScript, `npm run build` Next.js 14 validé avec succès.

---

## 📌 Dernières actions (18 Août 2026 — Harmonisation UI, Primitives Shadcn & Tiroirs 100% Standardisés)

### 1. Phase 11 : Primitives Shadcn & Standardisation UI Totale
- **Nouvelles Primitives** : Création de `switch.tsx`, `tooltip.tsx`, `popover.tsx` et `skeleton.tsx`.
- **Tiroirs Latéraux Unifiés** : `AgentDialog.tsx` et `BusinessImportDialog.tsx` migrés en tiroirs latéraux glissants droits standards (`sm:w-[50%]`, `rounded-l-3xl`).
- **Zéro `<select>` Natif** : Remplacement des derniers menus natifs OS par `Select.tsx` dans l'Agent IA et l'import de ventes.
- **Mode Clair ConfirmDialog** : Boîte de dialogue de confirmation réactive aux thèmes clair et sombre.
- **Switch Paramètres** : Intégration de `Switch` pour la synchronisation Pro-Perso dans `BusinessSettingsView.tsx`.
- **Architecture 8 Skills Métier** : `clean-code-architecture`, `saas-security-integrity`, `shadcn-ui`, `methodology`, `pdf-documents-engine`, `pwa-offline-resilience`, `financial-analytics-charts`, `i18n-localization-tax`.

---

## 📌 Actions Précédentes (18 Août 2026 — Suppression Onboarding, Unification Paramètres, UI FigJam v1.9)

## 📌 Actions Précédentes (17 Août 2026 — 2-Cards Selectors, Wording Particulier/Pro, Détail Sidebars, Date après ID & Feedback Portal)

### 1. Composants 2 Cartes & Wording Particulier/Professionnel :
- `ClientDialog.tsx` : Corps de formulaire enrichi avec le sélecteur 2 cartes `[ 👤 Particulier ] [ 🏢 Professionnel ]` (avec sous-titres descriptifs et couleurs dynamiques bleu/violet). Suppression du toggle d'en-tête.
- `SupplierDialog.tsx` : Corps de formulaire enrichi avec le sélecteur 2 cartes `[ 📦 Physique ] [ 💻 Digital ]`. Suppression du toggle d'en-tête.
- Wording et badges mis à jour en "Particulier" et "Professionnel" dans les tableaux et vues.

### 2. Renommage des Modales en "Détail..." :
- Tous les tiroirs d'édition utilisent désormais le préfixe **Détail** (`Détail du client`, `Détail du fournisseur`, `Détail du produit`, `Détail du service`, `Détail du frais`, `Détail de la vente`, `Détail de l'opération`, `i18n.ts`).

### 3. Allègement du Tableau Fournisseurs :
- Retrait de la colonne `TOTAL ACHAT` du tableau `BusinessSuppliersView.tsx` pour éliminer la redondance avec la carte KPI du haut.

### 4. Insertion de la Colonne Date après l'ID :
- Insertion de la colonne `Date` (date de création) immédiatement après `ID` dans tous les tableaux Pro (`BusinessClientsView`, `BusinessSuppliersView`, `BusinessProductsView`, `BusinessFeesView`, `BusinessOrdersView`).

### 5. Correction Sidebar Feedback avec React Portal :
- `FeedbackWidget.tsx` : Intégration de `createPortal(..., document.body)` et harmonisation des classes CSS (`z-[120]`, `w-[50%]`, `rounded-l-3xl`, header épuré) pour garantir un affichage en tiroir latéral droit parfait, sans être bloqué par le stacking context du footer.


---

## 🧪 2. Déploiement & Environnement

### Variables d'environnement critiques (`.env.local` / Vercel Settings) :
- `GEMINI_API_KEY`
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`

---

## 🗂️ 3. Structure des Fichiers du Projet

```text
/Users/fahdrahali/Downloads/Operation/
├── .env.local                         # Clés GEMINI et FIREBASE
├── next.config.js                     # Config Next.js
├── STATUT.md                          # Ce document de statut
├── src/
│   ├── app/
│   │   ├── api/finance-agent/route.ts # Route API Gemini 2.0 Flash
│   │   └── page.tsx                   # Page Principale
│   ├── components/
│   │   ├── auth/                      # Composants Firebase Auth (AuthWrapper)
│   │   ├── layout/                    # Header, MetricsBar, Drawer mobile
│   │   ├── operations/                # OperationsView (Bottom Sheet) & Modales
│   │   ├── categories/                # CategoriesView
│   │   └── business_settings/         # Nouveau: BusinessSettingsView (Hub)
│   ├── store/
│   │   └── useStore.ts                # Store Zustand + Sync Firestore & LocalStorage
│   ├── types/
│   │   └── index.ts                   # Types (AppState, Operation, Month, BusinessSettings)
│   └── lib/
│       ├── firebase.ts                # Init Firebase Client SDK (graceful SSG fallback)
│       └── utils.ts                   # Helpers MAD & formatage
```

---

## 🎯 4. État du Projet et Prochaines Étapes

| Éléments | Statut |
|---|---|
| Build Production Vercel | ✅ Succès |
| Authentification Firebase | ✅ Opérationnel |
| Sauvegarde Firestore | ✅ Opérationnel |
| Refonte Mobile | ✅ Terminée (Tiroirs fluides) |
| Hub de Paramétrage (UI) | ✅ Terminé |
| Méthodologie SDD (GitHub Spec-Kit) | ✅ Intégrée (`.spec/` & `specify-cli`) |
| Audits UXSpot MCP & DevTools | ✅ Opérationnel (Checklists & WCAG) |
| Documents & PDFs | 🔄 En cours / À faire |
| STATUT automatisé | ✅ |
| Bundle Performance | ✅ 653KB → 280KB (-57%) via next/dynamic |
| Tests E2E (Playwright) | ✅ 4/4 Tests Réussis (100%) |

🔄 Mise à jour automatique du statut via protocole de fin de tâche

## 📌 Dernières actions (14 Août 2026 — UI Harmonization, Sidebars & WhatsApp)

### 1. Comportement des sidebars/modales (Desktop) :
- Les tiroirs latéraux (`ClientDialog`, `SupplierDialog`, `ProductDialog`, `OrderDialog`, `InvoiceDialog`) ne se ferment plus accidentellement lors d'un clic à l'extérieur (backdrop) sur la version Desktop (`sm`). La fermeture nécessite un clic sur la croix (X) ou le bouton Annuler. Sur mobile, le clic à l'extérieur est maintenu pour l'ergonomie.

### 2. Harmonisation Client / Fournisseur / Produit :
- **Type de Client / Marchandise** : Remontés tout en haut, juste en dessous de l'upload d'Avatar/Logo, avant la section nom/prénom, pour unifier les deux formulaires.
- **Champ WhatsApp** : Ajout du champ WhatsApp et de son toggle `(Identique au numéro de téléphone)` au formulaire `ClientDialog` exactement comme dans le fournisseur.
- **Champs Optionnels** : Standardisation de la mention `(optionnel)` en gris et en minuscule sur tous les labels non obligatoires (Nom, Email, Ville, Adresse) dans l'ensemble des formulaires.

### 3. Épuration des Icônes dans les Sidebars :
- Transformation des icônes d'en-tête et de section de tous les sidebars Pro (`Client`, `Fournisseur`, `Produit`, `Commande`, `Document`). Suppression des couleurs violettes au profit d'un style monochrome (`text-zinc-900 dark:text-white`) avec fond neutre (`bg-zinc-100 dark:bg-zinc-800`), utilisant Lucide Icons.

---

## 📌 Actions Précédentes (14 Août 2026 — Bannière au Sommet du Dashboard, Pleine Largeur Catégories, CA Pro en Bleu & Noms Sous-Catégories)

### 1. Positionnement de la Bannière Mode Invité ([DashboardView.tsx](file:///Users/fahdrahali/Downloads/Operation/src/components/dashboard/DashboardView.tsx), [BusinessDashboardView.tsx](file:///Users/fahdrahali/Downloads/Operation/src/components/business_dashboard/BusinessDashboardView.tsx)) :
- La bannière `GuestWarningBanner` est désormais placée **tout en haut de la page, directement sous le menu de navigation**, avant le titre et les boutons d'action du Dashboard.

### 2. Aération de la Création de Catégorie & Fournisseur au Dessous ([OrderDialog.tsx](file:///Users/fahdrahali/Downloads/Operation/src/components/business_orders/OrderDialog.tsx)) :
- La section `Catégorie Principale / Sous-catégorie` occupe maintenant toute la largeur disponible pour que les champs de saisie et les boutons *Créer / Annuler* ne soient plus étouffés.
- Le champ `Fournisseur (Optionnel)` est positionné sur sa propre rangée directement en dessous.

### 3. Chiffre d'Affaires Pro en Bleu si Positif ([BusinessDashboardView.tsx](file:///Users/fahdrahali/Downloads/Operation/src/components/business_dashboard/BusinessDashboardView.tsx)) :
- Le KPI *Chiffre d'Affaires* du Dashboard Pro est désormais affiché en **bleu vif** (`text-blue-600 dark:text-blue-400`) lorsqu'il est supérieur à 0, pour une harmonie parfaite avec la vue Perso.

### 4. Résolution de l'Affichage des Noms de Sous-Catégories ([CategorySelector.tsx](file:///Users/fahdrahali/Downloads/Operation/src/components/ui/CategorySelector.tsx)) :
- Résolution du problème d'affichage des identifiants bruts (ex: `1786715235859-np1nsh8`) : le composant mappe explicitement le nom réel de la catégorie et sous-catégorie sélectionnée dans le `SelectValue`.
- Ajout du bouton d'action rapide `+ Nouvelle sous-catégorie` dans le sélecteur.

### 5. Correction du Crash sur la Page Fournisseurs ([BusinessSuppliersView.tsx](file:///Users/fahdrahali/Downloads/Operation/src/components/business_suppliers/BusinessSuppliersView.tsx)) :
- **Cause :** Tentative de lecture `order.items.forEach` sur des commandes anciennes ou simplifiées ne contenant pas de tableau `items`.
- **Correction :** Sécurisation complète du calcul des statistiques fournisseurs (`getSupplierStats`) avec rétrocompatibilité multi-articles/article unique et formatage monétaire certifié sans float via `fromCents` / `formatCurrency`.

---

## 📌 Actions Précédentes (14 Août 2026 — Bannière PayPal Dashboard Perso, Simplification Split UI, Toaster Large Mode Invité & Solde Positif en Bleu)

## 📌 Actions Précédentes (14 Août 2026 — Correction Dropdowns z-index, Alignement UI Ventes, Zero NaN & Sync Bénéfices Pro-Perso)

## 📌 Actions Précédentes (14 Août 2026 — Zero-Float Cents, Résolution NaN, Refonte Ajout Produit & Sync Profit Pro-Perso)

## 📌 Actions Précédentes (13 Août 2026 — Menus Déroulants Opaques, Spacing & Simplification « Être payé »)

### 1. Correction Transparence Dropdowns & Spacing :
- **Fonds opaques garantis** : Mise à jour de `DropdownMenuContent`, `Select.tsx` et `globals.css` pour forcer un fond opaque (`bg-white` / `dark:bg-zinc-900`) et des ombres nettes sur l'ensemble des menus déroulants et balises `<select>` / `<option>`.
- **Harmonisation des espacements** : Réalignement des champs de formulaire dans `OrderDialog.tsx` avec hauteur uniforme (`h-11`) et espacement fluide sans chevauchement.

### 2. Simplification de l'Action « Être payé » :
- **Libellé direct** : Remplacement du titre avec slash *"Avance perçue / Montant payé"* par **"Avance perçue"**.
- **Action « Être payé »** : Remplacement de l'option *"Tout payer"* par **"Être payé"** dans le sélecteur d'action rapide des ventes.
- **Menu déroulant des lignes de vente** : Ajout direct de l'action **"Être payé"** dans le menu contextuel (`...`) de chaque vente non soldée.

### 3. Validation Méthodologique & Build :
- Build Next.js validé (`npm run build`), 0 erreur ESLint (`npm run lint`), et création du walkthrough ([walkthrough.md](file:///Users/fahdrahali/.gemini/antigravity/brain/f4570b5d-59a5-4108-ab6d-1805d14082bb/walkthrough.md)).

---

## 📌 Actions Précédentes (13 Août 2026 — Ergonomie Profil, i18n FR/EN, PayPal & Footer Fixe)

### 1. Refonte Ergonomique & Dropdowns Unifiés :
- **Fermeture Automatique des Dropdowns** : Implémentation de la fermeture automatique mutuelle et détection *Click Outside* sur le menu Profil et les sous-menus.
- **Profil Unifié** : Regroupement de la gestion des **Paramètres**, du **Thème (Clair ☀️ / Sombre 🌙 / Système 💻)**, de la **Langue (FR / EN)**, et de l'**Authentification** dans le menu déroulant unique de l'avatar du Profil.
- **Feedback dans le Footer** : Déplacement de l'action Feedback du Header vers le **Footer fixe**, sous forme de bouton épuré placé directement à côté du soutien PayPal.

### 2. Intégration PayPal Direct & Footer Fixe :
- **Bouton & Carte Support PayPal** : Remplacement de Buy Me a Coffee par un lien direct **PayPal** (`https://www.paypal.com/paypalme/moslihayoub`) intégrant l'icône Café ☕ et le logo SVG officiel PayPal (`#003087` / `#0070BA`).
- **Footer Fixe** : Fixé en bas d'écran (`fixed bottom-0 z-30`) avec attribution de créateur cliquable `Moslih84` (`https://moslih84.vercel.app/`) et copyright © 2026 Fluxo.

### 3. Internationalisation Bilingue Intégrale (FR/EN) :
- Extension du dictionnaire `src/lib/i18n.ts` pour couvrir 100% des interfaces Pro (Ventes, Clients, Produits, Frais, Dashboard, KPIs) et des composants partagés.

### 4. Validation Qualité, Méthodologie & Tests E2E :
- **Règle d'Alerte de Contexte** : Ajout dans la méthodologie (`.agents/skills/methodology/SKILL.md`) de la consigne d'information proactive à l'utilisateur pour ouvrir une nouvelle conversation dès qu'une série de tâches est accomplie ou que la conversation s'allonge.
- **0 erreur ESLint** et **4/4 (100%) tests Playwright E2E réussis** (11.8s).

---

## 📌 Intégration GitHub Spec-Kit & UXSpot MCP (13 Août 2026)

### Amélioration de la Méthodologie du Projet (`.agents/skills/methodology/SKILL.md`) :
1. **GitHub Spec-Kit (Spec-Driven Development)** :
   - Intégration du cycle de vie à 6 phases (`constitution` → `specify` → `clarify` / `plan` → `tasks` → `implement` → `converge`).
   - Configuration du CLI `specify` (installable via `uv tool install specify-cli --from git+https://github.com/github/spec-kit.git`).
   - Standardisation du dossier `.spec/` pour figer le contrat de chaque nouvelle fonctionnalité avant écriture du code.

2. **Audits UXSpot MCP & Accessibilité** :
   - Alignement de la terminologie financière (Encaissements, Décaissements, Catégories, Clôture mensuelle) via `search_glossary` et `define_term`.
   - Validation systématique des zones tactiles mobiles (44x44px min) et checklists UX via `get_checklist`.
   - Détection des défauts de contraste et WCAG avec `spot_check`.

3. **Convergence E2E & Performance (Chrome DevTools MCP)** :
   - Connexion de la phase `converge` avec l'émulation mobile/desktop, les parcours utilisateur automatisés et l'audit Lighthouse (CWV: LCP, INP).

---

## 📌 Actions Précédentes (11 Août 2026 — Session Audit & Corrections)

### Audit Général effectué :
- Analyse complète de l'architecture, sécurité, performance, tests E2E et qualité de code.
- Rapport d'audit généré dans l'espace de travail agent.

### Corrections Critiques appliquées :
1. **`types/index.ts`** — `ActiveView` étendu avec les 10 vues (business_clients, business_products, business_orders, business_fees, business_settings, new_sale).
2. **`src/app/page.tsx`** — Migration vers `next/dynamic` pour les 11 vues : bundle `/` réduit de **653 KB → 280 KB (-57%)**.
3. **`e2e/mockFirestore.ts`** — Correction `businessProfileType: 'entreprise'` → `'company'` + export `businessStore` pour les specs Pro.
4. **`playwright.config.ts`** — `webServer` décommenté avec `timeout: 120s`.
5. **`e2e/personnel.spec.ts`** — Refonte complète des sélecteurs (button au lieu de link, data-testid, timeouts explicites).
6. **`e2e/pro-entreprise.spec.ts`** — Correction sélecteurs + texte de vérification final.

### Corrections Importantes appliquées :
7. **`src/app/layout.tsx`** — `metadataBase: new URL('https://fluxofinance.vercel.app')` ajouté.
8. **`src/components/ui/CategorySelector.tsx`** — `categories` wrappé dans `useMemo` pour stabiliser les deps des hooks (3 warnings ESLint éliminés).

- Implémentation du partage WhatsApp avec lien PDF généré dans `InvoiceDialog`.

---

## 📌 Dernières Actions (13 Août 2026)

### 1. Composant Shadcn UI `Select` 100% Natif Web (Suppression des Popups OS)
- **Création du composant Shadcn `Select`** (`src/components/ui/Select.tsx`) basé sur `@base-ui/react/select` avec `SelectTrigger`, `SelectValue`, `SelectContent`, `SelectItem`.
- **Remplacement systématique des balises `<select>`** dans toute l'application : `OrderDialog`, `BusinessSettingsView`, `DashboardView`, `MonthsView`, `OperationDialog`, `CategorySelector`.
- **Résultat :** Les menudéroulants n'ouvrent plus le sélecteur natif du système d'exploitation (macOS/iOS picker) mais un popover Web Shadcn UI 100% stylisé avec fond solide, ombres et coins arrondis.

### 2. Boutons d'Actions "CTA" Visibles dans les Tableaux (Capture 2)
- **Transformation de la colonne Actions** dans `BusinessOrdersView.tsx` et `OperationsView.tsx`.
- **Ancien comportement :** Le bouton `...` était masqué avec `opacity-0 group-hover:opacity-100`.
- **Nouveau comportement :** Bouton CTA Shadcn UI `Actions` (avec icône et libellé) **toujours visible** sur chaque ligne de tableau (sur desktop comme sur mobile).

### 3. Protection Anti-Page Blanche & ErrorBoundary
- **Hydration Protection (`useHydration`)** dans `src/app/page.tsx` pour empêcher le flash de rendu avant réhydratation du store.
- **Ajout d'un `ErrorBoundary`** global autour du routeur principal.

