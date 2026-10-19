# Evaluator-agent för AI DM HUB

**Syfte:** Kontrollera att implementationen uppfyller PRD:ns krav, acceptanskriterier och säkerhetsprinciper.

## Primär ansvar

Evaluatorn säkerställer att:
1. Det kritiska 10-sekunderslarmet utlöses, eskaleras och visas korrekt (AC-001, AC-002, AC-003).
2. DM-sorteringen är korrekt (larmet högst upp, tydlig märkning).
3. Botdialogen fungerar och skilja data, tolkning, rekommendation (AC-005, FR-015).
4. Alla actions (Beslut, Delegering, Åtgärd) sparas med obligatoriska fält + tidsstämpel (AC-006, AC-007, AC-008).
5. @-omnämnanden och /-kommandon fungerar (AC-009, AC-010).
6. Historiken är kronologisk, komplett och spårbar (AC-011).
7. Maskinansvarig återstår synlig/kan kopplas in efter eskalering (AC-004).
8. Responsiv layout fungerar på desktop, surfplatta, mobil (AC-014).
9. Tillgänglighet: tangentbord, fokus, ingen färg-ensam status för kritiska larm (TEST-008, NFR-002, NFR-003).
10. Säkerhet: Aldrig maskinstyrning, all data fiktiv, ingen verklig integration (TEST-009, TEST-010, SEC-001–SEC-004).

## Evalfall som testas

### Positivt flöde: End-to-end demo
- Prototypen startas.
- Efter 10 sek: kritiskt larm uppstår automatiskt.
- Larmet visas högst upp med märkning.
- Användaren klickar på larmet, ser ursprungligt larm + eskaleringsorsak.
- Användaren ställer fråga till boten, får svar.
- Användaren skapar Beslut, Delegering, Åtgärd – alla sparas med aktör + tid.
- Användaren granskar historik – allt är kronologiskt och spårbart.

### Negativa flöden och kantfall
- Maskinansvarig försöker koppla in sig igen – lyckas via @ eller är redan synlig.
- Användaren försöker ändra ett sparat beslut – kan inte (endast läsa).
- Användaren försöker skicka styrkommando via chatfältet – ingen effekt, ingen funktion stödjer det.

### Responsivitet
- Desktop (1920px): Full layout, all information synlig.
- Surfplatta (768px): Layout justerar, ingen horisontell scrollning.
- Mobil (375px): Staplad layout, kärnflödet fungerar (DM-lista, konversation, actions).

### Tillgänglighet
- Tangentbord: Tab mellan DM-listelement, Enter för att öppna, Tab i konversation, knapparna är åtkomliga.
- Synligt fokus: Alltid synligt när Tab-fokus flyttas.
- Kritiska larm: Inte enbart färg – text + ikon + semantisk HTML.
- Skärmläsare: Etiketter är meningsfulla, roller är tydliga.

### Säkerhet
- Ingen funktion skapar ett styrkommando eller skickar något till en maskin.
- All visad data är fiktiv (namn, maskiner, larm, svar).
- Historiken visar vem som fattade beslut, vem som delegerade, vem som utförde åtgärd – aldrig något automatiskt.

## Bedömningskriterier

Se `evals/graders/` för detaljerade bedömningsmallar.

## Rapportering

Resultat sammanfattas i:
- `reports/evaluation.md` – evalresultat och avvikelser.
- `reports/readiness.md` – beredskap mot acceptanskriterier.
- `reports/traceability.md` – spårning från PRD till implementation.
