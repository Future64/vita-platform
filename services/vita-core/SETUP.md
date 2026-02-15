# Guide d'installation - VITA Backend

Ce guide te permettra de configurer et lancer le backend VITA en partant de zéro.

## Prérequis

### 1. Installer Rust

```bash
# macOS/Linux
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Ou visite https://rustup.rs/
```

Vérifie l'installation :
```bash
rustc --version
cargo --version
```

### 2. Installer PostgreSQL

**macOS** :
```bash
brew install postgresql@16
brew services start postgresql@16
```

**Linux (Ubuntu/Debian)** :
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

Vérifie l'installation :
```bash
psql --version
```

## Configuration de la base de données

### Étape 1 : Créer la base de données

**macOS** :
```bash
createdb vita
```

**Linux** :
```bash
sudo -u postgres createdb vita
```

Vérifie que la base existe :
```bash
psql vita -c "SELECT 'Base vita créée avec succès!' as status;"
```

### Étape 2 : Appliquer les migrations

```bash
cd services/vita-core
psql vita -f migrations/20250130000001_initial_schema.sql
```

Si tu as des erreurs de permissions sur Linux :
```bash
sudo -u postgres psql vita -f migrations/20250130000001_initial_schema.sql
```

### Étape 3 : Vérifier les tables

```bash
psql vita -c "\dt"
```

Tu devrais voir 9 tables : users, balances, transactions, emissions, config_parameters, audit_log, votes, vote_ballots.

## Compilation et lancement

### Étape 1 : Vérifier le fichier .env

Le fichier [.env](services/vita-core/.env) devrait déjà exister. Si ce n'est pas le cas, copie depuis `.env.example` :

```bash
cp .env.example .env
```

Vérifie que `DATABASE_URL` correspond à ta config :
- Par défaut : `postgres://localhost/vita`
- Avec utilisateur : `postgres://ton_user:ton_password@localhost/vita`

### Étape 2 : Compiler le projet

```bash
cd services/vita-core
cargo build
```

La première compilation peut prendre 5-10 minutes (téléchargement des dépendances).

### Étape 3 : Lancer le serveur

```bash
cargo run
```

Tu devrais voir :
```
🌱 VITA Core Backend starting...
📋 Configuration loaded successfully
🗄️  Database connection established
✅ Database migrations applied
🚀 Starting HTTP server at http://127.0.0.1:8080
```

## Tests

Ouvre un nouveau terminal et teste les endpoints :

### 1. Health check
```bash
curl http://localhost:8080/health
```

Résultat attendu :
```json
{"status":"ok","version":"0.1.0"}
```

### 2. Paramètres immuables
```bash
curl http://localhost:8080/api/v1/config/immutable
```

Résultat attendu :
```json
{
  "daily_emission_per_user": "1.0",
  "retroactivity_allowed": false,
  "max_accounts_per_person": 1,
  "transaction_privacy": true,
  "constitution_version": "1.0.0"
}
```

### 3. Tous les paramètres
```bash
curl http://localhost:8080/api/v1/config/parameters
```

### 4. Dashboard
```bash
curl http://localhost:8080/api/v1/statistics/dashboard
```

## Résolution de problèmes

### Erreur : "connection refused" PostgreSQL

PostgreSQL n'est pas lancé. Démarre-le :

**macOS** :
```bash
brew services start postgresql@16
```

**Linux** :
```bash
sudo systemctl start postgresql
```

### Erreur : "database does not exist"

La base de données n'a pas été créée :
```bash
createdb vita
```

### Erreur : "permission denied for database"

**Linux** - Donne les permissions :
```bash
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE vita TO $USER;"
```

### Erreur de compilation Rust

Nettoie et recompile :
```bash
cargo clean
cargo build
```

### Le port 8080 est déjà utilisé

Change le port dans `.env` :
```
SERVER_PORT=8081
```

Puis relance :
```bash
cargo run
```

## Développement

### Lancer avec auto-reload

Installe cargo-watch :
```bash
cargo install cargo-watch
```

Lance avec :
```bash
cargo watch -x run
```

Le serveur redémarrera automatiquement à chaque modification du code.

### Tests unitaires

```bash
cargo test
```

### Linting

```bash
cargo clippy
```

### Formatage

```bash
cargo fmt
```

## Prochaines étapes

Une fois le backend lancé, tu peux :

1. **Tester avec le frontend** :
   ```bash
   cd ../../apps/web
   npm run dev
   ```

2. **Implémenter les fonctionnalités manquantes** :
   - Émission quotidienne de VITA
   - Transactions entre utilisateurs
   - Vérification d'identité (ZK-proofs)
   - Système de vote (Agora)

3. **Consulter la documentation** :
   - [ARCHITECTURE.md](../../docs/ARCHITECTURE.md) - Architecture technique
   - [CLAUDE.md](../../CLAUDE.md) - Guide de développement
   - [DECISIONS.md](../../docs/DECISIONS.md) - Décisions prises

## Commandes de référence

```bash
# Créer la base
createdb vita

# Appliquer les migrations
psql vita -f migrations/20250130000001_initial_schema.sql

# Compiler
cargo build

# Lancer
cargo run

# Tests
cargo test

# Formatter
cargo fmt

# Linter
cargo clippy
```

---

**Besoin d'aide ?** Consulte le [README.md](README.md) ou ouvre une issue sur le projet.
