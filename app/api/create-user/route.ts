import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://pafabwbjzjvkgatbirko.supabase.co";

export async function POST(req: NextRequest) {
  try {
    const { email, password, full_name, role } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceRoleKey) {
      return NextResponse.json({ error: "Server configuration error." }, { status: 500 });
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Create auth user
    const { data: { user }, error: createError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (createError || !user) {
      return NextResponse.json({ error: createError?.message || "Failed to create user." }, { status: 500 });
    }

    // Insert into profiles table
    await adminClient.from("profiles").insert([{
      id: user.id,
      email,
      full_name: full_name || null,
      role: role || "customer",
    }]);

    return NextResponse.json({ success: true, user: { id: user.id, email } });

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unexpected error.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
