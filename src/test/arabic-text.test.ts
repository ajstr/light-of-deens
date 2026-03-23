import { describe, expect, it } from "vitest";

import { normalizeDisplayedArabicText } from "@/lib/arabic-text";

describe("normalizeDisplayedArabicText", () => {
  it("converts idgham-style openings into simpler display text", () => {
    expect(normalizeDisplayedArabicText("خَلَقَكُم مِّن نَّفْسٍ وَاحِدَةٍ")).toBe(
      "خَلَقَكُم مِنْ نَفْسٍ وَاحِدَةٍ"
    );
  });
});