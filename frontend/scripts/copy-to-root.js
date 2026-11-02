#!/usr/bin/env node
/**
 * Copies the CRA production build output (frontend/build) to the repository
 * root so GitHub Pages can serve the site directly from the `main` branch
 * root (Settings > Pages > Source: main / root). Set DEPLOY_DIR to write a
 * self-contained deployment package elsewhere without changing that default.
 *
 * Also copies index.html -> 404.html at the root so client-side routes
 * (React Router) don't 404 on refresh/deep-link.
 */
const fs = require("fs");
const path = require("path");

const buildDir = path.resolve(__dirname, "..", "build");
const rootDir = process.env.DEPLOY_DIR
  ? path.resolve(__dirname, "..", process.env.DEPLOY_DIR)
  : path.resolve(__dirname, "..", "..");

if (!fs.existsSync(buildDir)) {
  console.error(`Build directory not found: ${buildDir}. Run "npm run build" first.`);
  process.exit(1);
}

fs.mkdirSync(rootDir, { recursive: true });
fs.cpSync(buildDir, rootDir, { recursive: true, force: true });

const indexPath = path.join(rootDir, "index.html");
const notFoundPath = path.join(rootDir, "404.html");
const legalPageMetadata = require("../src/components/site/legalPageMetadata.json");

const legalRoutes = Object.values(legalPageMetadata).map(
  ({ path: routePath, title, description }) => ({
    path: routePath,
    title: `${title} | HARVESTIQ LLP`,
    description,
  }),
);

const escapeAttribute = (value) =>
  value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

const replaceMeta = (html, attribute, name, content) => {
  const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(
    `<meta\\s+${attribute}="${escapedName}"\\s+content="[^"]*"\\s*\\/?>`,
  );
  const replacement = `<meta ${attribute}="${name}" content="${escapeAttribute(content)}"/>`;
  if (!pattern.test(html)) {
    throw new Error(`Could not find ${attribute}="${name}" in generated index.html`);
  }
  return html.replace(pattern, replacement);
};

const indexHtml = fs.readFileSync(indexPath, "utf8");
for (const route of legalRoutes) {
  const canonicalUrl = `https://hiqanalytix.com/${route.path}`;
  let routeHtml = indexHtml.replace(
    /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/,
    `<link rel="canonical" href="${canonicalUrl}"/>`,
  );
  if (routeHtml === indexHtml) {
    throw new Error("Could not find canonical link in generated index.html");
  }

  routeHtml = replaceMeta(routeHtml, "name", "description", route.description);
  routeHtml = replaceMeta(routeHtml, "property", "og:title", route.title);
  routeHtml = replaceMeta(routeHtml, "property", "og:description", route.description);
  routeHtml = replaceMeta(routeHtml, "property", "og:url", canonicalUrl);
  routeHtml = replaceMeta(routeHtml, "name", "twitter:title", route.title);
  routeHtml = replaceMeta(routeHtml, "name", "twitter:description", route.description);
  routeHtml = routeHtml.replace(
    /<title>[^<]*<\/title>/,
    `<title>${route.title}</title>`,
  );
  routeHtml = routeHtml.replace(/(["'])\.\/static\//g, "$1/static/");

  const routeDirectory = path.join(rootDir, route.path);
  fs.mkdirSync(routeDirectory, { recursive: true });
  fs.writeFileSync(path.join(routeDirectory, "index.html"), routeHtml);
}

// Production sanitisation: the dev CSP in public/index.html allows
// http://localhost:8001 for local development. If that ships to the live
// site, visitors' browsers treat hiqanalytix.com as a public page reaching
// into their private network and show a "wants to access other apps and
// services on this device" permission prompt. Strip it from shipped HTML.
const htmlPaths = [
  indexPath,
  ...legalRoutes.map((route) =>
    path.join(rootDir, route.path, "index.html"),
  ),
];

for (const htmlPath of htmlPaths) {
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
