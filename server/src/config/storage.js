/**
 * @fileoverview Filesystem locations used by server-side storage adapters.
 */

import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const currentDirectory = dirname(fileURLToPath(import.meta.url));

export const evidenceUploadDirectory = resolve(currentDirectory, "../../uploads/evidence");
