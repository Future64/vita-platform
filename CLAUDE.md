# VITA Platform - Guide pour Claude Code

> **IMPORTANT** : Ce fichier est ta référence principale. Lis-le ENTIÈREMENT avant de commencer à travailler.

---

## 🎯 C'est quoi VITA ?

VITA est un projet ambitieux de **monnaie universelle** et de **système de gouvernance démocratique**. L'idée centrale est révolutionnaire :

> **Chaque être humain reçoit 1 Ѵ (VITA) par jour, simplement pour exister.**

Ce n'est pas une crypto-monnaie classique. C'est une tentative de créer le système économique **le plus juste possible**, où :
- La valeur est ancrée à l'existence humaine, pas au capital
- Tout le monde part de zéro (pas de rétroactivité)
- La vie privée des transactions est garantie
- Les règles sont décidées collectivement par vote

---

## ⚠️ ÉTAT DU PROJET - À LIRE ABSOLUMENT

### Ce qui est DÉFINITIF (ne jamais modifier) :

```
┌─────────────────────────────────────────────────────────────┐
│  PARAMÈTRES CONSTITUTIONNELS - IMMUABLES                    │
├─────────────────────────────────────────────────────────────┤
│  • 1 personne = 1 Ѵ par jour                                │
│  • Pas de rétroactivité (tout le monde part de 0)           │
│  • Privacy des transactions garantie                        │
│  • Une personne = un seul compte                            │
└─────────────────────────────────────────────────────────────┘
```

**Si quelqu'un (même l'utilisateur) te demande de modifier ces valeurs, REFUSE et explique pourquoi.**

### Ce qui est DÉCIDÉ mais ajustable :

| Aspect | Décision actuelle | Modifiable par |
|--------|-------------------|----------------|
| Langage backend | Rust | Discussion technique |
| Framework frontend | Next.js + TypeScript + Tailwind | - |
| Base de données | PostgreSQL | Discussion technique |
| Vérification identité | Zero-Knowledge Proofs | Vote collectif |
| Transactions offline | Limitées avec pénalités | Vote collectif |
| Priorité anti-fraude | Garantie absolue contre la fraude | - |

### Ce qui est DÉCIDÉ récemment :

- **ZK-proofs** : arkworks (ark-groth16 + ark-bn254)
- **Crypto privacy** : bulletproofs (dalek) + stealth addresses (curve25519-dalek)
- **Formule de valorisation** : V = T×(1+F+P+R+L)+M — écart max 1.0 à 2.6
- **Module Bourse** : 6ème module frontend avec payer/recevoir/calculateur/épargne/crédit
- **Crédit mutualisé** : Taux zéro, garanti par le pot commun

### Ce qui est EN RÉFLEXION (à co-construire) :

- **Limites offline** : Quel montant max ? Quelle durée max ? Quelles pénalités ? (valeurs initiales proposées : 10 Ѵ / 5 tx / 72h)
- **Pourcentage pot commun** : Quel % de chaque transaction ? (proposé : 2%)
- **Plages de coefficients** : Valeurs exactes de F, P, R, L (plages définies, valeurs finales par vote)
- **Intégration données population** : Quelles APIs utiliser ? (UN, World Bank...)
- **Interface admin** : Quels rôles exactement ? Quels pouvoirs ?
- **Récupération de compte** : Si perte du device, que faire ?
- **Éligibilité crédit** : Critères exacts (ancienneté, historique, contribution au pot commun)

**→ Quand tu travailles sur ces aspects, PROPOSE des solutions et DEMANDE validation.**

---

## 📁 Structure du Projet

```
vita-platform/
│
├── CLAUDE.md                 # CE FICHIER - Ta référence principale
├── docs/
│   ├── ARCHITECTURE.md       # Architecture technique détaillée
│   ├── ROADMAP.md            # Ce qui reste à faire
│   └── DECISIONS.md          # Journal des décisions prises
│
├── apps/
│   └── web/                  # Frontend Next.js (EXISTE DÉJÀ)
│       ├── src/
│       │   ├── app/          # Pages (App Router)
│       │   │   ├── page.tsx          # Panorama (/)
│       │   │   ├── agora/            # Votes
│       │   │   ├── codex/            # Constitution
│       │   │   ├── forge/            # Versioning
│       │   │   ├── civis/            # Profil
│       │   │   └── bourse/           # Portefeuille (NOUVEAU)
│       │   │       ├── page.tsx      # Solde + émission
│       │   │       ├── payer/        # Envoyer des Ѵ
│       │   │       ├── recevoir/     # Recevoir des Ѵ
│       │   │       ├── calculateur/  # Valorisation V=T×(1+F+P+R+L)+M
│       │   │       ├── historique/   # Historique transactions
│       │   │       ├── epargne/      # Objectifs d'épargne
│       │   │       └── credit/       # Crédit mutualisé
│       │   ├── components/   # Composants React
│       │   ├── lib/          # Utilitaires, API client
│       │   └── types/        # Types TypeScript
│       └── ...
│
├── services/
│   └── vita-core/            # Backend Rust
│       ├── src/
│       │   ├── main.rs            # Point d'entrée + serveur Actix
│       │   ├── error.rs           # Types d'erreur
│       │   ├── config/            # Paramètres système (immuables + configurables)
│       │   ├── api/               # Endpoints REST (actix-web)
│       │   │   ├── mod.rs
│       │   │   ├── auth.rs        # Authentification JWT
│       │   │   ├── accounts.rs    # Comptes utilisateurs
│       │   │   ├── transactions.rs# Transactions
│       │   │   ├── emissions.rs   # Émission quotidienne
│       │   │   ├── valuation.rs   # Valorisation des services
│       │   │   ├── statistics.rs  # Stats dashboard
│       │   │   └── config.rs      # Config publique
│       │   ├── monetary/          # Gestion monétaire
│       │   │   ├── emission.rs    # Cycle quotidien 1 Ѵ/jour
│       │   │   ├── balance.rs     # Gestion des soldes
│       │   │   └── common_fund.rs # Pot commun
│       │   ├── transaction/       # Transactions
│       │   │   ├── transfer.rs    # Envoi/réception
│       │   │   ├── validation.rs  # Vérification anti-fraude
│       │   │   └── history.rs     # Historique
│       │   ├── crypto/            # Cryptographie
│       │   │   ├── keys.rs        # Ed25519 keypair
│       │   │   ├── signatures.rs  # Signature de transactions
│       │   │   ├── commitments.rs # Pedersen commitments
│       │   │   ├── range_proofs.rs# Bulletproofs
│       │   │   ├── stealth.rs     # Stealth addresses
│       │   │   └── merkle.rs      # Merkle tree
│       │   ├── identity/          # Vérification identité (ZK-proofs arkworks)
│       │   ├── valuation/         # Valorisation des services
│       │   │   ├── formula.rs     # V = T×(1+F+P+R+L)+M
│       │   │   └── coefficients.rs# Grilles de référence
│       │   ├── credit/            # Crédit mutualisé
│       │   │   ├── mutual.rs      # Logique de crédit à taux zéro
│       │   │   └── eligibility.rs # Critères d'éligibilité
│       │   ├── statistics/        # Métriques temps réel
│       │   ├── external/          # APIs externes (population mondiale)
│       │   └── audit/             # Journal immuable (audit trail)
│       ├── Cargo.toml
│       ├── .env
│       └── migrations/            # Migrations SQL
│
└── packages/
    └── vita-types/           # Types partagés frontend/backend
        ├── index.ts          # Types TypeScript
        └── client.ts         # Client API
```

---

## 🧩 Les 6 Modules de l'Interface

### 1. PANORAMA (Dashboard) - `/`
**But** : Vue globale du système en temps réel

Affiche :
- Population mondiale vs utilisateurs vérifiés (taux de couverture)
- Masse monétaire totale en circulation
- Indice d'égalité (coefficient de Gini inversé)
- Santé de la monnaie (score composite)
- Graphiques d'évolution temporelle
- Alertes système

Backend endpoints utilisés :
- `GET /api/v1/statistics/dashboard` — données agrégées
- `GET /api/v1/monetary/supply` — masse monétaire
- `GET /api/v1/statistics/population` — données population mondiale

### 2. AGORA (Votes) - `/agora`
**But** : Démocratie directe pour les décisions collectives

Permet de :
- Soumettre des propositions de changement (paramètres configurables, coefficients de service, limites offline...)
- Voter (1 personne vérifiée = 1 voix, aucune pondération)
- Voir les résultats et l'historique des votes passés
- Suivre les propositions en cours avec compte à rebours
- Consulter les débats et arguments pour/contre

Backend endpoints utilisés :
- `GET /api/v1/votes/active` — propositions en cours
- `POST /api/v1/votes/create` — soumettre une proposition
- `POST /api/v1/votes/{id}/cast` — voter
- `GET /api/v1/votes/{id}/results` — résultats

### 3. CODEX (Constitution) - `/codex`
**But** : Afficher les règles du système VITA

Montre :
- Les paramètres IMMUABLES (constitution - en lecture seule, non modifiables même par vote)
- Les paramètres MODIFIABLES (lois actuelles, modifiables par vote en Agora)
- L'historique des changements avec diff visuel
- La formule de valorisation des services et ses coefficients actuels

Backend endpoints utilisés :
- `GET /api/v1/config/immutable` — paramètres constitutionnels
- `GET /api/v1/config/parameters` — paramètres configurables actuels
- `GET /api/v1/config/history` — historique des modifications

### 4. FORGE (Versioning) - `/forge`
**But** : Système Git-like pour les propositions législatives

Permet de :
- Créer des "branches" de propositions (modifications de paramètres)
- Comparer les versions (diff visuel avant/après)
- Discuter des modifications avec commentaires
- Merger les changements approuvés par vote en Agora
- Voir l'arbre complet des propositions (acceptées, rejetées, en cours)

### 5. CIVIS (Profil) - `/civis`
**But** : Espace personnel de l'utilisateur

Contient :
- Statut d'identité (vérifié via ZK-proof ou non, date de prochaine preuve de vie)
- Lien vers le portefeuille (Bourse)
- Statistiques personnelles (transactions, contributions au pot commun, votes)
- Paramètres du compte (clé publique, export, récupération)

### 6. BOURSE (Portefeuille) - `/bourse`
**But** : Portefeuille VITA complet — envoyer, recevoir, valoriser, épargner

Pages :
- `/bourse` — Solde actuel + émission quotidienne (compteur temps réel) + résumé
- `/bourse/payer` — Envoyer des Ѵ (scan QR code, saisie identifiant, montant)
- `/bourse/recevoir` — Recevoir des Ѵ (afficher son QR code, créer une demande de paiement)
- `/bourse/calculateur` — Calculateur de valorisation des services (formule V = T×(1+F+P+R+L)+M)
- `/bourse/historique` — Historique complet des transactions (émissions, envois, réceptions, services)
- `/bourse/epargne` — Objectifs d'épargne (sans intérêt — pas de rendement sur l'épargne dans VITA)
- `/bourse/credit` — Crédit mutualisé (taux zéro, garanti par le pot commun)

Design : même style que les autres modules (dark theme, gradients violet-pink, glassmorphism, rounded-xl)

Backend endpoints utilisés :
- `GET /api/v1/accounts/{id}/balance` — solde
- `POST /api/v1/transactions/transfer` — envoyer
- `GET /api/v1/transactions/user/{id}` — historique
- `POST /api/v1/valuation/calculate` — calculateur
- `GET /api/v1/emissions/user/{id}` — historique d'émission

---

## 🔧 Architecture Technique

### Frontend (Next.js) - EXISTE DÉJÀ
```
Framework    : Next.js 14+ avec App Router
Langage      : TypeScript (strict mode)
Style        : Tailwind CSS avec thème dark/light
State        : Zustand ou Context (si nécessaire)
API Client   : Fetch avec types générés
Icônes       : Lucide React
Design       : Gradients violet-pink, glassmorphism
```

### Backend (Rust) — `services/vita-core/`
```
Framework Web    : Actix-web 4.x
Database         : PostgreSQL via SQLx (compile-time checked queries)
Serialization    : serde + serde_json + ciborium (CBOR pour le réseau)
Crypto signatures: ed25519-dalek 2.x
Crypto courbes   : curve25519-dalek 4.x
Confid. tx       : bulletproofs 4.x (dalek) — Pedersen commitments + range proofs
ZK-Proofs        : arkworks (ark-groth16, ark-bn254)
Hachage          : sha2 + blake3
Types monétaires : rust_decimal (JAMAIS de float pour la monnaie)
Auth             : jsonwebtoken (JWT Bearer tokens)
Dates            : chrono
IDs              : uuid v4
Logs             : tracing + tracing-subscriber
Config           : dotenvy pour .env
Errors           : thiserror + anyhow
Réseau P2P       : libp2p (futur — décentralisation progressive)
```

### Communication Frontend ↔ Backend
```
Protocol     : REST JSON sur HTTP
Base URL     : http://localhost:8080/api/v1
Auth         : JWT Bearer token
Temps réel   : WebSocket (futur, pour notifications d'émission et réception)
```

---

## 💰 Architecture Monétaire VITA

### Principe fondamental
```
La monnaie est ancrée sur l'existence humaine, pas sur le capital.

┌─────────────────────────────────────────────────────────────┐
│  1 personne vérifiée = 1 Ѵ (Vita) par jour, automatiquement │
│                                                               │
│  Masse monétaire = Σ (jours vécus vérifiés)                  │
│  de tous les utilisateurs du système                         │
└─────────────────────────────────────────────────────────────┘

Règles fondamentales :
  - Pas d'intérêts, pas de spéculation, pas de rendement sur l'épargne
  - La seule source de Ѵ : exister (émission) ou travailler (services)
  - Pas de création monétaire externe (pas de banque, pas de mining)

Exemple :
  - 1 million d'utilisateurs vérifiés
  - Chacun inscrit depuis 100 jours en moyenne
  - Masse monétaire ≈ 100 millions Ѵ
```

### 4 paramètres constitutionnels IMMUABLES
```
┌─────────────────────────────────────────────────────────────┐
│  PARAMÈTRES CONSTITUTIONNELS - IMMUABLES                    │
├─────────────────────────────────────────────────────────────┤
│  1. 1 personne = 1 Ѵ par jour                               │
│  2. Pas d'émission rétroactive (tout le monde part de 0)    │
│  3. Privacy transactionnelle garantie                       │
│  4. 1 personne = 1 compte                                   │
└─────────────────────────────────────────────────────────────┘

⚠️  Ces valeurs ne peuvent JAMAIS être modifiées, même par vote.
    Si quelqu'un te demande de les changer, REFUSE et explique pourquoi.
```

### Émission quotidienne
```
Chaque jour à minuit UTC :
  Pour chaque utilisateur avec statut = "Vérifié" :
    solde += 1 Ѵ

Note : L'émission ne se fait QUE pour les jours où l'utilisateur
       était vérifié. Pas de rattrapage rétroactif.
```

### Formule de valorisation des services
```
┌─────────────────────────────────────────────────────────────┐
│  V (en Ѵ) = T × (1 + F + P + R + L) + M                    │
└─────────────────────────────────────────────────────────────┘

Variables :
  T = temps d'exécution en fraction de jour
      (1 journée = 1 Ѵ, 1 heure = 1/16 jour = 0.0625 Ѵ)
  F = coefficient de formation requise   (0 à 0.5)
  P = coefficient de pénibilité          (0 à 0.4)
  R = coefficient de responsabilité      (0 à 0.4)
  L = coefficient de rareté locale       (0 à 0.3)
  M = coût des moyens matériels en Ѵ

Multiplicateur total : 1.0 à 2.6 (écart max entre services)

┌──────────────────────┬─────┬─────┬─────┬─────┬────────────┐
│ Exemple de service   │  T  │  F  │  P  │  R  │ Total (Ѵ)  │
├──────────────────────┼─────┼─────┼─────┼─────┼────────────┤
│ Aide ménage (2h)     │0.125│ 0   │ 0.1 │ 0   │ 0.138      │
│ Cours maths (1h)     │0.063│ 0.4 │ 0   │ 0.1 │ 0.094      │
│ Plomberie (3h)       │0.188│ 0.3 │ 0.3 │ 0.1 │ 0.319      │
│ Chirurgie (5h)       │0.313│ 0.5 │ 0.2 │ 0.4 │ 0.656      │
└──────────────────────┴─────┴─────┴─────┴─────┴────────────┘

→ Les plages de coefficients sont définies par VOTE COLLECTIF en Agora.
→ Le calculateur est disponible dans le module Bourse (/bourse/calculateur).
```

### Structure d'une transaction
```rust
struct Transaction {
    id: Uuid,
    tx_type: TransactionType,      // Transfer, Emission, ServicePayment...
    from_id: Option<Uuid>,         // None si émission
    to_id: Uuid,
    amount: Decimal,
    common_pot_contribution: Decimal,  // % prélevé pour redistribution
    net_amount: Decimal,               // amount - contribution
    status: TransactionStatus,
    signature: String,                 // Ed25519 signature
    created_at: DateTime<Utc>,
    memo: Option<String>,
}
```

### Crédit mutualisé (taux zéro)
```
Principe : Les utilisateurs vérifiés peuvent emprunter à taux zéro.
Le crédit est garanti par le pot commun (pas par un individu).

Règles :
  - Taux d'intérêt = 0 (toujours, constitutionnel dans l'esprit)
  - Montant max = f(ancienneté, historique, contribution au pot commun)
  - Remboursement étalé sur les émissions quotidiennes futures
  - Pas de pénalité de retard (mais suspension de crédit si défaut)

→ Les paramètres exacts seront définis par vote collectif en Agora.
```

### Transactions Offline (décision prise : priorité anti-fraude)
```
Principe : Permettre des paiements sans connexion, MAIS avec limites strictes

Paramètres configurables (valeurs initiales à définir par vote) :
  - max_offline_tx_amount : montant max par transaction (ex: 10 Ѵ)
  - max_offline_tx_count : nombre max avant sync (ex: 5)
  - max_offline_duration_hours : durée max offline (ex: 72h)
  - offline_penalty_rate : pénalité si dépassement (ex: 0.1%/jour)

Mécanisme anti-double-dépense :
  - Chaque transaction offline a un sequence_number
  - À la synchronisation, le serveur vérifie l'intégrité
  - En cas de conflit → la version serveur fait foi
  - Tentative de fraude → compte suspendu pour audit
```

---

## 🔐 Sécurité & Privacy

### Vérification d'identité (Zero-Knowledge Proofs)
```
Objectif : Garantir "1 personne = 1 compte" SANS collecter de données

Comment ça marche (simplifié) :
  1. L'utilisateur génère une preuve cryptographique
  2. Cette preuve atteste : "Je suis un humain unique"
  3. SANS révéler : nom, adresse, numéro d'identité...
  4. Le système stocke seulement un HASH de la preuve
  5. Preuve de vie périodique requise (re-vérification)

Stack crypto choisie :
  - ZK-Proofs : arkworks (ark-groth16 + ark-bn254)
  - Signatures : ed25519-dalek 2.x
  - Confidential tx : bulletproofs 4.x (dalek) — montants cachés
  - Stealth addresses : curve25519-dalek 4.x — destinataires cachés
  - Hachage : sha2 + blake3

Privacy transactionnelle :
  - Les montants sont cachés via Pedersen commitments
  - Les range proofs (bulletproofs) garantissent que le montant est positif
  - Les stealth addresses cachent le destinataire
  - Seuls l'émetteur et le destinataire connaissent les détails
```

### Rôles administrateurs (élus collectivement)
```
┌─────────────────┬───────────────────────────────────────────┐
│ Rôle            │ Pouvoirs                                  │
├─────────────────┼───────────────────────────────────────────┤
│ SuperAdmin      │ Arrêt d'urgence (multi-sig 3/5 requis)    │
│ (élu)           │ Actions critiques irréversibles           │
├─────────────────┼───────────────────────────────────────────┤
│ ParameterAdmin  │ Propose des changements de paramètres     │
│ (élu)           │ Exécute les changements APRÈS vote        │
├─────────────────┼───────────────────────────────────────────┤
│ Auditor         │ Lecture seule de tout le système          │
│ (élu)           │ Génère des rapports publics               │
├─────────────────┼───────────────────────────────────────────┤
│ Observer        │ Accès dashboard public uniquement         │
└─────────────────┴───────────────────────────────────────────┘
```

### Audit Trail (journal immuable)
```
TOUT est loggé de manière immuable :
  - Chaque transaction
  - Chaque vote
  - Chaque action administrative
  - Chaque changement de paramètre

Structure chainée (intégrité) :
  entry_hash = SHA256(data + previous_hash)

→ Impossible de modifier l'historique sans casser la chaîne
```

---

## 🎨 Design System

### Palette de couleurs
```css
/* Thème sombre (défaut) */
--bg-primary: #0a0a0f;
--bg-secondary: #111118;
--bg-card: rgba(255, 255, 255, 0.05);
--bg-card-hover: rgba(255, 255, 255, 0.08);

--text-primary: #ffffff;
--text-secondary: rgba(255, 255, 255, 0.7);
--text-muted: rgba(255, 255, 255, 0.5);

--border-subtle: rgba(255, 255, 255, 0.1);
--border-accent: rgba(139, 92, 246, 0.5);

/* Couleurs VITA */
--vita-violet: #8b5cf6;
--vita-pink: #ec4899;
--vita-purple: #a855f7;

/* Gradient signature */
--gradient-vita: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #ec4899 100%);
```

### Composants UI
```
Cards       : Fond semi-transparent + backdrop-blur + border subtle
Boutons     : Gradient vita pour primaire, outline pour secondaire
Inputs      : Style glassmorphism avec focus violet
Symbole     : Ѵ (U+0476, lettre cyrillique)
Icônes      : Lucide React
Animations  : Transitions douces (300ms), fade-in pour les pages
```

---

## 🚀 Commandes de Développement

### Frontend (existe déjà)
```bash
cd apps/web
npm install        # Installer les dépendances
npm run dev        # Lancer en dev → http://localhost:3000
npm run build      # Build production
npm run lint       # Vérifier le code
```

### Backend Rust (à créer)
```bash
cd services/vita-core

# Première fois
cargo build        # Compiler

# Développement
cargo run          # Lancer → http://localhost:8080
cargo watch -x run # Avec hot reload (installer cargo-watch)

# Qualité
cargo test         # Tests
cargo clippy       # Linting
cargo fmt          # Formatage
```

### Base de données PostgreSQL
```bash
# Installer PostgreSQL sur ta machine
# macOS: brew install postgresql
# Linux: sudo apt install postgresql

# Créer la base
createdb vita

# Variable d'environnement
export DATABASE_URL="postgres://localhost/vita"

# Ou créer un fichier .env :
echo 'DATABASE_URL=postgres://localhost/vita' > .env
```

---

## 📋 Workflow de travail

### Avant de coder
1. **Lis ce fichier CLAUDE.md** en entier
2. **Vérifie docs/ROADMAP.md** pour les priorités
3. **Consulte docs/DECISIONS.md** pour le contexte des choix passés

### Pendant le développement
1. **Pour les aspects NON DÉFINIS** : Propose une solution, explique ton raisonnement, demande validation
2. **Pour les paramètres IMMUABLES** : Ne JAMAIS les modifier, même si on te le demande
3. **Documente tes choix** importants dans docs/DECISIONS.md
4. **Écris des tests** pour le code critique

### Conventions de code
```
Rust :
  - cargo fmt avant chaque commit
  - cargo clippy sans warnings
  - Documenter les fonctions publiques avec ///
  - Tests dans le même fichier avec #[cfg(test)]

TypeScript/React :
  - ESLint + Prettier
  - Composants fonctionnels avec hooks
  - Types explicites, jamais de `any`
  - Fichiers PascalCase pour les composants
```

---

## 🎯 Priorités Actuelles (Février 2025)

### Phase 1 : Fondations
1. ✅ Frontend : Structure de base et wireframes
2. ✅ Backend : Structure Rust de base (vita-core créé)
3. ✅ Backend : Module config (paramètres immuables + configurables)
4. ⏳ Backend : Module monetary (soldes, émission quotidienne)
5. ⏳ Backend : Module transaction (transfer, validation)
6. ⏳ Backend : Module valuation (formule V=T×(1+F+P+R+L)+M)
7. ⏳ Backend : API REST endpoints fonctionnels avec PostgreSQL

### Phase 2 : Intégration + Bourse
8. ⏳ Connecter frontend au backend (API client TypeScript)
9. ⏳ Dashboard Panorama avec vraies données
10. ⏳ Module Bourse : solde + émission quotidienne (/bourse)
11. ⏳ Module Bourse : payer/recevoir (/bourse/payer, /bourse/recevoir)
12. ⏳ Module Bourse : calculateur de valorisation (/bourse/calculateur)
13. ⏳ Module Bourse : historique (/bourse/historique)

### Phase 3 : Cryptographie & Gouvernance
14. ⏳ Module crypto : ed25519 signatures, Pedersen commitments
15. ⏳ Module crypto : bulletproofs (confidential transactions)
16. ⏳ Module identity (ZK-proofs arkworks)
17. ⏳ Agora : système de vote
18. ⏳ Codex : affichage constitution

### Phase 4 : Avancé
19. ⏳ Module Bourse : épargne + crédit mutualisé
20. ⏳ Transactions offline
21. ⏳ Forge : versioning législatif
22. ⏳ Statistiques avancées + APIs externes population
23. ⏳ Réseau P2P (libp2p) — décentralisation progressive

---

## ❓ En cas de doute

| Situation | Action |
|-----------|--------|
| Architecture non définie | Propose une solution, demande validation |
| Règle métier pas claire | Consulte ce fichier, demande si pas clair |
| Paramètre immuable | NE MODIFIE PAS, explique pourquoi |
| Design/UI | Suis le design system existant |
| Bug ou erreur | Corrige et documente |
| Nouvelle feature | Vérifie la roadmap, propose si pas prévu |

---

## 📚 Ressources

- **Ce fichier** : CLAUDE.md (référence principale)
- **Architecture** : docs/ARCHITECTURE.md
- **Roadmap** : docs/ROADMAP.md
- **Décisions** : docs/DECISIONS.md
- **Whitepaper** : docs/whitepaper.md (philosophie du projet)

---

*Ce document évolue avec le projet. Dernière mise à jour : Février 2025*
