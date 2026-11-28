---
status: accepted
date: 2026-11-28
title_vi: Màn hình pha P02 của Game9K là trang tĩnh theo theme Hum
summary: The owner chose the Hum theme and started phase P02, then replaced its typeface with Be Vietnam Pro and Lora because the theme's own face drew Vietnamese letters with marks wrongly. The screens are static HTML and CSS files under game9k/02-ux, one per flow, and the site build publishes them so that each pull request has a preview. They are design documents, not the application's code.
summary_vi: Chủ dự án chọn theme Hum và cho bắt đầu pha P02, rồi thay kiểu chữ của theme bằng Be Vietnam Pro và Lora vì kiểu chữ gốc hiện sai chữ tiếng Việt có dấu. Màn hình là các tệp HTML và CSS tĩnh trong game9k/02-ux, mỗi luồng một tệp, và bản dựng của trang đưa chúng lên để mỗi pull request có bản xem thử. Chúng là tài liệu thiết kế, không phải mã của ứng dụng.
---

# Game9K screens of phase P02 are static pages in the Hum theme

## Context

[ADR 0013](0013-game9k-screens-are-built-with-hallmark-and-checked-by-sloplint.md)
said how a Game9K screen is built and checked. It left two things to the owner:
the theme, and when phase P02 starts.

On 2026-11-28 the owner wrote: "https://www.usehallmark.com/themes/hum/ : chọn.
bắt đầu pha P02" (Hum: chosen. Start phase P02).

Two things were then still open, and the agent had to settle them to build the
first screen. Where does a screen live, when
[ADR 0011](0011-the-repository-also-holds-the-game9k-project.md) says `game9k/`
holds documents and no game code? And how does the owner look at a screen
before merging?

## Decision

- **The theme is Hum.** This is the owner's decision. Hum gives the palette,
  the radii and the surfaces. Layout and navigation belong to each screen, as
  Hallmark's app scope requires.
- **The typefaces are Be Vietnam Pro and Lora, not Hum's Chillax.** On
  2026-11-29 the owner opened the first screen, saw that Vietnamese letters
  with marks were drawn wrongly, and wrote: "Hãy đổi sang cho đúng chuẩn font
  của Claude design" (change to the font standard of Claude's design). The
  agent read that as the published Anthropic brand guideline
  (`anthropics/skills`, `skills/brand-guidelines`, commit `b9e19e6`), which
  names Poppins for headings and Lora for body text.
  - Lora is used for body text, as the guideline says.
  - Poppins lacks 90 of the 134 Vietnamese letters with marks, by its files.
    Be Vietnam Pro stands in for it, for headings, labels and controls.
  - Both faces are under the SIL Open Font License 1.1 and are served by the
    site. No screen loads a font from a third party. Since
    [ADR 0015](0015-the-whole-project-is-set-in-lora-and-be-vietnam-pro.md)
    the whole project uses the same two faces and the same files.
- **Phase P02 started on 2026-11-28.** This is the owner's decision.
- **A screen is a static HTML file under `game9k/02-ux/`**, with shared CSS
  beside it. There is one file per flow of the requirements document. A screen
  is a design document: it shows what the owner approves at the P02 gate. It
  holds sample data and calls no server. This is the agent's choice.
- **The site build copies `game9k/02-ux/` to `/game9k/02-ux/`.** Each pull
  request then has a Vercel preview of the screens. The pages carry `noindex`,
  are in no sitemap, and nothing on the dictionary site links to them. This is
  the agent's choice.
- **The states of a screen are reached by the address** (`?state=…`). The owner
  can open each state, and a reviewer can link to one.

## Not decided

- **Whether these files become the application's code.** Issue #29 (where the
  code lives) and the framework are open. Phase P04 may rewrite every screen.
- **Whether `sloplint` runs in CI.** It ran by hand for the first screen.
- **A `design.md` that locks the system.** Hallmark writes one only when asked
  to. The first screen's `app.css` is the reference until then.

## Consequences

- `game9k/` now holds HTML, CSS and one small script. They are prototype
  screens, not game code, so ADR 0011 stands. If the owner reads ADR 0011 more
  strictly, the folder moves and this record is replaced.
- The prototype is served from the dictionary's Vercel project. That project
  is on the Hobby plan, which is for non-commercial use. A prototype with
  sample data and no customer fits that. The real service does not; issue #55
  still needs its own decision.
- The screens no longer follow Hum in one respect: Hum says "no serif", and
  Lora is a serif. The owner's instruction comes first. The stamp at the top
  of `app.css` says the faces were replaced.
- Fontshare lists Vietnamese among the languages of Chillax. The owner's
  screenshot showed otherwise; the agent did not examine the Chillax file. A
  font's language list is not evidence. From now on a face is checked against
  its files before it is used.
- `site/build.ts` reserves the path `game9k`, so no dictionary term can take
  that slug.
- **Not verified.** Whether Poppins and Lora are what the owner meant by
  "Claude design". The typefaces of the Claude application itself were not
  examined; a commercial face could not be put in a public repository without
  a licence. The new faces were rendered in the sandbox only, in Chromium on
  Linux, not on the owner's machine.
