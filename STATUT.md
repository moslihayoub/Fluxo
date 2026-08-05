# 📊 STATUT & HISTORIQUE DU PROJET — Fluxo (Charges & Encaissements)

**Date & Heure :** 5 Août 2026  
**Application :** Fluxo (Charges & Encaissements)  
**URL Live :** `https://fluxofinance.vercel.app/`  
**Environnement :** Next.js 14 (App Router), TypeScript, Tailwind CSS, Zustand, Firebase (Auth/Firestore), Recharts, Gemini 2.0 Flash, PWA.

---

## 📜 1. Historique & Évolution des Demandes

### Phase 1 : Scaffolding & Initialisation
- Scaffolding d'un projet Next.js 14 avec App Router et TypeScript dans `/Users/fahdrahali/Downloads/Operation`.
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
1. **Devise MAD :** Utilisation du Dirham marocain (`MAD`) avec formatage `fr-MA`.
2. **Gestionnaire de Catégories :** Liste des catégories, recherche, édition rétroactive, modale de suppression, et vue détaillée de l'historique par catégorie.
3. **Ordre & Simplification (Dialog Opération) :** Le libellé est auto-rempli. Ordre strict : Type → Catégorie → Montant → Notes.

### Phase 4 : Déploiement, Firebase & Expérience Mobile 📱 (Nouveau)
1. **Intégration Firebase :**
   - **Authentification (Google Auth) :** Connexion sécurisée (`signInWithPopup`).
   - **Firestore (Base de données) :** Sauvegarde cloud automatique des opérations, types et mois synchronisée avec le compte utilisateur (`users/{uid}/...`).
   - Mode "Invité" maintenu via `localStorage` si l'utilisateur ne souhaite pas se connecter.
2. **Refonte Mobile UX (Audit UXSpot) :**
   - Navigation mobile optimisée : Menu burger plein écran, et bottom navigation.
   - Listes fluides : Remplacement de l'effet "cartes dans une carte" par des listes épurées pour aérer l'interface.
   - Tiroirs d'actions (Bottom Sheet) : Les menus contextuels (`...`) sur mobile s'ouvrent proprement depuis le bas pour éviter d'être coupés.
   - Espacements et Typographie ajustés pour éviter tout "étouffement" du contenu.
   - Intégration de l'action `Détails` dans les listes mobiles.
3. **CI/CD Vercel :** Déploiement continu configuré via GitHub. Gestion sécurisée des erreurs d'initialisation SSG (`auth/invalid-api-key`) lors de la compilation sur Vercel.
4. **Multilingue (Préparation) :** Ajout des variables d'état `language` (FR/EN) dans Zustand pour gérer la localisation globale.

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
│   │   └── categories/                # CategoriesView
│   ├── store/
│   │   └── useStore.ts                # Store Zustand + Sync Firestore & LocalStorage
│   ├── types/
│   │   └── index.ts                   # Types (AppState, Operation, Month...)
│   └── lib/
│       ├── firebase.ts                # Init Firebase Client SDK (graceful SSG fallback)
│       └── utils.ts                   # Helpers MAD & formatage
```

---

## 🎯 4. État du Projet et Prochaines Étapes

| Éléments | Statut |
|---|---|
| Build Production Vercel | ✅ Succès |
| Authentification Firebase | ✅ Opérationnel (Domaine autorisé) |
| Sauvegarde Firestore | ✅ Opérationnel |
| Refonte Mobile | ✅ Terminée (Tiroirs fluides) |
| Localisation (Langues) | 🔄 En cours / À faire |
| Mode Système (Dark/Light) | ✅ Terminée |
