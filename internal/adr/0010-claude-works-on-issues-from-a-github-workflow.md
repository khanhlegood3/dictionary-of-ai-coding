---
status: accepted
date: 2026-11-27
title_vi: Claude làm issue từ một workflow trên GitHub khi được gọi bằng @claude
summary: Writing "@claude" in an issue or a comment starts Claude Code in a GitHub workflow. Claude pushes a branch and gives a link to open the pull request. The owner opens and merges it. The key is a repository secret, not part of the site.
summary_vi: Gõ "@claude" trong một issue hoặc bình luận sẽ chạy Claude Code trong một workflow trên GitHub. Claude đẩy một nhánh và đưa liên kết để mở pull request. Chủ dự án mở và merge. Khoá nằm trong secret của kho, không nằm trong website.
---

# Claude works on issues from a GitHub workflow

## Context

ADR 0008 kept `/tasks` read-only and left one thing open: running an agent
from GitHub itself, which needs a secret in the repository settings. The owner
now wants to give an issue to Claude without leaving GitHub.

Three ways were set side by side:

| Way                                    | Where the work runs           | Can it run the checks | What the owner sets up     |
| -------------------------------------- | ----------------------------- | --------------------- | -------------------------- |
| Claude chat with the GitHub MCP server | Nowhere: files are sent whole | No                    | A connector in Claude      |
| Claude Code on the web                 | A machine at Anthropic        | Yes                   | GitHub connected in Claude |
| `@claude` on GitHub                    | A GitHub Actions run          | Yes                   | The Claude app, one secret |

The first two need nothing in this repository. This record is about the third.

## Decision

`.github/workflows/claude.yml` runs `anthropics/claude-code-action` when
"@claude" is written in an issue, a comment or a review.

- **Who can start it.** The owner and collaborators. The workflow checks this
  before the job starts, and the action checks it again.
- **What Claude reads.** The issue or pull request, the owner's comments and
  its own. Comments by anyone else are left out, because the repository is
  public and anyone can comment.
- **What Claude may run.** The checks named in `AGENTS.md`: `npm ci`,
  `npm run generate`, `npm run build`, `npm run check:mcp`, `npx tsc` and
  `npx prettier`. Any other command goes through the action's safety review.
- **What comes out.** A branch named `claude/…` and a comment with a link that
  opens the pull request. Claude does not open it and cannot merge.
- **The key.** One repository secret, `CLAUDE_CODE_OAUTH_TOKEN` or
  `ANTHROPIC_API_KEY`. It is read only by this workflow. Nothing of it is in
  the site, so ADR 0008 holds.

## Consequences

- Each run uses the owner's Claude plan, or is billed to the API key. A run
  stops after 30 minutes.
- The text of an issue is an instruction to Claude. The owner reads an issue
  written by someone else before writing "@claude" on it.
- The safety review of the action is a review, not a wall. The protection
  that holds is that the owner reads the diff before opening the pull request,
  and that the checks "Site" and "README freshness" run on it.
- Without the app or the secret, the workflow fails when it is started and
  does nothing else.
- The action is used at its moving tag `v1`, as its guide does. A change in
  the action reaches this repository without a change here.
- Pull requests from forks are not handled. The action skips them.
