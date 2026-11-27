---
status: accepted
date: 2026-11-27
title_vi: Kho này cũng là nơi quản trị dự án Game9K
summary: The repository keeps the dictionary and its site, and also becomes the place where the Game9K project is managed. Game9K documents live in game9k/. A phase gate is a pull request the owner merges. An agent never merges and never marks a gate passed.
summary_vi: Kho vẫn giữ từ điển và website của nó, và trở thành nơi quản trị dự án Game9K. Tài liệu Game9K nằm trong game9k/. Một cổng của pha là một pull request do chủ dự án merge. Agent không merge và không tự đánh dấu cổng đã qua.
---

# The repository also holds the Game9K project

## Context

On 2026-11-27 the owner said that this repository grows into the place where
the Game9K project is managed: its documents, its decisions and its backlog,
with checks on GitHub and several AI agents working on issues. The method is
the "AI-Agile Product Development Framework" (bbv Software Services and Gotik
Consulting, process guide v1.0).

Two facts shape the decision:

- The GitHub account that held the main Game9K repository (`MetaPump`) and a
  copy of `Game9K-Starter-Kit` is gone. Both addresses answer 404. Drafts
  remain in `khanhlegood1/GameFun` and `khanhlegood1/Game9K-Starter-Kit`, and
  two sites are still served by Vercel.
- This repository already has what the framework asks of GitHub: decision
  records, a backlog of issues with triage labels, checks on every pull
  request, a page that shows both (`/tasks`), and a workflow that gives an
  issue to an agent (ADR 0010).

## Decision

- **Two things in one repository.** The dictionary and its site stay as they
  are. The management of Game9K is added under `game9k/`.
- **Documents, not game code.** `game9k/` holds requirements, designs,
  research and the material carried over from the lost repository. Where the
  code of the games and the launchpad lives is open (issue #29).
- **GitHub is the single source.** A task is an issue. A decision is a record
  in `internal/adr/`, in the same number series as the dictionary's records,
  so that `/tasks` shows them. The records of the lost repository had their
  own numbers and are cited as "MetaPump ADR-00NN".
- **Six phases, each closed by a gate.** P01 requirements, P02 screens, P03
  API contract and data model, P04 build, P05 non-functional review, P06
  deployment. The labels `phase:P01` to `phase:P06` put an issue in a phase.
- **A gate is a pull request with the label `gate`.** Merging it is the
  owner's approval of the output of that phase. An agent prepares the pull
  request. It does not merge it, and it does not write that a gate is passed.
- **A figure names its source.** A number in a Game9K document says where it
  comes from: a file, an address, or a measurement that can be run again. A
  number with no source is marked "chưa có nguồn" and is not used to justify
  a decision.
- **Carried-over material is kept as it was.** Files in `game9k/sources/` are
  not edited and not formatted. `game9k/sources/README.md` says where each
  came from.

## Consequences

- `/tasks` shows the issues of the dictionary and of Game9K together. The
  label `game9k` tells them apart. The page does not show phases yet (issue
  #31).
- The name of the repository and the title of the site still say
  "dictionary". They are not changed here.
- The repository is a public fork. GitHub does not let a fork be made
  private. Everything in `game9k/` is public the moment it is pushed.
  Material for investors that must stay private needs another place.
- The dictionary text is Matt Pocock's, with no licence stated (issue #14).
  The Game9K documents are the owner's. The two are kept in separate folders
  so that the answer to issue #14 does not touch Game9K.
- The framework's own slides are not copied here: they belong to their
  authors. `game9k/PROCESS.md` describes how the framework is applied.
- No phase has passed a gate in this repository. The drafts made before are
  inputs, listed in `game9k/README.md`.
