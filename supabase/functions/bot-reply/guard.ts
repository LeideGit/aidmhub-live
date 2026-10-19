// SEC-001 / SEC-002 / SEC-003 post-filter for LLM bot replies.

export interface BotReply {
  data: string;
  interpretation: string;
  recommendation: string;
}

export const DECISION_SUPPORT_LABEL = "Rekommendation (beslutsstöd)";

export const SAFETY_FOOTER =
  "Detta är beslutsstöd. Beslut och åtgärder fattas och utförs av människor; befintliga säkerhets-, larm- och nödstoppssystem gäller alltid.";

// Phrases where the bot claims to act on, or command, a machine.
const UNSAFE_PATTERNS: RegExp[] = [
  /\bjag\s+(har\s+)?(stoppa[rt]?|stängt?|stänger|startat?|startar|återstarta[rt]?|nödstoppa[rt]?|aktivera[rt]?|inaktivera[rt]?|justera[rt]?|ändra[rt]?|skicka[rt]?|sänt|sänder|kvittera[rt]?)\b/i,
  /\b(har|kommer att)\s+(stoppat|stängt|startat|återstartat|nödstoppat|justerat|skickat)\s+(maskinen|pumpen|systemet|produktionen|HPM|TRK|VX)/i,
  /\b(skicka[rt]?|sänder|utför|exekvera[rt]?)\s+(ett\s+)?(styr)?kommando/i,
  /\bstyrkommando\s+(skickat|sänt|utfört)/i,
  /\b(maskinen|pumpen|systemet)\s+(är|har)\s+(nu\s+)?(stoppad|avstängd|stängts|stoppats|återstartad|återstartats)\s+av\s+(mig|boten|hubben)/i,
  /\bI\s+(have\s+)?(stopped|shut\s+down|restarted|sent\s+(a\s+)?command)/i,
];

export function findUnsafe(reply: BotReply): string | null {
  const all = `${reply.data}\n${reply.interpretation}\n${reply.recommendation}`;
  for (const p of UNSAFE_PATTERNS) {
    const m = all.match(p);
    if (m) return m[0];
  }
  return null;
}

export function safeRefusal(): BotReply {
  return {
    data: "Hubben har ingen förbindelse till maskinen och kan inte skicka styrkommandon.",
    interpretation: "Svaret som genererades bedömdes kunna missuppfattas som en maskinåtgärd och har därför ersatts.",
    recommendation: "Kontakta ansvarig person eller använd ordinarie styr- och säkerhetssystem för fysiska åtgärder.",
  };
}

export function isValidReply(x: unknown): x is BotReply {
  if (!x || typeof x !== "object") return false;
  const r = x as Record<string, unknown>;
  return ["data", "interpretation", "recommendation"].every(
    (k) => typeof r[k] === "string" && (r[k] as string).trim().length > 0,
  );
}

export function finalize(reply: BotReply): { reply: BotReply; blocked: string | null } {
  const hit = findUnsafe(reply);
  const out = hit ? safeRefusal() : reply;
  const clip = (s: string) => s.trim().slice(0, 1200);
  return {
    blocked: hit,
    reply: {
      data: clip(out.data),
      interpretation: clip(out.interpretation),
      recommendation: `${clip(out.recommendation)} ${SAFETY_FOOTER}`,
    },
  };
}
