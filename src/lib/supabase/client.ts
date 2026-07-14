import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseConfig } from "./env";

export function createClient() {
  const { supabaseUrl, supabaseKey } = getSupabaseConfig();

  return createBrowserClient(supabaseUrl, supabaseKey);
}
