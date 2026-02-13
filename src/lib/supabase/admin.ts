import { createClient } from "@supabase/supabase-js";

// Admin client uses the service_role key to bypass RLS
// ONLY use this in server-side code (API routes)
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}
