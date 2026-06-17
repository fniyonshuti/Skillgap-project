import assert from "node:assert/strict";
import test from "node:test";
import { escapeRegex, parsePagination } from "../../src/shared/utils/query.js";

test("escapes user-entered regular expression characters", () => {
  assert.equal(escapeRegex("name.*(test)?"), "name\\.\\*\\(test\\)\\?");
});

test("bounds pagination values to a safe maximum", () => {
  assert.deepEqual(parsePagination({ page: "3", limit: "500" }), {
    page: 3,
    limit: 100,
    skip: 200
  });
});

test("uses pagination defaults for missing or invalid values", () => {
  assert.deepEqual(parsePagination({ page: "-2", limit: "invalid" }), {
    page: 1,
    limit: 20,
    skip: 0
  });
  assert.deepEqual(parsePagination({ page: "2pages", limit: "10items" }), {
    page: 1,
    limit: 20,
    skip: 0
  });
});
