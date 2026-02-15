# 🚀 MISSION : Setup complet du backend VITA

## Contexte

Je travaille sur le projet VITA, une monnaie universelle. Le frontend Next.js existe déjà dans `apps/web/`. J'ai installé Rust et PostgreSQL sur ma machine mais je ne sais pas comment tout configurer.

**J'ai besoin que tu fasses TOUT le setup pour moi :**
1. Créer la base de données PostgreSQL
2. Créer le backend Rust complet
3. Configurer la connexion entre les deux
4. Tester que tout fonctionne

---

## Ce que tu dois faire

### Étape 1 : Vérifier les prérequis

Vérifie que Rust et PostgreSQL sont bien installés :
```bash
rustc --version
cargo --version
psql --version
```

Si quelque chose manque, dis-le moi.

### Étape 2 : Créer et configurer la base de données PostgreSQL

1. Créer la base de données `vita` :
```bash
createdb vita
```

2. Si ça ne marche pas (problème de permissions), essaie :
```bash
# macOS
psql postgres -c "CREATE DATABASE vita;"

# Linux (peut nécessiter sudo)
sudo -u postgres createdb vita
```

3. Vérifie que la base existe :
```bash
psql vita -c "SELECT 'Base vita OK' as status;"
```

### Étape 3 : Créer la structure du backend Rust

Crée le dossier `services/vita-core/` avec cette structure :

```
services/vita-core/
├── Cargo.toml              # Dépendances Rust
├── .env                    # Variables d'environnement (connexion BDD)
├── src/
│   ├── main.rs             # Point d'entrée + serveur Actix
│   ├── lib.rs              # Exports des modules
│   ├── error.rs            # Gestion des erreurs
│   │
│   ├── config/
│   │   ├── mod.rs          # Configuration générale
│   │   └── database.rs     # Connexion PostgreSQL
│   │
│   ├── monetary/
│   │   └── mod.rs          # Gestion des soldes et émission
│   │
│   ├── transaction/
│   │   └── mod.rs          # Transactions
│   │
│   ├── statistics/
│   │   └── mod.rs          # Stats pour le dashboard
│   │
│   └── api/
│       ├── mod.rs          # Routes API
│       ├── health.rs       # GET /health
│       ├── monetary.rs     # Endpoints monétaires
│       ├── config.rs       # Endpoints config
│       └── statistics.rs   # Endpoints stats
│
└── migrations/
    └── 001_initial.sql     # Schéma initial de la BDD
```

### Étape 4 : Le fichier Cargo.toml

Crée `services/vita-core/Cargo.toml` avec ces dépendances :

```toml
[package]
name = "vita-core"
version = "0.1.0"
edition = "2021"

[dependencies]
# Web framework
actix-web = "4"
actix-rt = "2"
actix-cors = "0.7"

# Async runtime
tokio = { version = "1", features = ["full"] }

# Database
sqlx = { version = "0.7", features = ["runtime-tokio", "postgres", "chrono", "uuid", "rust_decimal"] }

# Serialization
serde = { version = "1", features = ["derive"] }
serde_json = "1"

# Types
uuid = { version = "1", features = ["v4", "serde"] }
chrono = { version = "0.4", features = ["serde"] }
rust_decimal = { version = "1", features = ["serde"] }

# Config
dotenvy = "0.15"

# Logging
tracing = "0.1"
tracing-subscriber = { version = "0.3", features = ["env-filter"] }

# Errors
thiserror = "1"
anyhow = "1"
```

### Étape 5 : Le fichier .env

Crée `services/vita-core/.env` :

```
DATABASE_URL=postgres://localhost/vita
HOST=127.0.0.1
PORT=8080
RUST_LOG=info,vita_core=debug
```

**Note** : Si tu es sur Linux et que PostgreSQL nécessite un utilisateur/mot de passe :
```
DATABASE_URL=postgres://ton_user:ton_password@localhost/vita
```

### Étape 6 : Créer les fichiers source Rust

#### main.rs
Le point d'entrée qui :
- Charge la config depuis .env
- Se connecte à PostgreSQL
- Lance le serveur Actix sur le port 8080
- Expose les routes API

#### config/mod.rs
Contient :
- Les paramètres IMMUABLES (ne jamais modifier ces valeurs !) :
  - `daily_emission_per_person = 1.0`
  - `retroactive_emission = false`
  - `transaction_privacy = true`
  - `one_person_one_account = true`
- Les paramètres configurables (avec valeurs par défaut)

#### monetary/mod.rs
Contient :
- Struct `Balance` (solde d'un utilisateur)
- Logique d'émission quotidienne
- Calcul de la masse monétaire

#### api/*.rs
Les endpoints REST :
- `GET /health` → statut du serveur
- `GET /api/v1/config/parameters` → tous les paramètres
- `GET /api/v1/config/immutable` → paramètres immuables
- `GET /api/v1/statistics/dashboard` → données pour Panorama
- `GET /api/v1/monetary/supply` → masse monétaire

### Étape 7 : Migration SQL initiale

Crée `services/vita-core/migrations/001_initial.sql` avec les tables :
- `users` (id, proof_hash, status, created_at, verified_at)
- `balances` (user_id, available, pending, total_received, total_sent)
- `transactions` (id, type, from_id, to_id, amount, status, created_at)
- `config_parameters` (version, parameters jsonb)
- `audit_log` (id, sequence, action, actor, details, hash)

### Étape 8 : Appliquer la migration

```bash
cd services/vita-core
psql vita -f migrations/001_initial.sql
```

### Étape 9 : Compiler et lancer

```bash
cd services/vita-core
cargo build
cargo run
```

### Étape 10 : Tester

```bash
# Dans un autre terminal
curl http://localhost:8080/health
curl http://localhost:8080/api/v1/config/parameters
curl http://localhost:8080/api/v1/statistics/dashboard
```

---

## Rappels importants

### Paramètres IMMUABLES - NE JAMAIS MODIFIER
```rust
// Ces valeurs sont constitutionnelles
pub const DAILY_EMISSION_PER_PERSON: Decimal = Decimal::ONE;  // 1 Ѵ
pub const RETROACTIVE_EMISSION: bool = false;
pub const TRANSACTION_PRIVACY: bool = true;
pub const ONE_PERSON_ONE_ACCOUNT: bool = true;
```

### Valeurs de retour pour le dashboard
Pour que le frontend Panorama fonctionne, le endpoint `/api/v1/statistics/dashboard` doit retourner :
```json
{
  "population": {
    "worldPopulation": 8100000000,
    "confidence": 0.97
  },
  "users": {
    "totalVerified": 0,
    "coverageRatio": 0.0,
    "new24h": 0,
    "active30d": 0
  },
  "monetary": {
    "totalSupply": "0",
    "gini": 0.0,
    "velocity": 0.0
  },
  "currencyHealth": {
    "overallScore": 100,
    "status": "Excellent"
  }
}
```

---

## En cas d'erreur

### "connection refused" pour PostgreSQL
```bash
# Vérifier que PostgreSQL tourne
# macOS
brew services list | grep postgresql
brew services start postgresql@16

# Linux
sudo systemctl status postgresql
sudo systemctl start postgresql
```

### "permission denied" pour createdb
```bash
# Linux - utiliser l'utilisateur postgres
sudo -u postgres createdb vita
sudo -u postgres psql vita -c "GRANT ALL ON DATABASE vita TO ton_user;"
```

### Erreur de compilation Rust
```bash
cargo clean
cargo build 2>&1 | head -50
# Montre-moi l'erreur
```

---

## Ce que j'attends de toi

1. ✅ Vérifie mes installations (Rust, PostgreSQL)
2. ✅ Crée la base de données `vita`
3. ✅ Crée TOUS les fichiers du backend Rust
4. ✅ Applique la migration SQL
5. ✅ Compile et lance le serveur
6. ✅ Teste les endpoints
7. ✅ Dis-moi quand c'est prêt et comment lancer le projet

**Fais tout ça étape par étape, en me montrant ce que tu fais et en vérifiant que chaque étape fonctionne avant de passer à la suivante.**
