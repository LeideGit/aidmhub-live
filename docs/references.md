# Tekniska referenser för AI DM HUB

## Officiella dokumentation

### HTML & Semantik
- **MDN Web Docs – Semantic HTML:** https://developer.mozilla.org/en-US/docs/Glossary/Semantics
  - Använt för: `<main>`, `<section>`, `<article>`, `<nav>`, rollkorrekthet.
  - Åtkomst: 2024-10-14

- **ARIA Authoring Practices Guide (APG):** https://www.w3.org/WAI/ARIA/apg/
  - Använt för: `role`, `aria-label`, `aria-live` vid dynamiska uppdateringar.
  - Åtkomst: 2024-10-14

### CSS & Responsiv design
- **MDN Web Docs – Responsive Design:** https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout/Responsive_Design
  - Använt för: Media queries, mobile-first approach, Flexbox/Grid.
  - Åtkomst: 2024-10-14

- **CSS Custom Properties (Variables):** https://developer.mozilla.org/en-US/docs/Web/CSS/--*
  - Använt för: Färger, storlekar, typografi-variabler.
  - Åtkomst: 2024-10-14

### JavaScript
- **MDN Web Docs – JavaScript Modules:** https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules
  - Använt för: Modulär struktur med ES6 modules (om tillämpligt).
  - Åtkomst: 2024-10-14

- **JavaScript Date & Time:** https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date
  - Använt för: Tidsstämplar, formatering av tidsuppgifter.
  - Åtkomst: 2024-10-14

### Tillgänglighet
- **WCAG 2.1 Guidelines:** https://www.w3.org/WAI/WCAG21/quickref/
  - Målnivå: AA (Minimum för denna prototype).
  - Områden: Perception, Operability, Understandability, Robustness.
  - Åtkomst: 2024-10-14

- **WebAIM – Keyboard Accessibility:** https://webaim.org/articles/keyboard/
  - Använt för: Tab-ordning, fokushantering, tangentbordsnavigering.
  - Åtkomst: 2024-10-14

- **WebAIM – Color Contrast:** https://webaim.org/articles/contrast/
  - Använt för: Kontrast mellan text och bakgrund (4.5:1 för normal text).
  - Åtkomst: 2024-10-14

## Lokala resurser

### Mockdata
- **Fil:** `src/mockData.js`
- **Format:** JavaScript-objekt med machines, users, bots, alarms, conversations, history.
- **Versioning:** Se CHANGELOG.md för ändringshistorik.

### Komponenter
- **DM List:** `src/components/dmList.js` – Rendererar konversationslistan.
- **Conversation:** `src/components/conversation.js` – Visar meddelanden och dialogen.
- **Actions:** `src/components/actions.js` – Beslut, delegering, åtgärd-knappar.
- **Mentions:** `src/components/mentions.js` – @-sökning.
- **SlashCommands:** `src/components/slashCommands.js` – /-sökning.
- **History:** `src/components/history.js` – Kronologisk historik.

## Öppna frågor och framtida resurser

### OQ-005 – MCP-visualisering
**Status:** [TBD] – UX och tekniskt ansvarig tar fram prototypmärkning.

Denna fråga handlar om hur botens framtida MCP-källorna och datatillförlitligheten visualiseras utan att antyda verklig anslutning. Kommer att kräva:
- Designdokumentation för how to mark "mock MCP source".
- Eventuell längre fram: MCP-dokumentation (https://modelcontextprotocol.io/).

### OQ-006 – Framtida säkerhets- och regulatoriska standarder
**Status:** [TBD] – Säkerhets-/verksamhetsansvarig utreder innan verkliga data ansluts.

Framtida produkt kommer att kräva:
- ISO 13849-1 (funktionell säkerhet för maskiner).
- IEC 61508 (allmän funktionell säkerhetsstandardard).
- GDPR (dataskydd om användardata lagras).

Dessa är ej relevanta för denna mockade prototyp.

## Validering av referenser

Alla externa referencias kontrolleras för:
1. **Tillgänglighet:** URL fungerar och innehållet är fortfarande giltigt.
2. **Relevans:** Referensen stödjer faktiska PRD-krav eller utvecklingsbeslut.
3. **Versioner:** Åtkomstdatum och versionsnummer dokumenteras.

Senast uppdaterad: 2024-10-14
