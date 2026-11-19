const FAQ_ITEMS = [
  {
    question: "Faut-il déjà savoir programmer ou connaître Linux avant de commencer ?",
    answer:
      "Non. Chaque laboratoire part des concepts fondamentaux : qu'est-ce qu'un octet, pourquoi une adresse existe, et comment deux machines se synchronisent. Les termes techniques sont toujours expliqués juste avant leur manipulation.",
  },
  {
    question: "Dois-je installer une machine virtuelle ou des outils locaux ?",
    answer:
      "Non. Tout s'apprend directement dans votre navigateur grâce à nos moyens visuels intégrés : modèles d'octets, droits MMU, pile d'appels, tas et handshake TCP réagissent instantanément.",
  },
  {
    question: "En quoi est-ce différent d'un cours vidéo ou d'un article technique ?",
    answer:
      "Au lieu de lire passivement une explication ou de copier une commande toute faite, vous posez d'abord une prédiction, puis vous agissez directement sur le modèle pour observer la cause et la conséquence exactes.",
  },
  {
    question: "Comment ces bases mènent-elles vers la cybersécurité offensive et défensive ?",
    answer:
      "Une vulnérabilité n'est jamais magique : un Use-After-Free naît du fonctionnement du tas, une protection NX vient des bits R/W/X de la MMU, et une attaque réseau s'appuie sur la machine d'états TCP. Maîtriser le mécanisme normal permet de comprendre immédiatement comment il casse.",
  },
] as const;

export function LandingFaq() {
  return (
    <section id="faq" className="faq-section" aria-labelledby="faq-heading">
      <div className="faq-intro">
        <p className="section-eyebrow">Questions fréquentes</p>
        <h2 id="faq-heading">Ce qu&apos;il faut savoir avant de démarrer.</h2>
        <p>
          Pas d&apos;inscription bloquante, pas d&apos;environnement complexe à monter pour vos
          premiers pas. Cliquez sur Commencer et suivez le premier chapitre.
        </p>
      </div>

      <div className="faq-list">
        {FAQ_ITEMS.map((item) => (
          <details key={item.question} className="faq-item">
            <summary>{item.question}</summary>
            <p>{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
