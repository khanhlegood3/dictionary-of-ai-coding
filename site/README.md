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
| `site/learn-store.js`    | Keeps Learn progress in IndexedDB and syncs it, copied as written |
| `site/sync.ts`           | Address and public key of the Supabase project used for sync |
| `internal/adr/*.md`      | The decision records listed on `/tasks`           |
| `site/tasks.js`          | Loads the GitHub issues on `/tasks` in the browser, copied as written |
| `site/tasks.css`         | Styles of `/tasks`, loaded after `styles.css`     |

There is no server code. Every page is built from the markdown files, so
editing an entry and rebuilding is the whole publishing step. The only data
that is not in this repository is the Learn progress of visitors who sign in:
see [Progress and sync](#progress-and-sync).

## Pages

| Path          | Content                                             |
| ------------- | --------------------------------------------------- |
| `/`           | The 3D term map                                     |
| `/learn`      | The course: one term at a time, step by step        |
| `/curriculum` | Every term in teaching order, grouped by section    |
| `/a-z`        | Every term in alphabetical order                    |
| `/tasks`      | The project's open tasks and decision records       |
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
the visitor reaches its recap.

The look of this view is modelled on the course at
<https://designed-to-scale.vercel.app> by Dilum Sanjaya: warm paper colours,
ink outlines, hard offset shadows. The code and the diagram are written for
this site. The typeface is JetBrains Mono (SIL Open Font License 1.1). The
build copies it from the `@fontsource-variable/jetbrains-mono` package to
`dist/assets/fonts/`.

## Progress and sync

`site/learn-store.js` keeps which terms a visitor finished and where they
stopped. Both languages share it.

**In the browser.** Progress is always written to IndexedDB, in the database
`dictionary-of-ai-coding`:

| Store      | Key   | Holds                                                    |
| ---------- | ----- | -------------------------------------------------------- |
| `progress` | `id`  | One record per anonymous id: `done`, `last`, `resetAt`, `owner`, `dirty` |
| `meta`     | `key` | `active`: the id in use. `auth:*`: the sign-in session   |

The id is a random UUID made in the browser. It says nothing about the
visitor. Until they sign in, nothing is sent anywhere. Progress that an
earlier version kept in `localStorage` (`learn:done`, `learn:last`) is moved
into the record on the first visit and then removed.

**In the account.** "Sign in with Google" signs the visitor in through
Supabase Auth. From then on the record is also kept in the Supabase table
`learn_progress`, under the same UUID as its primary key:

| Column       | Holds                                                  |
| ------------ | ------------------------------------------------------ |
| `id`         | The anonymous UUID from the browser. Primary key       |
| `user_id`    | The account that owns the row, filled from the session |
| `done`       | `{ "<slug>": <time finished, ms> }`                     |
| `last`       | `{ "p": "<slug>/<step>", "t": <ms> }`                   |
| `reset_at`   | Time of the last reset, in ms. Earlier terms do not count |
| `updated_at` | When the row was last written                          |

An account has one row per browser it signed in on. The site reads all of
them and merges them:

- A term is done if any row finished it after the latest reset.
- The place is the most recent one.
- A reset made while signed in clears the account on every device. A reset
  made before signing in clears that browser only.
- Signing out leaves the account's record stored but puts a new, empty
  anonymous record in use. Signing in again picks the account's record up and
  folds in what was learned in between.

A change is sent a few seconds after it happens, and again when the tab is
hidden. The account is read when the page loads, after sign-in, and when the
tab comes back into view.

Row level security lets an account read and write only its own rows; a
visitor who is not signed in has no access to the table. The rules are in
`supabase/migrations/`. The address and the publishable key in `site/sync.ts`
are public values. Leave either empty to build the site without sign-in.

The Supabase client (`@supabase/supabase-js`, MIT) is copied to
`dist/assets/vendor/` by the build and is loaded only when a session is
stored or the visitor presses the sign-in button.

### Setting up Google sign-in

This is done once per Supabase project, outside this repository:

1. In Google Cloud Console, under **APIs & Services → Credentials**, create
   an **OAuth client ID** of type **Web application**. Add
   `https://<project-ref>.supabase.co/auth/v1/callback` as an **Authorized
   redirect URI**.
2. In the Supabase dashboard, under **Authentication → Sign In / Providers →
   Google**, switch the provider on and paste the client ID and client secret.
3. Under **Authentication → URL Configuration**, set **Site URL** to the
   production address and add `<address>/**` to **Redirect URLs** for every
   address the site is served from.

While the Google provider is off, the sign-in button shows a message instead
of leaving the page.

## Tasks page

`/tasks` shows the work of the project to the owner and to investors. It reads
two things and stores nothing itself. See
`internal/adr/0005-tasks-page-reads-github-issues-and-adrs.md`.

| Shown on the page | Where it comes from                              | When it changes         |
| ----------------- | ------------------------------------------------ | ----------------------- |
| Tasks             | The GitHub issues of the repository in `REPO`    | When the page is opened |
| Decisions (ADR)   | The files in `internal/adr/`                     | At the next deploy      |

`REPO` is a constant at the top of `site/build.ts`. The link in the footer of
every page with a footer leads to `/tasks`.

**Tasks.** The page asks the public GitHub API for the issues, without a token.
Pull requests are left out.

| Issue on GitHub                     | Status on the page |
| ----------------------------------- | ------------------ |
| Open                                | Open               |
| Open, with the label `in-progress`  | In progress        |
| Closed                              | Done               |

"Open" in the counts and in the left column includes the tasks in progress.
The other labels of an issue show as small tags, and the left column filters by
them. `tasksLabelNames` in `site/strings.ts` gives a label a name per language.
A label that is not listed there shows as written. The chosen view and label
are kept in the address (`?view=done&label=bug`), so the Share button gives a
link to the same list.

To manage tasks, use GitHub: "Add task" opens the new issue form, and a task's
name opens its issue. Issues must be switched on for the repository (Settings,
General, Features).

Without a token GitHub allows 60 requests per hour from one IP address. The
page keeps a fetched list for two minutes in `sessionStorage`. The build also
tries to save a copy of the list in the page. When the browser cannot reach
GitHub, the page shows the newest copy it has and says when the copy was made.
The build goes on without the copy if GitHub does not answer. Set
`GITHUB_TOKEN` in the build environment to make the copy reliable.

**Decisions.** Each file in `internal/adr/` is named `<4 digits>-<words>.md` and
starts with frontmatter:

```
---
status: proposed
date: 2026-11-24
title_vi: Tên quyết định bằng tiếng Việt
summary: One or two sentences, in English.
summary_vi: Một hai câu bằng tiếng Việt.
---

# The title, in English
```

`status` is `proposed`, `accepted`, `rejected` or `superseded`. `status` and
`date` are required, and the build stops when one is missing or misspelt. The
Vietnamese page falls back to the English title and summary. A `proposed`
decision is listed first and counted under "Awaiting decision".

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
