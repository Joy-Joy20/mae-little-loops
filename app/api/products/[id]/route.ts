import { NextRequest, NextResponse } from "next/server";
import { createSupabaseUserClient } from "../../../../lib/server-supabase";
import { validateAndNormalizeProductInput } from "../../../../lib/product-validation";

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

function parseProductId(rawId: string) {
  const id = Number(rawId);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const access = await requireAdminClient(request);
    if (!access.client) {
      return NextResponse.json({ error: access.error }, { status: 401 });
    }

    const { id: rawId } = await params;
    const productId = parseProductId(rawId);
    if (!productId) {
      return NextResponse.json({ error: "Invalid product id." }, { status: 400 });
    }

    const body = await request.json();
    console.log(`PUT /api/products/${productId} payload:`, body);

    const { data: payload, errors } = validateAndNormalizeProductInput(body);
    if (!payload) {
      console.error(`PUT /api/products/${productId} validation failed:`, errors);
      return NextResponse.json(
        { error: "Validation failed.", details: errors },
        { status: 400 },
      );
    }

    const { data, error } = await access.client
      .from("products")
      .update(payload)
      .eq("id", productId)
      .select("*")
      .single();

    if (error) {
      console.error(`PUT /api/products/${productId} failed:`, error);
      return NextResponse.json(
        { error: "Failed to update product.", details: error.message, hint: error.hint },
        { status: 500 },
      );
    }

    return NextResponse.json({ product: data });
  } catch (error) {
    console.error("PUT /api/products unexpected error:", error);
    return NextResponse.json(
      { error: "Unexpected server error while updating product." },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const access = await requireAdminClient(request);
    if (!access.client) {
      return NextResponse.json({ error: access.error }, { status: 401 });
    }

    const { id: rawId } = await params;
    const productId = parseProductId(rawId);
    if (!productId) {
      return NextResponse.json({ error: "Invalid product id." }, { status: 400 });
    }

    const { error } = await access.client.from("products").delete().eq("id", productId);
    if (error) {
      console.error(`DELETE /api/products/${productId} failed:`, error);
      return NextResponse.json(
        { error: "Failed to delete product.", details: error.message, hint: error.hint },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/products unexpected error:", error);
    return NextResponse.json(
      { error: "Unexpected server error while deleting product." },
      { status: 500 },
    );
  }
}
