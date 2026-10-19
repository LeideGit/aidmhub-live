# Bedömningsmallar – Funktionalitet

**Syfte:** Definiera klara och reproducerbara bedömningskriterier för funktionella evalfall.

## TEST-001: End-to-end demo från start till historik

### Kriterier

| Kriterium | Vikt | Pass-villkor | Fail-villkor |
|-----------|------|-------------|-------------|
| **Larmet uppstår efter 10 sek** | High | `setTimeout` triggar larmskapning exakt när 10 sek gått | Larmet kommer inte, eller kommer fel tidpunkt |
| **Larmet är märkt (röd + ikon + text)** | High | Röd bakgrund, ⚠️-ikon, "KRITISK ESCALERING"-text synliga | Enbart färgmarkering eller saknas helt |
| **Larmet flyttas högst upp i listan** | High | HPM-2400-konversationen är på listposition 1 | Larmet är inte högst upp |
| **Larmdetaljer visas korrekt** | Medium | Ursprungligt larm, maskin, prioritet, eskaleringsorsak, tid visas | Någon detalj saknas eller är felaktig |
| **Botdialog öppnas utan fel** | Medium | Konversation kan öppnas och visas | Konversationen öppnas inte eller crashar |
| **Botsvar skiljer data, tolkning, rekommendation** | Medium | Tre olika avsnitt synliga, tydligt märkta | Avsnitt blandat eller saknas |
| **Beslut-knappen fungerar** | Medium | Modal öppnas, text kan skrivas, sparas med metadata | Knappen fungerar inte eller action sparas inte |
| **Delegering-knappen fungerar** | Medium | Mottagare kan väljas, uppgift sparas, status visas | Knappen fungerar inte eller data saknas |
| **Åtgärd-knappen fungerar** | Medium | Åtgärd kan registreras med status (Påbörjad/Slutförd) | Knappen fungerar inte eller status saknas |
| **Historiken visar alla händelser kronologiskt** | High | Alla 8+ händelser visas i rätt ordning (larm → eskalering → fråga → svar → beslut → delegering → åtgärd) | Historiken är tom, inkomplett eller felaktig ordning |
| **Spårbarhet: aktör, tidsstämpel, typ synlig för varje händelse** | High | Varje rad i historiken visar vem, vad, när | Information saknas för någon händelse |

### Bedömning

**Pass:** Minst 10 av 11 kriterier uppfyllda, och alla "High"-kriterier passerade.  
**Conditional Pass:** 8–9 kriterier uppfyllda, men minst ett "High"-kriterium misslyckades. Kräver en-dagars fix.  
**Fail:** Färre än 8 kriterier, eller flera "High"-kriterier misslyckades.

---

## TEST-002: Sortering och märkning av larmet i DM-listan

### Kriterier

| Kriterium | Vikt | Pass-villkor | Fail-villkor |
|-----------|------|-------------|-------------|
| **Larmet är högst upp i DM-listan** | High | HPM-2400-konversationen syns på position 1 | Larmet är inte högst upp |
| **Röd bakgrund synlig** | High | Larm-raden har röd (eller mörkröd) bakgrund | Ingen röd markering |
| **⚠️-ikon synlig** | High | ⚠️ eller motsvarande varningsikon före botnamnet | Ikon saknas |
| **"KRITISK ESCALERING"-text synlig** | High | Text "KRITISK ESCALERING" eller motsvarande framgår | Text saknas |
| **Inte enbart färgberoende** | High | Text + ikon tillsammans, aldrig enbart färg (testa med color-blind-filter) | Endast färg – aldrig enbart röd bakgrund |
| **Övriga items är fortfarande synliga under larmet** | Low | Andra konversationer syns under larmet i listan | Andra items döljs |

### Bedömning

**Pass:** Alla 6 kriterier uppfyllda, speciellt alla 5 "High"-kriterier.  
**Fail:** Någon av "High"-kriterierna misslyckades.

---

## TEST-003: Beslut, delegering, åtgärd

### Kriterier

| Kriterium | Vikt | Pass-villkor | Fail-villkor |
|-----------|------|-------------|-------------|
| **Beslut-knapp och modal fungerar** | High | Modal kan öppnas, text inmatad, sparas | Knappen är bruten |
| **Beslut sparas med text + beslutsfattare + tidsstämpel** | High | Alla tre fält synliga i sparad event | Något fält saknas |
| **Delegering-knapp och modal fungerar** | High | Mottagare kan väljas, uppgift skrivas, sparas | Knappen är bruten |
| **Delegering sparas med uppgift + mottagare + delegerande + status + tid** | High | Alla fem fält synliga | Något fält saknas |
| **Åtgärd-knapp och modal fungerar** | High | Åtgärd kan skrivas, status väljas, sparas | Knappen är bruten |
| **Åtgärd sparas med text + utförare + status + tidsstämpel** | High | Alla fyra fält synliga | Något fält saknas |
| **Tidsstämplar är korrekta (chronologisk ordning)** | Medium | Varje action har senare tidsstämpel än föregående | Tider är felaktiga eller samma |
| **Actions visas som läsbara meddelanden, inte bindande** | Medium | Textformat gör det klart att detta är en logg, inte en order | Format antyder att detta är en faktisk åtgärd utförd |

### Bedömning

**Pass:** Alla 8 kriterier uppfyllda, speciellt alla 6 "High"-kriterier.  
**Fail:** Någon "High"-kriterium misslyckades.

---

## TEST-004: @ och / sökning

### Kriterier

| Kriterium | Vikt | Pass-villkor | Fail-villkor |
|-----------|------|-------------|-------------|
| **@-sökning öppnar resultat-popup** | High | Skriva `@` i chatfält → popup visas | Inget händer när `@` skrivs |
| **@-sökresultat är korrekta** | High | Sökning efter "erik" visar "Erik Svensson", sökning efter "hpm" visar "HPM-2400 Sensor Bot" | Sökresultaten är felaktiga eller tomma |
| **Valt @ -resultat infogas eller kopplas till konversation** | High | Klick på resultat → person/bot läggs till | Infogning fungerar inte |
| **/-sök ning öppnar resultat-popup** | High | Skriva `/` i chatfält → popup visas | Inget händer när `/` skrivs |
| **/-sökresultat är korrekta** | High | Sökning visar ärenden, parametrar eller annan kontext | Sökresultaten är felaktiga eller tomma |
| **Valt /-resultat infogas i textflödet** | High | Klick på resultat → text infogas | Infogning fungerar inte |
| **Fokus förblir i chatfältet efter infogning** | Low | Användaren kan fortsätta skriva efter infogning | Fokus går vilse |

### Bedömning

**Pass:** Alla 7 kriterier uppfyllda, speciellt alla 6 "High"-kriterier.  
**Fail:** Någon "High"-kriterium misslyckades.

---

## TEST-005: Maskinansvarig kan delta efter eskalering

### Kriterier

| Kriterium | Vikt | Pass-villkor | Fail-villkor |
|-----------|------|-------------|-------------|
| **Maskinansvarig är synlig i konversationen innan eskalering** | Medium | Anna Bergström (Maskinansvarig) syns i deltagarlistan | Anna är helt dold |
| **Maskinansvarig förblir synlig efter eskalering** | High | Anna Bergström finns fortfarande synlig efter larmet | Anna försvinner från konversationen |
| **Maskinansvarig kan kopplas in via @** | High | @-sökning för "anna" returnerar Anna Bergström | Anna kan inte sökas fram |
| **Maskinansvarig kan anta delegerad åtgärd** | Low | Åtgärd kan delegeras tillbaka till Anna | Delegation till Anna fungerar inte |

### Bedömning

**Pass:** Alla 4 kriterier uppfyllda, speciellt alla 3 "High"-kriterier.  
**Fail:** Någon "High"-kriterium misslyckades.

---

## Rapportering

För varje evalfall, dokumentera:
1. **Resultat:** Pass / Conditional Pass / Fail
2. **Uppfyllda kriterier:** Lista vilka som passerades
3. **Misslyckade kriterier:** Beskriv vad som gick fel
4. **Anteckningar:** Kontextinformation, tidsåtgång, observationer
5. **Rekommendation:** Nästa steg (proceed, fix och retry, eller escalate)

Se `../results/` för malla för resultat-dokumentation.
