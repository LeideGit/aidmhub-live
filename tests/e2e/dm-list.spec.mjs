import { test, expect } from "@playwright/test";

// Offline mode: config.js has no Supabase keys, so the app uses mockData only.
const WIDTHS = [
    { name: "desktop", width: 1920, height: 1080 },
    { name: "tablet", width: 768, height: 1024 },
    { name: "mobile", width: 375, height: 812 },
];

test.describe("DM-lista (FEAT-DM-list, AC-012)", () => {
    test("lists people and bots with a visible text type label", async ({ page }) => {
        await page.goto("/index.html");
        const items = page.locator("#dmList .dm-item");
        await expect(items.first()).toBeVisible();

        const labels = await items.locator(".dm-item-type").allInnerTexts();
        expect(labels).toContain("Person");
        expect(labels).toContain("Bot");
    });

    test("each item has an accessible name that includes its type", async ({ page }) => {
        await page.goto("/index.html");
        const names = await page.locator("#dmList .dm-item").evaluateAll((els) =>
            els.map((el) => el.getAttribute("aria-label")),
        );
        expect(names.length).toBeGreaterThan(0);
        for (const n of names) expect(n).toMatch(/^(Person|Bot): /);
    });
});

test.describe("Tangentbord (TEST-008)", () => {
    test("Tab reaches DM items and Enter opens the conversation", async ({ page }) => {
        await page.goto("/index.html");
        const first = page.locator("#dmList .dm-item").first();
        await expect(first).toBeVisible();

        await first.focus();
        await expect(first).toBeFocused();
        await page.keyboard.press("Enter");
        await expect(page.locator("#noSelection")).toBeHidden();
    });

    test("Space also opens a conversation", async ({ page }) => {
        await page.goto("/index.html");
        const items = page.locator("#dmList .dm-item");
        const second = items.nth(1);
        await second.focus();
        await page.keyboard.press(" ");
        await expect(second).toHaveAttribute("aria-current", "true");
    });

    test("focused DM item shows a visible focus outline", async ({ page }) => {
        await page.goto("/index.html");
        const first = page.locator("#dmList .dm-item").first();
        await first.focus();
        const outline = await first.evaluate((el) => getComputedStyle(el).outlineStyle);
        const width = await first.evaluate((el) => parseFloat(getComputedStyle(el).outlineWidth));
        expect(outline).toBe("solid");
        expect(width).toBeGreaterThanOrEqual(3);
    });
});

test.describe("Responsivitet (TEST-007, NFR-001)", () => {
    for (const vp of WIDTHS) {
        test(`no horizontal page scroll at ${vp.name} (${vp.width}px)`, async ({ page }) => {
            await page.setViewportSize({ width: vp.width, height: vp.height });
            await page.goto("/index.html");
            await expect(page.locator("#dmList .dm-item").first()).toBeVisible();
            const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
            expect(overflow).toBeLessThanOrEqual(0);
        });

        test(`screenshot at ${vp.name} (${vp.width}px)`, async ({ page }) => {
            await page.setViewportSize({ width: vp.width, height: vp.height });
            await page.goto("/index.html");
            await expect(page.locator("#dmList .dm-item").first()).toBeVisible();
            await page.screenshot({ path: `evals/results/fas1-dm-list-${vp.name}-${vp.width}.png`, fullPage: false });
        });
    }
});

test.describe("Läsbar DM-lista på mobil (FEAT-responsive)", () => {
    test("at 375px at least two DM items are fully visible inside the list", async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 812 });
        await page.goto("/index.html");
        await expect(page.locator("#dmList .dm-item").first()).toBeVisible();

        const visible = await page.locator("#dmList .dm-item").evaluateAll((items) => {
            const list = document.getElementById("dmList").getBoundingClientRect();
            return items.filter((el) => {
                const r = el.getBoundingClientRect();
                return r.top >= list.top && r.bottom <= list.bottom;
            }).length;
        });
        expect(visible).toBeGreaterThanOrEqual(2);
    });
});
