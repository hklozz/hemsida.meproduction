#!/usr/bin/env node
// Static site build script.
//
// Reads editable content from content/*.json (edited via the Decap CMS
// admin UI at /admin, which commits straight to these files) and injects
// it into the {{token}} placeholders in the HTML templates, then writes
// the finished, plain HTML pages to dist/. Everything else (CSS, images,
// robots.txt, sitemap.xml, _redirects, the /admin UI itself) is copied
// through unchanged. No framework, no client-side rendering — search
// engines see fully baked HTML, same as before this pipeline existed.

const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const DIST = path.join(ROOT, "dist");

// Files/dirs at the project root that should NOT be copied into dist/.
const EXCLUDE = new Set([
  "dist",
  "content",
  "node_modules",
  ".git",
  ".github",
  "build.js",
  "package.json",
  "package-lock.json",
  ".gitignore",
  "netlify.toml",
  ".DS_Store",
]);

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function getPath(obj, tokenPath) {
  const parts = tokenPath.split(".");
  let current = obj;
  for (const part of parts) {
    if (current == null) return undefined;
    current = current[/^\d+$/.test(part) ? Number(part) : part];
  }
  return current;
}

function renderTemplate(html, data) {
  return html.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (match, tokenPath) => {
    const value = getPath(data, tokenPath);
    if (value === undefined) {
      console.warn(`  ! Missing content for token: {{${tokenPath}}}`);
      return match;
    }
    return escapeHtml(value);
  });
}

function loadJson(relPath, fallback) {
  const filePath = path.join(ROOT, relPath);
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch {
    return fallback;
  }
}

function copyRecursive(src, dest) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });
    for (const entry of fs.readdirSync(src)) {
      copyRecursive(path.join(src, entry), path.join(dest, entry));
    }
  } else {
    fs.copyFileSync(src, dest);
  }
}

function main() {
  fs.rmSync(DIST, { recursive: true, force: true });
  fs.mkdirSync(DIST, { recursive: true });

  const home = loadJson("content/home.json", {});
  const site = loadJson("content/site.json", {});
  const seo = loadJson("content/seo.json", { pages: [] });
  const seoById = Object.fromEntries((seo.pages || []).map((p) => [p.id, p]));

  const entries = fs.readdirSync(ROOT);

  for (const entry of entries) {
    if (EXCLUDE.has(entry)) continue;
    const srcPath = path.join(ROOT, entry);
    const destPath = path.join(DIST, entry);

    if (entry.endsWith(".html")) {
      const pageId = entry.replace(/\.html$/, "");
      const html = fs.readFileSync(srcPath, "utf-8");
      const data = { seo: seoById[pageId] || {}, site };
      if (pageId === "index") data.home = home;
      console.log(`Building ${entry} (page id: ${pageId})`);
      const rendered = renderTemplate(html, data);
      fs.writeFileSync(destPath, rendered, "utf-8");
    } else {
      copyRecursive(srcPath, destPath);
    }
  }

  console.log(`\nBuild complete → ${path.relative(ROOT, DIST)}/`);
}

main();
