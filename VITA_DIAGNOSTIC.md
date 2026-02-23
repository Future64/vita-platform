# VITA — Rapport de diagnostic frontend/backend

Genere le : 2026-02-23

---

## Resume

| Metrique | Valeur |
|----------|--------|
| Endpoints backend total | **64** (63 HTTP + 1 WebSocket) |
| Methodes API frontend total | **65** (api.ts) + **22** (vita-api.ts) |
| Connexions fonctionnelles | **12** (Codex titres/articles/amendments, Auth login/register/me/logout/refresh, Credit eligibility/request/loans, Health) |
| Connexions existantes mais non utilisees par les pages | **~50** (hooks et methodes API existent, pages utilisent les mocks) |
| Donnees encore mockees | **22 pages** sur 6 modules |
| Fichiers mock | **13** (~7 341 lignes) |
| Tables SQL (migrations) | **30** (13 migrations) |
| Background jobs | **2** (vote auto-closer + Merkle tree builder) |
| Daily VITA scheduler | **Absent** (emission pull-based via `POST /emissions/claim`) |

---

## Architecture API — Deux clients paralleles

Le frontend possede **deux clients API independants**, ce qui est une source de confusion :

| Client | Fichier | Base URL | Mock fallback | Utilise par |
|--------|---------|----------|---------------|-------------|
| `api` | `src/lib/api.ts` | `/api/v1` (hardcode) | Non (mais AuthContext fait le fallback) | AuthContext, hooks (useGovernance, useWallet, etc.) |
| `vita-api` | `src/lib/vita-api.ts` | `NEXT_PUBLIC_VITA_API_URL \|\| "/api/v1"` | Non | Codex pages, useVitaAccount, bourse/credit |

**Probleme** : `api.ts` ne lit pas `NEXT_PUBLIC_VITA_API_URL`. Les deux clients dupliquent des methodes (accounts, emissions, transactions, codex, credit).

---

## Etat par module

### :yellow_circle: Panorama (Dashboard)

**Statut : UI 100% — Backend 100% — Connexion 0%**

| Fonctionnalite | Frontend | Backend | Connecte ? |
|----------------|----------|---------|------------|
| Statistiques population | UI (`mockPanorama.ts`) | Pas d'endpoint agrege `/panorama/summary` | Non — a creer cote backend |
| Masse monetaire | UI (`PANORAMA_DATA`) | `GET /accounts` (balance individuelle) | Non — pas d'agregation |
| Indice d'egalite (Gini) | UI (`PANORAMA_DATA`) | Absent | Non — a creer |
| Activite en temps reel | UI (generateRandomActivity) | `GET /api/v1/ws` WebSocket | Non — WS existe mais page utilise mock |
| Votes actifs | UI (`ACTIVE_VOTES`) | `GET /governance/propositions` | Non — page importe mock |
| Sante du systeme | UI (`SYSTEM_HEALTH`) | `GET /audit/status` | Non — page importe mock |
| Sous-page economy | UI (`ECONOMY_DATA`) | Absent | Non |
| Sous-page citizens | UI (`CITIZENS_DATA`) | Absent | Non |
| Sous-page votes | UI (`VOTES_DATA`) | `GET /governance/propositions` | Non |

**Fichiers mock** : `mockPanorama.ts` (~500 lignes)
**Pages** : `panorama/page.tsx`, `panorama/economy/page.tsx`, `panorama/citizens/page.tsx`, `panorama/votes/page.tsx`

---

### :yellow_circle: Agora (Gouvernance)

**Statut : UI 95% — Backend 100% — Connexion 0%**

| Fonctionnalite | Frontend | Backend | Connecte ? |
|----------------|----------|---------|------------|
| Liste propositions | UI (`MOCK_PROPOSALS`) | `GET /governance/propositions` | Non — hook `useGovernance` existe mais page utilise mock |
| Detail proposition | UI (`getProposalById`) | `GET /governance/propositions/:id` | Non |
| Voter | UI (bouton) | `POST /governance/propositions/:id/vote` | Non — hook `api.voter()` existe |
| Creer proposition | UI (formulaire) | `POST /governance/propositions` | Non |
| Doleances | UI (page) | `GET/POST /governance/doleances` | Non |
| Soutenir doleance | UI (bouton) | `POST /governance/doleances/:id/soutenir` | Non |
| Convertir en proposition | UI | `POST /governance/doleances/:id/convertir` | Non |
| Fils de discussion | UI (threads) | `GET/POST /governance/propositions/:id/fils` | Non |
| Messages | UI | `GET/POST /governance/fils/:filId/messages` | Non |
| Reactions | UI | `POST /governance/messages/:msgId/reaction` | Non |
| Parametres systeme | UI (`mockParameters.ts`) | `GET /governance/parametres` | Non |
| Auto-cloture votes | — | `cron_close_votes` (background job actif) | Backend OK |

**Fichiers mock** : `mockProposals.ts` (~1 500 lignes), `mockParameters.ts` (~400 lignes)
**Pages** : `agora/page.tsx`, `agora/[id]/page.tsx`, `agora/proposals/page.tsx`, `agora/votes/page.tsx`, `agora/grievances/page.tsx`, `agora/archives/page.tsx`
**Hook existant mais inutilise** : `useGovernance.ts` (appelle `api.getPropositions()`, `api.voter()`, etc.)

---

### :green_circle: Codex (Constitution)

**Statut : UI 90% — Backend 100% — Connexion ~40%**

| Fonctionnalite | Frontend | Backend | Connecte ? |
|----------------|----------|---------|------------|
| Titres constitution | UI + `vita-api.getCodexTitles()` | `GET /codex/titles` | **Oui** |
| Articles | UI + `vita-api.getCodexArticle()` | `GET /codex/articles/:number` | **Oui** |
| Versions d'article | UI + `vita-api.getCodexArticleVersions()` | `GET /codex/articles/:number/versions` | **Oui** |
| Amendements | UI + `vita-api.getCodexAmendments()` | `GET /codex/amendments` | **Oui** |
| Creer amendement | UI + `vita-api.createCodexAmendment()` | `POST /codex/amendments` | **Oui** |
| Export JSON | URL generation | `GET /codex/export/json` | **Oui** |
| Export PDF | URL generation | `GET /codex/export/pdf` | **Oui** |
| Parametres systeme | UI (`mockParameters.ts`) | `GET /governance/parametres` | Non — page utilise mock |
| Docs techniques | UI (`mockCodex.ts`) | Absent | Non |
| Registre amendements | UI (`mockCodex.ts`) | `GET /codex/amendments` | Non — page utilise mock local |

**Fichiers mock** : `mockCodex.ts` (~800 lignes), `mockParameters.ts` (~400 lignes)
**Pages connectees** : `codex/page.tsx`, `codex/article/[number]/page.tsx`, `codex/amendement/nouveau/page.tsx`
**Pages encore mockees** : `codex/parametres-systeme/[id]/page.tsx`, `codex/technique/[slug]/page.tsx`, `codex/registre/page.tsx`

---

### :red_circle: Forge (Edition collaborative)

**Statut : UI 85% — Backend 0% — Connexion 0%**

| Fonctionnalite | Frontend | Backend | Connecte ? |
|----------------|----------|---------|------------|
| Liste projets | UI (`FORGE_PROJECTS`) | Absent | Non — pas d'endpoints Forge |
| Detail projet | UI | Absent | Non |
| Merge requests | UI (`FORGE_DEMANDES_INTEGRATION`) | Absent | Non |
| Branches | UI | Absent | Non |
| Contributeurs | UI (`getContributors`) | Absent | Non |
| Commits | UI | Absent | Non |

**Fichiers mock** : `mockForge.ts` (~300 lignes)
**Note** : Aucun endpoint backend pour Forge. Le module n'a aucun equivalent cote Rust. A considerer en Phase 3+ de la roadmap.

---

### :yellow_circle: Civis (Profil)

**Statut : UI 95% — Backend 100% — Connexion ~30%**

| Fonctionnalite | Frontend | Backend | Connecte ? |
|----------------|----------|---------|------------|
| Auth login/register | AuthContext | `POST /auth/login`, `POST /auth/register` | **Oui** (avec fallback mock) |
| Profil utilisateur | AuthContext `getMe()` | `GET /auth/me` | **Oui** (avec fallback mock) |
| Modifier profil | AuthContext `updateProfile()` | `PUT /auth/me` | **Oui** (avec fallback mock) |
| Changer mot de passe | `api.changePassword()` | `PUT /auth/me/password` | Methode existe, UI a verifier |
| Verification identite | VerificationContext (mock) | `POST /identity/verify`, `GET /identity/status/:id` | Non — contexte 100% mock |
| Demande verification | VerificationContext (mock) | `POST /identity/demande`, `GET /identity/demande` | Non — contexte 100% mock |
| Parrainages | VerificationContext (mock) | `POST /identity/parrainages/:id/attester` | Non — contexte 100% mock |
| Compteur parrainages | UI | `GET /identity/parrainages/compteur` | Non |
| Recherche parrains | UI | `GET /identity/parrains-potentiels` | Non |
| Historique activite | UI (`mockCivis.ts`) | Absent (partiel via audit) | Non |
| Achievements | UI (`mockCivis.ts`) | Absent | Non |

**Fichiers mock** : `mockUsers.ts` (~550 lignes), `mockCivis.ts` (~200 lignes), `mockVerification.ts` (~300 lignes)
**Contextes** :
- `AuthContext` : **Hybride** — essaie l'API reelle, fallback localStorage
- `VerificationContext` : **100% mock** — aucun appel API

---

### :yellow_circle: Bourse (Wallet & Transactions)

**Statut : UI 100% — Backend 100% — Connexion ~5%**

| Fonctionnalite | Frontend | Backend | Connecte ? |
|----------------|----------|---------|------------|
| Solde | UI (`MOCK_WALLET`) | `GET /accounts/:id` | Non — page utilise mock |
| Emission quotidienne | UI (compteur anime) | `POST /emissions/claim` | Non — page utilise mock |
| Historique emissions | UI | `GET /emissions/:accountId` | Non |
| Envoyer VITA | UI multi-step (`mockBourse.searchUsers`) | `POST /transactions/transfer` | Non — page utilise mock |
| Recevoir VITA | UI (QR code) | — | Non |
| Historique transactions | UI (`MOCK_WALLET.transactions`) | `GET /transactions/:accountId` | Non — page utilise mock |
| Calculateur valorisation | UI (`computeValuation`) | `POST /valuation/calculate` | Non — calcul local |
| Eligibilite credit | UI + `vita-api.getCreditEligibility()` | `GET /credit/eligibility/:accountId` | **Oui** |
| Demande credit | UI + `vita-api.requestCredit()` | `POST /credit/request` | **Oui** |
| Prets actifs | UI + `vita-api.getCreditLoans()` | `GET /credit/loans/:accountId` | **Oui** |
| Epargne | UI (local state) | Absent | Non |
| Transaction confidentielle | Absent | `POST /transactions/transfer-confidentiel` | Backend seul |
| Commitment verification | Absent | `GET/POST /transactions/:id/commitment` | Backend seul |

**Fichiers mock** : `mockBourse.ts` (~150 lignes)
**Pages** : `bourse/page.tsx`, `bourse/payer/page.tsx`, `bourse/recevoir/page.tsx`, `bourse/historique/page.tsx`, `bourse/calculateur/page.tsx`, `bourse/credit/page.tsx`, `bourse/epargne/page.tsx`

---

## Donnees encore mockees

### Fichiers mock et leurs consommateurs

| Fichier mock | Lignes | Consommateurs |
|-------------|--------|---------------|
| `src/lib/mockPanorama.ts` | ~500 | panorama/page, panorama/economy, panorama/citizens, panorama/votes |
| `src/lib/mockProposals.ts` | ~1 500 | agora/page, agora/[id], codex/parametres-systeme, administration/parametres |
| `src/lib/mockCodex.ts` | ~800 | codex/technique, codex/registre |
| `src/lib/mockParameters.ts` | ~400 | codex/parametres-systeme, administration/parametres |
| `src/lib/mockForge.ts` | ~300 | forge/page, forge/contributors |
| `src/lib/mockBourse.ts` | ~150 | bourse/page, bourse/payer, bourse/recevoir, bourse/historique, bourse/calculateur |
| `src/lib/mockUsers.ts` | ~550 | AuthContext (fallback), mockBourse, mockVerification |
| `src/lib/mockCivis.ts` | ~200 | civis/activity, civis/achievements |
| `src/lib/mockVerification.ts` | ~300 | VerificationContext |
| `src/lib/mockNotifications.ts` | ~200 | NotificationContext |
| `src/lib/mockVerificationNotifications.ts` | ~100 | NotificationContext |
| `src/lib/mockAdmin.ts` | ~200 | administration/page, administration/utilisateurs, administration/systeme |
| `src/lib/data/mock-regions.ts` | ~100 | WorldActivityMap |

---

## Endpoints backend sans UI

| Endpoint | Module | Description |
|----------|--------|-------------|
| `POST /transactions/transfer-confidentiel` | Transactions | Transfert confidentiel (Pedersen commitments) |
| `GET /transactions/:id/commitment` | Crypto | Recuperer un commitment |
| `POST /transactions/:id/verify-commitment` | Crypto | Verifier un commitment |
| `GET /transactions/:id/blinding-factor` | Crypto | Recuperer le blinding factor |
| `POST /accounts/:id/verify` | Comptes | Verifier un compte (admin) |
| `POST /emissions/batch` | Emissions | Emission batch (admin) |
| `GET /crypto/merkle/roots` | Crypto | Lister les racines Merkle |
| `GET /crypto/merkle/proof/:txId` | Crypto | Preuve Merkle d'une transaction |
| `POST /crypto/merkle/verify` | Crypto | Verifier un arbre Merkle |
| `GET /crypto/pubkey/:userId` | Crypto | Cle publique d'un utilisateur |
| `GET /crypto/verify-tx/:txId` | Crypto | Verifier signature d'une transaction |
| `POST /governance/cron/close-votes` | Gouvernance | Trigger manuel cloture votes |
| `POST /identity/cron/check-expirations` | Identite | Trigger manuel expiration verifications |
| `POST /identity/verify` | Identite | Verification via provider (FC/Signicat) |
| `GET /identity/parrainages/cooldown` | Identite | Statut cooldown parrainage |

---

## Appels frontend sans endpoint backend

| Methode frontend | Endpoint attendu | Statut backend |
|------------------|-----------------|----------------|
| Panorama dashboard | `GET /panorama/summary` (agrege) | **Absent** — pas d'endpoint d'agregation |
| Panorama economy | `GET /statistics/economy` | **Absent** |
| Panorama citizens | `GET /statistics/citizens` | **Absent** |
| Forge — tout le module | `GET /forge/*` | **Absent** — aucun endpoint Forge |
| Civis activity timeline | `GET /civis/activity` | **Absent** |
| Civis achievements | `GET /civis/achievements` | **Absent** |
| Bourse epargne | `GET /savings/*` | **Absent** |

---

## Plan d'implementation priorise

### Priorite 1 — Critique (bloque l'utilisation de base)

1. **Connecter VerificationContext au vrai backend**
   - Remplacer les imports mock par les appels `api.createDemandeVerification()`, `api.getDemandeActive()`, `api.getParrainagesRecus()`, `api.attester()`, etc.
   - Les endpoints backend existent TOUS (14 endpoints `/identity/*`)
   - Impact : Civis verification, parrainages, recherche parrains

2. **Connecter les pages Bourse au vrai backend**
   - `bourse/page.tsx` : remplacer `MOCK_WALLET` par `api.getAccount()` + `api.getEmissionHistory()`
   - `bourse/payer/page.tsx` : remplacer `searchUsers` par `api.searchParrains()` + `api.transfer()`
   - `bourse/historique/page.tsx` : remplacer mock par `api.getTransactions()`
   - `bourse/calculateur/page.tsx` : remplacer `computeValuation` par `api.calculateValuation()`
   - Les endpoints backend existent TOUS

3. **Connecter les pages Agora au vrai backend**
   - `agora/page.tsx` : remplacer `MOCK_PROPOSALS` par `api.getPropositions()`
   - `agora/[id]/page.tsx` : utiliser `api.getProposition()`, `api.voter()`, `api.getFils()`, `api.getMessages()`
   - Le hook `useGovernance` existe deja — il suffit de l'utiliser dans les pages
   - Les endpoints backend existent TOUS

### Priorite 2 — Important (fonctionnalites cles)

4. **Connecter les pages Panorama**
   - Creer un endpoint agrege backend `GET /panorama/summary` ou utiliser les endpoints existants individuellement
   - Remplacer `mockPanorama.ts` par des appels API reels
   - Connecter le WebSocket pour l'activite temps reel

5. **Connecter les sous-pages Codex restantes**
   - `codex/parametres-systeme/` : remplacer `mockParameters.ts` par `api.getParametres()`
   - `codex/registre/` : remplacer `mockCodex.ts` par `api.getAmendments()` existant
   - Les endpoints backend existent

6. **Unifier les deux clients API**
   - Fusionner `api.ts` et `vita-api.ts` en un seul client
   - Faire lire `NEXT_PUBLIC_VITA_API_URL` par le client unifie
   - Supprimer les methodes dupliquees

### Priorite 3 — Secondaire (ameliorations)

7. **Connecter les pages Civis restantes**
   - `civis/activity/` : necessiterait un endpoint agrege cote backend (absent)
   - `civis/achievements/` : necessiterait un endpoint cote backend (absent)

8. **Connecter NotificationContext au WebSocket**
   - Remplacer `mockNotifications.ts` par les notifications WebSocket reelles
   - Le `WebSocketContext` existe deja et gere les `ServerMessage`

9. **Module Forge — backend a creer**
   - Aucun endpoint backend n'existe pour Forge
   - Necessite : CRUD documents, branches, merge requests, diffs, approbation
   - A planifier dans la roadmap Phase 3+

10. **Creer les endpoints manquants**
    - `GET /panorama/summary` — agregation dashboard
    - `GET /statistics/economy` — metriques economiques
    - `GET /statistics/citizens` — metriques population
    - `GET /civis/activity` — timeline activite utilisateur

---

## Matrice de correspondance complete

```
Frontend Method (api.ts)              Backend Endpoint                    Utilise par une page ?
────────────────────────────────────  ──────────────────────────────────  ─────────────────────
api.register()                        POST /auth/register                 Oui (AuthContext)
api.login()                           POST /auth/login                    Oui (AuthContext)
api.logout()                          POST /auth/logout                   Oui (AuthContext)
api.getMe()                           GET  /auth/me                       Oui (AuthContext)
api.updateProfile()                   PUT  /auth/me                       Oui (AuthContext)
api.changePassword()                  PUT  /auth/me/password              Non (methode existe)
api.refreshToken()                    POST /auth/refresh                  Oui (intercepteur auto)
api.getPropositions()                 GET  /governance/propositions       Non (hook existe, page mock)
api.getProposition(id)                GET  /governance/propositions/:id   Non
api.createProposition()               POST /governance/propositions       Non
api.voter(id, choix)                  POST /governance/propositions/:id/vote  Non
api.passageVote(id)                   POST /governance/propositions/:id/passage-vote  Non
api.cloturerVote(id)                  POST /governance/propositions/:id/cloturer  Non
api.getResultats(id)                  GET  /governance/propositions/:id/resultats  Non
api.getFils(id)                       GET  /governance/propositions/:id/fils  Non
api.createFil(id)                     POST /governance/propositions/:id/fils  Non
api.getMessages(filId)                GET  /governance/fils/:filId/messages  Non
api.createMessage(filId)              POST /governance/fils/:filId/messages  Non
api.reagirMessage(msgId)              POST /governance/messages/:msgId/reaction  Non
api.getDoleances()                    GET  /governance/doleances          Non
api.getDoleance(id)                   GET  /governance/doleances/:id      Non
api.createDoleance()                  POST /governance/doleances          Non
api.soutenirDoleance(id)              POST /governance/doleances/:id/soutenir  Non
api.convertirDoleance(id)             POST /governance/doleances/:id/convertir  Non
api.getParametres()                   GET  /governance/parametres         Non
api.getParametre(nom)                 GET  /governance/parametres/:nom    Non
api.getHistoriqueParametre(nom)       GET  /governance/parametres/:nom/historique  Non
api.transfer()                        POST /transactions/transfer         Non (page mock)
api.getTransactions(accountId)        GET  /transactions/:accountId       Non (page mock)
api.claimEmission()                   POST /emissions/claim               Non (page mock)
api.getEmissionHistory(accountId)     GET  /emissions/:accountId          Non (page mock)
api.createAccount()                   POST /accounts                      Non
api.getAccount(id)                    GET  /accounts/:id                  Non
api.calculateValuation()              POST /valuation/calculate           Non (page mock)
api.createDemandeVerification()       POST /identity/demande              Non (contexte mock)
api.getDemandeActive()                GET  /identity/demande              Non (contexte mock)
api.annulerDemande()                  DELETE /identity/demande            Non (contexte mock)
api.inviterParrain()                  POST /identity/demande/inviter      Non (contexte mock)
api.relancerParrain(id)               POST /identity/demande/:id/relancer  Non (contexte mock)
api.getParrainagesRecus()             GET  /identity/parrainages          Non (contexte mock)
api.attester(id)                      POST /identity/parrainages/:id/attester  Non (contexte mock)
api.refuserParrainage(id)             POST /identity/parrainages/:id/refuser  Non (contexte mock)
api.getCompteurParrainages()          GET  /identity/parrainages/compteur  Non (contexte mock)
api.searchParrains(q)                 GET  /identity/parrains-potentiels  Non (contexte mock)
api.getHistoriqueVerifications()      GET  /identity/verifications        Non
api.getAuditLogs()                    GET  /audit/logs                    Non
api.getAuditLogDetail(id)             GET  /audit/logs/:id               Non
api.verifyAuditIntegrity()            POST /audit/verify                  Non
api.getAuditStatus()                  GET  /audit/status                  Non
api.exportAuditLogs()                 GET  /audit/export                  Non
api.getMerkleRoots()                  GET  /crypto/merkle/roots           Non
api.getMerkleProof(txId)              GET  /crypto/merkle/proof/:txId     Non
api.verifyMerkleTree()                POST /crypto/merkle/verify          Non
api.getPublicKey(userId)              GET  /crypto/pubkey/:userId         Non
api.verifyTransactionSignature(txId)  GET  /crypto/verify-tx/:txId       Non
api.getCodexTitles()                  GET  /codex/titles                  Oui (codex/page)
api.getCodexArticles()                GET  /codex/articles                Oui (codex/amendement)
api.getCodexArticle(number)           GET  /codex/articles/:number        Oui (codex/article)
api.getCodexArticleVersions(number)   GET  /codex/articles/:number/versions  Oui (codex/article)
api.createAmendment()                 POST /codex/amendments              Oui (codex/amendement)
api.getAmendments()                   GET  /codex/amendments              Oui (codex/page)
api.getCreditEligibility(accountId)   GET  /credit/eligibility/:accountId  Oui (bourse/credit)
api.requestCredit()                   POST /credit/request                Oui (bourse/credit)
api.getCreditLoans(accountId)         GET  /credit/loans/:accountId       Oui (bourse/credit)
api.health()                          GET  /health                        Oui (interne)
```

---

## Conclusion

Le projet VITA possede un **backend Rust complet et fonctionnel** (64 endpoints, 30 tables, 13 migrations, 2 background jobs) et un **frontend entierement construit** (6 modules, ~50 pages). Le probleme principal est que **la majorite des pages frontend utilisent des donnees mockees au lieu des vrais endpoints API**, alors que les methodes frontend (`api.ts`) et les hooks (`useGovernance`, `useWallet`, etc.) existent deja et pointent vers les bons endpoints.

**L'effort principal est de cablage** : remplacer les imports `mockXxx` par les appels `api.xxx()` dans les composants de page. Le backend n'a quasiment rien de manquant pour les fonctionnalites de base.
