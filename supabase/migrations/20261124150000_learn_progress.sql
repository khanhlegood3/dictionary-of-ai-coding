-- Learning progress of the Learn view, one row per browser.
--
-- The browser keeps its progress in IndexedDB under an anonymous UUID that it
-- makes itself. That UUID is the primary key here too. A row is written only
-- after the visitor signs in, and it then belongs to that account: user_id is
-- filled from the session, and row level security keeps every other account
-- out. One account can own several rows, one per browser it signed in on; the
-- site merges them when it reads them.

create table public.learn_progress (
  -- The anonymous id made in the browser.
  id uuid primary key,
  user_id uuid not null default auth.uid()
    references auth.users (id) on delete cascade,
  -- { "<term slug>": <time the term was finished, ms since 1970> }
  done jsonb not null default '{}'::jsonb,
  -- { "p": "<term slug>/<step number>", "t": <ms since 1970> } or null
  last jsonb,
  -- Time of the last "reset progress", ms since 1970. Terms finished at or
  -- before it no longer count.
  reset_at bigint not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint learn_progress_done_is_object check (jsonb_typeof(done) = 'object'),
  constraint learn_progress_done_size check (pg_column_size(done) < 32768),
  constraint learn_progress_last_shape check (
    last is null
    or (jsonb_typeof(last) = 'object' and pg_column_size(last) < 1024)
  ),
  constraint learn_progress_reset_at_positive check (reset_at >= 0)
);

comment on table public.learn_progress is
  'Learn view progress, one row per browser. id is the anonymous UUID the browser made; user_id is the signed-in owner.';

create index learn_progress_user_id_idx on public.learn_progress (user_id);

alter table public.learn_progress enable row level security;

revoke all on table public.learn_progress from anon;
grant select, insert, update, delete on table public.learn_progress to authenticated;

create policy "Own rows can be read"
  on public.learn_progress for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Own rows can be added"
  on public.learn_progress for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Own rows can be changed"
  on public.learn_progress for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Own rows can be removed"
  on public.learn_progress for delete to authenticated
  using ((select auth.uid()) = user_id);
