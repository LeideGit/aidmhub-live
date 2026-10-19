# FEAT-critical-alert: Automatiskt kritiskt eskalerat larm

**Status:** Pending  
**Priority:** P0 – Kärnflöde för demonstrationen  
**Related FEATs:** FEAT-DM-list, FEAT-conversation, FEAT-history, FEAT-demo-reset

## Syfte

Denna feature implementerar automatisk utlösning av ett kritiskt maskinlarm efter 10 sekunder från start, följt av eskalering till nästa ansvarsnivå (Maskingruppsansvarig) när Maskinansvarig inte kvitterar i tid. Larmet visas högst upp i DM-listan med tydlig märkning.

## Omfattning

**Ingår:**
- Automatisk larmutlösning 10 sekunder efter start av prototypen eller efter att demo-scenariot återställs.
- Larmtyp: "Temperaturöverkridning HPM-2400" (mockad maskinrelaterad händelse).
- Automatisk eskalering: Maskinansvarig förväntades kvittera inom 30 sekunder, men gjorde det inte → eskalera till Maskingruppsansvarig.
- Larmets botkonversation flyttas högst upp i DM-listan.
- Tydlig märkning: Röd bakgrund, ⚠️-ikon, text "KRITISK ESCALERING".
- Larmdetaljer visas: ursprungligt larm, maskin, larmtyp, prioritet, tid, eskaleringsorsak, kvitteringsfrist.
- Simulerad kvittering-möjlighet: Användaren kan klicka "Kvittera" för att bekräfta larmens mottagande.

**Utgår:**
- Ingen verklig MCP-integration med maskin.
- Ingen automatisk åtgärd eller styrkommando.
- Ingen produktionsdata eller verklig maskintelemetri.
- Ingen extern backend eller databas.

## Relaterade PRD-ID:n

| Typ | ID | Beskrivning |
|-----|----|----|
| Mål | OBJ-01 | Ett simulerat eskalerat kritiskt larm ska uppstå automatiskt 10 sekunder efter start |
| Mål | OBJ-02 | Det kritiska larmet ska omedelbar flyttas högst upp i DM-listan med tydlig märkning |
| UC | UC-02 | Ta emot ett eskalerat kritiskt larm |
| FR | FR-004 | Ett mockat kritiskt larm ska utlösas automatiskt efter 10 sekunder |
| FR | FR-005 | Larmet ska vara märkt som eskalerat på grund av utebliven kvittering från Maskinansvarig |
| FR | FR-006 | Den larmande botkonversationen ska flyttas högst upp i DM-listan när larmet inträffar |
| FR | FR-007 | Det kritiska larmet ska ha tydlig visuell märkning utan att enbart förlita sig på färg |
| FR | FR-008 | Konversationen ska visa ursprungligt larm, maskin, larmtyp, prioritet, tid, kvitteringsfrist och eskaleringsorsak |
| FR | FR-009 | Användaren ska kunna kvittera att larmet har uppmärksammats |
| NFR | NFR-002 | Kritiskt larm, eskalering och actions ska vara tydligt uppfattbara med text/ikon och inte enbart färg |
| AC | AC-001 | Givet start, när 10 sek, då visas kritiskt eskalerat larm utan manuell trigger |
| AC | AC-002 | Larmet flyttas högst upp i DM-listan med text/ikonbaserad märkning |
| AC | AC-003 | Larmvyn visar ursprungligt larm, maskin, larmtyp, prioritet, tider och eskalering |
| TEST | TEST-001 | End-to-end demo från 10-sekunderslarm till historik |
| TEST | TEST-002 | Sortering och märkning av det kritiska larmet i DM-listan |

## Användarflöde

```
┌──────────────────────┐
│  Prototypen startas  │
└──────────┬───────────┘
           │
           v
    ┌──────────────┐
    │ Vänta 10 sek │  ← setTimeout(10000)
    └──────┬───────┘
           │
           v
┌──────────────────────────┐
│  Skapa kritiskt larm     │
│  Larm-ID: alarm_001      │
│  Machine: HPM-2400       │
│  Type: "Temperaturöver"  │
│  Level: 5 (Critical)     │
│  Status: "pending"       │
└──────────┬───────────────┘
           │
           v
    ┌──────────────────┐
    │ Verifiera om ACK │
    │ inom 30 sek?     │ ← Redan i denna demo: NO
    └──────┬───────────┘
           │ NO
           v
┌──────────────────────────────────────┐
│  Eskalera larmet                     │
│  Status: "escalated"                 │
│  Escalated to: Maskingruppsansvarig  │
│  Escalation reason: "no_ack_timeout" │
└──────────┬───────────────────────────┘
           │
           v
┌──────────────────────────────────────┐
│  Flytta botkonversation högst upp    │
│  i DM-listan                         │
│  Märka med röd bakgrund + ⚠️ ikon    │
│  Text: "KRITISK ESCALERING"          │
└──────────┬───────────────────────────┘
           │
           v
┌──────────────────────────────┐
│  Larmvyn öppnas för den      │
│  aktiva användaren           │
│  (Maskingruppsansvarig)      │
│  Visa larmdetaljer:          │
│  - Ursprungligt larm         │
│  - Maskin (HPM-2400)         │
│  - Larmtyp (Temp. över.)     │
│  - Prioritet (Kritisk)       │
│  - Skapad tid                │
│  - Eskaleringsorsak (Timeout)│
└──────────────────────────────┘
```

## Data och informationsmodell

**Larm-objekt (från PRD avsnitt 10):**
```javascript
alarm = {
  alarmId: "alarm_001",           // Larm-ID
  machineId: "HPM-2400",          // Kopplad maskin
  alarmType: "TemperatureOverrun",// Larmtyp
  level: 5,                       // 1–5, där 5 = kritisk
  ruleSource: "machine_rules_v1", // Regelkälla
  createdAt: timestamp,           // Tid när larmet skapades
  ackDeadline: timestamp + 30s,   // Kvitteringsfrist (30 sek)
  status: "pending" | "acknowledged" | "escalated",
  escalatedTo: "group_manager",   // Nästa ansvarsnivå
  escalationReason: "no_ack_timeout",
  escalatedAt: timestamp          // Tid för eskalering
};
```

**Bot-konversation (kopplas till larmet):**
```javascript
conversation = {
  conversationId: "conv_alarm_001",
  participantIds: ["bot_hpm_sensor", "user_machine_owner"],
  messages: [
    {
      messageId: "msg_001",
      senderId: "bot_hpm_sensor",
      type: "alert",
      text: "Temperaturöverkridning detekterad på HPM-2400. Sensor rapporterar 127°C mot normalt 85°C.",
      timestamp: alarm.createdAt,
      data: {
        sensor: "TEMP_01",
        value: 127,
        unit: "°C",
        threshold: 85
      }
    }
  ],
  status: "active",
  priority: "critical",
  escalation: {
    from: "machine_owner",
    to: "group_manager",
    reason: "no_ack_timeout",
    timestamp: alarm.escalatedAt
  }
};
```

## Gränssnitts-krav

### DM-listan – Larmat objekt
- **Placering:** Längst upp (högsta prioritet).
- **Visual märkning:**
  - Röd bakgrund (`#D42426` eller motsvarande).
  - ⚠️ Ikon före botnamnet.
  - Text "KRITISK ESCALERING" i fetare font.
  - Inte enbart färg (uppfyller NFR-002).
- **Innehål:** Bot-namn, "Temperaturöverkridning", maskin-ID, tid, eskaleringsikon.
- **Interaktion:** Klick öppnar larmets konversation och detaljer.
- **Keyboard:** Tab-fokusbar, Enter för att öppna.
- **ARIA:** `role="alert"` och `aria-label="Kritisk eskalering från HPM-2400"`.

### Larm-detaljvyn
- **Header:**
  - ⚠️ Ikon + "KRITISK ESCALERING" i röd.
  - Maskin-ID: "HPM-2400".
  - Skapad tid: "2024-10-14 14:23:45".
- **Ursprungligt larm:**
  - Larmtyp: "Temperaturöverkridning".
  - Sensorvärde: "127°C (normal: 85°C)".
  - Regelkälla: "Maskinstyrande regler".
- **Eskalering:**
  - "Larmet eskalerade till Maskingruppsansvarig eftersom Maskinansvarig inte kvitterade inom 30 sekunder."
  - Eskalerad tid: "2024-10-14 14:23:50" (5 sek senare).
- **Åtgärder:**
  - "Kvittera"-knapp (bekräfta mottagande).
  - "Öppna konversation"-knapp.

### Responsivitet
- **Desktop (1920px):** Full visning som ovan.
- **Tablet (768px):** Larmdetaljer staplas vertikalt, knapparna är stora (minst 44px).
- **Mobil (375px):** Larmdetaljer på en kolumn, fullbredd, knapparna stack ade.

## Fel- och kantfall

1. **Larmet uppstår men listan är redan körd tidigare:**
   - Scenariot har redan körts en gång. Löst genom `FEAT-demo-reset` – reset-knapp återställer larmet.

2. **Användaren är redan inne i larmets konversation när det uppstår:**
   - Larmvyn uppdateras in-place med eskaleringsmärkningen.
   - Användaren behöver inte förlora sin kontext.

3. **Webbläsaren har JavaSc ript inaktiverat:**
   - Larmet kommer inte att utlösas. Försök att starta på nytt med JS aktiverat.
   - (Inte ett krav att hantera i denna mockad prototyp – vi antar JS är aktiverat.)

4. **10 sekunder går långsamt på vissa enheter:**
   - Använd `Date.now()` eller `performance.now()` för noggrann timing.
   - Verifiera att `setTimeout` är korrekt (10000 ms = 10 sek).

## Tillgänglighet (a11y)

- **ARIA:** `role="alert"` för larmmarkering, `aria-live="assertive"` när larmet dyker upp i listan.
- **Keyboard:** Tab till larmet, Enter för att öppna.
- **Fokusindikator:** Synlig `outline` runt larmet när det är fokuserat.
- **Färg + text:** Röd bakgrund + ⚠️-ikon + "KRITISK ESCALERING"-text. Aldrig enbart färg.
- **Skärmläsare:** "Kritisk eskalering från HPM-2400 sensorbot, Temperaturöverkridning, eskalerad för 5 sekunder sedan."

## Testfall och acceptanskriterier

| TEST-ID | AC-ID | Verifiering |
|---------|-------|------------|
| TEST-001 | AC-001 | Prototypen startas, efter 10 sek visas kritiskt larm utan manuell trigger |
| TEST-002 | AC-002 | Larmet flyttas högst upp i DM-listan med text + ikon märkning |
| TEST-002 | AC-003 | Larmvyn visar ursprungligt larm, maskin, larmtyp, prioritet, tider, eskaleringsorsak |
| TEST-001 | AC-006 | Användaren kan senare skapa Beslut/Delegering/Åtgärd via förslagsknappar |

## Definition of Done

- [ ] `setTimeout(10000)` triggerar larmskapning automatiskt.
- [ ] Larmet får status "escalated" och flyttas högst upp i listan.
- [ ] Röd märkning + ⚠️-ikon synlig utan enbart färg.
- [ ] Larmdetaljer visas: ursprungligt larm, maskin, prioritet, tid, eskaleringsorsak.
- [ ] Kvittera-knapp fungerar.
- [ ] Responsiv på desktop, tablet, mobil.
- [ ] Tillgänglighet: Tangentbord, fokus, ARIA, semantik.
- [ ] AC-001, AC-002, AC-003 verifieras manuellt.
- [ ] TEST-002 körs och passeras.
- [ ] Dokumenterad i `project/progress.md` och `feature-list.json`.
