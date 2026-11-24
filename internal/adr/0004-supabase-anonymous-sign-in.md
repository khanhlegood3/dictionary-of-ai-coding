---
status: proposed
date: 2026-11-24
title_vi: Có tạo tài khoản ẩn danh trên Supabase cho người học chưa đăng nhập không
summary: Open question. Either keep the browser UUID as the only identity before Google sign-in, or also create a Supabase anonymous account for each learner. The proposal is to keep the browser UUID.
summary_vi: Chưa quyết định. Hoặc giữ UUID của trình duyệt làm danh tính duy nhất trước khi đăng nhập Google, hoặc tạo thêm tài khoản ẩn danh trên Supabase cho mỗi người học. Đề xuất là giữ UUID của trình duyệt.
---

# Supabase anonymous sign-in for learners who have not signed in

## Context

ADR 0003 identifies a learner who has not signed in by a UUID made in the
browser. No account exists on the server for them.

Supabase can also create an anonymous account. A call to `signInAnonymously()`
adds a row to `auth.users` marked `is_anonymous`. The browser gets a session
with the `authenticated` role and an `is_anonymous` claim. The question is
whether the site should create such an account for each learner.

## Options

### A. Keep the browser UUID only

This is ADR 0003 as it stands. The anonymous provider stays switched off in
Supabase.

### B. Create a Supabase anonymous account for each learner

| Step                                                          | What happens                                                                                                                                                                                                |
| ------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| First finished term                                           | The site calls `signInAnonymously()` with a CAPTCHA token. Not on page load, so a visitor who only looks around creates no account.                                                                         |
| Sync                                                          | The progress row keeps the browser UUID as its primary key. `user_id` is the anonymous account.                                                                                                             |
| Google sign-in, new Google account                            | `linkIdentity()` adds Google to the same account. The user id and the row stay the same. This needs "manual linking" switched on.                                                                           |
| Google sign-in, Google account already used on another device | `linkIdentity()` fails because the identity belongs to another account. The site deletes the row under the anonymous session, signs in to the existing account, and writes the record again from IndexedDB. |
| Clean-up                                                      | A scheduled job deletes anonymous accounts that have not been seen for 30 days. Their rows go with them.                                                                                                    |

What B gives:

- The server knows how many learners there are and how far they got before
  they sign in.
- A learner who signs in with a new Google account keeps one account id from
  the first visit.

What B does not give:

- Recovery. The anonymous session is kept in the same browser storage as the
  progress. Clearing the storage loses both, and an anonymous account cannot be
  opened from another device.

What B costs:

- Every learner becomes a row in `auth.users` and counts as a monthly active
  user.
- The publishable key is public, so anyone can call the sign-up endpoint.
  Without a CAPTCHA the only limit is 30 anonymous sign-ins per hour per IP
  address.
- An anonymous account has the `authenticated` role, so the current policies
  on `learn_progress` let it write rows. That is wanted in B. In A it has to be
  prevented, by keeping the provider off or by a restrictive policy on the
  `is_anonymous` claim.
- Progress leaves the browser before sign-in. This changes the rule in
  ADR 0003 and needs a privacy note on the site.

## Proposal

Choose A for now. B adds accounts, a CAPTCHA, account linking and a clean-up
job, and its one benefit is usage numbers for learners who never sign in. Page
analytics can give those numbers with less to maintain.

Choose B later if the project needs per-learner progress numbers before
sign-in.

## To decide

- A or B.
- With A: keep the anonymous provider off in the Supabase dashboard.
- With B: which CAPTCHA provider, and how long an unused anonymous account is
  kept.
