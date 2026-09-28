import { describe, expect, it } from "vitest";

import { cn } from "./utils";

describe("cn", () => {
  it("merges conflicting Tailwind classes, keeping the last one", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
  });

  it("joins non-conflicting classes", () => {
    expect(cn("flex", "items-center")).toBe("flex items-center");
  });
});
