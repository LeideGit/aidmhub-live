# FEAT-mentions: @-omnämnanden och /-referenser

**Status:** Done
**PRD-länk:** UC-05, UC-06, FR-021, FR-022, AC-004, AC-009, AC-010, TEST-004, TEST-005
**Relaterade FEAT:** FEAT-DM-list, FEAT-history, FEAT-critical-alert

## 1. Syfte
Låta användaren koppla in mockade kollegor och botar (`@`) och infoga mockade ärenden, maskinparametrar och larm (`/`) direkt i meddelandefältet, så att rätt personer och rätt kontext finns i konversationen.

## 2. Omfattning
- **Ingår:** Förslagslista i meddelandefältet, tangentbordsnavigering, infogning i textflödet, koppling av vald person/bot till konversationen (sparas i `conversations.invited_ids`), visuell markering av `@namn` och `[referens]` i skickade meddelanden.
- **Utgår:** Notifiering till den inkopplade personen, verkliga användare, fri sökning i externa system, maskinstyrning (SEC-001).

## 3. Relaterade PRD-ID:n

| Typ | ID | Beskrivning |
|-----|----|----|
| FR | FR-021 | @ söker fram och kopplar in mockade kollegor och andra botar |
| FR | FR-022 | / söker fram och infogar mockade ärenden, maskinparametrar och annan kontext |
| AC | AC-004 | Maskinansvarig kan kopplas in efter eskaleringen |
| AC | AC-009 | @ öppnar val; valt objekt infogas eller kopplas till konversationen |
| AC | AC-010 | / öppnar val; valt objekt infogas i textflödet |
| TEST | TEST-004, TEST-005 | Verifiera @/-sökning och att Maskinansvarig kan delta |

## 4. Användningsflöde

| Steg | Användare | System |
|------|-----------|--------|
| 1 | Skriver `@` (efter mellanslag eller i början) | Visar kollegor (utom aktuell användare) och botar |
| 2 | Skriver vidare, t.ex. `@an` | Filtrerar på namn, roll och ID |
| 3 | Väljer med ↑/↓ + Enter/Tab eller klick | Infogar `@Anna Bergström `, kopplar Anna till konversationen, visar "+ Anna Bergström" i rubriken och en bekräftelse |
| 4 | Skriver `/` | Visar ärenden (nyast först), aktivt larm, parametrar och maskiner |
| 5 | Väljer t.ex. `HPM-2400.TEMP_01` | Infogar `[HPM-2400.TEMP_01 = 127°C, normal 85°C] ` |
| 6 | Escape | Stänger listan utan att infoga |
| 7 | Skickar meddelandet | `@namn` visas fetstilt, `[…]` som referenschip |

## 5. Tillstånd
```
Stängd ──"@" eller "/" före markör──► Öppen(filtrerad)
Öppen ──Enter/Tab/klick──► Infoga (+ koppla in vid @) ──► Stängd
Öppen ──Escape / blur / token borta──► Stängd
```

## 6. Data
```javascript
conversation.invitedIds: string[]   // userId/botId kopplade via @ (persisteras som conversations.invited_ids)
suggestion = { kind: "person"|"bot"|"case"|"param"|"alarm"|"machine", id, label, detail, icon, insert }
```

## 7. UI-krav
- Listan har `role="listbox"`; fältet `role="combobox"`, `aria-expanded`, `aria-activedescendant`.
- Varje alternativ ≥ 44px högt, ikon + text (ej endast färg).
- Enter skickar inte meddelandet när listan är öppen.

## 8. Kantfall
- Ingen träff: "Ingen träff – …" visas, Enter skickar inte.
- Redan inkopplad deltagare: infogas i texten men kopplas inte dubbelt.
- Inget larm än: `/` visar ärenden, statiska parametrar och maskiner men inget larm.
- Återställning: `reset_scenario()` återskapar konversationer, `invited_ids` töms.

## 9. Tillgänglighet
Tangentbordsstyrd (↑/↓/Enter/Tab/Escape), synlig fokusmarkering på aktivt alternativ, skärmläsare får aktivt alternativ via `aria-activedescendant`.

## 10. Test

| TEST-ID | AC-ID | Verifiering |
|---------|-------|------------|
| TEST-004 | AC-009 | `@an` + Enter → `@Anna Bergström` infogas, rubriken visar "+ Anna Bergström" |
| TEST-004 | AC-010 | `/temp` + Enter → referens infogas i textflödet |
| TEST-005 | AC-004 | Anna (Maskinansvarig) syns bland deltagare i historiken efter eskalering |

## 11. Definition of Done
- [x] Implementerad (`src/composer.js`, `src/app.js`)
- [x] TEST-004/AC-009/AC-010 verifierade i headless Chrome (desktop 1920px, mobil 375px)
- [x] Tangentbord och ARIA
- [x] Persisterad koppling verifierad mot Supabase (`evals/results/2026-10-19-backend.md`)
