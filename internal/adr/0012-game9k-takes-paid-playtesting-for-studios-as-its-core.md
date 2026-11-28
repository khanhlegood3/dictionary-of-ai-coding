---
status: accepted
date: 2026-11-28
title_vi: Game9K lấy dịch vụ chơi thử trả phí cho studio làm lõi
summary: The core business of Game9K is paid playtesting for studios. A studio pays for evidence of how one version of its web game plays. The KVU-KAU launchpad is not chosen, and no work on tokens, contracts or fundraising starts without a later record. The choice rests on reasoning, not on measured demand.
summary_vi: Lõi kinh doanh của Game9K là dịch vụ chơi thử trả phí cho studio. Studio trả tiền để nhận bằng chứng về cách một phiên bản game web của họ được chơi. Launchpad KVU–KAU không được chọn, và không việc nào về token, hợp đồng hay gọi vốn bắt đầu khi chưa có một quyết định sau này. Lựa chọn này dựa trên lập luận, chưa dựa trên nhu cầu đã đo.
---

# Game9K takes paid playtesting for studios as its core

## Context

Issue #10 asked which business Game9K is in. Two directions were on the table:

- **Paid playtesting for studios** ("Playtest B2B làm lõi"). The owner's
  comment in issue #10 of 2026-11-27 proposed it as the starting core: a
  studio puts a web build on Game9K, people play it in the browser, and the
  studio pays for the evidence.
- **The KVU–KAU launchpad.** The report in
  `game9k/sources/kien-truc-kvu-kau.md` proposed funding each game version
  through milestone-gated token sales and stepped pre-orders. On 2026-11-27
  the owner said this direction was not chosen.

Three research notes in `game9k/research/` compared them:
`chon-huong-kinh-doanh.md`, `ai-agent-nganh-game.md` and
`du-cong-nghe-chua.md`. Their argument, in short: making a simple browser game
now costs cents, so the scarce thing is a trusted measurement of a game, not
the game; playtesting sells that measurement; and a launchpad needs the same
measurement before it can open any gate, so it depends on playtesting and not
the other way round.

On 2026-11-28 the owner wrote: chốt "Playtest B2B làm lõi".

## Decision

- **The core of Game9K is paid playtesting for studios.** A studio pays
  Game9K for evidence of how one version of its web game plays.
- **The KVU–KAU launchpad stays not chosen.**

## Not decided

The owner chose the core and nothing else. These stay open:

- Who pays: the studio that made the game, or whoever has to choose among
  games (a portal, a publisher, a funder).
- The price, and what one report contains.
- How much of a playtest is done by people and how much by an agent.
- Where the code lives (issue #29) and which model provider an agent uses.
- Whether the launchpad is ever taken up.

## Consequences

- Issue #10 is answered. Issue #28 is no longer blocked by it: the
  requirements document of phase P01 is written for this core.
- No work on tokens, smart contracts, pre-order campaigns or a fundraising
  entity is planned. Taking the launchpad up needs a new decision record,
  because ADR 0011 makes every decision a record.
- **The choice is not validated.** Nobody has been asked whether they would
  pay. The figures called "Game Portal 2026" in issue #10 have no source
  (issue #27) and played no part in this decision. The first work that
  matters is the paid trial described in `chon-huong-kinh-doanh.md`.
- `du-cong-nghe-chua.md` lists eleven pieces this core needs. Two exist as
  drafts and one in part. Two of the missing ones are not technology: a panel
  of testers and a studio that pays.
- `game9k/01-requirements/ho-chieu-goi-von.md` stays a draft. Its stamps,
  which are measurements of a version, describe what this core produces. Its
  funding doors describe the launchpad and are not planned work.
- The report in `game9k/sources/` stays unedited, as ADR 0011 requires. It is
  a source for the measurement thresholds only.
- This record is reopened if the paid trial shows that nobody pays for a
  playtest report, or if a funder or licensed partner commits to the
  launchpad.
