---
status: accepted
date: 2026-11-29
title_vi: Toàn dự án dùng kiểu chữ Lora và Be Vietnam Pro
summary: Every page of the dictionary and every Game9K screen is set in Lora (serif) and Be Vietnam Pro (sans), served from the site itself. The earlier serif came from the reader's machine and drew Vietnamese letters with marks wrongly.
summary_vi: Mọi trang của từ điển và mọi màn hình Game9K dùng Lora (chữ có chân) và Be Vietnam Pro (chữ không chân), do chính trang này phục vụ. Kiểu chữ có chân trước đây lấy từ máy người đọc và hiện sai chữ tiếng Việt có dấu.
---

# The whole project is set in Lora and Be Vietnam Pro

## Context

The dictionary site named no typeface of its own. Its serif was a list of faces
on the reader's machine, starting with Iowan Old Style and Palatino. The site's
default language is Vietnamese. On 2026-11-29 the owner sent a screenshot of
the term page for MCP on macOS: in the definition, "thức" was drawn as "thûc"
and "được" as "đúọc". The serif on that machine does not have those letters.

The same day the owner had approved Lora and Be Vietnam Pro for the Game9K
screens
([ADR 0014](0014-game9k-screens-of-phase-p02-are-static-pages-in-the-hum-theme.md))
and then wrote: "Chỉnh luôn font chữ toàn dự án" (change the font of the whole
project as well).

## Decision

- **The serif of the project is Lora and the sans is Be Vietnam Pro.** Both
  have every Vietnamese letter, checked on the font files. Both are under the
  SIL Open Font License 1.1.
- **The site serves the font files.** The build copies them from the npm
  packages `@fontsource-variable/lora` and `@fontsource/be-vietnam-pro` to
  `/assets/fonts/`, with the licence texts. `site/fonts.css` names the files
  and is the one list of them. No page loads a font from a third party.
- **Where each face is used does not change.** On the dictionary, headings and
  definitions stay in the serif and running text stays in the sans. Only the
  faces behind `--serif` and `--sans` changed. This is the agent's choice: the
  owner asked for the font, not for a new layout.
- **The Game9K screens use the same files** through `/assets/fonts.css`. The
  copies under `game9k/02-ux/fonts/` are removed.
- **The Learn view keeps JetBrains Mono.** It has Vietnamese letters and is
  part of that view's look. Its shared header takes the new faces.

## Consequences

- A page now downloads fonts. Measured on the term page for MCP in the
  sandbox: ten files and 179 KiB in Vietnamese, four files and 101 KiB in
  English. Before, a page outside `/learn` downloaded none. The main files are
  preloaded.
- Text is first drawn in a fallback face and then redrawn when the font
  arrives (`font-display: swap`), so lines can move once on a first visit.
  The fallbacks are Georgia and the system sans, which have Vietnamese
  letters on the systems the agent knows of.
- The Game9K screens are no longer self-contained: a screen opened straight
  from the folder, without the built site, shows the fallback faces.
- This is a change to the look of the dictionary. ADR 0013 said the dictionary
  is not redesigned; that still holds for layout, colour and components.
- **Not verified.** The pages were rendered in Chromium on Linux in the
  sandbox, not on macOS or Windows, and not in Safari or Firefox. The cost of
  the fonts on a slow connection was not measured. The owner's machine is the
  first real check.
