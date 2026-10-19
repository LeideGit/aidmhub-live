# Traceability-rapport för AI DM HUB (aidmhub-live)

**Datum:** 2026-10-19
**Version:** 2.0 (ersätter planeringsrapporten 2024-10-14)

Spårning PRD-ID → feature → implementation → test → resultat. Resultat från [`evals/results/2026-10-19-backend.md`](../evals/results/2026-10-19-backend.md). ✅ = observerat godkänt, ⚠️ = delvis, [TBD] = ej kört.

## Funktionella krav

| FR | Krav (kort) | Feature | Implementation | Test / AC | Resultat |
|----|-------------|---------|----------------|-----------|----------|
| FR-001–FR-002, FR-025 | DM-lista med människor och botar | FEAT-DM-list | `app.js` `renderDMList`; `conversations` | AC-012 | ✅ |
| FR-004 | Larm efter 10 s | FEAT-critical-alert | `startAlarmTimer`, RPC `trigger_alarm` (idempotent) | TEST-001, AC-001 | ✅ |
| FR-006–FR-007 | Larm överst, tydlig märkning | FEAT-critical-alert | sortering `priority = critical` | TEST-002, AC-002 | ✅ |
| FR-008–FR-012 | Larmdetaljer, kvittering, eskalering | FEAT-critical-alert | banner, `alarms`, RPC `acknowledge_alarm` | AC-003 | ✅ |
| FR-013 | Insyn för Maskinansvarig | FEAT-mentions | `@` → `invited_ids`; historikens deltagare | TEST-005, AC-004 | ✅ offline, online [TBD] |
| FR-014–FR-015 | Följdfrågor, data/tolkning/rekommendation | FEAT-actions / bot | `generateBotResponse` (mall); Edge Function `bot-reply` (LLM) | AC-005 | ⚠️ mall ✅, LLM [TBD] |
| FR-016–FR-020 | Beslut, delegering, åtgärd med metadata | FEAT-actions | `case_events`, `handleSave*` | TEST-003, AC-006–AC-008 | ✅ beslut; delegering/åtgärd ⚠️ |
| FR-021 | @ kopplar in kollegor/botar | FEAT-mentions | `src/composer.js`, `api.invite` | TEST-004, AC-009 | ✅ offline |
| FR-022 | / infogar ärenden/parametrar/kontext | FEAT-mentions | `src/composer.js` `referenceCandidates` | TEST-004, AC-010 | ✅ offline |
| FR-023–FR-024 | Historik, kronologisk, aktör tydlig | FEAT-history | `buildHistory`/`renderHistory` | TEST-001, AC-011 | ✅ offline |
| FR-027 | Återställning | – | RPC `reset_scenario`, `handleReset` | TEST-006, AC-013 | ✅ |
| FR-028 | Rekommendation märkt beslutsstöd | – | rubrik i `renderMessages`, `guard.ts` | TEST-009 | ✅ UI |

## Icke-funktionella krav och säkerhet

| ID | Implementation | Test | Resultat |
|----|----------------|------|----------|
| NFR-001 | CSS media queries | TEST-007, AC-014 | ⚠️ 1920 px + 375 px ✅, 768 px [TBD] |
| NFR-002–NFR-004 | ARIA (combobox/listbox, historik `aside`/`ol`), text + ikon | TEST-008 | ⚠️ automatiserad DOM-kontroll; skärmläsare [TBD] |
| SEC-001 | Ingen styrkanal; `guard.ts` | TEST-009, llm-safety-01 | ⚠️ guard i Node ✅, LLM [TBD] |
| SEC-002–SEC-003 | Beslutsstödsrubrik + säkerhetsfot | TEST-009 | ✅ UI |
| SEC-004 | Fiktiv seed, CAPTCHA, RLS | TEST-010, persistence-01 | ✅ |
| SEC-005 | `case_events`, historikpanel | TEST-001, AC-011 | ✅ |

## Scope utanför PRD

Persistens, hosting och LLM-anrop är en dokumenterad scope-utökning i [ADR-001](../docs/adr/ADR-001-backend-supabase-llm.md); de införs inte som nya PRD-ID:n. Evalfall: `persistence-01`, `llm-safety-01`.

## Luckor

| Lucka | Ansvarig | Nästa steg |
|---|---|---|
| Online-verifiering av FEAT-mentions/history | Johan | hCaptcha site key + migration `20261019120000` |
| LLM-svar och llm-safety-01 | Johan | Deploy `bot-reply` (pausad) |
| FEAT-conversation, FEAT-responsive specs saknas | – | Skriv när de prioriteras |
