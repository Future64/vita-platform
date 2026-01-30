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

### Ce qui est EN RÉFLEXION (à co-construire) :

- **Détails des ZK-proofs** : Quelle implémentation exacte ? Groth16, PLONK, autre ?
- **Limites offline** : Quel montant max ? Quelle durée max ? Quelles pénalités ?
- **Coefficients de service** : Comment valoriser les différents types de travail ?
- **Mécanisme de redistribution** : Quel % vers le pot commun ?
- **Intégration données population** : Quelles APIs utiliser ? (UN, World Bank...)
- **Interface admin** : Quels rôles exactement ? Quels pouvoirs ?
- **Récupération de compte** : Si perte du device, que faire ?

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
│       │   ├── components/   # Composants React
│       │   ├── lib/          # Utilitaires, API client
│       │   └── types/        # Types TypeScript
│       └── ...
│
├── services/
│   └── vita-core/            # Backend Rust (À CRÉER)
│       ├── src/
│       │   ├── main.rs       # Point d'entrée
│       │   ├── lib.rs        # Exports
│       │   ├── config/       # Paramètres système (immuables + configurables)
│       │   ├── identity/     # Vérification identité (ZK-proofs)
│       │   ├── monetary/     # Gestion monétaire (soldes, émission)
│       │   ├── transaction/  # Transactions (online + offline)
│       │   ├── crypto/       # Cryptographie (signatures, hashing)
│       │   ├── external/     # APIs externes (population mondiale)
│       │   ├── statistics/   # Métriques temps réel
│       │   ├── audit/        # Journal immuable (audit trail)
│       │   └── api/          # Endpoints REST
│       ├── Cargo.toml
│       └── migrations/       # Migrations SQL
│
└── packages/
    └── vita-types/           # Types partagés frontend/backend
        ├── index.ts          # Types TypeScript
        └── client.ts         # Client API
```

---

## 🧩 Les 5 Modules de l'Interface

### 1. PANORAMA (Dashboard) - `/`
**But** : Vue globale du système en temps réel

Affiche :
- Population mondiale vs utilisateurs vérifiés (taux de couverture)
- Masse monétaire totale en circulation
- Indice d'égalité (coefficient de Gini inversé)
- Santé de la monnaie (score composite)
- Graphiques d'évolution temporelle
- Alertes système

### 2. AGORA (Votes) - `/agora`
**But** : Démocratie directe pour les décisions collectives

Permet de :
- Soumettre des propositions de changement
- Voter (1 personne = 1 voix)
- Voir les résultats et l'historique
- Suivre les propositions en cours

### 3. CODEX (Constitution) - `/codex`
**But** : Afficher les règles du système VITA

Montre :
- Les paramètres IMMUABLES (constitution - en lecture seule)
- Les paramètres MODIFIABLES (lois actuelles)
- L'historique des changements avec diff

### 4. FORGE (Versioning) - `/forge`
**But** : Système Git-like pour les propositions législatives

Permet de :
- Créer des "branches" de propositions
- Comparer les versions (diff)
- Discuter des modifications
- Merger les changements approuvés par vote

### 5. CIVIS (Profil) - `/civis`
**But** : Espace personnel de l'utilisateur

Contient :
- Statut d'identité (vérifié via ZK-proof ou non)
- Portefeuille VITA (solde actuel, historique)
- Statistiques personnelles (transactions, contributions)
- Paramètres du compte

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

### Backend (Rust) - À CRÉER
```
Framework    : Actix-web 4.x
Database     : PostgreSQL via SQLx
Serialization: Serde JSON
Crypto       : ring, ed25519-dalek
ZK-Proofs    : bellman ou ark-* (à confirmer)
Logs         : tracing + tracing-subscriber
Config       : dotenvy pour .env
Errors       : thiserror + anyhow
Types        : rust_decimal pour la précision monétaire
```

### Communication Frontend ↔ Backend
```
Protocol     : REST JSON sur HTTP
Base URL     : http://localhost:8080/api/v1
Auth         : JWT Bearer token (à implémenter)
Temps réel   : WebSocket (futur, pour notifications)
```

---

## 💰 Le Système Monétaire

### Principe fondamental
```
┌─────────────────────────────────────────┐
│  Masse monétaire = Σ (jours vécus)      │
│  de tous les utilisateurs vérifiés      │
└─────────────────────────────────────────┘

Exemple :
  - 1 million d'utilisateurs vérifiés
  - Chacun inscrit depuis 100 jours en moyenne
  - Masse monétaire ≈ 100 millions Ѵ
```

### Émission quotidienne
```
Chaque jour à minuit UTC :
  Pour chaque utilisateur avec statut = "Vérifié" :
    solde += 1 Ѵ

Note : L'émission ne se fait QUE pour les jours où l'utilisateur
       était vérifié. Pas de rattrapage rétroactif.
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
    signature: String,
    created_at: DateTime<Utc>,
    memo: Option<String>,
}
```

### Valorisation des services (À DÉFINIR collectivement)
```
Valeur = Temps × Coefficient_Base × Modificateurs

Coefficients de base (exemples indicatifs) :
  ┌────────────────────────────┬─────────────┐
  │ Type de travail            │ Coefficient │
  ├────────────────────────────┼─────────────┤
  │ Travail standard           │ 1.0         │
  │ Travail qualifié           │ 1.2 - 1.5   │
  │ Travail pénible/dangereux  │ 1.3 - 1.8   │
  │ Expertise rare             │ 1.5 - 2.0   │
  │ Formation requise longue   │ 1.4 - 2.0   │
  └────────────────────────────┴─────────────┘

Modificateurs contextuels :
  - Urgence : ×1.1 à ×1.3
  - Nuit/Weekend : ×1.2
  - Conditions difficiles : ×1.1 à ×1.5
  - Responsabilité élevée : ×1.2

→ Ces valeurs seront définies par VOTE COLLECTIF dans l'Agora
```

### Transactions Offline (décision prise : priorité anti-fraude)
```
Principe : Permettre des paiements sans connexion, MAIS avec limites strictes

Paramètres configurables (valeurs initiales à définir) :
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

Technologies envisagées :
  - Groth16 (prouvé, performant)
  - PLONK (plus flexible)
  - À définir selon les besoins
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

## 🎯 Priorités Actuelles (Janvier 2025)

### Phase 1 : Fondations
1. ✅ Frontend : Structure de base et wireframes
2. ⏳ Backend : Créer la structure Rust de base
3. ⏳ Backend : Module config (paramètres immuables + configurables)
4. ⏳ Backend : Module monetary (soldes, émission)
5. ⏳ Backend : Module transaction (basique)
6. ⏳ Backend : API REST endpoints

### Phase 2 : Intégration
7. ⏳ Connecter frontend au backend
8. ⏳ Dashboard Panorama avec vraies données
9. ⏳ Page Civis avec portefeuille

### Phase 3 : Gouvernance
10. ⏳ Module identity (ZK-proofs - recherche)
11. ⏳ Agora : système de vote
12. ⏳ Codex : affichage constitution

### Phase 4 : Avancé
13. ⏳ Transactions offline
14. ⏳ Forge : versioning législatif
15. ⏳ Statistiques avancées
16. ⏳ APIs externes population mondiale

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

*Ce document évolue avec le projet. Dernière mise à jour : Janvier 2025*
