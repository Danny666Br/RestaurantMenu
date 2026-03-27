"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { UtensilsCrossed, MapPin, Calendar, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { isValidUsername, USERNAME_STORAGE_KEY, USERID_STORAGE_KEY } from "@/lib/constants";

export default function HomePage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem(USERNAME_STORAGE_KEY);
    if (saved) {
      router.replace("/menu");
    } else {
      setChecking(false);
    }
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const trimmed = username.trim();
    if (!trimmed) {
      setError("Ingresa un nombre de usuario.");
      return;
    }
    if (!isValidUsername(trimmed)) {
      setError("Solo letras, números y guiones bajos. Mínimo 3 caracteres.");
      return;
    }

    setLoading(true);
    try {
      const searchRes = await fetch(`/api/users?username=${encodeURIComponent(trimmed)}`);
      const searchData = await searchRes.json();

      let userId: string;

      if (searchData.user) {
        userId = searchData.user.id;
      } else {
        const createRes = await fetch("/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: trimmed }),
        });
        const createData = await createRes.json();
        if (!createRes.ok) {
          setError(createData.error ?? "Error al crear el usuario.");
          return;
        }
        userId = createData.user.id;
      }

      localStorage.setItem(USERNAME_STORAGE_KEY, trimmed);
      localStorage.setItem(USERID_STORAGE_KEY, userId);
      router.push("/menu");
    } catch {
      setError("Error de conexión. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0b1326]">
        <Loader2 className="h-8 w-8 animate-spin text-[#f59e0b]" />
      </div>
    );
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0b1326] p-6">
      {/* Decorative amber orbs */}
      <div
        className="pointer-events-none absolute -left-[10%] -top-[10%] h-[500px] w-[500px] rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle at center, rgba(245,158,11,0.08) 0%, transparent 70%)",
        }}
      />
      <div
        className="pointer-events-none absolute -bottom-[20%] -right-[10%] h-[600px] w-[600px] rounded-full opacity-50 blur-3xl"
        style={{
          background:
            "radial-gradient(circle at center, rgba(245,158,11,0.08) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 w-full max-w-md">
        <div
          className="overflow-hidden rounded-2xl"
          style={{
            backgroundColor: "#131b2e",
            boxShadow: "0 20px 60px rgba(245, 158, 11, 0.07)",
          }}
        >
          {/* ── Hero header con patrón decorativo ── */}
          <div
            className="relative flex h-44 items-center justify-center"
            style={{
              background:
                "linear-gradient(135deg, #171f33 0%, #0f1729 50%, #131b2e 100%)",
            }}
          >
            {/* Líneas decorativas sutiles */}
            <div
              className="absolute inset-0 opacity-[0.04]"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(45deg, #f59e0b 0px, #f59e0b 1px, transparent 1px, transparent 40px)",
              }}
            />
            {/* Badge flotante — se superpone al borde inferior */}
            <div className="absolute bottom-0 left-1/2 z-10 -translate-x-1/2 translate-y-1/2">
              <div
                className="flex h-20 w-20 items-center justify-center rounded-full border-[5px]"
                style={{
                  backgroundColor: "#f59e0b",
                  borderColor: "#131b2e",
                  boxShadow: "0 8px 32px rgba(245,158,11,0.35)",
                }}
              >
                <UtensilsCrossed className="h-9 w-9" style={{ color: "#472a00" }} />
              </div>
            </div>
          </div>

          {/* ── Contenido del card ── */}
          <div className="px-8 pb-12 pt-16 text-center">
            {/* Nombre del restaurante */}
            <h1
              className="mb-1 text-3xl font-bold tracking-tight"
              style={{
                fontFamily: "var(--font-playfair)",
                color: "#dae2fd",
                letterSpacing: "-0.02em",
              }}
            >
              Pastelería Florida
            </h1>
            <p
              className="mb-8 text-sm italic tracking-wide"
              style={{ fontFamily: "var(--font-playfair)", color: "#d8c3ad" }}
            >
              Tradición Bogotana
            </p>

            {/* Detalles del evento */}
            <div className="mb-10 flex flex-col items-center gap-3">
              <div className="flex items-center gap-2.5" style={{ color: "#d8c3ad" }}>
                <MapPin className="h-4 w-4 shrink-0" style={{ color: "#ffc174" }} />
                <span className="text-sm font-medium tracking-tight">
                  Carrera 7 # 21-46, Bogotá, Colombia
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <Calendar className="h-4 w-4 shrink-0" style={{ color: "#ffc174" }} />
                <span
                  className="text-sm font-semibold tracking-tight"
                  style={{ color: "#ffc174" }}
                >
                  Jueves 09 de Abril, 2026 — 8:00 AM
                </span>
              </div>
            </div>

            {/* Separador degradado */}
            <div
              className="mb-10 h-px w-full"
              style={{
                background:
                  "linear-gradient(to right, transparent, rgba(83,68,52,0.5), transparent)",
              }}
            />

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="space-y-5 text-left">
              <div className="space-y-3">
                <label
                  htmlFor="username"
                  className="ml-1 block text-[10px] font-bold uppercase"
                  style={{ letterSpacing: "0.15em", color: "#d8c3ad" }}
                >
                  ¿Cómo te llamas?
                </label>
                <Input
                  id="username"
                  type="text"
                  placeholder="ej: maria_garcia"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setError("");
                  }}
                  disabled={loading}
                  autoComplete="off"
                  autoFocus
                  className="h-14 rounded-lg border-0 px-5 text-base transition-all duration-300 focus-visible:ring-1"
                  style={{
                    backgroundColor: "#060e20",
                    color: "#dae2fd",
                    // @ts-expect-error CSS custom property
                    "--tw-ring-color": "rgba(245,158,11,0.4)",
                  }}
                />
                {error && (
                  <p className="ml-1 text-sm text-red-400">{error}</p>
                )}
                <p
                  className="ml-1 text-xs"
                  style={{ color: "rgba(216,195,173,0.5)" }}
                >
                  Si ya pediste antes, verás tu selección anterior.
                </p>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="h-14 w-full cursor-pointer rounded-lg border-0 font-bold shadow-lg transition-all duration-200 active:scale-[0.98]"
                style={{
                  background: "linear-gradient(135deg, #ffc174 0%, #f59e0b 100%)",
                  color: "#472a00",
                  boxShadow: loading
                    ? "none"
                    : "0 4px 20px rgba(245,158,11,0.25)",
                }}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  <>
                    Ver el menú
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
            </form>

            {/* Footer */}
            <footer className="mt-12">
              <p
                className="text-[10px] font-bold uppercase"
                style={{
                  letterSpacing: "0.2em",
                  color: "rgba(216,195,173,0.35)",
                }}
              >
                Sin contraseña · Solo tu nombre
              </p>
            </footer>
          </div>
        </div>
      </div>
    </main>
  );
}
