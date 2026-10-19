# ADR-XXX: Deskriptiv titel

**Status:** Proposed | Accepted | Superseded  
**Date:** YYYY-MM-DD  
**Decision maker:** [Roll/person]  

## Problem

Beskriv problemet, begränsningen eller frågan som denna ADR löser.

**Koppling till PRD:**
- Vilka PRD-ID:n är relevanta? (FR-*, NFR-*, OQ-*)
- Vilken säkerhetsprincip eller målformulering påverkas?

## Options

### Option 1: [Namn]
**Fördelar:**
- 

**Nackdelar:**
- 

**Effekt på PRD-compliance:**
- 

### Option 2: [Namn]
(Liksom för Option 1)

## Decision

Vi väljer **[Option X]** av följande skäl:

1. **PRD-compliance:** Lösningen respekterar alla relevanta PRD-krav och säkerhetsprinciper.
2. **Praktisk genomförbarhet:** Kan implementeras med tillgängliga resurser.
3. **Lokalt arbetsflöde:** Passar för lokal utveckling utan extern integration.

## Consequences

### Positiva effekter
- 

### Negativa effekter eller begränsningar
- 

### Framtida implikationer
- Vilka framtida beslut påverkas?
- Vilka system eller integrationer måste ändras vid framtida produktionisering?

## Implementation

**Vem:** [Roll]  
**Var:** [Filsökväg eller komponent]  
**Deadline:** [Datum eller MILESTONE]  

## Related ADRs

- ADR-XXX: [Relaterad beslut]

---

## Exempel: ADR-001 – Frontend-ramverk

**Status:** Accepted  
**Date:** 2024-10-14  
**Decision maker:** Implementationsteamet  

### Problem

PRD säger (OQ-001) att frontendramverket är [TBD]. Vi behöver välja mellan:
- Vanilla HTML/CSS/JavaScript
- React
- Vue

Valet påverkar utvecklingstakt, lokal körning och prototypens enighet med PRD:s krav på enkelt setup.

**Koppling till PRD:**
- OQ-001: Vilket frontendramverk och vilken lokal byggkedja ska användas?
- NFR-006: Prototypen ska kunna köras lokalt från repot enligt en kort README utan krav på externa produktionssystem.

### Options

#### Option 1: Vanilla HTML/CSS/JavaScript
**Fördelar:**
- Enklast möjligt setup – ingen byggkedja eller bundler.
- Lättast att modifiera mockdata inför nya demos.
- Lokal webbserver (Python, Node.js) räcker.
- Minsta beroendeomfattning.

**Nackdelar:**
- Mer manuell state management.
- Svårare att bygga större komponenter utan framework-struktur.

**Effekt på PRD-compliance:**
- Uppfyller NFR-006 perfekt.
- Uppfyller OQ-001 med minimal komplexitet.

#### Option 2: React
**Fördelar:**
- Stark komponent-struktur.
- Ekosystem för state management.
- Stort community.

**Nackdelar:**
- Kräver npm, node_modules, build-process (Vite/Webpack).
- Mer setup-komplexitet än Vanilla.
- Divergerar från "minimal dependency" för prototypen.

**Effekt på PRD-compliance:**
- Uppfyller PRD-krav men med ökad komplexitet.

#### Option 3: Vue
**Fördelar:**
- Mild lärningskurva mellan Vanilla och React.
- God komponent-struktur.

**Nackdelar:**
- Samma setup-komplexitet som React.
- Mindre ekosystem än React för denna skala.

### Decision

Vi väljer **Vanilla HTML/CSS/JavaScript**.

**Skäl:**
1. **PRD-compliance:** Enkelt setup utan externa beroenden uppfyller NFR-006 och OQ-001 direkt.
2. **Lokal körning:** Demonstrationsteamet kan köra prototypen på vilken dator som helst med bara en webbläsare.
3. **Mockdata-flexibilitet:** Enkelt att ändra mockinnehål i `src/mockData.js` inför nya demos.
4. **Liten utvecklingskurva:** Fokus på features, inte ramverkskonfiguration.

### Consequences

**Positiva effekter:**
- Snabb setup, lättare driftsättning.
- Fokus på användarflöde och mockdata.

**Begränsningar:**
- State management är mer manuell – vi använder ett enkelt module-pattern eller objekt-namespace för global state.
- Större komponenter kan bli längre – vi bryter dessa i mindre funktioner.

**Framtida implikationer:**
- Vid framtida produktionisering kan vi överväga att migrera till React/Vue för skalning.
- MCP-integration kan kräva backend-ramverk – det är en separat beslut senare.

### Implementation

**Vem:** Implementationsteamet  
**Var:** `src/` katalog med `index.html`, `styles.css`, `app.js`, `mockData.js`  
**Deadline:** Innan spec-finalisering (vecka 1)  

### Related ADRs

- (Ingen ännu)
