import assert from "node:assert/strict";
import test from "node:test";
import {
  isWordOpenXmlDocument,
  matchesFileSignature,
  sanitizeOriginalFilename
} from "../../src/modules/evidence/evidenceFile.service.js";

test("recognizes supported document and image signatures", () => {
  assert.equal(matchesFileSignature("application/pdf", Buffer.from("%PDF-1.7")), true);
  assert.equal(
    matchesFileSignature(
      "image/png",
      Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
    ),
    true
  );
  assert.equal(matchesFileSignature("image/jpeg", Buffer.from([0xff, 0xd8, 0xff, 0xe0])), true);
  assert.equal(
    matchesFileSignature("image/webp", Buffer.from("RIFF1234WEBP", "ascii")),
    true
  );
});

test("rejects content that does not match the declared type", () => {
  assert.equal(matchesFileSignature("application/pdf", Buffer.from("not a pdf")), false);
  assert.equal(matchesFileSignature("image/png", Buffer.from("%PDF-1.7")), false);
});

test("distinguishes Word packages from generic ZIP archives", () => {
  const wordPackage = Buffer.from("PK\u0003\u0004[Content_Types].xml...word/document.xml");
  const genericArchive = Buffer.from("PK\u0003\u0004photos/image.png");

  assert.equal(isWordOpenXmlDocument(wordPackage), true);
  assert.equal(isWordOpenXmlDocument(genericArchive), false);
});

test("removes path fragments and control characters from original filenames", () => {
  assert.equal(sanitizeOriginalFilename("../unsafe\u0000-report.pdf"), "unsafe-report.pdf");
});
