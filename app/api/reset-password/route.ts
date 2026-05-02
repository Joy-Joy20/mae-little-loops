import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://pafabwbjzjvkgatbirko.supabase.co";

export async function POST(req: NextRequest) {
  try {
    const { token, email, password } = await req.json();

    if (!token || !email || !password) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceRoleKey) {
      return NextResponse.json({ error: "Server configuration error." }, { status: 500 });
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Validate token
    const { data: resetData, error: tokenError } = await adminClient
      .from("password_resets")
      .select("*")
      .eq("email", email)
      .eq("token", token)
      .eq("used", false)
      .gte("expires_at", new Date().toISOString())
      .single();

    if (tokenError || !resetData) {
      return NextResponse.json({ error: "Invalid or expired reset link. Please request a new one." }, { status: 400 });
    }

    // Find user by email
    const { data: { users }, error: listError } = await adminClient.auth.admin.listUsers();
    if (listError) {
      return NextResponse.json({ error: "Failed to find user." }, { status: 500 });
    }

    const user = users.find(u => u.email === email);
    if (!user) {
      return NextResponse.json({ error: "No account found with this email." }, { status: 404 });
    }

    // Update password via admin API — no session required
    const { error: updateError } = await adminClient.auth.admin.updateUserById(user.id, { password });
    if (updateError) {
      return NextResponse.json({ error: updateError.message || "Failed to update password." }, { status: 500 });
    }

    // Mark token as used
    await adminClient.from("password_resets").update({ used: true }).eq("id", resetData.id);

    return NextResponse.json({ success: true });

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unexpected error.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
