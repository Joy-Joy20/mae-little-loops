import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://pafabwbjzjvkgatbirko.supabase.co";

export async function POST() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    return NextResponse.json({ error: "Server configuration error." }, { status: 500 });
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Get all auth users
  const { data: { users }, error: listError } = await adminClient.auth.admin.listUsers();
  if (listError) {
    return NextResponse.json({ error: listError.message }, { status: 500 });
  }

  // Get existing profile IDs
  const { data: existingProfiles } = await adminClient.from("profiles").select("id");
  const existingIds = new Set((existingProfiles ?? []).map((p: { id: string }) => p.id));

  // Insert missing profiles
  const missing = users
    .filter(u => !existingIds.has(u.id))
    .map(u => ({
      id: u.id,
      email: u.email ?? "",
      full_name: u.user_metadata?.full_name ?? null,
      role: "customer",
    }));

  if (missing.length > 0) {
    const { error: insertError } = await adminClient.from("profiles").insert(missing);
    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }
  }

  return NextResponse.json({ synced: missing.length, total: users.length });
}
