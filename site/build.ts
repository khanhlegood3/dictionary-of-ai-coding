#!/usr/bin/env -S npx tsx
// Build a static website into dist/ from internal/Curriculum.md,
// dictionary/*.md and translations/vi/*.md.
// The markdown files are the only data source. There is no database.
// The tasks page also reads internal/adr/*.md, and the build saves a copy of
// the repository's GitHub issues in it when GitHub can be reached.
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
import {
  BASE,
  LANGS,
  STRINGS,
  fill,
  type AdrStatus,
  type Lang,
  type Strings,
} from "./strings";
import { SYNC } from "./sync";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = dirname(HERE);
const CURRICULUM = join(ROOT, "internal", "Curriculum.md");
const DICT_DIR = join(ROOT, "dictionary");
/** Translated entries: translations/<lang>/<Term>.md, same format as dictionary/. */
const TRANSLATIONS_DIR = join(ROOT, "translations");
const SOURCE_LANG: Lang = "en";
const OUT = join(ROOT, "dist");
const ADR_DIR = join(ROOT, "internal", "adr");
/** The GitHub repository whose issues and decision records /tasks shows. */
const REPO = "khanhlegood3/dictionary-of-ai-coding";
const REPO_URL = `https://github.com/${REPO}`;

const AUTHOR_NAME = "Lê Xuân Khánh";
const AUTHOR_URL = "https://khanhxl.vercel.app/";

// The Learn view is set in JetBrains Mono (SIL Open Font License 1.1). The
// build copies the subsets the two languages need out of the npm package.
const FONT_DIR = join(
  ROOT,
  "node_modules",
  "@fontsource-variable",
  "jetbrains-mono",
  "files"
);
// The Supabase client, served from this site and loaded only for sign-in.
const SUPABASE_DIR = join(ROOT, "node_modules", "@supabase", "supabase-js");
const SUPABASE_FILE = "supabase-js.js";
const FONT_FILES = ["latin", "latin-ext", "vietnamese"].map(
  (subset) => `jetbrains-mono-${subset}-wght-normal.woff2`
);

const SECTION_RE = /^## Section (\d+) — (.+)$/;
const LINK_RE = /\[([^\]]+)\]\(\.\/([^)]+)\.md\)/g;
// The marker is the same in every language, so one parser reads them all.
const USAGE_MARKER = "_Usage:_";
// Paths the site itself uses. A term may not take one of them.
const RESERVED_SLUGS = new Set([
  "a-z",
  "assets",
  "curriculum",
  "en",
  "learn",
  "tasks",
]);

type Section = { number: number; title: string; entries: Entry[] };

/** The text of one entry in one language. */
type EntryText = {
  /** The term's name in this language, when it has one besides the English. */
  name?: string;
  description: string;
  bodyHtml: string;
  usageHtml: string;
  /** The body again, one piece of HTML per paragraph, list or table. */
  blocks: string[];
  /** The lines of the usage dialogue, as inline HTML. */
  usageLines: string[];
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

/** The lines of a usage dialogue, as inline HTML. Speakers alternate. */
function usageLines(markdown: string): string[] {
  return markdown
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => decorate(marked.parseInline(p, { async: false })));
}

function renderUsage(lines: string[], heading: string): string {
  if (lines.length === 0) return "";
  return `<section class="usage" aria-labelledby="usage-heading">
<h2 id="usage-heading">${escapeHtml(heading)}</h2>
${lines
  .map(
    (html, i) => `<p class="line line-${i % 2 === 0 ? "a" : "b"}">${html}</p>`
  )
  .join("\n")}
</section>`;
}

/** Entry markdown as separate blocks, for the step-by-step Learn view. */
function renderBlocks(markdown: string): string[] {
  return marked
    .lexer(markdown, { gfm: true })
    .filter((token) => token.type !== "space")
    .map((token) =>
      decorate(marked.parser([token], { async: false, gfm: true })).trim()
    );
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

  const lines = usageLines(usage);
  return {
    name,
    description,
    bodyHtml: decorate(marked.parse(main, { async: false, gfm: true })),
    usageHtml: renderUsage(lines, STRINGS[lang].usage),
    blocks: renderBlocks(main),
    usageLines: lines,
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

// The site name with "AI Coding" marked, so a page can highlight those words.
function brand(site: Site): string {
  return escapeHtml(site.t.siteName).replace(
    "AI Coding",
    '<span class="brand-mark">AI Coding</span>'
  );
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
    nav: "map" | "learn" | "curriculum" | "a-z" | null;
    main: string;
    /**
     * The map and Learn pages fill the viewport, load their own script and
     * have no footer.
     */
    variant?: "map" | "learn" | "tasks";
  }
): string {
  const { lang, t } = site;
  const isMap = opts.variant === "map";
  const isLearn = opts.variant === "learn";
  const isTasks = opts.variant === "tasks";
  const isApp = isMap || isLearn;
  const assets = isMap
    ? '\n<script src="/assets/graph.js" defer></script>'
    : isLearn
      ? `
<link rel="preload" href="/assets/fonts/${FONT_FILES[0]}" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/assets/learn.css">
<script src="/assets/learn-store.js" defer></script>
<script src="/assets/learn.js" defer></script>`
      : isTasks
        ? `
<link rel="stylesheet" href="/assets/tasks.css">
<script src="/assets/tasks.js" defer></script>`
        : "";
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
<script src="/assets/app.js" defer></script>${assets}
</head>
<body${isMap ? ' class="page-map"' : isLearn ? ' class="page-learn"' : isTasks ? ' class="page-tasks"' : ""}>
<a class="skip" href="#main">${escapeHtml(t.skip)}</a>
<header class="site-header">
<div class="wrap header-inner">
<a class="brand" href="${url(lang, "/")}">${brand(site)}</a>
<nav class="site-nav" aria-label="${escapeHtml(t.navLabel)}">
<a href="${url(lang, "/")}"${current("map")}>${escapeHtml(t.navMap)}</a>
<a href="${url(lang, "/learn")}"${current("learn")}>${escapeHtml(t.navLearn)}</a>
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
<main id="main"${isApp ? "" : ' class="wrap"'}>
${opts.main}
</main>${
    isApp
      ? ""
      : `
<footer class="site-footer">
<div class="wrap footer-inner">
<p>${credit(site)}</p>
<p><a href="${url(lang, "/tasks")}"${isTasks ? ' aria-current="page"' : ""}>${escapeHtml(t.tasksNav)}</a></p>
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
<div class="term-panel-top">
<p class="eyebrow" id="term-panel-eyebrow"></p>
<p class="eyebrow term-panel-links"><a id="term-panel-learn" href="${url(lang, "/learn")}">${escapeHtml(t.learnTitle)}</a><span class="sep" aria-hidden="true">·</span><a id="term-panel-page" href="${url(lang, "/")}">${escapeHtml(t.openAsPage)}</a></p>
</div>
<button type="button" class="icon-button" id="term-panel-close" aria-label="${label(t.closeTerm)}"><svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/></svg></button>
</header>
<div class="term-panel-body" id="term-panel-body">
<h2 id="term-panel-title" tabindex="-1"></h2>
<div id="term-panel-content"></div>
<section class="backlinks" id="term-panel-related-section">
<h2>${escapeHtml(t.relatedTerms)}</h2>
<ul id="term-panel-related"></ul>
</section>
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
<p class="eyebrow"><a href="${url(lang, `/curriculum#section-${e.section.number}`)}">${escapeHtml(fill(t.section, { n: e.section.number }))} — ${escapeHtml(sectionTitle(site, e.section))}</a>${sep}${escapeHtml(fill(t.termOf, { i: e.position, total: entries.length }))}${sep}<a href="${url(lang, `/?term=${e.slug}`)}">${escapeHtml(t.viewInMap)}</a>${sep}<a href="${url(lang, `/learn#/${e.slug}`)}">${escapeHtml(t.learnTitle)}</a></p>
<h1>${escapeHtml(e.term)}</h1>
${entryHtml(site, e)}
${backlinks}
${pager}
</article>
</div>`,
  });
}

// ------------------------------------------------------------- Learn view

type LearnStep = {
  /** def: the definition. more: further text. note: a labelled note. */
  k: "def" | "more" | "note" | "usage";
  /** The label of a note, such as "Avoid". */
  t?: string;
  /** 1 when the note warns against something. */
  w?: 1;
  h: string;
  /** Indexes of the entries this step links to. */
  l: number[];
};

// Indexes of the entries that a piece of rendered entry HTML links to.
function linkedEntries(
  site: Site,
  html: string,
  bySlug: Map<string, number>,
  self: number
): number[] {
  const prefix = `${BASE[site.lang]}/`;
  const found = new Set<number>();
  for (const match of html.matchAll(/<a href="([^"#?]+)"/g)) {
    const href = match[1] ?? "";
    if (!href.startsWith(prefix)) continue;
    const i = bySlug.get(href.slice(prefix.length));
    if (i !== undefined && i !== self) found.add(i);
  }
  return [...found];
}

const NOTE_RE = /^<p><em class="label">([^<]+):<\/em>\s*/;

/** One entry cut into the steps the Learn view walks through. */
function learnSteps(
  site: Site,
  e: Entry,
  bySlug: Map<string, number>,
  self: number
): LearnStep[] {
  const text = e.text[site.lang];
  // Entries shown in English keep the English label.
  const avoid = (text.translated ? site.t : STRINGS[SOURCE_LANG]).avoidMarker;
  // A paragraph that ends in a colon introduces the table or list after it.
  // The two stay together as one step.
  const blocks: string[] = [];
  let lead = "";
  for (const block of text.blocks) {
    const html = lead ? `${lead}\n${block}` : block;
    if (/:\s*<\/p>$/.test(block)) {
      lead = html;
      continue;
    }
    lead = "";
    blocks.push(html);
  }
  if (lead) blocks.push(lead);

  const steps: LearnStep[] = blocks.map((html, i) => {
    const l = linkedEntries(site, html, bySlug, self);
    const note = html.match(NOTE_RE);
    if (note && note[1]) {
      const step: LearnStep = {
        k: "note",
        t: note[1],
        h: html.replace(NOTE_RE, "<p>"),
        l,
      };
      if (`${note[1]}:` === avoid) step.w = 1;
      return step;
    }
    return { k: i === 0 ? "def" : "more", h: html, l };
  });
  if (text.usageLines.length) {
    const html = text.usageLines
      .map(
        (line, i) =>
          `<p class="lx-say lx-say--${i % 2 === 0 ? "a" : "b"}">${line}</p>`
      )
      .join("\n");
    steps.push({
      k: "usage",
      h: `<div class="lx-chat">\n${html}\n</div>`,
      l: linkedEntries(site, html, bySlug, self),
    });
  }
  return steps;
}

function learnData(site: Site): string {
  const { t, sections, entries } = site;
  const bySlug = new Map(entries.map((e, i) => [e.slug, i]));
  return JSON.stringify({
    ui: {
      siteName: t.siteName,
      title: t.learnTitle,
      termInSection: t.learnTermInSection,
      termOf: t.termOf,
      stepOf: t.learnStepOf,
      steps: t.learnSteps,
      links: t.learnLinks,
      kinds: {
        def: t.learnKindDef,
        more: t.learnKindMore,
        note: t.learnKindNote,
        usage: t.learnKindUsage,
        recap: t.learnKindRecap,
      },
      keyIdea: t.learnKeyIdea,
      next: t.learnNext,
      finished: t.learnFinished,
      diagram: t.learnDiagram,
      noLinks: t.learnNoLinks,
      mentionedIn: t.mentionedIn,
      prereqNone: t.learnPrereqNone,
      done: t.learnDone,
      termDone: t.learnTermDone,
      resetConfirm: t.learnResetConfirm,
      resetConfirmSynced: t.learnResetConfirmSynced,
      signIn: t.learnSignIn,
      signingIn: t.learnSigningIn,
      signInUnavailable: t.learnSignInUnavailable,
      signInFailed: t.learnSignInFailed,
      signOutConfirm: t.learnSignOutConfirm,
      syncing: t.learnSyncing,
      synced: t.learnSynced,
      syncError: t.learnSyncError,
      notTranslated: t.notTranslated,
    },
    sections: sections.map((s) => ({
      n: s.number,
      t: sectionTitle(site, s),
      c: s.entries.length,
    })),
    terms: entries.map((e, i) => {
      const text = e.text[site.lang];
      return {
        s: e.slug,
        t: e.term,
        a: text.name,
        d: text.description,
        c: e.section.number,
        // 1 when this language has no translation and English is shown.
        e: text.translated ? undefined : 1,
        steps: learnSteps(site, e, bySlug, i),
      };
    }),
  });
}

// Google's "G", as its sign-in branding guidelines ask for it.
const ICON_GOOGLE =
  '<svg viewBox="0 0 48 48" width="15" height="15" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>';
const ICON_CHEVRON =
  '<svg class="lx-chev" viewBox="0 0 10 10" width="10" height="10" aria-hidden="true"><path d="M3 1.5 7 5 3 8.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const ICON_FOLDER =
  '<svg class="lx-folder" viewBox="0 0 20 16" width="19" height="15" aria-hidden="true"><path d="M1.5 3.2c0-.9.7-1.7 1.7-1.7h4l1.9 2h7.7c1 0 1.7.8 1.7 1.7v7.6c0 .9-.7 1.7-1.7 1.7H3.2c-1 0-1.7-.8-1.7-1.7Z" stroke-width="1.3" stroke-linejoin="round"/></svg>';
const ICON_MENU =
  '<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path d="M2.5 4h11M2.5 8h11M2.5 12h11" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>';
const ICON_ARROW =
  '<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>';

const ICON_CHECK =
  '<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path d="M3 8.5l3.2 3.2L13 4.8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const ICON_BOTH =
  '<svg viewBox="0 0 16 16" width="13" height="13" aria-hidden="true"><path d="M2 5.5h11M10.5 3 13 5.5 10.5 8M14 10.5H3M5.5 8 3 10.5 5.5 13" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

function twoDigits(n: number): string {
  return String(n).padStart(2, "0");
}

// The page is a shell. site/learn.js fills it from learn.json and moves
// between terms and steps without loading another page.
function learnPage(site: Site): string {
  const { lang, t, sections, entries } = site;
  const text = (value: string) => escapeHtml(value);
  const first = entries[0];

  const tree = sections
    .map(
      (
        s,
        i
      ) => `<li class="lx-mod lx-c${s.number}${i === 0 ? " is-open" : ""}" data-section="${s.number}">
<h2 class="lx-mod__h"><button type="button" class="lx-mod__head" aria-expanded="${i === 0}" aria-controls="lx-mod-${s.number}">${ICON_CHEVRON}${ICON_FOLDER}<span class="lx-mod__name">${twoDigits(s.number)}. ${text(sectionTitle(site, s))}</span><span class="lx-mod__count">0/${s.entries.length}</span></button></h2>
<div class="lx-mod__body" id="lx-mod-${s.number}">
<ol class="lx-mod__list">
${s.entries
  .map(
    (e) =>
      `<li><a class="lx-lesson" href="#/${e.slug}" data-slug="${e.slug}"><span class="lx-lesson__name">${text(e.term)}</span><span class="lx-lesson__tick" aria-hidden="true"></span></a></li>`
  )
  .join("\n")}
</ol>
</div>
</li>`
    )
    .join("\n");

  const checklist = sections
    .map(
      (s) =>
        `<li data-section="${s.number}"><span class="lx-check" aria-hidden="true"></span><span>${text(sectionTitle(site, s))}</span><span class="lx-progress__n">0/${s.entries.length}</span></li>`
    )
    .join("\n");

  const hud = (id: string, label: string, tone: string) =>
    `<div class="lx-hud__chip lx-hud__chip--${tone}"><dt>${text(label)}</dt><dd id="${id}">–</dd></div>`;
  const legend = (tone: string, label: string) =>
    `<li><i class="lx-lg lx-lg--${tone}" aria-hidden="true"></i>${text(label)}</li>`;

  // Sign-in and sync, when a Supabase project is set in site/sync.ts. The
  // block stays hidden until site/learn.js knows the visitor's state.
  const syncOn = Boolean(SYNC.url && SYNC.publishableKey);
  const syncAttrs = syncOn
    ? ` data-sync-url="${text(SYNC.url)}" data-sync-key="${text(SYNC.publishableKey)}" data-sync-lib="/assets/vendor/${SUPABASE_FILE}"`
    : "";
  const account = syncOn
    ? `<div class="lx-account" id="lx-account" hidden>
<button type="button" class="lx-signin" id="lx-signin">${ICON_GOOGLE}<span id="lx-signin-label">${text(t.learnSignIn)}</span></button>
<p class="lx-account__hint">${text(t.learnSignInHint)}</p>
<div class="lx-account__in" id="lx-account-in" hidden>
<span class="lx-account__email" id="lx-account-email"></span>
<span class="lx-account__row"><button type="button" class="lx-sync" id="lx-sync-state" aria-live="polite"></button><button type="button" class="lx-signout" id="lx-signout">${text(t.learnSignOut)}</button></span>
</div>
</div>`
    : "";

  return layout(site, {
    title: t.learnTitle,
    description: fill(t.learnDescription, {
      count: entries.length,
      site: t.siteName,
    }),
    path: "/learn",
    nav: "learn",
    variant: "learn",
    main: `<div class="lx" id="learn" data-error="${text(t.learnError)}"${syncAttrs} aria-busy="true">
<aside class="lx-side" id="lx-side" aria-label="${text(t.learnCourse)}">
<div class="lx-side__scroll">
<div class="lx-tree-root"><span>${text(t.learnCourse)}</span><span class="lx-tree-root__count">${text(fill(t.termCount, { count: entries.length }))}</span><button type="button" class="lx-side__close" id="lx-side-close" aria-label="${text(t.learnCloseCourse)}"><svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path d="M3.5 3.5l9 9M12.5 3.5l-9 9" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg></button></div>
<ul class="lx-tree">
${tree}
</ul>
</div>
<div class="lx-progress is-open" id="lx-progress">
<button type="button" class="lx-progress__head" id="lx-progress-toggle" aria-expanded="true" aria-controls="lx-progress-body"><span class="lx-progress__title">${text(t.learnProgress)}</span><span class="lx-progress__count" id="lx-progress-count">0 / ${entries.length}</span>${ICON_CHEVRON}</button>
<div class="lx-progress__bar" aria-hidden="true"><span id="lx-progress-fill"></span></div>
<div class="lx-progress__body" id="lx-progress-body">
<div>
<ul class="lx-progress__list" id="lx-progress-list">
${checklist}
</ul>
<button type="button" class="lx-progress__reset" id="lx-reset">${text(t.learnReset)}</button>
</div>
</div>
${account}
</div>
</aside>
<div class="lx-backdrop" id="lx-backdrop" hidden></div>
<section class="lx-main">
<article class="lx-sheet" aria-labelledby="lx-title">
<header class="lx-head">
<div class="lx-head__top">
<button type="button" class="lx-tool lx-menu" id="lx-menu" aria-controls="lx-side" aria-expanded="false" aria-label="${text(t.learnOpenCourse)}">${ICON_MENU}<span>${text(t.learnCourse)}</span></button>
<p class="lx-crumb" id="lx-crumb">${first ? `${twoDigits(first.section.number)}. ${text(sectionTitle(site, first.section))}` : ""}</p>
</div>
<h1 class="lx-title" id="lx-title">${first ? text(first.term) : text(t.learnTitle)}</h1>
<ul class="lx-tags" id="lx-tags"></ul>
<p class="lx-sub" id="lx-sub">${first ? text(first.text[lang].description) : ""}</p>
</header>
<div class="lx-stage">
<div class="lx-stage__top">
<dl class="lx-hud">
${hud("lx-hud-out", t.learnHudOut, "out")}
${hud("lx-hud-in", t.learnHudIn, "in")}
${hud("lx-hud-both", t.learnHudBoth, "both")}
</dl>
<div class="lx-stage__tools">
<a class="lx-tool" id="lx-tool-map" href="${url(lang, "/")}">${text(t.learnToolMap)}</a>
<a class="lx-tool" id="lx-tool-page" href="${url(lang, "/curriculum")}">${text(t.openAsPage)}</a>
</div>
</div>
<div class="lx-canvas" id="lx-canvas" role="group">
<svg class="lx-links" id="lx-links" aria-hidden="true" focusable="false"></svg>
<div class="lx-nodes" id="lx-nodes"></div>
<p class="lx-canvas__status" id="lx-status" role="status">${text(t.learnLoading)}</p>
</div>
<ul class="lx-legend">
${legend("hit", t.learnLegendHit)}
${legend("seen", t.learnLegendSeen)}
${legend("ahead", t.learnLegendAhead)}
<li><span class="lx-both" id="lx-both-icon">${ICON_BOTH}</span>${text(t.learnLegendBoth)}</li>
</ul>
</div>
<nav class="lx-timeline" aria-label="${text(t.learnStepsLabel)}">
<div class="lx-timeline__head"><span class="lx-eyebrow">${text(t.learnStepsLabel)}</span><span class="lx-timeline__count" id="lx-step-count"></span></div>
<div class="lx-timeline__track">
<div class="lx-timeline__rail" aria-hidden="true"><span id="lx-rail-fill"></span></div>
<ol class="lx-timeline__steps" id="lx-steps"></ol>
</div>
</nav>
<noscript><p class="lx-noscript">${linkify(t.learnNoScript, { link: url(lang, "/curriculum") })}</p></noscript>
</article>
</section>
<aside class="lx-rail">
<section class="lx-card lx-guide" aria-labelledby="lx-guide-step">
<div class="lx-guide__meta"><h2 class="lx-eyebrow" id="lx-guide-step">${text(fill(t.learnStepOf, { i: 1, total: 1 }))}</h2><span class="lx-chapter" id="lx-chapter"></span></div>
<div class="lx-guide__content" id="lx-guide" aria-live="polite"></div>
<div class="lx-guide__nav">
<button type="button" class="lx-btn-ghost" id="lx-back" disabled><span class="lx-flip">${ICON_ARROW}</span>${text(t.learnBack)}</button>
<button type="button" class="lx-btn-pop lx-btn-next" id="lx-next" disabled><span class="lx-btn-next__label" id="lx-next-label">${text(fill(t.learnNext, { label: "…" }))}</span>${ICON_ARROW}</button>
</div>
<p class="lx-guide__hint"><kbd class="lx-flip" aria-label="←">${ICON_ARROW}</kbd><kbd aria-label="→">${ICON_ARROW}</kbd><span>${text(t.learnHint)}</span></p>
</section>
<section class="lx-card lx-goals" aria-labelledby="lx-prereq-title">
<h2 class="lx-eyebrow" id="lx-prereq-title">${text(t.learnPrereq)}</h2>
<ul class="lx-chips" id="lx-prereq"></ul>
</section>
<p class="lx-credit">${credit(site)}</p>
</aside>
<div class="lx-toast" id="lx-toast" role="status"><span class="lx-toast__icon" id="lx-check-icon">${ICON_CHECK}</span><span class="lx-toast__text" id="lx-toast-text"></span></div>
</div>`,
  });
}

// --------------------------------------------------------------- tasks page

type Adr = {
  number: string;
  file: string;
  title: string;
  titleVi: string;
  summary: string;
  summaryVi: string;
  status: AdrStatus;
  /** YYYY-MM-DD */
  date: string;
};

const ADR_STATUSES: AdrStatus[] = [
  "proposed",
  "accepted",
  "rejected",
  "superseded",
];

/**
 * Read the decision records in internal/adr/. Each file is named
 * "<4 digits>-<words>.md" and starts with frontmatter:
 * status, date, and optionally title_vi, summary, summary_vi.
 */
function loadAdrs(): Adr[] {
  if (!existsSync(ADR_DIR)) return [];
  const adrs: Adr[] = [];
  for (const file of readdirSync(ADR_DIR).sort()) {
    const name = /^(\d{4})-.+\.md$/.exec(file);
    if (!name) continue;
    const where = `internal/adr/${file}`;
    const text = readFileSync(join(ADR_DIR, file), "utf8");
    const front = /^---\n([\s\S]*?)\n---\n/.exec(text);
    if (!front) fail(`${where} has no frontmatter.`);
    const fields: Record<string, string> = {};
    for (const line of (front[1] ?? "").split("\n")) {
      const pair = /^([a-z_]+):\s*(.*)$/.exec(line);
      if (pair) fields[pair[1] as string] = (pair[2] ?? "").trim();
    }
    const status = fields.status as AdrStatus | undefined;
    if (!status || !ADR_STATUSES.includes(status))
      fail(`${where}: "status" must be one of ${ADR_STATUSES.join(", ")}.`);
    const date = fields.date ?? "";
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date))
      fail(`${where}: "date" must be written as YYYY-MM-DD.`);
    const heading = /^# (.+)$/m.exec(text.slice(front[0].length));
    if (!heading) fail(`${where} has no "# Title" line.`);
    const title = (heading[1] ?? "").trim();
    const summary = fields.summary ?? "";
    adrs.push({
      number: name[1] as string,
      file,
      title,
      titleVi: fields.title_vi || title,
      summary,
      summaryVi: fields.summary_vi || summary,
      status,
      date,
    });
  }
  return adrs;
}

/** One issue, cut down to what the tasks page shows. Same shape as tasks.js. */
type Task = {
  n: number;
  title: string;
  url: string;
  open: boolean;
  labels: string[];
  assignees: { login: string; avatar: string }[];
  comments: number;
  updated: string;
};

type TaskSnapshot = { at: string; tasks: Task[] };

/**
 * Copy the issue list from GitHub at build time. The page shows this copy when
 * the visitor's browser cannot reach GitHub. Any failure gives null: the page
 * then relies on the browser alone, and the build goes on.
 */
async function loadTaskSnapshot(): Promise<TaskSnapshot | null> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "dictionary-of-ai-coding-build",
  };
  const token = process.env.GITHUB_TOKEN;
  if (token) headers.Authorization = `Bearer ${token}`;
  try {
    const tasks: Task[] = [];
    for (let page = 1; page <= 3; page++) {
      const response = await fetch(
        `https://api.github.com/repos/${REPO}/issues?state=all&per_page=100&page=${page}`,
        { headers, signal: AbortSignal.timeout(8000) }
      );
      if (!response.ok) throw new Error(`GitHub answered ${response.status}`);
      const list = (await response.json()) as Record<string, unknown>[];
      for (const issue of list) {
        // The issues endpoint also returns pull requests.
        if (issue.pull_request) continue;
        tasks.push({
          n: Number(issue.number),
          title: String(issue.title ?? ""),
          url: String(issue.html_url ?? ""),
          open: issue.state === "open",
          labels: ((issue.labels as { name?: string }[]) ?? [])
            .map((label) => label.name ?? "")
            .filter(Boolean),
          assignees: (
            (issue.assignees as { login?: string; avatar_url?: string }[]) ?? []
          ).map((a) => ({
            login: a.login ?? "",
            avatar: a.avatar_url ?? "",
          })),
          comments: Number(issue.comments ?? 0),
          updated: String(issue.closed_at ?? issue.updated_at ?? ""),
        });
      }
      if (list.length < 100) break;
    }
    return { at: new Date().toISOString(), tasks };
  } catch (error) {
    warnings.push(
      `the issue list of ${REPO} could not be read (${error instanceof Error ? error.message : String(error)}); /tasks is built without a saved copy`
    );
    return null;
  }
}

const ICON_GITHUB =
  '<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path fill="currentColor" d="M8 0a8 8 0 0 0-2.53 15.59c.4.07.55-.17.55-.38v-1.33c-2.23.48-2.7-1.07-2.7-1.07-.36-.93-.89-1.17-.89-1.17-.73-.5.05-.49.05-.49.8.06 1.23.83 1.23.83.72 1.22 1.87.87 2.33.66.07-.52.28-.87.5-1.07-1.77-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.22 2.2.82a7.6 7.6 0 0 1 4 0c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.28.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48v2.2c0 .21.15.46.55.38A8 8 0 0 0 8 0Z"/></svg>';
const ICON_PLUS =
  '<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" d="M8 3v10M3 8h10"/></svg>';
const ICON_SHARE =
  '<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" d="M8 10V2m0 0L5 5m3-3 3 3M3 9v4h10V9"/></svg>';
const ICON_REFRESH =
  '<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" d="M13 3v3.5H9.5M3 13V9.5h3.5M12.6 6.5A5 5 0 0 0 3.5 6M3.4 9.5a5 5 0 0 0 9.1.5"/></svg>';

function adrDate(lang: Lang, date: string): string {
  return new Intl.DateTimeFormat(lang === "vi" ? "vi-VN" : "en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}

function tasksPage(
  site: Site,
  adrs: Adr[],
  snapshot: TaskSnapshot | null
): string {
  const { lang, t } = site;
  const repoName = REPO.split("/")[1] ?? REPO;
  // Decisions that still wait for an answer come first, then the newest.
  const ordered = [...adrs].sort(
    (a, b) =>
      Number(b.status === "proposed") - Number(a.status === "proposed") ||
      b.number.localeCompare(a.number)
  );
  const pending = adrs.filter((a) => a.status === "proposed").length;
  const data = {
    repo: REPO,
    lang,
    snapshot,
    ui: {
      open: t.tasksOpen,
      doing: t.tasksDoing,
      done: t.tasksDone,
      unassigned: t.tasksUnassigned,
      comments: t.tasksComments,
      empty: t.tasksEmpty,
      emptyOpen: t.tasksEmptyOpen,
      emptyAll: t.tasksEmptyAll,
      loading: t.tasksLoading,
      updated: t.tasksUpdated,
      stale: t.tasksStale,
      error: t.tasksError,
      onGithub: t.tasksOnGithub,
      share: t.tasksShare,
      copied: t.tasksCopied,
      colAssignee: t.tasksColAssignee,
      colStatus: t.tasksColStatus,
      colUpdated: t.tasksColUpdated,
      labelNames: t.tasksLabelNames,
    },
  };
  const view = (key: string, label: string, pressed: boolean) =>
    `<button type="button" class="tk-view" data-view="${key}" aria-pressed="${pressed}"><span class="tk-dot tk-dot--${key}" aria-hidden="true"></span><span class="tk-view__name">${escapeHtml(label)}</span><span class="tk-count" data-count="${key}">–</span></button>`;
  const stat = (key: string, label: string, value: string) =>
    `<li class="tk-stat tk-stat--${key}"><span class="tk-stat__value"${value ? "" : ` data-count="${key}"`}>${value || "–"}</span><span class="tk-stat__label">${escapeHtml(label)}</span></li>`;
  const adrCards = ordered
    .map((a) => {
      const title = lang === "vi" ? a.titleVi : a.title;
      const summary = lang === "vi" ? a.summaryVi : a.summary;
      return `<li class="tk-adr tk-adr--${a.status}">
<div class="tk-adr__top"><span class="num">ADR ${a.number}</span><span class="tk-pill tk-pill--${a.status}">${escapeHtml(t.tasksAdrStatus[a.status])}</span></div>
<h3><a href="${REPO_URL}/blob/main/internal/adr/${encodeURIComponent(a.file)}" rel="noopener">${escapeHtml(title)}</a></h3>${summary ? `\n<p>${escapeHtml(summary)}</p>` : ""}
<p class="tk-adr__date"><time datetime="${a.date}">${escapeHtml(adrDate(lang, a.date))}</time></p>
</li>`;
    })
    .join("\n");
  return layout(site, {
    title: t.tasksTitle,
    description: fill(t.tasksDescription, { site: t.siteName }),
    path: "/tasks",
    nav: null,
    variant: "tasks",
    main: `<div class="tk" id="tasks">
<aside class="tk-side" aria-label="${escapeHtml(t.tasksSidebar)}">
<div class="tk-side__group tk-side__group--project">
<p class="tk-side__head">${escapeHtml(t.tasksProject)}</p>
<a class="tk-project" href="${REPO_URL}" rel="noopener">${ICON_GITHUB}<span>${escapeHtml(repoName)}</span></a>
</div>
<div class="tk-side__group">
<p class="tk-side__head" id="tk-views-head">${escapeHtml(t.tasksViews)}</p>
<div class="tk-views" id="tk-views" role="group" aria-labelledby="tk-views-head">
${view("open", t.tasksOpen, true)}
${view("doing", t.tasksDoing, false)}
${view("done", t.tasksDone, false)}
${view("all", t.tasksAll, false)}
</div>
</div>
<div class="tk-side__group" id="tk-labels-group" hidden>
<p class="tk-side__head" id="tk-labels-head">${escapeHtml(t.tasksLabels)}</p>
<div class="tk-labels" id="tk-labels" role="group" aria-labelledby="tk-labels-head"></div>
</div>
<div class="tk-side__group tk-side__group--links">
<a class="tk-side__link" href="#adr"><span>${escapeHtml(t.tasksDecisions)}</span><span class="tk-count">${adrs.length}</span></a>
</div>
</aside>
<div class="tk-main">
<header class="tk-head">
<div class="tk-head__text">
<p class="tk-date" id="tk-date"></p>
<h1>${escapeHtml(t.tasksTitle)}</h1>
<p class="tk-lede">${escapeHtml(t.tasksLede)}</p>
</div>
<div class="tk-actions">
<button type="button" class="tk-btn" id="tk-share">${ICON_SHARE}<span id="tk-share-label">${escapeHtml(t.tasksShare)}</span></button>
<a class="tk-btn tk-btn--primary" href="${REPO_URL}/issues/new" target="_blank" rel="noopener">${ICON_PLUS}<span>${escapeHtml(t.tasksAdd)}</span></a>
</div>
</header>
<ul class="tk-stats">
${stat("open", t.tasksOpen, "")}
${stat("doing", t.tasksDoing, "")}
${stat("done", t.tasksDone, "")}
${stat("pending", t.tasksPending, String(pending))}
</ul>
<section class="tk-panel" aria-labelledby="tk-list-title">
<header class="tk-panel__head">
<h2 id="tk-list-title">${escapeHtml(t.tasksListTitle)}</h2>
<p class="tk-sync" id="tk-sync" role="status"></p>
<button type="button" class="tk-btn tk-btn--quiet" id="tk-refresh" hidden>${ICON_REFRESH}<span>${escapeHtml(t.tasksRefresh)}</span></button>
</header>
<p class="tk-notice" id="tk-notice" hidden></p>
<table class="tk-table" id="tk-table" hidden>
<thead><tr><th scope="col">${escapeHtml(t.tasksColTask)}</th><th scope="col">${escapeHtml(t.tasksColAssignee)}</th><th scope="col">${escapeHtml(t.tasksColStatus)}</th><th scope="col">${escapeHtml(t.tasksColUpdated)}</th></tr></thead>
<tbody id="tk-rows"></tbody>
</table>
<p class="tk-empty" id="tk-empty" hidden></p>
<noscript><p class="tk-empty">${linkify(t.tasksNoScript, { link: `${REPO_URL}/issues` })}</p></noscript>
</section>
<section class="tk-panel" id="adr" aria-labelledby="tk-adr-title">
<header class="tk-panel__head">
<h2 id="tk-adr-title">${escapeHtml(t.tasksDecisions)}</h2>
</header>
<p class="tk-panel__lede">${escapeHtml(t.tasksDecisionsLede)}</p>
<ol class="tk-adrs">
${adrCards}
</ol>
</section>
</div>
</div>
<script type="application/json" id="tasks-data">${JSON.stringify(data).replace(/</g, "\\u003c")}</script>`,
  });
}

function notFoundHelp(site: Site): string {
  return linkify(site.t.notFoundHelp, {
    map: url(site.lang, "/"),
    learn: url(site.lang, "/learn"),
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

async function main(): Promise<void> {
  const { sections, entries } = load();
  const adrs = loadAdrs();
  const snapshot = await loadTaskSnapshot();
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
  copyFileSync(join(HERE, "learn.css"), join(OUT, "assets", "learn.css"));
  copyFileSync(join(HERE, "learn.js"), join(OUT, "assets", "learn.js"));
  copyFileSync(join(HERE, "tasks.css"), join(OUT, "assets", "tasks.css"));
  copyFileSync(join(HERE, "tasks.js"), join(OUT, "assets", "tasks.js"));
  copyFileSync(
    join(HERE, "learn-store.js"),
    join(OUT, "assets", "learn-store.js")
  );
  mkdirSync(join(OUT, "assets", "vendor"), { recursive: true });
  const supabaseBundle = join(SUPABASE_DIR, "dist", "umd", "supabase.js");
  if (!existsSync(supabaseBundle))
    fail(`${supabaseBundle} is missing. Run "npm ci" to install it.`);
  copyFileSync(supabaseBundle, join(OUT, "assets", "vendor", SUPABASE_FILE));
  copyFileSync(
    join(SUPABASE_DIR, "LICENSE"),
    join(OUT, "assets", "vendor", "supabase-js.LICENSE.txt")
  );
  mkdirSync(join(OUT, "assets", "fonts"), { recursive: true });
  for (const file of FONT_FILES) {
    const from = join(FONT_DIR, file);
    if (!existsSync(from))
      fail(`${from} is missing. Run "npm ci" to install the font package.`);
    copyFileSync(from, join(OUT, "assets", "fonts", file));
  }
  write("favicon.svg", FAVICON);

  for (const site of sites) {
    // "" for the default language, "en/" for English.
    const dir = BASE[site.lang].replace(/^\//, "");
    const at = (path: string) => (dir ? `${dir}/${path}` : path);

    write(at("index.html"), mapPage(site));
    write(at("graph.json"), graphData(site));
    write(at("learn/index.html"), learnPage(site));
    write(at("learn.json"), learnData(site));
    write(at("tasks/index.html"), tasksPage(site, adrs, snapshot));
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
  console.log(
    `Tasks page: ${adrs.length} decision records, ${snapshot ? `${snapshot.tasks.length} issues saved` : "no saved issues"}`
  );
}

await main();
