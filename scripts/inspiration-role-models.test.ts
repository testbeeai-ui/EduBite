import assert from "node:assert/strict";
import { INSPIRATION_ROLE_MODELS } from "../data/inspiration-role-models";
import { roleModelForDate, todayRoleModel } from "../lib/inspiration/daily";
import { toRoleModel } from "../data/inspiration";

assert.equal(INSPIRATION_ROLE_MODELS.length, 90);

const keys = new Set();
const names = new Set();
for (const [index, item] of INSPIRATION_ROLE_MODELS.entries()) {
  assert.ok(item.contentKey, `missing contentKey at ${index}`);
  assert.ok(!keys.has(item.contentKey), `duplicate key ${item.contentKey}`);
  keys.add(item.contentKey);
  assert.ok(!names.has(item.name), `duplicate name ${item.name}`);
  names.add(item.name);
  assert.equal(item.index, String(index + 1).padStart(2, "0"));
  for (const field of [
    "avatar",
    "name",
    "tag",
    "quote",
    "bio",
    "inspireWhy",
    "pcmConnections",
  ] as const) {
    assert.ok(String(item[field]).trim(), `${item.name} missing ${field}`);
  }
  assert.equal("image" in item, false);
  const mapped = toRoleModel(item);
  assert.equal(mapped.image, "");
  assert.ok(mapped.inspireWhy);
  assert.ok(mapped.pcmConnections);
}

assert.equal(INSPIRATION_ROLE_MODELS[0]?.name, "Aryabhata");
assert.equal(INSPIRATION_ROLE_MODELS[89]?.name, "John von Neumann");
assert.equal(roleModelForDate("2026-07-20").name, "Aryabhata");
assert.equal(todayRoleModel().contentKey.length > 0, true);

console.log("Inspiration role model tests passed", {
  total: INSPIRATION_ROLE_MODELS.length,
  volumes: {
    1: INSPIRATION_ROLE_MODELS.filter((item) => item.volume === 1).length,
    2: INSPIRATION_ROLE_MODELS.filter((item) => item.volume === 2).length,
    3: INSPIRATION_ROLE_MODELS.filter((item) => item.volume === 3).length,
  },
});
