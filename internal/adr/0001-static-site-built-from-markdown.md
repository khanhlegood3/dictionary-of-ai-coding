---
status: accepted
date: 2026-11-11
title_vi: Dựng website thành tệp tĩnh bằng trình dựng riêng
summary: site/build.ts turns the Markdown entries into plain HTML, CSS and JavaScript. Vercel serves the files. There is no server code.
summary_vi: site/build.ts chuyển các mục Markdown thành HTML, CSS và JavaScript thuần. Vercel phát các tệp đó. Không có mã chạy trên máy chủ.
---

# Build the website as static files with our own generator

## Context

The dictionary is a folder of Markdown entries, ordered by
`internal/Curriculum.md`. It needed a public website.

## Decision

`site/build.ts` reads the Markdown and writes plain HTML, CSS and JavaScript
into `dist/`. Vercel runs `npm run build` and serves `dist/`. The site uses no
web framework. The scripts that run in the browser are hand-written files,
copied as they are.

## Consequences

- Publishing is one step: edit an entry and rebuild.
- Term pages work without JavaScript.
- There is no server code. A feature that needs a server, such as accounts or
  sync, has to use an outside service. See ADR 0003.
- The interactive views (the term map, the Learn view) are our own JavaScript,
  so we maintain all of it ourselves.
