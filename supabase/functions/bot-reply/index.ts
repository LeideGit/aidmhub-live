import Anthropic from "npm:@anthropic-ai/sdk@0.130.0";
import { createClient } from "npm:@supabase/supabase-js@2.117.2";
import { buildContext, REPLY_SCHEMA, SYSTEM_PROMPT } from "./prompt.ts";
import { finalize, isValidReply } from "./guard.ts";

const MODEL = Deno.env.get("BOT_MODEL") ?? "claude-haiku-5-5";
const MAX_REPLIES_PER_HOUR = Number(Deno.env.get("BOT_MAX_REPLIES_PER_HOUR") ?? "30");
const ALLOWED_ORIGINS = (Deno.env.get("ALLOWED_ORIGINS") ?? "*").split(",").map((s) => s.trim());

const anthropic = new Anthropic({ maxRetries: 1, timeout: 20_000 });

function cors(req: Request): Record<string, string> {
  const origin = req.headers.get("origin") ?? "";
  const allow = ALLOWED_ORIGINS.includes("*") ? "*" : ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };
}

function json(req: Request, status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors(req), "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors(req) });
  if (req.method !== "POST") return json(req, 405, { error: "method_not_allowed" });

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return json(req, 401, { error: "unauthorized" });

  // Caller's JWT: every read/write below goes through RLS as that demo session.
  const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: auth } = await db.auth.getUser();
  if (!auth?.user) return json(req, 401, { error: "unauthorized" });

  let conversationId: string;
  try {
    ({ conversationId } = await req.json());
    if (typeof conversationId !== "string") throw new Error();
  } catch {
    return json(req, 400, { error: "bad_request" });
  }

  const { data: conv } = await db.from("conversations").select("*").eq("conversation_id", conversationId).maybeSingle();
  if (!conv) return json(req, 404, { error: "conversation_not_found" });
  const botId = (conv.participant_ids as string[]).find((id) => id.startsWith("bot_"));
  if (!botId) return json(req, 400, { error: "not_a_bot_conversation" });

  const since = new Date(Date.now() - 3600_000).toISOString();
  const { count } = await db.from("messages").select("message_id", { count: "exact", head: true })
    .eq("type", "bot_response").eq("metadata->>source", "llm").gte("created_at", since);
  if ((count ?? 0) >= MAX_REPLIES_PER_HOUR) return json(req, 429, { error: "rate_limited" });

  const [{ data: bot }, { data: users }, { data: history }] = await Promise.all([
    db.from("bots").select("*").eq("bot_id", botId).single(),
    db.from("users").select("user_id,name,role"),
    db.from("messages").select("sender_id,type,text,metadata,created_at").eq("conversation_id", conversationId)
      .order("created_at", { ascending: false }).limit(20),
  ]);
  const [{ data: machine }, { data: alarm }, { data: caseRow }] = await Promise.all([
    db.from("machines").select("name,machine_group").eq("machine_id", bot.machine_id).maybeSingle(),
    conv.alarm_id
      ? db.from("alarms").select("alarm_type,level,status,sensor,sensor_value,sensor_unit,normal_value,escalation_reason,created_at")
        .eq("alarm_id", conv.alarm_id).maybeSingle()
      : Promise.resolve({ data: null }),
    conv.case_id
      ? db.from("cases").select("case_id,title,status,priority").eq("case_id", conv.case_id).maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  const msgs = (history ?? []).reverse();
  const last = msgs.at(-1);
  if (!last || last.sender_id === botId || last.type !== "text") {
    return json(req, 409, { error: "no_pending_question" });
  }

  const nameOf = (id: string) =>
    id === botId ? bot.name : (users ?? []).find((u) => u.user_id === id)?.name ?? id;
  const context = buildContext({
    bot,
    machine,
    alarm,
    caseInfo: caseRow,
    history: msgs.map((m) => ({
      sender: nameOf(m.sender_id),
      type: m.type,
      text: m.type === "bot_response"
        ? `[DATA] ${m.metadata?.data} [TOLKNING] ${m.metadata?.interpretation} [REKOMMENDATION] ${m.metadata?.recommendation}`
        : m.text,
      at: m.created_at,
    })),
  });

  let parsed: unknown;
  try {
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 1500,
      system: SYSTEM_PROMPT,
      output_config: { effort: "low", format: { type: "json_schema", schema: REPLY_SCHEMA } },
      messages: [{
        role: "user",
        content: `${context}\n\nSvara på den senaste frågan från ${nameOf(last.sender_id)}: "${last.text}"`,
      }],
    });
    if (response.stop_reason === "refusal") {
      console.warn("refusal", response.stop_details);
      return json(req, 502, { error: "model_refused" });
    }
    const text = response.content.find((b) => b.type === "text");
    parsed = text && text.type === "text" ? JSON.parse(text.text) : null;
  } catch (err) {
    if (err instanceof Anthropic.RateLimitError) return json(req, 429, { error: "upstream_rate_limited" });
    if (err instanceof Anthropic.APIError) {
      console.error("anthropic api error", err.status, err.message);
      return json(req, 502, { error: "upstream_error" });
    }
    console.error("bot-reply failure", err);
    return json(req, 502, { error: "upstream_error" });
  }

  if (!isValidReply(parsed)) return json(req, 502, { error: "invalid_model_output" });

  const { reply, blocked } = finalize(parsed);
  if (blocked) console.warn("guard blocked reply", { conversationId, match: blocked });

  const { data: saved, error } = await db.from("messages").insert({
    conversation_id: conversationId,
    sender_id: botId,
    type: "bot_response",
    text: `[DATA] ${reply.data}\n[TOLKNING] ${reply.interpretation}\n[REKOMMENDATION] ${reply.recommendation}`,
    metadata: { ...reply, source: "llm", model: MODEL, guardBlocked: Boolean(blocked) },
  }).select().single();
  if (error) {
    console.error("insert failed", error);
    return json(req, 500, { error: "persist_failed" });
  }

  return json(req, 200, { message: saved });
});
