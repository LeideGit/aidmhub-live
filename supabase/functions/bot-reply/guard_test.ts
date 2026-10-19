import { assert, assertEquals, assertStringIncludes } from "jsr:@std/assert@1.0.13";
import { finalize, findUnsafe, isValidReply, SAFETY_FOOTER } from "./guard.ts";

const ok = {
  data: "TEMP_01 visar 127°C (normal 85°C).",
  interpretation: "Bedömning: trolig nedsatt kylning.",
  recommendation: "Rekommendation: ansvarig bör överväga att stoppa produktionen via ordinarie system.",
};

Deno.test("safe recommendation passes and gets footer", () => {
  const { reply, blocked } = finalize(ok);
  assertEquals(blocked, null);
  assertStringIncludes(reply.recommendation, SAFETY_FOOTER);
  assertStringIncludes(reply.recommendation, "överväga att stoppa");
});

for (const unsafe of [
  "Jag har stoppat maskinen.",
  "Jag stänger av pumpen nu.",
  "Jag skickar ett styrkommando till HPM-2400.",
  "Pumpen har stoppats av mig.",
  "Jag återstartar systemet.",
  "Styrkommando skickat.",
  "I have stopped the pump.",
]) {
  Deno.test(`blocks: ${unsafe}`, () => {
    const { reply, blocked } = finalize({ ...ok, interpretation: unsafe });
    assert(blocked, "expected guard to block");
    assertStringIncludes(reply.data, "kan inte skicka styrkommandon");
    assertStringIncludes(reply.recommendation, SAFETY_FOOTER);
  });
}

Deno.test("does not flag advice to humans", () => {
  assertEquals(findUnsafe({ ...ok, recommendation: "Underhållsteknikern bör stänga av pumpen enligt rutin." }), null);
});

Deno.test("validates shape", () => {
  assert(isValidReply(ok));
  assert(!isValidReply({ data: "x", interpretation: "" , recommendation: "y" }));
  assert(!isValidReply(null));
});
