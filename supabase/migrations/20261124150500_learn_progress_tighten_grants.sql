-- Supabase grants new tables more than the site needs. TRUNCATE in
-- particular is not held back by row level security.

revoke truncate, references, trigger on table public.learn_progress from authenticated;
revoke all on table public.learn_progress from anon;
