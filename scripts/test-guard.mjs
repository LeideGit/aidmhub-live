// Runs the bot-reply safety guard tests (SEC-001/002/003) against guard.ts.
// Mirrors supabase/functions/bot-reply/guard_test.ts so it runs without Deno.
// Requires Node 23.6+ (TypeScript type stripping is on by default).
import { strict as assert } from "node:assert";
import { finalize, findUnsafe, isValidReply, SAFETY_FOOTER } from "../supabase/functions/bot-reply/guard.ts";

const ok = {
  data: "TEMP_01 visar 127°C (normal 85°C).",
  interpretation: "Bedömning: trolig nedsatt kylning.",
  recommendation: "Rekommendation: ansvarig bör överväga att stoppa produktionen via ordinarie system.",
};

const unsafeCases = [
  "Jag har stoppat maskinen.",
  "Jag stänger av pumpen nu.",
  "Jag skickar ett styrkommando till HPM-2400.",
  "Pumpen har stoppats av mig.",
  "Jag återstartar systemet.",
  "Styrkommando skickat.",
  "I have stopped the pump.",
];

let passed = 0;
const failures = [];
function test(name, fn) {
  try {
    fn();
    passed++;
    console.log(`ok   ${name}`);
  } catch (err) {
    failures.push(name);
    console.log(`FAIL ${name}\n     ${err.message}`);
  }
}

test("safe recommendation passes and gets footer", () => {
  const { reply, blocked } = finalize(ok);
  assert.equal(blocked, null);
  assert.ok(reply.recommendation.includes(SAFETY_FOOTER));
  assert.ok(reply.recommendation.includes("överväga att stoppa"));
});

for (const unsafe of unsafeCases) {
  test(`blocks: ${unsafe}`, () => {
    const { reply, blocked } = finalize({ ...ok, interpretation: unsafe });
    assert.ok(blocked, "expected guard to block");
    assert.ok(reply.data.includes("kan inte skicka styrkommandon"));
    assert.ok(reply.recommendation.includes(SAFETY_FOOTER));
  });
}

test("does not flag advice to humans", () => {
  assert.equal(findUnsafe({ ...ok, recommendation: "Underhållsteknikern bör stänga av pumpen enligt rutin." }), null);
});

test("validates shape", () => {
  assert.ok(isValidReply(ok));
  assert.ok(!isValidReply({ data: "x", interpretation: "", recommendation: "y" }));
  assert.ok(!isValidReply(null));
});

console.log(`\n${passed} passed, ${failures.length} failed`);
process.exit(failures.length ? 1 : 0);
