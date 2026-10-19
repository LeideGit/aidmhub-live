# Backend (Supabase + Claude)

Se [ADR-001](docs/adr/ADR-001-backend-supabase-llm.md) för beslut och säkerhetsbarriärer. PRD:n är oförändrad.

```
GitHub Pages (index.html, src/*)  ──supabase-js──►  Supabase
                                                    ├─ Postgres + RLS (en isolerad demosession per webbläsare)
                                                    ├─ RPC: start_scenario, reset_scenario, trigger_alarm, acknowledge_alarm
                                                    └─ Edge Function bot-reply ──► Claude API (secret)
```

Utan konfiguration körs appen i **offline-läge** (minnesdata + mallsvar), precis som tidigare prototyp.

## Engångssetup

1. Skapa ett projekt på supabase.com.
2. *Authentication → Sign In / Providers*: aktivera **Anonymous sign-ins**. Rekommenderat för publik demo: aktivera CAPTCHA och rate limits.
3. Installera CLI: `brew install supabase/tap/supabase`
4. ```bash
   supabase login
   supabase link --project-ref <ref>
   cp supabase/functions/.env.example supabase/functions/.env   # fyll i ANTHROPIC_API_KEY
   supabase secrets set --env-file supabase/functions/.env
   ./scripts/deploy-backend.sh
   ```
5. Fyll i `src/config.js` med *Project URL* och *anon public key* (publika per design – åtkomst styrs av RLS). Pusha till `main`.

## Lokalt

```bash
supabase start                 # kräver Docker
supabase db reset              # kör migrationen
supabase functions serve bot-reply --env-file supabase/functions/.env
deno test supabase/functions/bot-reply   # guard-tester (SEC-001/002/003)
```
Sätt `src/config.js` till `http://127.0.0.1:54321` och den lokala anon-nyckeln från `supabase status`, kör sedan `./scripts/run.sh`.

## Datamodell

| Tabell | Innehåll |
|---|---|
| `machines`, `users`, `bots` | Fiktiv referensdata, endast läsbar |
| `conversations`, `messages` | DM-lista och meddelanden per session |
| `alarms` | Det eskalerade larmet inkl. `ack_deadline` och kvitteringsstatus |
| `cases`, `case_events` | Ärenden och Beslut/Delegering/Åtgärd med aktör, mottagare, status, tid (SEC-005) |

## Kostnadsskydd

`BOT_MAX_REPLIES_PER_HOUR` (standard 30) per session, `max_tokens` 1500, `effort: low`, modell `claude-haiku-5-5` (ändras med `BOT_MODEL`).

**Skriv inga verkliga uppgifter i demon** – fritext sparas i demodatabasen.
