import assert from "node:assert/strict";
import test from "node:test";

process.env.NODE_ENV = "production";
process.env.JWT_SECRET = "cors-test-secret";
process.env.CLIENT_URLS =
  "https://primary.example.com, https://secondary.example.com/";

const { isAllowedOrigin } = await import("../src/app.js");

test("allows configured frontend origins", () => {
  assert.equal(isAllowedOrigin("https://primary.example.com"), true);
  assert.equal(isAllowedOrigin("https://secondary.example.com"), true);
});

test("allows HTTPS Vercel deployment origins in production", () => {
  assert.equal(isAllowedOrigin("https://skill-gap-analysis.vercel.app"), true);
});

test("rejects unrelated and insecure browser origins", () => {
  assert.equal(isAllowedOrigin("https://untrusted.example.com"), false);
  assert.equal(isAllowedOrigin("http://skill-gap-analysis.vercel.app"), false);
});

test("allows requests without a browser origin", () => {
  assert.equal(isAllowedOrigin(undefined), true);
});
