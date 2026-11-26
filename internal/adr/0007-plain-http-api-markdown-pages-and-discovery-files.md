---
status: accepted
date: 2026-11-27
title_vi: HTTP API thường, trang markdown và tệp tự tìm cho agent
summary: The tools of the MCP server also answer plain GET and POST at /api/v1, from the same function. The build adds a markdown copy of every term, openapi.json, an MCP server card and an agent skill under /.well-known. Nothing new writes, and no second function is added.
summary_vi: Các công cụ của máy chủ MCP cũng trả lời GET và POST thường ở /api/v1, từ cùng một hàm. Bản dựng ghi thêm bản markdown của mỗi thuật ngữ, openapi.json, thẻ máy chủ MCP và một agent skill dưới /.well-known. Không có gì mới ghi dữ liệu, và không thêm hàm thứ hai.
---

# A plain HTTP API, markdown pages and discovery files

## Context

ADR 0006 published the dictionary for agents as files and as an MCP server.
The owner then pointed at Plant Guide (`plantguide.ae`) and its third-party
profile on APIs.io, and asked to apply what fits. That profile rates a site by
the machine-readable files it publishes. Set beside it, this site lacked four
things:

- a way to call the tools without speaking MCP
- a description of that way that a program can read (OpenAPI)
- the page of a term without its HTML
- files at fixed addresses that let a client find the server and learn when
  to use it

## Decision

1. **Plain HTTP API.** `GET` or `POST /api/v1/<tool>` runs one tool of
   `api/mcp.ts` and returns the object that MCP returns as
   `structuredContent`. `GET /api/v1` lists the tools. `vercel.json` rewrites
   both addresses to the function of ADR 0006. There is still one function,
   and it still imports nothing.
2. **`/openapi.json`.** The build writes it from the `TOOLS` array: the input
   schema of a tool becomes the parameters, the output schema becomes the
   answer.
3. **Markdown pages.** The build writes `/<slug>.md` and `/en/<slug>.md`
   beside each term page. They are static files. The HTML page names its
   markdown copy in a `link rel="alternate"` tag.
4. **Discovery files**, both static:
   - `/.well-known/mcp/server-card.json`, after SEP-1649 of the MCP project.
   - `/.well-known/agent-skills/index.json` and one `SKILL.md`, after the
     Agent Skills Discovery RFC, version 0.2.0.
5. **`llms.txt` starts with how to connect**: the addresses above, the tools,
   and which tool to call first.
6. **`get_term` returns `learn_url` and `map_url`**, so an agent can send the
   user to the course or to the map.

Each tool carries an `example` in `api/mcp.ts`. The pages, the OpenAPI file
and the skill show it, and the build runs it and stops when it finds nothing.

Left out, because the dictionary has nothing behind them: the pricing, quote
and contact tools of Plant Guide, and a `format=markdown` switch on the API.

## Consequences

- The exception of ADR 0001 stays one function. The API shares its rate limit
  and its failure when the corpus cannot be read.
- A GET with a parameter the tool does not have is answered as if the
  parameter were absent. A misspelt optional parameter is therefore silent.
- SEP-1649 and the skills RFC are drafts. When either changes its address or
  its fields, the two functions in `site/build.ts` that write the files change
  with it.
- The digest in the skills index is taken from the bytes the build writes, so
  the two files cannot disagree.
- The server card is not a registry listing. The licence question of ADR 0006
  is still open, and the server is still in no public registry.
