---
status: accepted
date: 2026-11-16
title_vi: Tiếng Việt ở địa chỉ gốc, tiếng Anh dưới /en
summary: The site is built once per language. Vietnamese is the default. English entries stay the source text, and each has a Vietnamese translation under the same file name.
summary_vi: Website được dựng một lần cho mỗi ngôn ngữ. Tiếng Việt là mặc định. Mục tiếng Anh vẫn là bản gốc, mỗi mục có một bản dịch tiếng Việt cùng tên tệp.
---

# Vietnamese at the root, English under /en

## Context

The entries come from the upstream repository and are written in English. The
owner asked for a Vietnamese site with English one click away.

## Decision

The build runs once per language. Vietnamese pages are at the root and English
pages are at the same paths under `/en`. English entries stay in `dictionary/`
and remain the source text. Each has a translation in `translations/vi/` under
the same file name. Term titles and page addresses stay in English in both
languages. Interface text is in `site/strings.ts`.

## Consequences

- A change to an English entry needs the same change in its translation. The
  build warns about a missing translation or one whose links differ.
- `dictionary/` keeps the upstream layout, so merging upstream changes stays
  simple.
- A link shared in one language opens in that language. The site does not
  remember a visitor's choice.
