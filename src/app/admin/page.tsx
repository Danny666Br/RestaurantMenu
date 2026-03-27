"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Coffee, Lock, Loader2, Wifi, WifiOff, UtensilsCrossed, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { StatsCards } from "@/components/admin/StatsCards";
import { OrdersTable } from "@/components/admin/OrdersTable";
import { createBrowserClient } from "@/lib/supabase/client";
import { ADMIN_AUTH_STORAGE_KEY } from "@/lib/constants";
import type { OrderWithDetails, AdminStats } from "@/types";

// ─────────────────────────────────────────────
// Login
// ─────────────────────────────────────────────
function AdminLogin({ onSuccess }: { onSuccess: (password: string) => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        setError("Contraseña incorrecta.");
        return;
      }
      sessionStorage.setItem(ADMIN_AUTH_STORAGE_KEY, password);
      onSuccess(password);
    } catch {
      setError("Error de conexión.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/20">
            <Lock className="h-8 w-8 text-primary" />
          </div>
          <h1
            className="text-2xl font-bold text-foreground"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            Panel Admin
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">Pastelería Florida</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-7">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="adminpwd" className="text-sm text-foreground">Contraseña</Label>
              <Input
                id="adminpwd"
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(""); }}
                placeholder="••••••••"
                autoFocus
                disabled={loading}
                className="h-11 border-border bg-input text-foreground"
              />
              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="h-11 w-full cursor-pointer bg-primary font-semibold text-primary-foreground hover:bg-primary/90"
            >
              {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Verificando...</> : "Entrar"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Dashboard
// ─────────────────────────────────────────────
function computeStats(orders: OrderWithDetails[]): AdminStats {
  const totalUsers = orders.length;
  let totalItems = 0;
  let totalRevenue = 0;
  const productCount: Record<string, { name: string; qty: number }> = {};

  orders.forEach((order) => {
    order.order_items.forEach((item) => {
      totalItems += item.quantity;
      totalRevenue += item.products.price * item.quantity;
      const pid = item.product_id;
      if (!productCount[pid]) {
        productCount[pid] = { name: item.products.name, qty: 0 };
      }
      productCount[pid].qty += item.quantity;
    });
  });

  const mostPopularProduct = Object.values(productCount).sort((a, b) => b.qty - a.qty)[0]?.name ?? "—";
  return { totalUsers, totalItems, totalRevenue, mostPopularProduct };
}

function AdminDashboard({ adminPassword }: { adminPassword: string }) {
  const [orders, setOrders] = useState<OrderWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [realtimeConnected, setRealtimeConnected] = useState(false);
  // IDs de pedidos recibidos recientemente — para destacar la fila
  const [newOrderIds, setNewOrderIds] = useState<Set<string>>(new Set());

  const fetchOrders = useCallback(async (): Promise<OrderWithDetails[]> => {
    try {
      const res = await fetch("/api/orders", {
        headers: { "x-admin-auth": adminPassword },
      });
      const data = await res.json();
      const fetched: OrderWithDetails[] = data.orders ?? [];
      setOrders(fetched);
      return fetched;
    } catch {
      toast.error("Error al cargar los pedidos.");
      return [];
    } finally {
      setLoading(false);
    }
  }, [adminPassword]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Supabase Realtime — captura order_id del payload para destacar la fila
  useEffect(() => {
    const supabase = createBrowserClient();
    const channel = supabase
      .channel("admin-orders")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "order_items" },
        async (payload) => {
          const orderId = (payload.new as { order_id: string }).order_id;
          // Refetch y buscar el username del pedido recibido
          const freshOrders = await fetchOrders();
          const matched = freshOrders.find((o) => o.id === orderId);
          const username = matched?.users?.username ?? "un usuario";

          toast.info(`Pedido de ${username}`, {
            description: "El menú se actualizó automáticamente.",
          });

          // Destacar la fila durante 6 segundos
          setNewOrderIds((prev) => new Set([...prev, orderId]));
          setTimeout(() => {
            setNewOrderIds((prev) => {
              const next = new Set(prev);
              next.delete(orderId);
              return next;
            });
          }, 6000);
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "order_items" },
        () => { fetchOrders(); }
      )
      .subscribe((status) => {
        setRealtimeConnected(status === "SUBSCRIBED");
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchOrders]);

  const stats = computeStats(orders);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Coffee className="h-5 w-5 text-primary" />
            <span
              className="text-lg font-bold text-foreground"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              Pastelería Florida
            </span>
            <Separator orientation="vertical" className="h-5 bg-border" />
            <span className="text-sm text-muted-foreground">Admin</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Indicador Realtime */}
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              {realtimeConnected ? (
                <><Wifi className="h-3.5 w-3.5 text-emerald-400" /><span className="hidden sm:inline text-emerald-400">En vivo</span></>
              ) : (
                <><WifiOff className="h-3.5 w-3.5" /><span className="hidden sm:inline">Desconectado</span></>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchOrders}
              className="cursor-pointer gap-1.5 text-muted-foreground hover:text-foreground"
            >
              <RefreshCw className="h-4 w-4" />
              <span className="hidden sm:inline">Actualizar</span>
            </Button>
            <Link href="/admin/menu">
              <Button
                variant="outline"
                size="sm"
                className="cursor-pointer gap-1.5 border-border bg-secondary text-foreground hover:bg-secondary/80"
              >
                <UtensilsCrossed className="h-4 w-4" />
                <span className="hidden sm:inline">Gestión de menú</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-8 px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Stats */}
            <section>
              <h2
                className="mb-4 text-xl font-bold text-foreground"
                style={{ fontFamily: "var(--font-playfair)" }}
              >
                Resumen del día
              </h2>
              <StatsCards stats={stats} />
            </section>

            {/* Tabla de pedidos */}
            <section>
              <h2
                className="mb-4 text-xl font-bold text-foreground"
                style={{ fontFamily: "var(--font-playfair)" }}
              >
                Pedidos de usuarios
              </h2>
              <OrdersTable orders={orders} newOrderIds={newOrderIds} />
            </section>
          </>
        )}
      </main>
    </div>
  );
}

// ─────────────────────────────────────────────
// Page: coordina login/dashboard
// ─────────────────────────────────────────────
export default function AdminPage() {
  const [adminPassword, setAdminPassword] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const saved = sessionStorage.getItem(ADMIN_AUTH_STORAGE_KEY);
    setAdminPassword(saved);
    setChecking(false);
  }, []);

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!adminPassword) {
    return <AdminLogin onSuccess={setAdminPassword} />;
  }

  return <AdminDashboard adminPassword={adminPassword} />;
}
