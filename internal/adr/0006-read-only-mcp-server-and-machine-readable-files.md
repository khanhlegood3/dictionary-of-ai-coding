---
status: accepted
date: 2026-11-26
title_vi: Máy chủ MCP chỉ đọc và các tệp cho máy đọc
summary: The build writes the dictionary as files for machines (llms.txt, JSON, sitemap). One Vercel function at /api/mcp answers AI agents over the Model Context Protocol. It only reads those files. This is the one exception to "no server code" in ADR 0001.
summary_vi: Bản dựng ghi từ điển thành các tệp cho máy đọc (llms.txt, JSON, sitemap). Một hàm Vercel ở /api/mcp trả lời AI agent qua Model Context Protocol. Hàm chỉ đọc các tệp đó. Đây là ngoại lệ duy nhất của quy tắc "không có mã chạy trên máy chủ" trong ADR 0001.
---

# A read-only MCP server and machine-readable files

## Context

People now reach a dictionary through an AI agent as often as through a
browser. An agent reads HTML pages badly: it has to fetch a page per term and
strip the layout. The owner asked to apply the agent interface of Football
Atlas (`futbolatlas.app/agents/mcp`) to this project.

ADR 0001 says the site is static files and has no server code. A Model Context
Protocol (MCP) server answers `POST` requests, so it cannot be a static file.

## Decision

The dictionary is published for machines in two ways, from the same data.

1. **Files.** `site/build.ts` writes, next to the pages:
   - `/llms.txt` and `/llms-full.txt` (and both under `/en`): the terms as
     plain text, one line each and in full.
   - `/data/index.json`, `/data/terms/<slug>.json`, `/data/graph.json` and
     `/data/corpus.json`: the terms, their text in both languages and the links
     between them.
   - `/sitemap.xml` and `/robots.txt`.
2. **An MCP server.** `api/mcp.ts` is one Vercel function, served at
   `/api/mcp`. The address `/mcp` is not free: it is the page of the term "MCP".
   - It only reads. It has no tool that writes, no sign-in and no secret.
   - It keeps no session and no data. It loads `/data/corpus.json` from the
     site and answers from it.
   - It publishes its limits and holds to them: a request body of at most
     64 KiB, and 60 requests per 60 seconds from one address.
   - It also answers `GET /status.json`, which says whether the server can
     read the corpus.

The pages `/agents` and `/agents/mcp` document both. The build writes the tool
list from the `TOOLS` array of `api/mcp.ts`, the same array the server answers
`tools/list` from. The page and the server cannot disagree.

This function is the only exception to ADR 0001. Every page is still a static
file, and the site works when the function is down.

## Consequences

- There is server code to keep working. `site/serve.ts` runs the same function
  locally, so it can be tested without Vercel.
- The rate limit is counted in memory, in each running copy of the function. It
  slows down one noisy caller. It is not a hard limit across all copies.
- The function reads the corpus over HTTP from its own deployment. On a preview
  deployment that Vercel protects with a sign-in, that read fails unless the
  project sets `VERCEL_AUTOMATION_BYPASS_SECRET`. Production is not protected.
- The files make it easy to copy the whole dictionary. The English entries come
  from `mattpocock/dictionary-of-ai-coding`, which has no licence file. The
  site therefore states no licence for the content. This must be settled before
  the server is listed in a public MCP registry.
- A new tool is added in `api/mcp.ts` only. The docs page follows on the next
  build.
