# VITA Platform - Roadmap

> Ce document liste ce qui a été fait et ce qui reste à faire.  
> Mis à jour au fur et à mesure de l'avancement.

---

## Légende

- ✅ Terminé
- 🔄 En cours
- ⏳ À faire (prioritaire)
- 📋 À faire (futur)
- ❓ À définir (besoin de discussion)

---

## Phase 0 : Conception ✅

- ✅ Définir la vision et les principes fondamentaux
- ✅ Rédiger le whitepaper
- ✅ Définir les paramètres immuables (constitution)
- ✅ Choisir le stack technique (Rust + Next.js)
- ✅ Créer les wireframes des 5 modules

---

## Phase 1 : Fondations Frontend ✅

- ✅ Setup projet Next.js avec TypeScript
- ✅ Configuration Tailwind CSS
- ✅ Design system (couleurs, composants de base)
- ✅ Layout principal avec sidebar
- ✅ Page Panorama (wireframe)
- ✅ Pages Agora, Codex, Forge, Civis (wireframes)

---

## Phase 2 : Fondations Backend ⏳

### Structure de base
- ⏳ Créer le projet Rust `services/vita-core/`
- ⏳ Setup Cargo.toml avec dépendances
- ⏳ Créer le main.rs avec Actix-web
- ⏳ Setup logging avec tracing
- ⏳ Gestion des erreurs centralisée

### Module Config
- ⏳ Définir les paramètres immuables (struct)
- ⏳ Définir les paramètres configurables (struct)
- ⏳ Charger config depuis .env
- ⏳ Validation des paramètres

### Module Monetary
- ⏳ Struct Balance (solde utilisateur)
- ⏳ Logique d'émission quotidienne (1 Ѵ/jour)
- ⏳ Calcul de la masse monétaire totale
- ❓ Mécanisme de redistribution (pot commun)

### Module Transaction
- ⏳ Struct Transaction
- ⏳ Création de transaction
- ⏳ Validation (solde suffisant, limites)
- ⏳ Calcul contribution pot commun
- 📋 Transactions offline (plus tard)

### Base de données
- ⏳ Setup PostgreSQL local
- ⏳ Première migration (users, balances, transactions)
- ⏳ Connexion SQLx

### API REST
- ⏳ GET /health
- ⏳ GET /api/v1/monetary/balance/{id}
- ⏳ POST /api/v1/transactions/create
- ⏳ GET /api/v1/statistics/dashboard

---

## Phase 3 : Intégration Frontend-Backend ⏳

### Client API TypeScript
- ⏳ Créer packages/vita-types/
- ⏳ Types miroir du backend
- ⏳ Client fetch avec typage
- ⏳ Gestion des erreurs

### Panorama (Dashboard)
- ⏳ Connecter aux vraies données
- ⏳ Afficher population vs utilisateurs
- ⏳ Afficher masse monétaire
- ⏳ Graphiques temps réel

### Civis (Profil)
- ⏳ Afficher solde réel
- ⏳ Historique des transactions
- ⏳ Formulaire d'envoi de VITA

---

## Phase 4 : Identité & Sécurité 📋

### Module Identity
- 📋 Recherche sur les ZK-proofs
- ❓ Choisir l'implémentation (Groth16, PLONK, autre)
- 📋 Struct VerifiedIdentity
- 📋 Vérification de preuve
- 📋 Preuve de vie périodique

### Module Crypto
- 📋 Génération de clés Ed25519
- 📋 Signature de transactions
- 📋 Vérification de signatures

### Module Audit
- 📋 Journal immuable
- 📋 Chaîne de hashes
- 📋 Vérification d'intégrité

---

## Phase 5 : Gouvernance 📋

### Agora (Votes)
- 📋 Créer une proposition
- 📋 Voter (1 personne = 1 voix)
- 📋 Calcul des résultats
- 📋 Exécution automatique si adopté

### Codex (Constitution)
- 📋 Affichage des paramètres immuables
- 📋 Affichage des paramètres actuels
- 📋 Historique des changements

### Forge (Versioning)
- 📋 Créer une branche de proposition
- 📋 Diff entre versions
- 📋 Merge après vote

---

## Phase 6 : Fonctionnalités Avancées 📋

### Transactions Offline
- ❓ Définir les limites (montant, nombre, durée)
- 📋 Stockage local sécurisé
- 📋 Synchronisation et règlement
- 📋 Détection de double-dépense

### Valorisation des Services
- ❓ Définir les coefficients de base
- ❓ Définir les modificateurs
- 📋 Interface de création de service
- 📋 Calcul automatique de la valeur

### APIs Externes
- 📋 Intégration UN Population API
- 📋 Intégration World Bank API
- 📋 Consensus multi-sources
- 📋 Cache et rafraîchissement

### Administration
- 📋 Interface admin
- 📋 Système de rôles
- 📋 Multi-signature pour actions critiques
- 📋 Rapports et exports

---

## Questions Ouvertes ❓

Ces points nécessitent une discussion/décision :

### Technique
1. **ZK-Proofs** : Quelle bibliothèque Rust utiliser ?
2. **Base de données** : Garder PostgreSQL ou considérer autre chose ?
3. **Temps réel** : WebSocket maintenant ou plus tard ?

### Fonctionnel
4. **Limites offline** : Quelles valeurs initiales ?
   - Montant max par transaction : 10 Ѵ ?
   - Nombre max avant sync : 5 ?
   - Durée max : 72h ?

5. **Pot commun** : Quel pourcentage ?
   - 1% de chaque transaction ?
   - Comment redistribuer ?

6. **Coefficients de service** : Comment les définir ?
   - Valeurs initiales ?
   - Processus de modification ?

7. **Récupération de compte** : Si l'utilisateur perd son device ?
   - Procédure de récupération ?
   - Ou perte définitive (plus souverain) ?

### Gouvernance
8. **Quorum pour les votes** : Quel seuil ?
9. **Durée des votes** : Combien de temps ?
10. **Élection des admins** : Quel processus ?

---

## Notes pour Claude Code

Quand tu travailles sur ce projet :

1. **Consulte cette roadmap** pour savoir quoi faire
2. **Mets-la à jour** quand tu termines une tâche
3. **Signale les questions** que tu rencontres
4. **Priorise** les tâches ⏳ avant les 📋
5. **Demande** pour les ❓ avant de décider

---

*Dernière mise à jour : Janvier 2025*
