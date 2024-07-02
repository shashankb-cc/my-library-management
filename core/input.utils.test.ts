import { describe, expect, test } from "vitest";
import { readChar } from "./input.utils";

describe("Input Util test", () => {
  test("Read char test", async () => {
    const input = await readChar("1. Add Book\n2. Remove Book");
    expect(input).toBeTypeOf("string");
  });
});
