# AI DM HUB – Meddelandehub för maskinpark

Lokal, responsiv HTML-prototyp som demonstrerar hur kritiska maskinlarm kan eskaleras, diskuteras strukturerat och spåras från ursprungligt larm till slutförd mänsklig åtgärd.

**Denna prototyp är INTE ett säkerhetssystem. Den ersätter aldrig befintliga säkerhets-, larm- eller nödstoppssystem.**

> **aidmhub-live:** Denna version har en riktig backend – Supabase för persistens och Claude för botsvar (märkta som beslutsstöd). Se [BACKEND.md](BACKEND.md) och [ADR-001](docs/adr/ADR-001-backend-supabase-llm.md). Utan konfiguration körs appen i offline-läge som originalprototypen.

---

## Snabbstart

### 1. Setup

```bash
./scripts/setup.sh
```

Verifierar miljön, skapar katalogstruktur, checkar beroenden.

### 2. Kör prototypen

```bash
./scripts/run.sh
```

Startar lokal webbserver på `http://localhost:8000`.  
Webbläsaren öppnas automatiskt.

### 3. Vänta och observera

- **Efter 10 sekunder:** Kritiskt larm för HPM-2400 utlöses automatiskt.
- **Larmet visas:** Högst upp i DM-listan med röd märkning, ⚠️-ikon.
- **Klicka larmet:** Öppna konversationen för att se detaljer.

### 4. Demo-flöde

1. Läs ursprungligt larm och eskaleringsorsak.
2. Ställ en fråga till boten.
3. Skapa ett **Beslut** (knapp i konversationen).
4. Skapa en **Delegering** till en kollega.
5. Registrera en **Åtgärd** som slutförd.
6. Granska **Historik** – se hela kedjorn från start till slut.

---

## Projektstruktur

```
.
├── CLAUDE.md                          # Projektöversikt och arbetssätt
├── README.md                          # Denna fil
├── CHANGELOG.md                       # Versionshistorik
├── PRD_Meddelandehub_for_maskinpark.docx.pdf  # Auktoritativ PRD
│
├── .claude/
│   ├── settings.json                  # Projektinställningar
│   ├── agents/
│   │   └── evaluator.md               # Evaluator-agent definition
│   └── rules/
│       ├── development.md             # Utvecklingsregler
│       ├── testing.md                 # Testningsregler
│       └── specifications.md          # Spec-regler
│
├── docs/
│   ├── adr/
│   │   └── ADR-template.md            # Arkitektur-besluts-mall
│   └── references.md                  # Tekniska referenser
│
├── specs/
│   ├── README.md                      # Spec-guide och feature-lista
│   ├── FEAT-DM-list.md                # DM-lista feature
│   ├── FEAT-critical-alert.md         # Kritiskt larm feature
│   ├── FEAT-actions.md                # Actions feature
│   └── FEAT-*.md                      # [TBD] Övriga features
│
├── project/
│   ├── feature-list.json              # Maskinläsbar feature-registry
│   ├── implementation-plan.md         # 5-fas implementeringsplan
│   └── progress.md                    # Löpande statusrapport
│
├── evals/
│   ├── cases/
│   │   └── demo-flow.yaml             # End-to-end evalfall
│   ├── graders/
│   │   └── functionality.md           # Bedömningsmallar
│   ├── baselines.json                 # Test-baselines
│   └── results/                       # [TBD] Resultat
│
├── reports/
│   ├── readiness.md                   # Beredskapsrapport
│   ├── traceability.md                # Spårbarhet PRD → Implementation
│   └── evaluation.md                  # [TBD] Eval-resultat
│
├── scripts/
│   ├── setup.sh                       # Setup-skript
│   ├── run.sh                         # Kör prototypen
│   ├── verify.sh                      # Kör verifikationer
│   ├── validate-specs.sh              # [TBD] Validera specs
│   ├── run-evals.sh                   # [TBD] Kör evals
│   └── generate-reports.sh            # [TBD] Generera rapporter
│
└── src/
    ├── index.html                     # [TBD] HTML-struktur
    ├── styles.css                     # [TBD] CSS-styling
    ├── app.js                         # [TBD] Applikationslogi
    └── mockData.js                    # [TBD] Mockdata
```

---

## Säkerhetsprinciper

### Obligatorisk skyddsbarriär

Hubben ska endast **informera, förklara, rekommendera, eskalera och stödja mänskligt beslutsfattande**.

- ✅ **Ingen maskinstyrning:** Prototypen skickar aldrig styrkommandon till maskiner.
- ✅ **Aldrig maskinsäkerhetssystem:** Befintliga säkerhets-, larm- och nödstoppssystem är alltid oberoende.
- ✅ **All data fiktiv:** Allt visad data är mockad och kan inte förväxlas med verklig produktionsdata.
- ✅ **Mänskliga aktörer tydliga:** Historiken gör alltid tydligt vem som fattade beslut och vem som utförde åtgärd.

---

## Demonstrationsflöde

### 10-sekunderslarmet

1. Prototypen öppnas med en gemensam DM-lista (flera kollegor + botar).
2. **Efter exakt 10 sekunder:** Automatiskt kritiskt larm för HPM-2400 "Temperaturöverkridning".
3. Larmet eskaleras (Maskinansvarig kvitterade inte i tid).
4. Larmet flyttas högst upp i DM-listan med röd märkning och ⚠️-ikon.

### Interaktiv del

5. Maskingruppsansvarig öppnar larmet och ser:
   - Ursprungligt maskinlarm (värde, sensor, tröskelvärde)
   - Eskaleringsorsak (utebliven kvittering, tid)
   - Möjlighet att diskutera med boten

6. Användaren kan:
   - **Ställa följdfrågor** → Bot svarar med data, tolkning, rekommendation
   - **Fatta beslut** → "Byt temperaturgivare omedelbar"
   - **Delegera** → "Erik, kan du kontrollera hydraulpumpen?"
   - **Registrera åtgärd** → "Temperaturgivare bytt, verifierat på 89°C"

7. **Historik** visar hela kedjan:
   - Ursprungligt larm (tid, maskin, prioritet)
   - Eskalering (orsak, tid)
   - Botfråga och svar
   - Beslut (text, beslutsfattare, tid)
   - Delegering (mottagare, status, tid)
   - Åtgärd (text, utförare, status, tid)

---

## Acceptanskriterier (Overview)

| AC-ID | Krav | Status |
|-------|------|--------|
| AC-001 | 10-sekunderslarmet uppstår automatiskt | [TBD] |
| AC-002 | Larmet märks högst upp i listan | [TBD] |
| AC-003 | Larmdetaljer visas | [TBD] |
| AC-004 | Maskinansvarig kan delta efter eskalering | [TBD] |
| AC-005 | Botsvar skiljer data, tolkning, rekommendation | [TBD] |
| AC-006–AC-008 | Actions sparas med obligatoriska fält | [TBD] |
| AC-009–AC-010 | @ och / sökning fungerar | [TBD] |
| AC-011 | Historiken är kronologisk och spårbar | [TBD] |
| AC-012 | DM-lista innehåller människor och botar | [TBD] |
| AC-013 | Scenario kan återställas | [TBD] |
| AC-014 | Responsiv och tillgänglig (a11y) | [TBD] |
| AC-015 | Ingen maskinstyrning, fiktiv data | [TBD] |

Se `project/progress.md` för detaljerad status.

---

## Kontakt och support

- **PRD:** `PRD_Meddelandehub_for_maskinpark.docx.pdf` (auktoritativ källa)
- **Projektöversikt:** `CLAUDE.md`
- **Implementation-plan:** `project/implementation-plan.md`
- **Status:** `project/progress.md`
- **Rapporter:** `reports/`

---

## Licensoch attribut

Denna prototyp är utvecklad för demonstrationsändamål.

Alla data, användare, maskiner, botar och larm är helt **mockade och fiktiva**.

**Datum skapad:** 2024-10-14
