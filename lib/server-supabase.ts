import { createClient } from "@supabase/supabase-js";

const fallbackUrl = "https://pafabwbjzjvkgatbirko.supabase.co";
const fallbackAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBhZmFid2Jqemp2a2dhdGJpcmtvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3OTg3NjYsImV4cCI6MjA5MTM3NDc2Nn0.awMxPalEb94oE17229mymLbMqJKqYvrEHpidiNmcJSg";

function normalizeSupabaseUrl(rawUrl?: string) {
  if (!rawUrl) return fallbackUrl;
  return rawUrl.replace(/\/rest\/v1\/?$/, "");
}

export const supabaseUrl = normalizeSupabaseUrl(
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL,
);

export const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABSE_KEY ||
  fallbackAnonKey;

export const supabaseServiceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || "";

export function createSupabaseUserClient(accessToken?: string) {
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: accessToken
      ? {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      : undefined,
  });
}

export function createSupabaseAdminClient() {
  return createClient(
    supabaseUrl,
    supabaseServiceRoleKey || supabaseAnonKey,
  );
}

export function hasServiceRoleKey() {
  return Boolean(supabaseServiceRoleKey);
}
