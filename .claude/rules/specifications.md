# Specifikationsregler för AI DM HUB

## Syfte

Denna fil definierar hur FEAT-specifikationer ska struktur eras och valideras utan att återskapå PRD:n.

## Principer

1. **Härled från PRD:** Varje FEAT-spec börjar med spårning till relevanta PRD-ID:n (FR-*, AC-*, TEST-*).
2. **Inga nya PRD:er:** FEAT-specs definierar genomförbar scope och acceptanskriterier men ändrar inte PRD:ns mål, omfattning eller säkerhetsprinciper.
3. **Stabila identifierare:** Använd PRD:ns ID:n konsekvent överallt – i specs, tester, rapporter, kod.
4. **Tillräckligt specifik:** FEAT-specs ger implementationsteamet tillräcklig vägledning utan att ge in med enskilda kod-rader.

## FEAT-specifikationsstruktur

Varje `specs/FEAT-*.md` ska innehålla:

### Header
```markdown
# FEAT-XX: Deskriptiv titel

**Status:** [In Progress | Done | Blocked]  
**PR D-länk:** [Mål och krav den löser]  
**Relaterade FEAT:** [Andra features som denna beror på eller integreras med]
```

### 1. Syfte
En-två meningar om vad denna feature gör och varför den är viktig.

### 2. Omfattning
- **Ingår:** Konkreta användarflöden, UI-element, data.
- **Utgår:** Explicit nämn vad som INTE är del av denna feature.

### 3. Relaterade PRD-ID:n
Tabell som visar spårning:

| Typ | ID | Beskrivning |
|-----|----|----|
| Mål | OBJ-01 | Ett simulerat eskalerat kritiskt larm ska uppstå automatiskt... |
| Användningsfall | UC-02 | Ta emot ett eskalerat kritiskt larm |
| FR | FR-004 | Ett mockat kritiskt larm ska utlösas automatiskt efter 10 sekunder |
| AC | AC-001 | Givet att demonstrationsvyn startas, när 10 sekunder har gått... |
| TEST | TEST-001 | End-to-end-demo av hela flödet från 10-sekunderslarm... |

### 4. Användningsflöde / Aktivitetsdiagram
Beskriv steg-för-steg eller använd ASCII-diagram:

```
┌─────────┐
│  Start  │
└────┬────┘
     │
     v
  [10 sek?]
     │ Yes
     v
┌─────────────────────┐
│  Skapa kritiskt     │
│  larm, eskalera     │
└────┬────────────────┘
     │
     v
  [Visa högst upp?]
     │ Yes
     v
┌─────────────────┐
│  Möjliggör       │
│  interaktion    │
└─────────────────┘
```

### 5. Tillståndsdiagram (om relevant)
För komplexa flöden:

```
┌──────────┐
│ Inactive │ ← Initial state
└────┬─────┘
     │ "onStart()"
     v
┌──────────────┐
│  Waiting     │ ← Väntar 10 sek
└────┬─────────┘
     │ "setTimeout(...)"
     v
┌──────────────┐
│  Triggered   │ ← Larmet uppstår
└────┬─────────┘
     │ "showAlert()"
     v
┌──────────────┐
│  Escalating  │ ← Visas högst upp
└──────────────┘
```

### 6. Data och informationsmodell
Visa relevant data-struktur:

```javascript
// Larm-objekt enligt PRD:s informationsmodell (sektion 10)
alarm = {
  alarmId: string,        // Larm-ID
  machineId: string,      // Kopplad maskin
  alarmType: string,      // Typ (t.ex. "TemperatureOverrun")
  level: number,          // 1–5 (kritikitet)
  ruleSource: string,     // Regelkälla
  createdAt: timestamp,   // Skapad tid
  ackDeadline: timestamp, // Kvitteringsfrist
  status: enum,           // "pending" | "acknowledged" | "escalated"
  escalatedTo: string,    // Nästa ansvarsnivå
  escalationReason: string // "no_ack_within_deadline"
};
```

### 7. Användargränssnitts-krav
Beskriv UI-element, layout, interaktion:

- **Element:** Vilka komponenter, knappar, inmatningsfält?
- **Layout:** Desktop/tablet/mobil-specifikt?
- **Interaktion:** Click, keyboard, touch?
- **Tillgänglighet:** ARIA-labels, semantik, fokus?

**Exempel:**
- En röd bokskräm med "⚠️ KRITISK ESCALERING" text, placerad högst upp i DM-listan.
- Text och ikon tillsammans, aldrig enbart färg (SEC-002, NFR-002).
- Tangentbordsfokus: fokusbar, kan öppnas med Enter.
- ARIA: `role="alert"` och `aria-label="Kritisk eskalering från maskin HPM-2400"`.

### 8. Fel- och kantfall
- Vad händer om larmet redan är uppmärksamt?
- Vad om 10 sekunder redan har gått?
- Vad om användaren redan är inne i ärendet när larmet uppstår?
- Vad om webbläsaren inte stödjer teknologin?

### 9. Tillgänglighet (a11y)
- **WCAG 2.1 AA:** Målnivå.
- **Keyboard:** Tab-ordning, Enter/Escape-svar.
- **Screen reader:** Semantisk HTML, ARIA-labels.
- **Färg + text:** Aldrig enbart färg för kritiska indikatorer.
- **Fokusindikator:** Synlig och kontrasterande.

### 10. Testfall och acceptanskriterier
Länka till relevanta TEST-* och AC-*:

| TEST-ID | AC-ID | Verifiering |
|---------|-------|------------|
| TEST-001 | AC-001 | 10-sekunderslarm utlöses automatiskt och visas utan manuell trigger |
| TEST-002 | AC-002 | Larmet flyttas högst upp i listan med tydlig märkning |

### 11. Definition of Done
FEAT är klar när:
- [ ] Implementerad och testad lokalt.
- [ ] Alla TEST-* och AC-* kan verifieras.
- [ ] Inte bryter några befintliga features.
- [ ] Tillgänglighet kontrollerad (tangentbord, fokus, ARIA).
- [ ] Responsiv design verifierad (desktop, tablet, mobil).

## Validering av FEAT-specs

### Automatiserad validering (`./scripts/validate-specs.sh`)

Skriptet kontrollerar:
1. **Täckning:** Alla FR-* och AC-* från PRD är relaterade till minst en FEAT.
2. **Cirkularitet:** Inga FEAT-beroenden som skapar cykler.
3. **Obligatoriska fält:** Varje FEAT har syfte, omfattning, relaterade PRD-ID:n, DO D.
4. **ID-format:** Alla PRD-ID:n använder rätt format (FR-XXX, AC-XXX, etc).

### Manuell granskning

- Läs igenom varje FEAT-spec för klarhet och fullständighet.
- Verifiera att specs kan implementeras oberoende eller i definierad ordning.
- Kontrollera att inga nya säkerhetskrav eller omfattningar introduceras.

## FEAT-spec-lista

Se `specs/README.md` för lista över alla FEAT-specs och deras status.

## Exempel: FEAT-DM-list.md

Se `specs/FEAT-DM-list.md` för ett fullt exempel.
