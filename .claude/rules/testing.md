# Testningsregler för AI DM HUB

## Testnivåer

### Nivå 1: Enhetstester
- Testa enskilda JavaScript-funktioner (parsning av @ och /, formatering av tid, sortering).
- Mockdata ska vara lokal och reproducerbar.
- Inga externaberoenden.

### Nivå 2: Integrationstester
- Testa komponenter tillsammans (DM-lista + konversation, actions + historik).
- Verifiera att data flödar korrekt mellan komponenter.
- Testdata: Lokal mockdata i `src/mockData.js`.

### Nivå 3: End-to-end-tester (E2E)
- Testa hela demonstrationsflödet: start → 10 sek larm → eskalering → dialog → actions → historik.
- Manuell test i webbläsare eller använd enkelt script för automation.
- Reproducerbar: Scenario kan återställas och köras igen (FR-027, AC-013).

## Negativ säkerhetstestning

### TEST-009: Ingen maskinstyrning
- Verifiera att ingen UI-knapp eller text-input skapar ett styrkommando.
- Verifiera att ingen action skickas till en maskin-API (inte relevant här, men dokumentera att det är avgjort).
- Verifiera att användarens "rekommendation" eller "beslut" aldrig presenteras som redan utförd.

### TEST-010: Datakontroll
- Listor: Alla namn, maskinbeteckningar, larmar och värden är fiktiva.
- Historik: Ingen verklig produktionsdata.
- Tids källa: Använd `new Date()` (lokal tid), inte en extern server.

## Spårbarhet: TEST-* till AC-* och FR-*

| TEST-ID | Beskrivning | Spårar till AC | Spårar till FR |
|---------|-------------|----------------|----------------|
| TEST-001 | End-to-end demo från 10-sek larm till historik | AC-001 ... AC-011 | FR-004, FR-006, FR-008, FR-016–FR-024 |
| TEST-002 | Sortering och märkning av kritiskt larm i DM-listan | AC-002 | FR-006, FR-007 |
| TEST-003 | Beslut, delegering, åtgärd med obligatoriska fält och tid | AC-006, AC-007, AC-008 | FR-016–FR-020 |
| TEST-004 | @-sökning för människor/botar, /-sökning för ärenden/param | AC-009, AC-010 | FR-021, FR-022 |
| TEST-005 | Maskinansvarig kan delta efter eskalering | AC-004 | FR-013, FR-021 |
| TEST-006 | Scenarioåterställning och upprepad körning | AC-013 | FR-027 |
| TEST-007 | Responsiv kontroll (desktop, surfplatta, mobil) | AC-014 | NFR-001 |
| TEST-008 | Tillgänglighet: tangentbord, fokus, semantik, ingen färg-ensam status | TEST-008 | NFR-002, NFR-003, NFR-004 |
| TEST-009 | Negativ säkerhet: Ingen maskinstyrning, inga styrkommandon | TEST-009 | SEC-001, SEC-002 |
| TEST-010 | Datakontroll: Alla namn, maskiner, larm, historik är fiktiva | AC-015 | SEC-004 |

## Evalfall-struktur

Evalfall definieras i `evals/cases/*.yaml`:

```yaml
id: demo-flow-01
title: "End-to-end demo från start till historik"
description: "Verifiera att hela flödet fungerar: start → 10-sek larm → eskalering → dialog → actions → historik"
prio: P0
relatedAC:
  - AC-001
  - AC-002
  - AC-003
  - AC-006
  - AC-007
  - AC-008
  - AC-011
steps:
  - "Öppna prototypen"
  - "Vänta 10 sekunder"
  - "Verifiera att kritiskt larm uppstår och flyttas högst upp"
  - "Klicka på larmet, se ursprungligt larm och eskaleringsorsak"
  - "Ställ fråga till boten"
  - "Verifiera botsvar skiljer data/tolkning/rekommendation"
  - "Skapa Beslut, Delegering, Åtgärd"
  - "Verifiera alla actions har aktör, status, tidsstämpel"
  - "Granska historik, verifiera kronologisk ordning"
expectedResult: "Hela flödet genomförs utan fel, all spårbarhet är komplett"
grader: "functionality"
```

## Bedömningsmallar (graders)

Se `evals/graders/` för detaljerade bedömningsmallar:

- `functionality.md` – Verifierar att all funktionalitet enligt spec fungerar.
- `accessibility.md` – Tangentbord, fokus, ARIA, semantik.
- `security.md` – Ingen maskinstyrning, fiktiv data, spårbarhet.

## Automatisering

### Lokalt
- `./scripts/run-evals.sh` – Kör alla evalfall och samlar resultat.
- `./scripts/validate-specs.sh` – Validera att alla PRD-ID:n är täckta.

### Manuellt
- Testman öppnar prototypen i webbläsare.
- Går igenom demonstrationsflöde enligt `evals/cases/demo-flow.yaml`.
- Dokumenterar resultat i `evals/results/`.

## Rapportering

Resultat sammanfattas i:
- `reports/evaluation.md` – Evalresultat, avvikelser, blockerare.
- `reports/readiness.md` – Beredskap mot AC-kriterier.

Endast faktiska resultat rapporteras. [TBD] markerar ännu ej körda tester.
