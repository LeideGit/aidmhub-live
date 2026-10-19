// @-mentions (FR-021, AC-009) and /-references (FR-022, AC-010) for the message input.

class Composer {
    constructor(app, input) {
        this.app = app;
        this.input = input;
        this.trigger = null;
        this.items = [];
        this.active = 0;

        this.list = document.createElement("ul");
        this.list.id = "composerSuggestions";
        this.list.className = "composer-suggestions";
        this.list.setAttribute("role", "listbox");
        this.list.hidden = true;
        input.parentElement.style.position = "relative";
        input.parentElement.appendChild(this.list);

        input.setAttribute("role", "combobox");
        input.setAttribute("aria-autocomplete", "list");
        input.setAttribute("aria-controls", this.list.id);
        input.setAttribute("aria-expanded", "false");

        input.addEventListener("input", () => this.update());
        input.addEventListener("click", () => this.update());
        input.addEventListener("keydown", (e) => this.onKeyDown(e));
        input.addEventListener("blur", () => setTimeout(() => this.close(), 150));
    }

    get isOpen() { return !this.list.hidden; }

    // Finds "@query" or "/query" directly before the caret.
    currentToken() {
        const pos = this.input.selectionStart ?? this.input.value.length;
        const before = this.input.value.slice(0, pos);
        const m = before.match(/(^|\s)([@/])([^\s@/]*)$/);
        if (!m) return null;
        return { trigger: m[2], query: m[3].toLowerCase(), start: pos - m[3].length - 1, end: pos };
    }

    mentionCandidates() {
        const people = mockData.users
            .filter(u => u.userId !== this.app.currentUserId)
            .map(u => ({ kind: "person", id: u.userId, label: u.name, detail: u.role, icon: "👤", insert: `@${u.name}` }));
        const bots = mockData.bots
            .map(b => ({ kind: "bot", id: b.botId, label: b.name, detail: `Bot · ${b.machineId}`, icon: "🤖", insert: `@${b.name}` }));
        return [...people, ...bots];
    }

    referenceCandidates() {
        const cases = [...mockData.cases]
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .map(c => ({ kind: "case", id: c.caseId, label: c.caseId, detail: `Ärende · ${c.title} (${c.status})`, icon: "📋", insert: `[${c.caseId}: ${c.title}]` }));
        const params = [];
        const alarm = mockData.alarms.find(a => a.createdAt);
        if (alarm) {
            params.push({ kind: "param", id: alarm.sensor, label: `${alarm.machineId}.${alarm.sensor}`, detail: `Parameter · ${alarm.sensorValue}${alarm.sensorUnit} (normal ${alarm.normalValue}${alarm.sensorUnit})`, icon: "📈",
                insert: `[${alarm.machineId}.${alarm.sensor} = ${alarm.sensorValue}${alarm.sensorUnit}, normal ${alarm.normalValue}${alarm.sensorUnit}]` });
            params.push({ kind: "alarm", id: alarm.alarmId, label: alarm.alarmId, detail: `Larm · ${alarm.originalMessage}`, icon: "🚨",
                insert: `[Larm ${alarm.alarmId}: ${alarm.originalMessage}, nivå ${alarm.level}, status ${alarm.status}]` });
        }
        // Simulated reference parameters (SEC-004: fictional values).
        params.push(
            { kind: "param", id: "HPM-2400.PRESS_01", label: "HPM-2400.PRESS_01", detail: "Parameter · Tryck 50 bar (normal 50±2)", icon: "📈", insert: "[HPM-2400.PRESS_01 = 50 bar, normal 50±2 bar]" },
            { kind: "param", id: "TRK-500.TEMP_02", label: "TRK-500.TEMP_02", detail: "Parameter · 85°C (normal 80–85°C)", icon: "📈", insert: "[TRK-500.TEMP_02 = 85°C, normal 80–85°C]" },
            { kind: "param", id: "VX-1200.EFF_01", label: "VX-1200.EFF_01", detail: "Parameter · Effektivitet 94.2% (normal 92–96%)", icon: "📈", insert: "[VX-1200.EFF_01 = 94.2%, normal 92–96%]" }
        );
        const machines = mockData.machines.map(m => ({ kind: "machine", id: m.machineId, label: m.machineId, detail: `Maskin · ${m.name} (${m.group})`, icon: "🏭", insert: `[Maskin ${m.machineId}: ${m.name}]` }));
        return [...cases, ...params, ...machines];
    }

    update() {
        const tok = this.currentToken();
        if (!tok) return this.close();
        const pool = tok.trigger === "@" ? this.mentionCandidates() : this.referenceCandidates();
        this.items = pool.filter(i => `${i.label} ${i.detail} ${i.id}`.toLowerCase().includes(tok.query)).slice(0, 8);
        this.token = tok;
        this.active = 0;
        this.render();
    }

    render() {
        const e = (s) => this.app.escape(s);
        this.list.innerHTML = "";
        const heading = this.token.trigger === "@" ? "Koppla in kollega eller bot" : "Infoga ärende, parameter eller kontext";
        if (this.items.length === 0) {
            this.list.innerHTML = `<li class="composer-empty" role="option" aria-disabled="true">Ingen träff – ${e(heading.toLowerCase())}</li>`;
        } else {
            this.items.forEach((item, i) => {
                const li = document.createElement("li");
                li.id = `composer-opt-${i}`;
                li.className = "composer-option" + (i === this.active ? " active" : "");
                li.setAttribute("role", "option");
                li.setAttribute("aria-selected", i === this.active ? "true" : "false");
                li.innerHTML = `<span aria-hidden="true">${item.icon}</span><span><strong>${e(item.label)}</strong><small>${e(item.detail)}</small></span>`;
                li.addEventListener("mousedown", (ev) => { ev.preventDefault(); this.choose(i); });
                this.list.appendChild(li);
            });
        }
        this.list.setAttribute("aria-label", heading);
        this.list.hidden = false;
        this.input.setAttribute("aria-expanded", "true");
        this.input.setAttribute("aria-activedescendant", this.items.length ? `composer-opt-${this.active}` : "");
    }

    close() {
        this.list.hidden = true;
        this.input.setAttribute("aria-expanded", "false");
        this.input.removeAttribute("aria-activedescendant");
    }

    onKeyDown(e) {
        if (!this.isOpen) return;
        if (e.key === "ArrowDown" || e.key === "ArrowUp") {
            e.preventDefault();
            if (!this.items.length) return;
            this.active = (this.active + (e.key === "ArrowDown" ? 1 : -1) + this.items.length) % this.items.length;
            this.render();
        } else if ((e.key === "Enter" || e.key === "Tab") && this.items.length) {
            e.preventDefault();
            e.stopImmediatePropagation();
            this.choose(this.active);
        } else if (e.key === "Escape") {
            e.preventDefault();
            this.close();
        }
    }

    async choose(i) {
        const item = this.items[i];
        if (!item) return;
        const v = this.input.value;
        const text = item.insert + " ";
        this.input.value = v.slice(0, this.token.start) + text + v.slice(this.token.end);
        const caret = this.token.start + text.length;
        this.input.setSelectionRange(caret, caret);
        this.close();
        this.input.focus();
        if (item.kind === "person" || item.kind === "bot") {
            await this.app.inviteParticipant(item.id);
        }
    }
}

window.Composer = Composer;
