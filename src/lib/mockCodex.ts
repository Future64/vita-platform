import type { CodexSection, TechnicalDoc, RegisterEntry } from "@/types/codex";

// ============================================================
// ARBORESCENCE DU CODEX — navigation complete
// ============================================================

export const CODEX_NAVIGATION: CodexSection[] = [
  {
    id: "nav-constitution",
    type: "constitution",
    title: "Constitution VITA",
    icon: "BookOpen",
    path: "/codex",
    children: [
      {
        id: "nav-const-t1",
        type: "constitution",
        title: "Titre I — Principes Fondamentaux",
        icon: "Shield",
        path: "/codex/article/1",
      },
      {
        id: "nav-const-t2",
        type: "constitution",
        title: "Titre II — Droits et Devoirs",
        icon: "Scale",
        path: "/codex/article/2",
      },
      {
        id: "nav-const-t3",
        type: "constitution",
        title: "Titre III — Gouvernance",
        icon: "Vote",
        path: "/codex/article/3",
      },
      {
        id: "nav-const-t4",
        type: "constitution",
        title: "Titre IV — Systeme Monetaire",
        icon: "Wallet",
        path: "/codex/article/4",
      },
      {
        id: "nav-const-t5",
        type: "constitution",
        title: "Titre V — Revision et Amendements",
        icon: "FileEdit",
        path: "/codex/article/5",
      },
    ],
  },
  {
    id: "nav-lois",
    type: "loi",
    title: "Lois",
    icon: "FileText",
    path: "/codex?tab=lois",
    children: [
      {
        id: "nav-loi-001",
        type: "loi",
        title: "LOI-2025-001 — Verification d'identite",
        icon: "UserCheck",
        path: "/codex/article/6",
      },
      {
        id: "nav-loi-002",
        type: "loi",
        title: "LOI-2025-002 — Transactions et echanges",
        icon: "ArrowLeftRight",
        path: "/codex/article/7",
      },
      {
        id: "nav-loi-003",
        type: "loi",
        title: "LOI-2025-003 — Valorisation des services",
        icon: "Calculator",
        path: "/codex/article/8",
      },
    ],
  },
  {
    id: "nav-parametres",
    type: "parametre",
    title: "Parametres Systeme",
    icon: "Settings",
    path: "/codex/parametres-systeme",
    children: [
      {
        id: "nav-param-imm",
        type: "parametre",
        title: "Parametres Immuables",
        icon: "Lock",
        path: "/codex/parametres-systeme?cat=immuable",
      },
      {
        id: "nav-param-gov",
        type: "parametre",
        title: "Parametres de Gouvernance",
        icon: "Vote",
        path: "/codex/parametres-systeme?cat=gouvernance",
      },
      {
        id: "nav-param-tech",
        type: "parametre",
        title: "Parametres Techniques",
        icon: "Cpu",
        path: "/codex/parametres-systeme?cat=technique",
      },
    ],
  },
  {
    id: "nav-technique",
    type: "technique",
    title: "Documentation Technique",
    icon: "Code",
    path: "/codex/technique",
    children: [
      {
        id: "nav-tech-emission",
        type: "technique",
        title: "Emission Quotidienne",
        icon: "Clock",
        path: "/codex/technique/emission-quotidienne",
      },
      {
        id: "nav-tech-zkp",
        type: "technique",
        title: "Zero-Knowledge Proofs",
        icon: "Shield",
        path: "/codex/technique/zkp-identite",
      },
      {
        id: "nav-tech-transactions",
        type: "technique",
        title: "Systeme de Transactions",
        icon: "ArrowLeftRight",
        path: "/codex/technique/transactions",
      },
      {
        id: "nav-tech-offline",
        type: "technique",
        title: "Mode Offline",
        icon: "WifiOff",
        path: "/codex/technique/mode-offline",
      },
      {
        id: "nav-tech-audit",
        type: "technique",
        title: "Audit Trail",
        icon: "FileSearch",
        path: "/codex/technique/audit-trail",
      },
      {
        id: "nav-tech-crypto",
        type: "technique",
        title: "Cryptographie",
        icon: "Key",
        path: "/codex/technique/cryptographie",
      },
      {
        id: "nav-tech-api",
        type: "technique",
        title: "API REST",
        icon: "Globe",
        path: "/codex/technique/api-rest",
      },
      {
        id: "nav-tech-vote",
        type: "technique",
        title: "Systeme de Vote",
        icon: "Vote",
        path: "/codex/technique/systeme-vote",
      },
      {
        id: "nav-tech-valorisation",
        type: "technique",
        title: "Valorisation des Services",
        icon: "Calculator",
        path: "/codex/technique/valorisation",
      },
      {
        id: "nav-tech-roles",
        type: "technique",
        title: "Roles et Permissions",
        icon: "Users",
        path: "/codex/technique/roles-permissions",
      },
      {
        id: "nav-tech-population",
        type: "technique",
        title: "Donnees Population Mondiale",
        icon: "Globe",
        path: "/codex/technique/population-mondiale",
      },
    ],
  },
  {
    id: "nav-registre",
    type: "registre",
    title: "Registre des Modifications",
    icon: "History",
    path: "/codex/registre",
  },
];

// ============================================================
// DOCUMENTATION TECHNIQUE — 10 pages
// ============================================================

export const TECHNICAL_DOCS: TechnicalDoc[] = [
  {
    id: "doc-emission",
    title: "Systeme Monetaire VITA",
    slug: "emission-quotidienne",
    icon: "Clock",
    lastUpdated: "2025-12-01",
    version: "1.2.0",
    sections: [
      {
        id: "doc-emission-s1",
        title: "Principe fondamental",
        order: 1,
        content:
          "L'emission quotidienne est le mecanisme central de VITA. Chaque jour a 00:00 UTC, le systeme credite automatiquement 1 Ѵ sur le compte de chaque utilisateur ayant le statut 'verifie'. Ce processus est entierement automatise et ne necessite aucune intervention humaine.\n\nLa masse monetaire totale est directement proportionnelle au nombre de jours-personnes verifies dans le systeme. Il n'y a aucun mecanisme d'inflation artificielle, de creation monetaire par le credit, ni de mining.",
      },
      {
        id: "doc-emission-s2",
        title: "Formule d'emission et masse monetaire",
        order: 2,
        content:
          "La formule de calcul de la masse monetaire est deterministe :\n\n$$FORMULA$$ M(t) = \\sum_{i=1}^{N} d_i(t) $$END$$\n\nOu :\n- `M(t)` = masse monetaire totale au temps t\n- `N` = nombre total d'utilisateurs verifies\n- `d_i(t)` = nombre de jours ecoules depuis la verification de l'utilisateur i\n\nExemple concret : si 1 million d'utilisateurs sont verifies depuis 100 jours en moyenne, la masse monetaire est de 100 000 000 Ѵ.\n\n$$FORMULA$$ Emission_{jour} = N_{verifies} \\times 1 Ѵ $$END$$\n\nL'emission quotidienne totale est egale au nombre d'utilisateurs verifies actifs. Contrairement aux monnaies traditionnelles, il n'y a pas de banque centrale qui decide de la quantite de monnaie en circulation — elle est determinee mecaniquement par le nombre d'humains verifies.",
      },
      {
        id: "doc-emission-s3",
        title: "Processus technique d'emission",
        order: 3,
        content:
          "Le batch d'emission s'execute quotidiennement via un job cron a 00:00 UTC. Pour chaque compte verifie :\n\n1. Verification du statut : le compte doit etre en statut 'verifie' et non suspendu\n2. Verification de la derniere emission : eviter les doubles emissions\n3. Credit de 1.00 Ѵ sur le solde principal\n4. Ecriture dans le journal d'audit avec hash chaine\n5. Mise a jour des statistiques de masse monetaire\n\n$$CODE$$\n// Pseudo-code du batch d'emission\nasync fn daily_emission(db: &Pool) -> Result<EmissionReport> {\n    let verified_accounts = db.get_verified_accounts().await?;\n    let mut report = EmissionReport::new();\n    \n    for account in verified_accounts {\n        if account.last_emission < today() && !account.suspended {\n            db.credit(account.id, Decimal::new(1, 0)).await?;\n            audit_log.append(EmissionEntry {\n                account_id: account.id,\n                amount: 1.00,\n                timestamp: Utc::now(),\n            });\n            report.success += 1;\n        }\n    }\n    Ok(report)\n}\n$$END$$\n\nEn cas d'echec sur un compte individuel, les autres comptes ne sont pas affectes. Les echecs sont loggues et retentes au cycle suivant.",
      },
      {
        id: "doc-emission-s4",
        title: "Valorisation et pouvoir d'achat",
        order: 4,
        content:
          "La valeur d'un VITA n'est pas determinee par un marche financier mais par le travail humain. La formule de valorisation d'un service est :\n\n$$FORMULA$$ Valeur = Temps \\times Coeff_{base} \\times Modificateurs + Cout_{materiaux} $$END$$\n\nLes coefficients sont definis collectivement par vote dans l'Agora. Exemples indicatifs :\n\n| Type de travail | Coefficient |\n|---|---|\n| Standard | 1.0 |\n| Qualifie | 1.2 - 1.5 |\n| Penible/Dangereux | 1.3 - 1.8 |\n| Expertise rare | 1.5 - 2.0 |\n\nAinsi, 1 heure de travail standard = 1 Ѵ. Un citoyen recoit 1 Ѵ/jour gratuitement, ce qui couvre les besoins minimaux.",
      },
      {
        id: "doc-emission-s5",
        title: "Garanties d'integrite",
        order: 5,
        content:
          "Chaque emission est enregistree dans le journal d'audit immutable. L'entree contient :\n- Identifiant unique de l'emission\n- Identifiant du compte beneficiaire (anonymise)\n- Montant (toujours 1.00 Ѵ)\n- Horodatage UTC\n- Hash SHA-256 chaine avec l'entree precedente\n\n$$WARNING$$ Il est mathematiquement impossible de modifier une emission passee sans invalider toute la chaine de hachage. Toute tentative de manipulation est immediatement detectable. $$END$$\n\nLes parametres associes a l'emission sont consultables dans la section Parametres Systeme : emission quotidienne (immuable), heure d'emission (technique), precision decimale (technique).",
      },
    ],
  },
  {
    id: "doc-zkp",
    title: "Zero-Knowledge Proofs pour l'Identite",
    slug: "zkp-identite",
    icon: "Shield",
    lastUpdated: "2025-11-15",
    version: "0.9.0",
    sections: [
      {
        id: "doc-zkp-s1",
        title: "Objectif",
        order: 1,
        content:
          "Le systeme de verification d'identite de VITA repose sur les Zero-Knowledge Proofs (ZKP) pour garantir le principe '1 personne = 1 compte' sans collecter de donnees personnelles. L'utilisateur prouve qu'il est un humain unique sans reveler son identite.\n\nCette approche est fondamentale pour reconcilier deux exigences apparemment contradictoires : la prevention de la fraude (comptes multiples) et la protection absolue de la vie privee.",
      },
      {
        id: "doc-zkp-s2",
        title: "Architecture cryptographique",
        order: 2,
        content:
          "L'implementation utilise le schema de preuve Groth16 sur la courbe BN254. Le circuit ZK-SNARK verifie :\n\n1. L'utilisateur possede une preuve biometrique valide (hash)\n2. Cette preuve n'a pas deja ete utilisee pour un autre compte\n3. L'utilisateur est age d'au moins 16 ans\n\nLe verificateur stocke uniquement un nullifier — un hash irreversible qui empeche la double-inscription sans reveler l'identite de l'utilisateur. Le prouveur genere la preuve localement sur son appareil.",
      },
      {
        id: "doc-zkp-s3",
        title: "Re-verification periodique",
        order: 3,
        content:
          "Tous les 365 jours (parametre configurable), l'utilisateur doit fournir une nouvelle preuve de vie. Cette preuve confirme que l'humain derriere le compte est toujours vivant et actif.\n\nEn cas de non-renouvellement, les emissions sont suspendues (mais le solde est preserve) jusqu'a la prochaine verification reussie.",
      },
    ],
  },
  {
    id: "doc-transactions",
    title: "Systeme de Transactions",
    slug: "transactions",
    icon: "ArrowLeftRight",
    lastUpdated: "2025-12-10",
    version: "2.1.0",
    sections: [
      {
        id: "doc-tx-s1",
        title: "Types de transactions",
        order: 1,
        content:
          "Le systeme VITA reconnait cinq types de transactions :\n\n- **Emission** : credit quotidien automatique de 1 Ѵ (from: systeme, to: utilisateur)\n- **Transfer** : envoi d'un utilisateur a un autre\n- **Credit** : pret accorde par le systeme\n- **Repayment** : remboursement d'un pret\n- **Common Fund** : contribution au pot commun (prelevee automatiquement)\n\nChaque transaction est atomique, signee cryptographiquement et enregistree dans le journal d'audit.",
      },
      {
        id: "doc-tx-s2",
        title: "Mecanisme de contribution",
        order: 2,
        content:
          "A chaque transfert entre utilisateurs, un pourcentage (actuellement 2%) est automatiquement preleve pour le pot commun. Ce mecanisme finance les projets collectifs votes en Agora.\n\nExemple : si Alice envoie 100 Ѵ a Bob, le systeme preleve 2 Ѵ pour le pot commun. Bob recoit 98 Ѵ. La contribution est enregistree comme une transaction separee de type 'common_fund'.",
      },
      {
        id: "doc-tx-s3",
        title: "Validation et signature",
        order: 3,
        content:
          "Chaque transaction est signee avec la cle privee Ed25519 de l'emetteur. Le serveur verifie :\n\n1. Validite de la signature\n2. Solde suffisant (montant + contribution pot commun)\n3. Compte emetteur non suspendu\n4. Compte destinataire existant et actif\n5. Montant superieur a 0 et inferieur au solde\n\nLa transaction est ensuite ecrite dans la base avec un verrouillage optimiste pour eviter les conditions de course.",
      },
    ],
  },
  {
    id: "doc-offline",
    title: "Mode Offline",
    slug: "mode-offline",
    icon: "WifiOff",
    lastUpdated: "2025-10-20",
    version: "1.0.0",
    sections: [
      {
        id: "doc-off-s1",
        title: "Contexte et motivation",
        order: 1,
        content:
          "Le mode offline est essentiel pour l'adoption universelle de VITA. De nombreuses regions du monde n'ont pas un acces Internet permanent. Le mode offline permet des transactions limitees sans connexion, tout en maintenant les garanties de securite.\n\nLa priorite absolue est la prevention de la double depense. Le mode offline est donc soumis a des limites strictes.",
      },
      {
        id: "doc-off-s2",
        title: "Limites et mecanismes",
        order: 2,
        content:
          "Parametres actuels :\n- Montant max par transaction : 10 Ѵ\n- Nombre max de transactions : 5 avant synchronisation\n- Duree max en offline : 72 heures\n- Penalite de depassement : 0.1%/jour\n\nChaque transaction offline recoit un numero de sequence incremental. A la synchronisation, le serveur verifie l'integrite de la chaine. En cas de conflit (double depense detectee), la version serveur prevaut et le compte est marque pour audit.",
      },
    ],
  },
  {
    id: "doc-audit",
    title: "Audit Trail",
    slug: "audit-trail",
    icon: "FileSearch",
    lastUpdated: "2025-11-05",
    version: "1.3.0",
    sections: [
      {
        id: "doc-audit-s1",
        title: "Journal immutable",
        order: 1,
        content:
          "Toutes les actions du systeme VITA sont enregistrees dans un journal d'audit immutable. Chaque entree est chainee cryptographiquement avec la precedente via un hash SHA-256, rendant toute modification retroactive mathematiquement detectable.\n\nLe journal couvre : les transactions, les votes, les actions administratives, les changements de parametres, les verifications d'identite et les connexions.",
      },
      {
        id: "doc-audit-s2",
        title: "Structure d'une entree",
        order: 2,
        content:
          "Chaque entree d'audit contient :\n- `id` : identifiant unique UUID v7\n- `timestamp` : horodatage UTC en nanosecondes\n- `action_type` : type d'action (transaction, vote, admin, etc.)\n- `actor_id` : identifiant anonymise de l'auteur\n- `data` : payload chiffre de l'action\n- `previous_hash` : hash de l'entree precedente\n- `entry_hash` : SHA-256(timestamp + action_type + actor_id + data + previous_hash)\n\nLa chaine de hachage garantit l'integrite de l'historique complet.",
      },
    ],
  },
  {
    id: "doc-crypto",
    title: "Cryptographie",
    slug: "cryptographie",
    icon: "Key",
    lastUpdated: "2025-09-30",
    version: "1.1.0",
    sections: [
      {
        id: "doc-crypto-s1",
        title: "Algorithmes utilises",
        order: 1,
        content:
          "VITA utilise une pile cryptographique moderne et eprouvee :\n\n- **Signatures** : Ed25519 (courbe edwards25519) — rapide, securise, deterministe\n- **Hachage** : SHA-256 pour les chaines d'audit, BLAKE3 pour les hachages rapides\n- **Chiffrement** : AES-256-GCM pour les donnees au repos\n- **ZK-Proofs** : Groth16 sur BN254 pour la verification d'identite\n- **Derivation de cles** : Argon2id pour les mots de passe\n\nToutes les implementations sont fournies par des bibliotheques auditees (ring, ed25519-dalek, bellman).",
      },
      {
        id: "doc-crypto-s2",
        title: "Gestion des cles",
        order: 2,
        content:
          "Chaque utilisateur possede une paire de cles Ed25519 generee localement. La cle privee ne quitte jamais l'appareil de l'utilisateur. La cle publique est enregistree sur le serveur lors de la creation du compte.\n\nEn cas de perte de l'appareil, un mecanisme de recuperation base sur un secret partage (Shamir's Secret Sharing) permet de restaurer l'acces avec 3 fragments sur 5.",
      },
    ],
  },
  {
    id: "doc-api",
    title: "API REST",
    slug: "api-rest",
    icon: "Globe",
    lastUpdated: "2025-12-15",
    version: "1.4.0",
    sections: [
      {
        id: "doc-api-s1",
        title: "Architecture",
        order: 1,
        content:
          "L'API REST VITA est implementee en Rust avec le framework Actix-web 4.x. Elle est accessible sur `http://localhost:8080/api/v1` en developpement.\n\nL'authentification utilise des tokens JWT Bearer avec une duree de validite de 24 heures. Les endpoints sensibles requierent une signature Ed25519 supplementaire.\n\nTous les endpoints retournent du JSON. Les erreurs suivent le format `{ error: string, code: string }`.",
      },
      {
        id: "doc-api-s2",
        title: "Endpoints principaux",
        order: 2,
        content:
          "**Comptes**\n- `POST /api/v1/accounts` — Creer un compte\n- `GET /api/v1/accounts/:id` — Consulter un compte\n- `POST /api/v1/accounts/:id/verify` — Verifier l'identite\n\n**Transactions**\n- `POST /api/v1/transactions/transfer` — Effectuer un transfert\n- `GET /api/v1/transactions/:id` — Consulter une transaction\n- `GET /api/v1/accounts/:id/transactions` — Historique\n\n**Emissions**\n- `POST /api/v1/emissions/claim` — Reclamer l'emission du jour\n- `POST /api/v1/emissions/batch` — Emission batch (admin)\n\n**Codex**\n- `GET /api/v1/codex/titles` — Liste des titres\n- `GET /api/v1/codex/articles/:number` — Consulter un article\n- `POST /api/v1/codex/amendments` — Proposer un amendement",
      },
    ],
  },
  {
    id: "doc-vote",
    title: "Mecanismes de Vote",
    slug: "systeme-vote",
    icon: "Vote",
    lastUpdated: "2025-11-25",
    version: "2.0.0",
    sections: [
      {
        id: "doc-vote-s1",
        title: "Principes fondamentaux",
        order: 1,
        content:
          "Le vote dans VITA suit le principe '1 personne = 1 voix'. Chaque citoyen verifie dispose d'un droit de vote egal, independamment de son solde, de son anciennete ou de son statut social.\n\nLes options de vote sont : Pour, Contre, Abstention. L'abstention compte pour le quorum mais pas pour le calcul du pourcentage d'adoption.\n\n$$WARNING$$ Seuls les citoyens verifies ayant depasse le delai de carence (7 jours) peuvent voter. Les comptes suspendus, les observateurs et les nouveaux inscrits en periode de carence n'ont pas le droit de vote. $$END$$",
      },
      {
        id: "doc-vote-s2",
        title: "Types de propositions et seuils",
        order: 2,
        content:
          "Le systeme distingue plusieurs types de propositions, chacun avec ses propres exigences :\n\n| Type | Quorum | Seuil | Duree de vote | Cosignatures |\n|---|---|---|---|---|\n| Proposition standard | 25% | 60% | 14 jours | 50 |\n| Modification de parametre de gouvernance | 30% | 66% | 14 jours | 50 |\n| Modification constitutionnelle | 40% | 75% | 30 jours | 200 |\n| Modification de parametre technique | 25% | 60% | 14 jours | 50 |\n| Election d'administrateur | 30% | 50%+1 | 21 jours | 100 |\n\n$$FORMULA$$ Adoption = \\frac{Votes_{pour}}{Votes_{pour} + Votes_{contre}} \\geq Seuil $$END$$\n\nNote : les abstentions ne comptent pas dans le calcul du pourcentage mais comptent pour le quorum.\n\n$$FORMULA$$ Quorum = \\frac{Votes_{pour} + Votes_{contre} + Abstentions}{N_{citoyens\\_eligibles}} \\geq Seuil_{quorum} $$END$$",
      },
      {
        id: "doc-vote-s3",
        title: "Cycle de vie d'une proposition",
        order: 3,
        content:
          "Chaque proposition traverse 6 etapes obligatoires :\n\n**1. Soumission** — Un citoyen redige sa proposition avec une justification detaillee. La proposition recoit un identifiant unique (prop-agora-XXX).\n\n**2. Cosignatures** — 50 citoyens (parametre configurable) doivent cosigner pour valider la proposition. Ce mecanisme filtre les propositions non serieuses.\n\n**3. Deliberation** — 7 jours de debat obligatoire. Les citoyens peuvent commenter, proposer des amendements, et le porteur de la proposition peut la modifier.\n\n**4. Vote** — 14 jours de vote ouvert. Chaque citoyen peut voter Pour, Contre ou Abstention. Le vote est modifiable pendant toute la duree.\n\n**5. Depouillement** — Calcul automatique et transparent. Le resultat est publie immediatement avec le detail des votes.\n\n**6. Application** — Si adoptee, les administrateurs elus executent la decision dans un delai de 7 jours. L'execution est tracee dans le registre.\n\n$$CODE$$\nenum ProposalStatus {\n    Draft,          // Brouillon en cours de redaction\n    Cosigning,      // En collecte de cosignatures\n    Deliberation,   // Periode de debat\n    Voting,         // Vote ouvert\n    Adopted,        // Adoptee — en attente d'application\n    Rejected,       // Rejetee (quorum ou seuil non atteint)\n    Applied,        // Executee et effective\n    Appeal,         // Contestation en cours\n}\n$$END$$",
      },
      {
        id: "doc-vote-s4",
        title: "Delegation de vote",
        order: 4,
        content:
          "Un citoyen peut deleguer son droit de vote a un delegue de confiance. La delegation est :\n\n- **Revocable** a tout moment, meme pendant un vote en cours\n- **Specifique** a un domaine (economie, environnement, securite, etc.) ou generale\n- **Limitee** : un delegue ne peut accumuler plus de 100 delegations (parametre configurable)\n- **Transparente** : le nombre de delegations est visible, mais pas l'identite des delegants\n\nSi le delegue ne vote pas, la delegation est sans effet pour ce vote specifique. Le delegant peut toujours voter directement, ce qui annule la delegation pour ce vote.\n\n$$WARNING$$ La delegation de vote n'est pas transitive : si A delegue a B et B delegue a C, les votes de A ne sont pas delegues a C. $$END$$",
      },
      {
        id: "doc-vote-s5",
        title: "Contestation et appel",
        order: 5,
        content:
          "Un vote peut etre conteste dans les 7 jours suivant le depouillement si :\n- Une irregularite technique est detectee (bug, manipulation)\n- Le quorum a ete atteint par des comptes frauduleux\n- La proposition viole un principe constitutionnel immuable\n\nLa contestation est examinee par un comite d'auditeurs elus. Si la contestation est validee, le vote est annule et peut etre relance apres correction.",
      },
    ],
  },
  {
    id: "doc-valorisation",
    title: "Valorisation des Services",
    slug: "valorisation",
    icon: "Calculator",
    lastUpdated: "2025-10-10",
    version: "0.8.0",
    sections: [
      {
        id: "doc-val-s1",
        title: "Formule de base",
        order: 1,
        content:
          "La valorisation d'un service en VITA suit la formule :\n\n`Valeur = Temps × Coefficient_Base × Modificateurs + Cout_Materiaux`\n\nLe coefficient de base est determine par la nature du travail. Les modificateurs ajustent pour les conditions specifiques (urgence, penibilite, horaires, responsabilite).",
      },
      {
        id: "doc-val-s2",
        title: "Coefficients et modificateurs",
        order: 2,
        content:
          "**Coefficients de base** (indicatifs, definis par vote collectif) :\n- Travail standard : 1.0\n- Travail qualifie : 1.2 - 1.5\n- Travail penible/dangereux : 1.3 - 1.8\n- Expertise rare : 1.5 - 2.0\n- Formation longue requise : 1.4 - 2.0\n\n**Modificateurs contextuels** :\n- Urgence : x1.1 a x1.3\n- Nuit/Weekend : x1.2\n- Conditions difficiles : x1.1 a x1.5\n- Responsabilite elevee : x1.2\n\nCes valeurs sont definies et ajustees par vote collectif dans l'Agora.",
      },
    ],
  },
  {
    id: "doc-roles",
    title: "Roles et Permissions",
    slug: "roles-permissions",
    icon: "Users",
    lastUpdated: "2025-12-10",
    version: "1.5.0",
    sections: [
      {
        id: "doc-roles-s1",
        title: "Hierarchie des roles",
        order: 1,
        content:
          "Le systeme VITA definit 10 niveaux de roles, du plus privilegie au moins privilegie. Chaque role est attribue par election collective ou automatiquement par le systeme.\n\n| Niveau | Role | Obtention |\n|---|---|---|\n| 10 | Dieu (Fondateur) | Attribue a la creation du systeme, non reproductible |\n| 9 | Super-administrateur | Election speciale, quorum 40%, seuil 75% |\n| 8 | Administrateur | Election standard, quorum 30%, seuil 60% |\n| 7 | Moderateur | Election standard, quorum 25%, seuil 60% |\n| 6 | Auditeur | Election standard, quorum 30%, seuil 60% |\n| 5 | Delegue | Automatique : 10+ delegations de vote recues |\n| 4 | Citoyen | Automatique : identite verifiee + delai de carence ecoule |\n| 3 | Nouveau | Automatique : identite verifiee, en periode de carence |\n| 2 | Observateur | Automatique : compte cree, identite non verifiee |\n| 1 | Suspendu | Decision administrative apres audit |\n\n$$WARNING$$ Le role 'Dieu' est un role de fondateur avec acces total. Il ne peut pas etre attribue par vote. Il est prevu pour la phase de lancement uniquement et sera deprecie quand le systeme sera mature. $$END$$",
      },
      {
        id: "doc-roles-s2",
        title: "Matrice des permissions",
        order: 2,
        content:
          "Chaque role dispose d'un ensemble de permissions specifiques. Les permissions s'accumulent de bas en haut (un administrateur a toutes les permissions d'un moderateur, etc.).\n\n**Permissions de base** (Observateur et au-dessus) :\n- `view_panorama` — Consulter le dashboard public\n- `view_codex` — Lire la Constitution et les lois\n\n**Permissions Citoyen** :\n- `send_vita` — Envoyer des VITA\n- `receive_vita` — Recevoir des VITA\n- `view_balance` — Consulter son solde\n- `view_history` — Voir son historique de transactions\n- `vote_proposal` — Voter sur les propositions\n- `create_proposal` — Creer une proposition\n- `cosign_proposal` — Cosigner une proposition\n- `delegate_vote` — Deleguer son vote\n- `view_agora` — Acceder a l'Agora\n\n**Permissions Moderateur** :\n- `moderate_content` — Moderer les commentaires\n- `flag_user` — Signaler un utilisateur\n- `view_reports` — Consulter les signalements\n\n**Permissions Administrateur** :\n- `modify_parameters` — Proposer des modifications de parametres\n- `execute_vote_result` — Appliquer les resultats de vote\n- `suspend_account` — Suspendre un compte (max 30 jours)\n- `view_audit_log` — Consulter le journal d'audit\n- `manage_forge` — Gerer les projets de la Forge\n- `create_branch` — Creer des branches legislatives\n\n**Permissions Super-administrateur** :\n- `emergency_stop` — Participer a l'arret d'urgence (multi-sig 3/5)\n- `manage_admins` — Gerer les roles d'administrateurs\n\n**Permissions Dieu** :\n- `simulate_role` — Simuler n'importe quel role\n- `access_dev_tools` — Acceder aux outils de developpement\n- `all` — Acces total au systeme",
      },
      {
        id: "doc-roles-s3",
        title: "Processus d'election",
        order: 3,
        content:
          "Les roles electifs (Super-admin, Admin, Moderateur, Auditeur) sont attribues par vote collectif :\n\n$$CODE$$\nstruct ElectionProposal {\n    candidate_id: Uuid,\n    role: ElectedRole,\n    mandate_duration: Duration,  // defaut: 180 jours\n    platform: String,            // programme du candidat\n    endorsements: Vec<Uuid>,     // soutiens de citoyens\n}\n$$END$$\n\n**Etapes d'une election** :\n1. Un citoyen se porte candidat et publie son programme\n2. Periode de candidature : 14 jours\n3. Periode de vote : 21 jours\n4. Le candidat avec le plus de voix est elu (scrutin uninominal)\n5. Mandat de 180 jours (parametre configurable)\n6. Possibilite de motion de censure (quorum 30%, seuil 66%)\n\n$$WARNING$$ Un administrateur ne peut pas se suspendre lui-meme ni modifier son propre role. Les actions sur soi-meme sont interdites pour eviter les abus. $$END$$",
      },
      {
        id: "doc-roles-s4",
        title: "Suspension et reinsertion",
        order: 4,
        content:
          "Un compte peut etre suspendu par un administrateur pour les raisons suivantes :\n- Tentative de fraude (double compte, double depense)\n- Violation des regles de la communaute\n- Comportement abusif repete\n\nLa suspension est limitee a 30 jours maximum (parametre configurable). Au-dela, une revue obligatoire par un comite d'auditeurs est requise.\n\nPendant la suspension :\n- L'emission quotidienne est interrompue\n- Les transferts sont bloques\n- Le solde est preserve (non-destructibilite constitutionnelle)\n- Le droit de vote est suspendu\n\nApres la suspension, le compte retrouve automatiquement le role 'Citoyen'. Les jours de suspension ne generent aucune emission retroactive.",
      },
    ],
  },
  {
    id: "doc-population",
    title: "Donnees Population Mondiale",
    slug: "population-mondiale",
    icon: "Globe",
    lastUpdated: "2025-12-01",
    version: "1.0.0",
    sections: [
      {
        id: "doc-pop-s1",
        title: "Sources de donnees",
        order: 1,
        content:
          "VITA utilise des donnees de population mondiale provenant de sources officielles pour calculer le taux de couverture et l'indice d'egalite :\n\n- **Nations Unies** : World Population Prospects (revision annuelle)\n- **Banque Mondiale** : World Development Indicators\n- **CIA World Factbook** : donnees complementaires\n\nLes donnees sont mises a jour trimestriellement et la source est verifiable publiquement.",
      },
      {
        id: "doc-pop-s2",
        title: "Indicateurs calcules",
        order: 2,
        content:
          "A partir des donnees de population et du nombre d'utilisateurs verifies, le systeme calcule :\n\n- **Taux de couverture** : nb_utilisateurs_verifies / population_mondiale\n- **Masse monetaire theorique** : somme des jours-personnes verifies\n- **Indice de Gini VITA** : mesure de l'egalite de distribution des soldes\n- **Repartition geographique** : utilisateurs par pays/region\n\nCes indicateurs sont affiches sur le dashboard Panorama et mis a jour en temps reel.",
      },
    ],
  },
];

// ============================================================
// REGISTRE DES MODIFICATIONS — historique des changements
// ============================================================

export const REGISTER_ENTRIES: RegisterEntry[] = [
  {
    id: "reg-001",
    date: "2025-01-01",
    type: "constitutionnel",
    title: "Adoption de la Constitution VITA",
    description:
      "Adoption initiale de la Constitution VITA comprenant 5 Titres et 25 Articles fondateurs. Etablissement des principes immuables du systeme.",
    status: "applied",
    author: "Assemblee fondatrice",
  },
  {
    id: "reg-002",
    date: "2025-03-15",
    type: "legislatif",
    title: "LOI-2025-001 : Verification d'identite",
    description:
      "Adoption de la loi definissant les modalites de verification d'identite par Zero-Knowledge Proofs. Definit les criteres d'eligibilite, la procedure de verification et les cas de re-verification.",
    proposalId: "prop-agora-012",
    voteResult: { pour: 4520, contre: 890, participation: 34.2 },
    status: "applied",
    author: "usr-001-dieu",
  },
  {
    id: "reg-003",
    date: "2025-04-20",
    type: "legislatif",
    title: "LOI-2025-002 : Transactions et echanges",
    description:
      "Adoption de la loi encadrant les transactions VITA : types autorises, limites, contribution au pot commun, transactions offline.",
    proposalId: "prop-agora-018",
    voteResult: { pour: 3890, contre: 1230, participation: 29.8 },
    status: "applied",
    author: "usr-003-moderateur",
  },
  {
    id: "reg-004",
    date: "2025-06-10",
    type: "legislatif",
    title: "LOI-2025-003 : Valorisation des services",
    description:
      "Adoption de la loi definissant le cadre de valorisation des services en VITA. Coefficients de base, modificateurs contextuels, mecanisme d'ajustement par vote.",
    proposalId: "prop-agora-025",
    voteResult: { pour: 3210, contre: 1890, participation: 27.1 },
    status: "applied",
    author: "usr-002-citoyen",
  },
  {
    id: "reg-005",
    date: "2025-08-10",
    type: "parametre",
    title: "Modification : Precision decimale (4 -> 2)",
    description:
      "Reduction de la precision d'affichage de 4 a 2 decimales. La precision interne reste a 8 decimales pour les calculs.",
    proposalId: "prop-agora-035",
    voteResult: { pour: 4210, contre: 1890, participation: 26.8 },
    status: "applied",
    author: "usr-005-auditeur",
    diff: {
      before: "precision_decimale = 4",
      after: "precision_decimale = 2",
    },
  },
  {
    id: "reg-006",
    date: "2025-09-15",
    type: "parametre",
    title: "Modification : Duree de vote (7j -> 14j)",
    description:
      "Extension de la duree de vote standard de 7 a 14 jours pour permettre une meilleure participation internationale.",
    proposalId: "prop-agora-042",
    voteResult: { pour: 3842, contre: 1256, participation: 28.4 },
    status: "applied",
    author: "usr-002-citoyen",
    diff: {
      before: "duree_vote_standard = 7 jours",
      after: "duree_vote_standard = 14 jours",
    },
  },
  {
    id: "reg-007",
    date: "2025-10-05",
    type: "technique",
    title: "Mise a jour : Protocole ZKP v0.9",
    description:
      "Migration du circuit ZK-SNARK de Groth16 vers PLONK pour les nouvelles verifications, avec retro-compatibilite. Amelioration des performances de generation de preuve de 40%.",
    status: "applied",
    author: "Equipe technique",
  },
  {
    id: "reg-008",
    date: "2025-11-20",
    type: "parametre",
    title: "Modification : Contribution pot commun (1% -> 2%)",
    description:
      "Augmentation de la contribution au pot commun de 1% a 2% pour financer les projets collectifs environnementaux.",
    proposalId: "prop-agora-089",
    voteResult: { pour: 5120, contre: 2340, participation: 32.1 },
    status: "applied",
    author: "usr-003-moderateur",
    diff: {
      before: "contribution_pot_commun = 1%",
      after: "contribution_pot_commun = 2%",
    },
  },
  {
    id: "reg-009",
    date: "2025-12-01",
    type: "constitutionnel",
    title: "Amendement propose : Article 12 — Droit a l'oubli",
    description:
      "Proposition d'ajout d'un Article 12 au Titre II sur le droit a l'oubli partiel des transactions anciennes (>5 ans). En cours de deliberation.",
    proposalId: "prop-agora-102",
    status: "proposed",
    author: "usr-002-citoyen",
  },
  {
    id: "reg-010",
    date: "2025-12-10",
    type: "parametre",
    title: "Proposition rejetee : Quorum a 15%",
    description:
      "Proposition de reduction du quorum standard de 25% a 15%. Rejetee par vote : le seuil de 60% d'approbation n'a pas ete atteint.",
    proposalId: "prop-agora-108",
    voteResult: { pour: 2100, contre: 3800, participation: 31.5 },
    status: "rejected",
    author: "usr-004-nouveau",
    diff: {
      before: "quorum_standard = 25%",
      after: "quorum_standard = 15%",
    },
  },
];

// ============================================================
// HELPERS
// ============================================================

export function getTechnicalDoc(slug: string): TechnicalDoc | undefined {
  return TECHNICAL_DOCS.find((doc) => doc.slug === slug);
}

export function getRegisterEntriesByType(type: RegisterEntry["type"]): RegisterEntry[] {
  return REGISTER_ENTRIES.filter((entry) => entry.type === type);
}

export function getRecentRegisterEntries(count: number): RegisterEntry[] {
  return [...REGISTER_ENTRIES]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, count);
}
