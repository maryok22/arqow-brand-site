import {
  auditQuestions,
  dimensionLabels,
  type AuditQuestion,
  type Dimension,
} from "./audit-data";

export type Answers = Record<string, string | string[]>;

export interface AuditResult {
  overall: number;
  dimensions: Record<Dimension, number>;
  level: { emoji: string; label: string; summary: string };
  strengths: string[];
  improvements: string[];
  hoursSaved: number;
  recommendation: string;
  priorityLine: string;
}

const dimensionKeys: Dimension[] = ["docs", "comms", "image", "ops"];

function channelScore(count: number): number {
  if (count <= 1) return 88;
  if (count === 2) return 68;
  if (count === 3) return 48;
  return 28;
}

function clientMultiplier(clientBand?: string): number {
  switch (clientBand) {
    case "under50":
      return 0.75;
    case "50to200":
      return 1;
    case "200to1000":
      return 1.35;
    case "1000plus":
      return 1.75;
    default:
      return 1;
  }
}

function baseHoursFromQ4(answer?: string): number {
  switch (answer) {
    case "5plus":
      return 8;
    case "2to5":
      return 5;
    case "under2":
      return 3;
    case "rare":
      return 1;
    default:
      return 4;
  }
}

function painBonus(pains: string[]): number {
  const map: Record<string, number> = {
    search: 2,
    emails: 1.5,
    followup: 1.5,
    validations: 1,
    calls: 1,
  };
  return pains.reduce((sum, id) => sum + (map[id] ?? 0), 0);
}

function collectInsights(answers: Answers): string[] {
  const insights: string[] = [];
  for (const question of auditQuestions) {
    if (question.type !== "single" || question.contextual) continue;
    const answer = answers[question.id];
    if (typeof answer !== "string") continue;
    const option = question.options.find((o) => o.id === answer);
    if (!option?.insight) continue;
    const values = Object.values(option.scores).filter((v) => typeof v === "number") as number[];
    const avg = values.length ? values.reduce((a, b) => a + b, 0) / values.length : 100;
    if (avg < 60) insights.push(option.insight);
  }
  return [...new Set(insights)];
}

function strengthLabel(dimension: Dimension, score: number): string | null {
  if (score < 70) return null;
  const labels: Record<Dimension, string> = {
    docs: "Bonne organisation documentaire",
    comms: "Communication client réactive",
    image: "Image professionnelle cohérente",
    ops: "Processus internes efficaces",
  };
  return labels[dimension];
}

function levelFor(score: number): AuditResult["level"] {
  if (score < 40) {
    return {
      emoji: "🔴",
      label: "À structurer",
      summary:
        "Votre relation client repose encore largement sur des échanges dispersés. Centraliser documents, validations et messages deviendrait un levier majeur.",
    };
  }
  if (score < 60) {
    return {
      emoji: "🟠",
      label: "Fragile",
      summary:
        "Plusieurs pratiques fonctionnent au quotidien, mais la dépendance aux emails et aux relances manuelles freine votre efficacité.",
    };
  }
  if (score < 75) {
    return {
      emoji: "🟡",
      label: "En progression",
      summary:
        "Votre organisation est déjà bien structurée, mais plusieurs tâches pourraient être centralisées pour réduire les échanges répétitifs avec vos clients.",
    };
  }
  if (score < 90) {
    return {
      emoji: "🟢",
      label: "Maîtrisé",
      summary:
        "Vous disposez déjà de bonnes bases. L’enjeu est surtout d’unifier l’expérience client et de réduire les frictions résiduelles.",
    };
  }
  return {
    emoji: "🟢",
    label: "Exemplaire",
    summary:
      "Votre relation client est déjà très structurée. Arqow peut encore simplifier le quotidien de vos équipes et renforcer votre image.",
  };
}

function priorityLine(priority?: string): string {
  const map: Record<string, string> = {
    image: "Votre priorité — moderniser l’image — correspond précisément à ce qu’un portail client apporte en premier.",
    organize: "Votre priorité — mieux organiser les dossiers — est au cœur de ce que centralise un portail client.",
    emails: "Votre priorité — réduire les emails — sera difficile sans un espace unique pour documents et échanges.",
    experience: "Votre priorité — l’expérience client — passe par un parcours clair, traçable et professionnel.",
    time: "Votre priorité — gagner du temps — dépend surtout de moins renvoyer, relancer et rechercher.",
  };
  return map[priority ?? ""] ?? "Un portail client peut aligner organisation, communication et image en un seul endroit.";
}

export function computeAuditResult(answers: Answers): AuditResult {
  const totals: Record<Dimension, number[]> = {
    docs: [],
    comms: [],
    image: [],
    ops: [],
  };

  for (const question of auditQuestions) {
    if (question.contextual) continue;

    if (question.id === "q7") {
      const selected = (answers.q7 as string[]) ?? [];
      totals.comms.push(channelScore(selected.length));
      if (selected.includes("whatsapp")) totals.image.push(35);
      continue;
    }

    if (question.type === "multi") continue;

    const answer = answers[question.id];
    if (typeof answer !== "string") continue;
    const option = question.options.find((o) => o.id === answer);
    if (!option) continue;

    for (const key of dimensionKeys) {
      if (typeof option.scores[key] === "number") {
        totals[key].push(option.scores[key]!);
      }
    }
  }

  const dimensions = dimensionKeys.reduce(
    (acc, key) => {
      const values = totals[key];
      acc[key] =
        values.length > 0
          ? Math.round(values.reduce((a, b) => a + b, 0) / values.length)
          : 50;
      return acc;
    },
    {} as Record<Dimension, number>,
  );

  const overall = Math.round(
    dimensionKeys.reduce((sum, key) => sum + dimensions[key], 0) / dimensionKeys.length,
  );

  const strengths = dimensionKeys
    .map((key) => strengthLabel(key, dimensions[key]))
    .filter((v): v is string => Boolean(v))
    .slice(0, 3);

  if (strengths.length === 0) {
    strengths.push("Volonté claire d’améliorer votre organisation client");
  }

  const insights = collectInsights(answers);
  const weakest = [...dimensionKeys].sort((a, b) => dimensions[a] - dimensions[b]);
  const improvements: string[] = [];

  for (const insight of insights.slice(0, 3)) {
    improvements.push(insight);
  }

  for (const key of weakest) {
    if (improvements.length >= 3) break;
    if (dimensions[key] >= 55) continue;
    const line = `Axe à renforcer : ${dimensionLabels[key].toLowerCase()}.`;
    if (!improvements.includes(line)) improvements.push(line);
  }

  const defaultImprovements = [
    "Centraliser documents, validations et messages dans un espace unique.",
    "Réduire les relances et les renvois de pièces déjà transmises.",
    "Offrir à vos clients un point d’accès clair à l’avancement de leurs dossiers.",
  ];
  for (const line of defaultImprovements) {
    if (improvements.length >= 3) break;
    if (!improvements.includes(line)) improvements.push(line);
  }

  const q4 = answers.q4 as string | undefined;
  const q10 = answers.q10 as string | undefined;
  const pains = (answers.q11 as string[]) ?? [];
  const hoursSaved = Math.min(
    12,
    Math.round(baseHoursFromQ4(q4) * clientMultiplier(q10) + painBonus(pains) * 0.5),
  );

  const lowest = weakest[0];
  const recommendation =
    lowest === "docs"
      ? "Un portail client comme Arqow regrouperait vos documents par dossier, avec historique et versions, accessibles à vos clients 24h/24."
      : lowest === "comms"
        ? "Arqow réduit les allers-retours en centralisant messages, demandes et statuts dans un espace que vos clients consultent seuls."
        : lowest === "image"
          ? "Arqow vous permet de proposer un espace à votre image — logo, couleurs — pour une expérience client à la hauteur de votre structure."
          : "Arqow structure validations, historique et exports pour que vos équipes passent moins de temps à rechercher et relancer.";

  return {
    overall,
    dimensions,
    level: levelFor(overall),
    strengths: strengths.slice(0, 3),
    improvements: improvements.slice(0, 3),
    hoursSaved,
    recommendation,
    priorityLine: priorityLine(answers.q12 as string | undefined),
  };
}

export function scoredQuestionCount(): number {
  return auditQuestions.filter((q) => !q.contextual && q.id !== "q11").length;
}

export function questionByIndex(index: number): AuditQuestion {
  return auditQuestions[index];
}
