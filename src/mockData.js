// Mock Data för AI DM HUB
// All data is fictional and for demonstration purposes only
// Mockinnehållet är godkänt av projektägaren (OQ-002, 2026-10-23). Formellt UX-godkännande är ej dokumenterat.

const mockData = {
    version: "1.0",
    timestamp: new Date().toISOString(),

    // Maskiner
    machines: [
        {
            machineId: "HPM-2400",
            name: "Hydraulisk pump HPM-2400",
            group: "Hydraulik",
            status: "active",
            ownerRoles: ["maskinansvarig", "maskingruppsansvarig"]
        },
        {
            machineId: "TRK-500",
            name: "Tork-enhet TRK-500",
            group: "Tork",
            status: "active",
            ownerRoles: ["maskinansvarig"]
        },
        {
            machineId: "VX-1200",
            name: "Värmesystem VX-1200",
            group: "Värmning",
            status: "active",
            ownerRoles: ["maskingruppsansvarig"]
        }
    ],

    // Användare (kollegor)
    users: [
        {
            userId: "usr_001",
            name: "Anna Bergström",
            role: "Maskinansvarig",
            roleLevel: 1,
            type: "human"
        },
        {
            userId: "usr_002",
            name: "Erik Svensson",
            role: "Maskingruppsansvarig",
            roleLevel: 2,
            type: "human"
        },
        {
            userId: "usr_003",
            name: "Maria Holm",
            role: "Maskinparkansvarig",
            roleLevel: 3,
            type: "human"
        },
        {
            userId: "usr_004",
            name: "Lars Nyström",
            role: "Underhållstekniker",
            roleLevel: 1,
            type: "human"
        }
    ],

    // Botar
    bots: [
        {
            botId: "bot_hpm",
            name: "HPM-2400 Sensor Bot",
            type: "bot",
            machineId: "HPM-2400",
            capabilities: ["alert", "status", "diagnostics", "recommendations"]
        },
        {
            botId: "bot_trk",
            name: "Tork-enhet Monitor",
            type: "bot",
            machineId: "TRK-500",
            capabilities: ["temperature", "humidity", "diagnostics"]
        },
        {
            botId: "bot_vx",
            name: "Värmesystem Advisor",
            type: "bot",
            machineId: "VX-1200",
            capabilities: ["temperature", "pressure", "efficiency"]
        }
    ],

    // Konversationer (initiera med några mockade - kollegor + botar)
    conversations: [
        // Kollegor (mänskliga)
        {
            conversationId: "conv_anna_001",
            participantIds: ["usr_001"],
            type: "colleague",
            title: "Anna Bergström",
            lastMessage: "Kan du checka HPM-2400 senare?",
            lastActivity: new Date(Date.now() - 300000),
            unreadCount: 0,
            priority: "normal",
            status: "active",
            alarmId: null
        },
        {
            conversationId: "conv_lars_001",
            participantIds: ["usr_004"],
            type: "colleague",
            title: "Lars Nyström",
            lastMessage: "TRK-500 är nu servicerad",
            lastActivity: new Date(Date.now() - 420000),
            unreadCount: 0,
            priority: "normal",
            status: "active",
            alarmId: null
        },
        // Botar (maskiner)
        {
            conversationId: "conv_hpm_001",
            participantIds: ["bot_hpm"],
            type: "alarm",
            title: "HPM-2400 Sensor Bot",
            lastMessage: "Väntar på instruktioner",
            lastActivity: new Date(Date.now() - 60000),
            unreadCount: 0,
            priority: "normal",
            status: "active",
            alarmId: null
        },
        {
            conversationId: "conv_trk_001",
            participantIds: ["bot_trk"],
            type: "status",
            title: "Tork-enhet Monitor",
            lastMessage: "Systemet fungerar normalt",
            lastActivity: new Date(Date.now() - 120000),
            unreadCount: 0,
            priority: "normal",
            status: "active",
            alarmId: null
        },
        {
            conversationId: "conv_vx_001",
            participantIds: ["bot_vx"],
            type: "status",
            title: "Värmesystem Advisor",
            lastMessage: "Temperaturen är stabil",
            lastActivity: new Date(Date.now() - 180000),
            unreadCount: 0,
            priority: "normal",
            status: "active",
            alarmId: null
        }
    ],

    // Meddelanden (förifylld konversationshistorik)
    messages: [
        // Anna Bergström - tidigare meddelanden
        {
            messageId: "msg_anna_001",
            conversationId: "conv_anna_001",
            senderId: "usr_001",
            type: "text",
            text: "Hej! Kan du checka HPM-2400 senare? Den har varit lite instabil denna veckan.",
            timestamp: new Date(Date.now() - 300000)
        },
        {
            messageId: "msg_anna_002",
            conversationId: "conv_anna_001",
            senderId: "usr_001",
            type: "text",
            text: "Trycknivåerna varierar mellan 45 och 52 bar. Normalt bör det vara 50±2.",
            timestamp: new Date(Date.now() - 290000)
        },
        {
            messageId: "msg_anna_003",
            conversationId: "conv_anna_001",
            senderId: "usr_001",
            type: "text",
            text: "Låt mig veta när du hinner. Tack!",
            timestamp: new Date(Date.now() - 280000)
        },

        // Lars Nyström - tidigare meddelanden
        {
            messageId: "msg_lars_001",
            conversationId: "conv_lars_001",
            senderId: "usr_004",
            type: "text",
            text: "Uppdatering: TRK-500 är nu färdig efter service. Testade värmecykeln - allt ser bra ut.",
            timestamp: new Date(Date.now() - 420000)
        },
        {
            messageId: "msg_lars_002",
            conversationId: "conv_lars_001",
            senderId: "usr_004",
            type: "text",
            text: "Temperaturkurvan är nu stabil 80-85°C under drift. Filtren var kraftigt igensatta - det var problemet.",
            timestamp: new Date(Date.now() - 410000)
        },
        {
            messageId: "msg_lars_003",
            conversationId: "conv_lars_001",
            senderId: "usr_004",
            type: "text",
            text: "Maskinen är tillbaka i produktion. Nästa service: om 3 månader enligt schema.",
            timestamp: new Date(Date.now() - 400000)
        },

        // HPM-2400 Sensor Bot - tidigare meddelanden
        {
            messageId: "msg_bot_hpm_001",
            conversationId: "conv_hpm_001",
            senderId: "bot_hpm",
            type: "text",
            text: "Status: HPM-2400 operativ. Tryck: 50 bar, Temperatur: 82°C. Allt normalt.",
            timestamp: new Date(Date.now() - 600000)
        },
        {
            messageId: "msg_bot_hpm_002",
            conversationId: "conv_hpm_001",
            senderId: "bot_hpm",
            type: "text",
            text: "Senaste timmen: Genomsnittligt tryck 49.8 bar. En kortvarig avvikelse vid 14:23 (48.2 bar) - möjligt pump-brus.",
            timestamp: new Date(Date.now() - 180000)
        },
        {
            messageId: "msg_bot_hpm_003",
            conversationId: "conv_hpm_001",
            senderId: "bot_hpm",
            type: "text",
            text: "Rekommendation: Kontrollera pumpskruv och försäljningsventil imorgon. Ingenting brådskande.",
            timestamp: new Date(Date.now() - 170000)
        },

        // Tork-enhet Monitor - tidigare meddelanden
        {
            messageId: "msg_bot_trk_001",
            conversationId: "conv_trk_001",
            senderId: "bot_trk",
            type: "text",
            text: "TRK-500 status: Systemet fungerar normalt. Temperatur: 85°C, Fuktighet: 15%, Filterövervakning: OK.",
            timestamp: new Date(Date.now() - 540000)
        },
        {
            messageId: "msg_bot_trk_002",
            conversationId: "conv_trk_001",
            senderId: "bot_trk",
            type: "text",
            text: "Efterservice: Filterbyte genomfört 2024-10-10. Nästa planerat: 2025-01-10.",
            timestamp: new Date(Date.now() - 360000)
        },
        {
            messageId: "msg_bot_trk_003",
            conversationId: "conv_trk_001",
            senderId: "bot_trk",
            type: "text",
            text: "Systemet körs utan avvikelser denna vecka. Produktionsvolym: 480 ton torkad material.",
            timestamp: new Date(Date.now() - 120000)
        },

        // Värmesystem Advisor - tidigare meddelanden
        {
            messageId: "msg_bot_vx_001",
            conversationId: "conv_vx_001",
            senderId: "bot_vx",
            type: "text",
            text: "VX-1200 värmesystem: Bränsleförbrukning normal. Temperaturkurva: 72-78°C under 6h drift.",
            timestamp: new Date(Date.now() - 480000)
        },
        {
            messageId: "msg_bot_vx_002",
            conversationId: "conv_vx_001",
            senderId: "bot_vx",
            type: "text",
            text: "Effektivitet: 94.2% (normalt: 92-96%). Ingen anomali detekterad.",
            timestamp: new Date(Date.now() - 240000)
        },
        {
            messageId: "msg_bot_vx_003",
            conversationId: "conv_vx_001",
            senderId: "bot_vx",
            type: "text",
            text: "Temperaturreglering är stabil. Rekommendation: Rutinunderhåll av värmeelement planeras för nästa månad.",
            timestamp: new Date(Date.now() - 180000)
        }
    ],

    // Larm (mockade, kommer att skapas vid demonstration)
    alarms: [
        {
            alarmId: "alarm_critical_001",
            machineId: "HPM-2400",
            alarmType: "TemperatureOverrun",
            level: 5,
            ruleSource: "machine_rules_v1",
            createdAt: null, // Sätts när larmet triggeras (10 sek efter start)
            ackDeadline: null,
            status: "pending",
            escalatedTo: null,
            escalationReason: null,
            escalatedAt: null,
            originalMessage: "Temperaturöverskridning detekterad på HPM-2400",
            sensorValue: 127,
            sensorUnit: "°C",
            normalValue: 85,
            sensor: "TEMP_01"
        }
    ],

    // Ärenden (cases)
    cases: [
        {
            caseId: "CASE-001",
            title: "HPM-2400 vibrationer",
            description: "Ökad vibrationsnivå uppmätt",
            machineId: "HPM-2400",
            status: "resolved",
            priority: "normal",
            createdAt: new Date(Date.now() - 86400000),
            closedAt: new Date(Date.now() - 43200000),
            assignedTo: "usr_004", // Lars
            alarmIds: [],
            conversationId: null,
            decisions: [],
            delegations: [],
            actions: []
        },
        {
            caseId: "CASE-002",
            title: "TRK-500 filterbyte",
            description: "Planerat filterbyte genomfört",
            machineId: "TRK-500",
            status: "resolved",
            priority: "normal",
            createdAt: new Date(Date.now() - 172800000),
            closedAt: new Date(Date.now() - 86400000),
            assignedTo: "usr_004",
            alarmIds: [],
            conversationId: null,
            decisions: [],
            delegations: [],
            actions: []
        }
    ]
};

// Hjälpfunktioner för att hantera mock-data
const mockDataHelpers = {
    getCurrentUser: () => {
        // Returnera den aktiva användaren (vanligtvis den första)
        return mockData.users[0];
    },

    getConversationById: (conversationId) => {
        return mockData.conversations.find(c => c.conversationId === conversationId);
    },

    getConversationParticipants: (conversationId) => {
        const conv = mockDataHelpers.getConversationById(conversationId);
        if (!conv) return [];

        return conv.participantIds.map(id => {
            const user = mockData.users.find(u => u.userId === id);
            const bot = mockData.bots.find(b => b.botId === id);
            return user || bot;
        });
    },

    getBotById: (botId) => {
        return mockData.bots.find(b => b.botId === botId);
    },

    getUserById: (userId) => {
        return mockData.users.find(u => u.userId === userId);
    },

    getMachineById: (machineId) => {
        return mockData.machines.find(m => m.machineId === machineId);
    },

    getAlarmById: (alarmId) => {
        return mockData.alarms.find(a => a.alarmId === alarmId);
    },

    // Skapa ett botlarm efter 10 sekunder
    createCriticalAlarm: () => {
        const alarm = mockData.alarms[0];
        const now = new Date();

        alarm.createdAt = now;
        alarm.ackDeadline = new Date(now.getTime() + 30000); // 30 sek deadline
        alarm.status = "pending";
        alarm.escalatedTo = "Erik Svensson"; // Escalate to Maskingruppsansvarig
        alarm.escalationReason = "no_ack_timeout";
        alarm.escalatedAt = now;

        // Uppdatera ENDAST HPM-2400 bot konversationen (conv_hpm_001), inte Anna's
        let conv = mockData.conversations.find(c => c.conversationId === "conv_hpm_001");
        if (conv) {
            conv.alarmId = alarm.alarmId;
            conv.priority = "critical";
            conv.status = "escalated";
            conv.lastActivity = now;
            conv.lastMessage = alarm.originalMessage;
            conv.unreadCount = 1;
        }

        return alarm;
    },

    // Lägg till ett meddelande (från bot eller användare)
    addMessage: (conversationId, senderId, messageType, messageText, metadata = {}) => {
        const message = {
            messageId: "msg_" + Date.now(),
            conversationId: conversationId,
            senderId: senderId,
            type: messageType, // "text", "alarm", "decision", "delegation", "action"
            text: messageText,
            timestamp: new Date(),
            metadata: metadata
        };

        mockData.messages.push(message);

        // Uppdatera konversationens lastActivity
        const conv = mockDataHelpers.getConversationById(conversationId);
        if (conv) {
            conv.lastActivity = message.timestamp;
            conv.lastMessage = messageText;
            // Mark as unread if not from current user (will be handled by app)
        }

        return message;
    },

    // Skapa ett beslutsevent
    createDecisionEvent: (conversationId, userId, decisionText, caseId = null) => {
        return mockDataHelpers.addMessage(
            conversationId,
            userId,
            "decision",
            decisionText,
            {
                decisionId: "dec_" + Date.now(),
                decisionMaker: mockDataHelpers.getUserById(userId)?.name || "Okänd",
                decisionTime: new Date(),
                caseId: caseId
            }
        );
    },

    // Skapa ett delegeringsevent
    createDelegationEvent: (conversationId, delegatingUserId, assigneeId, taskDescription, caseId = null) => {
        const assignee = mockDataHelpers.getUserById(assigneeId);
        return mockDataHelpers.addMessage(
            conversationId,
            delegatingUserId,
            "delegation",
            `Delegering: ${taskDescription}`,
            {
                delegationId: "dlg_" + Date.now(),
                assignee: assignee?.name || "Okänd",
                delegatingUser: mockDataHelpers.getUserById(delegatingUserId)?.name || "Okänd",
                status: "assigned",
                delegationTime: new Date(),
                caseId: caseId
            }
        );
    },

    // Skapa ett åtgärdsevent
    createActionEvent: (conversationId, userId, actionDescription, status, caseId = null) => {
        return mockDataHelpers.addMessage(
            conversationId,
            userId,
            "action",
            actionDescription,
            {
                actionId: "act_" + Date.now(),
                performer: mockDataHelpers.getUserById(userId)?.name || "Okänd",
                status: status,
                actionTime: new Date(),
                caseId: caseId
            }
        );
    },

    // Skapa ett botsvar med data, tolkning, rekommendation
    createBotResponse: (conversationId, botId, data, interpretation, recommendation) => {
        const bot = mockDataHelpers.getBotById(botId);
        const responseText = `[DATA] ${data}\n[TOLKNING] ${interpretation}\n[REKOMMENDATION] ${recommendation}`;

        return mockDataHelpers.addMessage(
            conversationId,
            botId,
            "bot_response",
            responseText,
            {
                data: data,
                interpretation: interpretation,
                recommendation: recommendation
            }
        );
    },

    // Skapa ett nytt ärende
    createCase: (machineId, title, description, alarmId = null) => {
        const newCase = {
            caseId: "CASE-" + String(mockData.cases.length + 1).padStart(3, "0"),
            title: title,
            description: description,
            machineId: machineId,
            status: "open",
            priority: "critical",
            createdAt: new Date(),
            closedAt: null,
            assignedTo: null,
            alarmIds: alarmId ? [alarmId] : [],
            conversationId: null,
            decisions: [],
            delegations: [],
            actions: [],
            messages: []
        };
        mockData.cases.push(newCase);
        return newCase;
    },

    getCaseById: (caseId) => {
        return mockData.cases.find(c => c.caseId === caseId);
    },

    addDecisionToCase: (caseId, userId, decisionText) => {
        const caseObj = mockDataHelpers.getCaseById(caseId);
        if (caseObj) {
            caseObj.decisions.push({
                decisionId: "dec_" + Date.now(),
                maker: mockDataHelpers.getUserById(userId)?.name,
                text: decisionText,
                timestamp: new Date()
            });
        }
    },

    addDelegationToCase: (caseId, fromUserId, toUserId, taskText) => {
        const caseObj = mockDataHelpers.getCaseById(caseId);
        if (caseObj) {
            caseObj.delegations.push({
                delegationId: "dlg_" + Date.now(),
                from: mockDataHelpers.getUserById(fromUserId)?.name,
                to: mockDataHelpers.getUserById(toUserId)?.name,
                task: taskText,
                status: "assigned",
                timestamp: new Date()
            });
        }
    },

    addActionToCase: (caseId, userId, actionText, status) => {
        const caseObj = mockDataHelpers.getCaseById(caseId);
        if (caseObj) {
            caseObj.actions.push({
                actionId: "act_" + Date.now(),
                performer: mockDataHelpers.getUserById(userId)?.name,
                text: actionText,
                status: status,
                timestamp: new Date()
            });
        }
    },

    // Återställ demonstrationsscenariot
    resetDemo: () => {
        // Rensa ENDAST larmrelaterade meddelanden (behåll tidigare konversationshistorik)
        mockData.messages = mockData.messages.filter(msg => !["alarm", "decision", "delegation", "action", "bot_response", "acknowledgment"].includes(msg.type));

        // Återställ larmen
        mockData.alarms.forEach(alarm => {
            alarm.createdAt = null;
            alarm.ackDeadline = null;
            alarm.status = "pending";
            alarm.escalatedTo = null;
            alarm.escalationReason = null;
            alarm.escalatedAt = null;
        });

        // Återställ konversationer (men behåll tidigare lastMessage)
        mockData.conversations.forEach(conv => {
            conv.alarmId = null;
            conv.priority = "normal";
            conv.status = "active";
            conv.unreadCount = 0;
            if (conv.type !== "colleague") {
                conv.lastActivity = new Date(Date.now() - 60000);
            }
        });
    }
};
