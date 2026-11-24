# Website

`npm run build` turns the dictionary into a static website in `dist/`.

| Input                    | Used for                                          |
| ------------------------ | ------------------------------------------------- |
| `internal/Curriculum.md` | Sections and the order of terms                   |
| `dictionary/*.md`        | One page per term, the search index, the term map |
| `translations/vi/*.md`   | The Vietnamese text of each entry                 |
| `site/strings.ts`        | Interface text and section titles, per language   |
| `site/styles.css`        | Styles, copied to `dist/assets/`                  |
| `site/app.js`            | Theme, language toggle and search, copied as written |
| `site/layout.ts`         | Places each term in 3D for the map, at build time |
| `site/graph.js`          | Draws the map in the browser, copied as written   |
| `site/learn.js`          | Runs the Learn view in the browser, copied as written |
| `site/learn.css`         | Styles of the Learn view, loaded after `styles.css` |

There is no database and no server code. Every page is built from the markdown
files, so editing an entry and rebuilding is the whole publishing step.

## Pages

| Path          | Content                                             |
| ------------- | --------------------------------------------------- |
| `/`           | The 3D term map                                     |
| `/learn`      | The course: one term at a time, step by step        |
| `/curriculum` | Every term in teaching order, grouped by section    |
| `/a-z`        | Every term in alphabetical order                    |
| `/<slug>`     | One term, as a plain page that works without script |

The Vietnamese pages are at these paths. The English pages are the same paths
under `/en`, such as `/en/curriculum` and `/en/harness`.

## Learn view

`/learn` is one page that shows the dictionary as a course. It has three
columns:

- **Course tree.** The sections as folders, their terms, and the visitor's
  progress.
- **Sheet.** The current term, with a diagram of the terms its text links to.
  A dot under the diagram stands for each step.
- **Guide.** One step of the entry at a time, with Back and Next.

The build cuts each entry into steps and writes them to `learn.json`, once per
language:

| Step       | Comes from                                               |
| ---------- | -------------------------------------------------------- |
| Definition | The first paragraph of the entry                         |
| Detail     | Each later paragraph, list or table                      |
| Note       | A paragraph that opens with a label, such as `_Avoid:_`  |
| Usage      | The dialogue after `_Usage:_`                            |
| Recap      | The `description`, and the terms that mention this term  |

A paragraph that ends in a colon stays in the same step as the table or list
after it. The diagram marks the terms that the current step mentions.

Addresses are `/learn#/<slug>` for a term and `/learn#/<slug>/<n>` for step
`n` of it. Left and right arrow keys change step. A term counts as done when
the visitor reaches its recap. Progress and the last place are kept in the
browser's `localStorage` (`learn:done`, `learn:last`) and are shared by both
languages. Nothing is sent to a server.

The look of this view is modelled on the course at
<https://designed-to-scale.vercel.app> by Dilum Sanjaya: warm paper colours,
ink outlines, hard offset shadows. The code and the diagram are written for
this site. The typeface is JetBrains Mono (SIL Open Font License 1.1). The
build copies it from the `@fontsource-variable/jetbrains-mono` package to
`dist/assets/fonts/`.

## Languages

The site is built once per language. Vietnamese is the default and lives at the
root. English lives under `/en`. The VI / EN toggle in the header links to the
same page in the other language and keeps the current search and selected term.

| Part                    | Where it comes from                                    |
| ----------------------- | ------------------------------------------------------ |
| Entry text, English     | `dictionary/<Term>.md`                                 |
| Entry text, Vietnamese  | `translations/vi/<Term>.md`                            |
| Interface text          | `STRINGS` in `site/strings.ts`                         |
| Section titles          | `sectionTitles` in `site/strings.ts`                   |
| Term names and slugs    | The English file name, the same in both languages      |

A translation file has the same name and format as the English entry: a
`description` in the frontmatter, links written as `./Other term.md`, and the
`_Usage:_` marker before the dialogue. Keep the marker in English, because the
build looks for it.

A translation can also set `name` in the frontmatter, such as
`name: Cửa sổ ngữ cảnh` for "Context window". The page title stays in English.
The name shows under the title and in search results, and search matches it.
Search ignores accents, so `ngu canh` finds `ngữ cảnh`.

To translate or update an entry:

1. Edit `dictionary/<Term>.md` if the English text changes.
2. Make the same change in `translations/vi/<Term>.md`.
3. Run `npm run build` and read the warnings.

The build warns, and does not fail, when:

- An entry has no translation. The Vietnamese page then shows the English text
  with a notice above it.
- A translation links to a different set of terms than the English entry.
- A file in `translations/vi/` matches no entry.
- A section title has no translation in `site/strings.ts`.

To add a language, add its code to `LANGS`, `BASE` and `STRINGS` in
`site/strings.ts`, and put its entries in `translations/<code>/`.

## The term map

The home page shows every term as a point in 3D. Two terms are linked when one
entry links to the other. Linked terms sit close together, and each curriculum
section forms a loose region.

- Drag to rotate, scroll or pinch to zoom. Arrow keys, `+`, `-` and `0` do the
  same from the keyboard.
- Selecting a term opens it in a side panel and draws its links.
- The address holds the state, so any view can be shared:
  `/?term=harness` selects a term, `/?q=harnes` highlights search matches, and
  the two combine as `/?q=harnes&term=harness`.

`site/build.ts` writes one `graph.json` per language (`dist/graph.json` and
`dist/en/graph.json`) with each term's position, links and rendered text. Positions come from a seeded layout, so the same entries always
give the same map. The map has no runtime dependencies: `site/graph.js` draws
on a 2D canvas with its own perspective projection.

## Preview locally

```sh
npm run build
python3 -m http.server 3000 --directory dist
```

## Deploy

`vercel.json` tells Vercel to run `npm run build` and serve `dist/`. A project
linked to this repository deploys on every push: the production branch goes to
the production domain, and other branches get preview deployments.
