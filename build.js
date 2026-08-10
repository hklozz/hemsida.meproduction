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

// Loads every *.json file in a folder (one file per entry, the pattern
// Decap CMS "folder collections" use — e.g. content/news/, content/team/).
// Returns [] if the folder doesn't exist yet (fine, nothing added yet).
function loadFolderJson(relDir) {
  const dirPath = path.join(ROOT, relDir);
  let files;
  try {
    files = fs.readdirSync(dirPath).filter((f) => f.endsWith(".json"));
  } catch {
    return [];
  }
  return files
    .map((f) => {
      try {
        return JSON.parse(fs.readFileSync(path.join(dirPath, f), "utf-8"));
      } catch {
        return null;
      }
    })
    .filter(Boolean);
}

function newsCardsHtml(news) {
  const sorted = [...news].sort((a, b) =>
    String(b.date || "").localeCompare(String(a.date || ""))
  );
  if (sorted.length === 0) {
    return `<p style="color:var(--gray);">Inga nyheter publicerade än.</p>`;
  }
  return sorted
    .map((item) => {
      const dateLabel = item.date
        ? new Date(item.date).toLocaleDateString("sv-SE", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })
        : "";
      return `
      <div class="news-card">
        <div class="news-img" style="background-image:url('${escapeHtml(item.image || "")}');" role="img" aria-label="${escapeHtml(item.imageAlt || item.title || "")}"></div>
        <div class="news-body">
          ${dateLabel ? `<div class="news-date">${escapeHtml(dateLabel)}</div>` : ""}
          <h3>${escapeHtml(item.title || "")}</h3>
          <p>${escapeHtml(item.text || "")}</p>
        </div>
      </div>`;
    })
    .join("\n");
}

function teamCardsHtml(team) {
  const cityLabels = {
    goteborg: "Göteborg",
    stockholm: "Stockholm",
    "goteborg stockholm": "Göteborg & Stockholm",
  };
  return team
    .map((person) => {
      const city = person.city || "goteborg";
      const cityLabel = cityLabels[city] || "Göteborg";
      return `
      <div class="team-card reveal" data-city="${escapeHtml(city)}">
        <div class="team-img" style="background-image:url('${escapeHtml(person.photo || "")}')"></div>
        <div class="team-hover-overlay"></div>
        <div class="team-info">
          <h3>${escapeHtml(person.name || "")}</h3>
          <span class="team-city">${escapeHtml(cityLabel)}</span>
          ${person.email ? `<a href="mailto:${escapeHtml(person.email)}">${escapeHtml(person.email)}</a>` : ""}
          ${person.phone ? `<span class="phone">${escapeHtml(person.phone)}</span>` : ""}
        </div>
      </div>`;
    })
    .join("\n");
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

  const news = loadFolderJson("content/news");
  const team = loadFolderJson("content/team");

  const entries = fs.readdirSync(ROOT);

  for (const entry of entries) {
    if (EXCLUDE.has(entry)) continue;
    const srcPath = path.join(ROOT, entry);
    const destPath = path.join(DIST, entry);

    if (entry.endsWith(".html")) {
      const pageId = entry.replace(/\.html$/, "");
      let html = fs.readFileSync(srcPath, "utf-8");
      const data = { seo: seoById[pageId] || {}, site };
      if (pageId === "index") {
        data.home = home;
        // Raw HTML injection (lists of cards) happens before the normal
        // escaped-token pass, since these tokens expand to markup, not text.
        // split/join instead of replace() avoids "$"-pattern surprises.
        html = html.split("{{news.cards}}").join(newsCardsHtml(news));
      }
      if (pageId === "ganget") {
        html = html.split("{{team.cards}}").join(teamCardsHtml(team));
        data.teamCount = team.length;
      }
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
