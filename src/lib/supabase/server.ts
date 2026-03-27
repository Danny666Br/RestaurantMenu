import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

/** Cliente para API routes — usa la anon key por defecto. */
export function createServerClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

/**
 * Cliente con service_role key para operaciones de admin.
 * Bypasa RLS — usar SOLO en API routes protegidas con ADMIN_PASSWORD.
 */
export function createAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}
