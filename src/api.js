// Data layer: Supabase when configured (src/config.js), otherwise in-memory mockData.
// Render code reads from `mockData`, which this module keeps in sync as a cache.

const api = {
    db: null,
    get online() { return this.db !== null; },

    async init() {
        const cfg = window.APP_CONFIG || {};
        if (!cfg.supabaseUrl || !cfg.supabaseAnonKey || !window.supabase) return;

        this.db = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey, {
            auth: { persistSession: true, autoRefreshToken: true }
        });

        const { data: { session } } = await this.db.auth.getSession();
        if (!session) {
            const captchaToken = cfg.hcaptchaSiteKey ? await this.getCaptchaToken(cfg.hcaptchaSiteKey) : undefined;
            const { error } = await this.db.auth.signInAnonymously(captchaToken ? { options: { captchaToken } } : undefined);
            if (error) throw error;
        }
        await this.rpc("start_scenario");
        await this.loadReference();
        await this.refresh();
    },

    // hCaptcha is only needed once per browser, when the anonymous session is created.
    getCaptchaToken(siteKey) {
        return new Promise((resolve, reject) => {
            const run = () => {
                const box = document.createElement("div");
                box.id = "captchaBox";
                box.setAttribute("role", "dialog");
                box.setAttribute("aria-label", "Verifiering innan demo startar");
                box.style.cssText = "position:fixed;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1rem;background:rgba(0,0,0,.55);z-index:10000;color:#fff;text-align:center;padding:16px;";
                box.innerHTML = "<p><strong>Starta demosession</strong><br>Bekräfta att du är en människa. All data i demon är fiktiv.</p><div id='captchaWidget'></div>";
                document.body.appendChild(box);
                window.hcaptcha.render("captchaWidget", {
                    sitekey: siteKey,
                    callback: (token) => { box.remove(); resolve(token); },
                    "error-callback": () => { box.remove(); reject(new Error("captcha failed")); }
                });
            };
            if (window.hcaptcha) return run();
            window.onHcaptchaLoad = run;
            const sc = document.createElement("script");
            sc.src = "https://js.hcaptcha.com/1/api.js?onload=onHcaptchaLoad&render=explicit&hl=sv";
            sc.async = true;
            sc.onerror = () => reject(new Error("captcha script failed to load"));
            document.head.appendChild(sc);
        });
    },

    async rpc(fn, args) {
        const { data, error } = await this.db.rpc(fn, args);
        if (error) throw error;
        return data;
    },

    async loadReference() {
        const [m, u, b] = await Promise.all([
            this.db.from("machines").select("*"),
            this.db.from("users").select("*"),
            this.db.from("bots").select("*")
        ]);
        for (const r of [m, u, b]) if (r.error) throw r.error;
        mockData.machines = m.data.map(x => ({ machineId: x.machine_id, name: x.name, group: x.machine_group, status: x.status, ownerRoles: x.owner_roles }));
        mockData.users = u.data.map(x => ({ userId: x.user_id, name: x.name, role: x.role, roleLevel: x.role_level, type: x.type }));
        mockData.bots = b.data.map(x => ({ botId: x.bot_id, name: x.name, type: x.type, machineId: x.machine_id, capabilities: x.capabilities }));
    },

    async refresh() {
        if (!this.online) return;
        const [c, m, a, k, e] = await Promise.all([
            this.db.from("conversations").select("*"),
            this.db.from("messages").select("*").order("created_at", { ascending: true }),
            this.db.from("alarms").select("*"),
            this.db.from("cases").select("*"),
            this.db.from("case_events").select("*").order("created_at", { ascending: true })
        ]);
        for (const r of [c, m, a, k, e]) if (r.error) throw r.error;

        const name = (id) => mockDataHelpers.getUserById(id)?.name || id;

        mockData.conversations = c.data.map(x => ({
            conversationId: x.conversation_id,
            participantIds: x.participant_ids,
            type: x.type,
            title: x.title,
            lastMessage: x.last_message,
            lastActivity: new Date(x.last_activity),
            unreadCount: x.unread_count,
            invitedIds: x.invited_ids || [],
            priority: x.priority,
            status: x.status,
            alarmId: x.alarm_id,
            caseId: x.case_id
        }));

        mockData.messages = m.data.map(x => ({
            messageId: x.message_id,
            conversationId: x.conversation_id,
            senderId: x.sender_id,
            type: x.type,
            text: x.text,
            timestamp: new Date(x.created_at),
            metadata: x.metadata || {}
        }));

        mockData.alarms = a.data.map(x => ({
            alarmId: x.alarm_id,
            machineId: x.machine_id,
            alarmType: x.alarm_type,
            level: x.level,
            ruleSource: x.rule_source,
            createdAt: new Date(x.created_at),
            ackDeadline: new Date(x.ack_deadline),
            status: x.status,
            escalatedTo: x.escalated_to,
            escalationReason: x.escalation_reason,
            escalatedAt: x.escalated_at ? new Date(x.escalated_at) : null,
            originalMessage: x.original_message,
            sensorValue: Number(x.sensor_value),
            sensorUnit: x.sensor_unit,
            normalValue: Number(x.normal_value),
            sensor: x.sensor
        }));

        mockData.cases = k.data.map(x => {
            const events = e.data.filter(ev => ev.case_id === x.case_id);
            return {
                caseId: x.case_id,
                title: x.title,
                description: x.description,
                machineId: x.machine_id,
                status: x.status,
                priority: x.priority,
                createdAt: new Date(x.created_at),
                closedAt: x.closed_at ? new Date(x.closed_at) : null,
                assignedTo: x.assigned_to,
                alarmIds: x.alarm_ids,
                conversationId: x.conversation_id,
                decisions: events.filter(ev => ev.kind === "decision").map(ev => ({
                    decisionId: ev.event_id, maker: name(ev.actor_id), text: ev.text, timestamp: new Date(ev.created_at)
                })),
                delegations: events.filter(ev => ev.kind === "delegation").map(ev => ({
                    delegationId: ev.event_id, from: name(ev.actor_id), to: name(ev.assignee_id), task: ev.text,
                    status: ev.status, timestamp: new Date(ev.created_at)
                })),
                actions: events.filter(ev => ev.kind === "action").map(ev => ({
                    actionId: ev.event_id, performer: name(ev.actor_id), text: ev.text, status: ev.status,
                    timestamp: new Date(ev.created_at)
                }))
            };
        });
    },

    async addMessage(conversationId, senderId, type, text, metadata = {}) {
        if (!this.online) return mockDataHelpers.addMessage(conversationId, senderId, type, text, metadata);
        const { error } = await this.db.from("messages").insert({
            conversation_id: conversationId, sender_id: senderId, type, text, metadata
        });
        if (error) throw error;
    },

    async setUnread(conversationId, count) {
        const conv = mockDataHelpers.getConversationById(conversationId);
        if (conv) conv.unreadCount = count;
        if (!this.online) return;
        const { error } = await this.db.from("conversations").update({ unread_count: count }).eq("conversation_id", conversationId);
        if (error) throw error;
    },

    async invite(conversationId, participantId) {
        const conv = mockDataHelpers.getConversationById(conversationId);
        if (!conv) return;
        const all = [...conv.participantIds, ...(conv.invitedIds || [])];
        if (all.includes(participantId)) return;
        conv.invitedIds = [...(conv.invitedIds || []), participantId];
        if (!this.online) return;
        const { error } = await this.db.from("conversations").update({ invited_ids: conv.invitedIds }).eq("conversation_id", conversationId);
        if (error) throw error;
    },

    async addCaseEvent(caseId, kind, actorId, text, { assigneeId = null, status = null } = {}) {
        if (!this.online) {
            if (kind === "decision") mockDataHelpers.addDecisionToCase(caseId, actorId, text);
            if (kind === "delegation") mockDataHelpers.addDelegationToCase(caseId, actorId, assigneeId, text);
            if (kind === "action") mockDataHelpers.addActionToCase(caseId, actorId, text, status);
            return;
        }
        const { error } = await this.db.from("case_events").insert({
            case_id: caseId, kind, actor_id: actorId, assignee_id: assigneeId, text, status
        });
        if (error) throw error;
    },

    // Returns { caseId, alreadyTriggered }.
    async triggerAlarm() {
        if (!this.online) {
            mockDataHelpers.createCriticalAlarm();
            const c = mockDataHelpers.createCase("HPM-2400", "KRITISK: Temperaturöverskridning HPM-2400",
                "Automatisk eskalering - Maskinansvarig svarade inte i tid", "alarm_critical_001");
            c.conversationId = "conv_hpm_001";
            const conv = mockDataHelpers.getConversationById("conv_hpm_001");
            conv.caseId = c.caseId;
            mockDataHelpers.addMessage("conv_hpm_001", "bot_hpm", "alarm",
                `🚨 KRITISKT LARM: Temperaturöverskridning detekterad på HPM-2400.\n\nÄrende: ${c.caseId}\n\nSensor TEMP_01 rapporterar: 127°C (normal: 85°C)\nAvvikelse: +42°C\n\nORSAK: Maskinansvarig (Anna Bergström) kvitterade inte larmet inom 30 sekunder. Larmet har eskalerat till Maskingruppsansvarig.`,
                { alarmType: "TemperatureOverrun", level: 5, sensor: "TEMP_01", value: 127, unit: "°C", threshold: 85,
                  escalatedBecause: "no_ack_timeout", escalatedFromRole: "Maskinansvarig", escalatedToRole: "Maskingruppsansvarig", caseId: c.caseId });
            conv.unreadCount = 1;
            return { caseId: c.caseId, alreadyTriggered: false };
        }
        const r = await this.rpc("trigger_alarm");
        await this.refresh();
        return r;
    },

    async acknowledge(userId) {
        if (!this.online) {
            const conv = mockDataHelpers.getConversationById("conv_hpm_001");
            mockDataHelpers.addMessage("conv_hpm_001", userId, "acknowledgment", "Larmet har mottagits och uppmärksammats.",
                { acknowledgedAt: new Date(), acknowledgedBy: mockDataHelpers.getUserById(userId)?.name });
            conv.priority = "normal";
            conv.status = "acknowledged";
            mockData.alarms[0].status = "acknowledged";
            return;
        }
        await this.rpc("acknowledge_alarm", { p_user_id: userId });
        await this.refresh();
    },

    // LLM reply via Edge Function. Returns false if unavailable so caller can use the offline template.
    async botReply(conversationId) {
        if (!this.online || !window.APP_CONFIG?.llmBot) return false;
        const { error } = await this.db.functions.invoke("bot-reply", { body: { conversationId } });
        if (error) {
            console.warn("bot-reply unavailable:", error.message);
            return false;
        }
        await this.refresh();
        return true;
    },

    async reset() {
        if (!this.online) {
            mockDataHelpers.resetDemo();
            mockData.cases = mockData.cases.filter(c => c.caseId === "CASE-001" || c.caseId === "CASE-002");
            mockData.conversations.forEach(c => { c.caseId = null; });
            return;
        }
        await this.rpc("reset_scenario");
        await this.refresh();
    }
};

window.api = api;
