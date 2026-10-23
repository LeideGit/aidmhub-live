// Minimal static file server for src/ (used by Playwright and local demos).
// Usage: node scripts/static-server.mjs [port] [--offline]
//   --offline  serves an empty config.js so the app runs in in-memory mode
//              (no Supabase, no hCaptcha). The committed config.js is untouched.
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("../src/", import.meta.url)));
const args = process.argv.slice(2);
const offline = args.includes("--offline");
const port = Number(args.find((a) => /^\d+$/.test(a)) ?? 8000);
const types = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".png": "image/png" };
const offlineConfig = "// Offline test config (scripts/static-server.mjs --offline)\nwindow.APP_CONFIG = { supabaseUrl: \"\", supabaseAnonKey: \"\", hcaptchaSiteKey: \"\", llmBot: false };\n";

createServer(async (req, res) => {
    const urlPath = decodeURIComponent(new URL(req.url, "http://x").pathname);
    const target = normalize(join(root, urlPath === "/" ? "index.html" : urlPath));
    if (target !== root && !target.startsWith(root + sep)) {
        res.writeHead(403).end("forbidden");
        return;
    }
    if (offline && target === join(root, "config.js")) {
        res.writeHead(200, { "content-type": types[".js"] }).end(offlineConfig);
        return;
    }
    try {
        const body = await readFile(target);
        res.writeHead(200, { "content-type": types[extname(target)] ?? "application/octet-stream" }).end(body);
    } catch {
        res.writeHead(404).end("not found");
    }
}).listen(port, "127.0.0.1", () => console.log(`serving src/ on http://127.0.0.1:${port}${offline ? " (offline config)" : ""}`));
