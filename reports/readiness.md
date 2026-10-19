# Readiness-rapport för AI DM HUB (aidmhub-live)

**Datum:** 2026-10-19
**Status:** Implementerad, delvis verifierad
**Version:** 2.0 (ersätter planeringsrapporten 2024-10-14)
**Underlag:** [`evals/results/2026-10-19-backend.md`](../evals/results/2026-10-19-backend.md), [ADR-001](../docs/adr/ADR-001-backend-supabase-llm.md)

## Sammanfattning

Hela demonstrationsflödet är implementerat, inklusive persistent backend (Supabase), @-omnämnanden, /-referenser och ärendehistorik. Automatiserade körningar i headless Chrome bekräftar AC-001–AC-004 och AC-006–AC-013. Kvar att verifiera: LLM-botsvar och llm-safety-01 (pausat) samt skärmläsare. Online-flödet, delegering, åtgärd och responsiv design har bekräftats manuellt.

**Status:** "Verifierad" betyder observerad i en automatiserad körning eller manuellt bekräftad av Johan Leidefors den 2026-10-19. "Delvis" betyder att något av det som krävs inte är kört.

## Beredskap mot acceptanskriterier

| AC-ID | Krav | Status | Bevis / kvarstår |
|-------|------|--------|------------------|
| AC-001 | 10-sekunderslarmet uppstår automatiskt | ✅ Verifierad | Online och offline |
| AC-002 | Larmet märks högst upp i listan | ✅ Verifierad | Text "KRITISK" + ikon + färg |
| AC-003 | Larmdetaljer, eskaleringsorsak visas | ✅ Verifierad | Banner + larmmeddelande; roll visas korrekt (bugg rättad) |
| AC-004 | Maskinansvarig kan kopplas in efter eskalering | ✅ Verifierad | `@Anna Bergström` kopplar in; online bekräftat manuellt |
| AC-005 | Botsvar skiljer data/tolkning/rekommendation | ⚠️ Delvis | Mallsvar verifierat; LLM-svar ej deployat |
| AC-006 | Beslut sparas med text, beslutsfattare, tid | ✅ Verifierad | Även efter omladdning mot Supabase |
| AC-007 | Delegering sparas med uppgift, parter, status, tid | ✅ Verifierad | Online, manuellt bekräftat |
| AC-008 | Åtgärd sparas med utförare, status, tid | ✅ Verifierad | Online, manuellt bekräftat |
| AC-009 | @ öppnar val, valt objekt infogas/kopplas | ✅ Verifierad | Desktop + mobil offline; online manuellt |
| AC-010 | / öppnar val, valt objekt infogas i texten | ✅ Verifierad | Desktop + mobil offline; online manuellt |
| AC-011 | Historiken visar samtliga spårbarhetsfält kronologiskt | ✅ Verifierad | 7 händelsetyper + deltagare, stigande tid; online manuellt |
| AC-012 | DM-lista med flera människor och botar, skiljbara | ✅ Verifierad | 2 kollegor + 3 botar, ikon + text |
| AC-013 | Scenario kan återställas och köras igen | ✅ Verifierad | `reset_scenario()`, endast CASE-001/002 kvar |
| AC-014 | Responsiv och tillgänglig | ⚠️ Delvis | Responsivitet ✅ (1920/375 px automatiskt + manuellt bekräftat); skärmläsare [TBD] |
| AC-015 | Ingen maskinstyrning, fiktiv data | ⚠️ Delvis | Ingen styrkanal i schema/API; guard testad i Node; llm-safety-01 [TBD] |

**Verifierade:** 12/15, 3 delvis (AC-005, AC-014, AC-015).

## Säkerhet

- **SEC-001:** Inga tabeller, RPC:er eller endpoints för maskinstyrning. LLM-guarden ersätter svar som påstår maskinåtgärder (7/7 blockerade i Node-körning).
- **SEC-002/003:** Botsvar rubriceras "Rekommendation (beslutsstöd)" med källa; LLM-svar får säkerhetsfot.
- **SEC-004:** Endast fiktiv seed-data. Fritext sparas per anonym session; CAPTCHA aktiverad mot missbruk.
- **SEC-005:** `case_events` + historikpanel visar aktör, mottagare, status och tid.
- **Åtkomst:** RLS verifierad: nekad läsning utan session, nekad skrivning i referensdata, nekad förfalskad `owner`, isolerade sessioner.

## Blockerare

| Blockerare | Påverkar | Ansvarig | Nästa steg |
|---|---|---|---|
| Edge Function pausad | AC-005 (LLM), llm-safety-01 | Johan | Se BACKEND.md när aktuellt |

## Go/No-Go för demo

- **Go för offline-demo:** Ja.
- **Go för publik online-demo:** Ja, med mallbaserade botsvar. CAPTCHA och RLS aktiva.
