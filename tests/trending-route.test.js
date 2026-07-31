import assert from "node:assert/strict";
import test from "node:test";

import { clean } from "../app/api/trending/route.js";

test("cleans ordinary RSS titles without changing their visible text", () => {
  assert.equal(
    clean("<![CDATA[Open &amp; safe <b>typing</b> &quot;flow&quot;]]>"),
    'Open & safe typing "flow"'
  );
});

test("does not recreate executable markup from nested tags", () => {
  const cleaned = clean("<scr<script>ipt>alert(1)</script>");

  assert.equal(cleaned.includes("<"), false);
  assert.equal(cleaned.includes("<script"), false);
});

test("decodes text entities once instead of double-unescaping them", () => {
  assert.equal(clean("&amp;quot;"), "&quot;");
  assert.equal(clean("&amp;lt;script&amp;gt;"), "&lt;script&gt;");
});
