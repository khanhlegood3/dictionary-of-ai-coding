#!/usr/bin/env -S npx tsx
// Build a static website into dist/ from internal/Curriculum.md,
// dictionary/*.md and translations/vi/*.md.
// The markdown files are the only data source. There is no database.
//
// The site is built once per language. Vietnamese is the default and lives at
// the root; English lives under /en. Both share the same terms, slugs and map.

import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { marked } from "marked";
import { layoutGraph } from "./layout";
import { BASE, LANGS, STRINGS, fill, type Lang, type Strings } from "./strings";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = dirname(HERE);
const CURRICULUM = join(ROOT, "internal", "Curriculum.md");
const DICT_DIR = join(ROOT, "dictionary");
/** Translated entries: translations/<lang>/<Term>.md, same format as dictionary/. */
const TRANSLATIONS_DIR = join(ROOT, "translations");
const SOURCE_LANG: Lang = "en";
const OUT = join(ROOT, "dist");

const AUTHOR_NAME = "Lê Xuân Khánh";
const AUTHOR_URL = "https://khanhxl.vercel.app/";

const SECTION_RE = /^## Section (\d+) — (.+)$/;
const LINK_RE = /\[([^\]]+)\]\(\.\/([^)]+)\.md\)/g;
// The marker is the same in every language, so one parser reads them all.
const USAGE_MARKER = "_Usage:_";
// Paths the site itself uses. A term may not take one of them.
const RESERVED_SLUGS = new Set(["a-z", "assets", "curriculum", "en"]);

type Section = { number: number; title: string; entries: Entry[] };

/** The text of one entry in one language. */
type EntryText = {
  /** The term's name in this language, when it has one besides the English. */
  name?: string;
  description: string;
  bodyHtml: string;
  usageHtml: string;
  /** False when the language has no translation and English is shown instead. */
  translated: boolean;
};

type Entry = {
  term: string;
  slug: string;
  section: Section;
  position: number;
  /** Terms the English entry links to. The map is the same in every language. */
  linksTo: Set<string>;
  text: Record<Lang, EntryText>;
};

/** Everything a page template needs to render in one language. */
type Site = {
  lang: Lang;
  t: Strings;
  sections: Section[];
  entries: Entry[];
};

const warnings: string[] = [];

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

/** The address of a page in a language. `path` is "/" or starts with "/". */
function url(lang: Lang, path: string): string {
  const base = BASE[lang];
  if (path === "/") return base || "/";
  if (path.startsWith("/#") || path.startsWith("/?"))
    return (base || "/") + path.slice(1);
  return base + path;
}

function sectionTitle(site: Site, s: Section): string {
  return site.t.sectionTitles[s.title] ?? s.title;
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

function parseEntryFile(path: string): {
  description: string;
  name?: string;
  body: string;
} {
  const raw = readFileSync(path, "utf8");
  if (!raw.startsWith("---\n")) fail(`${path}: missing frontmatter`);
  const end = raw.indexOf("\n---\n", 4);
  if (end === -1) fail(`${path}: unterminated frontmatter`);

  const lines = raw.slice(4, end).split("\n");
  const line = lines.find((l) => l.startsWith("description:"));
  if (!line) fail(`${path}: frontmatter has no description`);
  let description = line.slice("description:".length).trim();
  if (description.startsWith('"')) {
    description = JSON.parse(description) as string;
  } else if (description.startsWith("'")) {
    description = description.slice(1, -1).replace(/''/g, "'");
  }
  if (!description) fail(`${path}: description is empty`);

  // Optional. Translations use it to give the term a name in their language.
  const name = lines
    .find((l) => l.startsWith("name:"))
    ?.slice("name:".length)
    .trim()
    .replace(/^(["'])(.*)\1$/, "$2");

  return {
    description,
    name: name || undefined,
    body: raw.slice(end + 5).trim(),
  };
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

function renderUsage(markdown: string, heading: string): string {
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
<h2 id="usage-heading">${escapeHtml(heading)}</h2>
${lines.join("\n")}
</section>`;
}

/**
 * Turn one entry file into HTML for the pages of `lang`.
 * Links between entries become links to that language's pages.
 */
function renderEntryText(
  path: string,
  label: string,
  term: string,
  slugs: Map<string, string>,
  lang: Lang
): EntryText & { linksTo: Set<string> } {
  const { description, name, body } = parseEntryFile(path);
  const linksTo = new Set<string>();
  const linked = body.replace(LINK_RE, (_, text: string, target: string) => {
    const name = decodeURIComponent(target);
    const slug = slugs.get(name);
    if (!slug) fail(`${label} links to unknown entry "${name}"`);
    if (name !== term) linksTo.add(name);
    return `[${text}](${url(lang, `/${slug}`)})`;
  });

  const markerAt = linked.indexOf(`\n${USAGE_MARKER}\n`);
  const main = markerAt === -1 ? linked : linked.slice(0, markerAt);
  const usage =
    markerAt === -1 ? "" : linked.slice(markerAt + USAGE_MARKER.length + 2);

  return {
    name,
    description,
    bodyHtml: decorate(marked.parse(main, { async: false, gfm: true })),
    usageHtml: renderUsage(usage, STRINGS[lang].usage),
    translated: true,
    linksTo,
  };
}

function load(): { sections: Section[]; entries: Entry[] } {
  const parsed = parseCurriculum(readFileSync(CURRICULUM, "utf8"));
  const slugs = new Map<string, string>();
  for (const s of parsed) {
    for (const term of s.terms) {
      const slug = slugify(term);
      const clash = [...slugs].find(([, v]) => v === slug);
      if (clash) fail(`"${term}" and "${clash[0]}" share the slug "${slug}"`);
      if (RESERVED_SLUGS.has(slug))
        fail(`"${term}" would be published at /${slug}, which is a site page`);
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
  const missing: Record<string, string[]> = {};
  for (const s of parsed) {
    const section: Section = { number: s.number, title: s.title, entries: [] };
    sections.push(section);
    for (const term of s.terms) {
      const sourcePath = join(DICT_DIR, `${term}.md`);
      if (!existsSync(sourcePath))
        fail(
          `Curriculum.md references "${term}" but ${sourcePath} does not exist`
        );
      const sourceLabel = `dictionary/${term}.md`;
      const source = renderEntryText(
        sourcePath,
        sourceLabel,
        term,
        slugs,
        SOURCE_LANG
      );

      const text = {} as Record<Lang, EntryText>;
      for (const lang of LANGS) {
        if (lang === SOURCE_LANG) {
          text[lang] = source;
          continue;
        }
        const path = join(TRANSLATIONS_DIR, lang, `${term}.md`);
        const label = `translations/${lang}/${term}.md`;
        if (!existsSync(path)) {
          // No translation yet: show the English text on this language's pages.
          (missing[lang] ??= []).push(term);
          text[lang] = {
            ...renderEntryText(sourcePath, sourceLabel, term, slugs, lang),
            translated: false,
          };
          continue;
        }
        const translated = renderEntryText(path, label, term, slugs, lang);
        const lost = [...source.linksTo].filter(
          (t) => !translated.linksTo.has(t)
        );
        const extra = [...translated.linksTo].filter(
          (t) => !source.linksTo.has(t)
        );
        if (lost.length || extra.length)
          warnings.push(
            `${label}: links differ from the English entry` +
              (lost.length ? `; missing: ${lost.join(", ")}` : "") +
              (extra.length ? `; extra: ${extra.join(", ")}` : "")
          );
        if (Boolean(translated.usageHtml) !== Boolean(source.usageHtml))
          warnings.push(`${label}: the Usage section does not match English`);
        text[lang] = translated;
      }

      const entry: Entry = {
        term,
        slug: slugs.get(term) as string,
        section,
        position: entries.length + 1,
        linksTo: source.linksTo,
        text,
      };
      section.entries.push(entry);
      entries.push(entry);
    }
  }

  for (const lang of LANGS) {
    if (lang === SOURCE_LANG) continue;
    const list = missing[lang] ?? [];
    if (list.length)
      warnings.push(
        `${list.length} entries have no "${lang}" translation and are shown in English: ${list.join(", ")}`
      );
    const dir = join(TRANSLATIONS_DIR, lang);
    if (!existsSync(dir)) continue;
    const stray = readdirSync(dir)
      .filter((n) => n.endsWith(".md"))
      .map((n) => n.slice(0, -3))
      .filter((t) => !slugs.has(t))
      .sort();
    if (stray.length)
      warnings.push(
        `translations/${lang}/ has files for terms that no longer exist: ${stray.join(", ")}`
      );
    for (const s of sections) {
      if (!(s.title in STRINGS[lang].sectionTitles))
        warnings.push(
          `Section "${s.title}" has no "${lang}" title in site/strings.ts`
        );
    }
  }

  return { sections, entries };
}

// ---------------------------------------------------------------- templates

const THEME_BOOT = `(function(){try{var t=localStorage.getItem("theme");if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch(e){}})()`;

function credit(site: Site): string {
  return fill(escapeHtml(site.t.credit), {
    name: `<a href="${AUTHOR_URL}" rel="noopener">${AUTHOR_NAME}</a>`,
  });
}

/** Turn "{key}words{/key}" in a string into a link to `href`. */
function linkify(text: string, links: Record<string, string>): string {
  const values: Record<string, string> = {};
  for (const [key, href] of Object.entries(links)) {
    values[key] = `<a href="${href}">`;
    values[`/${key}`] = "</a>";
  }
  return fill(escapeHtml(text), values);
}

// Each language links to the same page in the other language.
function languageToggle(site: Site, path: string): string {
  const links = LANGS.map((lang) => {
    const t = STRINGS[lang];
    const current = lang === site.lang ? ' aria-current="true"' : "";
    return `<a href="${url(lang, path)}" lang="${lang}" hreflang="${lang}" aria-label="${escapeHtml(t.languageName)}" title="${escapeHtml(t.languageName)}"${current}>${t.languageCode}</a>`;
  });
  return `<div class="lang-toggle" id="lang-toggle" role="group" aria-label="${escapeHtml(site.t.languageToggle)}">
${links.join("\n")}
</div>`;
}

function layout(
  site: Site,
  opts: {
    title: string;
    description: string;
    /** Address of this page without the language prefix, such as "/a-z". */
    path: string;
    nav: "map" | "curriculum" | "a-z" | null;
    main: string;
    /** The map page fills the viewport and loads the graph script. */
    variant?: "map";
  }
): string {
  const { lang, t } = site;
  const isMap = opts.variant === "map";
  const fullTitle =
    opts.title === t.siteName ? t.siteName : `${opts.title} — ${t.siteName}`;
  const current = (key: string) =>
    opts.nav === key ? ' aria-current="page"' : "";
  return `<!doctype html>
<html lang="${lang}" data-base="${BASE[lang]}">
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
<script src="/assets/app.js" defer></script>${
    isMap ? '\n<script src="/assets/graph.js" defer></script>' : ""
  }
</head>
<body${isMap ? ' class="page-map"' : ""}>
<a class="skip" href="#main">${escapeHtml(t.skip)}</a>
<header class="site-header">
<div class="wrap header-inner">
<a class="brand" href="${url(lang, "/")}">${escapeHtml(t.siteName)}</a>
<nav class="site-nav" aria-label="${escapeHtml(t.navLabel)}">
<a href="${url(lang, "/")}"${current("map")}>${escapeHtml(t.navMap)}</a>
<a href="${url(lang, "/curriculum")}"${current("curriculum")}>${escapeHtml(t.navCurriculum)}</a>
<a href="${url(lang, "/a-z")}"${current("a-z")}>${escapeHtml(t.navAz)}</a>
</nav>
<div class="search" role="search">
<input id="search-input" type="search" placeholder="${escapeHtml(fill(t.searchPlaceholder, { count: site.entries.length }))}" aria-label="${escapeHtml(t.searchLabel)}" data-no-match="${escapeHtml(t.searchNoMatch)}" data-error="${escapeHtml(t.searchError)}" autocomplete="off" spellcheck="false" role="combobox" aria-expanded="false" aria-controls="search-results" aria-autocomplete="list">
<kbd aria-hidden="true">/</kbd>
<ul id="search-results" role="listbox" aria-label="${escapeHtml(t.searchResults)}" hidden></ul>
</div>
${languageToggle(site, opts.path)}
<button id="theme-toggle" class="icon-button" type="button" aria-label="${escapeHtml(t.themeToggle)}">
<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="currentColor" d="M12 3a9 9 0 1 0 0 18Z"/><circle cx="12" cy="12" r="8.25" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>
</button>
</div>
</header>
<main id="main"${isMap ? "" : ' class="wrap"'}>
${opts.main}
</main>${
    isMap
      ? ""
      : `
<footer class="site-footer">
<div class="wrap">
<p>${credit(site)}</p>
</div>
</footer>`
  }
</body>
</html>
`;
}

function ordinal(n: number): string {
  return String(n).padStart(2, "0");
}

function termRow(site: Site, e: Entry, showNumber: boolean): string {
  const num = showNumber
    ? `<span class="num" aria-hidden="true">${ordinal(e.position)}</span>`
    : "";
  return `<li><a href="${url(site.lang, `/${e.slug}`)}">${num}<span class="term">${escapeHtml(e.term)}</span><span class="desc">${escapeHtml(e.text[site.lang].description)}</span></a></li>`;
}

function curriculumPage(site: Site): string {
  const { lang, t, sections, entries } = site;
  const jump = sections
    .map(
      (s) =>
        `<li><a href="#section-${s.number}"><span class="num" aria-hidden="true">${s.number}</span>${escapeHtml(sectionTitle(site, s))}</a></li>`
    )
    .join("\n");
  const blocks = sections
    .map(
      (s) => `<section class="section" id="section-${s.number}">
<header class="section-head">
<p class="eyebrow">${escapeHtml(fill(t.section, { n: s.number }))}</p>
<h2>${escapeHtml(sectionTitle(site, s))}</h2>
<p class="count">${escapeHtml(fill(t.termCount, { count: s.entries.length }))}</p>
</header>
<ol class="term-list">
${s.entries.map((e) => termRow(site, e, true)).join("\n")}
</ol>
</section>`
    )
    .join("\n");

  const first = entries[0];
  return layout(site, {
    title: t.curriculumTitle,
    description: fill(t.curriculumDescription, {
      count: entries.length,
      site: t.siteName,
    }),
    path: "/curriculum",
    nav: "curriculum",
    main: `<div class="hero">
<h1>${escapeHtml(t.curriculumTitle)}</h1>
<p class="lede">${escapeHtml(t.tagline)}</p>
<p>${escapeHtml(t.curriculumIntro)}</p>
<p class="hero-meta">${escapeHtml(fill(t.curriculumMeta, { count: entries.length, sections: sections.length }))}${
      first
        ? ` <a href="${url(lang, `/${first.slug}`)}">${escapeHtml(fill(t.curriculumStart, { term: first.term }))}</a>.`
        : ""
    }</p>
<nav class="jump" aria-label="${escapeHtml(t.sectionsLabel)}">
<ol>
${jump}
</ol>
</nav>
</div>
${blocks}`,
  });
}

// The undirected links between entries: one pair per two linked terms.
function linkPairs(entries: Entry[]): [number, number][] {
  const index = new Map(entries.map((e, i) => [e.term, i]));
  const seen = new Set<string>();
  const pairs: [number, number][] = [];
  entries.forEach((e, i) => {
    for (const target of e.linksTo) {
      const j = index.get(target);
      if (j === undefined || j === i) continue;
      const key = i < j ? `${i}-${j}` : `${j}-${i}`;
      if (seen.has(key)) continue;
      seen.add(key);
      pairs.push(i < j ? [i, j] : [j, i]);
    }
  });
  return pairs;
}

/** The entry text as shown on a page of this language. */
function entryHtml(site: Site, e: Entry): string {
  const text = e.text[site.lang];
  const name = text.name
    ? `<p class="term-alt">${escapeHtml(text.name)}</p>\n`
    : "";
  const html = `${name}<div class="prose">
${text.bodyHtml}
</div>
${text.usageHtml}`;
  if (text.translated) return html;
  return `<p class="notice">${escapeHtml(site.t.notTranslated)}</p>
<div lang="${SOURCE_LANG}">
${html}
</div>`;
}

function graphData(site: Site): string {
  const { sections, entries } = site;
  const index = new Map(entries.map((e, i) => [e.term, i]));
  const positions = layoutGraph(
    entries.length,
    linkPairs(entries),
    entries.map((e) => e.section.number)
  );
  return JSON.stringify({
    ui: { eyebrow: site.t.panelEyebrow },
    sections: sections.map((s) => ({
      n: s.number,
      t: sectionTitle(site, s),
    })),
    nodes: entries.map((e, i) => ({
      s: e.slug,
      t: e.term,
      a: e.text[site.lang].name,
      d: e.text[site.lang].description,
      c: e.section.number,
      p: positions[i],
      // Indexes of the entries this one links to.
      l: [...e.linksTo].map((t) => index.get(t)).filter((n) => n !== undefined),
      h: entryHtml(site, e),
    })),
  });
}

function mapPage(site: Site): string {
  const { lang, t, entries } = site;
  const links = linkPairs(entries).length;
  const label = (text: string) => escapeHtml(text);
  return layout(site, {
    title: t.siteName,
    description: t.tagline,
    path: "/",
    nav: "map",
    variant: "map",
    main: `<div id="graph-stage" class="graph-stage">
<canvas id="graph-canvas" class="graph-canvas" tabindex="0" role="img" aria-label="${label(fill(t.mapLabel, { count: entries.length }))}"></canvas>
<div class="graph-intro" id="graph-intro">
<h1>${escapeHtml(t.siteName)}</h1>
<p class="lede">${escapeHtml(t.tagline)}</p>
<p class="graph-hint">${escapeHtml(fill(t.mapHint, { count: entries.length, links }))}</p>
<p class="graph-credit">${credit(site)}</p>
</div>
<p class="graph-status" id="graph-status" role="status" data-error="${label(t.mapError)}"><span id="graph-status-text">${escapeHtml(t.mapLoading)}</span> ${linkify(t.mapFallback, { link: url(lang, "/curriculum") })}</p>
<div class="graph-controls" role="group" aria-label="${label(t.mapControls)}">
<button type="button" class="icon-button" id="graph-zoom-in" aria-label="${label(t.zoomIn)}"><svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M12 5v14M5 12h14" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/></svg></button>
<button type="button" class="icon-button" id="graph-zoom-out" aria-label="${label(t.zoomOut)}"><svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M5 12h14" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/></svg></button>
<button type="button" class="icon-button" id="graph-reset" aria-label="${label(t.resetView)}"><svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M4 12a8 8 0 1 0 2.6-5.9M4 4v4.5h4.5" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
</div>
<aside id="term-panel" class="term-panel" aria-labelledby="term-panel-title" hidden>
<header class="term-panel-head">
<p class="eyebrow" id="term-panel-eyebrow"></p>
<button type="button" class="icon-button" id="term-panel-close" aria-label="${label(t.closeTerm)}"><svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/></svg></button>
</header>
<div class="term-panel-body" id="term-panel-body">
<h2 id="term-panel-title" tabindex="-1"></h2>
<div id="term-panel-content"></div>
<section class="backlinks" id="term-panel-related-section">
<h2>${escapeHtml(t.relatedTerms)}</h2>
<ul id="term-panel-related"></ul>
</section>
<p class="term-panel-more"><a id="term-panel-page" href="${url(lang, "/")}">${escapeHtml(t.openAsPage)}</a></p>
</div>
<nav class="pager term-panel-pager" aria-label="${label(t.pagerLabel)}">
<a class="prev" id="term-panel-prev" href="${url(lang, "/")}" rel="prev"><span class="dir">${escapeHtml(t.previous)}</span><span class="term"></span></a>
<a class="next" id="term-panel-next" href="${url(lang, "/")}" rel="next"><span class="dir">${escapeHtml(t.next)}</span><span class="term"></span></a>
</nav>
</aside>
</div>`,
  });
}

function azPage(site: Site): string {
  const { t, entries } = site;
  // Terms are English words in every language, so they sort as English.
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
  return layout(site, {
    title: t.navAz,
    description: fill(t.azDescription, {
      count: entries.length,
      site: t.siteName,
    }),
    path: "/a-z",
    nav: "a-z",
    main: `<div class="hero hero-compact">
<h1>${escapeHtml(t.navAz)}</h1>
<p class="lede">${escapeHtml(fill(t.azLede, { count: entries.length }))}</p>
<nav class="letters" aria-label="${escapeHtml(t.lettersLabel)}">
${letters.map((l) => `<a href="#letter-${l}">${l}</a>`).join("")}
</nav>
</div>
${letters
  .map(
    (l) => `<section class="section letter-section" id="letter-${l}">
<header class="section-head"><h2>${l}</h2></header>
<ul class="term-list">
${(groups.get(l) ?? []).map((e) => termRow(site, e, false)).join("\n")}
</ul>
</section>`
  )
  .join("\n")}`,
  });
}

function sidebar(site: Site, current: Entry): string {
  return `<nav class="sidebar" aria-label="${escapeHtml(site.t.curriculumTitle)}">
${site.sections
  .map(
    (s) => `<details${s === current.section ? " open" : ""}>
<summary><span class="num" aria-hidden="true">${s.number}</span>${escapeHtml(sectionTitle(site, s))}</summary>
<ol>
${s.entries
  .map(
    (e) =>
      `<li><a href="${url(site.lang, `/${e.slug}`)}"${e === current ? ' aria-current="page"' : ""}>${escapeHtml(e.term)}</a></li>`
  )
  .join("\n")}
</ol>
</details>`
  )
  .join("\n")}
</nav>`;
}

function entryPage(site: Site, e: Entry): string {
  const { lang, t, entries } = site;
  const prev = entries[e.position - 2];
  const next = entries[e.position];
  const mentionedIn = entries.filter((o) => o.linksTo.has(e.term));

  const backlinks = mentionedIn.length
    ? `<section class="backlinks">
<h2>${escapeHtml(t.mentionedIn)}</h2>
<ul>
${mentionedIn.map((o) => `<li><a href="${url(lang, `/${o.slug}`)}">${escapeHtml(o.term)}</a></li>`).join("\n")}
</ul>
</section>`
    : "";

  const pager = `<nav class="pager" aria-label="${escapeHtml(t.pagerLabel)}">
${
  prev
    ? `<a class="prev" href="${url(lang, `/${prev.slug}`)}" rel="prev"><span class="dir">${escapeHtml(t.previous)}</span><span class="term">${escapeHtml(prev.term)}</span></a>`
    : "<span></span>"
}
${
  next
    ? `<a class="next" href="${url(lang, `/${next.slug}`)}" rel="next"><span class="dir">${escapeHtml(t.next)}</span><span class="term">${escapeHtml(next.term)}</span></a>`
    : "<span></span>"
}
</nav>`;

  const sep = '<span class="sep" aria-hidden="true">·</span>';
  return layout(site, {
    title: e.term,
    description: e.text[lang].description,
    path: `/${e.slug}`,
    nav: null,
    main: `<div class="entry-layout">
${sidebar(site, e)}
<article class="entry">
<p class="eyebrow"><a href="${url(lang, `/curriculum#section-${e.section.number}`)}">${escapeHtml(fill(t.section, { n: e.section.number }))} — ${escapeHtml(sectionTitle(site, e.section))}</a>${sep}${escapeHtml(fill(t.termOf, { i: e.position, total: entries.length }))}${sep}<a href="${url(lang, `/?term=${e.slug}`)}">${escapeHtml(t.viewInMap)}</a></p>
<h1>${escapeHtml(e.term)}</h1>
${entryHtml(site, e)}
${backlinks}
${pager}
</article>
</div>`,
  });
}

function notFoundHelp(site: Site): string {
  return linkify(site.t.notFoundHelp, {
    map: url(site.lang, "/"),
    curriculum: url(site.lang, "/curriculum"),
    az: url(site.lang, "/a-z"),
  });
}

// One page answers every unknown address, whatever its language prefix, so it
// carries the help text in every language.
function notFoundPage(site: Site, others: Site[]): string {
  const { t } = site;
  return layout(site, {
    title: t.notFoundTitle,
    description: t.notFoundDescription,
    path: "/",
    nav: null,
    main: `<div class="hero hero-compact">
<h1>${escapeHtml(t.notFoundTitle)}</h1>
<p class="lede">${escapeHtml(t.notFoundLede)}</p>
<p>${notFoundHelp(site)}</p>
${others
  .map(
    (other) =>
      `<p lang="${other.lang}">${escapeHtml(other.t.notFoundLede)} ${notFoundHelp(other)}</p>`
  )
  .join("\n")}
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
  const sites: Site[] = LANGS.map((lang) => ({
    lang,
    t: STRINGS[lang],
    sections,
    entries,
  }));

  rmSync(OUT, { recursive: true, force: true });
  mkdirSync(join(OUT, "assets"), { recursive: true });
  copyFileSync(join(HERE, "styles.css"), join(OUT, "assets", "styles.css"));
  copyFileSync(join(HERE, "app.js"), join(OUT, "assets", "app.js"));
  copyFileSync(join(HERE, "graph.js"), join(OUT, "assets", "graph.js"));
  write("favicon.svg", FAVICON);

  for (const site of sites) {
    // "" for the default language, "en/" for English.
    const dir = BASE[site.lang].replace(/^\//, "");
    const at = (path: string) => (dir ? `${dir}/${path}` : path);

    write(at("index.html"), mapPage(site));
    write(at("graph.json"), graphData(site));
    write(at("curriculum/index.html"), curriculumPage(site));
    write(at("a-z/index.html"), azPage(site));
    for (const e of entries) {
      write(at(`${e.slug}/index.html`), entryPage(site, e));
    }
    write(
      at("search.json"),
      JSON.stringify(
        entries.map((e) => ({
          t: e.term,
          a: e.text[site.lang].name,
          s: e.slug,
          d: e.text[site.lang].description,
        }))
      )
    );
  }

  const [first, ...rest] = sites;
  if (first) write("404.html", notFoundPage(first, rest));

  for (const w of warnings) console.warn(`warning: ${w}`);
  console.log(
    `Built ${entries.length} entries in ${sections.length} sections, in ${LANGS.length} languages (${LANGS.join(", ")}), into dist/`
  );
}

main();
