import { NextRequest, NextResponse } from "next/server";
import { createServerClient, createAdminClient } from "@/lib/supabase/server";

function isAdminRequest(req: NextRequest) {
  return req.headers.get("x-admin-auth") === process.env.ADMIN_PASSWORD;
}

/** GET /api/products — lista todos los productos activos (con categoría) */
export async function GET(req: NextRequest) {
  const includeInactive = req.nextUrl.searchParams.get("all") === "true";
  const supabase = includeInactive ? createAdminClient() : createServerClient();

  let query = supabase
    .from("products")
    .select("*, categories(name, display_order)")
    .order("name");

  if (!includeInactive) {
    query = query.eq("is_active", true);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ products: data });
}

/** POST /api/products — crea un producto (solo admin) */
export async function POST(req: NextRequest) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await req.json();
  const { name, description, price, emoji, category_id } = body;

  if (!name || !price || !category_id) {
    return NextResponse.json({ error: "name, price y category_id son requeridos" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("products")
    .insert({ name, description: description ?? "", price, emoji: emoji ?? "🍽️", category_id })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ product: data }, { status: 201 });
}

/** PUT /api/products — actualiza un producto (solo admin) */
export async function PUT(req: NextRequest) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await req.json();
  const { id, ...updates } = body;

  if (!id) {
    return NextResponse.json({ error: "id requerido" }, { status: 400 });
  }

  // No permitir actualizar created_at
  delete updates.created_at;

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("products")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ product: data });
}

/** DELETE /api/products?id=xxx — soft delete (is_active = false) (solo admin) */
export async function DELETE(req: NextRequest) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const id = req.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id requerido" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("products")
    .update({ is_active: false })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
