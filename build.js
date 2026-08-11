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

// Loads content/case-pages/*.json (the four detailed case-study pages:
// case-way-out-west.html etc.) and stamps each with the slug derived from
// its filename, since that's how build.js and the CMS's "next case" picker
// both identify an entry.
function loadCasePages() {
  const dirPath = path.join(ROOT, "content/case-pages");
  let files;
  try {
    files = fs.readdirSync(dirPath).filter((f) => f.endsWith(".json"));
  } catch {
    return [];
  }
  return files
    .map((f) => {
      try {
        const data = JSON.parse(fs.readFileSync(path.join(dirPath, f), "utf-8"));
        data.slug = f.replace(/\.json$/, "");
        return data;
      } catch {
        return null;
      }
    })
    .filter(Boolean);
}

function pillarsHtml(pillars) {
  return (pillars || [])
    .map(
      (p, i) => `
      <div class="pillar reveal" style="transition-delay:${(i % 3) * 0.06}s">
        <div class="pillar-num">${escapeHtml(p.num || "")}</div>
        <h3>${escapeHtml(p.title || "")}</h3>
        <p>${escapeHtml(p.desc || "")}</p>
      </div>`
    )
    .join("\n");
}

function caseRowsHtml(rows) {
  return (rows || [])
    .map((row, i) => {
      const rtl = i % 2 === 1;
      return `
      <div class="case-row"${rtl ? ' style="direction:rtl;"' : ""}>
        <div class="case-row-img" style="background-image:url('${escapeHtml(row.image || "")}');${rtl ? "direction:ltr;" : ""}"></div>
        <div class="case-row-text"${rtl ? ' style="direction:ltr;"' : ""}>
          <div class="case-row-tag">${escapeHtml(row.tag || "")}</div>
          <h3 class="reveal">${escapeHtml(row.heading || "")}</h3>
          <p class="reveal" style="transition-delay:.08s">${escapeHtml(row.paragraph || "")}</p>
        </div>
      </div>`;
    })
    .join("\n");
}

function statsHtml(stats) {
  return (stats || [])
    .map(
      (s, i) => `
      <div class="stat-item reveal" style="transition-delay:${(i * 0.08).toFixed(2)}s">
        <strong>${escapeHtml(s.value || "")}</strong>
        <span>${escapeHtml(s.label || "")}</span>
      </div>`
    )
    .join("\n");
}

function deliverablesHtml(items) {
  return (items || []).map((item) => `      <li>${escapeHtml(item)}</li>`).join("\n");
}

function galleryHtml(images) {
  return (images || [])
    .map(
      (img) =>
        `        <img loading="lazy" decoding="async" src="${escapeHtml(img.image || "")}" alt="${escapeHtml(img.alt || "")}" onerror="this.style.display='none'" />`
    )
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
  const casePages = loadCasePages();
  const casePageBySlug = Object.fromEntries(casePages.map((p) => [p.slug, p]));

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
      if (pageId.startsWith("case-")) {
        // Case-study pages (case-way-out-west.html etc.) are driven entirely
        // by content/case-pages/<slug>.json, matched by slug.
        const slug = pageId.replace(/^case-/, "");
        const page = casePageBySlug[slug] || {};
        const nextPage = page.nextSlug ? casePageBySlug[page.nextSlug] : null;
        page.nextLabel = nextPage ? `${nextPage.title} →` : "Alla case →";
        page.nextHref = nextPage ? `case-${nextPage.slug}.html` : "index.html#case";
        data.page = page;
        html = html.split("{{deliverables.html}}").join(deliverablesHtml(page.deliverables));
        html = html.split("{{gallery.html}}").join(galleryHtml(page.gallery));
      } else if (pageId === "hallbarhet") {
        data.page = loadJson("content/hallbarhet.json", {});
        html = html.split("{{pillars.html}}").join(pillarsHtml(data.page.pillars));
        html = html.split("{{caseRows.html}}").join(caseRowsHtml(data.page.caseRows));
        html = html.split("{{stats.html}}").join(statsHtml(data.page.stats));
      } else if (pageId === "goteborg" || pageId === "stockholm") {
        data.page = loadJson(`content/${pageId}.json`, {});
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
