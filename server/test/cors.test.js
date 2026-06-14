import assert from "node:assert/strict";
import test from "node:test";

const { isAllowedOrigin } = await import("../src/config/cors.js");
const allowedOrigins = [
  "https://primary.example.com",
  "https://secondary.example.com"
];

test("allows configured frontend origins", () => {
  assert.equal(isAllowedOrigin("https://primary.example.com", allowedOrigins), true);
  assert.equal(isAllowedOrigin("https://secondary.example.com/", allowedOrigins), true);
});

test("rejects unrelated and insecure browser origins", () => {
  assert.equal(isAllowedOrigin("https://untrusted.example.com", allowedOrigins), false);
  assert.equal(isAllowedOrigin("http://primary.example.com", allowedOrigins), false);
});

test("allows requests without a browser origin", () => {
  assert.equal(isAllowedOrigin(undefined, allowedOrigins), true);
});
