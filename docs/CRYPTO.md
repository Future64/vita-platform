# Cryptographie VITA

> Documentation technique de la couche cryptographique de VITA.

---

## Pourquoi la confidentialite est un parametre immuable

La privacy transactionnelle fait partie des **4 parametres constitutionnels immuables** de VITA :

1. 1 personne = 1 V par jour
2. Pas de retroactivite
3. **Privacy des transactions garantie**
4. 1 personne = 1 compte

Dans un systeme monetaire universel, chaque transaction revele des informations sur la vie des individus : ce qu'ils achetent, a qui ils paient, combien ils gagnent. Sans confidentialite, le systeme deviendrait un outil de surveillance de masse.

VITA garantit que :
- Les **montants** des transactions sont caches (Pedersen commitments)
- Les **soldes** restent positifs sans reveler leur valeur (range proofs)
- Seuls l'emetteur et le destinataire connaissent les details

---

## Architecture cryptographique

```
┌─────────────────────────────────────────────────────────────┐
│                    VITA Crypto Stack                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Signatures        Ed25519 (ed25519-dalek 2.x)              │
│  ─────────         Signe chaque transaction                 │
│                                                              │
│  Commitments       Pedersen (bulletproofs + curve25519)      │
│  ───────────       Cache les montants : C = v*G + r*H       │
│                                                              │
│  Range Proofs      Bulletproofs (bulletproofs 5.x)           │
│  ────────────      Prouve 0 <= montant < 2^64               │
│                                                              │
│  Merkle Tree       SHA-256, construction quotidienne         │
│  ───────────       Integrite de l'historique                 │
│                                                              │
│  Stealth Addr.     curve25519-dalek 4.x (futur)             │
│  ─────────────     Cachera les destinataires                 │
│                                                              │
│  ZK-Proofs         arkworks (futur)                          │
│  ─────────         Verification d'identite sans donnees     │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Ed25519 — Signatures de transactions

### Principe

Chaque utilisateur possede une paire de cles Ed25519 generee a l'inscription :
- **Cle privee** : stockee chiffree en base (XOR + SHA-256 derive du mot de passe)
- **Cle publique** : stockee en clair, identifie l'utilisateur

### Signature d'une transaction

```
payload = {
    from_id, to_id, amount, tx_type, timestamp, nonce
}

payload_hash = SHA-256(canonical_json(payload))
signature = Ed25519.sign(private_key, payload_hash)
```

Le serveur signe les transactions cote serveur dans ce prototype. En production, la signature sera faite cote client.

### Fichiers

- `src/crypto/keys.rs` — Generation, serialisation, chiffrement des cles
- `src/crypto/signatures.rs` — Construction du payload, signature, verification

---

## Pedersen Commitments — Montants caches

### Principe mathematique

Un Pedersen commitment cache une valeur `v` avec un facteur d'aveuglement `r` :

```
C = v * G + r * H
```

Ou :
- `G` et `H` sont des points generateurs sur la courbe elliptique Ristretto255
- `v` est le montant (en centiemes de V, 1 V = 100 000 000 unites)
- `r` est un scalaire aleatoire (blinding factor)
- `C` est le commitment (point compresse sur la courbe)

### Proprietes

1. **Masquage** : Impossible de retrouver `v` a partir de `C` sans connaitre `r`
2. **Liaison** : Impossible de trouver un autre couple `(v', r')` donnant le meme `C`
3. **Homomorphisme additif** : `C(v1, r1) + C(v2, r2) = C(v1+v2, r1+r2)`

La propriete 3 permet de verifier l'equilibre d'une transaction sans reveler les montants :

```
C_envoi + C_nouveau_solde = C_ancien_solde
(si les blinding factors sont correctement equilibres)
```

### Stockage des blinding factors

Le blinding factor est necessaire pour prouver la connaissance du montant. Il est :
1. Genere aleatoirement par le serveur (`Scalar::random`)
2. Chiffre avec la cle publique de chaque partie (emetteur + destinataire)
3. Stocke dans la table `blinding_factors` (un enregistrement par utilisateur par transaction)

### Fichier

- `src/crypto/commitments.rs`

---

## Range Proofs — Preuves d'intervalle

### Pourquoi des range proofs ?

Les Pedersen commitments seuls ne suffisent pas. Sans range proof, un attaquant pourrait :
- Creer un montant negatif (underflow modulo l'ordre du groupe)
- S'attribuer un solde astronomique

Les range proofs prouvent que `0 <= v < 2^64` **sans reveler v**.

### Implementation

VITA utilise les **Bulletproofs** (algorithme de Bunz et al., 2018) :
- Taille de preuve : O(log n) — quelques centaines d'octets
- Pas de trusted setup (contrairement a Groth16)
- Verification rapide

```rust
// Creer une range proof
let (proof, commitment) = create_range_proof(amount, &blinding)?;

// Verifier qu'un commitment cache une valeur valide
let valid = verify_range_proof(&proof, &commitment);
```

### Transfer proof

Pour un transfert confidentiel, deux range proofs sont crees :
1. **Nouveau solde de l'emetteur** >= 0 (prouve qu'il ne depense pas plus qu'il n'a)
2. **Montant transfere** >= 0 (prouve que le montant est positif)

### Fichier

- `src/crypto/range_proofs.rs`

---

## Merkle Tree — Integrite de l'historique

### Role

Le Merkle tree garantit l'integrite de l'historique des transactions. Il permet de :
- Prouver qu'une transaction specifique fait partie de l'historique
- Detecter toute modification retroactive
- Fournir des preuves compactes d'inclusion

### Construction

Un arbre Merkle est construit **quotidiennement** pour toutes les transactions du jour :

```
              Root (SHA-256)
             /              \
        H(AB)                H(CD)
       /     \              /     \
    H(A)     H(B)       H(C)     H(D)
     |        |           |        |
   tx_1     tx_2        tx_3     tx_4
```

- **Feuille** : `SHA-256("leaf:" + tx_id + "|" + payload_hash)`
- **Noeud interne** : `SHA-256("node:" + left_hash + right_hash)`
- **Nombre impair** : le dernier noeud est duplique

### Preuve d'inclusion

Pour prouver qu'une transaction `tx_2` est dans l'arbre :

```
Preuve = [H(A), side=Left], [H(CD), side=Right]

Verification :
  current = H(B)
  current = H("node:" + H(A) + current)  → H(AB)
  current = H("node:" + current + H(CD)) → Root
  Root == stored_root ? VALID
```

### Cron quotidien

Un job cron s'execute toutes les heures dans `main.rs` et construit l'arbre Merkle pour la veille si il n'existe pas encore.

### Fichiers

- `src/crypto/merkle.rs` — Construction, verification, preuves
- `src/api/crypto.rs` — Endpoints API (roots, proof, verify)
- `migrations/009_crypto.sql` — Tables `merkle_racines` et `merkle_nodes`

---

## Transactions confidentielles — Flux complet

### Endpoint

```
POST /api/v1/transactions/transfer-confidentiel
{
    "from_id": "uuid",
    "to_id": "uuid",
    "amount": "10.50",
    "note": "optional memo"
}
```

### Flux d'execution

```
1. Parse et valide le montant (Decimal → u64, 1 V = 10^8 centiemes)
2. Verifie que l'appelant est bien l'emetteur (JWT)
3. Genere un blinding factor aleatoire
4. Cree le Pedersen commitment : C = amount * G + blinding * H
5. Cree la range proof : prouve 0 <= amount < 2^64
6. Execute le transfert classique (debit/credit des soldes)
7. Stocke commitment + range_proof + confidentiel=true sur la transaction
8. Chiffre le blinding factor pour l'emetteur ET le destinataire
9. Stocke les blinding factors chiffres dans blinding_factors
10. Log d'audit
11. Retourne la reponse SANS le montant
```

### Reponse

```json
{
    "transaction_id": "uuid",
    "commitment": "hex...",
    "range_proof_valid": true,
    "confidentiel": true,
    "note": "optional memo"
}
```

Le montant n'apparait **jamais** dans la reponse publique.

### Endpoints complementaires

| Endpoint | Description |
|----------|-------------|
| `GET /transactions/{id}/commitment` | Recupere le commitment + range proof + validite |
| `POST /transactions/{id}/verify-commitment` | Verifie un montant+blinding contre le commitment |
| `GET /transactions/{id}/blinding-factor` | Recupere le blinding factor chiffre (emetteur/destinataire uniquement) |

---

## Limitations du prototype

### Le serveur connait le montant

**C'est la limitation principale.** Dans ce prototype :
- Le serveur recoit le montant en clair dans la requete
- Le serveur genere le commitment et le blinding factor
- Le serveur chiffre le blinding factor

Cela signifie que le serveur pourrait theoriquement reveler les montants. La confidentialite repose sur la **confiance envers le serveur**.

### Chiffrement simplifie des blinding factors

Le chiffrement actuel utilise un XOR avec SHA-256 de la cle publique. Ce n'est pas un vrai schema de chiffrement asymetrique. En production, il faudrait utiliser ECIES ou un equivalent.

### Pas de stealth addresses

Les destinataires sont visibles. Les stealth addresses (prevues avec curve25519-dalek) cacheront egalement les destinataires.

### Pas de preuves d'equilibre globales

Le systeme ne verifie pas encore que `sum(inputs) = sum(outputs)` au niveau des commitments. Les soldes sont toujours verifies en clair cote serveur.

---

## Plan pour la version production

### Phase 1 — Commitments cote client (prioritaire)

```
Client                          Serveur
  │                                │
  │  1. Genere blinding factor     │
  │  2. Cree commitment            │
  │  3. Cree range proof           │
  │                                │
  │  POST {commitment, proof}  ──→ │
  │                                │  4. Verifie range proof
  │                                │  5. Verifie equilibre (homomorphisme)
  │                                │  6. Enregistre
  │  ←── {tx_id, ok}              │
```

Le serveur ne voit **jamais** le montant ni le blinding factor.

### Phase 2 — Stealth addresses

Utilisation de courbes Diffie-Hellman pour generer des adresses ephemeres :
- L'emetteur genere une adresse unique pour chaque transaction
- Seul le destinataire peut scanner et reconnaitre ses transactions
- Impossible de lier deux transactions au meme destinataire

### Phase 3 — Preuves d'equilibre

Verification que `C_input - C_output = C_fee` en utilisant l'homomorphisme additif des Pedersen commitments. Cela elimine le besoin de verifier les soldes en clair.

### Phase 4 — ZK-proofs d'identite

Integration d'arkworks (ark-groth16 + ark-bn254) pour prouver "je suis un humain unique" sans reveler d'information personnelle.

---

## Tables SQL

### Migration 009 — Crypto (signatures + Merkle)

```sql
-- Colonnes crypto sur users
ALTER TABLE users ADD COLUMN public_key VARCHAR(128);
ALTER TABLE users ADD COLUMN encrypted_private_key TEXT;

-- Colonnes crypto sur transactions
ALTER TABLE transactions ADD COLUMN payload_hash VARCHAR(128);
ALTER TABLE transactions ADD COLUMN signature VARCHAR(256);

-- Merkle tree
CREATE TABLE merkle_racines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE UNIQUE NOT NULL,
    racine_hash VARCHAR(128) NOT NULL,
    nombre_feuilles INTEGER NOT NULL,
    nombre_niveaux INTEGER NOT NULL,
    verifie BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE merkle_nodes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    racine_id UUID NOT NULL REFERENCES merkle_racines(id),
    position INTEGER NOT NULL,
    niveau INTEGER NOT NULL,
    hash VARCHAR(128) NOT NULL,
    tx_id UUID REFERENCES transactions(id),
    UNIQUE(racine_id, position)
);
```

### Migration 010 — Confidential transactions

```sql
-- Colonnes confidentielles sur transactions
ALTER TABLE transactions ADD COLUMN commitment VARCHAR(256);
ALTER TABLE transactions ADD COLUMN range_proof TEXT;
ALTER TABLE transactions ADD COLUMN confidentiel BOOLEAN DEFAULT FALSE;

-- Blinding factors (chiffres, par utilisateur)
CREATE TABLE blinding_factors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID NOT NULL REFERENCES transactions(id),
    user_id UUID NOT NULL REFERENCES users(id),
    encrypted_factor TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(transaction_id, user_id)
);
```

---

## Tests

68 tests unitaires couvrent l'ensemble de la couche crypto :

| Module | Tests |
|--------|-------|
| `crypto::keys` | 8 tests (generation, serialisation, chiffrement, roundtrip) |
| `crypto::signatures` | 8 tests (payload, hash, sign, verify) |
| `crypto::commitments` | 12 tests (commit, verify, homomorphisme, hex, blinding, encrypt) |
| `crypto::range_proofs` | 8 tests (prove, verify, transfer, serialisation) |
| `crypto::merkle` | 12 tests (build, proof, verify, edge cases) |

```bash
cargo test    # Tous les tests
cargo test crypto::  # Tests crypto uniquement
```

---

*Derniere mise a jour : Fevrier 2026*
