# VITA Platform - Architecture Technique

> Document de référence pour l'architecture technique du projet VITA.

---

## Vue d'ensemble

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              UTILISATEURS                                │
│                         (Navigateur Web / PWA)                          │
└─────────────────────────────────┬───────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           FRONTEND (Next.js)                             │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐       │
│  │Panorama │  │  Agora  │  │  Codex  │  │  Forge  │  │  Civis  │       │
│  │Dashboard│  │  Votes  │  │  Lois   │  │ Version │  │ Profil  │       │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘  └─────────┘       │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                    API Client (TypeScript)                        │   │
│  │                    packages/vita-types/client.ts                  │   │
│  └──────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────┬───────────────────────────────────────┘
                                  │ HTTP/JSON
                                  │ REST API
                                  ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          BACKEND (Rust/Actix)                            │
│                         services/vita-core/                              │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                         API Layer (api/)                         │    │
│  │   /health  /identity  /monetary  /transactions  /config  /stats │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                  │                                       │
│  ┌───────────┬───────────┬───────────┬───────────┬───────────┐         │
│  │ identity/ │ monetary/ │transaction│  config/  │statistics/│         │
│  │ ZK-proofs │  Soldes   │  Paiements│ Paramètres│ Métriques │         │
│  └───────────┴───────────┴───────────┴───────────┴───────────┘         │
│                                  │                                       │
│  ┌───────────┬───────────┬───────────┐                                  │
│  │  crypto/  │  audit/   │ external/ │                                  │
│  │Signatures │  Logs     │ APIs pop. │                                  │
│  └───────────┴───────────┴───────────┘                                  │
└─────────────────────────────────┬───────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          BASE DE DONNÉES                                 │
│                           PostgreSQL                                     │
│                                                                          │
│   ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐      │
│   │ users   │  │balances │  │  txs    │  │ votes   │  │ audit   │      │
│   └─────────┘  └─────────┘  └─────────┘  └─────────┘  └─────────┘      │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Frontend (Next.js)

### Stack technique
```
Framework      : Next.js 14+ (App Router)
Langage        : TypeScript 5.x (strict mode)
Style          : Tailwind CSS 3.x
State          : React Context / Zustand (si complexe)
Fetch          : fetch natif + types générés
Icons          : Lucide React
Animations     : Tailwind transitions / Framer Motion (si besoin)
```

### Structure des fichiers
```
apps/web/
├── src/
│   ├── app/                      # App Router Next.js
│   │   ├── layout.tsx            # Layout principal
│   │   ├── page.tsx              # Page d'accueil (Panorama)
│   │   ├── agora/
│   │   │   └── page.tsx
│   │   ├── codex/
│   │   │   └── page.tsx
│   │   ├── forge/
│   │   │   └── page.tsx
│   │   ├── civis/
│   │   │   └── page.tsx
│   │   └── globals.css
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Header.tsx
│   │   │   └── Footer.tsx
│   │   ├── ui/                   # Composants génériques
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   └── ...
│   │   ├── panorama/             # Composants spécifiques
│   │   ├── agora/
│   │   ├── codex/
│   │   ├── forge/
│   │   └── civis/
│   │
│   ├── lib/
│   │   ├── api.ts                # Client API
│   │   ├── utils.ts              # Utilitaires
│   │   └── constants.ts          # Constantes
│   │
│   └── types/
│       └── index.ts              # Types (ou import depuis vita-types)
│
├── public/                       # Assets statiques
├── tailwind.config.ts
├── next.config.js
└── package.json
```

---

## Backend (Rust)

### Stack technique
```
Runtime        : Rust 1.75+ (stable)
Framework Web  : Actix-web 4.x
Database       : PostgreSQL 16 via SQLx
Serialization  : Serde + serde_json
Async          : Tokio runtime
Crypto         : ring, ed25519-dalek
Decimal        : rust_decimal (précision monétaire)
Logging        : tracing + tracing-subscriber
Config         : dotenvy (.env)
Errors         : thiserror + anyhow
Validation     : validator
HTTP Client    : reqwest (APIs externes)
```

### Structure des modules
```
services/vita-core/
├── src/
│   ├── main.rs                   # Point d'entrée, setup serveur
│   ├── lib.rs                    # Exports publics
│   │
│   ├── config/
│   │   ├── mod.rs                # Paramètres système
│   │   ├── parameters.rs         # Validation des paramètres
│   │   └── database.rs           # Configuration BDD
│   │
│   ├── identity/
│   │   ├── mod.rs                # Vérification d'identité
│   │   ├── zkp.rs                # Zero-knowledge proofs
│   │   └── verification.rs       # Logique de vérification
│   │
│   ├── monetary/
│   │   ├── mod.rs                # Gestion monétaire
│   │   ├── balance.rs            # Soldes utilisateurs
│   │   ├── emission.rs           # Émission quotidienne
│   │   └── redistribution.rs     # Pot commun
│   │
│   ├── transaction/
│   │   ├── mod.rs                # Transactions
│   │   ├── processor.rs          # Traitement
│   │   ├── offline.rs            # Mode offline
│   │   ├── validation.rs         # Validation anti-fraude
│   │   └── settlement.rs         # Règlement offline
│   │
│   ├── crypto/
│   │   ├── mod.rs                # Cryptographie
│   │   ├── keys.rs               # Gestion des clés
│   │   ├── signing.rs            # Signatures
│   │   └── hashing.rs            # Hachage
│   │
│   ├── external/
│   │   ├── mod.rs                # APIs externes
│   │   ├── population.rs         # Données population mondiale
│   │   └── aggregator.rs         # Consensus multi-sources
│   │
│   ├── statistics/
│   │   ├── mod.rs                # Statistiques
│   │   ├── collector.rs          # Collecte métriques
│   │   ├── dashboard.rs          # Données dashboard
│   │   └── health.rs             # Santé du système
│   │
│   ├── audit/
│   │   ├── mod.rs                # Audit trail
│   │   ├── logger.rs             # Journal immuable
│   │   └── merkle.rs             # Arbre de preuves
│   │
│   ├── api/
│   │   ├── mod.rs                # Routes API
│   │   ├── health.rs             # GET /health
│   │   ├── identity.rs           # /api/v1/identity/*
│   │   ├── monetary.rs           # /api/v1/monetary/*
│   │   ├── transaction.rs        # /api/v1/transactions/*
│   │   ├── config.rs             # /api/v1/config/*
│   │   ├── statistics.rs         # /api/v1/statistics/*
│   │   └── admin.rs              # /api/v1/admin/*
│   │
│   └── error.rs                  # Types d'erreur
│
├── migrations/                   # Migrations SQL
│   ├── 001_initial.sql
│   └── ...
│
├── Cargo.toml
└── .env.example
```

---

## API REST

### Endpoints principaux

```
Base URL: http://localhost:8080

Health
  GET  /health                           # Statut du serveur

Identity
  POST /api/v1/identity/verify           # Vérifier une identité (ZK)
  GET  /api/v1/identity/status/{user_id} # Statut d'une identité

Monetary
  GET  /api/v1/monetary/balance/{user_id}  # Solde utilisateur
  POST /api/v1/monetary/emission/daily     # Déclencher émission
  GET  /api/v1/monetary/supply             # Stats masse monétaire

Transactions
  POST /api/v1/transactions/create         # Nouvelle transaction
  GET  /api/v1/transactions/{tx_id}        # Détail transaction
  GET  /api/v1/transactions/user/{user_id} # Historique utilisateur

Configuration
  GET  /api/v1/config/parameters           # Tous les paramètres
  GET  /api/v1/config/immutable            # Paramètres immuables
  PUT  /api/v1/config/parameters           # Modifier (admin + vote)

Statistics
  GET  /api/v1/statistics/dashboard        # Données dashboard
  GET  /api/v1/statistics/population       # Données population
  GET  /api/v1/statistics/metrics          # Métriques système

Admin
  GET  /api/v1/admin/audit-log             # Journal d'audit
  POST /api/v1/admin/emergency-stop        # Arrêt d'urgence (multi-sig)
```

### Format des réponses

```json
// Succès
{
  "data": { ... },
  "timestamp": "2025-01-30T12:00:00Z"
}

// Erreur
{
  "error": "Description de l'erreur",
  "code": "ERROR_CODE"
}
```

---

## Base de données

### Schéma principal (PostgreSQL)

```sql
-- Utilisateurs
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proof_hash VARCHAR(255) NOT NULL UNIQUE,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    verified_at TIMESTAMPTZ,
    last_proof_of_life TIMESTAMPTZ
);

-- Soldes
CREATE TABLE balances (
    user_id UUID PRIMARY KEY REFERENCES users(id),
    available DECIMAL(20, 8) NOT NULL DEFAULT 0,
    pending DECIMAL(20, 8) NOT NULL DEFAULT 0,
    total_received DECIMAL(20, 8) NOT NULL DEFAULT 0,
    total_sent DECIMAL(20, 8) NOT NULL DEFAULT 0,
    last_emission TIMESTAMPTZ,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Transactions
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tx_type VARCHAR(50) NOT NULL,
    from_id UUID REFERENCES users(id),
    to_id UUID NOT NULL REFERENCES users(id),
    amount DECIMAL(20, 8) NOT NULL,
    common_pot_contribution DECIMAL(20, 8) NOT NULL DEFAULT 0,
    net_amount DECIMAL(20, 8) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    signature TEXT,
    memo TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    confirmed_at TIMESTAMPTZ
);

-- Émissions quotidiennes
CREATE TABLE emissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    amount DECIMAL(20, 8) NOT NULL,
    emission_date DATE NOT NULL,
    processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, emission_date)
);

-- Paramètres configurables
CREATE TABLE config_parameters (
    id SERIAL PRIMARY KEY,
    version INT NOT NULL,
    parameters JSONB NOT NULL,
    vote_id UUID,
    updated_by UUID,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Journal d'audit
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sequence BIGSERIAL NOT NULL,
    action_type VARCHAR(100) NOT NULL,
    actor_type VARCHAR(50) NOT NULL,
    actor_id UUID,
    target_type VARCHAR(50) NOT NULL,
    target_id UUID,
    details JSONB,
    previous_hash VARCHAR(64) NOT NULL,
    entry_hash VARCHAR(64) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index pour performance
CREATE INDEX idx_transactions_from ON transactions(from_id);
CREATE INDEX idx_transactions_to ON transactions(to_id);
CREATE INDEX idx_transactions_created ON transactions(created_at);
CREATE INDEX idx_audit_sequence ON audit_log(sequence);
CREATE INDEX idx_audit_created ON audit_log(created_at);
```

---

## Sécurité

### Couches de sécurité

```
1. TRANSPORT
   - HTTPS obligatoire en production
   - TLS 1.3 minimum

2. AUTHENTIFICATION
   - JWT Bearer tokens
   - Durée de vie courte (15min) + refresh token
   - Signatures Ed25519

3. AUTORISATION
   - RBAC (Role-Based Access Control)
   - Vérification à chaque requête
   - Principe du moindre privilège

4. DONNÉES
   - Chiffrement au repos (PostgreSQL)
   - Pas de stockage de données personnelles
   - Seulement des hashes de preuves ZK

5. AUDIT
   - Toute action loggée
   - Chaîne de hashes immuable
   - Impossible de modifier l'historique
```

### Protection anti-fraude

```
DOUBLE-DÉPENSE
  - Numéro de séquence par device
  - Vérification à la synchronisation
  - En cas de conflit → version serveur fait foi

FAUX COMPTES
  - ZK-proof pour unicité
  - Preuve de vie périodique
  - Suspension automatique si suspect

TRANSACTIONS FRAUDULEUSES
  - Limite par transaction
  - Limite quotidienne
  - Délai pour grosses sommes
```

---

## Performance

### Objectifs
```
Latence API     : < 100ms (p95)
Transactions/s  : > 1000 TPS
Disponibilité   : > 99.9%
```

### Optimisations prévues
```
- Cache Redis pour sessions et données fréquentes
- Index PostgreSQL optimisés
- Connection pooling (SQLx)
- Pagination de toutes les listes
- Compression gzip des réponses
```

---

## Évolutions futures

### Court terme
- WebSocket pour notifications temps réel
- PWA pour mobile
- Cache côté client

### Moyen terme
- Clustering PostgreSQL
- Load balancing
- CDN pour assets

### Long terme
- Fédération de serveurs
- Décentralisation progressive
- Intégration avec systèmes existants

---

*Document évolutif - Dernière mise à jour : Janvier 2025*
