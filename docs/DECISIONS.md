# VITA Platform - Journal des Décisions

> Ce document trace toutes les décisions importantes prises pour le projet.  
> Chaque décision explique le contexte, les options considérées, et le choix final.

---

## Comment utiliser ce document

Quand une décision importante est prise :
1. Ajouter une nouvelle entrée avec la date
2. Expliquer le contexte et le problème
3. Lister les options considérées
4. Documenter la décision et son raisonnement
5. Noter les conséquences

---

## Décisions

### DEC-001 : Paramètres constitutionnels immuables

**Date** : Janvier 2025  
**Statut** : ✅ Adopté définitivement

**Contexte**  
Le système VITA a besoin de règles fondamentales qui ne peuvent jamais être modifiées, même par vote majoritaire. Ces règles forment la "constitution" du système.

**Options considérées**  
1. Tout est modifiable par vote → Risque de dérive
2. Certaines règles sont immuables → Protection des principes fondamentaux
3. Modification possible mais avec seuil très élevé (90%+) → Compromis

**Décision**  
Adopter 4 paramètres absolument immuables :
- `daily_emission_per_person = 1 Ѵ`
- `retroactive_emission = false`
- `transaction_privacy = true`
- `one_person_one_account = true`

**Raisonnement**  
Ces 4 règles définissent l'essence même de VITA. Les modifier reviendrait à créer un système différent. Elles protègent contre :
- L'inflation arbitraire
- L'avantage des early adopters
- La surveillance de masse
- L'accumulation de comptes

**Conséquences**  
- Le code doit empêcher toute modification de ces valeurs
- Claude Code doit refuser toute demande de modification
- Les tests doivent vérifier leur immutabilité

---

### DEC-002 : Choix de Rust pour le backend

**Date** : Janvier 2025  
**Statut** : ✅ Adopté

**Contexte**  
Le backend doit être sûr, performant, et capable de gérer des opérations financières critiques.

**Options considérées**  
1. **Node.js/TypeScript** : Rapide à développer, même langage que frontend
2. **Go** : Performant, simple, bon pour les services
3. **Rust** : Sécurité mémoire garantie, très performant
4. **Python** : Facile, mais moins performant

**Décision**  
Rust avec Actix-web

**Raisonnement**  
- Sécurité mémoire à la compilation (pas de buffer overflow, use-after-free)
- Performance proche du C
- Écosystème cryptographique mature (ring, ed25519-dalek)
- Garanties de concurrence ("fearless concurrency")
- Le système manipule de l'argent → la sécurité est critique

**Conséquences**  
- Courbe d'apprentissage plus raide
- Compilation plus longue
- Mais code plus sûr et plus maintenable

---

### DEC-003 : Priorité anti-fraude sur convenience offline

**Date** : Janvier 2025  
**Statut** : ✅ Adopté

**Contexte**  
Les transactions offline sont souhaitables (inclusivité, zones mal connectées), mais créent des risques de double-dépense.

**Options considérées**  
1. **Pas d'offline** : Simple mais exclusif
2. **Offline illimité** : Pratique mais risqué
3. **Offline limité avec priorité anti-fraude** : Compromis

**Décision**  
Transactions offline autorisées mais avec limites strictes et priorité absolue à la détection de fraude.

**Raisonnement**  
- L'intégrité du système est plus importante que la convenience
- Des limites raisonnables permettent les usages légitimes
- Les paramètres seront ajustables par vote collectif

**Conséquences**  
- Limites à définir collectivement (montant, nombre, durée)
- Système de pénalités pour non-synchronisation
- En cas de conflit → version serveur fait foi
- Tentative de fraude → compte suspendu

---

### DEC-004 : Zero-Knowledge Proofs pour l'identité

**Date** : Janvier 2025  
**Statut** : ✅ Adopté (implémentation à définir)

**Contexte**  
VITA doit garantir "une personne = un compte" sans collecter de données personnelles.

**Options considérées**  
1. **KYC classique** : Pièce d'identité → Atteinte à la vie privée
2. **Biométrie centralisée** : Empreintes, visage → Surveillance potentielle
3. **Zero-Knowledge Proofs** : Prouver son unicité sans révéler son identité
4. **Web of Trust** : Validation par pairs → Difficile à scale

**Décision**  
Utiliser des Zero-Knowledge Proofs

**Raisonnement**  
- Seule solution qui préserve vraiment la vie privée
- Garantie cryptographique d'unicité
- Pas de base de données de données personnelles
- Aligné avec les valeurs du projet

**Conséquences**  
- Complexité technique plus élevée
- Recherche nécessaire sur l'implémentation exacte
- Preuve de vie périodique requise
- ❓ Choix de la bibliothèque à faire (Groth16, PLONK...)

---

### DEC-005 : Monorepo pour le projet

**Date** : Janvier 2025  
**Statut** : ✅ Adopté

**Contexte**  
Le projet a plusieurs composants (frontend, backend, types partagés). Comment organiser le code ?

**Options considérées**  
1. **Repos séparés** : Frontend et backend dans des repos différents
2. **Monorepo** : Tout dans le même repo

**Décision**  
Monorepo avec structure :
```
vita-platform/
├── apps/web/           # Frontend
├── services/vita-core/ # Backend
└── packages/vita-types/# Types partagés
```

**Raisonnement**  
- Un seul contexte pour Claude Code
- Types partagés facilement synchronisés
- Un seul clone pour tout avoir
- CI/CD unifié possible

**Conséquences**  
- Le repo sera plus gros
- Mais navigation et maintenance simplifiées

---

### DEC-006 : Design system violet-pink

**Date** : Janvier 2025  
**Statut** : ✅ Adopté

**Contexte**  
L'interface utilisateur a besoin d'une identité visuelle cohérente.

**Décision**  
- Thème sombre par défaut
- Gradient signature : violet (#667eea) → rose (#ec4899)
- Style glassmorphism pour les cards
- Police : Inter (system font)
- Icônes : Lucide React

**Raisonnement**  
- Le violet évoque la technologie et l'innovation
- Le rose apporte chaleur et humanité
- Le thème sombre est moderne et reposant
- Cohérent avec l'image d'un système financier de nouvelle génération

---

## Décisions en attente

### À DÉCIDER : Limites transactions offline

**Contexte**  
Les transactions offline sont autorisées mais doivent être limitées.

**Options à considérer**  
- Montant max par transaction : 5 Ѵ ? 10 Ѵ ? 20 Ѵ ?
- Nombre max avant sync : 3 ? 5 ? 10 ?
- Durée max offline : 24h ? 48h ? 72h ?
- Pénalité de dépassement : 0.1%/jour ? 0.5%/jour ?

**Statut** : ❓ À discuter

---

### À DÉCIDER : Pourcentage pot commun

**Contexte**  
Un pourcentage de chaque transaction va dans un "pot commun" pour redistribution.

**Options à considérer**  
- 0.5% ?
- 1% ?
- 2% ?
- Variable selon le montant ?

**Statut** : ❓ À discuter

---

### À DÉCIDER : Implémentation ZK-proofs

**Contexte**  
Quelle bibliothèque Rust utiliser pour les zero-knowledge proofs ?

**Options à considérer**  
- **bellman** : Mature, utilisé par Zcash
- **ark-**** : Moderne, modulaire (arkworks)
- **halo2** : Pas de trusted setup
- **plonky2** : Très performant

**Statut** : ❓ Recherche nécessaire

---

### À DÉCIDER : Récupération de compte

**Contexte**  
Que se passe-t-il si un utilisateur perd son device/clé ?

**Options à considérer**  
1. **Perte définitive** : Plus souverain, mais perte des fonds
2. **Récupération sociale** : N contacts de confiance peuvent récupérer
3. **Backup chiffré** : Phrase de récupération comme crypto
4. **Ré-vérification** : Nouveau ZK-proof, fonds conservés

**Statut** : ❓ À discuter

---

## Template pour nouvelles décisions

```markdown
### DEC-XXX : [Titre de la décision]

**Date** : [Date]  
**Statut** : ⏳ En discussion / ✅ Adopté / ❌ Rejeté

**Contexte**  
[Quel problème résout cette décision ?]

**Options considérées**  
1. **Option A** : [Description]
2. **Option B** : [Description]
3. **Option C** : [Description]

**Décision**  
[Quelle option a été choisie ?]

**Raisonnement**  
[Pourquoi cette option ?]

**Conséquences**  
[Quels impacts sur le projet ?]
```

---

*Dernière mise à jour : Janvier 2025*
