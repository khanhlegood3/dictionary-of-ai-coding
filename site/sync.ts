// The Supabase project that keeps signed-in visitors' Learn progress.
//
// Both values are public by design: they are sent to every browser that
// opens the Learn view. What a browser may do with them is decided by the
// row level security rules in supabase/migrations/, not by keeping them
// secret. Never put a secret or service_role key here.
//
// Leave either value empty to build the site without sign-in and sync.

export const SYNC = {
  url: "https://eurgyousvvypevqwbmvq.supabase.co",
  publishableKey: "sb_publishable_1X20wnU9WdO68n3ATQhnzw_Qr1PWv-3",
};
