-- VITA Platform — Constitution seed data
-- This inserts the full founding Constitution of VITA.

-- ═══════════════════════════════════════════════════════════════════
-- TITRES
-- ═══════════════════════════════════════════════════════════════════

INSERT INTO codex_titles (number, name, description, display_order) VALUES
('I',    'Fondements',               'Les principes fondateurs et immuables du système VITA.', 1),
('II',   'La monnaie',               'Les règles gouvernant la création, la circulation et la valorisation du VITA.', 2),
('III',  'Identité et privacy',      'Les mécanismes de vérification d''identité et de protection de la vie privée.', 3),
('IV',   'Gouvernance',              'Les institutions et processus de décision collective du système VITA.', 4),
('V',    'Économie collective',      'Les mécanismes de solidarité, de crédit et d''épargne du système.', 5),
('VI',   'Architecture technique',   'Les principes techniques garantissant la sécurité et la transparence du système.', 6),
('VII',  'Dispositions transitoires', 'Les étapes de déploiement et de décentralisation progressive du système.', 7);

-- ═══════════════════════════════════════════════════════════════════
-- TITRE I — FONDEMENTS (Articles 1-3, tous immuables)
-- ═══════════════════════════════════════════════════════════════════

INSERT INTO codex_articles (title_id, number, name, content, rationale, immutable) VALUES

((SELECT id FROM codex_titles WHERE number = 'I'), 1, 'Nature et vocation',
'Le VITA (Ѵ) est un système monétaire universel fondé sur l''existence humaine. Contrairement aux monnaies traditionnelles, dont la valeur dérive du travail, du capital ou de la confiance en un État, le VITA tire sa valeur d''un fait objectif et inaliénable : chaque être humain existe, et cette existence a une valeur intrinsèque.

Le système VITA poursuit trois objectifs fondamentaux :

Premièrement, garantir à chaque personne un revenu monétaire minimal et inconditionnel, lié à sa seule existence. Ce revenu n''est pas une allocation, une aide ou une subvention : c''est la reconnaissance monétaire d''un droit humain fondamental.

Deuxièmement, créer un système économique où la valeur est distribuée de manière juste dès sa création, plutôt que redistribuée après coup par des mécanismes correctifs imparfaits.

Troisièmement, établir un cadre de gouvernance véritablement démocratique, où les règles du système sont décidées collectivement par ceux qui y participent, selon le principe d''une personne, une voix.',
'Le VITA repose sur le postulat philosophique que l''existence humaine a une valeur intrinsèque qui précède toute contribution économique. Les systèmes monétaires existants échouent à reconnaître cette valeur fondamentale, créant des inégalités structurelles dès la naissance. En ancrant la création monétaire à l''existence plutôt qu''au capital, le VITA propose une alternative radicale mais cohérente.', true),

((SELECT id FROM codex_titles WHERE number = 'I'), 2, 'La force de vie',
'Le concept de « force de vie » (vita, en latin) constitue le fondement philosophique du système. Il désigne la qualité commune à tous les êtres humains : le fait d''être vivant, conscient et participant au monde.

La force de vie n''est pas une métrique individuelle. Elle ne mesure pas la productivité, l''intelligence, la santé ou l''utilité sociale d''une personne. Elle est binaire : soit un être humain existe, soit il n''existe pas. Cette binarité est essentielle car elle interdit toute hiérarchisation de la valeur des personnes.

Le système VITA ne récompense pas les individus pour ce qu''ils font, mais reconnaît ce qu''ils sont. Toute personne vivante, quels que soient son âge, ses capacités, son lieu de naissance ou sa situation sociale, possède la même force de vie et reçoit donc la même émission monétaire quotidienne.

La force de vie est le premier principe du système. Aucune loi, aucun vote, aucune circonstance ne peut modifier cette égalité fondamentale.',
'Ce concept emprunte aux traditions philosophiques de la dignité humaine universelle (Kant, Déclaration universelle des droits de l''homme) tout en les traduisant dans un mécanisme économique concret. La binarité de la force de vie protège le système contre toute dérive eugéniste, méritocratique ou utilitariste.', true),

((SELECT id FROM codex_titles WHERE number = 'I'), 3, 'Les quatre paramètres immuables',
'Les paramètres suivants constituent le socle constitutionnel du VITA. Ils ne peuvent être modifiés par aucun vote, aucune majorité, aucune circonstance. Ils sont encodés dans le protocole lui-même et tout code qui les violerait serait rejeté par le réseau.

Premier paramètre : UNE PERSONNE, UN VITA PAR JOUR. Chaque être humain vérifié reçoit exactement 1 Ѵ par période de 24 heures (calculée en UTC). Ce montant est identique pour tous, partout, sans exception. Il ne peut être ni augmenté ni diminué.

Deuxième paramètre : NON-RÉTROACTIVITÉ ABSOLUE. Aucune émission ne peut être effectuée pour des jours passés. Un utilisateur qui rejoint le système le jour J commence avec un solde de 0 Ѵ. Il n''existe aucun mécanisme de rattrapage, de compensation ou d''émission rétroactive. Ce paramètre garantit l''égalité temporelle : personne ne peut accumuler un avantage de « premier arrivé ».

Troisième paramètre : CONFIDENTIALITÉ DES TRANSACTIONS. Les transactions entre utilisateurs sont cryptographiquement protégées. Le montant, l''expéditeur et le destinataire d''une transaction ne sont visibles que par les parties concernées. Le système utilise des preuves à divulgation nulle (zero-knowledge proofs) pour valider les transactions sans révéler leur contenu.

Quatrième paramètre : UNICITÉ DE L''IDENTITÉ. Chaque être humain ne peut posséder qu''un seul compte VITA. Ce paramètre est garanti par un mécanisme de preuve de personnalité (proof of personhood) basé sur des preuves à divulgation nulle. L''identité civile de l''utilisateur n''est jamais collectée ni stockée : seul un engagement cryptographique (commitment) atteste de son unicité.',
'Ces quatre paramètres forment un ensemble cohérent et minimal. Le premier (1 Ѵ/jour) établit l''égalité de création monétaire. Le deuxième (non-rétroactivité) empêche l''accumulation d''avantages temporels. Le troisième (confidentialité) protège la liberté individuelle. Le quatrième (unicité) empêche la fraude systémique. Retirer ou modifier l''un de ces paramètres compromettrait l''intégrité de l''ensemble du système.', true);

-- ═══════════════════════════════════════════════════════════════════
-- TITRE II — LA MONNAIE (Articles 4-7)
-- ═══════════════════════════════════════════════════════════════════

INSERT INTO codex_articles (title_id, number, name, content, rationale, immutable) VALUES

((SELECT id FROM codex_titles WHERE number = 'II'), 4, 'Émission quotidienne',
'L''émission monétaire du VITA suit un processus automatisé et immuable. Chaque jour, à 00:00 UTC, le système génère exactement 1 Ѵ pour chaque compte dont le statut de vérification est actif.

L''émission est un processus créateur : les VITA émis ne proviennent pas d''un stock préexistant, ils sont créés ex nihilo par le protocole. La masse monétaire totale du système est donc égale, à tout instant, à la somme des jours vécus par tous les utilisateurs vérifiés depuis leur inscription.

Un utilisateur dont la vérification est suspendue (par exemple pour re-vérification périodique) ne reçoit pas d''émission pendant la période de suspension. Les émissions manquées ne sont pas rattrapées.

Le processus d''émission est atomique : pour chaque compte éligible, une transaction de type « émission » est créée, le solde est incrémenté de 1 Ѵ, et l''opération est enregistrée dans le journal d''émission. La contrainte d''unicité (compte, date) empêche toute double émission.',
'L''émission quotidienne est le mécanisme central du VITA. Son automatisation garantit qu''aucun intermédiaire ne peut contrôler ou conditionner l''accès à la création monétaire. Son caractère immuable (1 Ѵ, pas plus, pas moins) protège contre l''inflation arbitraire et la déflation contrôlée.', true),

((SELECT id FROM codex_titles WHERE number = 'II'), 5, 'Unité de compte',
'L''unité de compte du système est le VITA, symbolisé par la lettre Ѵ (lettre cyrillique majuscule IZHITSA, point de code Unicode U+0474). Les sous-unités sont exprimées en notation décimale avec une précision maximale de 8 chiffres après la virgule.

Tous les montants dans le système sont représentés en arithmétique décimale à précision fixe (DECIMAL(20,8) dans la base de données, rust_decimal en mémoire). L''utilisation de nombres à virgule flottante (float, double) est formellement interdite pour toute opération monétaire.

Un VITA représente la valeur de l''existence d''une personne pendant un jour. Cette définition ancre la monnaie dans une réalité humaine mesurable et universelle, contrairement aux monnaies indexées sur des matières premières ou sur la confiance institutionnelle.',
'Le choix d''une précision de 8 décimales permet des micro-transactions tout en restant dans les limites de l''arithmétique décimale exacte. L''interdiction des flottants est une mesure de sécurité financière : les erreurs d''arrondi des flottants peuvent créer ou détruire de la valeur, ce qui est inacceptable dans un système monétaire.', false),

((SELECT id FROM codex_titles WHERE number = 'II'), 6, 'Interdiction de la spéculation',
'Le VITA ne peut être échangé sur aucun marché financier, bourse de valeurs, plateforme d''échange de crypto-monnaies ou tout autre mécanisme permettant la spéculation sur sa valeur.

Le taux de change du VITA par rapport aux autres monnaies est déterminé par les échanges réels de biens et de services, et non par des mécanismes de marché spéculatifs. Aucun produit dérivé (futures, options, swaps) ne peut être créé à partir du VITA.

Les transferts entre comptes VITA sont limités à des échanges de biens, de services ou de dons entre personnes. Le système surveille les patterns de transactions anormaux (transferts circulaires, volumes inhabituels, structures en cascade) susceptibles d''indiquer une tentative de manipulation ou de spéculation.',
'La spéculation financière est le principal mécanisme par lequel les inégalités monétaires s''amplifient. En interdisant la spéculation, le VITA protège sa fonction première : servir d''unité de mesure stable pour les échanges humains. Cette interdiction est modifiable car les mécanismes de détection et de prévention doivent évoluer avec les technologies.', false),

((SELECT id FROM codex_titles WHERE number = 'II'), 7, 'Valorisation des services',
'La valeur en VITA d''un service ou d''un travail est calculée selon la formule constitutionnelle suivante :

V = T × (1 + F + P + R + L) + M

Où :
- T (Temps) : durée du travail exprimée en fraction de journée (heures / 16 heures d''activité). Une journée complète de travail (16 heures) correspond à 1 Ѵ de base.
- F (Formation) : coefficient reflétant le niveau de formation requis (0 à 1). Une formation courte correspond à ~0.2, une formation longue et spécialisée à ~0.8.
- P (Pénibilité) : coefficient reflétant la difficulté physique ou psychologique du travail (0 à 1).
- R (Responsabilité) : coefficient reflétant le niveau de responsabilité exercé (0 à 1).
- L (Rareté) : coefficient reflétant la rareté de la compétence sur le marché (0 à 1).
- M (Matériaux) : coût des matériaux consommés, exprimé directement en Ѵ.

Les coefficients F, P, R et L sont plafonnés individuellement à 1.0 et collectivement à 3.0, ce qui signifie que le multiplicateur total (1 + F + P + R + L) ne peut excéder 4.0. Un service ne peut donc jamais être valorisé à plus de 4 fois sa valeur temporelle de base, plus les matériaux.

Les valeurs de référence des coefficients pour chaque métier et chaque type de service sont définies par vote collectif dans l''Agora et publiées dans un barème public.',
'Cette formule établit un lien direct entre le temps humain et la valeur monétaire, tout en permettant des ajustements pour les compétences, la pénibilité et la responsabilité. Le plafond du multiplicateur à 4.0 garantit que les écarts de rémunération restent dans un ratio maximal de 1 à 4, réduisant drastiquement les inégalités salariales tout en reconnaissant les différences de contribution.', false);

-- ═══════════════════════════════════════════════════════════════════
-- TITRE III — IDENTITÉ ET PRIVACY (Articles 8-10)
-- ═══════════════════════════════════════════════════════════════════

INSERT INTO codex_articles (title_id, number, name, content, rationale, immutable) VALUES

((SELECT id FROM codex_titles WHERE number = 'III'), 8, 'Preuve de personnalité',
'Chaque utilisateur du système VITA doit prouver qu''il est un être humain unique, sans révéler son identité civile. Ce mécanisme, appelé « preuve de personnalité » (zero-knowledge proof of identity, zk-PoI), constitue le bouclier anti-fraude fondamental du système.

La preuve de personnalité fonctionne en trois étapes. Premièrement, l''utilisateur génère localement une paire de clés cryptographiques (clé privée / clé publique Ed25519). Cette clé ne quitte jamais son appareil. Deuxièmement, l''utilisateur effectue un processus de vérification qui produit un engagement cryptographique (Pedersen commitment) attestant de son unicité. Troisièmement, lors de chaque interaction avec le système, l''utilisateur fournit une preuve à divulgation nulle démontrant qu''il possède un engagement valide, sans révéler lequel.

La re-vérification périodique (preuve de vie) est requise tous les 90 jours par défaut. Cette période est un paramètre configurable par vote collectif. Un utilisateur dont la preuve de vie a expiré voit son émission suspendue jusqu''à re-vérification.',
'La preuve de personnalité résout le dilemme fondamental entre vérification d''identité et protection de la vie privée. Les systèmes traditionnels (KYC, pièces d''identité) collectent des données personnelles sensibles. Le zk-PoI garantit la même sécurité sans aucune collecte de données, en utilisant les propriétés mathématiques des preuves à divulgation nulle.', false),

((SELECT id FROM codex_titles WHERE number = 'III'), 9, 'Transactions confidentielles',
'Toutes les transactions entre utilisateurs VITA sont cryptographiquement confidentielles. Le montant transféré, l''identité de l''expéditeur et l''identité du destinataire ne sont visibles que par les parties concernées.

La confidentialité est assurée par deux mécanismes complémentaires. D''une part, les engagements de Pedersen (Pedersen commitments) masquent les montants tout en permettant la vérification de leur validité (le montant est positif et l''expéditeur possède les fonds suffisants). D''autre part, les preuves de portée (range proofs via Bulletproofs) garantissent que les montants cachés sont dans une plage valide, sans révéler leur valeur exacte.

Le système peut vérifier qu''une transaction est valide (pas de création de monnaie, pas de solde négatif) sans jamais voir les montants réels. C''est la propriété fondamentale des transactions confidentielles : la vérification sans connaissance.',
'La confidentialité des transactions n''est pas un luxe mais une nécessité. Sans elle, les balances de chaque utilisateur seraient publiques, créant des risques de ciblage, de discrimination économique et de surveillance de masse. Les Pedersen commitments et Bulletproofs sont des primitives cryptographiques éprouvées, utilisées avec succès dans Monero et Mimblewimble.', false),

((SELECT id FROM codex_titles WHERE number = 'III'), 10, 'Supervision qualifiée',
'Dans des cas exceptionnels définis par la loi (fraude avérée, blanchiment d''argent, financement d''activités illicites), la confidentialité d''une transaction peut être levée par un mécanisme de supervision qualifiée.

Ce mécanisme utilise le chiffrement à seuil (threshold encryption) : la clé de déchiffrement est partagée entre N superviseurs élus, et un minimum de K superviseurs (K > N/2) doivent coopérer pour déchiffrer une transaction. Aucun superviseur seul ne peut accéder aux données.

La procédure de supervision requiert : une demande formelle motivée, un vote à la majorité qualifiée des superviseurs, la publication du hash de la demande dans un registre public, un délai de recours de 72 heures, et la notification de la personne concernée après la procédure.

Tout acte de supervision est enregistré de manière immuable dans le journal d''audit. Le nombre de supervisions est publié mensuellement dans un rapport de transparence.',
'Le chiffrement à seuil représente un compromis raisonnable entre confidentialité absolue et nécessité de supervision légale. Il garantit qu''aucun individu ne dispose du pouvoir de lever la confidentialité unilatéralement, tout en permettant une action collective contre les abus manifestes.', false);

-- ═══════════════════════════════════════════════════════════════════
-- TITRE IV — GOUVERNANCE (Articles 11-14)
-- ═══════════════════════════════════════════════════════════════════

INSERT INTO codex_articles (title_id, number, name, content, rationale, immutable) VALUES

((SELECT id FROM codex_titles WHERE number = 'IV'), 11, 'L''Agora',
'L''Agora est l''assemblée délibérative du système VITA. Chaque utilisateur vérifié dispose d''une voix égale, selon le principe strict d''une personne, une voix. Le vote est secret et vérifiable : chaque votant peut vérifier que son vote a été correctement comptabilisé sans que quiconque puisse identifier son choix.

L''Agora permet de soumettre, délibérer et voter sur des propositions de modification des paramètres configurables du système. Les paramètres immuables (Article 3) ne peuvent faire l''objet d''aucune proposition.

Les types de décisions soumises à l''Agora incluent : la modification des coefficients de valorisation (Article 7), l''ajustement des paramètres techniques (limites offline, taux du pot commun), l''élection des superviseurs et des administrateurs, et les amendements au présent Codex.

Le quorum minimum pour qu''un vote soit valide est de 10% des utilisateurs vérifiés actifs. La majorité requise est de 50% + 1 voix pour les décisions ordinaires, et de 67% pour les amendements constitutionnels.',
'Le modèle de l''Agora athénienne, adapté aux outils numériques, permet une démocratie directe à grande échelle. Le vote secret vérifiable (inspiré des protocoles de e-voting cryptographiques) garantit à la fois l''anonymat du vote et l''intégrité du résultat.', false),

((SELECT id FROM codex_titles WHERE number = 'IV'), 12, 'Le Codex',
'Le Codex est le présent document. Il constitue la loi fondamentale du système VITA. Il est divisé en Titres, chacun contenant des Articles numérotés.

Le Codex est un document vivant : ses articles modifiables peuvent être amendés par le processus défini à l''Article 14. Chaque modification est versionnée et l''historique complet des changements est publiquement accessible.

Le Codex est publié en texte clair, lisible par tous, et accessible depuis tout client VITA. Il est accompagné d''un exposé des motifs pour chaque article, expliquant la raison d''être de chaque règle.

Tout code source implémentant les règles du Codex doit être ouvert (Article 18) et tout utilisateur peut vérifier la conformité entre le code et le texte constitutionnel.',
'Un système de gouvernance nécessite un document fondateur clair, accessible et versionné. Le Codex remplit ce rôle en combinant les caractéristiques d''une constitution (stabilité, hiérarchie normative) avec celles d''un système de gestion de versions (traçabilité, historique, diffs).', false),

((SELECT id FROM codex_titles WHERE number = 'IV'), 13, 'La Forge',
'La Forge est le système de versionnement des propositions législatives. Inspiré des systèmes de gestion de versions logiciels (Git), elle permet de créer, modifier, comparer et fusionner des propositions de textes normatifs.

Chaque proposition d''amendement constitue une « branche » qui peut être discutée, modifiée et enrichie par les contributeurs. Les utilisateurs peuvent comparer les versions (diff), commenter des passages spécifiques, et co-signer des propositions.

Le processus de travail dans la Forge suit un cycle : rédaction → discussion → co-signatures → soumission à l''Agora → vote. Une proposition doit recueillir un nombre minimum de co-signatures (paramètre configurable, défaut : 100) avant de pouvoir être soumise au vote.',
'Les systèmes législatifs traditionnels sont opaques et centralisés. La Forge démocratise le processus en le rendant transparent, collaboratif et ouvert. L''analogie avec Git n''est pas fortuite : les bonnes pratiques de développement logiciel (revue par les pairs, historique complet, branches expérimentales) s''appliquent remarquablement bien à la rédaction normative.', false),

((SELECT id FROM codex_titles WHERE number = 'IV'), 14, 'Processus de modification',
'La modification d''un article du Codex suit un processus en cinq étapes :

Étape 1 — Rédaction. Un utilisateur vérifié rédige une proposition d''amendement dans la Forge. La proposition doit inclure le nouveau texte proposé, un exposé des motifs et un résumé des changements.

Étape 2 — Délibération. La proposition est ouverte à la discussion pendant une période minimale de 14 jours. Tout utilisateur vérifié peut commenter, suggérer des modifications et poser des questions.

Étape 3 — Co-signatures. L''auteur recueille les co-signatures d''autres utilisateurs vérifiés. Le seuil minimum est de 100 co-signatures (paramètre configurable).

Étape 4 — Vote. La proposition est soumise au vote de l''Agora pour une durée de 7 jours. La majorité requise est de 67% des votants, avec un quorum de 10% des utilisateurs vérifiés actifs.

Étape 5 — Entrée en vigueur. Si le vote est favorable, l''amendement entre en vigueur après un délai de recours de 48 heures. L''article modifié est mis à jour, une nouvelle version est créée dans l''historique, et l''ancienne version reste accessible.',
'Ce processus en cinq étapes est conçu pour être suffisamment rigoureux pour empêcher les modifications impulsives tout en restant accessible à tout utilisateur motivé. Les délais (14 jours de délibération, 7 jours de vote, 48 heures de recours) permettent une participation réfléchie.', false);

-- ═══════════════════════════════════════════════════════════════════
-- TITRE V — ÉCONOMIE COLLECTIVE (Articles 15-17)
-- ═══════════════════════════════════════════════════════════════════

INSERT INTO codex_articles (title_id, number, name, content, rationale, immutable) VALUES

((SELECT id FROM codex_titles WHERE number = 'V'), 15, 'Le pot commun',
'Un pourcentage de chaque transaction entre utilisateurs est automatiquement prélevé et versé dans le pot commun (fonds collectif). Ce taux est fixé à 5% par défaut et peut être modifié par vote collectif dans l''Agora, dans une fourchette de 1% à 15%.

Le pot commun finance les projets d''intérêt collectif : infrastructure du réseau, développement logiciel, projets communautaires, aide d''urgence. Les décaissements du pot commun sont soumis au vote de l''Agora.

Le solde du pot commun, les contributions totales et les décaissements sont publiquement accessibles en temps réel. Chaque décaissement est justifié par une proposition votée et enregistré dans le journal d''audit.',
'Le pot commun crée un mécanisme de solidarité automatique et transparent. Contrairement aux systèmes fiscaux opaques, chaque utilisateur peut vérifier en temps réel l''utilisation des fonds collectifs. Le plafonnement à 15% empêche une taxation excessive tout en garantissant un financement minimal des biens communs.', false),

((SELECT id FROM codex_titles WHERE number = 'V'), 16, 'Crédit mutualisé',
'Le système VITA permet l''emprunt de VITA à taux zéro, financé par le pot commun. Ce crédit mutualisé est accessible à tout utilisateur vérifié répondant aux critères d''éligibilité.

L''éligibilité au crédit est déterminée par l''historique de l''utilisateur dans le système : ancienneté, régularité des interactions, absence de défaut de paiement antérieur. Aucun critère lié au solde ou à la richesse n''est pris en compte.

Le montant maximum empruntable est calculé en fonction de l''ancienneté de l''utilisateur (nombre de jours depuis la vérification). Le remboursement s''effectue par prélèvement automatique d''une fraction de l''émission quotidienne, garantissant que l''emprunteur conserve toujours un revenu résiduel.

Le taux d''intérêt est de zéro. Le seul coût du crédit est le coût d''opportunité de la fraction d''émission quotidienne allouée au remboursement.',
'Le crédit à taux zéro est cohérent avec la philosophie du VITA : la monnaie est créée ex nihilo par le protocole, facturer des intérêts sur une monnaie créée gratuitement serait contradictoire. Le financement par le pot commun mutualisé permet de répartir le risque de défaut sur l''ensemble de la communauté.', false),

((SELECT id FROM codex_titles WHERE number = 'V'), 17, 'Épargne',
'L''épargne en VITA ne génère aucun intérêt. Le solde d''un compte VITA reste constant en l''absence de transactions : il ne croît pas par l''effet du temps.

Cette règle découle du principe fondamental du VITA : la valeur monétaire provient de l''existence humaine, pas de l''accumulation de capital. Permettre l''intérêt créerait une incitation à l''accumulation et reproduirait les mécanismes d''inégalité des systèmes monétaires traditionnels.

L''épargne reste néanmoins possible et encouragée comme outil de prévoyance personnelle. Les utilisateurs peuvent librement conserver des VITA sur leur compte pour des projets futurs, des imprévus ou la retraite. Le système garantit la préservation nominale de l''épargne : un VITA épargné reste un VITA.',
'L''absence d''intérêt est une décision philosophique autant qu''économique. L''intérêt composé est le principal moteur de concentration des richesses dans les systèmes financiers traditionnels. En l''éliminant, le VITA empêche la divergence exponentielle entre les soldes des utilisateurs et maintient une distribution relativement égalitaire.', false);

-- ═══════════════════════════════════════════════════════════════════
-- TITRE VI — ARCHITECTURE TECHNIQUE (Articles 18-20)
-- ═══════════════════════════════════════════════════════════════════

INSERT INTO codex_articles (title_id, number, name, content, rationale, immutable) VALUES

((SELECT id FROM codex_titles WHERE number = 'VI'), 18, 'Code ouvert',
'L''intégralité du code source du système VITA est publié sous licence libre (AGPL-3.0 ou licence équivalente approuvée par l''Agora). Toute modification du code doit être publiée dans les mêmes conditions.

Le code source inclut : le protocole de consensus, les mécanismes d''émission, les algorithmes de vérification d''identité, les contrats de gouvernance, les interfaces utilisateur, les outils d''audit et les bibliothèques cryptographiques.

Aucun composant du système ne peut être propriétaire, fermé ou secret. Les audits de sécurité sont publics et leurs résultats sont accessibles à tous. Les vulnérabilités découvertes sont traitées selon un processus de divulgation responsable avec un délai maximal de 90 jours avant publication.',
'Le code ouvert est la condition sine qua non de la confiance dans un système monétaire sans autorité centrale. Si le code est opaque, il est impossible de vérifier qu''il respecte les règles du Codex. La licence AGPL garantit que toute dérivation reste elle aussi ouverte.', false),

((SELECT id FROM codex_titles WHERE number = 'VI'), 19, 'Consensus Proof of Personhood',
'Le mécanisme de consensus du réseau VITA est basé sur la preuve de personnalité (Proof of Personhood, PoP). Contrairement au Proof of Work (énergie) ou au Proof of Stake (capital), le PoP accorde un pouvoir de validation égal à chaque être humain vérifié.

Chaque nœud validateur est associé à exactement un être humain vérifié. Le consensus est atteint lorsque 67% des validateurs actifs s''accordent sur la validité d''un bloc de transactions.

Le protocole de consensus est conçu pour résister aux attaques byzantines avec une tolérance de f < n/3 nœuds malveillants. La finalité des blocs est déterministe : une fois qu''un bloc atteint le consensus de 67%, il est irréversible.',
'Le Proof of Personhood est le seul mécanisme de consensus cohérent avec la philosophie du VITA. Le PoW concentre le pouvoir chez ceux qui possèdent la puissance de calcul, le PoS chez ceux qui possèdent le capital. Le PoP distribue le pouvoir de validation de manière égalitaire, comme le VITA distribue la création monétaire.', false),

((SELECT id FROM codex_titles WHERE number = 'VI'), 20, 'Sécurité cryptographique',
'Le système VITA utilise les primitives cryptographiques suivantes, choisies pour leur sécurité prouvée et leur maturité :

Signatures numériques : Ed25519 (courbe elliptique Edwards, signature Schnorr) pour l''authentification des transactions et la signature des messages.

Engagements : Pedersen commitments (sur la courbe Curve25519) pour masquer les montants des transactions tout en permettant la vérification arithmétique homomorphique.

Preuves de portée : Bulletproofs pour prouver qu''un montant masqué est dans une plage valide (positif et inférieur au solde) sans révéler sa valeur.

Hachage : SHA-256 pour le chaînage des blocs et les preuves d''intégrité.

Chiffrement à seuil : Shamir''s Secret Sharing (SSS) pour le partage de la clé de supervision qualifiée.

Toute modification de la pile cryptographique doit être précédée d''un audit de sécurité indépendant et approuvée par vote à la majorité qualifiée (67%).',
'Le choix de ces primitives reflète un compromis entre sécurité, performance et maturité. Ed25519, Pedersen et Bulletproofs forment un ensemble cohérent sur la même famille de courbes elliptiques. SHA-256 est la fonction de hachage la plus auditée au monde. Shamir''s Secret Sharing est un protocole prouvé sûr sur le plan informationnel.', false);

-- ═══════════════════════════════════════════════════════════════════
-- TITRE VII — DISPOSITIONS TRANSITOIRES (Articles 21-22)
-- ═══════════════════════════════════════════════════════════════════

INSERT INTO codex_articles (title_id, number, name, content, rationale, immutable) VALUES

((SELECT id FROM codex_titles WHERE number = 'VII'), 21, 'Phase centralisée initiale',
'Le système VITA démarre dans une phase centralisée contrôlée. Pendant cette phase, l''infrastructure est gérée par une équipe fondatrice identifiée, le consensus est simulé sur un serveur central, et les transactions sont enregistrées dans une base de données PostgreSQL classique.

Cette phase centralisée est transitoire et ne constitue pas l''architecture cible du système. Elle est justifiée par la nécessité de tester, itérer et corriger le protocole avant de le déployer de manière décentralisée et irréversible.

Pendant la phase centralisée, les garanties suivantes sont maintenues : les quatre paramètres immuables (Article 3) sont respectés, le code source est ouvert (Article 18), les données sont auditables, et les utilisateurs sont informés du caractère transitoire de l''architecture.',
'Déployer immédiatement un système décentralisé comporterait des risques inacceptables : les bugs seraient irréversibles, les erreurs de conception seraient figées, et la communauté n''aurait pas eu le temps de comprendre et de valider le protocole. La centralisation initiale est un compromis pragmatique, explicitement temporaire.', false),

((SELECT id FROM codex_titles WHERE number = 'VII'), 22, 'Décentralisation progressive',
'La transition vers un système pleinement décentralisé s''effectue en quatre phases :

Phase Alpha (actuelle) — Serveur centralisé, base de données PostgreSQL, vérification d''identité simplifiée. Objectif : valider la logique métier, l''interface utilisateur et le modèle économique avec un groupe restreint d''utilisateurs pionniers.

Phase Beta — Introduction du réseau pair-à-pair pour la propagation des transactions. Le serveur central reste l''autorité de consensus mais les nœuds participants peuvent vérifier l''intégrité des données. Début de l''implémentation du zk-PoI.

Phase Gamma — Déploiement du consensus Proof of Personhood. Les validateurs sont des utilisateurs vérifiés. Le serveur central devient un nœud comme les autres. Activation des transactions confidentielles (Pedersen + Bulletproofs).

Phase Delta — Décentralisation complète. Le système fonctionne sans aucun composant centralisé. Tout utilisateur peut faire fonctionner un nœud complet. Le code du Codex est la seule autorité.

Le passage d''une phase à la suivante est décidé par vote de l''Agora, sur proposition de l''équipe technique, après un audit de sécurité indépendant.',
'La décentralisation progressive permet de valider chaque couche du système avant de la figer. Les systèmes qui se décentralisent trop tôt souffrent de bugs irréversibles et de problèmes de gouvernance. Les quatre phases sont conçues pour augmenter graduellement la résilience et la décentralisation tout en maintenant la capacité de correction.', false);

-- ═══════════════════════════════════════════════════════════════════
-- Insert initial versions for all articles (version 1)
-- ═══════════════════════════════════════════════════════════════════

INSERT INTO codex_versions (article_id, version, content, rationale, change_summary)
SELECT id, 1, content, rationale, 'Version initiale — Constitution fondatrice du système VITA'
FROM codex_articles;
