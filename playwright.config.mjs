import { defineConfig } from "@playwright/test";

// Serves src/ on port 8000 with scripts/static-server.mjs (same port as run.sh).
export default defineConfig({
    testDir: "tests/e2e",
    timeout: 30_000,
    use: { baseURL: "http://127.0.0.1:8000" },
    webServer: {
        command: "node scripts/static-server.mjs 8000 --offline",
        url: "http://127.0.0.1:8000/index.html",
        reuseExistingServer: true,
    },
    projects: [{ name: "chromium", use: { browserName: "chromium" } }],
});
