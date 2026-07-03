export type Dimension = "docs" | "comms" | "image" | "ops";

export interface AuditOption {
  id: string;
  label: string;
  scores: Partial<Record<Dimension, number>>;
  insight?: string;
}

export interface AuditQuestion {
  id: string;
  text: string;
  type: "single" | "multi";
  options: AuditOption[];
  /** Questions sans impact sur la note (contexte ou priorité). */
  contextual?: boolean;
}

export const auditQuestions: AuditQuestion[] = [
  {
    id: "q1",
    text: "Comment transmettez-vous principalement vos documents à vos clients ?",
    type: "single",
    options: [
      { id: "email", label: "Email", scores: { docs: 22, image: 25 }, insight: "Les documents sont encore principalement transmis par email." },
      { id: "whatsapp", label: "WhatsApp", scores: { docs: 12, comms: 18, image: 15 }, insight: "WhatsApp complique la traçabilité et l’image professionnelle." },
      { id: "wetransfer", label: "WeTransfer / Dropbox", scores: { docs: 38, image: 40 }, insight: "Les outils de partage ponctuel ne structurent pas la relation dans la durée." },
      { id: "portal", label: "Portail client sécurisé", scores: { docs: 92, image: 88, comms: 85 }, insight: "Vous disposez déjà d’un canal documentaire structuré." },
    ],
  },
  {
    id: "q2",
    text: "Lorsqu’un client recherche un ancien document, où le retrouve-t-il ?",
    type: "single",
    options: [
      { id: "contact", label: "Il nous contacte", scores: { docs: 18, comms: 22, ops: 25 }, insight: "Vos clients dépendent de vos équipes pour retrouver leurs documents." },
      { id: "emails", label: "Il recherche dans ses emails", scores: { docs: 28, comms: 30 }, insight: "La recherche documentaire repose encore sur les boîtes mail." },
      { id: "resend", label: "Nous lui renvoyons le document", scores: { docs: 22, ops: 20 }, insight: "Le renvoi systématique de pièces consomme du temps interne." },
      { id: "self", label: "Il le retrouve seul dans son portail", scores: { docs: 94, ops: 90, comms: 85 }, insight: "Vos clients accèdent à leurs documents en autonomie." },
    ],
  },
  {
    id: "q3",
    text: "Comment gérez-vous les validations de documents ?",
    type: "single",
    options: [
      { id: "phone", label: "Par téléphone", scores: { ops: 18, comms: 22 }, insight: "Les validations orales laissent peu de trace exploitable." },
      { id: "email", label: "Par email", scores: { ops: 32, docs: 35 }, insight: "Les validations ne sont pas centralisées." },
      { id: "paper", label: "Papier signé", scores: { ops: 42, docs: 45 }, insight: "Le papier ralentit les échanges et complique l’archivage." },
      { id: "portal", label: "Depuis un espace client", scores: { ops: 93, docs: 88 }, insight: "Les validations sont tracées dans un espace dédié." },
    ],
  },
  {
    id: "q4",
    text: "Combien de temps passez-vous chaque semaine à renvoyer des documents déjà envoyés ?",
    type: "single",
    options: [
      { id: "5plus", label: "Plus de 5 heures", scores: { ops: 12, docs: 15 }, insight: "Une part significative de votre semaine part en tâches répétitives." },
      { id: "2to5", label: "Entre 2 et 5 heures", scores: { ops: 32, docs: 30 }, insight: "Les renvois de documents occupent encore plusieurs heures par semaine." },
      { id: "under2", label: "Moins de 2 heures", scores: { ops: 62, docs: 58 }, insight: "Les renvois restent limités mais pas totalement éliminés." },
      { id: "rare", label: "Presque jamais", scores: { ops: 92, docs: 88 }, insight: "Peu de temps perdu à rechercher ou renvoyer des pièces." },
    ],
  },
  {
    id: "q5",
    text: "Vos clients savent-ils où suivre l’avancement de leur dossier ?",
    type: "single",
    options: [
      { id: "no", label: "Non", scores: { comms: 15, image: 20 }, insight: "L’avancement des dossiers n’est pas visible pour vos clients." },
      { id: "call", label: "Seulement en nous appelant", scores: { comms: 28, ops: 25 }, insight: "Le suivi passe encore par des appels ou relances manuelles." },
      { id: "partial", label: "Partiellement", scores: { comms: 52, image: 48 }, insight: "Le suivi existe, mais il n’est pas encore unifié." },
      { id: "portal", label: "Oui, depuis un portail", scores: { comms: 92, image: 88, ops: 85 }, insight: "Vos clients suivent l’avancement sans solliciter vos équipes." },
    ],
  },
  {
    id: "q6",
    text: "Où se trouvent aujourd’hui les informations liées à un dossier ?",
    type: "single",
    options: [
      { id: "emails", label: "Dans plusieurs emails", scores: { docs: 16, ops: 20 }, insight: "L’information dossier est dispersée dans les fils mail." },
      { id: "software", label: "Dans plusieurs logiciels", scores: { docs: 38, ops: 40 }, insight: "Plusieurs outils coexistent sans vue dossier unique." },
      { id: "folders", label: "Dans des dossiers Windows", scores: { docs: 48, ops: 45 }, insight: "L’archivage local limite l’accès client et la continuité d’équipe." },
      { id: "central", label: "Centralisées dans un seul espace", scores: { docs: 94, ops: 90 }, insight: "Chaque dossier dispose d’un espace de référence unique." },
    ],
  },
  {
    id: "q7",
    text: "Quels canaux utilisez-vous pour communiquer avec vos clients ?",
    type: "multi",
    options: [
      { id: "email", label: "Email", scores: {} },
      { id: "phone", label: "Téléphone", scores: {} },
      { id: "whatsapp", label: "WhatsApp", scores: {} },
      { id: "sms", label: "SMS", scores: {} },
      { id: "mail", label: "Courrier", scores: {} },
    ],
  },
  {
    id: "q8",
    text: "Un nouveau collaborateur retrouve-t-il facilement l’historique d’un dossier ?",
    type: "single",
    options: [
      { id: "hard", label: "Très difficilement", scores: { ops: 14, docs: 18 }, insight: "La reprise de dossier par un nouveau collaborateur reste complexe." },
      { id: "searches", label: "Avec plusieurs recherches", scores: { ops: 32, docs: 35 }, insight: "Retrouver l’historique demande encore plusieurs recherches." },
      { id: "partly", label: "En partie", scores: { ops: 58, docs: 55 }, insight: "L’historique est partiellement accessible en interne." },
      { id: "immediate", label: "Immédiatement", scores: { ops: 93, docs: 90 }, insight: "L’historique dossier est immédiatement accessible en interne." },
    ],
  },
  {
    id: "q9",
    text: "Votre image est-elle cohérente auprès de vos clients ?",
    type: "single",
    options: [
      { id: "emails", label: "Nous envoyons principalement des emails", scores: { image: 22, comms: 28 }, insight: "L’expérience client repose encore sur des échanges email classiques." },
      { id: "tools", label: "Nous utilisons plusieurs outils", scores: { image: 38 }, insight: "Plusieurs outils créent une expérience client hétérogène." },
      { id: "dedicated", label: "Nous avons quelques outils dédiés", scores: { image: 65 }, insight: "Des outils dédiés existent, mais l’expérience n’est pas encore unifiée." },
      { id: "portal", label: "Nous disposons d’un portail professionnel à notre image", scores: { image: 94, comms: 88 }, insight: "Votre image client est portée par un espace professionnel dédié." },
    ],
  },
  {
    id: "q10",
    text: "Combien de clients gérez-vous ?",
    type: "single",
    contextual: true,
    options: [
      { id: "under50", label: "Moins de 50", scores: {} },
      { id: "50to200", label: "50 à 200", scores: {} },
      { id: "200to1000", label: "200 à 1 000", scores: {} },
      { id: "1000plus", label: "Plus de 1 000", scores: {} },
    ],
  },
  {
    id: "q11",
    text: "Aujourd’hui, qu’est-ce qui vous fait perdre le plus de temps ?",
    type: "multi",
    options: [
      { id: "search", label: "Rechercher des documents", scores: {} },
      { id: "emails", label: "Répondre aux emails", scores: {} },
      { id: "followup", label: "Les relances clients", scores: {} },
      { id: "validations", label: "Les validations", scores: {} },
      { id: "calls", label: "Les appels", scores: {} },
    ],
  },
  {
    id: "q12",
    text: "Quelle est votre priorité cette année ?",
    type: "single",
    contextual: true,
    options: [
      { id: "image", label: "Moderniser notre image", scores: {} },
      { id: "organize", label: "Mieux organiser les dossiers", scores: {} },
      { id: "emails", label: "Réduire les emails", scores: {} },
      { id: "experience", label: "Améliorer l’expérience client", scores: {} },
      { id: "time", label: "Gagner du temps", scores: {} },
    ],
  },
];

export const dimensionLabels: Record<Dimension, string> = {
  docs: "Organisation documentaire",
  comms: "Communication client",
  image: "Image professionnelle",
  ops: "Efficacité opérationnelle",
};
