# PROMPT — Diagnostic complet VITA + implémentation des manquements
# À exécuter dans Claude Code à la racine du projet

## Mission

Tu vas analyser l'intégralité du projet VITA (frontend Next.js + backend Rust) pour :

1. **Cartographier** toutes les fonctionnalités frontend et backend existantes
2. **Identifier** les déconnexions : appels API frontend sans endpoint backend, endpoints backend sans UI, données mockées qui devraient être réelles
3. **Générer un rapport** structuré de l'état de connexion
4. **Implémenter** les connexions manquantes, dans l'ordre de priorité

---

## Phase 1 — Scan et cartographie

### 1A. Scanner le frontend

```bash
# Lister toutes les routes Next.js
find ./src/app -name "page.tsx" -o -name "route.ts" | sort

# Lister tous les appels API (fetch, axios, etc.)
grep -rn "fetch(" ./src --include="*.ts" --include="*.tsx" | grep -v "node_modules" | grep -v ".next"
grep -rn "api/" ./src --include="*.ts" --include="*.tsx" | grep -v "node_modules"

# Lister tous les composants qui utilisent des données
grep -rn "useState\|useEffect\|useSWR\|useQuery" ./src --include="*.tsx" | grep -v "node_modules"

# Repérer les données mockées
grep -rn "mock\|Mock\|MOCK\|dummy\|placeholder\|TODO\|FIXME\|hardcoded" ./src --include="*.ts" --include="*.tsx" | grep -v "node_modules"
```

### 1B. Scanner le backend Rust

```bash
# Lister tous les endpoints déclarés
grep -rn "#\[get\]\|#\[post\]\|#\[put\]\|#\[delete\]\|#\[patch\]" ./backend/src --include="*.rs"
grep -rn "web::get\|web::post\|web::put\|web::delete" ./backend/src --include="*.rs"

# Lister les routes configurées
grep -rn "configure\|service\|route" ./backend/src/main.rs ./backend/src/routes* 2>/dev/null

# Lister les modèles de données
grep -rn "struct.*Req\|struct.*Res\|struct.*Dto\|#\[derive" ./backend/src --include="*.rs" | head -60

# Lister les migrations SQL
find ./backend -name "*.sql" -o -name "*.down.sql" -o -name "*.up.sql" 2>/dev/null | sort
ls ./migrations 2>/dev/null || ls ./backend/migrations 2>/dev/null
```

### 1C. Analyser les 6 modules VITA

Pour chaque module, vérifier l'état de connexion :

**Modules frontend attendus :**
- `/panorama` — Dashboard principal (solde, activité récente)
- `/agora` — Vote et gouvernance démocratique
- `/codex` — Constitution VITA
- `/forge` — Édition collaborative (git-like)
- `/civis` — Profil utilisateur
- `/bourse` — Wallet et transactions

```bash
# Pour chaque module, lister les appels API réels vs mockés
for module in panorama agora codex forge civis bourse; do
  echo "=== Module: $module ==="
  find ./src -path "*$module*" -name "*.tsx" -o -path "*$module*" -name "*.ts" 2>/dev/null | head -10
  grep -rn "fetch\|mock\|TODO" ./src --include="*.tsx" --include="*.ts" | grep -i "$module" 2>/dev/null
done
```

---

## Phase 2 — Générer le rapport de diagnostic

Après le scan, créer le fichier `VITA_DIAGNOSTIC.md` à la racine avec ce format :

```markdown
# VITA — Rapport de diagnostic frontend/backend
Généré le : [DATE]

## Résumé
- Endpoints backend total : X
- Appels API frontend total : X
- Connexions fonctionnelles : X
- Connexions manquantes : X
- Données encore mockées : X

## État par module

### 🟢 / 🟡 / 🔴 Panorama (Dashboard)
| Fonctionnalité | Frontend | Backend | Connecté ? |
|---|---|---|---|
| Solde VITA | ✅ UI | ✅ GET /api/v1/wallet/balance | 🔴 Non connecté |
| Historique | ✅ UI | ❌ Manquant | 🔴 À créer |
| ... | | | |

### 🟢 / 🟡 / 🔴 Agora (Gouvernance)
...

### 🟢 / 🟡 / 🔴 Bourse (Wallet)
...

[etc. pour chaque module]

## Données encore mockées
- [ ] src/components/panorama/BalanceCard.tsx : ligne 23 — solde hardcodé à 42.5
- [ ] src/app/agora/page.tsx : ligne 67 — liste de votes factice
- ...

## Endpoints backend sans UI
- GET /api/v1/... → pas de page frontend qui l'utilise
- ...

## Appels frontend sans endpoint backend
- fetch('/api/v1/...') → endpoint inexistant côté Rust
- ...

## Plan d'implémentation priorisé
### Priorité 1 — Critique (bloque l'utilisation de base)
1. ...
### Priorité 2 — Important (fonctionnalités clés)
2. ...
### Priorité 3 — Secondaire
3. ...
```

---

## Phase 3 — Implémentation des manquements

Une fois le rapport généré, implémenter dans cet ordre :

### 3.1 — Authentification (priorité absolue)

Vérifier et compléter si nécessaire :

**Backend Rust** — endpoints attendus :
```
POST   /api/v1/auth/register          — Créer un compte
POST   /api/v1/auth/login             — Connexion JWT
POST   /api/v1/auth/refresh           — Rafraîchir le token
POST   /api/v1/auth/logout            — Révoquer le token
GET    /api/v1/auth/me                — Profil utilisateur courant
```

**Frontend** — vérifier que chaque appel pointe vers le bon endpoint :
```typescript
// src/lib/api/auth.ts — doit exister et être utilisé par tous les composants
export const authApi = {
  register: (data: RegisterDto) => fetch('/api/v1/auth/register', { method: 'POST', ... }),
  login: (data: LoginDto) => fetch('/api/v1/auth/login', { method: 'POST', ... }),
  me: () => fetch('/api/v1/auth/me', { headers: { Authorization: `Bearer ${getToken()}` } }),
}
```

---

### 3.2 — Module Bourse / Wallet (priorité haute)

**Backend Rust** — endpoints attendus :
```
GET    /api/v1/wallet/balance         — Solde actuel en Ѵ
GET    /api/v1/wallet/transactions    — Historique paginé
POST   /api/v1/wallet/transfer        — Envoyer des Ѵ
GET    /api/v1/wallet/address         — Adresse publique du wallet
POST   /api/v1/wallet/verify-address  — Vérifier une adresse destinataire
```

Si un endpoint manque côté Rust, créer dans `backend/src/handlers/wallet.rs` :

```rust
use actix_web::{web, HttpResponse, Result};
use crate::models::wallet::{WalletBalance, Transaction, TransferRequest};
use crate::middleware::auth::AuthUser;
use crate::db::Pool;

// GET /api/v1/wallet/balance
pub async fn get_balance(
    auth: AuthUser,
    pool: web::Data<Pool>,
) -> Result<HttpResponse> {
    let balance = sqlx::query_as!(
        WalletBalance,
        "SELECT balance, pending_balance, last_updated 
         FROM wallets WHERE account_id = $1",
        auth.user_id
    )
    .fetch_one(pool.get_ref())
    .await
    .map_err(|_| actix_web::error::ErrorInternalServerError("DB error"))?;
    
    Ok(HttpResponse::Ok().json(balance))
}

// GET /api/v1/wallet/transactions?page=1&limit=20
pub async fn get_transactions(
    auth: AuthUser,
    query: web::Query<PaginationQuery>,
    pool: web::Data<Pool>,
) -> Result<HttpResponse> {
    let offset = (query.page.unwrap_or(1) - 1) * query.limit.unwrap_or(20);
    
    let transactions = sqlx::query_as!(
        Transaction,
        "SELECT id, amount, direction, counterpart_address, 
                memo, created_at, block_height
         FROM transactions 
         WHERE account_id = $1
         ORDER BY created_at DESC
         LIMIT $2 OFFSET $3",
        auth.user_id,
        query.limit.unwrap_or(20) as i64,
        offset as i64,
    )
    .fetch_all(pool.get_ref())
    .await
    .map_err(|_| actix_web::error::ErrorInternalServerError("DB error"))?;
    
    Ok(HttpResponse::Ok().json(transactions))
}

// POST /api/v1/wallet/transfer
pub async fn transfer(
    auth: AuthUser,
    body: web::Json<TransferRequest>,
    pool: web::Data<Pool>,
) -> Result<HttpResponse> {
    // Vérifier solde suffisant
    let balance: f64 = sqlx::query_scalar!(
        "SELECT balance FROM wallets WHERE account_id = $1",
        auth.user_id
    )
    .fetch_one(pool.get_ref())
    .await
    .map_err(|_| actix_web::error::ErrorInternalServerError("DB error"))?;
    
    if balance < body.amount {
        return Ok(HttpResponse::BadRequest().json(serde_json::json!({
            "error": "INSUFFICIENT_BALANCE",
            "message": "Solde insuffisant"
        })));
    }
    
    // Transaction atomique
    let mut tx = pool.begin().await
        .map_err(|_| actix_web::error::ErrorInternalServerError("DB error"))?;
    
    // Débiter l'expéditeur
    sqlx::query!(
        "UPDATE wallets SET balance = balance - $1 WHERE account_id = $2",
        body.amount, auth.user_id
    ).execute(&mut *tx).await
    .map_err(|_| actix_web::error::ErrorInternalServerError("DB error"))?;
    
    // Créditer le destinataire
    sqlx::query!(
        "UPDATE wallets SET balance = balance + $1 
         WHERE address = $2",
        body.amount, body.to_address
    ).execute(&mut *tx).await
    .map_err(|_| actix_web::error::ErrorInternalServerError("DB error"))?;
    
    // Enregistrer la transaction
    let transaction_id = sqlx::query_scalar!(
        "INSERT INTO transactions (account_id, amount, direction, 
          counterpart_address, memo, created_at)
         VALUES ($1, $2, 'out', $3, $4, NOW())
         RETURNING id",
        auth.user_id, body.amount, body.to_address, body.memo
    ).fetch_one(&mut *tx).await
    .map_err(|_| actix_web::error::ErrorInternalServerError("DB error"))?;
    
    tx.commit().await
    .map_err(|_| actix_web::error::ErrorInternalServerError("DB error"))?;
    
    Ok(HttpResponse::Ok().json(serde_json::json!({
        "transaction_id": transaction_id,
        "status": "confirmed"
    })))
}
```

---

### 3.3 — Module Agora / Gouvernance (priorité haute)

**Backend Rust** — endpoints attendus :
```
GET    /api/v1/agora/proposals           — Liste des propositions
POST   /api/v1/agora/proposals           — Créer une proposition
GET    /api/v1/agora/proposals/:id       — Détail d'une proposition
POST   /api/v1/agora/proposals/:id/vote  — Voter (for/against/abstain)
GET    /api/v1/agora/proposals/:id/votes — Résultats de vote
GET    /api/v1/agora/delegates           — Liste des délégués actifs
POST   /api/v1/agora/delegate            — Déléguer son vote
DELETE /api/v1/agora/delegate            — Révoquer sa délégation
```

---

### 3.4 — Module Codex / Constitution (priorité moyenne)

**Backend Rust** — endpoints attendus :
```
GET    /api/v1/codex/articles            — Liste des articles
GET    /api/v1/codex/articles/:id        — Article complet
GET    /api/v1/codex/articles/:id/history — Historique des versions
GET    /api/v1/codex/version             — Version actuelle de la constitution
```

---

### 3.5 — Module Forge / Édition collaborative (priorité moyenne)

**Backend Rust** — endpoints attendus :
```
GET    /api/v1/forge/documents           — Liste des documents
GET    /api/v1/forge/documents/:id       — Document avec diff
POST   /api/v1/forge/documents/:id/edit  — Proposer une modification
GET    /api/v1/forge/documents/:id/diffs — Liste des propositions de modification
POST   /api/v1/forge/diffs/:id/approve   — Approuver une modification
POST   /api/v1/forge/diffs/:id/reject    — Rejeter une modification
```

---

### 3.6 — Panorama / Dashboard (priorité haute)

**Backend Rust** — endpoint agrégé attendu :
```
GET    /api/v1/panorama/summary          — Toutes les données du dashboard
```

```rust
// Endpoint agrégé pour éviter 5 appels séparés au chargement du dashboard
pub async fn get_summary(
    auth: AuthUser,
    pool: web::Data<Pool>,
) -> Result<HttpResponse> {
    // Paralléliser toutes les requêtes
    let (balance, recent_tx, active_votes, notifications) = tokio::join!(
        get_wallet_balance(&auth.user_id, &pool),
        get_recent_transactions(&auth.user_id, 5, &pool),
        get_active_votes_count(&pool),
        get_notifications(&auth.user_id, &pool),
    );
    
    Ok(HttpResponse::Ok().json(serde_json::json!({
        "balance": balance?,
        "recent_transactions": recent_tx?,
        "active_votes_count": active_votes?,
        "notifications": notifications?,
        "daily_vita_received": true,    // A vérifier selon l'heure
        "next_vita_in_seconds": calculate_next_vita_seconds(),
    })))
}
```

---

### 3.7 — Module Civis / Profil (priorité moyenne)

**Backend Rust** — endpoints attendus :
```
GET    /api/v1/civis/profile             — Profil public
PUT    /api/v1/civis/profile             — Mettre à jour le profil
GET    /api/v1/civis/role                — Rôle actuel (Citoyen/Référent/Mandataire/Gardien)
GET    /api/v1/civis/delegates           — Mes délégations actives
GET    /api/v1/civis/delegators          — Qui m'a délégué son vote
```

---

### 3.8 — Distribution quotidienne de VITA (priorité haute)

C'est le cœur du système — vérifier que le job tourne :

```bash
# Vérifier si un scheduler existe
grep -rn "cron\|scheduler\|tokio::time\|interval\|daily" ./backend/src --include="*.rs"
```

Si absent, créer `backend/src/jobs/daily_vita.rs` :

```rust
use tokio::time::{interval, Duration};
use chrono::Utc;

pub async fn start_daily_vita_scheduler(pool: Pool) {
    let mut interval = interval(Duration::from_secs(60)); // Vérifier chaque minute
    
    loop {
        interval.tick().await;
        
        let now = Utc::now();
        // Distribuer à minuit UTC
        if now.hour() == 0 && now.minute() == 0 {
            if let Err(e) = distribute_daily_vita(&pool).await {
                eprintln!("Erreur distribution quotidienne VITA : {}", e);
            }
        }
    }
}

async fn distribute_daily_vita(pool: &Pool) -> Result<(), sqlx::Error> {
    // Créditer 1 Ѵ à tous les comptes vérifiés
    sqlx::query!(
        "UPDATE wallets w
         SET balance = balance + 1,
             last_daily_distribution = NOW()
         FROM accounts a
         WHERE w.account_id = a.id
           AND a.identity_verified = true
           AND (w.last_daily_distribution IS NULL 
                OR w.last_daily_distribution::date < NOW()::date)"
    )
    .execute(pool)
    .await?;
    
    Ok(())
}
```

---

### 3.9 — Client API frontend centralisé

Vérifier que `src/lib/api/client.ts` existe et est utilisé partout :

```typescript
// Si absent, créer src/lib/api/client.ts
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080'

async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = typeof window !== 'undefined'
    ? localStorage.getItem('vita_token')
    : null

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new ApiError(response.status, error.message ?? 'Erreur API')
  }

  return response.json()
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
  }
}

// Exporter toutes les méthodes par module
export const api = {
  auth: {
    me: () => apiFetch<User>('/api/v1/auth/me'),
    login: (body: LoginDto) => apiFetch<AuthResponse>('/api/v1/auth/login', { method: 'POST', body: JSON.stringify(body) }),
    register: (body: RegisterDto) => apiFetch<AuthResponse>('/api/v1/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  },
  wallet: {
    balance: () => apiFetch<WalletBalance>('/api/v1/wallet/balance'),
    transactions: (page = 1) => apiFetch<Transaction[]>(`/api/v1/wallet/transactions?page=${page}`),
    transfer: (body: TransferDto) => apiFetch<TransferResult>('/api/v1/wallet/transfer', { method: 'POST', body: JSON.stringify(body) }),
  },
  agora: {
    proposals: () => apiFetch<Proposal[]>('/api/v1/agora/proposals'),
    vote: (id: string, choice: 'for' | 'against' | 'abstain') =>
      apiFetch(`/api/v1/agora/proposals/${id}/vote`, { method: 'POST', body: JSON.stringify({ choice }) }),
  },
  panorama: {
    summary: () => apiFetch<PanoramaSummary>('/api/v1/panorama/summary'),
  },
  civis: {
    profile: () => apiFetch<Profile>('/api/v1/civis/profile'),
    updateProfile: (body: UpdateProfileDto) => apiFetch('/api/v1/civis/profile', { method: 'PUT', body: JSON.stringify(body) }),
  },
}
```

---

## Phase 4 — Vérification finale

Après implémentation, relancer le scan pour confirmer :

```bash
# Vérifier qu'aucun mock ne subsiste
grep -rn "mock\|Mock\|hardcoded\|TODO.*API\|dummy" ./src --include="*.ts" --include="*.tsx" | grep -v "node_modules" | grep -v ".next"

# Vérifier que le backend compile
cd backend && cargo check

# Vérifier que le frontend compile
cd .. && npm run build 2>&1 | grep -E "error|warning" | head -30

# Test rapide des endpoints principaux (si les deux serveurs tournent)
curl -s http://localhost:8080/api/v1/health | jq .
curl -s -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@vita.io","password":"test"}' | jq .
```

---

## Résultat attendu

À la fin de ce prompt, Claude Code doit avoir produit :

1. **`VITA_DIAGNOSTIC.md`** — rapport complet de l'état actuel
2. **Tous les endpoints Rust manquants** — implémentés et enregistrés dans le router
3. **`src/lib/api/client.ts`** — client API centralisé si absent
4. **Tous les composants frontend** — utilisant le vrai client API au lieu des données mockées
5. **Le scheduler de distribution quotidienne** — si absent
6. **`VITA_DIAGNOSTIC_APRES.md`** — rapport de confirmation post-implémentation
