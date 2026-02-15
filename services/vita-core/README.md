# VITA Core Backend

Backend service pour la plateforme VITA - Monnaie universelle et gouvernance démocratique.

## Installation

### Prérequis

- Rust 1.75+ ([installer](https://rustup.rs/))
- PostgreSQL 16+ ([installer](https://www.postgresql.org/download/))

### Configuration de la base de données

```bash
# Créer la base de données
createdb vita

# Créer un utilisateur
psql postgres -c "CREATE USER vita_user WITH PASSWORD 'vita_password';"
psql postgres -c "GRANT ALL PRIVILEGES ON DATABASE vita TO vita_user;"
```

### Configuration du projet

```bash
# Copier le fichier d'environnement
cp .env.example .env

# Installer les dépendances et compiler
cargo build
```

## Développement

### Lancer le serveur

```bash
# Mode développement
cargo run

# Avec hot reload (installer cargo-watch d'abord)
cargo install cargo-watch
cargo watch -x run
```

Le serveur sera accessible sur `http://localhost:8080`

### Commandes utiles

```bash
# Tests
cargo test

# Linting
cargo clippy

# Formatage
cargo fmt

# Build optimisé
cargo build --release
```

## Structure du projet

```
src/
├── main.rs              # Point d'entrée
├── lib.rs               # Exports publics
├── error.rs             # Gestion des erreurs
├── config/              # Configuration (immuable + modifiable)
├── api/                 # Endpoints REST
├── identity/            # Vérification identité (ZK-proofs)
├── monetary/            # Gestion monétaire
├── transaction/         # Transactions
├── crypto/              # Cryptographie
├── audit/               # Journal immuable
├── statistics/          # Métriques
└── external/            # APIs externes
```

## API Endpoints

### Health
- `GET /health` - Health check

### Identity
- `POST /api/v1/identity/verify` - Vérifier une identité
- `GET /api/v1/identity/status/{user_id}` - Statut d'identité

### Monetary
- `GET /api/v1/monetary/balance/{user_id}` - Solde utilisateur
- `GET /api/v1/monetary/supply` - Masse monétaire
- `POST /api/v1/monetary/emission/daily` - Émission quotidienne

### Transactions
- `POST /api/v1/transactions/create` - Nouvelle transaction
- `GET /api/v1/transactions/{tx_id}` - Détail transaction
- `GET /api/v1/transactions/user/{user_id}` - Historique

### Configuration
- `GET /api/v1/config/parameters` - Tous les paramètres
- `GET /api/v1/config/immutable` - Paramètres immuables
- `PUT /api/v1/config/parameters` - Modifier (admin + vote)

### Statistics
- `GET /api/v1/statistics/dashboard` - Données dashboard
- `GET /api/v1/statistics/population` - Données population
- `GET /api/v1/statistics/metrics` - Métriques système

### Admin
- `GET /api/v1/admin/audit-log` - Journal d'audit
- `POST /api/v1/admin/emergency-stop` - Arrêt d'urgence

## Paramètres IMMUABLES

Ces paramètres sont constitutionnels et **ne peuvent JAMAIS être modifiés** :

- 1 personne = 1 Ѵ par jour
- Pas de rétroactivité
- Privacy des transactions garantie
- Une personne = un seul compte

Toute tentative de modification sera rejetée par le système.

## Documentation

Voir le dossier `/docs` à la racine du projet pour la documentation complète :
- `ARCHITECTURE.md` - Architecture technique
- `CLAUDE.md` - Guide de développement
- `ROADMAP.md` - Feuille de route

## Licence

À définir
