---
status: accepted
date: 2026-11-28
title_vi: Màn hình của Game9K được dựng bằng Hallmark và kiểm bằng sloplint
summary: New Game9K screens are built by following the Hallmark design skill, pinned at one commit, and checked with its linter, sloplint, before a gate pull request. The skill is not copied into this repository, and the dictionary site is not redesigned.
summary_vi: Màn hình mới của Game9K được dựng theo skill thiết kế Hallmark, ghim ở một commit, và được kiểm bằng công cụ sloplint của nó trước pull request cổng. Skill không được chép vào kho này, và trang từ điển không bị thiết kế lại.
---

# Game9K screens are built with Hallmark and checked by sloplint

## Context

Phase P02 of `game9k/PROCESS.md` produces the screens for the four flows of the
requirements document: submit a version, enter and play, approve the report,
read the report. An agent builds them and the owner approves them. Nothing in
the process said how a screen is built or what is checked before the owner
looks.

`Nutlope/hallmark` (MIT) is a design skill for coding agents. It is a set of
written rules, a catalogue of fifty themes, and a linter called `sloplint` that
reads HTML and CSS and, with a browser, renders the page at several widths. Its
rules for a screen someone works in ("app scope") are the kind P02 needs.
`game9k/research/hallmark.md` has the analysis and what the linter reported on
the existing site.

On 2026-11-28 the owner gave the repository and wrote: "áp dụng vào dự án"
(apply it to the project). The scope below is the agent's reading of that
instruction. The owner confirms or corrects it at the pull request that adds
this record.

## Decision

- **A new screen for Game9K is built by following the Hallmark skill**, at
  commit `04977e1` of `Nutlope/hallmark` (skill version 2.0.0). A screen
  someone works in uses its app scope. A page someone reads uses its page
  scope.
- **Every screen is checked with `sloplint` before a gate pull request.** The
  static check always runs. The render check runs where a browser is available.
  A `FAIL` is fixed. A `REFLEX` is fixed or waived with a written reason, as the
  skill describes. The pull request states which checks ran and their result.
- **Every region of a screen that loads data is drawn in four states**:
  loading, empty, error and full.
- **Sample data on a screen is labelled as sample data.** A screen never shows
  an invented figure, quote or logo as if it were real. This is the Hallmark
  rule against invented metrics, joined to the rule of this repository that a
  figure names its source.
- **The skill is not copied into this repository.** It is fetched at the pinned
  commit when it is used. Moving the pin is a pull request that changes this
  record's commit and says what changed.

## Not decided

- **The theme.** Hallmark deals three themes for a prompt and a person picks
  from their pictures. The owner picks. `game9k/research/hallmark.md` lists the
  three that were dealt.
- **When P02 starts.** This record does not start the phase.

- **Whether the check runs in CI.** No Game9K screen exists yet, so there is
  nothing for a workflow to check.
- **The framework of the real application** (issue #29). Hallmark's output is
  plain HTML and CSS, which is enough for approving screens in P02.

The owner decided the first two on 2026-11-28: the theme is Hum and P02 has
started. See
[ADR 0014](0014-game9k-screens-of-phase-p02-are-static-pages-in-the-hum-theme.md).

## Consequences

- The dictionary site is not redesigned and is not held to these rules.
  Hallmark itself does not work on an existing design unless it is named. The
  linter reported findings on the site; they are in the research note and one
  of them is issue #58.
- The agent in this repository follows the skill by reading it. It was not run
  through Claude Code, Codex or another harness that loads skills, so the
  skill's own steps that depend on a harness (a fresh reviewer with no context)
  are done by hand or not at all, and the pull request says which.
- The render check needs `puppeteer-core` and a Chrome binary. Neither is in
  the sandbox by default. The research note records how they were supplied.
- `sloplint` enforces Hallmark's own taste as well as correctness: no dash in
  copy, a 4px spacing scale, no label in tracked capitals. A new screen accepts
  those rules. If the owner dislikes one, it is waived in a `design.md`, which
  the skill reads first.
- **Not verified.** No Game9K screen has been built with Hallmark. Whether its
  app scope produces screens the owner likes is unknown until the first one.
