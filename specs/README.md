# Specifikationer för AI DM HUB

Denna katalog innehåller genomförbara FEAT-specifikationer för alla core-features i prototypen. Varje FEAT är härlett från PRD:n och spårbart via stabila identifierare (FR-*, AC-*, TEST-*).

## Features

| FEAT | Titel | Status | PRD-Mål | AC | Testkrav |
|------|-------|--------|---------|----|----|
| FEAT-DM-list | DM-lista med kollegor och botar | Pending | OBJ-01, OBJ-02 | AC-012 | TEST-002 |
| FEAT-critical-alert | Automatiskt kritiskt eskalerat larm | Pending | OBJ-01, OBJ-02 | AC-001, AC-002, AC-003 | TEST-001, TEST-002 |
| FEAT-conversation | Botdialog med Q&A | Pending | OBJ-03 | AC-005 | TEST-001, TEST-004 |
| FEAT-actions | Beslut, delegering, åtgärd | Pending | OBJ-03, OBJ-04 | AC-006, AC-007, AC-008 | TEST-003 |
| FEAT-mentions | @-omnämnanden och /-referenser | Done | OBJ-05 | AC-004, AC-009 | TEST-004, TEST-005 |
| FEAT-slashcommands | /-kommandon (ingår i FEAT-mentions) | Done | OBJ-05 | AC-010 | TEST-004 |
| FEAT-history | Kronologisk historik med full spårbarhet | Done | OBJ-03, OBJ-04 | AC-011 | TEST-001 |
| FEAT-responsive | Responsiv layout (desktop/tablet/mobil) | Pending | OBJ-06 | AC-014 | TEST-007 |
| FEAT-accessibility | Tangentbord, fokus, ARIA, semantik | Pending | NFR-003, NFR-004 | AC-014 | TEST-008 |
| FEAT-security-barriers | Säkerhetsmärkning (aldrig maskinstyrning) | Pending | SEC-001–SEC-003 | AC-015 | TEST-009, TEST-010 |
| FEAT-demo-reset | Scenarioåterställning (RPC reset_scenario) | Done | OBJ-01 | AC-013 | TEST-006 |

## Status-förklaringar

- **Pending:** Inte påbörjad.
- **In Progress:** Under utveckling.
- **Done:** Implementerad och testad.
- **Blocked:** Väntar på annat eller har identifierat problem.

## Beroenden

```
FEAT-DM-list (grundläggande)
  ├─→ FEAT-critical-alert (larmet visas i listan)
  ├─→ FEAT-responsive (layout)
  └─→ FEAT-accessibility (keyboard, ARIA)

FEAT-critical-alert
  ├─→ FEAT-conversation (visa dialog när larmet öppnas)
  └─→ FEAT-demo-reset (återställ larmet)

FEAT-conversation
  ├─→ FEAT-mentions (koppla in kollegor/botar)
  ├─→ FEAT-slashcommands (referera till kontext)
  └─→ FEAT-actions (beslutsknappnar i chatten)

FEAT-actions
  └─→ FEAT-history (spara alla actions där)

FEAT-mentions & FEAT-slashcommands
  └─→ FEAT-history (spara alla omnämnanden och referenser)

FEAT-responsive
  └─→ Gäller för alla komponenter

FEAT-accessibility
  └─→ Gäller för alla komponenter

FEAT-security-barriers
  └─→ Gäller för alla komponenter
```

## Implementeringsordning

1. **FEAT-DM-list** – Grundläggande UI-struktur.
2. **FEAT-critical-alert** – Automatisk larmutlösning efter 10 sek, visning i listan.
3. **FEAT-responsive** – Säkerställ layout på alla skärmstorlekar.
4. **FEAT-accessibility** – Integrera keyboard, fokus, ARIA.
5. **FEAT-conversation** – Botdialog när larmet öppnas.
6. **FEAT-mentions** – @-sökning för kollegor/botar.
7. **FEAT-slashcommands** – /-sökning för ärenden/parametrar.
8. **FEAT-actions** – Beslut-, delegerings-, åtgärds-knappar.
9. **FEAT-history** – Kronologisk visning av alla händelser.
10. **FEAT-demo-reset** – Möjlighet att återställa scenario och köra igen.
11. **FEAT-security-barriers** – Verifiera säkerhetsmärkning överallt.

## Validering

Varje FEAT-spec valideras genom:

```bash
./scripts/validate-specs.sh
```

Valideringen kontrollerar:
- Alla FR-*, AC-*, TEST-* från PRD är refererade.
- Inga cirkulära beroenden mellan FEATs.
- Obligatoriska fält är ifyllda (syfte, omfattning, DO D).
- ID-format är korrekt.

## Definition of Done för FEAT

En FEAT är klar när:
- [ ] Spec är skriftlig och godkänd.
- [ ] Implementerad i `src/`.
- [ ] Alla relaterade AC-kriterier kan verifieras manuellt.
- [ ] Relevanta TEST-fall körs utan blockerande fel.
- [ ] Responsiv design verificerad.
- [ ] Tillgänglighet (tangentbord, fokus, ARIA) verificerad.
- [ ] Säkerhetskontroller genomförda (om relevant).
- [ ] Uppdaterad i feature-list.json och progress.md.

## Se även

- `FEAT-*.md` – Individuella specifikationer.
- `../project/implementation-plan.md` – Detaljerad implementeringsplan.
- `../project/feature-list.json` – Maskinläsbar feature-registry.
- `../project/progress.md` – Löpande statusrapport.
