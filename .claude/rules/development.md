# Utvecklingsregler för AI DM HUB

## Kodkvalitet

### HTML
- Använd **semantisk HTML5**: `<main>`, `<section>`, `<article>`, `<nav>`, `<header>`, `<footer>` där relevant.
- Alla interaktiva element (knappar, inmatningsfält) ska ha tydliga `<label>` eller `aria-label`.
- `id`-attribut ska enbart användas för formrelaterade element eller specifika JavaScript-hooks.

### CSS
- Använd **CSS-variabler** för färger, storlekar, typografi för konsistens.
- **Desktop-first:** Definiera desktop-layout, lägg sedan media queries för tablet/mobil.
- Breakpoints: `768px` (iPad), `375px` (iPhone). Testa dessa specifikt.
- Ingen horisontell scrollning på huvudvyer (DM-lista, konversation, actions, historik) på någon skärmstorlek.
- **Tillgänglighet:** Kritiska larm märks med text + ikon + färg. Ingen färg-ensam indikator.
- **Fokus:** `outline: 2px solid #0066cc` eller motsvarande – aldrig `outline: none`.

### JavaScript
- Modulär struktur: En fil per större komponent/sektion.
- Namn: `camelCase` för variabler/funktioner, `kebab-case` för CSS-klasser.
- Ingen global state utan `window`-objekt – använd enkla moduler eller namespace.
- Kommentarer: Endast om logiken är icke-uppenbar. Kod ska läsas själv.

## Mockdata

- **Alla data är fiktiv:** Svenska namn, realistiska men helt simulerade maskintyper.
- **Exempel botar:** "Hydraulpump-1 Sensor Bot", "Tork-enhet Monitor", "Värmesystem Advisor".
- **Exempel kollegor:** "Anna Bergström", "Erik Svensson", "Maria Holm".
- **Exempel maskiner:** "HPM-2400", "TRK-500", "VX-1200".
- **Larmtexter:** Realistiska men maskerade (t.ex. "Temperatur överskridning", "Vibrationsökning", "Tryckavvikelse").
- Mockdata lagras i `src/mockData.js` och är lätt att ändra.

## Komponentstruktur

Bygga i moduler utan framework-overhead:

1. **DM-List Component** – Visa lista över konversationer, markera larmade/nya, sortera efter prioritet/tid.
2. **Conversation Component** – Visa meddelanden kronologiskt, skillnad mellan människa/bot.
3. **Actions Component** – Knapppar för Beslut, Delegering, Åtgärd; popups/modals för inmatning.
4. **Mention Component** – @-sökning, resultatval, infogning i chatfält.
5. **SlashCommand Component** – /-sökning, resultatval, infogning i chatfält.
6. **History Component** – Kronologisk lista över alla händelser med aktör, typ, tidsstämpel.
7. **Layout Component** – Desktop/tablet/mobil responsivitet, flex/grid-baserad.

## Tillgänglighet (a11y)

- **ARIA-roles:** `role="main"`, `role="list"`, `role="listitem"`, `role="button"` där relevant.
- **ARIA-labels:** `aria-label="Sök kollegor"` för sökfält, `aria-label="Kritiskt larm"` för alarmsymbol.
- **ARIA-live:** `aria-live="polite"` för nya meddelanden som dyker upp dynamiskt.
- **Tangentbord:** Tab-ordning ska vara logisk (uppifrån ned, vänster till höger).
- **Fokusindikator:** Alltid synligt och tydligt, minst `4px`.
- **Färg + text:** Aldrig enbart färg för status. Använd text + ikon + färg.
- **Form:** Alla inmatningsfält ska ha `<label>` kopplad via `for`/`id`.

## Responsivitet

- **Desktop (1920px och större):** Full sidlayout. DM-lista vänster (20-25 % bredd), konversation/actions höger (75-80 %).
- **Tablet (768px):** Samma layout eller stapla om nödvändigt. Knappstorlek ≥ 44px för touch.
- **Mobil (375px):** Staplad layout. DM-lista först (collapsible), sedan konversation, sedan actions. All text läsbar utan zoom.

## Säkerhetsbegränsningar

- **SEC-001:** Ingen funktion får skicka styrkommandon. Verifierade möjligheter: läsa meddelanden, skriva meddelanden, koppla in personer, spara beslut/delegering/åtgärd (ej bindande).
- **SEC-002:** Alla botsvar märks explicit som "Rekommendation (beslutsstöd)" eller liknande.
- **SEC-003:** Gränssnittet antyder aldrig att hubben ersätter befintliga säkerhetssystem. Formuleringar: "Denna analys är en rekommendation" inte "Systemet rekommenderar att du...".
- **SEC-004:** All data är mockad. Använd names som `mock_temp_sensor_001`, aldrig något som liknar verklig produktionsutrustning.

## Design-principer

- **Klara prioriteringar:** Det kritiska larmet ska ta upp ~30 % av uppmärksamheten visuellt.
- **Konsistens:** Samma knapp-stil, färger, typografi överallt.
- **Minimalism:** Ingen visuell bullriga eller överflödig animering. Använd motion för funktionalitet (t.ex. "nytt meddelande kommer in").
- **Feedback:** Användaren vet alltid vad som händer – knapparna säger vad de gör, actions ger feedback.

## Lokalt arbetsflöde

```bash
# Setup
./scripts/setup.sh

# Kör lokal server
./scripts/run.sh
# Öppnas i http://localhost:8000

# Under utveckling: spara och ladda om webbläsare (F5)

# Validera specs
./scripts/validate-specs.sh

# Kör evals
./scripts/run-evals.sh

# Verifiera allt
./scripts/verify.sh
```

## Versionering av mockdata

Mockdata-versioner lagras i `src/mockData.js`:

```javascript
const mockData = {
  version: "1.0",
  timestamp: "2024-10-14T00:00:00Z",
  machines: [...],
  users: [...],
  bots: [...],
  // etc.
};
```

Ändringar i mockdata dokumenteras i `CHANGELOG.md`.
