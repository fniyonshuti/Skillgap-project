/**
 * @fileoverview Trusted MongoDB operators constructed exclusively by server code.
 *
 * Mongoose filter sanitization protects scalar request values from operator
 * injection. These helpers explicitly mark the small set of operators the
 * application itself creates after request validation.
 */

import mongoose from "mongoose";

export function trustedExists(value) {
  return mongoose.trusted({ $exists: value });
}

export function trustedIn(values) {
  return mongoose.trusted({ $in: values });
}

export function trustedNotEqual(value) {
  return mongoose.trusted({ $ne: value });
}
