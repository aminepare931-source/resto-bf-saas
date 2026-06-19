## Problem

The preview is blank. Dev server logs show the cause: SSR crashed earlier with `Cannot find module '@supabase/supabase-js'` (imported by `src/integrations/supabase/client.ts` and `auth-attacher.ts`). After installing the package, Vite re-optimized dependencies (`✨ new dependencies optimized: @supabase/supabase-js`) and the dev server is back up, but the iframe still shows the old failed SSR response.

## Plan

1. Restart the Vite dev server to flush the stale SSR module cache.
2. Check preview health to confirm the page renders (the placeholder index at `src/routes/index.tsx` is unchanged and should display).
3. If still blank, re-read the latest dev server logs and fix any remaining import error in `src/integrations/supabase/*`.

No code changes are expected — the install already fixed the root cause.

## Next step after this

Once the preview is green, we still need to decide what to actually build (the index route is the default blank placeholder). Tell me what app you want and I'll start.