#!/usr/bin/env -S npx tsx
// Build a static website into dist/ from internal/Curriculum.md + dictionary/*.md.
// The markdown files are the only data source. There is no database.

import {
  copyFileSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { marked } from "marked";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = dirname(HERE);
const CURRICULUM = join(ROOT, "internal", "Curriculum.md");
const DICT_DIR = join(ROOT, "dictionary");
const OUT = join(ROOT, "dist");

const SITE_NAME = "AI Coding Dictionary";
const TAGLINE = "The vocabulary of AI coding, translated into plain English.";
const UPSTREAM_SITE = "https://aicodingdictionary.com";
const UPSTREAM_REPO = "https://github.com/mattpocock/dictionary-of-ai-coding";

const SECTION_RE = /^## Section (\d+) — (.+)$/;
const LINK_RE = /\[([^\]]+)\]\(\.\/([^)]+)\.md\)/g;
const USAGE_MARKER = "_Usage:_";

type Section = { number: number; title: string; entries: Entry[] };

type Entry = {
  term: string;
  slug: string;
  description: string;
  section: Section;
  position: number;
  bodyHtml: string;
  usageHtml: string;
  linksTo: Set<string>;
};

function fail(msg: string): never {
  console.error(msg);
  process.exit(1);
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Same rule as the README generator, so a term has one slug everywhere.
function slugify(term: string): string {
  return term
    .toLowerCase()
    .replace(/[^\p{L}\p{N} -]/gu, "")
    .replace(/ /g, "-");
}

function parseCurriculum(
  text: string
): { number: number; title: string; terms: string[] }[] {
  const sections: { number: number; title: string; terms: string[] }[] = [];
  text.split("\n").forEach((raw, idx) => {
    const line = raw.trimEnd();
    if (line === "") return;
    const heading = line.match(SECTION_RE);
    if (heading && heading[1] && heading[2]) {
      sections.push({
        number: Number(heading[1]),
        title: heading[2],
        terms: [],
      });
      return;
    }
    const current = sections.at(-1);
    if (line.startsWith("- ") && current) {
      current.terms.push(line.slice(2));
      return;
    }
    fail(`Curriculum.md:${idx + 1}: unexpected line: ${line}`);
  });
  return sections;
}

function parseEntryFile(term: string): { description: string; body: string } {
  const path = join(DICT_DIR, `${term}.md`);
  let raw: string;
  try {
    raw = readFileSync(path, "utf8");
  } catch {
    fail(`Curriculum.md references "${term}" but ${path} does not exist`);
  }
  if (!raw.startsWith("---\n")) fail(`${path}: missing frontmatter`);
  const end = raw.indexOf("\n---\n", 4);
  if (end === -1) fail(`${path}: unterminated frontmatter`);

  const line = raw
    .slice(4, end)
    .split("\n")
    .find((l) => l.startsWith("description:"));
  if (!line) fail(`${path}: frontmatter has no description`);
  let description = line.slice("description:".length).trim();
  if (description.startsWith('"')) {
    description = JSON.parse(description) as string;
  } else if (description.startsWith("'")) {
    description = description.slice(1, -1).replace(/''/g, "'");
  }
  if (!description) fail(`${path}: description is empty`);

  return { description, body: raw.slice(end + 5).trim() };
}

function decorate(html: string): string {
  return html
    .replace(/<table>/g, '<div class="table-wrap"><table>')
    .replace(/<\/table>/g, "</table></div>")
    .replace(
      /<a href="(https?:[^"]+)"/g,
      '<a href="$1" rel="noopener noreferrer"'
    )
    .replace(/<p><em>([^<]{1,40}:)<\/em>/g, '<p><em class="label">$1</em>');
}

function renderUsage(markdown: string): string {
  const lines = markdown
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p, i) => {
      const speaker = i % 2 === 0 ? "a" : "b";
      const html = marked.parseInline(p, { async: false });
      return `<p class="line line-${speaker}">${decorate(html)}</p>`;
    });
  if (lines.length === 0) return "";
  return `<section class="usage" aria-labelledby="usage-heading">
<h2 id="usage-heading">Usage</h2>
${lines.join("\n")}
</section>`;
}

function load(): { sections: Section[]; entries: Entry[] } {
  const parsed = parseCurriculum(readFileSync(CURRICULUM, "utf8"));
  const slugs = new Map<string, string>();
  for (const s of parsed) {
    for (const term of s.terms) {
      const slug = slugify(term);
      const clash = [...slugs].find(([, v]) => v === slug);
      if (clash) fail(`"${term}" and "${clash[0]}" share the slug "${slug}"`);
      if (slugs.has(term)) fail(`Curriculum.md: duplicate term "${term}"`);
      slugs.set(term, slug);
    }
  }

  const onDisk = readdirSync(DICT_DIR)
    .filter((n) => n.endsWith(".md"))
    .map((n) => n.slice(0, -3));
  const orphans = onDisk.filter((t) => !slugs.has(t)).sort();
  if (orphans.length)
    fail(
      `dictionary/ entries missing from Curriculum.md: ${orphans.join(", ")}`
    );

  const sections: Section[] = [];
  const entries: Entry[] = [];
  for (const s of parsed) {
    const section: Section = { number: s.number, title: s.title, entries: [] };
    sections.push(section);
    for (const term of s.terms) {
      const { description, body } = parseEntryFile(term);
      const linksTo = new Set<string>();
      const linked = body.replace(
        LINK_RE,
        (_, text: string, target: string) => {
          const name = decodeURIComponent(target);
          const slug = slugs.get(name);
          if (!slug)
            fail(`dictionary/${term}.md links to unknown entry "${name}"`);
          if (name !== term) linksTo.add(name);
          return `[${text}](/${slug})`;
        }
      );

      const markerAt = linked.indexOf(`\n${USAGE_MARKER}\n`);
      const main = markerAt === -1 ? linked : linked.slice(0, markerAt);
      const usage =
        markerAt === -1 ? "" : linked.slice(markerAt + USAGE_MARKER.length + 2);

      const entry: Entry = {
        term,
        slug: slugs.get(term) as string,
        description,
        section,
        position: entries.length + 1,
        bodyHtml: decorate(marked.parse(main, { async: false, gfm: true })),
        usageHtml: renderUsage(usage),
        linksTo,
      };
      section.entries.push(entry);
      entries.push(entry);
    }
  }
  return { sections, entries };
}

// ---------------------------------------------------------------- templates

const THEME_BOOT = `(function(){try{var t=localStorage.getItem("theme");if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch(e){}})()`;

function layout(opts: {
  title: string;
  description: string;
  nav: "curriculum" | "a-z" | null;
  termCount: number;
  main: string;
}): string {
  const fullTitle =
    opts.title === SITE_NAME ? SITE_NAME : `${opts.title} — ${SITE_NAME}`;
  const current = (key: string) =>
    opts.nav === key ? ' aria-current="page"' : "";
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(fullTitle)}</title>
<meta name="description" content="${escapeHtml(opts.description)}">
<meta property="og:title" content="${escapeHtml(fullTitle)}">
<meta property="og:description" content="${escapeHtml(opts.description)}">
<meta property="og:type" content="website">
<meta name="color-scheme" content="light dark">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<script>${THEME_BOOT}</script>
<link rel="stylesheet" href="/assets/styles.css">
<script src="/assets/app.js" defer></script>
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
<header class="site-header">
<div class="wrap header-inner">
<a class="brand" href="/">${SITE_NAME}</a>
<nav class="site-nav" aria-label="Views">
<a href="/"${current("curriculum")}>Curriculum</a>
<a href="/a-z"${current("a-z")}>A–Z</a>
</nav>
<div class="search" role="search">
<input id="search-input" type="search" placeholder="Search ${opts.termCount} terms" aria-label="Search terms" autocomplete="off" spellcheck="false" role="combobox" aria-expanded="false" aria-controls="search-results" aria-autocomplete="list">
<kbd aria-hidden="true">/</kbd>
<ul id="search-results" role="listbox" aria-label="Matching terms" hidden></ul>
</div>
<button id="theme-toggle" class="icon-button" type="button" aria-label="Switch colour theme">
<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="currentColor" d="M12 3a9 9 0 1 0 0 18Z"/><circle cx="12" cy="12" r="8.25" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>
</button>
</div>
</header>
<main id="main" class="wrap">
${opts.main}
</main>
<footer class="site-footer">
<div class="wrap">
<p>Written by Matt Pocock. This site is an unofficial build of the public
<a href="${UPSTREAM_REPO}" rel="noopener noreferrer">dictionary-of-ai-coding</a>
repository. The original lives at
<a href="${UPSTREAM_SITE}" rel="noopener noreferrer">aicodingdictionary.com</a>.</p>
</div>
</footer>
</body>
</html>
`;
}

function ordinal(n: number): string {
  return String(n).padStart(2, "0");
}

function termRow(e: Entry, showNumber: boolean): string {
  const num = showNumber
    ? `<span class="num" aria-hidden="true">${ordinal(e.position)}</span>`
    : "";
  return `<li><a href="/${e.slug}">${num}<span class="term">${escapeHtml(e.term)}</span><span class="desc">${escapeHtml(e.description)}</span></a></li>`;
}

function homePage(sections: Section[], entries: Entry[]): string {
  const jump = sections
    .map(
      (s) =>
        `<li><a href="#section-${s.number}"><span class="num" aria-hidden="true">${s.number}</span>${escapeHtml(s.title)}</a></li>`
    )
    .join("\n");
  const blocks = sections
    .map(
      (s) => `<section class="section" id="section-${s.number}">
<header class="section-head">
<p class="eyebrow">Section ${s.number}</p>
<h2>${escapeHtml(s.title)}</h2>
<p class="count">${s.entries.length} terms</p>
</header>
<ol class="term-list">
${s.entries.map((e) => termRow(e, true)).join("\n")}
</ol>
</section>`
    )
    .join("\n");

  const first = entries[0];
  return layout({
    title: SITE_NAME,
    description: TAGLINE,
    nav: "curriculum",
    termCount: entries.length,
    main: `<div class="hero">
<h1>${SITE_NAME}</h1>
<p class="lede">${TAGLINE}</p>
<p>Why does context degrade? Why is the bill so high? Why does the same prompt
behave differently from one day to the next? Each has a clean answer, once
someone tells you the words to use.</p>
<p class="hero-meta">${entries.length} terms in ${sections.length} sections, ordered so each one builds on the last.${
      first
        ? ` <a href="/${first.slug}">Start with “${escapeHtml(first.term)}”</a>.`
        : ""
    }</p>
<nav class="jump" aria-label="Sections">
<ol>
${jump}
</ol>
</nav>
</div>
${blocks}`,
  });
}

function azPage(sections: Section[], entries: Entry[]): string {
  const sorted = [...entries].sort((a, b) =>
    a.term.localeCompare(b.term, "en", { sensitivity: "base" })
  );
  const groups = new Map<string, Entry[]>();
  for (const e of sorted) {
    const letter = (e.term[0] ?? "#").toUpperCase();
    const group = groups.get(letter) ?? [];
    group.push(e);
    groups.set(letter, group);
  }
  const letters = [...groups.keys()];
  return layout({
    title: "A–Z",
    description: `All ${entries.length} terms in the ${SITE_NAME}, in alphabetical order.`,
    nav: "a-z",
    termCount: entries.length,
    main: `<div class="hero hero-compact">
<h1>A–Z</h1>
<p class="lede">All ${entries.length} terms in alphabetical order.</p>
<nav class="letters" aria-label="Letters">
${letters.map((l) => `<a href="#letter-${l}">${l}</a>`).join("")}
</nav>
</div>
${letters
  .map(
    (l) => `<section class="section letter-section" id="letter-${l}">
<header class="section-head"><h2>${l}</h2></header>
<ul class="term-list">
${(groups.get(l) ?? []).map((e) => termRow(e, false)).join("\n")}
</ul>
</section>`
  )
  .join("\n")}`,
  });
}

function sidebar(sections: Section[], current: Entry): string {
  return `<nav class="sidebar" aria-label="Curriculum">
${sections
  .map(
    (s) => `<details${s === current.section ? " open" : ""}>
<summary><span class="num" aria-hidden="true">${s.number}</span>${escapeHtml(s.title)}</summary>
<ol>
${s.entries
  .map(
    (e) =>
      `<li><a href="/${e.slug}"${e === current ? ' aria-current="page"' : ""}>${escapeHtml(e.term)}</a></li>`
  )
  .join("\n")}
</ol>
</details>`
  )
  .join("\n")}
</nav>`;
}

function entryPage(sections: Section[], entries: Entry[], e: Entry): string {
  const prev = entries[e.position - 2];
  const next = entries[e.position];
  const mentionedIn = entries.filter((o) => o.linksTo.has(e.term));

  const backlinks = mentionedIn.length
    ? `<section class="backlinks">
<h2>Mentioned in</h2>
<ul>
${mentionedIn.map((o) => `<li><a href="/${o.slug}">${escapeHtml(o.term)}</a></li>`).join("\n")}
</ul>
</section>`
    : "";

  const pager = `<nav class="pager" aria-label="Previous and next term">
${
  prev
    ? `<a class="prev" href="/${prev.slug}" rel="prev"><span class="dir">Previous</span><span class="term">${escapeHtml(prev.term)}</span></a>`
    : "<span></span>"
}
${
  next
    ? `<a class="next" href="/${next.slug}" rel="next"><span class="dir">Next</span><span class="term">${escapeHtml(next.term)}</span></a>`
    : "<span></span>"
}
</nav>`;

  return layout({
    title: e.term,
    description: e.description,
    nav: null,
    termCount: entries.length,
    main: `<div class="entry-layout">
${sidebar(sections, e)}
<article class="entry">
<p class="eyebrow"><a href="/#section-${e.section.number}">Section ${e.section.number} — ${escapeHtml(e.section.title)}</a><span class="sep" aria-hidden="true">·</span>Term ${e.position} of ${entries.length}</p>
<h1>${escapeHtml(e.term)}</h1>
<div class="prose">
${e.bodyHtml}
</div>
${e.usageHtml}
${backlinks}
${pager}
</article>
</div>`,
  });
}

function notFoundPage(entries: Entry[]): string {
  return layout({
    title: "Page not found",
    description: "This page does not exist.",
    nav: null,
    termCount: entries.length,
    main: `<div class="hero hero-compact">
<h1>Page not found</h1>
<p class="lede">There is no entry at this address.</p>
<p>Search for a term above, or browse the <a href="/">curriculum</a> or the <a href="/a-z">A–Z list</a>.</p>
</div>`,
  });
}

const FAVICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#b4441c"/><text x="32" y="45" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="38" font-weight="700" fill="#faf7f2">A</text></svg>
`;

// --------------------------------------------------------------------- main

function write(relPath: string, content: string): void {
  const path = join(OUT, relPath);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content);
}

function main(): void {
  const { sections, entries } = load();

  rmSync(OUT, { recursive: true, force: true });
  mkdirSync(join(OUT, "assets"), { recursive: true });
  copyFileSync(join(HERE, "styles.css"), join(OUT, "assets", "styles.css"));
  copyFileSync(join(HERE, "app.js"), join(OUT, "assets", "app.js"));

  write("index.html", homePage(sections, entries));
  write("a-z/index.html", azPage(sections, entries));
  write("404.html", notFoundPage(entries));
  write("favicon.svg", FAVICON);
  for (const e of entries) {
    write(`${e.slug}/index.html`, entryPage(sections, entries, e));
  }
  write(
    "search.json",
    JSON.stringify(
      entries.map((e) => ({
        t: e.term,
        s: e.slug,
        d: e.description,
        c: e.section.title,
      }))
    )
  );

  console.log(
    `Built ${entries.length} entries in ${sections.length} sections into dist/`
  );
}

main();
