# Implementeringsplan för AI DM HUB

**Version:** 1.0  
**Datum:** 2024-10-14  
**Status:** Planering  

## Övergripande strategi

Implementering görs i iterativ ordning, med fokus på ett fungerande end-to-end-flöde före visuell finputsning.

1. **Fas 1 – Grundläggande UI-struktur:** FEAT-DM-list, FEAT-responsive.
2. **Fas 2 – Kärnflöde:** FEAT-critical-alert, FEAT-conversation.
3. **Fas 3 – Interaktioner:** FEAT-actions, FEAT-mentions, FEAT-slashcommands.
4. **Fas 4 – Spårbarhet:** FEAT-history.
5. **Fas 5 – Operationella:** FEAT-demo-reset, FEAT-accessibility, FEAT-security-barriers.

## Tekniska förutsättningar

- **Frontend:** Vanilla HTML/CSS/JavaScript (se ADR-001).
- **Backend:** Ingen – all data är lokal mockdata.
- **Build-process:** Ingen – lokal webbserver räcker.
- **Lokala beroenden:** Python `http.server` eller Node.js `http-server` för test.
- **Mockdata:** `src/mockData.js` innehåller alla användare, botar, larm, konversationer.

## Fa s 1: Grundläggande UI-struktur (Vecka 1)

### Milstolpe: UI-skelett och mockdata

| FEAT | Task | Tid | Ansvarig | Blockerare |
|------|------|-----|----------|-----------|
| Setup | Skapa `src/index.html` grundstruktur | 1d | Dev | Ingen |
| Setup | Skapa `src/styles.css` layout-grund (desktop-first) | 1d | Design | Ingen |
| Setup | Skapa `src/mockData.js` med användare, botar, konversationer | 2d | Product | Mockdata-godkännande (OQ-002) |
| FEAT-responsive | Media queries för tablet (768px), mobil (375px) | 1d | Dev | Ingen |
| FEAT-DM-list | Rendera DM-lista från mockData | 1d | Dev | mockData |
| FEAT-DM-list | Styling för typ-märkningar (👤, 🤖), oläst-indikatorer | 1d | Design | Ingen |
| FEAT-accessibility | ARIA-labels och semantik på DM-listan | 1d | QA | FEAT-DM-list klar |

**Verifieringspunkt:** DM-listan visas, alla items är klickbara, responsiv layout fungerar.

## Fas 2: Kärnflöde (Vecka 2)

### Milstolpe: Automatiskt larm och dialog

| FEAT | Task | Tid | Ansvarig | Blockerare |
|------|------|-----|----------|-----------|
| FEAT-critical-alert | Implementera `setTimeout(10000)` för larmutlösning | 1d | Dev | Ingen |
| FEAT-critical-alert | Larmöbjekt skapas, status → "escalated" | 1d | Dev | mockData |
| FEAT-critical-alert | Märking: röd bakgrund, ⚠️-ikon, "KRITISK ESCALERING"-text | 1d | Design | Ingen |
| FEAT-critical-alert | Larmdetaljer-vyn (ursprungligt larm, maskin, prioritet, eskaleringsorsak) | 1d | Dev | FEAT-DM-list |
| FEAT-conversation | Konversations-komponent rendering från mockData | 1d | Dev | mockData |
| FEAT-conversation | Botsvar: skilj data, tolkning, rekommendation visuellt | 1d | Design | Ingen |
| FEAT-conversation | Q&A-flöde: Användaren kan ställa följdfrågor, få mockade svar | 2d | Dev | FEAT-conversation |

**Verifieringspunkt:** 10-sekunderslarmet utlöses, visas högst upp, dialog öppnas, botsvar skiljer data/tolkning/rekommendation.

## Fas 3: Interaktioner (Vecka 3)

### Milstolpe: Actions och omnämnanden

| FEAT | Task | Tid | Ansvarig | Blockerare |
|------|------|-----|----------|-----------|
| FEAT-actions | Tre knappar: Beslut, Delegering, Åtgärd | 1d | Dev | FEAT-conversation |
| FEAT-actions | Modals för inmatning | 1d | Design | Ingen |
| FEAT-actions | Spara actions till konversation med metadata | 2d | Dev | FEAT-actions buttons |
| FEAT-mentions | @-sökning implementering | 1d | Dev | mockData |
| FEAT-mentions | Infogning av @-omnämnanden i chatfält | 1d | Dev | FEAT-mentions search |
| FEAT-slashcommands | /-sökning implementering | 1d | Dev | mockData |
| FEAT-slashcommands | Infogning av /-referenser i chatfält | 1d | Dev | FEAT-slashcommands search |

**Verifieringspunkt:** Actions sparas med aktör + tidsstämpel, @- och /-kommandon fungerar.

## Fas 4: Spårbarhet (Vecka 4)

### Milstolpe: Historik och rapportering

| FEAT | Task | Tid | Ansvarig | Blockerare |
|------|------|-----|----------|-----------|
| FEAT-history | Historik-komponent rendering | 1d | Dev | FEAT-actions |
| FEAT-history | Kronologisk sortering av alla händelser | 1d | Dev | mockData |
| FEAT-history | Visning av aktör, typ, tidsstämpel, text | 1d | Dev | FEAT-history render |

**Verifieringspunkt:** Historiken visar alla händelser från larm till slutförd åtgärd, kronologiskt och spårbar.

## Fas 5: Operationella (Vecka 5)

### Milstolpe: Reset, a11y, säkerhet

| FEAT | Task | Tid | Ansvarig | Blockerare |
|------|------|-----|----------|-----------|
| FEAT-demo-reset | Reset-knapp implementering | 1d | Dev | FEAT-critical-alert |
| FEAT-demo-reset | Återställ demo-state, möjliggör upprepad körning | 1d | Dev | FEAT-demo-reset button |
| FEAT-accessibility | Keyboard-navigation överallt (Tab, Enter, Escape) | 2d | QA | Alla FEAT |
| FEAT-accessibility | Fokus-indikatorer synliga | 1d | Design | Ingen |
| FEAT-accessibility | Skärmläsare-test (ARIA, semantik) | 1d | QA | Alla FEAT |
| FEAT-security-barriers | Verifiera: ingen maskinstyrning i UI | 1d | Security | Alla FEAT |
| FEAT-security-barriers | Verifiera: all data är fiktiv | 1d | QA | Alla FEAT |

**Verifieringspunkt:** Demo kan återställas och köras igen, keyboard-navigation fungerar överallt, säkerhetskontroller godkända.

## Verifieringspunkter och grindar

### Säkerhetsgrindar (måste godkännas före nästa fas)

1. **Efter Fas 2:** Verifiera att larmet aldrig skickar styrkommando (TEST-009).
2. **Efter Fas 3:** Verifiera att alla actions är läsbara och icke-bindande.
3. **Efter Fas 4:** Verifiera att historiken gör mänskliga beslutsfattare och utförare tydliga (SEC-005).
4. **Efter Fas 5:** Verifiera att all data är fiktiv (SEC-004, TEST-010).

### Acceptanskriterier-grindar

| AC-ID | Fas | Verifiering | Godkänd |
|-------|-----|------------|---------|
| AC-001 | 2 | 10-sekunderslarmet utlöses automatiskt | [TBD] |
| AC-002 | 2 | Larmet märks och flyttas högst upp | [TBD] |
| AC-003 | 2 | Larmdetaljer visas | [TBD] |
| AC-004 | 3 | Maskinansvarig kan kopplas in via @ | [TBD] |
| AC-005 | 2 | Botsvar skiljer data, tolkning, rekommendation | [TBD] |
| AC-006 | 3 | Beslut-action sparas med metadata | [TBD] |
| AC-007 | 3 | Delegering-action sparas med metadata | [TBD] |
| AC-008 | 3 | Åtgärd-action sparas med metadata | [TBD] |
| AC-009 | 3 | @-sökning fungerar | [TBD] |
| AC-010 | 3 | /-sökning fungerar | [TBD] |
| AC-011 | 4 | Historiken är kronologisk och spårbar | [TBD] |
| AC-012 | 1 | DM-lista innehåller människor och botar | [TBD] |
| AC-013 | 5 | Scenario kan återställas och köras igen | [TBD] |
| AC-014 | 1, 5 | Responsiv och a11y-kontrollerad | [TBD] |
| AC-015 | 5 | Ingen maskinstyrning, all data fiktiv | [TBD] |

## Lokala setup- och verify-kommandon

**Setup (första gången):**
```bash
cd /Users/johanleidefors/Claude/AI\ DM\ HUB
./scripts/setup.sh
```

**Kör prototypen:**
```bash
./scripts/run.sh
# Öppnas på http://localhost:8000
```

**Verify-flöde (löpande verifiering):**
```bash
./scripts/verify.sh
# Kör: validate-specs, run-evals, generate-reports
```

**Manuell testning:**
1. Öppna http://localhost:8000.
2. Vänta 10 sekunder → larmet uppstår.
3. Klicka på larmet, läs detaljer, ställ fråga, skapa Beslut/Delegering/Åtgärd.
4. Granska historik.
5. Klicka Reset, kör igen.

## Kända blockerare och risker

| Blocker | Åtgärd | Status |
|---------|--------|--------|
| OQ-002 – Mockdata-godkännande | Implementationsteamet och produktteamet fastställer innehål | [TBD] |
| OQ-001 – Frontend-ramverk | Accepterat: Vanilla HTML/CSS/JS (ADR-001) | Resolved |
| Responsiv design tidspress | Prioritera desktop-first, tablet/mobil i Fas 5 | Active |

## Tidsbudget och milstolpar

- **Vecka 1:** Fas 1 (grundläggande UI).
- **Vecka 2:** Fas 2 (kärnflöde).
- **Vecka 3:** Fas 3 (interaktioner).
- **Vecka 4:** Fas 4 (spårbarhet).
- **Vecka 5:** Fas 5 (operationella).
- **Vecka 6:** Buffer och finputs, rapport.

**Go-live:** Efter godkännande av AC-001–AC-015.

## Se även

- `feature-list.json` – Maskinläsbar feature-registry.
- `progress.md` – Löpande statusrapport.
- `../CLAUDE.md` – Projektöversikt.
- `../docs/adr/ADR-001.md` – Frontend-ramverk beslut.
