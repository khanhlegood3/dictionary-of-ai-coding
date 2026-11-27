# For coding agents

This repository holds a dictionary of AI coding terms and the website built
from it, <https://ai9k.vercel.app>. The site is in Vietnamese at `/` and in
English at `/en`.

It also holds the management of the Game9K project, under `game9k/` (ADR 0011).
Read `game9k/README.md` before you work on an issue with the label `game9k`.

## Where things are

| Path                     | What it is                                                         |
| ------------------------ | ------------------------------------------------------------------ |
| `dictionary/`            | One English entry per term                                         |
| `translations/vi/`       | The Vietnamese text of each entry, under the same file name        |
| `internal/Curriculum.md` | The sections and the order of the terms                            |
| `site/`                  | The site generator and the scripts of the pages                    |
| `api/mcp.ts`             | The MCP server and the HTTP API. The only code that runs on Vercel |
| `server.json`            | The listing of the MCP server for the MCP Registry                 |
| `internal/adr/`          | The decision records                                               |
| `game9k/`                | The Game9K project: process, research, carried-over material       |
| `README.md`              | Generated. Never edit it by hand                                   |

## Rules

- **Entries.** `CLAUDE.md` has the writing rules. When you add or change an
  entry in `dictionary/`, make the same change in `translations/vi/`.
- **README.md** is written by `npm run generate` from `dictionary/`,
  `internal/Curriculum.md` and `internal/README.template.md`. Change those.
- **Website.** Read `site/README.md` first. Every text of the interface is in
  `site/strings.ts`, in both languages.
- **No secret in the site.** Every file the build writes is public. Do not put
  a token or a key in one (ADR 0008).
- **One function.** Vercel turns every file in `api/` into a function. Do not
  add a file there. `api/mcp.ts` imports nothing, and stays that way (ADR 0006).
- **Tools.** A tool of the MCP server is defined once, in the `TOOLS` array of
  `api/mcp.ts`. The pages, `openapi.json` and the server card follow from it.
  When a tool changes, raise `SERVER.version` there and `version` in
  `server.json` together. The build stops when they differ.
- **Decisions.** Read the records in `internal/adr/` that touch your change. A
  change that goes against an accepted record needs a new record. The front
  matter of a record is described in `site/README.md`.
- **Game9K.** `game9k/PROCESS.md` has the phases and the gates. Do not edit or
  format a file in `game9k/sources/`. A figure you write names its source; a
  figure with no source is marked "chưa có nguồn". Never write that a phase
  gate is passed: the owner passes it by merging the pull request.
- **Scope.** Do the issue you were given. Note other problems you find in the
  pull request. Do not fix them in the same change.

## Before you open a pull request

```sh
npm ci
npm run generate            # then check that README.md has no diff you did not intend
npx tsc --noEmit -p site
npx prettier --check .
npm run build
npm run check:mcp           # needs the build above
```

All of them must pass. The same checks run on every pull request.

## When you cannot run commands

An agent that works through the GitHub MCP server from a chat has no shell.
The checks above still run, on GitHub:

- Open the pull request as a draft. The checks "Site" and "README freshness"
  run the same commands on it.
- Read the result of the checks. Fix and push until both pass, then mark the
  pull request ready for review.
- Through that server a file is replaced whole. `site/build.ts` and
  `site/strings.ts` are long. If you cannot send one back complete, with every
  line you did not mean to change unchanged, stop and say so in the issue.
- A change to `dictionary/` or `internal/Curriculum.md` needs
  `npm run generate`, which you cannot run. Say so in the pull request, and
  leave `README.md` alone.

## Working on an issue

- Work on a branch of its own and open a pull request into `main`. Write
  `Closes #<number>` in its description. When you cannot open it yourself,
  give the owner the link that opens it, and the text for its description.
- The owner merges. Do not merge your own pull request.
- When the issue does not say enough to do the work, ask in the issue. Do not
  guess.
- The labels are explained in `internal/triage-labels.md`. Take an issue with
  `ready-for-agent`. Leave one with `ready-for-human` or `needs-info`.
