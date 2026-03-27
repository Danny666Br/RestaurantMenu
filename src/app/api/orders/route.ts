import { NextRequest, NextResponse } from "next/server";
import { createServerClient, createAdminClient } from "@/lib/supabase/server";
import type { CartItem } from "@/types";

function isAdminRequest(req: NextRequest) {
  return req.headers.get("x-admin-auth") === process.env.ADMIN_PASSWORD;
}

/**
 * GET /api/orders — devuelve todos los pedidos con detalles (solo admin)
 * GET /api/orders?userId=xxx — devuelve el pedido de un usuario
 */
export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId");

  if (userId) {
    // Pedido de un usuario específico — acceso público
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from("orders")
      .select(`
        *,
        order_items (
          *,
          products ( name, price, emoji, category_id, categories ( name ) )
        )
      `)
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ order: data });
  }

  // Todos los pedidos — solo admin
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("orders")
    .select(`
      *,
      users ( username ),
      order_items (
        *,
        products ( name, price, emoji, category_id, categories ( name ) )
      )
    `)
    .order("updated_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ orders: data });
}

// Nombres especiales (deben coincidir con el seed)
const ADDON_NAME = "Ingrediente adicional";
const MAIN_ALLOWS_ADDON = ["Combinados", "Omelet de huevos o claras"];

/**
 * POST /api/orders — crea o reemplaza el pedido de un usuario
 * Body: { userId: string, items: CartItem[] }
 */
export async function POST(req: NextRequest) {
  const { userId, items } = (await req.json()) as {
    userId: string;
    items: CartItem[];
  };

  if (!userId || !items || !Array.isArray(items)) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  if (items.length === 0) {
    return NextResponse.json({ error: "El pedido no puede estar vacío" }, { status: 400 });
  }

  const supabase = createServerClient();

  // ── Validación de reglas de negocio ──
  const productIds = items.map((i) => i.productId);
  const { data: productDetails, error: productsError } = await supabase
    .from("products")
    .select("id, name, category_id, categories ( name )")
    .in("id", productIds);

  if (productsError) {
    return NextResponse.json({ error: productsError.message }, { status: 500 });
  }

  let hotDrinks = 0;
  let coldDrinks = 0;
  let mains = 0;
  let addons = 0;
  let mainAllowsAddon = false;
  let bakeries = 0;

  for (const p of productDetails ?? []) {
    const catName = (p.categories as { name: string } | null)?.name ?? "";

    if (catName === "Bebidas Calientes") {
      hotDrinks++;
    } else if (catName === "Bebidas Frías") {
      coldDrinks++;
    } else if (catName === "Platos Principales") {
      if (p.name === ADDON_NAME) {
        addons++;
      } else {
        mains++;
        if (MAIN_ALLOWS_ADDON.includes(p.name)) mainAllowsAddon = true;
      }
    } else if (catName === "Panadería") {
      bakeries++;
    }
  }

  if (hotDrinks > 1) {
    return NextResponse.json({ error: "Solo puedes elegir 1 bebida caliente." }, { status: 400 });
  }
  if (coldDrinks > 1) {
    return NextResponse.json({ error: "Solo puedes elegir 1 bebida fría." }, { status: 400 });
  }
  if (hotDrinks > 0 && coldDrinks > 0) {
    return NextResponse.json(
      { error: "No puedes pedir bebida caliente y bebida fría al mismo tiempo." },
      { status: 400 }
    );
  }
  if (mains > 1) {
    return NextResponse.json({ error: "Solo puedes elegir 1 plato principal." }, { status: 400 });
  }
  if (addons > 0 && !mainAllowsAddon) {
    return NextResponse.json(
      { error: "El ingrediente adicional solo aplica para Combinados u Omelet." },
      { status: 400 }
    );
  }
  if (bakeries > 1) {
    return NextResponse.json({ error: "Solo puedes elegir 1 producto de panadería." }, { status: 400 });
  }

  // ── Buscar si ya existe un pedido para este usuario ──
  const { data: existing } = await supabase
    .from("orders")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  let orderId: string;

  if (existing) {
    orderId = existing.id;

    const { error: deleteError } = await supabase
      .from("order_items")
      .delete()
      .eq("order_id", orderId);

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    const { error: updateError } = await supabase
      .from("orders")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", orderId);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }
  } else {
    const { data: newOrder, error: createError } = await supabase
      .from("orders")
      .insert({ user_id: userId })
      .select("id")
      .single();

    if (createError) {
      return NextResponse.json({ error: createError.message }, { status: 500 });
    }
    orderId = newOrder.id;
  }

  // ── Insertar ítems ──
  const orderItems = items.map((item) => ({
    order_id: orderId,
    product_id: item.productId,
    quantity: item.quantity,
  }));

  const { error: itemsError } = await supabase.from("order_items").insert(orderItems);

  if (itemsError) {
    return NextResponse.json({ error: itemsError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, orderId });
}
