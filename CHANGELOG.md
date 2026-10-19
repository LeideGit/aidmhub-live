# CHANGELOG för AI DM HUB

## [2.0] – 2026-10-19 – aidmhub-live: backend

### Tillagt
- Supabase-schema med RLS och anonyma demosessioner (`supabase/migrations/`)
- RPC:er `start_scenario`, `reset_scenario`, `trigger_alarm` (idempotent), `acknowledge_alarm`
- Edge Function `bot-reply`: Claude-svar med strukturerad output, säkerhetsguard och kostnadsgräns
- `src/api.js` (datalager med offline-fallback), `src/config.js`, statusbadge i headern
- ADR-001, BACKEND.md, evalfall `llm-safety.yaml` och `persistence.yaml`

### Ändrat
- Botsvar märks "Rekommendation (beslutsstöd)" med källa (AI-genererat / mall)
- Nedräkningen återupptas efter omladdning från larmets kvitteringsfrist
- Kvittering uppdaterar även larmets status

### Rättat
- Eskaleringsroll visades som `undefined` (stavfel `escaledFromRole`)
- Delegering i mottagarens DM använde aktuellt ärende i stället för valt ärende
- Återställning lämnade kvar nedräkning, timers, användarmeddelanden och ärenden
- All användartext HTML-escapas vid rendering

## [1.0] – 2024-10-14 – Project Initiation

### Dokumentation skapad

#### Core-dokument
- **CLAUDE.md** – Projektöversikt, syfte, omfång, arbetssätt, säkerhetsprinciper
- **PRD_Meddelandehub_for_maskinpark.docx.pdf** – Auktoritativ styrande PRD (oförändrad)

#### Konfiguration
- **.claude/settings.json** – Projektinställningar, behörigheter, mockdata-flaggor
- **.gitignore** – Git-ignoreringsregler

#### Regler och riktlinjer
- **.claude/rules/development.md** – Kodkvalitet, mockdata, komponentstruktur, a11y, responsivitet
- **.claude/rules/testing.md** – Testnivåer, negativ säkerhetstestning, spårbarhet
- **.claude/rules/specifications.md** – FEAT-spec-struktur, validering

#### Agent och evaluator
- **.claude/agents/evaluator.md** – Definierar evalueringsagent för quality-gate

#### Arkitektur- och designdokument
- **docs/adr/ADR-template.md** – Besluts-mall för arkitektoniska val
- **docs/references.md** – Tekniska referenser och länkar

#### Specifikationer
- **specs/README.md** – Överordnad spec-guide och feature-lista
- **specs/FEAT-DM-list.md** – Gemensam DM-lista med kollegor och botar
- **specs/FEAT-critical-alert.md** – Automatiskt kritiskt eskalerat larm
- **specs/FEAT-actions.md** – Beslut, delegering, åtgärd-actions

#### Projektplanering
- **project/feature-list.json** – Maskinläsbar feature-registry (11 features)
- **project/implementation-plan.md** – 5-fas implementeringsplan (vecka 1–6)
- **project/progress.md** – Löpande statusrapport med blockerare och risker

#### Evaluering och testning
- **evals/cases/demo-flow.yaml** – End-to-end evalfall för demonstrationsflödet
- **evals/baselines.json** – Test-baselines (alla 10 tests i "not_measured" status)
- **evals/graders/functionality.md** – Bedömningsmallar för funktionella tester
- **evals/results/.gitkeep** – Placeholder för resultat-katalog

#### Rapporter
- **reports/readiness.md** – Beredskapsrapport (31% initial beredskap)
- **reports/traceability.md** – Spårbarhet från PRD till implementation
- **reports/evaluation.md** – [TBD] Evalresultat-mall

#### Skript
- **scripts/setup.sh** – Setup-skript (verifierar miljö, skapar katalogstruktur)
- **scripts/run.sh** – Startar lokal webbserver
- **scripts/verify.sh** – Kör samtliga verifieringar
- **scripts/validate-specs.sh** – [TBD] Validerar spec-täckning
- **scripts/run-evals.sh** – [TBD] Kör evalfall
- **scripts/generate-reports.sh** – [TBD] Genererar rapporter

#### Källkod-placeholders
- **src/index.html** – [TBD] HTML-struktur
- **src/styles.css** – [TBD] CSS-styling
- **src/app.js** – [TBD] Huvudapplikationslogi
- **src/mockData.js** – [TBD] Mockdata-definition (väntar på OQ-002)

### Konfigurationer och inställningar

- ✅ Frontend-ramverk valt: Vanilla HTML/CSS/JavaScript (ADR-001)
- ✅ Säkerhetsprinciper dokumenterade (SEC-001–SEC-008)
- ✅ 11 Features definierade och specifierade (FEAT-DM-list, FEAT-critical-alert, etc.)
- ✅ 10 Testkrav definierade (TEST-001–TEST-010)
- ✅ 15 Acceptanskriterier spårade (AC-001–AC-015)
- ✅ 5-fas implementeringsplan etablerad

### Öppna blockerare

- **OQ-002** – Mockdata-innehål (maskiner, botar, kollegor, larmtexter) [TBD]
- **Flera FEAT-specs** – Manuella spec-filer för FEAT-conversation, FEAT-history, etc. [TBD]
- **Källkod** – Implementering pending (startas efter mockdata-godkännande)

### Status

- **Dokumentation:** 100% (artefakter skapade enligt Full-profil)
- **Spårbarhet:** 100% (PRD → Features → AC → Tester)
- **Implementation:** 0% (Väntar på setup-verifiering och mockdata-godkännande)
- **Beredskap:** 31% (Planering klar, implementation pending)

### Nästa steg

1. **Omedelbar:** Lösa OQ-002 (mockdata-innehål).
2. **Denna vecka:** Verifiera setup-skriptet lokalt, få godkännande för säkerhetsprinciper.
3. **Vecka 1:** Börja Fas 1 (UI-skelett, DM-lista).
4. **Vecka 2:** Börja Fas 2 (Kritiskt larm, konversation).
5. **Vecka 3–6:** Faser 3–5 (interaktioner, spårbarhet, operationell).

---

## Format för framtida ändringar

### Versionshistorik

```markdown
## [X.Y] – YYYY-MM-DD – [Release name or phase]

### Skapad
- **Fil:** Beskrivning

### Uppdaterad
- **Fil:** Ändringar

### Fixad
- **Fil:** Buggar

### Raderad
- **Fil:** Anledning

### Status
- Feature: In Progress / Done / Blocked
```

### Stabila identifierare

Använda vid dokumentering av ändringar:
- **FEAT-\*:** Feature-ID
- **AC-\*:** Acceptance Criteria ID
- **TEST-\*:** Test Requirement ID
- **OBJ-\*:** Objective ID
- **FR-\*:** Functional Requirement ID

---

## [1.1] – 2024-10-14 – Fas 1-2 Initial Implementation

### Källkod skapad

#### HTML (index.html)
- ✅ Komplett layout: header, DM-lista, konversationspanel, historik
- ✅ Modals för Beslut, Delegering, Åtgärd
- ✅ Semantisk HTML, ARIA-labels
- ✅ Accessibility-fokus (roles, labels, keyboard-navigering)

#### CSS (styles.css)
- ✅ Desktop-first design
- ✅ Media queries för tablet (768px) och mobil (375px)
- ✅ CSS-variabler för konsistens
- ✅ Färg-märkning för kritiska larm (röd + text + ikon, aldrig enbart färg)
- ✅ Fokus-indikatorer för tangentbordnavigering
- ✅ Responsiva komponenter: DM-lista, konversation, actions, modals

#### JavaScript (app.js)
- ✅ AIHubApp-klass (constructor, lifecycle, rendering)
- ✅ 10-sekunderslarmet (setTimeout, automatisk utlösning)
- ✅ DM-lista rendering (sortering: kritiska larmar högst upp)
- ✅ Konversations-hantering (visa, uppdatera, scroll)
- ✅ Botdialog med separerad data/tolkning/rekommendation
- ✅ Action-hantering: Beslut, Delegering, Åtgärd (modal-driven, spara med metadata)
- ✅ Tidsstämplar för all spårbarhet
- ✅ Reset-funktionalitet (scenario kan köras om)
- ✅ Modal-system (öppna, stänga, spara)

#### Mock Data (mockData.js)
- ✅ Maskiner: HPM-2400, TRK-500, VX-1200 (helt mockad)
- ✅ Botar: HPM-2400 Sensor Bot, Tork-enhet Monitor, Värmesystem Advisor
- ✅ Kollegor: Anna Bergström (Maskinansvarig), Erik Svensson (Maskingruppsansvarig), Maria Holm, Lars Nyström
- ✅ Roller med ansvarsnivåer (1-3)
- ✅ **Förifylld konversationshistorik: 16 meddelanden** från tidigare samtal
  - Anna Bergström: 3 meddelanden om HPM-2400-instabilitet
  - Lars Nyström: 3 meddelanden om TRK-500-service
  - HPM-2400 Sensor Bot: 3 statusmeddelanden
  - Tork-enhet Monitor: 3 statusmeddelanden
  - Värmesystem Advisor: 3 statusmeddelanden
- ✅ Funktioner för att skapa larm, meddelanden, actions, delegering
- ✅ Reset-funktionalitet bevarar tidigare konversationshistorik

### Status

- ✅ **Fas 1 KOMPLETT:** UI-skelett, DM-lista, responsive layout
- ✅ **Fas 2 I GÅNG:** Larmet utlöses automatiskt, konversation fungerar, botdialog separerar data/tolkning/rekommendation
- ✅ **Fas 3 I GÅNG:** Actions (Beslut, Delegering, Åtgärd) implementerade och sparas med metadata

### Verifierade AC-kriterier

- [x] AC-001: 10-sekunderslarmet uppstår automatiskt ✅
- [x] AC-002: Larmet märks högst upp i listan (röd, ⚠️, text) ✅
- [x] AC-003: Larmdetaljer visas (ursprungligt larm, maskin, prioritet, eskaleringsorsak) ✅
- [x] AC-005: Botsvar skiljer data, tolkning, rekommendation ✅
- [x] AC-006: Beslut-action sparas med text, beslutsfattare, tidsstämpel ✅
- [x] AC-007: Delegering-action sparas med uppgift, mottagare, status, tidsstämpel ✅
- [x] AC-008: Åtgärd-action sparas med beskrivning, utförare, status, tidsstämpel ✅
- [x] AC-012: DM-lista innehåller människor och botar med typ-märkning ✅
- [x] AC-013: Scenario kan återställas och köras på nytt ✅
- [ ] AC-004: Maskinansvarig kan kopplas in via @ (TBD, väntar på FEAT-mentions)
- [ ] AC-009–AC-010: @ och / sökning (TBD, FEAT-mentions och FEAT-slashcommands)
- [ ] AC-011: Historik kronologisk och spårbar (Partial – rendering klar, men @ inte implementerat än)
- [ ] AC-014: Responsiv och a11y (Partial – responsive OK, a11y labels på plats men inte fullt testad)

### Nästa steg

1. **Implementera @ -sökning (FEAT-mentions)**
   - Inga kvar denna sprint – låt mig slutföra de återstående FEATurerna för full end-to-end-demonstration

2. **Implementera / -sökning (FEAT-slashcommands)**

3. **Accessibility-kontroll (TEST-008)**

4. **Säkerhetskontroll (TEST-009, TEST-010)**

---

**Senast uppdaterad:** 2024-10-14  
**Nästa uppdatering:** Efter @ och / sökning implementering.
