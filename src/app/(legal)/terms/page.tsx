import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Conditions generales d'utilisation — VITA",
  description: "Conditions generales d'utilisation de la plateforme VITA.",
};

export default function TermsPage() {
  return (
    <article className="prose-vita space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)]">
          Conditions generales d&apos;utilisation
        </h1>
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          Derniere mise a jour : 24 fevrier 2026
        </p>
      </div>

      <Section title="1. Objet">
        <p>
          Les presentes Conditions Generales d&apos;Utilisation (CGU) regissent l&apos;acces
          et l&apos;utilisation de la plateforme VITA, un systeme de monnaie universelle et
          de gouvernance democratique. En creant un compte, vous acceptez ces conditions
          dans leur integralite.
        </p>
      </Section>

      <Section title="2. Principes fondamentaux">
        <p>
          VITA repose sur des principes constitutionnels immuables, qui ne peuvent etre
          modifies meme par vote collectif :
        </p>
        <ul className="mt-2 list-disc space-y-1.5 pl-5">
          <li><strong className="text-[var(--text-primary)]">1 personne = 1 Ѵ par jour</strong> : chaque utilisateur verifie recoit automatiquement 1 VITA quotidien.</li>
          <li><strong className="text-[var(--text-primary)]">Pas de retroactivite</strong> : tout le monde part de zero, sans rattrapage.</li>
          <li><strong className="text-[var(--text-primary)]">Confidentialite transactionnelle</strong> : les details des transactions sont cryptographiquement proteges.</li>
          <li><strong className="text-[var(--text-primary)]">Un compte unique</strong> : chaque personne ne peut detenir qu&apos;un seul compte VITA.</li>
        </ul>
      </Section>

      <Section title="3. Inscription et compte">
        <ul className="list-disc space-y-1.5 pl-5">
          <li>Vous devez fournir une adresse email valide et un nom d&apos;utilisateur unique.</li>
          <li>Votre mot de passe doit contenir au minimum 8 caracteres. Il est hache (Argon2) et jamais stocke en clair.</li>
          <li>Une paire de cles cryptographiques (Ed25519) est generee localement sur votre appareil. Vous etes seul responsable de la conservation de votre cle privee.</li>
          <li>La verification d&apos;identite (via Zero-Knowledge Proof) est requise pour recevoir l&apos;emission quotidienne et participer aux votes.</li>
          <li>Toute tentative de creation de comptes multiples entrainera la suspension de tous les comptes concernes.</li>
        </ul>
      </Section>

      <Section title="4. Emission quotidienne">
        <p>
          Chaque jour a minuit UTC, 1 Ѵ est automatiquement credite sur le compte de chaque
          utilisateur dont l&apos;identite est verifiee. L&apos;emission n&apos;est pas retroactive :
          seuls les jours ou vous etes verifie sont comptabilises.
        </p>
      </Section>

      <Section title="5. Transactions">
        <ul className="list-disc space-y-1.5 pl-5">
          <li>Les transferts de Ѵ entre utilisateurs sont irreversibles une fois confirmes.</li>
          <li>Un pourcentage de chaque transaction est preleve pour le pot commun (taux defini par vote collectif).</li>
          <li>Les montants sont proteges par des engagements de Pedersen et des preuves de portee (Bulletproofs).</li>
          <li>Les transactions offline sont soumises a des limites (montant, nombre, duree) definies par vote collectif.</li>
          <li>Toute tentative de fraude (double-depense, falsification) entraine la suspension immediate du compte.</li>
        </ul>
      </Section>

      <Section title="6. Valorisation des services">
        <p>
          La valeur des services echanges est calculee selon la formule :
        </p>
        <div
          className="my-3 rounded-lg border p-3 text-center font-mono text-sm"
          style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-elevated)" }}
        >
          <span className="text-[var(--text-primary)]">V = T &times; (1 + F + P + R + L) + M</span>
        </div>
        <p>
          ou T = temps, F = formation, P = penibilite, R = responsabilite, L = rarete locale,
          M = moyens materiels. Les plages de coefficients sont definies par vote collectif en Agora.
        </p>
      </Section>

      <Section title="7. Credit mutualise">
        <p>
          Les utilisateurs verifies peuvent acceder a un credit a taux zero, garanti par le
          pot commun. Les criteres d&apos;eligibilite (anciennete, historique, contribution)
          et les limites sont definis par vote collectif.
        </p>
      </Section>

      <Section title="8. Gouvernance (Agora)">
        <ul className="list-disc space-y-1.5 pl-5">
          <li>Chaque utilisateur verifie dispose d&apos;une voix, sans ponderation.</li>
          <li>Les propositions sont soumises et votees en Agora.</li>
          <li>Les parametres configurables du systeme ne peuvent etre modifies que par vote.</li>
          <li>Les parametres constitutionnels (section 2) ne sont pas soumis au vote.</li>
        </ul>
      </Section>

      <Section title="9. Responsabilites de l'utilisateur">
        <ul className="list-disc space-y-1.5 pl-5">
          <li>Vous etes responsable de la securite de votre compte, de votre mot de passe et de votre cle privee.</li>
          <li>Vous vous engagez a ne pas creer de comptes multiples.</li>
          <li>Vous vous engagez a ne pas tenter de manipuler le systeme (fraude, double-depense, usurpation d&apos;identite).</li>
          <li>Vous utilisez le service de maniere conforme aux lois applicables.</li>
        </ul>
      </Section>

      <Section title="10. Limitation de responsabilite">
        <p>
          VITA est un projet experimental. Le service est fourni &laquo; tel quel &raquo;,
          sans garantie d&apos;aucune sorte. Nous ne saurions etre tenus responsables des
          pertes de donnees, de cles privees, ou d&apos;interruptions de service.
        </p>
      </Section>

      <Section title="11. Suspension et resiliation">
        <p>
          Nous nous reservons le droit de suspendre ou supprimer un compte en cas de :
        </p>
        <ul className="mt-2 list-disc space-y-1.5 pl-5">
          <li>Violation des presentes conditions.</li>
          <li>Tentative de fraude ou de creation de comptes multiples.</li>
          <li>Utilisation abusive du service.</li>
        </ul>
        <p className="mt-2">
          Vous pouvez a tout moment demander la suppression de votre compte
          en contactant <span className="text-violet-500">support@vita.world</span>.
        </p>
      </Section>

      <Section title="12. Propriete intellectuelle">
        <p>
          Le code source de VITA est ouvert. Les contenus generes par les utilisateurs
          (propositions, votes, discussions) restent la propriete de leurs auteurs.
        </p>
      </Section>

      <Section title="13. Modifications des CGU">
        <p>
          Les presentes conditions peuvent etre modifiees. Toute modification substantielle
          sera notifiee aux utilisateurs via l&apos;application au moins 15 jours avant son
          entree en vigueur. L&apos;utilisation continue du service vaut acceptation.
        </p>
      </Section>

      <Section title="14. Droit applicable">
        <p>
          Les presentes conditions sont regies par le droit francais. En cas de litige,
          les tribunaux competents seront ceux du ressort du siege de VITA, sauf
          disposition legale contraire.
        </p>
      </Section>

      <Section title="15. Contact">
        <p>
          Pour toute question concernant ces conditions :{" "}
          <span className="text-violet-500">legal@vita.world</span>.
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
