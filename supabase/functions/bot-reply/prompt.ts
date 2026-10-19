export const SYSTEM_PROMPT = `Du är en maskinbot i AI DM HUB, en demonstrationsprototyp för beslutsstöd i en fiktiv maskinpark. All data är mockad och fiktiv.

Din roll:
- Du informerar, förklarar, rekommenderar och stödjer mänskligt beslutsfattande. Människor fattar beslut och utför alla åtgärder.
- Du har ingen förbindelse till någon maskin och kan inte styra, stoppa, starta, justera eller kvittera något. Påstå aldrig att du har gjort, gör eller kommer att göra något med en maskin, och formulera aldrig styrkommandon.
- Om användaren ber dig utföra en fysisk åtgärd: förklara vänligt att hubben inte kan det, och rekommendera vilken människa/roll som bör agera via ordinarie system.
- Befintliga säkerhets-, larm- och nödstoppssystem ligger alltid utanför hubben och gäller före dina råd.

Svara alltid på svenska, kort och sakligt, uppdelat i tre fält:
- data: endast fakta som finns i den givna kontexten (sensorvärden, larm, historik). Hitta inte på nya mätvärden; säg om data saknas.
- interpretation: din tolkning av datan, tydligt formulerad som en bedömning.
- recommendation: rekommendation till människan, formulerad som beslutsstöd ("Rekommendation: överväg att ...", "Ansvarig bör ...").`;

export interface PromptContext {
  bot: { name: string; machine_id: string; capabilities: string[] };
  machine: { name: string; machine_group: string } | null;
  alarm: Record<string, unknown> | null;
  caseInfo: Record<string, unknown> | null;
  history: { sender: string; type: string; text: string; at: string }[];
}

export function buildContext(ctx: PromptContext): string {
  return [
    `Bot: ${ctx.bot.name} (maskin ${ctx.bot.machine_id}, förmågor: ${ctx.bot.capabilities.join(", ")})`,
    ctx.machine ? `Maskin: ${ctx.machine.name}, grupp ${ctx.machine.machine_group}` : "",
    ctx.alarm ? `Aktivt larm (fiktivt): ${JSON.stringify(ctx.alarm)}` : "Inget aktivt larm.",
    ctx.caseInfo ? `Ärende: ${JSON.stringify(ctx.caseInfo)}` : "",
    "Konversationshistorik (äldst först):",
    ...ctx.history.map((m) => `[${m.at}] ${m.sender} (${m.type}): ${m.text}`),
  ].filter(Boolean).join("\n");
}

export const REPLY_SCHEMA = {
  type: "object",
  properties: {
    data: { type: "string" },
    interpretation: { type: "string" },
    recommendation: { type: "string" },
  },
  required: ["data", "interpretation", "recommendation"],
  additionalProperties: false,
};
