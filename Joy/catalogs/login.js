
"use strict";

// ========================================
// FCA LOGIN SELECTOR
// ========================================

// Ekhane FCA package change korbe
const FCA_PACKAGE = "../system/ws3-fca/index.js";

let login;

try {
  login = require(FCA_PACKAGE);

  if (typeof login !== "function") {
    throw new TypeError(
      `${FCA_PACKAGE} does not export a login function`
    );
  }
} catch (error) {
  console.error(
    `[FCA ERROR] Failed to load ${FCA_PACKAGE}:`,
    error.message
  );
  throw error;
}

module.exports = login;
