# FEAT-DM-list: Gemensam DM-lista med kollegor och botar

**Status:** Pending  
**Priority:** P0 – Grundläggande UI-struktur  
**Related FEATs:** FEAT-responsive, FEAT-accessibility, FEAT-critical-alert

## Syfte

Denna feature implementerar en gemensam Direct Message-lista som visar kollegor och maskinbotar blandade tillsammans, med tydlig typ-märkning för var som helst användare och bot. Listan är sorterbar efter aktivitet, priority och status.

## Omfattning

**Ingår:**
- Visa lista över 6–8 mockade kollegor och 4–5 mockade botar tillsammans.
- Typ-märkning: Text och ikon som skiljer människor från botar (t.ex. 👤 för person, 🤖 för bot).
- Varje listpost visar: Namn/bot-ID, senaste aktivitet, oläst-indikator (●), prioritet (om larmat).
- Sortering: Nyaste aktivitet först, sedan efter prioritet (kritiska larm högst upp).
- Klick på listpost öppnar konversation.
- Oläst-status uppdateras när användaren läser meddelanden.

**Utgår:**
- Ingen search/filter-funktionalitet (fokus på demonstrationsflödet).
- Ingen real-time push-notifikationer från extern server.
- Ingen verklig inloggning eller användarhantering.

## Relaterade PRD-ID:n

| Typ | ID | Beskrivning |
|-----|----|----|
| Mål | OBJ-01, OBJ-02, OBJ-03 | Kärnflöde: visa DM-lista, kritiskt larm högst upp |
| UC | UC-01 | Se en gemensam DM-lista med kollegor och botar |
| FR | FR-001 | Hubben ska visa kollegor och botar i samma DM-lista |
| FR | FR-002 | Varje listpost ska tydligt visa om avsändaren är människa eller bot |
| FR | FR-003 | DM-listan ska visa relevant status, oläst indikator, senaste aktivitet och prioritet |
| FR | FR-025 | Prototypen ska innehålla flera botar och kollegor |
| NFR | NFR-001 | Desktop-first, responsiv för mobil/tablet |
| AC | AC-012 | DM-listan innehåller flera människor och botar, varje typ kan skiljas visuellt och textuellt |
| TEST | TEST-002 | Sortering och märkning av det kritiska larmet i DM-listan |

## Användarflöde

```
┌────────────────────┐
│  Prototypen öppnas │
└─────────┬──────────┘
          │
          v
┌──────────────────────┐
│ Ladda mockData.js    │
│ - users[]            │
│ - bots[]             │
│ - conversations[]    │
└─────────┬────────────┘
          │
          v
┌──────────────────────────────┐
│ Rendera DM-listan            │
│ Sortera efter:               │
│ 1. Priority (critical först) │
│ 2. Senaste aktivitet         │
│ 3. Namn/ID                   │
└─────────┬────────────────────┘
          │
          v
┌──────────────────────┐
│  Visa för användar:  │
│  - Namn/Bot-ID       │
│  - Typ (👤 eller 🤖)  │
│  - Senaste meddelande│
│  - Tid               │
│  - Oläst-indikator   │
│  - Priority-märke    │
└─────────┬────────────┘
          │
          v
┌──────────────────────┐
│ Användaren klickar   │
│ på en konversation   │
│ → Öppna dialog       │
└──────────────────────┘
```

## Data och informationsmodell

**Mockade användare (mockData.js):**
```javascript
users: [
  { 
    userId: "usr_001", 
    name: "Anna Bergström", 
    role: "Maskinansvarig", 
    type: "human" 
  },
  { 
    userId: "usr_002", 
    name: "Erik Svensson", 
    role: "Maskingruppsansvarig", 
    type: "human" 
  },
  // ... fler kollegor
]
```

**Mockade botar:**
```javascript
bots: [
  { 
    botId: "bot_hpm", 
    name: "HPM-2400 Sensor Bot", 
    type: "bot", 
    machineId: "HPM-2400", 
    capabilities: ["alert", "status", "recommendations"] 
  },
  { 
    botId: "bot_dryer", 
    name: "Tork-enhet Monitor", 
    type: "bot", 
    machineId: "TRK-500", 
    capabilities: ["temperature", "humidity", "diagnostics"] 
  },
  // ... fler botar
]
```

**Konversationer:**
```javascript
conversations: [
  {
    conversationId: "conv_001",
    participantIds: ["usr_001", "bot_hpm"],
    lastMessage: "Temperaturöverkridning detekterad...",
    lastActivity: timestamp,
    unreadCount: 0,
    priority: "normal",
    status: "active"
  },
  // ... fler konversationer
]
```

## Gränssnitts-krav

### DM-lista – Layout

**Desktop (1920px):**
- Vänster panel (20-25 % bredd), scroll bar vid behov.
- Var liste-item: ~60px höjd.
- Tema: Ljus background, mörkare text, gräns mellan items.

**Struktur per item:**
```
┌─────────────────────────────────┐
│ 👤 Anna Bergström       [unread] │ ← Namn + typ-ikon, oläst-indikator höger
│ "Kan du checka hydraulpumpen?" │ ← Senaste meddelande (1 rad, trunkerad)
│ 2 timmar sedan           Normal │ ← Tid, prioritet
└─────────────────────────────────┘
```

**Kritisk larmad item (röd märkning):**
```
┌─────────────────────────────────┐
│ ⚠️🤖 HPM-2400 Sensor Bot   [new] │ ← Ikon för kritisk + bot-typ
│ "Temperaturöverkridning 127°C"  │
│ Nu                    CRITICAL   │ ← Röd text för CRITICAL
└─────────────────────────────────┘
```

### Typ-märkningar
- **Människa:** 👤 (U+1F464) + namn.
- **Bot:** 🤖 (U+1F916) + bot-namn.
- **Oläst-indikator:** Blå prick (●) eller badge med antal.
- **Prioritet:** "Normal" | "High" | "CRITICAL" (röd text, fet).

### Interaktion
- **Hover:** Ljusare bakgrund, indikering att den är klickbar.
- **Klick:** Öppna konversation i höger panel.
- **Keyboard:** Tab mellan items, Enter för att öppna.
- **Aktiv:** Märka aktuell konversation med mörkare bakgrund/kant.

## Responsivitet

**Desktop (1920px):**
- Separat kolumn vänster (DM-lista), höger konversation.

**Tablet (768px):**
- DM-lista kan kollapsa via toggle-knapp (☰ meny).
- Eller: Staplad layout, DM-lista ovanför konversation.

**Mobil (375px):**
- Full-bredd lista, tapp för att öppna konversation.
- Eller: Togglebar mellan listan och konversation.

## Fel- och kantfall

1. **Tom lista initialt (inga konversationer):**
   - Visa "Inga konversationer ännu. Invänta ett larm eller börja skriva." (men detta är inte en demo-scenario).

2. **Många items – scrollning:**
   - Virtualisering eller lazy-loading om listan blir för stor.
   - För denna demo: 10-15 items räcker.

3. **Konversation uppdateras medan den visas:**
   - Uppdatera senaste meddelandetext och tid live.
   - Flytta item högre om prioritet ändras (kritiskt larm).

## Tillgänglighet (a11y)

- **ARIA:** `role="list"` på container, `role="listitem"` på varje item.
- **Etiketter:** `aria-label="Anna Bergström, Maskinansvarig, senaste meddelande: Kan du checka hydraulpumpen?, 2 timmar sedan"`.
- **Keyboard:** Tab mellan items, Enter för att öppna, Escape för att stänga konversation.
- **Fokus:** Synlig outline runt fokuserad item.
- **Semantik:** Använd `<button>` eller `<a>` för klickbara items, inte bara `<div>`.

## Testfall och acceptanskriterier

| TEST-ID | AC-ID | Verifiering |
|---------|-------|------------|
| TEST-002 | AC-012 | DM-listan visar människor och botar, typ kan skiljas visuellt |
| TEST-002 | AC-002 | Kritiskt larm syns högst upp med märkning |
| TEST-007 | AC-014 | Listan är responsiv på desktop, tablet, mobil |
| TEST-008 | AC-014 | Tangentbord och fokus fungerar |

## Definition of Done

- [ ] Mockade användare och botar ladder från `src/mockData.js`.
- [ ] DM-lista renderas med alla items sorterade korrekt.
- [ ] Typ-märkningar (👤, 🤖) synliga för varje item.
- [ ] Klick öppnar konversation (integrera med FEAT-conversation senare).
- [ ] Oläst-indikator uppdateras.
- [ ] Responsiv på desktop, tablet, mobil.
- [ ] Keyboard-navigering fungerar (Tab, Enter, Escape).
- [ ] ARIA-labels och semantik på plats.
- [ ] AC-012 verifieras.
- [ ] TEST-002 kørs och passeras.
- [ ] Dokumenterad i progress.md och feature-list.json.
