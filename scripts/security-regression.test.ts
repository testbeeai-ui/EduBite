import assert from "node:assert/strict";
import { safeRelativePath } from "@/lib/auth/safe-relative-path";
import { isTrustedEmbedSessionOrigin } from "@/lib/brain-gym/embed-trust";

assert.equal(safeRelativePath(null), "/");
assert.equal(safeRelativePath(""), "/");
assert.equal(safeRelativePath("https://evil.example"), "/");
assert.equal(safeRelativePath("//evil.example"), "/");
assert.equal(safeRelativePath("/\\evil.example"), "/");
assert.equal(safeRelativePath("/profile?tab=security#student"), "/profile?tab=security#student");

const pageOrigin = "https://edubite.example";
assert.equal(isTrustedEmbedSessionOrigin(pageOrigin, pageOrigin, false), true);
assert.equal(
  isTrustedEmbedSessionOrigin("https://evil.example", pageOrigin, false),
  false,
);
assert.equal(
  isTrustedEmbedSessionOrigin("https://evil.example", pageOrigin, true),
  false,
);
assert.equal(isTrustedEmbedSessionOrigin("null", pageOrigin, false), false);
assert.equal(isTrustedEmbedSessionOrigin("null", pageOrigin, true), true);
assert.equal(isTrustedEmbedSessionOrigin("", pageOrigin, true), true);
assert.equal(isTrustedEmbedSessionOrigin("", pageOrigin, false), false);

console.log("security regression tests passed");
