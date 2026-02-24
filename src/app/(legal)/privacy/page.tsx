import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Politique de confidentialite — VITA",
  description: "Politique de confidentialite et protection des donnees personnelles de la plateforme VITA.",
};

export default function PrivacyPage() {
  return (
    <article className="prose-vita space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)]">
          Politique de confidentialite
        </h1>
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          Derniere mise a jour : 24 fevrier 2026
        </p>
      </div>

      <Section title="1. Introduction">
        <p>
          La plateforme VITA (&laquo; nous &raquo;, &laquo; notre &raquo;) s&apos;engage a proteger
          la vie privee de ses utilisateurs. Cette politique decrit comment nous collectons,
          utilisons et protegeons vos donnees personnelles conformement au Reglement General
          sur la Protection des Donnees (RGPD - Reglement UE 2016/679).
        </p>
      </Section>

      <Section title="2. Responsable du traitement">
        <p>
          Le responsable du traitement des donnees est l&apos;equipe VITA, joignable a l&apos;adresse :{" "}
          <span className="text-violet-500">privacy@vita.world</span>.
        </p>
      </Section>

      <Section title="3. Donnees collectees">
        <p>Nous collectons uniquement les donnees strictement necessaires au fonctionnement du service :</p>
        <ul className="mt-2 list-disc space-y-1.5 pl-5">
          <li>
            <strong className="text-[var(--text-primary)]">Donnees d&apos;inscription</strong> : nom d&apos;utilisateur, adresse email, mot de passe (hache avec Argon2, jamais stocke en clair).
          </li>
          <li>
            <strong className="text-[var(--text-primary)]">Cle publique cryptographique</strong> : generee localement sur votre appareil. Nous ne possedons jamais votre cle privee.
          </li>
          <li>
            <strong className="text-[var(--text-primary)]">Verification d&apos;identite</strong> : preuve zero-knowledge (ZK-proof) attestant votre unicite, sans reveler votre identite reelle.
          </li>
          <li>
            <strong className="text-[var(--text-primary)]">Donnees transactionnelles</strong> : les montants sont proteges par des engagements de Pedersen. Seuls l&apos;emetteur et le destinataire connaissent les details.
          </li>
          <li>
            <strong className="text-[var(--text-primary)]">Donnees techniques</strong> : adresse IP (pour la securite et la limitation de debit), logs d&apos;acces.
          </li>
        </ul>
      </Section>

      <Section title="4. Finalites du traitement">
        <ul className="list-disc space-y-1.5 pl-5">
          <li>Fournir et maintenir le service VITA (base legale : execution du contrat)</li>
          <li>Garantir l&apos;unicite des comptes — 1 personne = 1 compte (base legale : interet legitime)</li>
          <li>Prevenir la fraude et securiser les transactions (base legale : interet legitime)</li>
          <li>Envoyer des notifications liees au service (base legale : execution du contrat)</li>
          <li>Ameliorer le service via des statistiques anonymisees (base legale : interet legitime)</li>
        </ul>
      </Section>

      <Section title="5. Privacy by Design">
        <p>
          VITA est concu avec la privacy au coeur de son architecture :
        </p>
        <ul className="mt-2 list-disc space-y-1.5 pl-5">
          <li><strong className="text-[var(--text-primary)]">Zero-Knowledge Proofs</strong> : votre identite est verifiee sans que nous la connaissions.</li>
          <li><strong className="text-[var(--text-primary)]">Engagements de Pedersen</strong> : les montants des transactions sont cryptographiquement caches.</li>
          <li><strong className="text-[var(--text-primary)]">Bulletproofs</strong> : preuves de portee garantissant la validite sans reveler les montants.</li>
          <li><strong className="text-[var(--text-primary)]">Adresses furtives</strong> : les destinataires des transactions sont proteges.</li>
          <li><strong className="text-[var(--text-primary)]">Cles privees locales</strong> : votre cle privee ne quitte jamais votre appareil.</li>
        </ul>
      </Section>

      <Section title="6. Duree de conservation">
        <ul className="list-disc space-y-1.5 pl-5">
          <li>Donnees de compte : conservees tant que le compte est actif, supprimees 30 jours apres demande de suppression.</li>
          <li>Logs d&apos;audit : conserves indefiniment pour l&apos;integrite de la chaine de hachage (donnees anonymisees).</li>
          <li>Logs techniques (IP, acces) : 12 mois maximum.</li>
          <li>Tokens de reinitialisation : supprimes apres utilisation ou expiration (1 heure).</li>
        </ul>
      </Section>

      <Section title="7. Partage des donnees">
        <p>
          Nous ne vendons, ne louons et ne partageons jamais vos donnees personnelles a des tiers
          a des fins commerciales. Les donnees peuvent etre transmises uniquement :
        </p>
        <ul className="mt-2 list-disc space-y-1.5 pl-5">
          <li>Aux prestataires techniques necessaires au fonctionnement (hebergement, email transactionnel), lies par des clauses de confidentialite.</li>
          <li>Aux autorites competentes si requis par la loi.</li>
        </ul>
      </Section>

      <Section title="8. Vos droits (RGPD)">
        <p>Conformement au RGPD, vous disposez des droits suivants :</p>
        <ul className="mt-2 list-disc space-y-1.5 pl-5">
          <li><strong className="text-[var(--text-primary)]">Droit d&apos;acces</strong> : obtenir une copie de vos donnees personnelles.</li>
          <li><strong className="text-[var(--text-primary)]">Droit de rectification</strong> : corriger des donnees inexactes.</li>
          <li><strong className="text-[var(--text-primary)]">Droit a l&apos;effacement</strong> : demander la suppression de vos donnees.</li>
          <li><strong className="text-[var(--text-primary)]">Droit a la portabilite</strong> : recevoir vos donnees dans un format structure.</li>
          <li><strong className="text-[var(--text-primary)]">Droit d&apos;opposition</strong> : vous opposer a certains traitements.</li>
          <li><strong className="text-[var(--text-primary)]">Droit a la limitation</strong> : restreindre le traitement dans certains cas.</li>
        </ul>
        <p className="mt-3">
          Pour exercer ces droits, contactez-nous a{" "}
          <span className="text-violet-500">privacy@vita.world</span>.
          Nous repondrons dans un delai de 30 jours.
        </p>
      </Section>

      <Section title="9. Securite">
        <p>
          Nous mettons en oeuvre des mesures techniques et organisationnelles appropriees :
          chiffrement TLS, hachage Argon2, audit trail immutable, limitation de debit,
          et revue reguliere de securite.
        </p>
      </Section>

      <Section title="10. Cookies">
        <p>
          VITA utilise uniquement des cookies strictement necessaires au fonctionnement
          (authentification JWT, preferences de session). Nous n&apos;utilisons aucun cookie
          de tracking, d&apos;analyse tiers ou publicitaire.
        </p>
      </Section>

      <Section title="11. Modifications">
        <p>
          Nous pouvons mettre a jour cette politique. Toute modification substantielle sera
          notifiee via l&apos;application. La date de derniere mise a jour est indiquee en haut de cette page.
        </p>
      </Section>

      <Section title="12. Contact">
        <p>
          Pour toute question relative a la protection de vos donnees :{" "}
          <span className="text-violet-500">privacy@vita.world</span>.
        </p>
        <p className="mt-2">
          Vous pouvez egalement introduire une reclamation aupres de votre autorite de
          protection des donnees nationale (en France : la CNIL).
        </p>
      </Section>

      <div className="pt-4 text-center">
        <Link
          href="/auth/connexion"
          className="text-sm font-medium text-violet-500 hover:underline"
        >
          Retour a la connexion
        </Link>
      </div>
    </article>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-3 text-lg font-semibold text-[var(--text-primary)]">{title}</h2>
      <div className="space-y-2 text-sm leading-relaxed text-[var(--text-secondary)]">
        {children}
      </div>
    </section>
  );
}
