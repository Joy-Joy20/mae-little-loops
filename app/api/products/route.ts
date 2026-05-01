import { NextRequest, NextResponse } from "next/server";
import { createSupabaseUserClient } from "../../../lib/server-supabase";
import { validateAndNormalizeProductInput } from "../../../lib/product-validation";

const ADMIN_EMAIL = process.env.ADMIN_USER || "admin@maelittleloops.com";

async function requireAdminClient(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const accessToken = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7)
    : "";

  if (!accessToken) {
    return { error: "Missing access token.", client: null as null | ReturnType<typeof createSupabaseUserClient> };
  }

  const client = createSupabaseUserClient(accessToken);
  const {
    data: { user },
    error,
  } = await client.auth.getUser();

  if (error || !user) {
    console.error("Products API auth error:", error);
    return { error: "Unable to verify admin session.", client: null };
  }

  if (user.email !== ADMIN_EMAIL) {
    console.error("Products API blocked for email:", user.email);
    return { error: "Only the admin can manage products.", client: null };
  }

  return { error: null, client };
}

export async function GET() {
  const client = createSupabaseUserClient();
  const { data, error } = await client.from("products").select("*").order("id");

  if (error) {
    console.error("GET /api/products failed:", error);
    return NextResponse.json(
      { error: "Failed to load products.", details: error.message },
      { status: 500 },
    );
  }

  return NextResponse.json({ products: data ?? [] });
}

export async function POST(request: NextRequest) {
  try {
    const access = await requireAdminClient(request);
    if (!access.client) {
      return NextResponse.json({ error: access.error }, { status: 401 });
    }

    const body = await request.json();
    console.log("POST /api/products payload:", body);

    const { data: payload, errors } = validateAndNormalizeProductInput(body);
    if (!payload) {
      console.error("POST /api/products validation failed:", errors);
      return NextResponse.json(
        { error: "Validation failed.", details: errors },
        { status: 400 },
      );
    }

    const { data, error } = await access.client
      .from("products")
      .insert([payload])
      .select("*")
      .single();

    if (error) {
      console.error("POST /api/products insert failed:", error);
      return NextResponse.json(
        {
          error: "Failed to create product.",
          details: error.message,
          hint: error.hint,
        },
        { status: 500 },
      );
    }

    console.log("POST /api/products success:", data);
    return NextResponse.json({ product: data }, { status: 201 });
  } catch (error) {
    console.error("POST /api/products unexpected error:", error);
    return NextResponse.json(
      { error: "Unexpected server error while creating product." },
      { status: 500 },
    );
  }
}
