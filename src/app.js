// AI DM HUB – Main Application Logic

class AIHubApp {
    constructor() {
        this.currentConversationId = null;
        this.currentCaseId = null;
        this.currentTab = "messages"; // "messages" or "cases"
        // Current user is Erik (Maskingruppsansvarig) - the one reviewing alarms
        this.currentUserId = "usr_002"; // Erik Svensson
        this.alarmTriggeredAt = null;
        this.alarmTimeout = null;
        this.acknowledgementCountdown = null;
        this.countdownInterval = null;
        this.pendingTimeouts = [];
        this.sounds = this.initializeSounds();
        this.init();
    }

    later(fn, ms) {
        const id = setTimeout(() => {
            this.pendingTimeouts = this.pendingTimeouts.filter(t => t !== id);
            Promise.resolve(fn()).catch(err => this.showError(err));
        }, ms);
        this.pendingTimeouts.push(id);
    }

    showError(err) {
        console.error(err);
        this.toast(`⚠ Kunde inte spara: ${err?.message || err}`, "#b45309");
    }

    toast(text, color) {
        const el = document.createElement("div");
        el.setAttribute("role", "status");
        el.style.cssText = `position: fixed; bottom: 20px; right: 20px; background: ${color}; color: white; padding: 1rem; border-radius: 4px; z-index: 9999;`;
        el.textContent = text;
        document.body.appendChild(el);
        setTimeout(() => el.remove(), 2500);
    }

    escape(s) {
        return String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
    }

    initializeSounds() {
        // Create single audio context for all sound effects
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        return true;
    }

    playSound(soundType) {
        // Play sound effect using Web Audio API
        try {
            if (!this.audioContext) return;

            const ctx = this.audioContext;
            const now = ctx.currentTime;

            // Define sound parameters
            const sounds = {
                notification: { freq: 800, dur: 0.1, vol: 0.1 },
                alarm: { freq: 1200, dur: 0.3, vol: 0.15 },
                acknowledged: { freq: 600, dur: 0.1, vol: 0.1 },
                sent: { freq: 700, dur: 0.05, vol: 0.08 }
            };

            if (!sounds[soundType]) return;

            const sound = sounds[soundType];
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.connect(gain);
            gain.connect(ctx.destination);

            gain.gain.setValueAtTime(sound.vol, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + sound.dur);

            osc.frequency.value = sound.freq;
            osc.type = 'sine';
            osc.start(now);
            osc.stop(now + sound.dur);
        } catch (e) {
            console.log('Audio play error:', e.message);
        }
    }

    async init() {
        this.cacheDOM();
        this.bindEvents();
        try {
            await api.init();
        } catch (err) {
            console.error("Backend unavailable, running offline", err);
            api.db = null;
        }
        this.updateModeBadge();
        this.renderDMList();
        this.resumeOrStartAlarm();
    }

    updateModeBadge() {
        const badge = document.getElementById("modeBadge");
        if (!badge) return;
        badge.textContent = api.online ? "● Ansluten – sparas" : "○ Offline-demo – sparas ej";
        badge.title = api.online
            ? "Data sparas i demo-databasen för denna webbläsare. All data är fiktiv."
            : "Ingen backend konfigurerad. Data finns endast i minnet.";
    }

    resumeOrStartAlarm() {
        const alarm = mockData.alarms.find(a => a.alarmId === "alarm_critical_001" && a.createdAt);
        if (!alarm) {
            this.startAlarmTimer();
            return;
        }
        const conv = mockDataHelpers.getConversationById("conv_hpm_001");
        this.currentCaseId = conv?.caseId || null;
        if (alarm.status !== "acknowledged") {
            const remaining = Math.ceil((alarm.ackDeadline - Date.now()) / 1000);
            if (remaining > 0) this.startAcknowledgementCountdown(remaining);
        }
    }

    cacheDOM() {
        // Tabs
        this.tabMessages = document.getElementById("tabMessages");
        this.tabCases = document.getElementById("tabCases");
        this.messagesPanel = document.getElementById("messagesPanel");
        this.casesPanel = document.getElementById("casesPanel");

        // Messages
        this.dmList = document.getElementById("dmList");
        this.casesList = document.getElementById("casesList");
        this.messageInput = document.getElementById("messageInput");
        this.sendBtn = document.getElementById("sendBtn");
        this.resetBtn = document.getElementById("resetBtn");
        this.settingsBtn = document.getElementById("settingsBtn");
        this.conversationPanel = document.querySelector(".conversation-panel");
        this.noSelection = document.getElementById("noSelection");
        this.conversationView = document.getElementById("conversationView");
        this.messagesContainer = document.getElementById("messagesContainer");
        this.conversationTitle = document.getElementById("conversationTitle");
        this.alarmBanner = document.getElementById("alarmBanner");
        this.alarmTitle = document.getElementById("alarmTitle");
        this.alarmMachine = document.getElementById("alarmMachine");
        this.alarmReason = document.getElementById("alarmReason");
        this.ackBtn = document.getElementById("ackBtn");
        this.decisionBtn = document.getElementById("decisionBtn");
        this.delegationBtn = document.getElementById("delegationBtn");
        this.actionBtn = document.getElementById("actionBtn");
    }

    bindEvents() {
        // Tab navigation
        document.getElementById("tabMessages").addEventListener("click", () => this.switchTab("messages"));
        document.getElementById("tabCases").addEventListener("click", () => this.switchTab("cases"));

        this.composer = new Composer(this, this.messageInput);
        this.sendBtn.addEventListener("click", () => this.handleSendMessage());
        this.messageInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter" && !e.shiftKey && !this.composer.isOpen) {
                e.preventDefault();
                this.handleSendMessage();
            }
        });
        this.resetBtn.addEventListener("click", () => this.handleReset());
        this.settingsBtn?.addEventListener("click", () => this.showSettings());
        this.ackBtn.addEventListener("click", () => this.handleAcknowledge());
        this.decisionBtn.addEventListener("click", () => this.openModal("decisionModal"));
        this.delegationBtn.addEventListener("click", () => this.openModal("delegationModal"));
        this.actionBtn.addEventListener("click", () => this.openModal("actionModal"));

        // Delegation recipient search
        document.getElementById("delegationRecipient").addEventListener("input", (e) => {
            this.handleDelegationSearch(e.target.value);
        });

        // Modal event listeners
        document.querySelectorAll(".modal-close").forEach(btn => {
            btn.addEventListener("click", (e) => {
                const modalId = e.target.dataset.modal;
                this.closeModal(modalId);
            });
        });

        document.querySelectorAll(".btn-cancel").forEach(btn => {
            btn.addEventListener("click", (e) => {
                const modal = e.target.closest(".modal");
                this.closeModal(modal.id);
            });
        });

        document.getElementById("savDecisionBtn").addEventListener("click", () => this.handleSaveDecision());
        document.getElementById("savDelegationBtn").addEventListener("click", () => this.handleSaveDelegation());
        document.getElementById("savActionBtn").addEventListener("click", () => this.handleSaveAction());
    }

    startAlarmTimer() {
        // Trigger critical alarm after 10 seconds
        this.alarmTimeout = setTimeout(() => {
            this.triggerCriticalAlarm();
        }, 10000);
    }

    async triggerCriticalAlarm() {
        let result;
        try {
            result = await api.triggerAlarm();
        } catch (err) {
            this.showError(err);
            return;
        }
        this.alarmTriggeredAt = new Date();
        this.currentCaseId = result.caseId;
        this.currentConversationId = "conv_hpm_001";

        this.playSound('alarm');

        const alarm = mockData.alarms.find(a => a.alarmId === "alarm_critical_001");
        const remaining = alarm ? Math.ceil((alarm.ackDeadline - Date.now()) / 1000) : 30;
        if (remaining > 0) this.startAcknowledgementCountdown(remaining);

        // Sort DM list and highlight the alarm
        this.renderDMList();

        // Only auto-show conversation if NOT in cases tab
        if (this.currentTab !== "cases") {
            // Show the conversation (don't mark as read, it's auto-opened)
            this.showConversation(this.currentConversationId, false);

            // Display alarm banner
            this.updateAlarmBanner();
        }
    }

    startAcknowledgementCountdown(seconds = 30) {
        this.acknowledgementCountdown = seconds;

        // Clear any existing interval
        if (this.countdownInterval) clearInterval(this.countdownInterval);

        // Update countdown display immediately
        this.updateCountdownDisplay();

        // Update every second
        this.countdownInterval = setInterval(() => {
            this.acknowledgementCountdown--;
            this.updateCountdownDisplay();

            if (this.acknowledgementCountdown <= 0) {
                clearInterval(this.countdownInterval);
                this.acknowledgementCountdown = null;
            }
        }, 1000);
    }

    updateCountdownDisplay() {
        if (this.acknowledgementCountdown === null) return;

        // Find or create countdown element in alarm banner
        let countdownEl = document.querySelector(".alarm-countdown");

        if (!countdownEl && this.alarmBanner) {
            countdownEl = document.createElement("div");
            countdownEl.className = "alarm-countdown";
            this.alarmBanner.appendChild(countdownEl);
        }

        if (countdownEl) {
            const seconds = this.acknowledgementCountdown;
            const color = seconds <= 10 ? '#ffc600' : '#ffffff';

            countdownEl.innerHTML = `
                <div style="font-size: 1.2rem; font-weight: bold; color: ${color}; padding: 0.5rem 1rem; background: rgba(0,0,0,0.1); border-radius: 4px;">
                    ⏱️ ${seconds}s innan nästa eskalering
                </div>
            `;
        }
    }

    updateAlarmBanner() {
        if (!this.currentConversationId) return;

        const conv = mockDataHelpers.getConversationById(this.currentConversationId);
        if (conv && conv.priority === "critical") {
            this.alarmTitle.textContent = "KRITISK ESCALERING – HPM-2400";
            this.alarmMachine.textContent = "Sensor: TEMP_01 | Värde: 127°C (Normal: 85°C)";
            this.alarmReason.textContent = "Eskaleringsorsak: Maskinansvarig kvitterade inte larmet i tid → Eskalerat till Maskingruppsansvarig";
            this.alarmBanner.style.display = "flex";
            this.alarmBanner.setAttribute("role", "alert");
        } else {
            this.alarmBanner.style.display = "none";
        }
    }

    async handleAcknowledge() {
        const conv = mockDataHelpers.getConversationById(this.currentConversationId);
        if (conv) {
            try {
                await api.acknowledge(this.currentUserId);
            } catch (err) {
                this.showError(err);
                return;
            }
            if (this.countdownInterval) {
                clearInterval(this.countdownInterval);
                this.countdownInterval = null;
            }
            this.acknowledgementCountdown = null;

            this.playSound('acknowledged');

            // Update UI
            this.updateAlarmBanner(); // Hide alarm banner and countdown
            this.renderMessages();
            this.renderDMList(); // Update DM list to remove red styling
        }
    }

    renderDMList() {
        this.dmList.innerHTML = "";

        // Sort conversations: critical alarms first, then by last activity
        const sorted = [...mockData.conversations].sort((a, b) => {
            if (a.priority === "critical" && b.priority !== "critical") return -1;
            if (a.priority !== "critical" && b.priority === "critical") return 1;
            return b.lastActivity - a.lastActivity;
        });

        sorted.forEach(conv => {
            const li = document.createElement("li");
            li.className = "dm-item";
            if (conv.priority === "critical") li.classList.add("alarm");
            if (this.currentConversationId === conv.conversationId) li.classList.add("active");

            const participants = mockDataHelpers.getConversationParticipants(conv.conversationId);
            const bot = participants.find(p => p.type === "bot");
            const user = participants.find(p => p.type === "human");

            // Determine icon and name
            let icon = "👤";
            let name = conv.title || "Unknown";

            if (bot) {
                icon = "🤖";
                name = conv.title || bot.name;
            } else if (user) {
                icon = "👤";
                name = conv.title || user.name;
            }

            li.innerHTML = `
                <div class="dm-item-icon-wrapper">
                    <div class="dm-item-icon">${icon}</div>
                    ${conv.unreadCount > 0 ? `<div class="dm-item-badge">${conv.unreadCount}</div>` : ""}
                </div>
                <div class="dm-item-content">
                    <div class="dm-item-name">${this.escape(name)}</div>
                    <div class="dm-item-preview">${this.escape(conv.lastMessage)}</div>
                    <div class="dm-item-meta">
                        ${this.formatTime(conv.lastActivity)}
                        ${conv.priority === "critical" ? '<span class="dm-item-meta"> • KRITISK</span>' : ''}
                    </div>
                </div>
            `;

            li.addEventListener("click", () => this.showConversation(conv.conversationId));
            this.dmList.appendChild(li);
        });
    }

    showConversation(conversationId, userInitiated = true) {
        this.currentConversationId = conversationId;
        const conv = mockDataHelpers.getConversationById(conversationId);

        if (!conv) return;

        // If conversation has a case, link to it
        if (conv.caseId) {
            this.currentCaseId = conv.caseId;
        } else {
            this.currentCaseId = null; // Clear case selection if no case
        }

        // Update UI
        this.noSelection.style.display = "none";
        this.conversationView.style.display = "flex";

        // Show chat elements again
        document.querySelector(".action-buttons").style.display = "flex";
        document.querySelector(".input-area").style.display = "flex";

        const participants = mockDataHelpers.getConversationParticipants(conversationId);
        const icons = participants.map(p => p.type === "bot" ? "🤖" : "👤").join(" ");
        const names = conv.title || participants.map(p => p.name).join(", ");

        this.conversationTitle.innerHTML = `
            <span>${icons}</span>
            <span>${this.escape(names)}</span>
            ${this.renderInvited(conv)}
        `;

        // Only mark as read if user manually opened it (not when alarm auto-opens)
        if (userInitiated && conv.unreadCount) {
            api.setUnread(conversationId, 0).catch(err => this.showError(err));
        }

        this.updateAlarmBanner();
        this.renderMessages();
        this.renderDMList(); // Render after marking as read

        // Clear input
        this.messageInput.value = "";
    }

    renderMessages() {
        this.messagesContainer.innerHTML = "";

        const messages = mockData.messages.filter(m => m.conversationId === this.currentConversationId);

        messages.forEach(msg => {
            const div = document.createElement("div");
            div.className = "message";

            const sender = mockDataHelpers.getUserById(msg.senderId) || mockDataHelpers.getBotById(msg.senderId);
            const isCurrentUser = msg.senderId === this.currentUserId;
            const isBot = sender?.type === "bot";

            // Right side: only if it's the current user. Left side: everyone else
            if (isCurrentUser) {
                div.classList.add("user");
            } else {
                div.classList.add("bot"); // Left side styling for all other senders
            }

            let content = `
                <div class="message-avatar">${isBot ? "🤖" : "👤"}</div>
                <div class="message-content">
            `;

            const e = (s) => this.escape(s);
            const md = msg.metadata || {};
            if (msg.type === "alarm") {
                content += `<strong>🚨 KRITISK ESKALERING – HPM-2400</strong><br><pre style="white-space: pre-wrap; font-family: monospace; font-size: 12px; background: #fff3cd; padding: 8px; border-radius: 4px; margin: 8px 0;">${e(msg.text)}</pre>`;
                if (md.escalatedBecause) {
                    content += `<small style="color: #d42426;"><strong>Eskalerad:</strong> ${e(md.escalatedFromRole)} → ${e(md.escalatedToRole)} (${e(md.escalatedBecause)})</small>`;
                }
            } else if (msg.type === "decision") {
                const caseRef = md.caseId ? ` • Ärende: ${e(md.caseId)}` : "";
                content += `<div class="event"><div class="event-type">💡 BESLUT</div><div class="event-content">${e(msg.text)}</div><div class="event-meta">Beslutsfattare: ${e(md.decisionMaker)}${caseRef} • ${this.formatTime(msg.timestamp)}</div></div>`;
            } else if (msg.type === "delegation") {
                const caseRef = md.caseId ? ` • Ärende: ${e(md.caseId)}` : "";
                content += `<div class="event"><div class="event-type">📋 DELEGERING</div><div class="event-content">${e(msg.text)}</div><div class="event-meta">Till: ${e(md.assignee)}${caseRef} • Status: ${e(md.status)} • ${this.formatTime(msg.timestamp)}</div></div>`;
            } else if (msg.type === "action") {
                const caseRef = md.caseId ? ` • Ärende: ${e(md.caseId)}` : "";
                content += `<div class="event"><div class="event-type">✓ ÅTGÄRD</div><div class="event-content">${e(msg.text)}</div><div class="event-meta">Utförare: ${e(md.performer)}${caseRef} • Status: ${e(md.status)} • ${this.formatTime(msg.timestamp)}</div></div>`;
            } else if (msg.type === "bot_response") {
                const source = md.source === "llm" ? "AI-genererat" : "Offline-svar (mall)";
                content += `<strong>Rekommendation (beslutsstöd)</strong> <small>– ${source}</small><br><small><strong>[DATA]</strong> ${e(md.data)}<br><strong>[TOLKNING]</strong> ${e(md.interpretation)}<br><strong>[REKOMMENDATION]</strong> ${e(md.recommendation)}</small>`;
            } else if (msg.type === "acknowledgment") {
                content += `<em>${e(msg.text)}</em>`;
            } else {
                content += this.highlightRefs(e(msg.text));
            }

            // Add timestamp and sender name for regular messages
            if (msg.type !== "decision" && msg.type !== "delegation" && msg.type !== "action") {
                const senderName = e(sender?.name || "Unknown");
                content += `<div class="message-meta"><small>${senderName} • ${this.formatTime(msg.timestamp)}</small></div>`;
            } else {
                content += `<div class="message-time">${this.formatTime(msg.timestamp)}</div>`;
            }

            content += `</div>`;

            div.innerHTML = content;
            this.messagesContainer.appendChild(div);
        });

        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }

    async handleSendMessage() {
        const text = this.messageInput.value.trim();
        if (!text || !this.currentConversationId || this.sending) return;
        const conversationId = this.currentConversationId;

        this.sending = true;
        this.sendBtn.disabled = true;
        try {
            await api.addMessage(conversationId, this.currentUserId, "text", text);
            await api.refresh();
        } catch (err) {
            this.showError(err);
            return;
        } finally {
            this.sending = false;
            this.sendBtn.disabled = false;
        }
        this.messageInput.value = "";
        this.playSound('sent');
        this.renderMessages();
        this.renderDMList();

        const conv = mockDataHelpers.getConversationById(conversationId);
        const botId = conv?.participantIds?.find(id => mockData.bots.some(b => b.botId === id));
        const userId = conv?.participantIds?.find(id => mockData.users.some(u => u.userId === id && u.userId !== this.currentUserId));

        if (botId) {
            this.showTyping(true);
            let ok = false;
            try {
                ok = await api.botReply(conversationId);
                if (!ok) {
                    await this.generateBotResponse(conversationId, botId, text);
                    await api.refresh();
                }
            } catch (err) {
                this.showError(err);
            } finally {
                this.showTyping(false);
            }
            this.playSound('notification');
            this.renderMessages();
            this.renderDMList();
        } else if (userId === "usr_004") {
            this.later(async () => {
                await this.generateLarsResponse(conversationId);
                await api.setUnread(conversationId, this.currentConversationId === conversationId ? 0 : (conv.unreadCount || 0) + 1);
                await api.refresh();
                this.playSound('notification');
                this.renderMessages();
                this.renderDMList();
            }, 3000);
        }
    }

    showTyping(on) {
        let el = document.getElementById("typingIndicator");
        if (on && !el) {
            el = document.createElement("div");
            el.id = "typingIndicator";
            el.className = "message bot";
            el.setAttribute("aria-live", "polite");
            el.innerHTML = `<div class="message-avatar">🤖</div><div class="message-content"><em>Boten tar fram beslutsstöd…</em></div>`;
            this.messagesContainer.appendChild(el);
            this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
        } else if (!on && el) {
            el.remove();
        }
    }

    generateLarsResponse(conversationId) {
        // Random responses from Lars
        const responses = [
            "Jag kollar det nu, vänta ett ögonblick.",
            "Låter som ett tryckproblem. Jag börjar diagnostisera.",
            "Okej, jag är på väg till maskinen.",
            "Kan ta mig ungefär 10 minuter att komma dit.",
            "Har du någon mer info om när det började?",
            "Det här har jag sett förut. Vi fixar det.",
            "Är det HPM-2400 eller en annan maskin?",
            "Jag checkar loggarna nu.",
            "Låter brådskande. Jag prioriterar detta.",
            "Okej, jag har verktyg här. Kan börja omedelbar."
        ];
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];

        return api.addMessage(conversationId, "usr_004", "text", randomResponse);
    }

    generateBotResponse(conversationId, botId, userQuestion) {
        const lowerQuestion = userQuestion.toLowerCase();

        // Standard responses for common questions
        const responses = [
            // 1. Diagnos / vad är fel
            {
                keywords: ["vad", "fel", "problem", "varför", "diagnos"],
                data: "HPM-2400 mätutrustning rapporterar: Temperatur 127°C (överskridning +42°C), Tryck 52 bar (normal 50±2)",
                interpretation: "Sensorn detekterar en kritisk temperaturöverskridning. Detta indikerar möjlig värmeackumulering, bristande kylcirkulation eller överbelastning på systemet.",
                recommendation: "Prioritet: Stanna omedelbar drift. Inspektera: (1) Kylslangarna för blockering, (2) Fläkten för felaktighet, (3) Pumpen för läckage."
            },
            // 2. Historik / vad hände
            {
                keywords: ["historik", "hände", "tidigare", "förut", "idag"],
                data: "Logg från senaste 24h: Stabil drift 06:00-13:45. Vid 13:46 började temperatur att stiga. Når kritisk nivå 127°C vid 13:52.",
                interpretation: "Övergången var gradvis under ~6 minuter, vilket tyder på något som förvärrades kontinuerligt snarare än ett plötsligt fel.",
                recommendation: "Kontrollera om något gjordes på maskinen omkring 13:40 (justering, ändrad inställning, start av ny process)."
            },
            // 3. Åtgärd / vad ska göras
            {
                keywords: ["åtgärd", "gör", "hur", "ska", "behöva"],
                data: "Systemets self-check visar: Kylcirkulationen är aktiv men minskat flöde (normal 45 L/min, nu 18 L/min)",
                interpretation: "Det låga flödet förklarar värmeansamlingen. Möjlig orsak: blockering i filtret eller slang.",
                recommendation: "Omedelbar åtgärd: Rensa/byt värmeavvisningsfiltret. Uppskattat tidsåtgång 15 minuter. Testa sedan med reducerad belastning."
            },
            // 4. Sensor / mätutrustning
            {
                keywords: ["sensor", "mät", "givare", "värde", "läser"],
                data: "Temperaturgivaren (TEMP_01) är kalibrerad 2024-09-15. Senaste selftest: OK (2024-10-14 06:00). Noggrannhet: ±0.5°C",
                interpretation: "Givaren fungerar enligt specifikation. Värdet 127°C är därför tillförlitligt och inte ett sensorfel.",
                recommendation: "Förkasta teorin om givarvill. Felet ligger i den övervakade processen, inte i mätningen."
            },
            // 5. Risk / säkerhet / kan vi köra
            {
                keywords: ["risk", "säkerhet", "kan vi köra", "driva", "farligt"],
                data: "Driftgräns för HPM-2400 är 0-100°C. Aktuell nivå 127°C överskrider säker gräns med 27°C.",
                interpretation: "Fortsatt drift utgör risk för komponentskada, vätskeförlust och potentiell säkerhetshändelse.",
                recommendation: "REKOMMENDATION: Stanna omedelbar produktion. Påbörja felsökning av kylsystem innan återstart. Denna rekommendation är beslutsstöd för er säkerhetsledning."
            }
        ];

        // Find best matching response
        let selectedResponse = responses[4]; // Default to safety response
        for (let response of responses) {
            if (response.keywords.some(kw => lowerQuestion.includes(kw))) {
                selectedResponse = response;
                break;
            }
        }

        const r = selectedResponse;
        return api.addMessage(conversationId, botId, "bot_response",
            `[DATA] ${r.data}\n[TOLKNING] ${r.interpretation}\n[REKOMMENDATION] ${r.recommendation}`,
            { data: r.data, interpretation: r.interpretation, recommendation: r.recommendation, source: "template" });
    }

    async handleSaveDecision() {
        const text = document.getElementById("decisionText").value.trim();
        const caseId = document.getElementById("decisionCase").value.trim();

        if (!text) {
            alert("Var god ange en beslutsbeskrivning");
            return;
        }
        if (!caseId) {
            alert("Var god välj ett ärende");
            return;
        }

        const maker = mockDataHelpers.getUserById(this.currentUserId)?.name || "Okänd";
        try {
            await api.addMessage(this.currentConversationId, this.currentUserId, "decision", text,
                { decisionMaker: maker, decisionTime: new Date(), caseId });
            await api.addCaseEvent(caseId, "decision", this.currentUserId, text);
            await api.refresh();
        } catch (err) {
            this.showError(err);
            return;
        }

        this.renderMessages();
        this.closeModal("decisionModal");
        document.getElementById("decisionText").value = "";
        document.getElementById("decisionCase").value = "";
        this.toast(`✓ Beslut sparat i ${caseId}`, "#10b981");
    }

    async handleSaveDelegation() {
        const recipientText = document.getElementById("delegationRecipient").value.trim();
        const taskText = document.getElementById("delegationTask").value.trim();
        const caseId = document.getElementById("delegationCase").value.trim();

        if (!recipientText || !taskText) {
            alert("Var god ange mottagare och uppgift");
            return;
        }
        if (!caseId) {
            alert("Var god välj ett ärende");
            return;
        }

        const recipient = mockData.users.find(u => u.name.toLowerCase().includes(recipientText.toLowerCase()));
        if (!recipient) {
            alert("Mottagare inte hittad");
            return;
        }

        const delegator = mockDataHelpers.getUserById(this.currentUserId)?.name || "Okänd";
        const meta = { assignee: recipient.name, delegatingUser: delegator, status: "assigned", delegationTime: new Date(), caseId };
        const recipientConv = mockData.conversations.find(c => c.participantIds.includes(recipient.userId));

        try {
            await api.addMessage(this.currentConversationId, this.currentUserId, "delegation", `Delegering: ${taskText}`, meta);
            await api.addCaseEvent(caseId, "delegation", this.currentUserId, taskText, { assigneeId: recipient.userId, status: "assigned" });
            if (recipientConv) {
                await api.addMessage(recipientConv.conversationId, this.currentUserId, "delegation", `Delegering (${caseId}): ${taskText}`, meta);
            }
            await api.refresh();
        } catch (err) {
            this.showError(err);
            return;
        }
        this.renderMessages();

        if (recipientConv) {
            const convId = recipientConv.conversationId;
            const bumpUnread = async () => {
                const c = mockDataHelpers.getConversationById(convId);
                await api.setUnread(convId, this.currentConversationId === convId ? 0 : (c?.unreadCount || 0) + 1);
            };

            // Simulated colleague replies (mock persona, not real people).
            this.later(async () => {
                await api.addMessage(convId, recipient.userId, "text", "Jag tar hand om detta omedelbart. Börjar inspektera loggen nu.");
                await bumpUnread();
                await api.refresh();
                this.playSound('notification');
                this.renderMessages();
                this.renderDMList();
            }, 5000);

            this.later(async () => {
                const reply = "Stannade produktionen. Har påbörjat felsökning av kylsystem. Återkommer.";
                await api.addMessage(convId, recipient.userId, "text", reply);
                await api.addCaseEvent(caseId, "action", recipient.userId, reply, { status: "started" });
                await bumpUnread();
                await api.refresh();
                this.playSound('notification');
                this.renderMessages();
                this.renderDMList();
            }, 10000);
        }

        this.closeModal("delegationModal");
        document.getElementById("delegationRecipient").value = "";
        document.getElementById("delegationTask").value = "";
        document.getElementById("delegationCase").value = "";
        this.toast(`✓ Delegering sparad i ${caseId}`, "#0066cc");
    }

    async handleSaveAction() {
        const description = document.getElementById("actionDescription").value.trim();
        const status = document.getElementById("actionStatus").value;
        const caseId = document.getElementById("actionCase").value.trim();

        if (!description) {
            alert("Var god ange en åtgärdsbeskrivning");
            return;
        }
        if (!caseId) {
            alert("Var god välj ett ärende");
            return;
        }

        const performer = mockDataHelpers.getUserById(this.currentUserId)?.name || "Okänd";
        try {
            await api.addMessage(this.currentConversationId, this.currentUserId, "action", description,
                { performer, status, actionTime: new Date(), caseId });
            await api.addCaseEvent(caseId, "action", this.currentUserId, description, { status });
            await api.refresh();
        } catch (err) {
            this.showError(err);
            return;
        }

        this.renderMessages();
        this.closeModal("actionModal");
        document.getElementById("actionDescription").value = "";
        document.getElementById("actionCase").value = "";
        this.toast(`✓ Åtgärd sparad i ${caseId}`, "#d42426");
    }

    handleDelegationSearch(query) {
        const resultsDiv = document.getElementById("delegationResults");
        const results = [];

        if (query.trim().length === 0) {
            // Show all colleagues when empty
            results.push(...mockData.users);
        } else {
            // Filter by name or role
            results.push(...mockData.users.filter(u =>
                u.name.toLowerCase().includes(query.toLowerCase()) ||
                u.role.toLowerCase().includes(query.toLowerCase())
            ));
        }

        resultsDiv.innerHTML = "";

        if (results.length === 0) {
            resultsDiv.innerHTML = "<div class='search-result-item'>Ingen match</div>";
            return;
        }

        results.forEach(user => {
            const div = document.createElement("div");
            div.className = "search-result-item";
            div.innerHTML = `<strong>${user.name}</strong><br><small>${user.role}</small>`;
            div.style.cursor = "pointer";
            div.addEventListener("click", () => {
                document.getElementById("delegationRecipient").value = user.name;
                resultsDiv.innerHTML = "";
            });
            resultsDiv.appendChild(div);
        });
    }

    populateCaseSelects() {
        const selectIds = ["decisionCase", "delegationCase", "actionCase"];

        selectIds.forEach(selectId => {
            const select = document.getElementById(selectId);
            if (!select) return;

            // Keep the default option, remove others
            select.innerHTML = '<option value="">-- Välj ärende --</option>';

            // Sort cases by createdAt (newest first)
            const sortedCases = [...mockData.cases].sort((a, b) =>
                new Date(b.createdAt) - new Date(a.createdAt)
            );

            sortedCases.forEach(caseObj => {
                const option = document.createElement("option");
                option.value = caseObj.caseId;
                option.textContent = `${caseObj.caseId} - ${caseObj.title} (${caseObj.status})`;
                select.appendChild(option);
            });
        });
    }

    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add("active");
            modal.style.display = "flex";

            // Populate case selects
            this.populateCaseSelects();

            // If delegation modal, show all colleagues
            if (modalId === "delegationModal") {
                this.handleDelegationSearch("");
            }

            // Focus on first select/input
            const firstInput = modal.querySelector("select, input, textarea");
            if (firstInput) firstInput.focus();
        }
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove("active");
            modal.style.display = "none";
        }
    }

    async handleReset() {
        clearTimeout(this.alarmTimeout);
        this.pendingTimeouts.forEach(clearTimeout);
        this.pendingTimeouts = [];
        if (this.countdownInterval) clearInterval(this.countdownInterval);
        this.countdownInterval = null;
        this.acknowledgementCountdown = null;
        document.querySelector(".alarm-countdown")?.remove();
        try {
            await api.reset();
        } catch (err) {
            this.showError(err);
            return;
        }
        this.currentConversationId = null;
        this.currentCaseId = null;
        this.alarmTriggeredAt = null;
        this.noSelection.style.display = "flex";
        this.conversationView.style.display = "none";
        this.alarmBanner.style.display = "none";
        this.messagesContainer.innerHTML = "";
        this.messageInput.value = "";

        this.renderDMList();
        if (this.currentTab === "cases") {
            this.renderCasesList();
        }
        this.startAlarmTimer();
    }

    // FR-023/FR-024: chronological case history with event type and actor.
    buildHistory(caseObj) {
        const nameOf = (id) => (mockDataHelpers.getUserById(id) || mockDataHelpers.getBotById(id))?.name || id;
        const events = [];
        const msgs = caseObj.conversationId ? mockData.messages.filter(m => m.conversationId === caseObj.conversationId) : [];
        const relevant = (m) => !caseObj.alarmIds.length || m.timestamp >= caseObj.createdAt;

        const statusSv = { open: "öppen", resolved: "löst" }[caseObj.status] || caseObj.status;
        const prioSv = { critical: "kritisk", normal: "normal" }[caseObj.priority] || caseObj.priority;
        events.push({ at: caseObj.createdAt, order: 2, icon: "📋", type: "Ärende skapat", actor: "Hubben (automatiskt)",
            detail: `${caseObj.caseId} – ${caseObj.title}. Status: ${statusSv}, prioritet: ${prioSv}` });

        caseObj.alarmIds.forEach(id => {
            const a = mockDataHelpers.getAlarmById(id);
            if (!a?.createdAt) return;
            events.push({ at: a.createdAt, order: 0, icon: "🚨", type: "Ursprungligt maskinlarm", actor: nameOf("bot_hpm"),
                detail: `${a.originalMessage}. ${a.sensor}: ${a.sensorValue}${a.sensorUnit} (normal ${a.normalValue}${a.sensorUnit}), nivå ${a.level}` });
            if (a.escalatedAt) {
                events.push({ at: a.escalatedAt, order: 1, icon: "⬆️", type: "Eskalering", actor: "Hubben (regel " + a.ruleSource + ")",
                    detail: `Maskinansvarig kvitterade inte i tid → ${nameOf(a.escalatedTo)} (Maskingruppsansvarig)` });
            }
        });

        msgs.filter(relevant).forEach(m => {
            const md = m.metadata || {};
            if (m.type === "text" && m.senderId === this.currentUserId) {
                events.push({ at: m.timestamp, icon: "❓", type: "Fråga", actor: nameOf(m.senderId), detail: m.text });
            } else if (m.type === "bot_response") {
                events.push({ at: m.timestamp, icon: "🤖", type: "Botens tolkning och rekommendation (beslutsstöd)", actor: nameOf(m.senderId),
                    detail: `Tolkning: ${md.interpretation} Rekommendation: ${md.recommendation}` });
            } else if (m.type === "acknowledgment") {
                events.push({ at: m.timestamp, icon: "✅", type: "Kvittering", actor: md.acknowledgedBy || nameOf(m.senderId), detail: m.text });
            }
        });

        caseObj.decisions.forEach(d => events.push({ at: d.timestamp, icon: "💡", type: "Beslut", actor: d.maker, detail: d.text }));
        caseObj.delegations.forEach(d => events.push({ at: d.timestamp, icon: "📨", type: "Delegering", actor: `${d.from} → ${d.to}`, detail: `${d.task} (status: ${d.status})` }));
        caseObj.actions.forEach(a => events.push({ at: a.timestamp, icon: "🛠️", type: "Åtgärd (utförd av människa)", actor: a.performer, detail: `${a.text} (status: ${a.status})` }));

        return events.sort((x, y) => (new Date(x.at) - new Date(y.at)) || ((x.order ?? 9) - (y.order ?? 9)));
    }

    caseParticipants(caseObj) {
        const conv = caseObj.conversationId && mockDataHelpers.getConversationById(caseObj.conversationId);
        const ids = new Set([this.currentUserId, ...(conv ? [...conv.participantIds, ...(conv.invitedIds || [])] : [])]);
        if (caseObj.alarmIds.length) ids.add("usr_001");
        caseObj.delegations.forEach(d => { const u = mockData.users.find(x => x.name === d.to); if (u) ids.add(u.userId); });
        return [...ids].map(id => mockDataHelpers.getUserById(id) || mockDataHelpers.getBotById(id)).filter(Boolean);
    }

    renderInvited(conv) {
        const ids = conv.invitedIds || [];
        if (!ids.length) return "";
        const names = ids.map(id => (mockDataHelpers.getUserById(id) || mockDataHelpers.getBotById(id))?.name || id);
        return `<span class="invited" aria-label="Inkopplade deltagare">+ ${names.map(n => this.escape(n)).join(", ")}</span>`;
    }

    highlightRefs(html) {
        return html
            .replace(/(^|\s)(@[A-ZÅÄÖ][\wåäöÅÄÖ.-]*(?: [A-ZÅÄÖ0-9][\wåäöÅÄÖ.-]*){0,3})/g, '$1<span class="mention">$2</span>')
            .replace(/\[([^\]\n]{1,160})\]/g, '<span class="ref-chip">$1</span>');
    }

    async inviteParticipant(participantId) {
        if (!this.currentConversationId) return;
        const conv = mockDataHelpers.getConversationById(this.currentConversationId);
        const before = (conv.invitedIds || []).length;
        try {
            await api.invite(this.currentConversationId, participantId);
        } catch (err) {
            this.showError(err);
            return;
        }
        if ((conv.invitedIds || []).length === before) return;
        const who = (mockDataHelpers.getUserById(participantId) || mockDataHelpers.getBotById(participantId))?.name || participantId;
        this.toast(`👥 ${who} kopplad till konversationen`, "#0066cc");
        const participants = mockDataHelpers.getConversationParticipants(this.currentConversationId);
        const icons = participants.map(p => p.type === "bot" ? "🤖" : "👤").join(" ");
        this.conversationTitle.innerHTML = `<span>${icons}</span><span>${this.escape(conv.title)}</span>${this.renderInvited(conv)}`;
    }

    showSettings() {
        alert("Inställningar:\n\n🏭 Maskinpark Meddelandehub v1.0\n\nDemonstrationssystem för AI DM HUB\n\nAlla data är mockad och fiktiv.\n\nKnappbeskrivningar:\n📋 Historik – Visa/dölj meddelande-historiken\n↻ Återställ Demo – Kör demonstrationsscenariot om\n⚙️ Inställningar – Visa systeminfo");
    }

    switchTab(tabName) {
        this.currentTab = tabName;

        // Update tab buttons
        document.querySelectorAll(".tab-btn").forEach(btn => btn.classList.remove("active"));
        document.querySelector(`[data-tab="${tabName}"]`).classList.add("active");

        // Update tab content
        document.querySelectorAll(".tab-content").forEach(panel => panel.classList.remove("active"));
        if (tabName === "messages") {
            this.messagesPanel.classList.add("active");
        } else {
            this.casesPanel.classList.add("active");
            this.renderCasesList();
        }
    }

    renderCasesList() {
        this.casesList.innerHTML = "";

        // Sort cases by created date (newest first)
        const sorted = [...mockData.cases].sort((a, b) => b.createdAt - a.createdAt);

        sorted.forEach(caseObj => {
            const li = document.createElement("li");
            li.className = "dm-item";
            if (caseObj.status === "open") li.classList.add("alarm");
            if (this.currentCaseId === caseObj.caseId) li.classList.add("active");

            const statusEmoji = caseObj.status === "open" ? "🔴" : "✅";

            li.innerHTML = `
                <div class="dm-item-icon-wrapper">
                    <div class="dm-item-icon">${statusEmoji}</div>
                </div>
                <div class="dm-item-content">
                    <div class="dm-item-name">${caseObj.caseId}</div>
                    <div class="dm-item-preview">${this.escape(caseObj.title)}</div>
                    <div class="dm-item-meta">
                        ${this.formatTime(caseObj.createdAt)}
                        ${caseObj.status === "open" ? '<span class="dm-item-meta"> • ÖPPEN</span>' : ''}
                    </div>
                </div>
            `;

            li.addEventListener("click", () => this.showCaseDetails(caseObj.caseId));
            this.casesList.appendChild(li);
        });
    }

    showCaseDetails(caseId) {
        this.currentCaseId = caseId;
        const caseObj = mockDataHelpers.getCaseById(caseId);
        if (!caseObj) return;

        this.noSelection.style.display = "none";
        this.conversationView.style.display = "flex";

        // Hide chat elements - show only case details
        this.alarmBanner.style.display = "none";
        document.querySelector(".action-buttons").style.display = "none";
        document.querySelector(".input-area").style.display = "none";

        this.conversationTitle.innerHTML = `
            <span>📋</span>
            <span>${this.escape(caseObj.caseId)} - ${this.escape(caseObj.title)}</span>
        `;

        this.renderCaseContent(caseObj);
        this.renderCasesList();
    }

    renderCaseContent(caseObj) {
        this.messagesContainer.innerHTML = "";

        const machine = mockDataHelpers.getMachineById(caseObj.machineId);
        const createdDate = new Date(caseObj.createdAt).toLocaleString("sv-SE");
        const closedDate = caseObj.closedAt ? new Date(caseObj.closedAt).toLocaleString("sv-SE") : "-";

        // Case header - Corporate style
        const header = document.createElement("div");
        header.className = "case-header";
        header.innerHTML = `
            <div class="case-header-title">
                <span class="case-id">${caseObj.caseId}</span>
                <span class="case-status ${caseObj.status}">${caseObj.status === "open" ? "🔴 ÖPPEN" : "✅ LÖST"}</span>
                <span class="case-priority priority-${caseObj.priority}">${caseObj.priority.toUpperCase()}</span>
            </div>
            <h2>${this.escape(caseObj.title)}</h2>
        `;
        this.messagesContainer.appendChild(header);

        // Info table
        const infoTable = document.createElement("table");
        infoTable.className = "case-info-table";
        infoTable.innerHTML = `
            <tr>
                <td class="label">Maskin:</td>
                <td><strong>${machine?.name || caseObj.machineId}</strong> (${caseObj.machineId})</td>
                <td class="label">Maskingrupp:</td>
                <td>${machine?.group || "-"}</td>
            </tr>
            <tr>
                <td class="label">Skapad:</td>
                <td>${createdDate}</td>
                <td class="label">Stängd:</td>
                <td>${closedDate}</td>
            </tr>
            <tr>
                <td class="label">Ansvarig:</td>
                <td>${caseObj.assignedTo ? mockDataHelpers.getUserById(caseObj.assignedTo)?.name : "-"}</td>
                <td class="label">Larm-ID:</td>
                <td>${caseObj.alarmIds.join(", ") || "-"}</td>
            </tr>
        `;
        this.messagesContainer.appendChild(infoTable);

        // FR-023/FR-024, AC-011: full case history in chronological order.
        const e = (x) => this.escape(x);
        const timeline = document.createElement("section");
        timeline.className = "case-timeline";
        timeline.setAttribute("aria-label", "Ärendehistorik");

        const people = this.caseParticipants(caseObj)
            .map(p => `${p.type === "bot" ? "🤖" : "👤"} ${e(p.name)}${p.role ? ` (${e(p.role)})` : ""}`).join(", ");
        const events = this.buildHistory(caseObj);

        timeline.innerHTML = `
            <h3 style="margin-top: 1.5rem; margin-bottom: 0.5rem; color: #333;">Historik</h3>
            <p class="case-participants"><strong>Deltagare:</strong> ${people}</p>
            <ol class="case-history" aria-label="Händelser i kronologisk ordning">
                ${events.map(ev => `
                <li class="timeline-event">
                    <div class="timeline-dot" aria-hidden="true">${ev.icon}</div>
                    <div class="timeline-content">
                        <div class="event-header">
                            <span class="event-type">${e(ev.type)}</span>
                            <span class="event-actor">${e(ev.actor)}</span>
                            <time class="event-time" datetime="${new Date(ev.at).toISOString()}">${new Date(ev.at).toLocaleString("sv-SE")}</time>
                        </div>
                        <div class="event-description">${e(ev.detail)}</div>
                    </div>
                </li>`).join("")}
            </ol>`;

        this.messagesContainer.appendChild(timeline);
        this.messagesContainer.scrollTop = 0;
    }

    formatTime(date) {
        if (!date) return "";
        const now = new Date();
        const diff = now - new Date(date);
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);

        if (seconds < 60) return "Nu";
        if (minutes < 60) return `${minutes} min`;
        if (hours < 24) return `${hours}h`;
        return new Date(date).toLocaleDateString("sv-SE");
    }
}

// Initialize the app when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
    window.app = new AIHubApp();
});
