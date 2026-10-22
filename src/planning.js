// Read-only planning board. Reads public.planning_tasks via Supabase (RLS: select only).

const COLUMNS = ["now", "next", "later"];
const COLUMN_LABELS = { now: "Nu", next: "Härnäst", later: "Senare" };

function renderCard(task) {
    const li = document.createElement("li");
    li.className = "kanban-card";

    const label = document.createElement("span");
    label.className = "feature-label";
    label.textContent = task.feature_id;

    const title = document.createElement("p");
    title.className = "kanban-card-title";
    title.textContent = task.title;

    const meta = document.createElement("p");
    meta.className = "kanban-card-meta";
    meta.textContent = `Fas ${task.phase} · ${task.estimate} · ${task.owner}`;

    const blocker = document.createElement("p");
    blocker.className = "kanban-card-meta";
    blocker.textContent = `Blockerare: ${task.blocker}`;

    li.append(label, title, meta, blocker);
    return li;
}

function renderBoard(tasks) {
    for (const column of COLUMNS) {
        const list = document.querySelector(`.kanban-list[data-column="${column}"]`);
        const columnTasks = tasks
            .filter((t) => t.column_id === column)
            .sort((a, b) => a.position - b.position);

        list.replaceChildren(...columnTasks.map(renderCard));
        document.querySelector(`[data-count="${column}"]`).textContent = `(${columnTasks.length})`;
        if (columnTasks.length === 0) {
            const empty = document.createElement("li");
            empty.className = "kanban-empty";
            empty.textContent = "Inga uppgifter";
            list.append(empty);
        }
    }
}

function setStatus(text) {
    document.getElementById("planningStatus").textContent = text;
}

async function loadPlanning() {
    const cfg = window.APP_CONFIG || {};
    if (!cfg.supabaseUrl || !cfg.supabaseAnonKey || !window.supabase) {
        setStatus("Planeringen kräver Supabase-konfiguration (src/config.js).");
        return;
    }

    try {
        const db = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey, {
            auth: { persistSession: false }
        });
        const { data, error } = await db
            .from("planning_tasks")
            .select("task_id, phase, feature_id, title, estimate, owner, blocker, column_id, position")
            .order("position", { ascending: true });
        if (error) throw error;

        renderBoard(data);
        setStatus(`${data.length} uppgifter från implementationsplanen.`);
    } catch (err) {
        console.error(err);
        setStatus("Kunde inte läsa planeringen. Försök igen senare.");
    }
}

loadPlanning();
