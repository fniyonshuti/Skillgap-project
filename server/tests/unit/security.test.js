import assert from "node:assert/strict";
import test from "node:test";
import { secretsMatch } from "../../src/shared/utils/security.js";

test("compares equal secrets without exposing direct string comparison", () => {
  assert.equal(secretsMatch("correct-secret", "correct-secret"), true);
});

test("rejects different and missing secrets", () => {
  assert.equal(secretsMatch("correct-secret", "wrong-secret"), false);
  assert.equal(secretsMatch(undefined, "correct-secret"), false);
});
