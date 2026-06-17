import assert from "node:assert/strict";
import test from "node:test";
import {
  clearStoredAuth,
  readStoredAuth,
  writeStoredAuth
} from "../../src/utils/authStorage.js";

function createStorage(initialValues = {}) {
  const values = new Map(Object.entries(initialValues));

  return {
    getItem(key) {
      return values.get(key) ?? null;
    },
    removeItem(key) {
      values.delete(key);
    },
    setItem(key, value) {
      values.set(key, String(value));
    }
  };
}

test("reads a valid saved session", () => {
  const storage = createStorage();
  const user = { id: "user-1", role: "graduate" };

  writeStoredAuth("token-1", user, storage);

  assert.deepEqual(readStoredAuth(storage), { token: "token-1", user });
});

test("clears malformed saved user data instead of throwing", () => {
  const storage = createStorage({
    skills_gap_token: "token-1",
    skills_gap_user: "{invalid-json"
  });

  assert.deepEqual(readStoredAuth(storage), { token: null, user: null });
  assert.equal(storage.getItem("skills_gap_token"), null);
  assert.equal(storage.getItem("skills_gap_user"), null);
});

test("clears incomplete saved sessions", () => {
  const storage = createStorage({ skills_gap_token: "token-1" });

  assert.deepEqual(readStoredAuth(storage), { token: null, user: null });
  assert.equal(storage.getItem("skills_gap_token"), null);
});

test("clears both saved session values", () => {
  const storage = createStorage({
    skills_gap_token: "token-1",
    skills_gap_user: JSON.stringify({ id: "user-1" })
  });

  clearStoredAuth(storage);

  assert.equal(storage.getItem("skills_gap_token"), null);
  assert.equal(storage.getItem("skills_gap_user"), null);
});
