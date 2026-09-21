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
fs.copyFileSync(indexPath, notFoundPath);

console.log(`Copied build output to repo root: ${rootDir}`);
console.log("Created 404.html SPA fallback.");
