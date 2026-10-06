#!/usr/bin/env node
/**
 * Copies the CRA production build output (frontend/build) to the repository
 * root so GitHub Pages can serve the site directly from the `main` branch
 * root (Settings > Pages > Source: main / root).
 *
 * Also copies index.html -> 404.html at the root so client-side routes
 * (React Router) don't 404 on refresh/deep-link.
 */
const fs = require("fs");
const path = require("path");

const buildDir = path.resolve(__dirname, "..", "build");
const rootDir = path.resolve(__dirname, "..", "..");

if (!fs.existsSync(buildDir)) {
  console.error(`Build directory not found: ${buildDir}. Run "npm run build" first.`);
  process.exit(1);
}

fs.cpSync(buildDir, rootDir, { recursive: true, force: true });

const indexPath = path.join(rootDir, "index.html");
const notFoundPath = path.join(rootDir, "404.html");

// Production sanitisation: the dev CSP in public/index.html allows
// http://localhost:8001 for local development. If that ships to the live
// site, visitors' browsers treat hiqanalytix.com as a public page reaching
// into their private network and show a "wants to access other apps and
// services on this device" permission prompt. Strip it from shipped HTML.
for (const htmlPath of [indexPath]) {
  const html = fs.readFileSync(htmlPath, "utf8");
  const clean = html.split(" http://localhost:8001").join("");
  if (clean !== html) {
    fs.writeFileSync(htmlPath, clean);
    console.log(`Stripped localhost connect-src from ${path.basename(htmlPath)}`);
  }
}

fs.copyFileSync(indexPath, notFoundPath);

console.log(`Copied build output to repo root: ${rootDir}`);
console.log("Created 404.html SPA fallback.");
