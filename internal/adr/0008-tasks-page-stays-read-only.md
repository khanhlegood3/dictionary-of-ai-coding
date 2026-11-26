---
status: accepted
date: 2026-11-27
title_vi: Trang công việc vẫn chỉ đọc khi giao việc cho agent và liệt kê pull request
summary: /tasks hands a task to an agent by copying a brief, and lists the open pull requests with a link to GitHub. The page still holds no token, so it cannot label, assign or merge.
summary_vi: Trang /tasks giao việc cho agent bằng cách chép một đề bài, và liệt kê các pull request đang mở kèm liên kết sang GitHub. Trang vẫn không giữ token nào, nên không gắn nhãn, không giao việc và không merge được.
---

# The tasks page stays read-only

## Context

The owner asked for two things on `/tasks`: a button that gives a task to an
agent, and the pull requests of the repository, so that none waits unseen.

Both could be done by writing to GitHub from the page: set a label, assign
the issue, merge the pull request. Writing needs a token. The page is a public
static file (ADR 0001, ADR 0005), and a token placed in it can be read by
anyone who opens the page.

## Decision

The page keeps reading only.

- **Brief.** Every open task has a button that copies a brief: the issue's
  number, title, address, labels and text, and the working rules of this
  repository. The owner pastes it into the agent of their choice.
- **Pull requests.** The page lists the open pull requests, the oldest first,
  with their branches and whether each is a draft, and counts them in a number
  card. It also shows the five most recently merged. A pull request is
  reviewed and merged on GitHub.
- **Merged branches.** On request the page lists the branches whose last
  commit a merged pull request already carried. They are deleted on GitHub.

The pull requests come from the issue list the page already fetches. The
branch names need a second request, sent only while a pull request is open.
The branch check costs two more requests and runs only when asked for.

## Consequences

- No token, no sign-in and no server code are added.
- Handing a task over takes one paste. Nothing on GitHub records that an agent
  has started until the agent opens a pull request.
- Running an agent by itself when an issue gets the label `ready-for-agent`
  is possible later with a GitHub Action. That needs a secret in the
  repository settings, not in the page, and is a separate decision.
- A page view costs one or two of GitHub's 60 requests per hour and address.
