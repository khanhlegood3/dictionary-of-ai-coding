---
status: accepted
date: 2026-11-24
title_vi: Tiến độ học lưu trong IndexedDB theo UUID ẩn danh, đồng bộ sau khi đăng nhập Google
summary: Progress is always stored in the browser, keyed by a UUID the browser makes. It goes to Supabase only after the learner signs in with Google.
summary_vi: Tiến độ luôn được lưu trong trình duyệt, khoá là một UUID do trình duyệt tạo. Dữ liệu chỉ lên Supabase sau khi người học đăng nhập bằng Google.
---

# Learn progress lives in IndexedDB under an anonymous UUID and syncs after Google sign-in

## Context

The Learn view records which terms a learner has finished and where they
stopped. The owner's rule: always store this in IndexedDB, with an anonymous
UUID as the only primary key, and sync it to Supabase when the learner signs in
with Google.

## Decision

On the first visit the browser makes a UUID and stores one progress record
under it in IndexedDB. That UUID is the learner's only identity until they sign
in. The site sends nothing to a server before sign-in.

After Google sign-in the same record is copied to the table
`public.learn_progress` in Supabase. The row's primary key is the browser's
UUID, and `user_id` is the Google account. Row level security lets an account
read and write only its own rows. Records from two devices of one account are
merged: a term is finished if either device finished it after the latest reset.

## Consequences

- The Learn view works offline and without an account.
- Progress follows the learner across devices only after sign-in.
- A learner who clears browser storage before signing in loses their progress.
- The Supabase client is loaded only when sign-in is used, so a visitor who
  never signs in does not download it.
- The publishable key is in the page. Row level security is the only thing that
  protects the table, so every change to the table needs a policy check.
