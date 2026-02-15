# Prompt court à coller dans Claude Code

Copie-colle ce texte directement dans Claude Code :

---

## VERSION COURTE (à coller)

```
Lis le fichier CLAUDE.md à la racine du projet pour comprendre le contexte.

J'ai Rust et PostgreSQL installés mais je ne sais pas comment configurer le projet.

Fais tout le setup du backend pour moi :

1. Crée la base de données PostgreSQL "vita" (avec createdb ou psql)

2. Crée le backend Rust dans services/vita-core/ avec :
   - Cargo.toml (actix-web, sqlx, serde, tokio, etc.)
   - .env (DATABASE_URL, HOST, PORT)
   - src/main.rs (serveur Actix)
   - src/config/mod.rs (paramètres immuables + configurables)
   - src/monetary/mod.rs (Balance, émission)
   - src/statistics/mod.rs (données dashboard)
   - src/api/ (endpoints REST)
   - migrations/001_initial.sql (tables users, balances, transactions)

3. Applique la migration SQL

4. Compile avec "cargo build"

5. Lance avec "cargo run" 

6. Teste avec curl http://localhost:8080/health

Fais ça étape par étape en vérifiant que chaque étape marche.

RAPPEL : Les paramètres immuables (1 Ѵ/jour, pas de rétroactivité, privacy, 1 personne = 1 compte) ne doivent JAMAIS être modifiables dans le code.
```

---

## VERSION ENCORE PLUS COURTE

```
Lis CLAUDE.md puis configure tout le backend Rust pour moi :
- Crée la base PostgreSQL "vita"
- Crée services/vita-core/ avec Actix-web, SQLx
- Migration SQL (tables users, balances, transactions)
- Endpoints : /health, /api/v1/config/parameters, /api/v1/statistics/dashboard
- Compile, lance, teste

Fais tout étape par étape. Dis-moi si tu as des questions.
```

---

## SI CLAUDE CODE DEMANDE DES PRÉCISIONS

Tu peux répondre :

**"Quel utilisateur PostgreSQL ?"**
→ "Utilise localhost sans authentification, ou essaie avec mon nom d'utilisateur système"

**"Quelles tables créer ?"**
→ "users, balances, transactions, config_parameters, audit_log - comme décrit dans docs/ARCHITECTURE.md"

**"Quels endpoints ?"**
→ "GET /health, GET /api/v1/config/parameters, GET /api/v1/config/immutable, GET /api/v1/statistics/dashboard, GET /api/v1/monetary/supply"

**"Valeurs de retour ?"**
→ "Des données mock pour l'instant, on connectera aux vraies données après"
