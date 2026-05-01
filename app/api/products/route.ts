import { NextRequest, NextResponse } from "next/server";
import {
  createSupabaseAdminClient,
  createSupabaseUserClient,
  hasServiceRoleKey,
} from "../../../lib/server-supabase";
import { validateAndNormalizeProductInput } from "../../../lib/product-validation";

const ADMIN_EMAIL =
  process.env.ADMIN_USER || "admin@maelittleloops.com";

async function requireAdminAccess(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const accessToken = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7)
    : "";

  if (!accessToken) {
    return {
      error: NextResponse.json(
        { error: "Missing access token." },
        { status: 401 },
      ),
      dbClient: null,
    };
  }

  const userClient = createSupabaseUserClient(accessToken);
  const {
    data: { user },
    error: userError,
  } = await userClient.auth.getUser();

  if (userError || !user) {
    console.error("Products API auth error:", userError);
    return {
      error: NextResponse.json(
        { error: "Unable to verify admin session." },
        { status: 401 },
      ),
      dbClient: null,
    };
  }

  if (user.email !== ADMIN_EMAIL) {
    console.error("Products API forbidden for email:", user.email);
    return {
      error: NextResponse.json(
        { error: "Only the admin can manage products." },
        { status: 403 },
      ),
      dbClient: null,
    };
  }

  return {
    error: null,
    dbClient: hasServiceRoleKey()
      ? createSupabaseAdminClient()
      : userClient,
  };
}

export async function GET() {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("id");

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
    const access = await requireAdminAccess(request);
    if (access.error || !access.dbClient) return access.error;

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

    const { data, error } = await access.dbClient
      .from("products")
      .insert([payload])
      .select("*")
      .single();

    if (error) {
      console.error("POST /api/products insert failed:", {
        payload,
        error,
      });
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
