# FEAT-history: Ärendehistorik i ärendevyn

**Status:** Done
**PRD-länk:** UC-09, FR-023, FR-024, AC-011, SEC-005, TEST-001
**Relaterade FEAT:** FEAT-actions, FEAT-critical-alert, FEAT-mentions

## 1. Syfte
Visa hela kedjan från ursprungligt maskinlarm till mänsklig åtgärd i kronologisk ordning, med händelsetyp och aktör tydliga, så att det går att granska vem som beslutade och utförde vad.

**Beslut 2026-10-19 (Johan Leidefors):** Historiken visas i ärendevyn (fliken Ärenden → välj ärende). Den separata historikpaneln och knappen i sidhuvudet är borttagna eftersom de var redundanta. PRD:ns krav FR-023, FR-024 och AC-011 är oförändrade; de uppfylls nu av ärendevyn.

## 2. Omfattning
- **Ingår:** Avsnittet "Historik" i ärendevyn för valt ärende; samtliga spårbarhetsfält enligt FR-023.
- **Utgår:** Separat historikpanel, export, filtrering, redigering av historik.

## 3. Relaterade PRD-ID:n

| Typ | ID | Beskrivning |
|-----|----|----|
| FR | FR-023 | Ärende, ursprungligt larm, botens tolkning och rekommendation, frågor, deltagare, delegering, beslut, kvittering, tidsstämplar, utförare |
| FR | FR-024 | Kronologisk, händelsetyp och aktör tydliga |
| AC | AC-011 | Samtliga spårbarhetsfält i kronologisk ordning |
| SEC | SEC-005 | Mänsklig beslutsfattare och utförare tydliga |

## 4. Fält → källa

| FR-023-fält | Händelsetyp i ärendevyn | Källa |
|---|---|---|
| Ärende | Ärendehuvud + "Ärende skapat" | `cases` |
| Ursprungligt maskinlarm | "Ursprungligt maskinlarm" (+ "Eskalering") | `alarms` |
| Botens tolkning och rekommendation | "Botens tolkning och rekommendation (beslutsstöd)" | `messages` typ `bot_response` |
| Ställda frågor | "Fråga" | `messages` typ `text` från aktuell användare |
| Deltagare | Rubrikrad "Deltagare" | konversationens deltagare + `invited_ids` + Maskinansvarig + delegeringsmottagare |
| Delegering | "Delegering" (från → till, status) | `case_events` kind `delegation` |
| Beslut | "Beslut" | `case_events` kind `decision` |
| Kvittering | "Kvittering" | `messages` typ `acknowledgment` |
| Utförare | "Åtgärd (utförd av människa)" med aktör | `case_events` kind `action` |
| Tidsstämplar | `<time datetime>` per händelse | `created_at` |

## 5. UI-krav
- Avsnittet är `section` med `aria-label="Ärendehistorik"`, händelser i `<ol>` med `<time datetime>`.
- Varje händelse: ikon + typtext + "Aktör:" + detalj + tid (ej färg-ensam).
- Händelser med samma tidsstämpel ordnas larm → eskalering → ärende skapat.

## 6. Kantfall
- Ärende utan larm eller konversation: visar "Ärende skapat" och eventuella beslut, delegeringar och åtgärder.
- Avslutade äldre ärenden (CASE-001/002): visar ärendeskapande och eventuella events.

## 7. Test

| TEST-ID | AC-ID | Verifiering |
|---------|-------|------------|
| TEST-001 | AC-011 | Efter larm, @-inkoppling, fråga, botsvar, beslut, delegering, åtgärd och kvittering visar ärendevyn samtliga 9 händelsetyper och 4 deltagare, alla tidsstämplar stigande |

## 8. Definition of Done
- [x] Implementerad (`AIHubApp.buildHistory` + `renderCaseContent` i `src/app.js`)
- [x] Kronologisk ordning verifierad automatiskt (stigande `datetime`)
- [x] Desktop och mobil utan horisontell scroll
