// Builds src/planning-data.json from project/progress.md so the read-only
// planning board can show project status without any backend.
// Usage: node scripts/build-planning.mjs [--check]
//   --check  exit 1 if the committed JSON is out of date (used by verify.sh)
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const source = join(root, "project/progress.md");
const target = join(root, "src/planning-data.json");

const STATUS = [
    { id: "done", pattern: /\b(done|klar|completed)\b/i },
    { id: "in_progress", pattern: /\bin progress\b/i },
    { id: "pending", pattern: /\b(pending|not started)\b/i },
];

function parse(md) {
    const lastUpdated = md.match(/\*\*Senast uppdaterad:\*\*\s*(.+)/)?.[1].trim() ?? null;
    const section = md.match(/## Status per Fas\n([\s\S]*?)\n## /);
    if (!section) throw new Error("progress.md: section 'Status per Fas' not found");

    const features = [];
    let phase = null;
    for (const line of section[1].split("\n")) {
        const heading = line.match(/^### Fas (\d+)/);
        if (heading) {
            phase = Number(heading[1]);
            continue;
        }
        const item = line.replace(/\*\*/g, "").match(/^- \[( |x)\] (FEAT-[^–]+?)\s+–\s+(.+)$/);
        if (!item) continue;

        const [, , featureCell, rest] = item;
        const scope = featureCell.match(/\((.+)\)\s*$/)?.[1] ?? null;
        const featureId = featureCell.replace(/\s*\(.*\)\s*$/, "").trim();
        const statusText = rest.replace(/\s*\(.*$/, "").trim();
        const status = STATUS.find((s) => s.pattern.test(statusText));
        if (!status) throw new Error(`progress.md: unknown status "${statusText}" for ${featureId}`);

        features.push({
            featureId,
            scope,
            phase,
            status: status.id,
            statusText,
            note: rest.replace(/^[^(]*\(/, "").replace(/\)\s*$/, "").trim(),
        });
    }

    if (features.length === 0) throw new Error("progress.md: no feature rows found");
    return { source: "project/progress.md", lastUpdated, features };
}

const data = parse(readFileSync(source, "utf8"));
const json = JSON.stringify(data, null, 2) + "\n";

if (process.argv.includes("--check")) {
    let current = null;
    try {
        current = readFileSync(target, "utf8");
    } catch {
        // missing file counts as out of date
    }
    if (current !== json) {
        console.error("src/planning-data.json is out of date. Run: node scripts/build-planning.mjs");
        process.exit(1);
    }
    console.log(`planning data up to date (${data.features.length} features)`);
} else {
    writeFileSync(target, json);
    console.log(`wrote src/planning-data.json (${data.features.length} features, source updated ${data.lastUpdated})`);
}
