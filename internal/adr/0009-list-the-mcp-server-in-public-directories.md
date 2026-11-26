---
status: proposed
date: 2026-11-27
title_vi: Đăng máy chủ MCP vào các danh bạ công khai
summary: Open question. The listing for the official MCP Registry is ready and takes one manual run to publish. The proposal is to publish after the licence of the entries (issue #14) is settled, because a published listing cannot be taken back.
summary_vi: Chưa quyết định. Bản đăng cho MCP Registry chính thức đã sẵn và chỉ cần một lần chạy tay để công bố. Đề xuất là công bố sau khi chốt giấy phép của các mục từ (issue #14), vì bản đăng đã công bố thì không rút lại được.
---

# List the MCP server in public directories

## Context

The MCP server of ADR 0006 works, and nothing points an agent to it except
this site. Public directories do that work. The owner named three:

| Directory                                                             | How a server gets in                                               |
| --------------------------------------------------------------------- | ------------------------------------------------------------------ |
| The official MCP Registry, `registry.modelcontextprotocol.io`         | The owner publishes a `server.json`                                |
| RAGMap, `khalidsaidi/ragmap`                                          | By itself: it reads the official registry every day and connects   |
| Verified Remote MCP Servers, `odedkovach/verified-remote-mcp-servers` | A pull request to that repository that adds one file of six fields |

The two sites this project was modelled on, Football Atlas and Plant Guide,
are both in RAGMap. So the official registry is the door to the others.

What a listing costs:

- The registry's terms give the listing (name, description, addresses) to the
  public domain under CC0. That covers the listing, not the dictionary.
- A published version cannot be changed or deleted. A correction is a new
  version.
- The directories connect every day and drop a server that does not answer.

ADR 0006 said the licence of the content must be settled before the server is
listed. The English entries come from `mattpocock/dictionary-of-ai-coding`,
which has no licence file (issue #14). The site is already public, so a
listing does not change what is published. It brings more readers and more
copies to content whose terms of use are not stated.

## Options

### A. Publish now

Start the workflow "Publish to the MCP Registry" on GitHub and type `publish`.
RAGMap follows within a day or two if its check accepts the server.

### B. Settle the licence first, then publish

Ask the author of the English entries (issue #14), state the answer on the
site, then start the same workflow.

## Proposal

**B.** The step that remains in issue #14 is one question to one person, and
the listing cannot be taken back.

## What is ready either way

- `server.json` at the repository root, under the name
  `io.github.khanhlegood3/ai-coding-dictionary`. The build stops when it
  disagrees with `api/mcp.ts`.
- `.github/workflows/publish-registry.yml`. It runs only by hand, only on
  `main`, and only after the public server has passed `npm run check:mcp`.
  It signs in to the registry through GitHub OIDC, so no secret is stored.
- `npm run check:mcp`, which connects the way these directories do. It runs
  on every pull request, and every day against production.

## Consequences

- When a tool changes, `SERVER.version` and `server.json` are raised
  together, and the workflow is run again to publish the new version.
- The name is tied to the GitHub account `khanhlegood3`. Moving to a name
  under the site's own domain would be a new listing.
- The pull request to the third directory is made by the owner, in that
  repository. It is not automated here.
