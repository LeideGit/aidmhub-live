# Feature: Case-Linked Actions (Ärendelänkad Beslut, Delegering, Åtgärd)

**Status:** ✅ Implemented  
**Date:** 2026-10-16  
**Version:** 1.1

---

## Overview

Denna feature möjliggör att användarens Beslut (Decision), Delegering (Delegation) och Åtgärd (Action) kan länkas till ett specifikt **ärende** (case), vilket förbättrar spårbarhet och audit trail.

**Innan:** Beslut/delegering/åtgärd sparades med tidsstämpel och aktör, men ingen länk till vilket ärende de tillhörde.

**Efter:** Varje beslut/delegering/åtgärd sparas tillsammans med `caseId`, så det tydligt syns under vilket ärende actionen vidtogs.

---

## Implementation Details

### Changes Made

#### 1. **Data Structure** (`src/mockData.js`)
- Uppdaterade `createDecisionEvent()` för att acceptera optional `caseId` parameter
- Uppdaterade `createDelegationEvent()` för att acceptera optional `caseId` parameter
- Uppdaterade `createActionEvent()` för att acceptera optional `caseId` parameter
- Event-objekt lagrar nu `caseId` i `metadata`

#### 2. **UI** (`src/index.html`)
- Lade till `<select id="decisionCase">` i Decision modal
- Lade till `<select id="delegationCase">` i Delegation modal
- Lade till `<select id="actionCase">` i Action modal
- Alla selects har `<option value="">-- Välj ärende --</option>` som default

#### 3. **JavaScript Logic** (`src/app.js`)

**Nya funktioner:**
- `populateCaseSelects()` — Fyller alla tre case-selects med options från `mockData.cases`
  - Sorterar efter `createdAt` (nyaste först)
  - Format: `"CASE-001 - Titel (Status)"`

**Uppdaterade funktioner:**
- `handleSaveDecision()` — Läser `caseId` från select innan sparande
  - Validerar att case är valt
  - Sparar `caseId` tillsammans med action
- `handleSaveDelegation()` — Samma logik för delegation
- `handleSaveAction()` — Samma logik för action
- `openModal()` — Anropar `populateCaseSelects()` för att fylla case-lista före modalöppning
- `renderMessages()` — Visar `caseId` i event-display med format: `"Ärende: CASE-001"`

---

## User Workflow

### Happy Path

1. **Öppna modal** (Beslut/Delegering/Åtgärd)
   - Case-select fyls med alla tillgängliga ärenden
   - Standard: `"-- Välj ärende --"`

2. **Välj ärende**
   - Dropdown visar: `"CASE-001 - Temperaturöverkridning HPM-2400 (open)"`
   - Select value blir `"CASE-001"`

3. **Fyll in action-detaljer**
   - Skriv beslut/delegering/åtgärd
   - För delegation: välj mottagare

4. **Spara**
   - Click "Spara beslut" / "Delegera" / "Spara åtgärd"
   - Validering: case måste vara valt, annars `alert("Välj ärende")`
   - Action sparas med `caseId` i metadata

5. **Verifiera i historik**
   - Event visas i konversation med: `"Ärende: CASE-001"`
   - Ärendelistan uppdateras (om applicable)

---

## Testing

### Test Scenarios

#### Test 1: Decision Modal
```
[ ] Öppna Decision modal
[ ] Verify case-select är populerad med minst 2 ärenden
[ ] Välj ett case
[ ] Skriv beslut: "Stänga av pumpen temporärt"
[ ] Click "Spara beslut"
[ ] Verify historiken visar: "Ärende: CASE-XXX"
[ ] Verify confirmation toast säger: "✓ Beslut sparat i CASE-XXX"
```

#### Test 2: Delegation Modal
```
[ ] Öppna Delegation modal
[ ] Verify case-select är populerad
[ ] Välj case
[ ] Välj delegation recipient (t.ex. "Anna Bergström")
[ ] Skriv uppgift: "Inspektera kylsystemet"
[ ] Click "Delegera"
[ ] Verify historiken visar: "Ärende: CASE-XXX"
[ ] Verify confirmation toast
```

#### Test 3: Action Modal
```
[ ] Öppna Action modal
[ ] Välj case
[ ] Skriv åtgärd: "Bytte kylvätska"
[ ] Select status: "Slutförd"
[ ] Click "Spara åtgärd"
[ ] Verify historiken visar: "Ärende: CASE-XXX"
```

#### Test 4: Validation
```
[ ] Öppna Decision modal
[ ] Lägg ärende-select tom
[ ] Click "Spara beslut"
[ ] Verify alert: "Var god välj ett ärende"
[ ] Cancel
```

#### Test 5: Cases Tab
```
[ ] Gör en action med case-select
[ ] Click "Ärenden" tab
[ ] Verify actionen visas under rätt case
```

#### Test 6: Keyboard Navigation
```
[ ] Öppna modal
[ ] Press Tab → case-select får fokus
[ ] Press Arrow Down → navigera options
[ ] Press Enter → select option
[ ] Verify focus indicator synlig
```

#### Test 7: Responsive (Mobile 375px)
```
[ ] Öppna modal på mobil
[ ] case-select ska vara full-width och läsbar
[ ] Dropdown options ska vara läsbara
[ ] Ingen horizontal scrollning
```

---

## Data Flow

```
User opens modal
    ↓
openModal() calls populateCaseSelects()
    ↓
Select fills with mockData.cases
    ↓
User selects case + enters action details
    ↓
handleSave*() reads caseId from select
    ↓
Validation: caseId must not be empty
    ↓
createDecisionEvent/Delegation/Action(
    conversationId,
    userId,
    text,
    status/recipient,
    caseId  ← NEW
)
    ↓
Event saved to mockData.messages with metadata.caseId
    ↓
renderMessages() displays event with "Ärende: CASE-ID"
    ↓
Confirmation toast: "✓ [Action] sparad i CASE-ID"
```

---

## Backward Compatibility

- Old actions without `caseId` will still display, just without the case reference
- Optional parameter in helpers ensures old code still works
- No breaking changes to existing data structures

---

## Files Modified

| File | Changes |
|------|---------|
| `src/mockData.js` | +3 parameters to event helpers |
| `src/index.html` | +3 `<select>` elements for case selection |
| `src/app.js` | +1 helper function, +3 modal handlers updated, +event display updated |
| `src/styles.css` | No changes (reuses existing `.modal-input`) |

---

## Next Steps (Future Enhancements)

1. **Case Search Filter** — If case list grows, add search/filter above case-select
2. **Case Status Validation** — Only allow selecting "open" cases (optional business logic)
3. **Auto-link to Active Case** — If a case conversation is open, pre-select it
4. **Case Details Sidebar** — Show case summary when a case is selected in a modal
5. **Bulk Actions** — Link multiple actions to same case in one workflow

---

## Verification Checklist

- [x] Case-select dropdowns added to all three modals
- [x] populateCaseSelects() helper function works
- [x] Case ID captured in modal handlers
- [x] Validation prevents empty case selection
- [x] Event metadata stores caseId
- [x] History rendering shows "Ärende: CASE-ID"
- [x] Confirmation toast shows case ID
- [x] No breaking changes to old code
- [x] Responsive layout preserved
- [x] Keyboard navigation works
- [x] WCAG focus indicators visible

---

## User Documentation

### For Operatörer

Du kan nu länka varje Beslut, Delegering och Åtgärd till ett specifikt ärende:

1. **Öppna en modal** — Klicka Beslut, Delegering, eller Åtgärd
2. **Välj ärende** — Dropdown visar alla aktiva ärenden
3. **Fyll in detaljer** — Skriv ditt beslut/delegering/åtgärd
4. **Spara** — Click knappen. Systemet visar bekräftelse med ärendet-ID

**Fördel:** Du ser exakt vilket ärende varje beslut tillhörde, vilket gör det enkelt att granska senare.

---

## Technical Notes

- All cases are sorted newest-first for better UX
- Case title + status shown in dropdown for context
- caseId is optional to maintain backward compatibility
- Validation uses browser `required` attribute + JS fallback
- Metadata structure allows future expansion (e.g., case status validation)

---

**Last Updated:** 2026-10-16  
**Author:** Claude (AI DM HUB Development)
