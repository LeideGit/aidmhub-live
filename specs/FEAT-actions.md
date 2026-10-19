# FEAT-actions: Beslut, delegering och åtgärd

**Status:** Pending  
**Priority:** P0 – Kärnflöde  
**Related FEATs:** FEAT-conversation, FEAT-history, FEAT-mentions

## Syfte

Implementera tre explicita action-knappar (Beslut, Delegering, Åtgärd) som gör det möjligt för användaren att registrera strukturerade, spårbara händelser i konversationen. Varje action sparas som text med obligatoriska metadata: aktör, tidsstämpel, status.

## Omfattning

**Ingår:**
- Tre knappar i konversation: "Beslut", "Delegering", "Åtgärd".
- Cada knapp öppnar en modal/popup för inmatning.
- **Beslut:** Användaren skriver besluts-text → sparas med beslutsfattare + tidsstämpel.
- **Delegering:** Användaren väljer mottagare (via @-popup) + skriver uppgift → sparas med parter, status, tidsstämpel.
- **Åtgärd:** Användaren skriver åtgärdstext + väljer status (påbörjad/slutförd) → sparas med utförare, status, tidsstämpel.
- Actions visas som strukturerade textmeddelanden i konversationen.
- Alla actions är läsbara, icke-bindande (ingen faktisk åtgärd utförda).

**Utgår:**
- Ingen faktisk utförande eller uppföljning.
- Ingen integrering med externa system.
- Ingen auktorisering (alla kan delegera till alla).

## Relaterade PRD-ID:n

| Typ | ID | Beskrivning |
|-----|----|----|
| UC | UC-04, UC-07, UC-08 | Fatta beslut, delegera, registrera åtgärd |
| FR | FR-016–FR-020 | Actions och obligatoriska metadata |
| AC | AC-006, AC-007, AC-008 | Actions sparas med text, parter, tidsstämpel |
| TEST | TEST-003 | Verifiera beslut, delegering, åtgärd |

## Användarflöde

```
Användaren i konversation:

1. Klickar "Beslut"-knapp
   → Modal öppnas med textfält
   → Användaren skriver beslut
   → Klick "Spara"
   → Meddelande: "[Beslut] Anna Bergström: Byt temperaturgivare omedelbar. TID: 14:25:30"

2. Klickar "Delegering"-knapp
   → Modal: Välj mottagare (via @-sökning) + textfält
   → Användaren väljer "Erik Svensson"
   → Användaren skriver "Kontrollera tryckregulator"
   → Status: "Tilldelad"
   → Meddelande: "[Delegering] Till Erik Svensson: Kontrollera tryckregulator. Status: Tilldelad. TID: 14:26:00"

3. Klickar "Åtgärd"-knapp
   → Modal: Textfält + Status-dropdown (Påbörjad | Slutförd)
   → Användaren skriver "Temperaturgivare bytt. Verifierad på 89°C"
   → Väljer "Slutförd"
   → Meddelande: "[Åtgärd] Anna Bergström: Temperaturgivare bytt... Status: Slutförd. TID: 14:27:15"
```

## Data och informationsmodell

**Beslut-objekt:**
```javascript
decision = {
  decisionId: "dec_001",
  conversationId: "conv_001",
  decisionMakerUserId: "usr_002",
  decisionText: "Byt temperaturgivare omedelbar",
  timestamp: Date.now(),
  relatedIssueId: "issue_001"
};
```

**Delegering-objekt:**
```javascript
delegation = {
  delegationId: "dlg_001",
  conversationId: "conv_001",
  delegatingUserId: "usr_002",
  assigneeUserId: "usr_001",
  taskDescription: "Kontrollera tryckregulator",
  status: "assigned" | "in_progress" | "completed",
  timestamp: Date.now(),
  relatedIssueId: "issue_001"
};
```

**Åtgärd-objekt:**
```javascript
action = {
  actionId: "act_001",
  conversationId: "conv_001",
  performerUserId: "usr_002",
  actionDescription: "Temperaturgivare bytt. Verifierad på 89°C",
  status: "started" | "completed",
  timestamp: Date.now(),
  relatedIssueId: "issue_001"
};
```

## Gränssnitts-krav

### Knappar
- Placering: Under konversationsfältet eller i toolbar.
- Tre knappar: "💡 Beslut", "📋 Delegering", "✓ Åtgärd".
- Style: Primär-färgade knappar, hover-effekt.
- Keyboard: Tab-navigerbar, Enter för att aktivera.

### Modals/Popups

**Beslut-modal:**
```
┌──────────────────────────────┐
│ Registrera beslut            │
├──────────────────────────────┤
│ Besluttext:                  │
│ [________________...]        │ ← Textfält (minst 1 rad, expanderbar)
│                              │
│    [Avbryt]  [Spara]        │
└──────────────────────────────┘
```

**Delegering-modal:**
```
┌──────────────────────────────┐
│ Delegera uppgift             │
├──────────────────────────────┤
│ Till (person/bot):           │
│ [@erik svensson ↓]           │ ← @-sökning
│                              │
│ Uppgiftsbeskrivning:         │
│ [________________...]        │
│                              │
│    [Avbryt]  [Spara]        │
└──────────────────────────────┘
```

**Åtgärd-modal:**
```
┌──────────────────────────────┐
│ Registrera utförd åtgärd     │
├──────────────────────────────┤
│ Åtgärdsbeskrivning:          │
│ [________________...]        │
│                              │
│ Status:                      │
│ [Påbörjad ↓] eller [Slutförd]│
│                              │
│    [Avbryt]  [Spara]        │
└──────────────────────────────┘
```

### Meddelande-format i konversation

```
[Beslut] Anna Bergström
Byt temperaturgivare omedelbar
Tidsstämpel: 2024-10-14 14:25:30

───

[Delegering] Anna → Erik Svensson
Uppgift: Kontrollera tryckregulator
Status: Tilldelad
Tidsstämpel: 2024-10-14 14:26:00

───

[Åtgärd] Anna Bergström
Temperaturgivare bytt. Verifierad på 89°C
Status: Slutförd
Tidsstämpel: 2024-10-14 14:27:15
```

## Fel- och kantfall

1. **Tomt textfält:** Visa "Var god ange en beskrivning".
2. **Delegering utan mottagare:** Visa "Var god välj mottagare".
3. **Åtgärd utan status:** Sätt standard "Påbörjad" eller kräv val.

## Tillgänglighet (a11y)

- **Modals:** `role="dialog"`, `aria-modal="true"`, fokus-fällor (Tab stannar i modal).
- **Etiketter:** `<label for="...">` på alla textfält.
- **Knappar:** `type="button"` för modals-buttons, tydlig namngivning.
- **Fokus:** Initialt fokus på textfältet när modal öppnas.

## Testfall och acceptanskriterier

| TEST-ID | AC-ID | Verifiering |
|---------|-------|------------|
| TEST-003 | AC-006 | Beslut-action sparas med text, beslutsfattare, tidsstämpel |
| TEST-003 | AC-007 | Delegering-action sparas med uppgift, parter, status, tidsstämpel |
| TEST-003 | AC-008 | Åtgärd-action sparas med åtgärd, utförare, status, tidsstämpel |

## Definition of Done

- [ ] Tre knappar synliga och klickbara.
- [ ] Modals öppnas och stängs korrekt.
- [ ] Textinmatning fungerar.
- [ ] Actions sparas till konversation som strukturerade meddelanden.
- [ ] Tidsstämplar är korrekta.
- [ ] Keyboard-interaktion fungerar (Tab, Enter, Escape).
- [ ] ARIA-labels på plats.
- [ ] Responsiv på alla skärmstorlekar.
- [ ] TEST-003 passeras.
- [ ] AC-006, AC-007, AC-008 verifieras.
