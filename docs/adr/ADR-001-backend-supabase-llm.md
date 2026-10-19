# ADR-001: Persistent backend (Supabase) och LLM-baserade botsvar

**Status:** Accepted
**Date:** 2026-10-19
**Decision maker:** Johan Leidefors (produktägare prototyp)

## Problem

Prototypen i `LeideGit/aidmhub` håller allt tillstånd i minnet (`mockData`) och botsvaren är fem hårdkodade nyckelordsmallar. Vi vill demonstrera samma flöde med (1) persistens över omladdning och (2) verkliga språkmodellsvar, hostat på GitHub Pages.

**Koppling till PRD:**
- PRD:ns avgränsningar anger "Ingen hosting, CI/CD" och "Ingen verklig autentisering". Denna ADR är en **medveten scope-utökning för detta repo** och ändrar inte PRD:n, som förblir oförändrad och auktoritativ.
- SEC-001…SEC-005 gäller oförändrat och är skärpta (se nedan).
- Berörda krav: FR-004 (10-sek larm), FR-016–FR-020 (actions), FR-027/AC-013 (återställning), SEC-002 (beslutsstödsmärkning).

## Options

1. **Supabase (Postgres + RLS + Edge Functions)** – anropas direkt från statisk Pages-frontend; ingen egen server.
2. Egen Node-API på Render/Fly – full kontroll men en tjänst att drifta.
3. Cloudflare Workers + D1 – billigt, mer egen kod.

## Decision

Vi väljer **Option 1 (Supabase)**.

- **Identitet:** Supabase *anonymous sign-in*. Varje webbläsare får en isolerad demosession; ingen inloggning, inga personuppgifter. Den agerande användaren i UI är fortsatt den fiktiva "Erik Svensson".
- **Isolering:** RLS `owner = auth.uid()` på alla sessionstabeller. Referensdata (maskiner, användare, botar) är endast läsbar.
- **LLM:** Edge Function `bot-reply` anropar Claude (`claude-haiku-5-5`, konfigurerbar via `BOT_MODEL`) med strukturerad output `{data, interpretation, recommendation}`. API-nyckeln finns endast som Supabase-secret.
- **Offline-läge:** Saknas konfiguration eller backend faller UI tillbaka till minnesbaserad mockdata och mallsvar ("Offline-svar (mall)").

## Säkerhetsbarriärer (SEC-*)

| SEC | Åtgärd |
|-----|--------|
| SEC-001 | Inga tabeller, funktioner eller endpoints representerar maskinstyrning. Systemprompten förbjuder styrkommandon och påståenden om utförda maskinåtgärder. `guard.ts` ersätter svar som matchar sådana formuleringar med en säker vägran. |
| SEC-002 | Varje botsvar renderas med rubriken "Rekommendation (beslutsstöd)" och källa (AI-genererat / mall). Rekommendationsfältet får alltid en säkerhetsfot. |
| SEC-003 | Säkerhetsfoten anger att befintliga säkerhets-, larm- och nödstoppssystem alltid gäller. |
| SEC-004 | All seed-data är fiktiv. Fritext som användare skriver lagras i demodatabasen per anonym session; UI och README uppmanar att inte skriva verkliga uppgifter. |
| SEC-005 | `case_events` lagrar aktör, ev. mottagare, status och tidsstämpel för varje Beslut/Delegering/Åtgärd. |

## Consequences

### Positiva effekter
- Flödet överlever omladdning; larmet utlöses inte två gånger (`trigger_alarm()` är idempotent) och nedräkningen återupptas från `ack_deadline`.
- Verkliga, kontextuella botsvar baserade på databasens larm- och konversationsdata (läses server-side under anroparens JWT).
- Återställning (`reset_scenario()`) ger ett helt rent scenario, vilket åtgärdar tidigare kvarvarande meddelanden/ärenden.

### Negativa effekter / risker
- Extern tjänst och kostnad för LLM-anrop → begränsas av `BOT_MAX_REPLIES_PER_HOUR` per session och `max_tokens`.
- Anonyma sessioner kan skapas fritt → aktivera CAPTCHA/rate limits för anonym inloggning i Supabase-projektet vid publik demo.
- LLM-svar är icke-deterministiska → säkerhetsevalen (`evals/cases/llm-safety.yaml`) måste köras och resultat registreras faktiskt, aldrig fabriceras.
