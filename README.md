# Charges & Encaissements

Application web de gestion financière — Next.js 14 + TypeScript + Tailwind CSS + Zustand + Recharts + Gemini AI + PWA

---

## 🚀 Démarrage rapide

```bash
# Installer les dépendances
npm install

# Démarrer en développement
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000)

---

## ⚙️ Configuration

Créez `.env.local` à la racine (déjà créé) :

```env
GEMINI_API_KEY=votre_clé_api_google_gemini
```

> **Note** : Obtenez votre clé sur [Google AI Studio](https://aistudio.google.com/app/apikey)

---

## 🏗️ Stack technique

| Composant | Technologie |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| UI | Tailwind CSS |
| State | Zustand (persist localStorage) |
| Charts | Recharts |
| AI | Google Gemini 2.0 Flash |
| PWA | manifest.json + Service Worker |

---

## 📱 Fonctionnalités

### Gestion des mois
- ✅ Créer des mois (Janvier–Décembre + Année)
- ✅ Validation doublon avec message d'erreur
- ✅ Archiver / Restaurer des mois
- ✅ Visualisation solde, encaissements, décaissements par carte

### Opérations
- ✅ Créer / Modifier / Supprimer des opérations
- ✅ Types : Encaissement / Décaissement
- ✅ Catégories d'opérations (combobox + création)
- ✅ Filtres : Tout / Entrées / Sorties
- ✅ Montants formatés fr-FR avec couleurs

### Import / Export
- ✅ Import CSV classique (FileReader côté client)
- ✅ Prévisualisation avec cases à cocher avant import
- ✅ Export CSV du mois actif
- ✅ Export CSV de tous les mois

### Agent AI (Gemini)
- ✅ Dialog Agent avec tabs Texte / Fichier
- ✅ Extraction automatique des opérations
- ✅ Prévisualisation + ajustement avant application
- ✅ Sélection du mois cible

### Dashboard
- ✅ 4 KPIs : Solde global, Encaissements, Décaissements, Nb opérations
- ✅ Graphique ligne : Encaissements vs Décaissements par mois
- ✅ Graphique barres : Montants par catégorie
- ✅ Tableau récapitulatif par mois

### Design & PWA
- ✅ Design noir & blanc SaaS premium
- ✅ Dark mode / Light mode toggle
- ✅ Barre de métriques fixe en bas
- ✅ Responsive mobile (grille adaptative)
- ✅ PWA installable (manifest + service worker)
- ✅ Persistance localStorage (données conservées)

---

## 📁 Structure

```
src/
├── app/
│   ├── api/finance-agent/route.ts  # API Gemini
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── layout/
│   │   ├── Header.tsx
│   │   └── MetricsBar.tsx
│   ├── months/
│   │   └── MonthsView.tsx
│   ├── operations/
│   │   ├── OperationsView.tsx
│   │   ├── OperationDialog.tsx
│   │   └── ImportDialog.tsx
│   ├── agent/
│   │   └── AgentDialog.tsx
│   ├── dashboard/
│   │   └── DashboardView.tsx
│   └── ThemeProvider.tsx
├── store/
│   └── useStore.ts                  # Zustand store
├── types/
│   └── index.ts                     # Types TypeScript
└── lib/
    └── utils.ts                     # Helpers
public/
├── manifest.json                    # PWA manifest
├── sw.js                            # Service worker
└── icons/                           # App icons
```

---

## 🔑 Notes sur la clé API

La clé Gemini est stockée dans `.env.local` (gitignore). Ne la committez jamais dans votre dépôt.

Pour régénérer votre clé si elle a été exposée : [Google AI Studio](https://aistudio.google.com/app/apikey)
