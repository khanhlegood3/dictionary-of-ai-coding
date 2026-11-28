#!/usr/bin/env -S npx tsx
// Build a static website into dist/ from internal/Curriculum.md,
// dictionary/*.md and translations/vi/*.md.
// The markdown files are the only data source. There is no database.
// The tasks page also reads internal/adr/*.md, and the build saves a copy of
// the repository's GitHub issues in it when GitHub can be reached.
// The same data is also written as files for machines (llms.txt, /data/*.json,
// a markdown copy of each term, openapi.json, the discovery files under
// /.well-known, sitemap.xml), and /agents documents them and the server in
// api/mcp.ts.
//
// The site is built once per language. Vietnamese is the default and lives at
// the root; English lives under /en. Both share the same terms, slugs and map.

import { createHash } from "node:crypto";
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
import {
  API_PATH,
  CORPUS_PATH,
  DOCS_PATH,
  INSTRUCTIONS,
  LIMITS,
  MCP_PATH,
  OPENAPI_PATH,
  PROTOCOL_VERSIONS,
  SERVER,
  STATUS_PATH,
  TOOLS,
  buildIndex,
  exampleAddress,
  type Corpus,
  type CorpusText,
} from "../api/mcp";
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

/** Where the English entries come from. */
const UPSTREAM_URL = "https://github.com/mattpocock/dictionary-of-ai-coding";
/** The address of the site in production. server.json names it. */
const PUBLIC_URL = "https://ai9k.vercel.app";
/**
 * The public address of the site, without a slash at the end. The files for
 * machines carry full addresses, so the build has to know it.
 */
const SITE_URL = (process.env.SITE_URL || PUBLIC_URL).replace(/\/+$/, "");
/** Where an MCP client looks for the server by itself (SEP-1649, a draft). */
const SERVER_CARD_PATH = "/.well-known/mcp/server-card.json";
/** The list of agent skills the site publishes (Agent Skills Discovery 0.2.0). */
const SKILLS_INDEX_PATH = "/.well-known/agent-skills/index.json";
const SKILL_NAME = SERVER.name;
const SKILL_PATH = `/.well-known/agent-skills/${SKILL_NAME}/SKILL.md`;

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
// Every page is set in Lora and Be Vietnam Pro (ADR 0015). site/fonts.css
// names the files; the build copies them out of these two npm packages.
const TEXT_FONT_PACKAGES = [
  { prefix: "lora-", dir: ["@fontsource-variable", "lora"], licence: "Lora" },
  {
    prefix: "be-vietnam-pro-",
    dir: ["@fontsource", "be-vietnam-pro"],
    licence: "Be-Vietnam-Pro",
  },
];
// Fetched early on every page but /learn, which is set in JetBrains Mono:
// the two faces at their usual weight.
const PRELOAD_FONTS = (lang: Lang): string[] =>
  (lang === "vi" ? ["latin", "vietnamese"] : ["latin"]).flatMap((subset) => [
    `lora-${subset}-wght-normal.woff2`,
    `be-vietnam-pro-${subset}-400-normal.woff2`,
  ]);

const SECTION_RE = /^## Section (\d+) — (.+)$/;
const LINK_RE = /\[([^\]]+)\]\(\.\/([^)]+)\.md\)/g;
// The marker is the same in every language, so one parser reads them all.
const USAGE_MARKER = "_Usage:_";
// Paths the site itself uses. A term may not take one of them.
const RESERVED_SLUGS = new Set([
  "a-z",
  "agents",
  "api",
  "assets",
  "curriculum",
  "data",
  "en",
  "game9k",
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
  /** The body as markdown, for machines. Links to terms are full addresses. */
  markdown: string;
  /** The usage dialogue as markdown. Empty when the entry has none. */
  usageMarkdown: string;
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

/**
 * A block of schema.org data for the head of a page. "<" is written as an
 * escape, so no text of an entry can end the script element.
 */
function jsonLd(data: Json): string {
  return `<script type="application/ld+json">${JSON.stringify(data).replace(/</g, "\\u003c")}</script>`;
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
  /** The entry with its links pointing at pages under `origin`. */
  const withLinks = (origin: string) =>
    body.replace(LINK_RE, (_, text: string, target: string) => {
      const name = decodeURIComponent(target);
      const slug = slugs.get(name);
      if (!slug) fail(`${label} links to unknown entry "${name}"`);
      if (name !== term) linksTo.add(name);
      return `[${text}](${origin}${url(lang, `/${slug}`)})`;
    });
  const split = (text: string) => {
    const markerAt = text.indexOf(`\n${USAGE_MARKER}\n`);
    return markerAt === -1
      ? { main: text.trim(), usage: "" }
      : {
          main: text.slice(0, markerAt).trim(),
          usage: text.slice(markerAt + USAGE_MARKER.length + 2).trim(),
        };
  };

  const { main, usage } = split(withLinks(""));
  const absolute = split(withLinks(SITE_URL));

  const lines = usageLines(usage);
  return {
    name,
    description,
    bodyHtml: decorate(marked.parse(main, { async: false, gfm: true })),
    usageHtml: renderUsage(lines, STRINGS[lang].usage),
    blocks: renderBlocks(main),
    usageLines: lines,
    markdown: absolute.main,
    usageMarkdown: absolute.usage,
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
    variant?: "map" | "learn" | "tasks" | "agents";
    /** More tags for the head of the page. */
    head?: string;
  }
): string {
  const { lang, t } = site;
  const isMap = opts.variant === "map";
  const isLearn = opts.variant === "learn";
  const isTasks = opts.variant === "tasks";
  const isAgents = opts.variant === "agents";
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
        : isAgents
          ? `
<link rel="stylesheet" href="/assets/agents.css">
<script src="/assets/agents.js" defer></script>`
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
${(isLearn ? [] : PRELOAD_FONTS(lang))
  .map(
    (file) =>
      `<link rel="preload" href="/assets/fonts/${file}" as="font" type="font/woff2" crossorigin>`
  )
  .join("\n")}
<link rel="stylesheet" href="/assets/fonts.css">
<link rel="stylesheet" href="/assets/styles.css">
<script src="/assets/app.js" defer></script>${assets}${opts.head ? `\n${opts.head}` : ""}
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
<p class="footer-links"><a href="${url(lang, "/agents")}"${isAgents ? ' aria-current="page"' : ""}>${escapeHtml(t.agentsNav)}</a><a href="${url(lang, "/tasks")}"${isTasks ? ' aria-current="page"' : ""}>${escapeHtml(t.tasksNav)}</a></p>
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
    head: jsonLd({
      "@context": "https://schema.org",
      ...termSetSchema(site),
      description: fill(t.azDescription, {
        count: entries.length,
        site: t.siteName,
      }),
      hasDefinedTerm: sorted.map((e) => ({
        "@type": "DefinedTerm",
        "@id": `${pageUrl(site.lang, `/${e.slug}`)}#term`,
        name: e.term,
        termCode: e.slug,
        url: pageUrl(site.lang, `/${e.slug}`),
      })),
    }),
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

/** The dictionary as a schema.org set of terms. The A–Z page stands for it. */
function termSetSchema(site: Site): Json {
  const { lang, t } = site;
  return {
    "@type": "DefinedTermSet",
    "@id": `${pageUrl(lang, "/a-z")}#terms`,
    name: t.siteName,
    url: pageUrl(lang, "/a-z"),
    inLanguage: lang,
  };
}

/** One term as schema.org data, so a search engine reads it as a definition. */
function termSchema(site: Site, e: Entry): Json {
  const { lang } = site;
  const text = e.text[lang];
  return {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    "@id": `${pageUrl(lang, `/${e.slug}`)}#term`,
    name: e.term,
    ...(text.name && text.name !== e.term ? { alternateName: text.name } : {}),
    description: text.description,
    termCode: e.slug,
    url: pageUrl(lang, `/${e.slug}`),
    inDefinedTermSet: termSetSchema(site),
  };
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
    head: `<link rel="alternate" type="text/markdown" href="${url(lang, `/${e.slug}.md`)}">
${jsonLd(termSchema(site, e))}`,
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
  /** The text of the issue, for the brief. Cut at BODY_LIMIT characters. */
  body: string;
};

type Pull = {
  n: number;
  title: string;
  url: string;
  open: boolean;
  draft: boolean;
  /** When it was merged, or "" when it was not. */
  merged: string;
  author: string;
  created: string;
  /** The branch it comes from and the one it goes into, when known. */
  head: string;
  base: string;
};

type TaskSnapshot = { at: string; tasks: Task[]; pulls: Pull[] };

const BODY_LIMIT = 4000;
/** How many merged pull requests the page keeps, newest first. */
const MERGED_SHOWN = 5;
const DEFAULT_BRANCH = "main";

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
    const pulls: Pull[] = [];
    for (let page = 1; page <= 3; page++) {
      const response = await fetch(
        `https://api.github.com/repos/${REPO}/issues?state=all&per_page=100&page=${page}`,
        { headers, signal: AbortSignal.timeout(8000) }
      );
      if (!response.ok) throw new Error(`GitHub answered ${response.status}`);
      const list = (await response.json()) as Record<string, unknown>[];
      for (const issue of list) {
        // The issues endpoint also returns pull requests.
        const pull = issue.pull_request as { merged_at?: string } | undefined;
        if (pull) {
          pulls.push({
            n: Number(issue.number),
            title: String(issue.title ?? ""),
            url: String(issue.html_url ?? ""),
            open: issue.state === "open",
            draft: issue.draft === true,
            merged: String(pull.merged_at ?? ""),
            author: String((issue.user as { login?: string })?.login ?? ""),
            created: String(issue.created_at ?? ""),
            head: "",
            base: "",
          });
          continue;
        }
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
          body: String(issue.body ?? "").slice(0, BODY_LIMIT),
        });
      }
      if (list.length < 100) break;
    }
    // The branch names come from another endpoint. It is asked only when a
    // pull request is open, and the list is fine without its answer.
    if (pulls.some((pull) => pull.open)) {
      try {
        const response = await fetch(
          `https://api.github.com/repos/${REPO}/pulls?state=open&per_page=100`,
          { headers, signal: AbortSignal.timeout(8000) }
        );
        if (response.ok) {
          const list = (await response.json()) as {
            number?: number;
            draft?: boolean;
            head?: { ref?: string };
            base?: { ref?: string };
          }[];
          for (const detail of list) {
            const pull = pulls.find((p) => p.n === detail.number);
            if (!pull) continue;
            pull.draft = detail.draft === true;
            pull.head = detail.head?.ref ?? "";
            pull.base = detail.base?.ref ?? "";
          }
        }
      } catch {
        // The pull requests are listed without their branches.
      }
    }
    const merged = pulls
      .filter((pull) => pull.merged)
      .sort((a, b) => b.merged.localeCompare(a.merged))
      .slice(0, MERGED_SHOWN);
    return {
      at: new Date().toISOString(),
      tasks,
      pulls: [...pulls.filter((pull) => pull.open), ...merged],
    };
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
      brief: t.tasksBrief,
      briefHint: t.tasksBriefHint,
      briefCopied: t.tasksBriefCopied,
      briefIntro: t.tasksBriefIntro,
      briefTitle: t.tasksBriefTitle,
      briefLink: t.tasksBriefLink,
      briefLabels: t.tasksBriefLabels,
      briefBody: t.tasksBriefBody,
      briefNoBody: t.tasksBriefNoBody,
      briefCut: t.tasksBriefCut,
      briefStepsTitle: t.tasksBriefStepsTitle,
      briefSteps: t.tasksBriefSteps,
      pullsEmpty: t.tasksPullsEmpty,
      pullsReady: t.tasksPullsReady,
      pullsDraft: t.tasksPullsDraft,
      pullsInto: t.tasksPullsInto,
      pullsMerged: t.tasksPullsMerged,
      branchesCheck: t.tasksBranchesCheck,
      branchesChecking: t.tasksBranchesChecking,
      branchesNone: t.tasksBranchesNone,
      branchesMergedBy: t.tasksBranchesMergedBy,
      branchesOther: t.tasksBranchesOther,
      branchesError: t.tasksBranchesError,
    },
    bodyLimit: BODY_LIMIT,
    mergedShown: MERGED_SHOWN,
    defaultBranch: DEFAULT_BRANCH,
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
<a class="tk-side__link" href="#pulls"><span>${escapeHtml(t.tasksPulls)}</span><span class="tk-count" data-count="pulls">–</span></a>
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
${stat("pulls", t.tasksPullsWaiting, "")}
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
<section class="tk-panel" id="pulls" aria-labelledby="tk-pulls-title">
<header class="tk-panel__head">
<h2 id="tk-pulls-title">${escapeHtml(t.tasksPulls)}</h2>
<a class="tk-btn tk-btn--quiet tk-panel__action" href="${REPO_URL}/pulls" target="_blank" rel="noopener">${ICON_GITHUB}<span>${escapeHtml(t.tasksPullsAll)}</span></a>
</header>
<p class="tk-panel__lede">${escapeHtml(t.tasksPullsLede)}</p>
<ul class="tk-pulls" id="tk-pulls" hidden></ul>
<p class="tk-empty" id="tk-pulls-empty" hidden></p>
<details class="tk-fold" id="tk-merged" hidden>
<summary id="tk-merged-summary"></summary>
<ul class="tk-pulls tk-pulls--merged" id="tk-merged-list"></ul>
</details>
<details class="tk-fold" id="tk-branches" hidden>
<summary>${escapeHtml(t.tasksBranches)}</summary>
<div class="tk-fold__body">
<p>${escapeHtml(t.tasksBranchesLede)}</p>
<p class="tk-fold__actions"><button type="button" class="tk-btn" id="tk-branches-check">${escapeHtml(t.tasksBranchesCheck)}</button><a href="${REPO_URL}/branches" target="_blank" rel="noopener">${escapeHtml(t.tasksBranchesManage)}</a></p>
<ul class="tk-branches" id="tk-branches-list" hidden></ul>
<p class="tk-fold__note" id="tk-branches-note" role="status" hidden></p>
</div>
</details>
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

// ------------------------------------------------------- files for machines

type MachineFile = {
  /** Key of its description in Strings.agentsFiles. */
  key: string;
  /** The path as shown. It may hold "{slug}". */
  path: string;
  /** A path of this kind that exists, to link to. */
  example: string;
};

/** The files the site publishes for machines, in the order /agents lists them. */
function machineFiles(entries: Entry[]): MachineFile[] {
  const perLanguage = (key: string, name: string): MachineFile[] =>
    LANGS.map((lang) => {
      const path = url(lang, `/${name}`);
      return { key: BASE[lang] ? `${key}_${lang}` : key, path, example: path };
    });
  const one = (key: string, path: string): MachineFile => ({
    key,
    path,
    example: path,
  });
  return [
    ...perLanguage("llms", "llms.txt"),
    ...perLanguage("llms_full", "llms-full.txt"),
    one("index", "/data/index.json"),
    {
      key: "term",
      path: "/data/terms/{slug}.json",
      example: `/data/terms/${entries[0]?.slug ?? ""}.json`,
    },
    one("graph", "/data/graph.json"),
    one("corpus", CORPUS_PATH),
    one("sitemap", "/sitemap.xml"),
    one("robots", "/robots.txt"),
    ...LANGS.map((lang) => ({
      key: BASE[lang] ? `markdown_${lang}` : "markdown",
      path: url(lang, "/{slug}.md"),
      example: url(lang, `/${entries[0]?.slug ?? ""}.md`),
    })),
    one("openapi", OPENAPI_PATH),
    one("server_card", SERVER_CARD_PATH),
    one("skills", SKILLS_INDEX_PATH),
    one("skill", SKILL_PATH),
  ];
}

/** Everything the MCP server answers from, and the source of the other files. */
function buildCorpus(sections: Section[], entries: Entry[]): Corpus {
  const slugOf = new Map(entries.map((e) => [e.term, e.slug]));
  const perLanguage = <T>(value: (lang: Lang) => T) =>
    Object.fromEntries(LANGS.map((lang) => [lang, value(lang)])) as Record<
      Lang,
      T
    >;

  const content = {
    sections: sections.map((s) => ({
      number: s.number,
      title: perLanguage(
        (lang) => STRINGS[lang].sectionTitles[s.title] ?? s.title
      ),
    })),
    terms: entries.map((e) => ({
      slug: e.slug,
      term: e.term,
      section: e.section.number,
      position: e.position,
      links: [...e.linksTo].map((term) => slugOf.get(term) as string),
      text: perLanguage((lang): CorpusText => {
        const text = e.text[lang];
        return {
          ...(text.name ? { name: text.name } : {}),
          description: text.description,
          body: text.markdown,
          usage: text.usageMarkdown,
          translated: text.translated,
        };
      }),
    })),
  };
  const files: Record<string, string> = {};
  for (const file of machineFiles(entries)) files[file.key] = file.path;

  return {
    // The same content always gives the same version.
    version: createHash("sha256")
      .update(JSON.stringify(content))
      .digest("hex")
      .slice(0, 12),
    site: SITE_URL,
    languages: LANGS,
    default_language: LANGS[0] as Lang,
    base: BASE,
    about: perLanguage((lang) => ({
      name: STRINGS[lang].siteName,
      description: STRINGS[lang].tagline,
    })),
    repository: REPO_URL,
    upstream: UPSTREAM_URL,
    files: {
      ...files,
      mcp: MCP_PATH,
      api: API_PATH,
      status: STATUS_PATH,
      docs: DOCS_PATH,
    },
    ...content,
  };
}

/** A value per language, such as the address of a term's page. */
function eachLanguage<T>(corpus: Corpus, value: (lang: Lang) => T) {
  return Object.fromEntries(
    corpus.languages.map((lang) => [lang, value(lang)])
  );
}

function pageUrl(lang: Lang, path: string): string {
  return SITE_URL + url(lang, path);
}

/** /data/index.json: every term, without its text. */
function indexData(corpus: Corpus): string {
  return JSON.stringify(
    {
      site: corpus.site,
      version: corpus.version,
      languages: corpus.languages,
      default_language: corpus.default_language,
      count: corpus.terms.length,
      sections: corpus.sections,
      terms: corpus.terms.map((term) => ({
        slug: term.slug,
        term: term.term,
        section: term.section,
        position: term.position,
        name: eachLanguage(corpus, (lang) => term.text[lang].name ?? null),
        description: eachLanguage(
          corpus,
          (lang) => term.text[lang].description
        ),
        url: eachLanguage(corpus, (lang) => pageUrl(lang, `/${term.slug}`)),
        data_url: `${SITE_URL}/data/terms/${term.slug}.json`,
      })),
    },
    null,
    1
  );
}

/** /data/terms/<slug>.json: one term in every language, with its links. */
function termData(corpus: Corpus, slug: string): string {
  const at = corpus.terms.findIndex((term) => term.slug === slug);
  const term = corpus.terms[at];
  if (!term) fail(`No term has the slug "${slug}".`);
  const named = (other: string) => ({
    slug: other,
    term: corpus.terms.find((t) => t.slug === other)?.term ?? other,
    data_url: `${SITE_URL}/data/terms/${other}.json`,
  });
  return JSON.stringify(
    {
      slug: term.slug,
      term: term.term,
      section: corpus.sections.find((s) => s.number === term.section),
      position: term.position,
      url: eachLanguage(corpus, (lang) => pageUrl(lang, `/${term.slug}`)),
      text: term.text,
      links: term.links.map(named),
      linked_from: corpus.terms
        .filter((other) => other.links.includes(term.slug))
        .map((other) => named(other.slug)),
      previous: corpus.terms[at - 1]?.slug ?? null,
      next: corpus.terms[at + 1]?.slug ?? null,
      corpus_version: corpus.version,
    },
    null,
    1
  );
}

/** /data/graph.json: the terms and the links between them, and nothing else. */
function publicGraph(corpus: Corpus): string {
  return JSON.stringify(
    {
      site: corpus.site,
      version: corpus.version,
      sections: corpus.sections,
      nodes: corpus.terms.map((term) => ({
        id: term.slug,
        term: term.term,
        section: term.section,
        position: term.position,
      })),
      // One edge for each link written in an entry, from that entry.
      edges: corpus.terms.flatMap((term) =>
        term.links.map((target) => ({ source: term.slug, target }))
      ),
    },
    null,
    1
  );
}

/** The heading of a term in a text file: the English term, then its name. */
function termHeading(site: Site, e: Entry): string {
  const name = e.text[site.lang].name;
  return name ? `${e.term} (${name})` : e.term;
}

function textFileHead(site: Site, note: string): string {
  return `# ${site.t.siteName}\n\n> ${site.t.tagline}\n\n${note}\n`;
}

/** /llms.txt: what the site is, then one line per term. */
function llmsText(site: Site, corpus: Corpus): string {
  const { lang, t, sections, entries } = site;
  const other = LANGS.filter((l) => l !== lang)
    .map((l) => pageUrl(l, "/llms.txt"))
    .join(", ");
  const intro = fill(t.llmsIntro, {
    count: entries.length,
    sections: sections.length,
    other,
  });
  // The ways in, most useful first. Each needs a name in site/strings.ts.
  const ways: [string, string][] = [
    ["mcp", SITE_URL + MCP_PATH],
    ["api", SITE_URL + API_PATH],
    ["openapi", SITE_URL + OPENAPI_PATH],
    ["markdown", `${pageUrl(lang, `/${entries[0]?.slug ?? ""}`)}.md`],
    ["full", pageUrl(lang, "/llms-full.txt")],
    ["index", `${SITE_URL}/data/index.json`],
    ["skills", SITE_URL + SKILLS_INDEX_PATH],
    ["card", SITE_URL + SERVER_CARD_PATH],
    ["guide", pageUrl(lang, "/agents")],
  ];
  const search = TOOLS.find((tool) => tool.name === "search") ?? TOOLS[0];
  const example = search ? SITE_URL + exampleAddress(search) : "";
  const connect = [
    `## ${t.llmsConnectTitle}`,
    ways
      .map(([key, address]) => {
        const text = t.llmsConnect[key];
        if (!text)
          fail(`site/strings.ts has no "${lang}" text for llms.txt "${key}".`);
        return `- [${text[0]}](${address}): ${fill(text[1], { example })}`;
      })
      .join("\n"),
    `### ${t.llmsToolsTitle}`,
    TOOLS.map(
      (tool) =>
        `- [${tool.name}](${pageUrl(lang, DOCS_PATH)}#tool-${tool.name}): ${tool.title}`
    ).join("\n"),
    `### ${t.llmsStartTitle}`,
    t.llmsStart.map((line) => `- ${line}`).join("\n"),
  ].join("\n\n");
  const body = sections
    .map(
      (s) =>
        `## ${s.number}. ${sectionTitle(site, s)}\n\n${s.entries
          .map(
            (e) =>
              `- [${termHeading(site, e)}](${pageUrl(lang, `/${e.slug}`)}): ${e.text[lang].description}`
          )
          .join("\n")}`
    )
    .join("\n\n");
  return `${textFileHead(site, intro)}\nVersion: ${corpus.version}\n\n${connect}\n\n${body}\n`;
}

/** /<slug>.md: one entry as markdown, for a reader that wants no HTML. */
function termMarkdown(site: Site, e: Entry): string {
  const { lang, t, entries } = site;
  const text = e.text[lang];
  const prev = entries[e.position - 2];
  const next = entries[e.position];
  const mentionedIn = entries.filter((o) => o.linksTo.has(e.term));
  const link = (o: Entry) => `[${o.term}](${pageUrl(lang, `/${o.slug}`)}.md)`;
  const lines = [
    `${fill(t.section, { n: e.section.number })} — ${sectionTitle(site, e.section)} · ${fill(t.termOf, { i: e.position, total: entries.length })}`,
    `${t.mdPage}: ${pageUrl(lang, `/${e.slug}`)}`,
    `${t.mdLearn}: ${pageUrl(lang, `/learn#/${e.slug}`)}`,
    `${t.mdMap}: ${pageUrl(lang, `/?term=${e.slug}`)}`,
    `${t.mdData}: ${SITE_URL}/data/terms/${e.slug}.json`,
    ...(mentionedIn.length
      ? [`${t.mentionedIn}: ${mentionedIn.map(link).join(", ")}`]
      : []),
    ...(prev ? [`${t.previous}: ${link(prev)}`] : []),
    ...(next ? [`${t.next}: ${link(next)}`] : []),
  ];
  return `${[
    `# ${termHeading(site, e)}`,
    `> ${text.description}`,
    text.markdown,
    ...(text.usageMarkdown ? [`**${t.usage}**`, text.usageMarkdown] : []),
    "---",
    lines.map((line) => `- ${line}`).join("\n"),
    t.mdNote,
  ].join("\n\n")}\n`;
}

type Json = Record<string, unknown>;

/** /openapi.json: the plain HTTP API, described from the server's own tools. */
function openApi(): string {
  const problem = (description: string) => ({
    description,
    content: {
      "application/json": { schema: { $ref: "#/components/schemas/Problem" } },
    },
  });
  const paths: Json = {
    [API_PATH]: {
      get: {
        operationId: "list_tools",
        summary: "List the tools",
        description:
          "What the API offers: each tool with its address, its parameters and an example that works.",
        responses: {
          "200": {
            description: "The tools.",
            content: {
              "application/json": { schema: { type: "object" } },
            },
          },
          "429": { $ref: "#/components/responses/TooManyRequests" },
        },
      },
    },
  };
  for (const tool of TOOLS) {
    const properties = (tool.inputSchema.properties ?? {}) as Record<
      string,
      Json
    >;
    const required = (tool.inputSchema.required ?? []) as string[];
    const responses = {
      "200": {
        description: "The answer of the tool.",
        content: { "application/json": { schema: tool.outputSchema } },
      },
      "400": { $ref: "#/components/responses/BadRequest" },
      "429": { $ref: "#/components/responses/TooManyRequests" },
      "503": { $ref: "#/components/responses/Unavailable" },
    };
    paths[`${API_PATH}/${tool.name}`] = {
      get: {
        operationId: tool.name,
        summary: tool.title,
        description: tool.description,
        parameters: Object.entries(properties).map(([name, property]) => {
          const { description, ...schema } = property;
          return {
            name,
            in: "query",
            required: required.includes(name),
            ...(description ? { description } : {}),
            // A list is written as values with commas between them.
            ...(schema.type === "array"
              ? { style: "form", explode: false }
              : {}),
            schema,
            ...(name in tool.example ? { example: tool.example[name] } : {}),
          };
        }),
        responses,
      },
      post: {
        operationId: `${tool.name}_post`,
        summary: `${tool.title} (POST)`,
        description:
          "The same call, with the parameters as a JSON object in the body.",
        requestBody: {
          required: required.length > 0,
          content: {
            "application/json": {
              schema: tool.inputSchema,
              example: tool.example,
            },
          },
        },
        responses,
      },
    };
  }
  return JSON.stringify(
    {
      openapi: "3.1.0",
      info: {
        title: `${SERVER.title} API`,
        version: SERVER.version,
        description: `${STRINGS.en.tagline} Every operation only reads and needs no sign-in. One address may send ${LIMITS.requests} requests per ${LIMITS.windowSeconds} seconds. The same tools are an MCP server at ${SITE_URL}${MCP_PATH}.`,
      },
      servers: [{ url: SITE_URL }],
      externalDocs: {
        description: "How to connect an agent",
        url: pageUrl("en", "/agents"),
      },
      paths,
      components: {
        schemas: {
          Problem: {
            type: "object",
            properties: {
              error: {
                type: "object",
                properties: {
                  code: { type: "string" },
                  message: { type: "string" },
                },
                required: ["code", "message"],
              },
              docs: { type: "string" },
            },
            required: ["error"],
          },
        },
        responses: {
          BadRequest: problem(
            "A parameter is missing or wrong. The message says which."
          ),
          TooManyRequests: problem(
            "Over the rate limit. Retry after the seconds in the Retry-After header."
          ),
          Unavailable: problem(
            "The dictionary data could not be loaded. Try again shortly."
          ),
        },
      },
    },
    null,
    1
  );
}

/** The MCP server card: lets a client find the server from the site address. */
function serverCard(): string {
  return JSON.stringify(
    {
      $schema:
        "https://static.modelcontextprotocol.io/schemas/mcp-server-card/v1.json",
      version: "1.0",
      protocolVersion: PROTOCOL_VERSIONS[0],
      serverInfo: SERVER,
      description: STRINGS.en.tagline,
      documentationUrl: pageUrl("en", DOCS_PATH),
      transport: { type: "streamable-http", endpoint: MCP_PATH },
      capabilities: { tools: { listChanged: false } },
      authentication: { required: false, schemes: [] },
      instructions: INSTRUCTIONS,
      tools: TOOLS.map((tool) => ({
        name: tool.name,
        title: tool.title,
        description: tool.description,
        inputSchema: tool.inputSchema,
      })),
    },
    null,
    1
  );
}

/** What the skill is for. The skill file and the index carry the same text. */
function skillDescription(count: number): string {
  return `Look up the vocabulary of coding with AI agents (context window, harness, subagent, compaction, MCP, hallucination and more) in a curated dictionary of ${count} terms, in English and Vietnamese. Use when the user asks what such a term means, how two terms differ, how terms relate, or wants one explained in Vietnamese.`;
}

/** The agent skill: when and how an agent should use this dictionary. */
function skillFile(entries: Entry[], sections: Section[]): string {
  const api = SITE_URL + API_PATH;
  const tools = TOOLS.map(
    (tool) =>
      `- \`${tool.name}\`: ${tool.title}. Example: \`GET ${SITE_URL}${exampleAddress(tool)}\``
  ).join("\n");
  const first = entries[0]?.slug ?? "";
  return `---
name: ${SKILL_NAME}
description: ${skillDescription(entries.length)}
---

# ${SERVER.title}

${entries.length} terms of coding with AI, in ${sections.length} sections that follow a teaching order. Every term has an English and a Vietnamese text. The site is ${SITE_URL}. Everything here only reads, and nothing needs a sign-in.

## When to use it

- The user asks what a term of AI coding means: "what is a context window", "harness là gì".
- The user asks how two terms differ, or how terms relate to each other.
- The user wants such a term explained in Vietnamese, or wants the accepted Vietnamese name of an English term.
- You are about to explain one of these terms and want a checked definition to cite.

Do not use it for anything else. The dictionary defines terms; it holds no news, no product documentation and no code.

## How to look a term up

Use the first way that you have.

1. **MCP.** Connect to \`${SITE_URL}${MCP_PATH}\` (Streamable HTTP, stateless). The tools are listed below.
2. **HTTP.** Call \`GET ${api}/<tool>?parameter=value\`. The answer is the same JSON object that the MCP tool returns. \`GET ${api}\` lists the tools, and \`${SITE_URL}${OPENAPI_PATH}\` describes them.
3. **Files.** Read \`${SITE_URL}/llms.txt\` for one line per term, then \`${SITE_URL}/<slug>.md\` for one term, such as \`${SITE_URL}/${first}.md\`. English is under \`/en\`.

## Tools

${tools}

## Rules

- With words or a question and no slug, call \`search\` first, then \`get_term\` with a slug from the results.
- \`search\` matches words, not meaning. When the results are no use, search again with the key noun only.
- An unknown slug is not an error: the answer has \`found: false\` and \`suggestions\`. Retry with one of them.
- Pass \`lang\` as \`vi\` or \`en\`, after the language the user writes in. The default is \`vi\`.
- Cite the \`url\` of each term you use.
- When the user wants to study a term, give its \`learn_url\`. When the user wants to see what a term connects to, give its \`map_url\`.
- One address may send ${LIMITS.requests} requests per ${LIMITS.windowSeconds} seconds. On \`429\`, wait for the seconds in \`Retry-After\`.
`;
}

/** /.well-known/agent-skills/index.json: the skills, each with its digest. */
function skillsIndex(skill: string, count: number): string {
  return JSON.stringify(
    {
      $schema: "https://schemas.agentskills.io/discovery/0.2.0/schema.json",
      skills: [
        {
          name: SKILL_NAME,
          type: "skill-md",
          description: skillDescription(count),
          url: SKILL_PATH,
          digest: `sha256:${createHash("sha256").update(skill).digest("hex")}`,
        },
      ],
    },
    null,
    1
  );
}

/**
 * Run the example of every tool on the data just built. The pages, the
 * OpenAPI file and the skill all show these examples as calls that work.
 */
/**
 * server.json is the listing of the MCP server in the official MCP Registry.
 * A published version cannot be changed, so the build stops when the file
 * and the server disagree.
 */
function checkServerManifest(): void {
  const path = join(ROOT, "server.json");
  if (!existsSync(path)) fail("server.json is missing at the repository root.");
  let manifest: Json;
  try {
    manifest = JSON.parse(readFileSync(path, "utf8")) as Json;
  } catch {
    fail("server.json is not valid JSON.");
  }
  const remotes = Array.isArray(manifest.remotes) ? manifest.remotes : [];
  const remote = (remotes[0] ?? {}) as Json;
  const repository = (manifest.repository ?? {}) as Json;
  const description = String(manifest.description ?? "");
  const wanted: [string, unknown, unknown][] = [
    ["name", manifest.name, `io.github.${REPO.split("/")[0]}/${SERVER.name}`],
    ["title", manifest.title, SERVER.title],
    ["version", manifest.version, SERVER.version],
    ["repository.url", repository.url, REPO_URL],
    ["remotes[0].type", remote.type, "streamable-http"],
    ["remotes[0].url", remote.url, PUBLIC_URL + MCP_PATH],
    ["websiteUrl", manifest.websiteUrl, `${PUBLIC_URL}/en${DOCS_PATH}`],
  ];
  for (const [field, found, expected] of wanted)
    if (found !== expected)
      fail(
        `server.json: "${field}" is ${JSON.stringify(found)}, and the code says ${JSON.stringify(expected)}. Change server.json, or SERVER in api/mcp.ts.`
      );
  if (remotes.length !== 1)
    fail("server.json: there must be exactly one entry in remotes.");
  // The registry refuses a description of more than 100 characters.
  if (description.length < 1 || description.length > 100)
    fail(
      `server.json: the description has ${description.length} characters, and the registry allows 1 to 100.`
    );
}

function checkToolExamples(corpus: Corpus): void {
  const index = buildIndex(corpus);
  for (const tool of TOOLS) {
    let answer: Json;
    try {
      answer = tool.run(index, tool.example);
    } catch (error) {
      fail(
        `The example of the tool "${tool.name}" in api/mcp.ts fails: ${error instanceof Error ? error.message : String(error)}`
      );
    }
    const missing = answer.missing;
    if (
      answer.found === false ||
      answer.total === 0 ||
      (Array.isArray(missing) && missing.length > 0)
    )
      fail(
        `The example of the tool "${tool.name}" in api/mcp.ts finds nothing in the dictionary.`
      );
  }
}

/** /llms-full.txt: every entry in full, in teaching order. */
function llmsFullText(site: Site): string {
  const { lang, t, sections, entries } = site;
  const note = fill(t.curriculumMeta, {
    count: entries.length,
    sections: sections.length,
  });
  const body = sections
    .map(
      (s) =>
        `## ${s.number}. ${sectionTitle(site, s)}\n\n${s.entries
          .map((e) => {
            const text = e.text[lang];
            return [
              `### ${termHeading(site, e)}`,
              `URL: ${pageUrl(lang, `/${e.slug}`)}`,
              `> ${text.description}`,
              text.markdown,
              ...(text.usageMarkdown
                ? [`**${t.usage}**`, text.usageMarkdown]
                : []),
            ].join("\n\n");
          })
          .join("\n\n")}`
    )
    .join("\n\n");
  return `${textFileHead(site, note)}\n${body}\n`;
}

/** /sitemap.xml: every page, each with its address in the other language. */
function sitemap(entries: Entry[]): string {
  const paths = [
    "/",
    "/learn",
    "/curriculum",
    "/a-z",
    "/agents",
    DOCS_PATH,
    "/tasks",
    ...entries.map((e) => `/${e.slug}`),
  ];
  const urls = paths.flatMap((path) =>
    LANGS.map(
      (lang) => `<url>
<loc>${escapeHtml(pageUrl(lang, path))}</loc>
${LANGS.map(
  (other) =>
    `<xhtml:link rel="alternate" hreflang="${other}" href="${escapeHtml(pageUrl(other, path))}"/>`
).join("\n")}
</url>`
    )
  );
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join("\n")}
</urlset>
`;
}

// ------------------------------------------------------------ agents pages

/** The line on a page that says whether the MCP server answers right now. */
function mcpStatus(site: Site): string {
  const { t } = site;
  return `<span class="mcp-status" data-mcp-status data-endpoint="${MCP_PATH}" data-ok="${escapeHtml(t.agentsStatusOk)}" data-down="${escapeHtml(t.agentsStatusDown)}" role="status">${escapeHtml(t.agentsStatusChecking)}</span>`;
}

function facts(rows: [string, string][]): string {
  return `<dl class="facts">
${rows.map(([name, value]) => `<div><dt>${escapeHtml(name)}</dt><dd>${value}</dd></div>`).join("\n")}
</dl>`;
}

function code(text: string): string {
  return `<code>${escapeHtml(text)}</code>`;
}

/** /agents: the two ways a machine can read the dictionary. */
function agentsPage(site: Site, files: MachineFile[]): string {
  const { lang, t } = site;
  const list = files
    .map((file) => {
      const what = t.agentsFiles[file.key];
      if (!what)
        fail(
          `site/strings.ts has no "${lang}" text for the file "${file.key}".`
        );
      return `<li><a href="${file.example}">${code(file.path)}</a><span>${escapeHtml(what)}</span></li>`;
    })
    .join("\n");
  return layout(site, {
    title: t.agentsTitle,
    description: fill(t.agentsDescription, { site: t.siteName }),
    path: "/agents",
    nav: null,
    variant: "agents",
    main: `<div class="agents">
<div class="hero hero-compact">
<h1>${escapeHtml(t.agentsTitle)}</h1>
<p class="lede">${escapeHtml(t.agentsLede)}</p>
</div>
<section class="section" aria-labelledby="mcp-heading">
<h2 id="mcp-heading">${escapeHtml(t.agentsMcpTitle)}</h2>
<p>${escapeHtml(t.agentsMcpLede)}</p>
${facts([
  [t.agentsEndpoint, code(SITE_URL + MCP_PATH)],
  [t.agentsStatusLabel, mcpStatus(site)],
])}
<p><a class="more" href="${url(lang, DOCS_PATH)}">${escapeHtml(t.agentsMcpMore)}</a></p>
</section>
<section class="section" id="api" aria-labelledby="api-heading">
<h2 id="api-heading">${escapeHtml(t.agentsApiTitle)}</h2>
<p>${escapeHtml(t.agentsApiLede)}</p>
${facts([
  [t.agentsEndpoint, `<a href="${API_PATH}">${code(SITE_URL + API_PATH)}</a>`],
  [t.agentsApiSpec, `<a href="${OPENAPI_PATH}">${code(OPENAPI_PATH)}</a>`],
])}
<p>${escapeHtml(t.agentsApiExamples)}</p>
<ul class="file-list">
${TOOLS.map((tool) => `<li><a href="${escapeHtml(exampleAddress(tool))}">${code(`GET ${exampleAddress(tool)}`)}</a><span${lang === "en" ? "" : ' lang="en"'}>${escapeHtml(tool.title)}</span></li>`).join("\n")}
</ul>
<p class="agents-note">${escapeHtml(t.agentsApiNote)}</p>
</section>
<section class="section" aria-labelledby="files-heading">
<h2 id="files-heading">${escapeHtml(t.agentsFilesTitle)}</h2>
<p>${escapeHtml(t.agentsFilesLede)}</p>
<ul class="file-list">
${list}
</ul>
<p class="agents-source">${linkify(t.agentsSource, { repo: REPO_URL, upstream: UPSTREAM_URL })}</p>
</section>
</div>`,
  });
}

/** How a JSON schema property reads in one short phrase. */
function schemaType(schema: Record<string, unknown>): string {
  if (Array.isArray(schema.enum))
    return schema.enum.map((value) => JSON.stringify(value)).join(" | ");
  if (schema.type === "array") {
    const items = schema.items as Record<string, unknown> | undefined;
    return `${items ? schemaType(items) : "any"}[]`;
  }
  return Array.isArray(schema.type)
    ? schema.type.join(" | ")
    : String(schema.type ?? "any");
}

/** /agents/mcp: how to connect to the MCP server, and what its tools do. */
function mcpPage(site: Site): string {
  const { lang, t } = site;
  const endpoint = SITE_URL + MCP_PATH;
  const config = JSON.stringify(
    { mcpServers: { [SERVER.name]: { type: "http", url: endpoint } } },
    null,
    2
  );
  // The tool texts are the server's own, in English, on every page.
  const english = lang === "en" ? "" : ' lang="en"';
  const tools = TOOLS.map((tool) => {
    const properties = (tool.inputSchema.properties ?? {}) as Record<
      string,
      Record<string, unknown>
    >;
    const required = (tool.inputSchema.required ?? []) as string[];
    const args = Object.entries(properties)
      .map(
        ([name, schema]) =>
          `<li>${code(name)} <span class="arg-type">${escapeHtml(schemaType(schema))}</span> <span class="arg-need">${escapeHtml(required.includes(name) ? t.agentsRequired : t.agentsOptional)}</span><p${english}>${escapeHtml(String(schema.description ?? ""))}</p></li>`
      )
      .join("\n");
    return `<article class="tool" id="tool-${tool.name}">
<h3>${code(tool.name)}<span${english}>${escapeHtml(tool.title)}</span></h3>
<p${english}>${escapeHtml(tool.description)}</p>
<h4>${escapeHtml(t.agentsArguments)}</h4>
<ul class="args">
${args}
</ul>
</article>`;
  }).join("\n");

  return layout(site, {
    title: t.agentsMcpTitle,
    description: fill(t.agentsDescription, { site: t.siteName }),
    path: DOCS_PATH,
    nav: null,
    variant: "agents",
    main: `<div class="agents">
<div class="hero hero-compact">
<p class="eyebrow"><a href="${url(lang, "/agents")}">${escapeHtml(t.agentsTitle)}</a></p>
<h1>${escapeHtml(t.agentsMcpTitle)}</h1>
<p class="lede">${escapeHtml(t.agentsMcpLede)}</p>
</div>
<section class="section" aria-labelledby="connect-heading">
<h2 id="connect-heading">${escapeHtml(t.agentsConnectTitle)}</h2>
${facts([
  [t.agentsEndpoint, code(endpoint)],
  [t.agentsTransport, escapeHtml(t.agentsTransportValue)],
  [t.agentsProtocol, PROTOCOL_VERSIONS.map(code).join(", ")],
  [t.agentsMethods, `${code("POST")}, ${code("OPTIONS")}`],
  [t.agentsBodyCap, `${LIMITS.bodyBytes / 1024} KiB`],
  [
    t.agentsRate,
    escapeHtml(
      fill(t.agentsRateValue, {
        count: LIMITS.requests,
        seconds: LIMITS.windowSeconds,
      })
    ),
  ],
  [
    t.agentsStatusLabel,
    `${mcpStatus(site)} <a href="${STATUS_PATH}">${code(STATUS_PATH)}</a>`,
  ],
])}
<p class="agents-note">${escapeHtml(t.agentsLimitsNote)}</p>
<p>${escapeHtml(t.agentsConnectConfig)}</p>
<pre><code>${escapeHtml(config)}</code></pre>
<p>${escapeHtml(t.agentsConnectClaude)}</p>
<pre><code>${escapeHtml(`claude mcp add --transport http ${SERVER.name} ${endpoint}`)}</code></pre>
</section>
<section class="section" aria-labelledby="try-heading">
<h2 id="try-heading">${escapeHtml(t.agentsTryTitle)}</h2>
<p>${escapeHtml(t.agentsTryLede)}</p>
<form class="try" id="mcp-try" data-endpoint="${MCP_PATH}" data-lang="${lang}" data-empty="${escapeHtml(t.agentsTryEmpty)}" data-error="${escapeHtml(t.agentsTryError)}">
<label for="mcp-query">${escapeHtml(t.agentsTryLabel)}</label>
<div class="try-row">
<input id="mcp-query" name="query" type="text" maxlength="${LIMITS.textLength}" placeholder="${escapeHtml(t.agentsTryPlaceholder)}" autocomplete="off" spellcheck="false" required>
<button type="submit">${escapeHtml(t.agentsTryButton)}</button>
</div>
</form>
<div id="mcp-results" class="try-results" aria-live="polite"></div>
<details id="mcp-raw" class="try-raw" hidden>
<summary>${escapeHtml(t.agentsTryRaw)}</summary>
<pre><code></code></pre>
</details>
</section>
<section class="section" aria-labelledby="tools-heading">
<h2 id="tools-heading">${escapeHtml(t.agentsToolsTitle)}</h2>
<p>${escapeHtml(fill(t.agentsToolsLede, { count: TOOLS.length }))}</p>
${tools}
</section>
</div>`,
  });
}

// ----------------------------------------------------------------- not found

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

/** Every file written so far, as a path from the site root. */
const written = new Set<string>();

function write(relPath: string, content: string): void {
  written.add(`/${relPath}`);
  const path = join(OUT, relPath);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content);
}

/**
 * Copy site/fonts.css and every font file it names to dist/assets, with the
 * licence text of each typeface. Stops when a named file is in no package.
 */
function copyTextFonts(): number {
  const css = readFileSync(join(HERE, "fonts.css"), "utf8");
  const names = [...css.matchAll(/url\("\/assets\/fonts\/([^"]+)"\)/g)].map(
    (m) => m[1]!
  );
  if (names.length === 0) fail("site/fonts.css names no font file.");
  for (const name of names) {
    const pack = TEXT_FONT_PACKAGES.find((p) => name.startsWith(p.prefix));
    const from = pack
      ? join(ROOT, "node_modules", ...pack.dir, "files", name)
      : "";
    if (!pack || !existsSync(from))
      fail(
        `site/fonts.css names ${name}, which no font package has. Run "npm ci".`
      );
    copyFileSync(from, join(OUT, "assets", "fonts", name));
  }
  for (const pack of TEXT_FONT_PACKAGES)
    copyFileSync(
      join(ROOT, "node_modules", ...pack.dir, "LICENSE"),
      join(OUT, "assets", "fonts", `OFL-${pack.licence}.txt`)
    );
  copyFileSync(join(HERE, "fonts.css"), join(OUT, "assets", "fonts.css"));
  return names.length;
}

/**
 * Copy the Game9K screens of phase P02 so each pull request has a preview.
 * They are static files, served as they are at /game9k/02-ux/<screen>.
 * The pages carry "noindex" and are in no sitemap.
 */
function copyGame9kScreens(): number {
  const from = join(ROOT, "game9k", "02-ux");
  if (!existsSync(from)) return 0;
  const to = join(OUT, "game9k", "02-ux");
  mkdirSync(to, { recursive: true });
  const files = readdirSync(from).filter((name) =>
    /\.(html|css|js)$/.test(name)
  );
  for (const name of files) copyFileSync(join(from, name), join(to, name));
  return files.filter((name) => name.endsWith(".html")).length;
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
  const game9kScreens = copyGame9kScreens();
  copyFileSync(join(HERE, "styles.css"), join(OUT, "assets", "styles.css"));
  copyFileSync(join(HERE, "app.js"), join(OUT, "assets", "app.js"));
  copyFileSync(join(HERE, "graph.js"), join(OUT, "assets", "graph.js"));
  copyFileSync(join(HERE, "learn.css"), join(OUT, "assets", "learn.css"));
  copyFileSync(join(HERE, "learn.js"), join(OUT, "assets", "learn.js"));
  copyFileSync(join(HERE, "tasks.css"), join(OUT, "assets", "tasks.css"));
  copyFileSync(join(HERE, "tasks.js"), join(OUT, "assets", "tasks.js"));
  copyFileSync(join(HERE, "agents.css"), join(OUT, "assets", "agents.css"));
  copyFileSync(join(HERE, "agents.js"), join(OUT, "assets", "agents.js"));
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
  const textFonts = copyTextFonts();
  write("favicon.svg", FAVICON);

  // The files for machines come first: the /agents page lists what was written.
  const corpus = buildCorpus(sections, entries);
  write(CORPUS_PATH.slice(1), JSON.stringify(corpus));
  write("data/index.json", indexData(corpus));
  write("data/graph.json", publicGraph(corpus));
  for (const term of corpus.terms)
    write(`data/terms/${term.slug}.json`, termData(corpus, term.slug));
  checkToolExamples(corpus);
  checkServerManifest();
  for (const site of sites) {
    write(url(site.lang, "/llms.txt").slice(1), llmsText(site, corpus));
    write(url(site.lang, "/llms-full.txt").slice(1), llmsFullText(site));
    for (const e of entries)
      write(url(site.lang, `/${e.slug}.md`).slice(1), termMarkdown(site, e));
  }
  write(OPENAPI_PATH.slice(1), openApi());
  write(SERVER_CARD_PATH.slice(1), serverCard());
  const skill = skillFile(entries, sections);
  write(SKILL_PATH.slice(1), skill);
  write(SKILLS_INDEX_PATH.slice(1), skillsIndex(skill, entries.length));
  write("sitemap.xml", sitemap(entries));
  write(
    "robots.txt",
    `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`
  );
  const files = machineFiles(entries);
  for (const file of files)
    if (!written.has(file.example))
      fail(`/agents lists ${file.path}, but the build did not write it.`);

  for (const site of sites) {
    // "" for the default language, "en/" for English.
    const dir = BASE[site.lang].replace(/^\//, "");
    const at = (path: string) => (dir ? `${dir}/${path}` : path);

    write(at("index.html"), mapPage(site));
    write(at("graph.json"), graphData(site));
    write(at("learn/index.html"), learnPage(site));
    write(at("learn.json"), learnData(site));
    write(at("tasks/index.html"), tasksPage(site, adrs, snapshot));
    write(at("agents/index.html"), agentsPage(site, files));
    write(at("agents/mcp/index.html"), mcpPage(site));
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
    `For machines: corpus ${corpus.version}, ${files.length} kinds of file, ${TOOLS.length} MCP tools documented`
  );
  console.log(
    `Tasks page: ${adrs.length} decision records, ${snapshot ? `${snapshot.tasks.length} issues saved` : "no saved issues"}`
  );
  console.log(`Typefaces: ${textFonts} font files copied to /assets/fonts`);
  console.log(
    `Game9K: ${game9kScreens} screens of phase P02 copied to /game9k/02-ux`
  );
}

await main();
