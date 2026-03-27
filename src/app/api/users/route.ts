import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { isValidUsername } from "@/lib/constants";

/** GET /api/users?username=xxx — busca un usuario por username */
export async function GET(req: NextRequest) {
  const username = req.nextUrl.searchParams.get("username");

  if (!username || !isValidUsername(username)) {
    return NextResponse.json({ error: "Username inválido" }, { status: 400 });
  }

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("username", username)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ user: data });
}

/** POST /api/users — crea un usuario nuevo */
export async function POST(req: NextRequest) {
  const { username } = await req.json();

  if (!username || !isValidUsername(username)) {
    return NextResponse.json(
      { error: "Username inválido. Solo letras, números y guiones bajos (3-30 caracteres)." },
      { status: 400 }
    );
  }

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("users")
    .insert({ username })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ error: "El username ya existe" }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ user: data }, { status: 201 });
}
