import { NextRequest, NextResponse } from "next/server";
import { createServerClient, createAdminClient } from "@/lib/supabase/server";

function isAdminRequest(req: NextRequest) {
  return req.headers.get("x-admin-auth") === process.env.ADMIN_PASSWORD;
}

/** GET /api/categories — lista todas las categorías ordenadas */
export async function GET() {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("display_order");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ categories: data });
}

/** POST /api/categories — crea una categoría (solo admin) */
export async function POST(req: NextRequest) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { name, display_order } = await req.json();

  if (!name) {
    return NextResponse.json({ error: "name es requerido" }, { status: 400 });
  }

  const supabase = createAdminClient();

  // Obtener el mayor display_order actual si no se especifica
  let order = display_order;
  if (order === undefined) {
    const { data: last } = await supabase
      .from("categories")
      .select("display_order")
      .order("display_order", { ascending: false })
      .limit(1)
      .maybeSingle();
    order = (last?.display_order ?? 0) + 1;
  }

  const { data, error } = await supabase
    .from("categories")
    .insert({ name, display_order: order })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ category: data }, { status: 201 });
}

/** PUT /api/categories — actualiza nombre o display_order (solo admin) */
export async function PUT(req: NextRequest) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id, name, display_order } = await req.json();

  if (!id) {
    return NextResponse.json({ error: "id requerido" }, { status: 400 });
  }

  const updates: Record<string, unknown> = {};
  if (name !== undefined) updates.name = name;
  if (display_order !== undefined) updates.display_order = display_order;

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("categories")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ category: data });
}

/** DELETE /api/categories?id=xxx — elimina categoría si no tiene productos (solo admin) */
export async function DELETE(req: NextRequest) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const id = req.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id requerido" }, { status: 400 });
  }

  const supabase = createAdminClient();

  // Verificar que no tenga productos activos
  const { count } = await supabase
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("category_id", id)
    .eq("is_active", true);

  if (count && count > 0) {
    return NextResponse.json(
      { error: "No se puede eliminar una categoría con productos activos" },
      { status: 409 }
    );
  }

  const { error } = await supabase.from("categories").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
