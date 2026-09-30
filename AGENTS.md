# 🤖 Workspace Configuration: Fluxo Finance & Stock (Operation)

Ce fichier `AGENTS.md` codifie le protocole de travail de l'agent Antigravity sur le projet **Fluxo**.

---

## 🎯 1. Règle d'Autonomie Jira (Projet `KAN`)
* **URL Jira** : `https://moslihayoub.atlassian.net` (Projet: `KAN`)
* **Tag obligatoire** : `[FLUXO]`
* Tout nouveau travail (feature, bug, refactor) doit être consigné sur un ticket Jira `KAN` avec le tag `[FLUXO]`.

---

## 🔄 2. Règle de Boucle Autonome (`/goal`)
Quand une tâche est lancée avec `/goal` :
1. Implémenter le code source (Next.js 14, Zustand, Supabase Realtime, Firebase).
2. Lancer la commande de vérification locale :
   ```bash
   npm run validate
   # ou
   npm run test:e2e
   ```
3. Si un test échoue : analyser l'erreur, corriger le code et relancer en boucle continue jusqu'à **100% de réussite**.
4. Mettre à jour `STATUS.md` et committer les changements.

---

## 📉 3. Règle d'Économie de Tokens
* Appliquer les règles d'Observation Masking définies dans `~/.gemini/config/skills/m84-unified-methodology/SKILL.md`.
* Ne jamais injecter de gros dumps de base de données dans le prompt.
