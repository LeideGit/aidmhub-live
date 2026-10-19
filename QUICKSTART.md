# QUICKSTART – AI DM HUB

**Status:** ✅ Körbar prototyp – Fas 1–2 implementerad

## Start i 3 steg

### 1. Navigera till projektmappen
```bash
cd /Users/johanleidefors/Claude/AI\ DM\ HUB
```

### 2. Kör webbservern
```bash
cd src && python3 -m http.server 8000
```

Du bör se:
```
Serving HTTP on 0.0.0.0 port 8000 (http://0.0.0.0:8000/) ...
```

### 3. Öppna webbläsaren
```
http://localhost:8000
```

---

## Demonstrationsflödet

### Efter start (automatic, no action needed):
1. ✅ Prototypen öppnas med en DM-lista (2 kollegor + 3 botar):
   - 👤 Anna Bergström (Maskinansvarig)
   - 👤 Lars Nyström (Underhållstekniker)
   - 🤖 HPM-2400 Sensor Bot
   - 🤖 Tork-enhet Monitor
   - 🤖 Värmesystem Advisor
2. ⏱️ **Vänta 10 sekunder** → Kritiskt larm för HPM-2400 uppstår automatiskt
3. ✅ Larmet visas högst upp i listan med **röd märkning, ⚠️-ikon, och "KRITISK ESCALERING"-text**

### Interaktiv demonstration (Klicka på HPM-2400 Sensor Bot-larmet):
1. **Klicka på larmet** → Konversationen öppnas
   - Se larmdetaljer: ursprungligt maskinlarm, eskaleringsorsak, tidslinje
   - Larmbannern visar "KRITISK ESCALERING" för HPM-2400

2. **Ställ en fråga** (t.ex. "Vad är den normala temperaturen?")
   - Skriv i textfältet
   - Bot svarar med **separerad data/tolkning/rekommendation**
   - Svar formateras som [DATA] / [TOLKNING] / [REKOMMENDATION]

3. **Fatta ett beslut** (Klicka "💡 Beslut"-knappen)
   - Modal öppnas
   - Skriv beslutsbeskrivning (t.ex. "Byt temperaturgivare omedelbar")
   - Klick "Spara beslut" → Sparas som strukturerad event med tidsstämpel

4. **Delegera en uppgift** (Klicka "📋 Delegering"-knappen)
   - Modal öppnas
   - Ange mottagare (försök: "Erik" eller "Anna")
   - Skriv uppgift (t.ex. "Kontrollera hydraulpumpen")
   - Klick "Delegera" → Sparas med mottagare, status, tid

5. **Registrera en åtgärd** (Klicka "✓ Åtgärd"-knappen)
   - Modal öppnas
   - Skriv åtgärdsbeskrivning (t.ex. "Temperaturgivare bytt, verifierad på 89°C")
   - Välj status: "Påbörjad" eller "Slutförd"
   - Klick "Spara åtgärd" → Sparas med utförare, status, tid

6. **Granska historiken** (Scrollar ner i konversationen)
   - Se all händelsekedja: Ursprungligt larm → Eskalering → Frågor → Svar → Beslut → Delegering → Åtgärd
   - Varje event visar: **aktör, typ, tidsstämpel**

7. **Återställ och kör igen** (Klicka "↻ Reset Demo"-knappen i headern)
   - Scenario återställs
   - DM-listan rensas
   - 10-sekunderslarmet startar om

---

## Vad som fungerar (Fas 1–2)

✅ **DM-lista**
- Visa kollegor (👤) och botar (🤖) tillsammans
- Sortering: Kritiska larm högst upp, sedan efter aktivitet
- Typ-märkning: Text + ikon för att skilja människor från botar
- Status: Senaste aktivitet, prioritet, oläst-indikator

✅ **Kritiskt larm (10-sekunderslarmet)**
- Automatisk utlösning efter 10 sekunder
- Eskalering från Maskinansvarig till Maskingruppsansvarig (utebliven kvittering)
- Röd märkning, ⚠️-ikon, "KRITISK ESCALERING"-text
- Inte enbart färg-beroende

✅ **Konversation**
- Visa larmdetaljer (maskin, larmtyp, sensor, värde, tröskelvärde)
- Botdialog: Användaren kan ställa frågor
- Mockade botsvar som skiljer data, tolkning, rekommendation

✅ **Actions**
- Beslut-action: Spara med text + beslutsfattare + tidsstämpel
- Delegering-action: Spara med uppgift + mottagare + delegerande + status + tid
- Åtgärd-action: Spara med text + utförare + status + tidsstämpel
- Alla sparas som strukturerade events med full spårbarhet

✅ **Responsivitet**
- Desktop (1920px): Full layout, DM-lista vänster, konversation höger
- Tablet (768px): DM-lista stackad ovanför konversation
- Mobil (375px): Stackad layout, all text läsbar

✅ **Tillgänglighet**
- ARIA-labels på modals, knappar, input-fält
- Semantisk HTML (role="list", role="alert", role="dialog", etc.)
- Tangentbordsfokus synligt på alla interaktiva element
- Modals har focus-trap (Tab stannar i modal)
- Escape stänger modals (inte implementerat än, men UI är redo)

✅ **Spårbarhet**
- Alla händelser har tidsstämpel
- Aktör är tydlig för varje action
- Historiken är kronologisk
- Events är typmarkerade (Beslut, Delegering, Åtgärd, Larm, etc.)

✅ **Reset-funktionalitet**
- Reset-knapp i header
- Scenario återställs, 10-sekunderslarmet startar om
- Kan köras upprepade gånger

---

## Vad som återstår (Fas 3–5)

⏳ **Nästa steg:**
- [ ] **@ -sökning** – Koppla in kollegor/botar via @
- [ ] **/ -sökning** – Referera till ärenden och parametrar via /
- [ ] **Historik-panel** – Förbättrad layout för historik-visning
- [ ] **Accessibility-testing** – Skärmläsare, tangentbord, fokus
- [ ] **Security-kontroll** – Verifiera ingen maskinstyrning, all data fiktiv

---

## Troubleshooting

### "Kan inte ansluta till localhost:8000"
- Verifiera att servern körs: `python3 -m http.server 8000`
- Försök öppna en ny webbläsartab
- Prova en annan port: `python3 -m http.server 9000` och öppna `http://localhost:9000`

### "Larmet dyker inte upp efter 10 sekunder"
- Öppna webbläsarens Developer Console (F12 → Console)
- Verifiera att ingen JavaScript-fel visas
- Försök uppdatera sidan (Ctrl+R eller Cmd+R)
- Försök en annan webbläsare

### "Knapparna fungerar inte"
- Öppna Developer Console (F12 → Console) och leta efter JavaScript-fel
- Verifiera att `app.js` och `mockData.js` laddas (F12 → Network → Script)
- Försök uppdatera sidan

---

## Säkerhetsprinciper – Alltid giltiga

🔒 **DENNA PROTOTYP ÄR ALDRIG MASKINSTYRNING**

- ✅ **Ingen verklig maskinstyrning** – Alla actions är läsbara och icke-bindande
- ✅ **All data är mockad** – Maskiner, botar, kollegor, larm är helt fiktiva
- ✅ **Mänskliga aktörer tydliga** – Varje beslut och åtgärd visar vem som gjorde det
- ✅ **Befintliga säkerhetssystem** – Denna hubb ersätter aldrig verkliga säkerhets-, larm- eller nödstoppssystem

---

## Demokällor & spårbarhet

- **PRD:** `PRD_Meddelandehub_for_maskinpark.docx.pdf` (auktoritativ, oförändrad)
- **Specifikationer:** `specs/FEAT-*.md` (FEAT-DM-list, FEAT-critical-alert, FEAT-actions, etc.)
- **Implementation-plan:** `project/implementation-plan.md` (5-fas plan)
- **Rapporter:** `reports/readiness.md`, `reports/traceability.md`

---

## Feedback & debugging

Om något inte fungerar som förväntat:

1. **Öppna Developer Console** (F12 eller Cmd+Option+I)
2. **Kontrollera Console-fliken** för JavaScript-fel
3. **Kontrollera Network-fliken** att alla filer laddas (HTML, CSS, JS, mockData.js)
4. **Försök uppdatera sidan** (Ctrl+R eller Cmd+R)
5. **Starta om servern** (Ctrl+C, sedan `python3 -m http.server 8000`)

---

**Lycka till med demonstrationen! 🚀**

Fler detaljer finns i:
- CLAUDE.md – Projektöversikt
- README.md – Fullständig användningsguide
- project/progress.md – Aktuell status
- CHANGELOG.md – Versionshistorik
