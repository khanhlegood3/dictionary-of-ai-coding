// The MCP server of the dictionary. Read-only, stateless, Streamable HTTP.
// Vercel serves this file at /api/mcp, and vercel.json maps /status.json to it.
// (The address /mcp is taken: it is the page of the term "MCP".)
//
// The file imports nothing, on purpose. Vercel compiles it on its own, the
// site build reads TOOLS and LIMITS from it to write the /agents page, and
// site/serve.ts runs it locally. One file with no imports behaves the same in
// all three places.
//
// The server holds no data. On the first call it fetches /data/corpus.json,
// which the site build writes, from the address it was called at.

// ------------------------------------------------------------------ facts

export const SERVER = {
  name: "ai-coding-dictionary",
  title: "AI Coding Dictionary",
  version: "1.0.0",
};

/** Newest first. A client that asks for another version is offered the first. */
export const PROTOCOL_VERSIONS = ["2025-06-18", "2025-03-26", "2024-11-05"];

export const LIMITS = {
  /** Largest request body, in bytes. A larger one gets 413. */
  bodyBytes: 64 * 1024,
  /** Requests one address may send per window. More gets 429. */
  requests: 60,
  windowSeconds: 60,
  /** Messages in one JSON-RPC batch. */
  batch: 10,
  searchResults: 20,
  compareTerms: 6,
  /** Longest text argument, in characters. */
  textLength: 200,
};

export const CORPUS_PATH = "/data/corpus.json";
export const DOCS_PATH = "/agents/mcp";
/** A GET here says whether the server can read the corpus. */
export const STATUS_PATH = "/status.json";

// ------------------------------------------------------------------- data

export type Lang = "vi" | "en";

export type CorpusText = {
  /** The term's name in this language, when it has one besides the English. */
  name?: string;
  description: string;
  /** Markdown. Links to other terms are full addresses. */
  body: string;
  /** The usage dialogue, as markdown. Empty when the entry has none. */
  usage: string;
  /** False when this language has no translation and the English text is used. */
  translated: boolean;
};

export type CorpusTerm = {
  slug: string;
  /** The English term. It is the title in every language. */
  term: string;
  section: number;
  /** Place in the teaching order, from 1. */
  position: number;
  /** Slugs of the terms this entry links to. */
  links: string[];
  text: Record<Lang, CorpusText>;
};

/** Everything the server answers from. Written by site/build.ts. */
export type Corpus = {
  /** Changes when any term changes. */
  version: string;
  /** Address of the site, without a slash at the end. */
  site: string;
  languages: Lang[];
  default_language: Lang;
  /** Path prefix of each language: "" for the default one. */
  base: Record<Lang, string>;
  about: Record<Lang, { name: string; description: string }>;
  repository: string;
  upstream: string;
  /** Paths of the files the site publishes for machines. */
  files: Record<string, string>;
  sections: { number: number; title: Record<Lang, string> }[];
  terms: CorpusTerm[];
};

type Field = "name" | "description" | "body";

const FIELD_WEIGHT: Record<Field, number> = {
  name: 4,
  description: 2,
  body: 1,
};
const FIELDS: Field[] = ["name", "description", "body"];

type Doc = {
  term: CorpusTerm;
  tokens: Record<Field, Set<string>>;
  /** Each name of the term, in any language, as normalised words. */
  names: string[][];
};

type Index = {
  corpus: Corpus;
  bySlug: Map<string, CorpusTerm>;
  /** Slugs of the terms that link to a term. */
  linkedFrom: Map<string, string[]>;
  docs: Doc[];
  /** In how many terms a word occurs. */
  frequency: Map<string, number>;
  /** A normalised name, in any language, to its slug. */
  names: Map<string, string>;
};

/** Lower case, no accents, so "ngu canh" finds "ngữ cảnh". */
export function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/đ/g, "d");
}

function words(text: string): string[] {
  return normalize(text)
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
}

// Same rule as site/build.ts, so a term has one slug everywhere.
function slugify(term: string): string {
  return term
    .toLowerCase()
    .replace(/[^\p{L}\p{N} -]/gu, "")
    .trim()
    .replace(/ +/g, "-");
}

export function buildIndex(corpus: Corpus): Index {
  const bySlug = new Map<string, CorpusTerm>();
  const linkedFrom = new Map<string, string[]>();
  const names = new Map<string, string>();
  const frequency = new Map<string, number>();
  const docs: Doc[] = [];

  for (const term of corpus.terms) bySlug.set(term.slug, term);
  for (const term of corpus.terms) {
    for (const target of term.links) {
      const list = linkedFrom.get(target) ?? [];
      list.push(term.slug);
      linkedFrom.set(target, list);
    }

    const tokens: Record<Field, Set<string>> = {
      name: new Set(words(term.term)),
      description: new Set<string>(),
      body: new Set<string>(),
    };
    names.set(normalize(term.term), term.slug);
    const own = [term.term];
    for (const lang of corpus.languages) {
      const text = term.text[lang];
      if (!text) continue;
      if (text.name) {
        own.push(text.name);
        names.set(normalize(text.name), term.slug);
        for (const w of words(text.name)) tokens.name.add(w);
      }
      for (const w of words(text.description)) tokens.description.add(w);
      for (const w of words(text.body)) tokens.body.add(w);
      for (const w of words(text.usage)) tokens.body.add(w);
    }
    docs.push({
      term,
      tokens,
      names: own.map(words),
    });

    const seen = new Set<string>();
    for (const field of FIELDS) for (const w of tokens[field]) seen.add(w);
    for (const w of seen) frequency.set(w, (frequency.get(w) ?? 0) + 1);
  }
  return { corpus, bySlug, linkedFrom, docs, frequency, names };
}

// ----------------------------------------------------------------- lookup

function distance(a: string, b: string): number {
  let previous: number[] = [];
  for (let j = 0; j <= b.length; j++) previous.push(j);
  for (let i = 1; i <= a.length; i++) {
    const current: number[] = [i];
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      current.push(
        Math.min(
          (previous[j] ?? 0) + 1,
          (current[j - 1] ?? 0) + 1,
          (previous[j - 1] ?? 0) + cost
        )
      );
    }
    previous = current;
  }
  return previous[b.length] ?? 0;
}

/** A slug, a term or a translated name, to the term it means. */
function resolve(index: Index, given: string): CorpusTerm | undefined {
  const exact = index.bySlug.get(given) ?? index.bySlug.get(slugify(given));
  if (exact) return exact;
  const byName = index.names.get(normalize(given).trim());
  return byName ? index.bySlug.get(byName) : undefined;
}

type Hit = { term: CorpusTerm; score: number; fields: Field[] };

/** A result that scores under this share of the best one is left out. */
const WEAKEST = 0.1;
const WEAKEST_SCORE = 0.5;

/**
 * Extra score for a term whose name the query holds. The words of a name
 * point at that term, however often other terms mention them.
 */
function nameBonus(doc: Doc, asked: Set<string>, whole: string): number {
  let bonus = 0;
  for (const name of doc.names) {
    // The query is the name, with or without its spaces: "sub agent".
    if (name.join("") === whole.replace(/ /g, "")) return 100;
    let held = 0;
    for (const word of name) if (asked.has(word)) held += 1;
    // The whole name is somewhere in the query: "what is a harness".
    if (held === name.length && held > 0) bonus = Math.max(bonus, 40);
    // At least two words of the name, and at least half of it.
    else if (held >= 2 && held * 2 >= name.length)
      bonus = Math.max(bonus, (20 * held) / name.length);
    // The query is the start of the name: "context w".
    if (name.join(" ").startsWith(whole)) bonus = Math.max(bonus, 10);
  }
  return bonus;
}

function searchIndex(index: Index, query: string): Hit[] {
  const asked = new Set(words(query));
  if (!asked.size) return [];
  const total = index.docs.length;
  // A word that few terms use says more about what was asked.
  const rarity = (word: string) => {
    const n = index.frequency.get(word) ?? 0;
    return Math.log(1 + (total - n + 0.5) / (n + 0.5));
  };
  const whole = words(query).join(" ");

  const hits: Hit[] = [];
  for (const doc of index.docs) {
    let score = 0;
    const fields = new Set<Field>();
    for (const word of asked) {
      let best = 0;
      for (const field of FIELDS) {
        let weight = 0;
        if (doc.tokens[field].has(word)) weight = FIELD_WEIGHT[field];
        else if (word.length >= 3) {
          // The start of a word counts for half: "compact" finds "compaction".
          for (const have of doc.tokens[field]) {
            if (have.startsWith(word)) {
              weight = FIELD_WEIGHT[field] / 2;
              break;
            }
          }
        }
        if (weight > 0) fields.add(field);
        best = Math.max(best, weight);
      }
      score += rarity(word) * best;
    }
    score += nameBonus(doc, asked, whole);
    // Sharing only words that most terms use, such as "the", is no match.
    if (score < WEAKEST_SCORE) continue;

    hits.push({
      term: doc.term,
      score,
      fields: FIELDS.filter((field) => fields.has(field)),
    });
  }
  hits.sort((a, b) => b.score - a.score || a.term.position - b.term.position);
  // Terms that only share the common words of a question are noise.
  const best = hits[0]?.score ?? 0;
  return hits.filter((hit) => hit.score >= best * WEAKEST);
}

/** Terms a wrong slug may have meant, so a miss still leads somewhere. */
function suggest(
  index: Index,
  given: string
): { slug: string; term: string }[] {
  const wanted = slugify(normalize(given)) || normalize(given);
  const scored: { term: CorpusTerm; rank: number }[] = [];
  for (const term of index.corpus.terms) {
    const far = distance(wanted, term.slug);
    const near =
      wanted.length >= 3 &&
      (term.slug.includes(wanted) || wanted.includes(term.slug));
    if (near) scored.push({ term, rank: Math.min(far, 1) });
    else if (far <= Math.max(2, Math.floor(wanted.length / 3)))
      scored.push({ term, rank: far });
  }
  scored.sort((a, b) => a.rank - b.rank || a.term.position - b.term.position);
  const found = scored.map((s) => s.term);
  for (const hit of searchIndex(index, given)) {
    if (found.length >= 3) break;
    if (!found.includes(hit.term)) found.push(hit.term);
  }
  return found
    .slice(0, 3)
    .map((term) => ({ slug: term.slug, term: term.term }));
}

// ------------------------------------------------------------------ shapes

function address(corpus: Corpus, lang: Lang, slug: string): string {
  return `${corpus.site}${corpus.base[lang] ?? ""}/${slug}`;
}

function sectionOf(corpus: Corpus, lang: Lang, number: number) {
  const section = corpus.sections.find((s) => s.number === number);
  return { number, title: section?.title[lang] ?? "" };
}

function card(corpus: Corpus, lang: Lang, term: CorpusTerm) {
  return {
    slug: term.slug,
    term: term.term,
    name: term.text[lang]?.name ?? null,
    description: term.text[lang]?.description ?? "",
    section: sectionOf(corpus, lang, term.section),
    url: address(corpus, lang, term.slug),
  };
}

function cards(index: Index, lang: Lang, slugs: string[]) {
  const list = [];
  for (const slug of slugs) {
    const term = index.bySlug.get(slug);
    if (term) list.push(card(index.corpus, lang, term));
  }
  return list;
}

// --------------------------------------------------------------- arguments

/** A problem with what the caller sent. Its message goes back to the caller. */
class InputError extends Error {}

type Arguments = Record<string, unknown>;

function langOf(index: Index, args: Arguments): Lang {
  const given = args.lang;
  if (given === undefined || given === null)
    return index.corpus.default_language;
  if (given === "vi" || given === "en") return given;
  throw new InputError('"lang" must be "vi" or "en".');
}

function textOf(args: Arguments, key: string): string {
  const given = args[key];
  if (typeof given !== "string" || !given.trim())
    throw new InputError(`"${key}" must be a non-empty string.`);
  if (given.length > LIMITS.textLength)
    throw new InputError(
      `"${key}" must be at most ${LIMITS.textLength} characters.`
    );
  return given.trim();
}

// -------------------------------------------------------------------- tools

type JsonSchema = Record<string, unknown>;

export type Tool = {
  name: string;
  title: string;
  description: string;
  inputSchema: JsonSchema;
  outputSchema: JsonSchema;
  run: (index: Index, args: Arguments) => Record<string, unknown>;
};

const LANG_SCHEMA: JsonSchema = {
  type: "string",
  enum: ["vi", "en"],
  description:
    'Language of the text in the answer: "vi" (Vietnamese, the default) or "en" (English). Use the language the user writes in.',
};

const SECTION_SCHEMA: JsonSchema = {
  type: "object",
  properties: { number: { type: "integer" }, title: { type: "string" } },
  required: ["number", "title"],
};

const CARD_SCHEMA: JsonSchema = {
  type: "object",
  properties: {
    slug: { type: "string" },
    term: { type: "string", description: "The English term." },
    name: {
      type: ["string", "null"],
      description: "The term's name in the chosen language, when it has one.",
    },
    description: { type: "string" },
    section: SECTION_SCHEMA,
    url: { type: "string" },
  },
  required: ["slug", "term", "name", "description", "section", "url"],
};

const SUGGESTIONS_SCHEMA: JsonSchema = {
  type: "array",
  description:
    "Terms the caller may have meant. Retry with one of these slugs.",
  items: {
    type: "object",
    properties: { slug: { type: "string" }, term: { type: "string" } },
    required: ["slug", "term"],
  },
};

export const TOOLS: Tool[] = [
  {
    name: "get_overview",
    title: "Overview of the dictionary",
    description:
      "What this dictionary covers: the number of terms, the curriculum sections in teaching order, the languages, and the files the site publishes for machines. Takes no required arguments. Use this first when you do not yet know whether the dictionary can answer the question.",
    inputSchema: { type: "object", properties: { lang: LANG_SCHEMA } },
    outputSchema: {
      type: "object",
      properties: {
        name: { type: "string" },
        description: { type: "string" },
        site: { type: "string" },
        languages: { type: "array", items: { type: "string" } },
        default_language: { type: "string" },
        corpus_version: { type: "string" },
        term_count: { type: "integer" },
        sections: {
          type: "array",
          items: {
            type: "object",
            properties: {
              number: { type: "integer" },
              title: { type: "string" },
              term_count: { type: "integer" },
              terms: { type: "array", items: { type: "string" } },
            },
            required: ["number", "title", "term_count", "terms"],
          },
        },
        files: { type: "object", additionalProperties: { type: "string" } },
        repository: { type: "string" },
        upstream: { type: "string" },
      },
      required: [
        "name",
        "description",
        "site",
        "languages",
        "default_language",
        "corpus_version",
        "term_count",
        "sections",
        "files",
        "repository",
        "upstream",
      ],
    },
    run(index, args) {
      const lang = langOf(index, args);
      const { corpus } = index;
      const files: Record<string, string> = {};
      for (const [key, path] of Object.entries(corpus.files))
        files[key] = corpus.site + path;
      return {
        name: corpus.about[lang]?.name ?? "",
        description: corpus.about[lang]?.description ?? "",
        site: corpus.site + (corpus.base[lang] || "/"),
        languages: corpus.languages,
        default_language: corpus.default_language,
        corpus_version: corpus.version,
        term_count: corpus.terms.length,
        sections: corpus.sections.map((section) => {
          const terms = corpus.terms.filter(
            (t) => t.section === section.number
          );
          return {
            number: section.number,
            title: section.title[lang] ?? "",
            term_count: terms.length,
            terms: terms.map((t) => t.slug),
          };
        }),
        files,
        repository: corpus.repository,
        upstream: corpus.upstream,
      };
    },
  },
  {
    name: "search",
    title: "Search the dictionary",
    description:
      "Find terms by words. Matching ignores accents and letter case, and looks at the English and the Vietnamese text together, so query in the user's own words in either language. A word that few terms use counts for more than a common one, and a hit in the term's name counts for more than one in its text. A term whose whole name appears in the query comes first. A result that scores under a tenth of the best one is left out, so the list is short rather than noisy. This is word matching, not a search by meaning: when a question returns nothing useful, retry with the key noun. Use this when you have words or a question and no slug, then call get_term with a slug from the results.",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: `Words to look for, at most ${LIMITS.textLength} characters.`,
        },
        lang: LANG_SCHEMA,
        limit: {
          type: "integer",
          minimum: 1,
          maximum: LIMITS.searchResults,
          description: `How many results to return, 1 to ${LIMITS.searchResults}. The default is 8.`,
        },
      },
      required: ["query"],
    },
    outputSchema: {
      type: "object",
      properties: {
        query: { type: "string" },
        lang: { type: "string" },
        total: {
          type: "integer",
          description: "How many terms matched, before the limit.",
        },
        results: {
          type: "array",
          items: {
            type: "object",
            properties: {
              slug: { type: "string" },
              term: { type: "string" },
              name: { type: ["string", "null"] },
              description: { type: "string" },
              section: SECTION_SCHEMA,
              url: { type: "string" },
              score: { type: "number" },
              matched_fields: {
                type: "array",
                items: { type: "string", enum: FIELDS },
              },
            },
            required: [
              "slug",
              "term",
              "name",
              "description",
              "section",
              "url",
              "score",
              "matched_fields",
            ],
          },
        },
      },
      required: ["query", "lang", "total", "results"],
    },
    run(index, args) {
      const lang = langOf(index, args);
      const query = textOf(args, "query");
      let limit = 8;
      if (args.limit !== undefined && args.limit !== null) {
        if (
          typeof args.limit !== "number" ||
          !Number.isInteger(args.limit) ||
          args.limit < 1 ||
          args.limit > LIMITS.searchResults
        )
          throw new InputError(
            `"limit" must be a whole number from 1 to ${LIMITS.searchResults}.`
          );
        limit = args.limit;
      }
      const hits = searchIndex(index, query);
      return {
        query,
        lang,
        total: hits.length,
        results: hits.slice(0, limit).map((hit) => ({
          ...card(index.corpus, lang, hit.term),
          score: Math.round(hit.score * 100) / 100,
          matched_fields: hit.fields,
        })),
      };
    },
  },
  {
    name: "get_term",
    title: "Read one term",
    description:
      'The full entry of one term: its description, the body and the usage dialogue as markdown, its section, the terms it links to and the terms that link to it. Pass a slug such as "context-window"; the English term or its Vietnamese name also works. An unknown slug is not a dead end: found is false and suggestions names the nearest terms to retry with. Use this once search, get_section or get_related has given you a slug.',
    inputSchema: {
      type: "object",
      properties: {
        slug: {
          type: "string",
          description: 'The term\'s slug, such as "context-window".',
        },
        lang: LANG_SCHEMA,
      },
      required: ["slug"],
    },
    outputSchema: {
      type: "object",
      properties: {
        found: { type: "boolean" },
        query: { type: "string" },
        term: {
          type: "object",
          properties: {
            slug: { type: "string" },
            term: { type: "string" },
            name: { type: ["string", "null"] },
            description: { type: "string" },
            section: SECTION_SCHEMA,
            url: { type: "string" },
            position: {
              type: "integer",
              description: "Place in the teaching order, from 1.",
            },
            body: { type: "string", description: "Markdown." },
            usage: {
              type: "string",
              description:
                "A short dialogue that uses the term, as markdown. Empty when the entry has none.",
            },
            translated: {
              type: "boolean",
              description:
                "False when the chosen language has no translation and the English text is returned.",
            },
            links_to: { type: "array", items: CARD_SCHEMA },
            linked_from: { type: "array", items: CARD_SCHEMA },
            data_url: {
              type: "string",
              description: "The same entry as a JSON file, in every language.",
            },
          },
          required: [
            "slug",
            "term",
            "name",
            "description",
            "section",
            "url",
            "position",
            "body",
            "usage",
            "translated",
            "links_to",
            "linked_from",
            "data_url",
          ],
        },
        suggestions: SUGGESTIONS_SCHEMA,
      },
      required: ["found", "query"],
    },
    run(index, args) {
      const lang = langOf(index, args);
      const query = textOf(args, "slug");
      const term = resolve(index, query);
      if (!term)
        return { found: false, query, suggestions: suggest(index, query) };
      const text = term.text[lang];
      return {
        found: true,
        query,
        term: {
          ...card(index.corpus, lang, term),
          position: term.position,
          body: text?.body ?? "",
          usage: text?.usage ?? "",
          translated: text?.translated ?? false,
          links_to: cards(index, lang, term.links),
          linked_from: cards(
            index,
            lang,
            index.linkedFrom.get(term.slug) ?? []
          ),
          data_url: `${index.corpus.site}/data/terms/${term.slug}.json`,
        },
      };
    },
  },
  {
    name: "get_section",
    title: "List the terms of a section",
    description:
      "The terms of one curriculum section, in teaching order, each with its description. Sections are numbered from 1; get_overview lists them. An unknown number comes back with found false and the sections that do exist. Use this to browse a part of the curriculum; use search when you have a question rather than a section.",
    inputSchema: {
      type: "object",
      properties: {
        section: {
          type: "integer",
          minimum: 1,
          description: "The section's number, from get_overview.",
        },
        lang: LANG_SCHEMA,
      },
      required: ["section"],
    },
    outputSchema: {
      type: "object",
      properties: {
        found: { type: "boolean" },
        section: SECTION_SCHEMA,
        terms: { type: "array", items: CARD_SCHEMA },
        sections: {
          type: "array",
          description: "The sections that exist. Present when found is false.",
          items: SECTION_SCHEMA,
        },
      },
      required: ["found"],
    },
    run(index, args) {
      const lang = langOf(index, args);
      const number = args.section;
      if (typeof number !== "number" || !Number.isInteger(number))
        throw new InputError('"section" must be a whole number.');
      const { corpus } = index;
      if (!corpus.sections.some((s) => s.number === number))
        return {
          found: false,
          sections: corpus.sections.map((s) =>
            sectionOf(corpus, lang, s.number)
          ),
        };
      return {
        found: true,
        section: sectionOf(corpus, lang, number),
        terms: corpus.terms
          .filter((t) => t.section === number)
          .map((t) => card(corpus, lang, t)),
      };
    },
  },
  {
    name: "get_related",
    title: "Terms linked to a term",
    description:
      "The neighbours of a term in the link graph: the terms its entry links to, and the terms whose entries link to it, each with its description. It walks one step from a term you already have. Use this after get_term to widen an answer; use search when you have a question and no starting term. An unknown slug comes back with found false and suggestions.",
    inputSchema: {
      type: "object",
      properties: {
        slug: {
          type: "string",
          description: 'The term\'s slug, such as "context-window".',
        },
        lang: LANG_SCHEMA,
      },
      required: ["slug"],
    },
    outputSchema: {
      type: "object",
      properties: {
        found: { type: "boolean" },
        query: { type: "string" },
        slug: { type: "string" },
        term: { type: "string" },
        links_to: { type: "array", items: CARD_SCHEMA },
        linked_from: { type: "array", items: CARD_SCHEMA },
        suggestions: SUGGESTIONS_SCHEMA,
      },
      required: ["found", "query"],
    },
    run(index, args) {
      const lang = langOf(index, args);
      const query = textOf(args, "slug");
      const term = resolve(index, query);
      if (!term)
        return { found: false, query, suggestions: suggest(index, query) };
      return {
        found: true,
        query,
        slug: term.slug,
        term: term.term,
        links_to: cards(index, lang, term.links),
        linked_from: cards(index, lang, index.linkedFrom.get(term.slug) ?? []),
      };
    },
  },
  {
    name: "compare",
    title: "Compare terms",
    description: `Two to ${LIMITS.compareTerms} terms side by side: each one's description, body and section, whether they share a section, the links that run between them, and the terms that all of them link to. Use this when the question is "X vs Y" or "how does X differ from Y". Call search first if you only have names. An unknown slug lands in missing with suggestions, and the rest are still compared.`,
    inputSchema: {
      type: "object",
      properties: {
        slugs: {
          type: "array",
          items: { type: "string" },
          minItems: 2,
          maxItems: LIMITS.compareTerms,
          description: `Slugs of the terms to compare, 2 to ${LIMITS.compareTerms}.`,
        },
        lang: LANG_SCHEMA,
      },
      required: ["slugs"],
    },
    outputSchema: {
      type: "object",
      properties: {
        terms: {
          type: "array",
          items: {
            type: "object",
            properties: {
              slug: { type: "string" },
              term: { type: "string" },
              name: { type: ["string", "null"] },
              description: { type: "string" },
              section: SECTION_SCHEMA,
              url: { type: "string" },
              body: { type: "string", description: "Markdown." },
              links_to: { type: "array", items: { type: "string" } },
            },
            required: [
              "slug",
              "term",
              "name",
              "description",
              "section",
              "url",
              "body",
              "links_to",
            ],
          },
        },
        missing: {
          type: "array",
          items: {
            type: "object",
            properties: {
              query: { type: "string" },
              suggestions: SUGGESTIONS_SCHEMA,
            },
            required: ["query", "suggestions"],
          },
        },
        same_section: { type: "boolean" },
        links_between: {
          type: "array",
          description:
            "Each pair where the first term's entry links to the second.",
          items: {
            type: "object",
            properties: { from: { type: "string" }, to: { type: "string" } },
            required: ["from", "to"],
          },
        },
        shared_links: {
          type: "array",
          description: "Terms that every compared term links to.",
          items: {
            type: "object",
            properties: { slug: { type: "string" }, term: { type: "string" } },
            required: ["slug", "term"],
          },
        },
      },
      required: [
        "terms",
        "missing",
        "same_section",
        "links_between",
        "shared_links",
      ],
    },
    run(index, args) {
      const lang = langOf(index, args);
      const given = args.slugs;
      if (
        !Array.isArray(given) ||
        given.length < 2 ||
        given.length > LIMITS.compareTerms ||
        given.some((slug) => typeof slug !== "string" || !slug.trim())
      )
        throw new InputError(
          `"slugs" must be a list of 2 to ${LIMITS.compareTerms} slugs.`
        );
      const found: CorpusTerm[] = [];
      const missing: { query: string; suggestions: unknown }[] = [];
      for (const raw of given as string[]) {
        const query = raw.trim().slice(0, LIMITS.textLength);
        const term = resolve(index, query);
        if (!term) missing.push({ query, suggestions: suggest(index, query) });
        else if (!found.includes(term)) found.push(term);
      }
      const linksBetween: { from: string; to: string }[] = [];
      for (const from of found)
        for (const to of found)
          if (from !== to && from.links.includes(to.slug))
            linksBetween.push({ from: from.slug, to: to.slug });
      const first = found[0];
      const shared =
        first && found.length > 1
          ? first.links.filter(
              (slug) =>
                found.every((term) => term.links.includes(slug)) &&
                !found.some((term) => term.slug === slug)
            )
          : [];
      return {
        terms: found.map((term) => ({
          ...card(index.corpus, lang, term),
          body: term.text[lang]?.body ?? "",
          links_to: term.links,
        })),
        missing,
        same_section:
          found.length > 1 &&
          found.every((term) => term.section === first?.section),
        links_between: linksBetween,
        shared_links: shared.map((slug) => ({
          slug,
          term: index.bySlug.get(slug)?.term ?? slug,
        })),
      };
    },
  },
];

const INSTRUCTIONS =
  "A dictionary of AI coding terms, in Vietnamese and English. Every tool only reads. " +
  "Call get_overview to see what it covers, search when you have words and no slug, " +
  "get_term for one full entry, get_related to walk the links from a term, " +
  "get_section to browse a part of the curriculum, and compare for two to six terms side by side. " +
  'Pass lang "vi" or "en" to choose the language of the answer; the default is "vi". ' +
  "Cite the url of each term you use.";

// ------------------------------------------------------------------ corpus

type Loader = (request: Request) => Promise<Corpus>;

function env(name: string): string | undefined {
  return typeof process !== "undefined" ? process.env[name] : undefined;
}

/** The site this request came to, as the caller wrote it. */
function originOf(request: Request): string {
  const address = new URL(request.url, "http://localhost");
  const host =
    request.headers.get("x-forwarded-host") ??
    request.headers.get("host") ??
    address.host;
  const scheme = (
    request.headers.get("x-forwarded-proto") ??
    address.protocol.replace(":", "")
  )
    .split(",")[0]
    ?.trim();
  if (!/^[a-z0-9.-]+(:\d+)?$/i.test(host) || !/^https?$/.test(scheme ?? ""))
    throw new Error("The request has no usable host.");
  return `${scheme}://${host}`;
}

/**
 * The site to read the corpus from.
 *
 * On Vercel the answer is always one of the project's own addresses, which
 * Vercel sets in the environment. The server then never fetches from a host
 * that a caller made up in a header.
 */
function dataOrigin(request: Request): string {
  const asked = originOf(request);
  if (!env("VERCEL")) return asked;
  const own = [
    env("VERCEL_URL"),
    env("VERCEL_BRANCH_URL"),
    env("VERCEL_PROJECT_PRODUCTION_URL"),
  ].filter((host): host is string => Boolean(host));
  if (own.includes(new URL(asked).host)) return asked;
  // Another address of the project, such as a custom domain. A production
  // deployment reads its public address; a preview reads itself.
  const fallback =
    env("VERCEL_ENV") === "production"
      ? env("VERCEL_PROJECT_PRODUCTION_URL")
      : env("VERCEL_URL");
  return fallback ? `https://${fallback}` : asked;
}

/** Fetch the corpus file from the site this request came to. */
async function corpusFromSite(request: Request): Promise<Corpus> {
  const headers: Record<string, string> = { accept: "application/json" };
  // A preview deployment behind Vercel's sign-in lets this request through
  // only with the project's bypass secret, when one is set.
  const bypass = env("VERCEL_AUTOMATION_BYPASS_SECRET");
  if (bypass && env("VERCEL")) headers["x-vercel-protection-bypass"] = bypass;
  const response = await fetch(dataOrigin(request) + CORPUS_PATH, { headers });
  if (!response.ok)
    throw new Error(`${CORPUS_PATH} answered ${response.status}.`);
  return (await response.json()) as Corpus;
}

let cached: { origin: string; index: Promise<Index> } | null = null;

function loadIndex(request: Request, load: Loader): Promise<Index> {
  const origin = dataOrigin(request);
  if (cached && cached.origin === origin) return cached.index;
  const index = load(request).then(buildIndex);
  cached = { origin, index };
  // A failed load is not kept: the next call tries again.
  index.catch(() => {
    if (cached && cached.index === index) cached = null;
  });
  return index;
}

// --------------------------------------------------------------- rate limit

// One counter per address, kept in memory. Each running copy of the function
// counts on its own, so this slows a single noisy caller down; it is not a
// hard limit across all copies.
const callers = new Map<string, { count: number; resetAt: number }>();

function countCall(request: Request, now: number) {
  const address =
    request.headers.get("x-real-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown";
  if (callers.size > 5000) {
    for (const [key, value] of callers)
      if (value.resetAt <= now) callers.delete(key);
  }
  let entry = callers.get(address);
  if (!entry || entry.resetAt <= now) {
    entry = { count: 0, resetAt: now + LIMITS.windowSeconds * 1000 };
    callers.set(address, entry);
  }
  entry.count += 1;
  return {
    allowed: entry.count <= LIMITS.requests,
    remaining: Math.max(0, LIMITS.requests - entry.count),
    resetIn: Math.max(1, Math.ceil((entry.resetAt - now) / 1000)),
  };
}

// ----------------------------------------------------------------- protocol

type JsonRpcResponse =
  | { jsonrpc: "2.0"; id: string | number | null; result: unknown }
  | {
      jsonrpc: "2.0";
      id: string | number | null;
      error: { code: number; message: string; data?: unknown };
    };

function failure(
  id: string | number | null,
  code: number,
  message: string,
  data?: unknown
): JsonRpcResponse {
  return {
    jsonrpc: "2.0",
    id,
    error: data === undefined ? { code, message } : { code, message, data },
  };
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

async function answer(
  message: unknown,
  request: Request,
  load: Loader
): Promise<JsonRpcResponse | null> {
  if (!isObject(message) || message.jsonrpc !== "2.0")
    return failure(null, -32600, "Not a JSON-RPC 2.0 message.");
  // A response sent by the client: this server never asks, so nothing to do.
  if (typeof message.method !== "string") return null;
  const hasId =
    typeof message.id === "string" || typeof message.id === "number";
  // A notification gets no answer.
  if (!hasId) return null;
  const id = message.id as string | number;
  const params = isObject(message.params) ? message.params : {};

  switch (message.method) {
    case "initialize": {
      const asked = params.protocolVersion;
      const version =
        typeof asked === "string" && PROTOCOL_VERSIONS.includes(asked)
          ? asked
          : PROTOCOL_VERSIONS[0];
      return {
        jsonrpc: "2.0",
        id,
        result: {
          protocolVersion: version,
          capabilities: { tools: { listChanged: false } },
          serverInfo: SERVER,
          instructions: INSTRUCTIONS,
        },
      };
    }
    case "ping":
      return { jsonrpc: "2.0", id, result: {} };
    case "tools/list":
      return {
        jsonrpc: "2.0",
        id,
        result: {
          tools: TOOLS.map((tool) => ({
            name: tool.name,
            title: tool.title,
            description: tool.description,
            inputSchema: tool.inputSchema,
            outputSchema: tool.outputSchema,
            annotations: {
              title: tool.title,
              readOnlyHint: true,
              destructiveHint: false,
              idempotentHint: true,
              openWorldHint: false,
            },
          })),
        },
      };
    case "tools/call": {
      const tool = TOOLS.find((t) => t.name === params.name);
      if (!tool)
        return failure(id, -32602, `Unknown tool: ${String(params.name)}`, {
          tools: TOOLS.map((t) => t.name),
        });
      const args = params.arguments;
      if (args !== undefined && args !== null && !isObject(args))
        return failure(id, -32602, '"arguments" must be an object.');
      let index: Index;
      try {
        index = await loadIndex(request, load);
      } catch (error) {
        return failure(
          id,
          -32603,
          "The dictionary data could not be loaded. Try again shortly.",
          { reason: error instanceof Error ? error.message : String(error) }
        );
      }
      try {
        const structured = tool.run(index, isObject(args) ? args : {});
        return {
          jsonrpc: "2.0",
          id,
          result: {
            content: [{ type: "text", text: JSON.stringify(structured) }],
            structuredContent: structured,
            isError: false,
          },
        };
      } catch (error) {
        // Wrong arguments are told to the model as a tool result, so it can
        // correct the call. Anything else is a fault of this server.
        if (error instanceof InputError)
          return {
            jsonrpc: "2.0",
            id,
            result: {
              content: [{ type: "text", text: error.message }],
              isError: true,
            },
          };
        return failure(id, -32603, "The tool failed.");
      }
    }
    default:
      return failure(id, -32601, `Method not found: ${message.method}`);
  }
}

const CORS: Record<string, string> = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "POST, OPTIONS",
  "access-control-allow-headers":
    "content-type, accept, authorization, mcp-protocol-version, mcp-session-id, last-event-id",
  "access-control-expose-headers":
    "ratelimit-limit, ratelimit-remaining, ratelimit-reset, retry-after",
  "access-control-max-age": "86400",
};

function reply(
  status: number,
  body: unknown,
  extra: Record<string, string> = {}
): Response {
  return new Response(body === null ? null : JSON.stringify(body), {
    status,
    headers: {
      ...CORS,
      ...(body === null
        ? {}
        : { "content-type": "application/json; charset=utf-8" }),
      "cache-control": "no-store",
      ...extra,
    },
  });
}

function isStatus(request: Request): boolean {
  const address = new URL(request.url, "http://localhost");
  return (
    address.pathname.endsWith(STATUS_PATH) || address.searchParams.has("status")
  );
}

/** Whether the server is up and can read the corpus. For people and monitors. */
async function status(
  request: Request,
  load: Loader,
  docs: string
): Promise<Response> {
  const count = countCall(request, Date.now());
  if (!count.allowed)
    return reply(
      429,
      { ok: false, reason: "Too many requests." },
      { "retry-after": String(count.resetIn) }
    );
  const facts = {
    server: SERVER,
    protocol_versions: PROTOCOL_VERSIONS,
    tools: TOOLS.map((tool) => tool.name),
    limits: {
      body_bytes: LIMITS.bodyBytes,
      requests: LIMITS.requests,
      window_seconds: LIMITS.windowSeconds,
    },
    docs,
  };
  try {
    const { corpus } = await loadIndex(request, load);
    return reply(200, {
      ok: true,
      ...facts,
      corpus: {
        version: corpus.version,
        terms: corpus.terms.length,
        languages: corpus.languages,
      },
    });
  } catch (error) {
    return reply(503, {
      ok: false,
      ...facts,
      reason: error instanceof Error ? error.message : String(error),
    });
  }
}

/**
 * Answer one HTTP request to the MCP endpoint.
 *
 * @param load Where the corpus comes from. The default fetches
 *             /data/corpus.json from the site the request came to.
 */
export async function handleMcp(
  request: Request,
  load: Loader = corpusFromSite
): Promise<Response> {
  if (request.method === "OPTIONS") return reply(204, null);

  let docs = DOCS_PATH;
  try {
    docs = originOf(request) + DOCS_PATH;
  } catch {
    // The path alone still says where to look.
  }

  if (request.method === "GET" && isStatus(request))
    return status(request, load, docs);

  if (request.method !== "POST")
    return reply(
      405,
      {
        error: "This is an MCP endpoint. It answers POST requests only.",
        docs,
      },
      { allow: "POST, OPTIONS" }
    );

  const count = countCall(request, Date.now());
  const rate = {
    "ratelimit-limit": String(LIMITS.requests),
    "ratelimit-remaining": String(count.remaining),
    "ratelimit-reset": String(count.resetIn),
  };
  if (!count.allowed)
    return reply(
      429,
      failure(
        null,
        -32000,
        `Too many requests: at most ${LIMITS.requests} per ${LIMITS.windowSeconds} seconds. Retry in ${count.resetIn} seconds.`,
        { docs }
      ),
      { ...rate, "retry-after": String(count.resetIn) }
    );

  const tooLarge = () =>
    reply(
      413,
      failure(
        null,
        -32000,
        `The request body is larger than ${LIMITS.bodyBytes} bytes.`,
        { docs }
      ),
      rate
    );
  if (Number(request.headers.get("content-length") ?? 0) > LIMITS.bodyBytes)
    return tooLarge();
  if (!(request.headers.get("content-type") ?? "").includes("application/json"))
    return reply(
      415,
      failure(null, -32000, "Send the request as application/json.", { docs }),
      rate
    );
  const text = await request.text();
  if (new TextEncoder().encode(text).length > LIMITS.bodyBytes)
    return tooLarge();

  let message: unknown;
  try {
    message = JSON.parse(text);
  } catch {
    return reply(
      400,
      failure(null, -32700, "The body is not valid JSON."),
      rate
    );
  }

  const messages = Array.isArray(message) ? message : [message];
  if (
    Array.isArray(message) &&
    (!message.length || message.length > LIMITS.batch)
  )
    return reply(
      400,
      failure(null, -32600, `A batch must hold 1 to ${LIMITS.batch} messages.`),
      rate
    );

  // After initialize, a client names the protocol version it speaks.
  const version = request.headers.get("mcp-protocol-version");
  const initializing = messages.some(
    (m) => isObject(m) && m.method === "initialize"
  );
  if (version && !initializing && !PROTOCOL_VERSIONS.includes(version))
    return reply(
      400,
      failure(null, -32600, `Unsupported MCP-Protocol-Version: ${version}`, {
        supported: PROTOCOL_VERSIONS,
      }),
      rate
    );

  const answers: JsonRpcResponse[] = [];
  for (const one of messages) {
    const result = await answer(one, request, load);
    if (result) answers.push(result);
  }
  // Only notifications: accepted, and there is nothing to send back.
  if (!answers.length) return reply(202, null, rate);
  return reply(200, Array.isArray(message) ? answers : answers[0], rate);
}

// Vercel calls the export named after the HTTP method.
export function POST(request: Request): Promise<Response> {
  return handleMcp(request);
}
export function OPTIONS(request: Request): Promise<Response> {
  return handleMcp(request);
}
export function GET(request: Request): Promise<Response> {
  return handleMcp(request);
}
export function HEAD(request: Request): Promise<Response> {
  return handleMcp(request);
}
export function PUT(request: Request): Promise<Response> {
  return handleMcp(request);
}
export function PATCH(request: Request): Promise<Response> {
  return handleMcp(request);
}
export function DELETE(request: Request): Promise<Response> {
  return handleMcp(request);
}
