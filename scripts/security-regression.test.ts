import assert from "node:assert/strict";
import { safeRelativePath } from "@/lib/auth/safe-relative-path";

assert.equal(safeRelativePath(null), "/");
assert.equal(safeRelativePath(""), "/");
assert.equal(safeRelativePath("https://evil.example"), "/");
assert.equal(safeRelativePath("//evil.example"), "/");
assert.equal(safeRelativePath("/\\evil.example"), "/");
assert.equal(safeRelativePath("/profile?tab=security#student"), "/profile?tab=security#student");

console.log("security regression tests passed");
