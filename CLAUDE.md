# AI DM HUB – Projektöversikt

**Meddelandehub för människor och maskinbotar**  
Lokal, responsiv HTML-prototyp för beslutsstöd.

## Projektets syfte

AI DM HUB är en interaktiv meddelandehub som kombinerar direkt dialog mellan människor, specialiserade maskinbotar och maskinpark-övervakning. Prototypen demonstrerar hur kritiska maskinlarm kan eskaleras automatiskt, diskuteras strukturerat, och spåras från ursprungligt larm till slutförd mänsklig åtgärd.

**Denna prototyp är INTE ett säkerhetssystem och ersätter aldrig befintliga säkerhets-, larm- eller nödstoppssystem.**

## Styrande PRD

Den enda auktoritativa källan för mål, omfattning, krav, säkerhetsprinciper, acceptanskriterier och testkrav är:
- **Fil:** `PRD_Meddelandehub_for_maskinpark.docx.pdf`
- **Status:** Styrande PRD, Profil: Full
- **Dokumentstatus:** Konsoliderad, godkänd av projektteamet

Denna PRD får aldrig skrivas om, dupliceras eller ersättas.

## Prototypomfattning

### Ingår
- Lokal HTML-baserad webbprototyp (vanilla JavaScript/CSS).
- Desktop-first layout, responsiv för mobil och surfplatta.
- Gemensam DM-lista med mockade kollegor och botar.
- Automatiskt kritiskt eskalerat larm efter 10 sekunder.
- Beslut-, delegerings- och åtgärdsactions med fullständig spårbarhet.
- @-omnämnanden för att koppla in kollegor/botar.
- /-kommando för att referera till ärenden och parametrar.
- Historik med samtliga spårbarhetsfält.

### Uttryckliga avgränsningar
- Ingen anslutning till verkliga maskiner, sensorer eller produktionssystem.
- Ingen MCP-integration, RAG eller modellträning.
- Ingen verklig autentisering, auktorisering eller rollbaserad åtkomstkontroll.
- Ingen produktionsdata, persondata eller känslig data.
- **Ingen maskinstyrning, automatisk fysisk åtgärd eller kommandon till maskiner.**
- Ingen hosting, CI/CD eller externt säkerhetsgodkännande.
- Ingen ersättning av befintliga säkerhets-, larm- eller nödstoppssystem.

## Demonstrationsflöde

1. Prototypen öppnas med en gemensam DM-lista (flera kollegor + flera botar).
2. Efter 10 sekunder: Automatiskt kritiskt larm eskaleras (Maskinansvarig kvitterade inte i tid).
3. Larmet flyttas högst upp i listan med tydlig märkning.
4. Maskingruppsansvarig öppnar ärendet, ser ursprungligt larm, eskaleringsorsak och tidslinje.
5. Användaren kan ställa följdfrågor, få mockade svar från boten.
6. Användaren använder **Beslut**-knappen → beslutstext sparas med aktör + tidsstämpel.
7. Användaren använder **Delegering**-knappen → delegerar åtgärd till kolleg.
8. Användaren använder **Åtgärd**-knappen → registrerar utförd åtgärd med utförare + status.
9. Användaren granskar full historik med kronologisk kedja och alla aktörer synliga.

## Stabila identifierare och spårbarhet

Alla artefakter (specs, tests, evals, rapporter) använder PRD:ns stabila identifierare:

- **OBJ-\*** – Mål och framgångskriterier
- **UC-\*** – Användningsfall
- **FR-\*** – Funktionella krav
- **NFR-\*** – Icke-funktionella krav
- **SEC-\*** – Säkerhetskrav
- **AC-\*** – Acceptanskriterier
- **TEST-\*** – Testkrav
- **RISK-\*** – Riskhantering
- **OQ-\*** – Öppna frågor (markeras [TBD] med ansvarig och nästa steg)

## Säkerhetsprinciper och barriärer

**Obligatorisk skyddsbarriär:**  
Hubben ska endast informera, förklara, rekommendera, eskalera och stödja mänskligt beslutsfattande. Åtgärder utförs av människor. **Prototypen får aldrig skicka styrkommandon till maskiner.**

- SEC-001: Ingen funktion får skicka styrkommandon.
- SEC-002: Botens tolkning märks explicit som beslutsstöd.
- SEC-003: Befintliga säkerhetssystem ligger alltid utanför hubben.
- SEC-004: All data är mockad och fiktiv.
- SEC-005: Historiken gör mänsklig beslutsfattare och utförare tydliga.

## Lokala startkommandon

### Setup
```bash
./scripts/setup.sh
```
Installerar lokala beroenden (endast vanilla HTML/CSS/JS – inga externa paket förutsätts).

### Kör prototypen
```bash
./scripts/run.sh
```
Startar lokal webbserver på `http://localhost:8000` och öppnar gränssnittet.

### Verifiera specifikationer
```bash
./scripts/validate-specs.sh
```
Validerar att alla PR D-ID:n är täckta i FEAT-specs och att spårbarhet är komplett.

### Kör tester och evals
```bash
./scripts/run-evals.sh
```
Kör definierade evalfall och genererar resultatrapport.

### Verifiera helhet
```bash
./scripts/verify.sh
```
Kör samtliga verifieringar: specifikation, tests, evals, rapporter.

## Arbetssätt

### Kodkvalitet och mockdata

- Använd **semantisk HTML**, ARIA-labels och synligt tangentbordsfokus.
- All data är **fiktiv och mockad** – använd svenska namn och realistiska men helt simulerade maskintyper.
- **Komponenter:** Bygga modulär struktur (komponenter per sektion: DM-lista, konversation, actions, historik).
- **Responsiv design:** Desktop-first; testa på 1920px, 768px (iPad), 375px (iPhone).
- **Tillgänglighet:** Inga färg-ensamma indikatorer för kritiska larm. Använd text + ikon + färg.
- **Säkerhetsbegränsningar:** Aldrig något i UI som antyder maskinstyrning. Alla actions är läsbara och ej-bindande.

### Testning och negativ säkerhet

- **Testfall (TEST-\*):** Täck end-to-end-flödet, sortering, actions, @ och /, historik, responsivitet, tillgänglighet.
- **Negativ säkerhetstestning:** Kontrollera att ingen UI-action kan missuppfattas som maskinstyrning.
- **Datakontroll:** Verifiera att all visad data är fiktiv.

### Specifikationer

- Varje **FEAT-\*-spec** definierar en genomförbar feature utan att återskapа PRD:n.
- Använd tabeller för användningsflöden, tillståndsdiagram för komplexa flöden.
- Länka alltid till relevanta **AC-\***, **FR-\***, **TEST-\*** från PRD.
- Markera [TBD] endast för icke-kritiska luckor med ansvarig och nästa steg.

## Validering och rapportering

### Readiness-rapport (`reports/readiness.md`)
Bedömer beredskap mot alla relevanta AC-kriterier.

### Traceability-rapport (`reports/traceability.md`)
Redovisar spårning från PRD-ID → feature → implementation → test → resultat.

### Evaluation-rapport (`reports/evaluation.md`)
Sammanfattar evalresultat, avvikelser, blockerare.

## Definition of Done

- ✅ Alla begärda Full-profilartefakter finns med projektspecifikt material.
- ✅ PRD:n är oförändrad och auktoritativ.
- ✅ Krav → features → acceptanskriterier → tests → evals är spårbara via PRD:ns ID:n.
- ✅ Det kritiska 10-sekundersflödet är täckt end-to-end.
- ✅ Säkerhetsbarriärer är dokumenterade och verifierbara.
- ✅ Lokala setup- och verify-kommandon fungerar.
- ✅ Inga testresultat eller evalresultat är fabricerade.

## Projekt-struktur

```
/Users/johanleidefors/Claude/AI DM HUB/
├── PRD_Meddelandehub_for_maskinpark.docx.pdf  (auktoritativ PRD)
├── CLAUDE.md                                    (denna fil)
├── CHANGELOG.md
├── .claude/
│   ├── settings.json
│   ├── agents/
│   │   └── evaluator.md
│   └── rules/
│       ├── development.md
│       ├── testing.md
│       └── specifications.md
├── docs/
│   ├── adr/
│   │   └── ADR-template.md
│   └── references.md
├── specs/
│   ├── README.md
│   ├── FEAT-DM-list.md
│   ├── FEAT-critical-alert.md
│   ├── FEAT-conversation.md
│   ├── FEAT-actions.md
│   ├── FEAT-mentions.md
│   ├── FEAT-history.md
│   └── FEAT-responsive.md
├── project/
│   ├── feature-list.json
│   ├── implementation-plan.md
│   └── progress.md
├── evals/
│   ├── cases/
│   │   ├── demo-flow.yaml
│   │   ├── alert-handling.yaml
│   │   ├── actions.yaml
│   │   ├── accessibility.yaml
│   │   └── security.yaml
│   ├── graders/
│   │   ├── functionality.md
│   │   ├── accessibility.md
│   │   └── security.md
│   ├── baselines.json
│   └── results/.gitkeep
├── scripts/
│   ├── setup.sh
│   ├── run.sh
│   ├── verify.sh
│   ├── validate-specs.sh
│   └── run-evals.sh
├── reports/
│   ├── readiness.md
│   ├── traceability.md
│   └── evaluation.md
├── src/
│   ├── index.html
│   ├── styles.css
│   ├── app.js
│   └── mockData.js
└── .gitignore
```

## Kontakt och nästa steg

För frågor eller ändringar: Hänvisa till den bifogade PRD:n.  
Nästa steg: Se `project/implementation-plan.md` för detaljerad utvecklingsordning.
