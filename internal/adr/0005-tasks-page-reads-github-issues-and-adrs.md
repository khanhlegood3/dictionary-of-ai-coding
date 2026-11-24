---
status: accepted
date: 2026-11-24
title_vi: Trang công việc đọc GitHub Issues và các tệp ADR
summary: /tasks shows the issues of this repository and the decision records in internal/adr/. Tasks are edited on GitHub. The site stores no task data.
summary_vi: Trang /tasks hiện các issue của kho này và các bản ghi quyết định trong internal/adr/. Task được sửa trên GitHub. Website không lưu dữ liệu task.
---

# The tasks page reads GitHub Issues and the ADR files

## Context

The owner wants one page where they and investors can see the open work and
the decisions of the project.

## Decision

`/tasks` is a page of the static site.

- A task is a GitHub issue of this repository. The page reads the issues in the
  browser from the public GitHub API, without a token. The build also saves a
  copy of the list in the page, and the page shows that copy when GitHub cannot
  be reached.
- An open issue with the label `in-progress` is shown as in progress. A closed
  issue is shown as done. Every other open issue is shown as open.
- A decision is a file in `internal/adr/`. The build reads the status, date,
  title and summary from each file. A decision with the status `proposed` is
  listed as waiting for a decision.

Tasks and decisions are created and changed on GitHub. The page only shows
them.

## Consequences

- There is no sign-in or editing screen to build and protect.
- Issues are public, so everything on the page is public.
- Without a token GitHub allows 60 requests per hour from one IP address. The
  page keeps the list for two minutes and falls back to the saved copy.
- A change to an ADR file shows on the page after the next deploy.
