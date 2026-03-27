"use client";

import { useState, useMemo } from "react";
import { Search, Download, ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatCOP } from "@/lib/constants";
import type { OrderWithDetails, OrderItemWithProduct } from "@/types";

interface OrdersTableProps {
  orders: OrderWithDetails[];
  newOrderIds?: Set<string>;
}

type SortKey = "username" | "total";
type SortDir = "asc" | "desc";

// ── Helpers para extraer ítems por categoría ──

function getCatName(item: OrderItemWithProduct): string {
  return (item.products.categories as { name: string } | null)?.name ?? "";
}

function getDrinkItem(order: OrderWithDetails): OrderItemWithProduct | null {
  return (
    order.order_items.find(
      (i) => getCatName(i) === "Bebidas Calientes" || getCatName(i) === "Bebidas Frías"
    ) ?? null
  );
}

function getMainItem(order: OrderWithDetails): OrderItemWithProduct | null {
  return (
    order.order_items.find(
      (i) => getCatName(i) === "Platos Principales" && i.products.name !== "Ingrediente adicional"
    ) ?? null
  );
}

function getAddonItem(order: OrderWithDetails): OrderItemWithProduct | null {
  return (
    order.order_items.find(
      (i) => getCatName(i) === "Platos Principales" && i.products.name === "Ingrediente adicional"
    ) ?? null
  );
}

function getBakeryItem(order: OrderWithDetails): OrderItemWithProduct | null {
  return order.order_items.find((i) => getCatName(i) === "Panadería") ?? null;
}

function getOrderTotal(order: OrderWithDetails): number {
  return order.order_items.reduce((acc, item) => acc + item.products.price * item.quantity, 0);
}

export function OrdersTable({ orders, newOrderIds }: OrdersTableProps) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("username");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return orders.filter((o) =>
      q ? o.users.username.toLowerCase().includes(q) : true
    );
  }, [orders, search]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let cmp = 0;
      if (sortKey === "username") {
        cmp = a.users.username.localeCompare(b.users.username);
      } else if (sortKey === "total") {
        cmp = getOrderTotal(a) - getOrderTotal(b);
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [filtered, sortKey, sortDir]);

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  function SortIcon({ col }: { col: SortKey }) {
    if (sortKey !== col)
      return <ChevronsUpDown className="ml-1 inline h-3.5 w-3.5 text-muted-foreground/50" />;
    return sortDir === "asc" ? (
      <ChevronUp className="ml-1 inline h-3.5 w-3.5 text-primary" />
    ) : (
      <ChevronDown className="ml-1 inline h-3.5 w-3.5 text-primary" />
    );
  }

  function exportCSV() {
    const rows = [
      ["Usuario", "Bebida", "Plato Principal", "Ingrediente Adicional", "Panadería", "Total"],
    ];
    orders.forEach((order) => {
      const drink = getDrinkItem(order);
      const main = getMainItem(order);
      const addon = getAddonItem(order);
      const bakery = getBakeryItem(order);
      rows.push([
        order.users.username,
        drink ? `${drink.products.emoji} ${drink.products.name}` : "—",
        main ? `${main.products.emoji} ${main.products.name}` : "—",
        addon ? "Sí" : "No",
        bakery ? `${bakery.products.emoji} ${bakery.products.name}` : "—",
        getOrderTotal(order).toString(),
      ]);
    });
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `florida-pedidos-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const grandTotal = orders.reduce((acc, o) => acc + getOrderTotal(o), 0);

  function ProductCell({ item, extra }: { item: OrderItemWithProduct | null; extra?: string }) {
    if (!item) return <span className="text-muted-foreground/40">—</span>;
    return (
      <span className="flex items-start gap-1.5 text-xs text-foreground">
        <span className="mt-px shrink-0 text-sm">{item.products.emoji}</span>
        <span>
          {item.products.name}
          {extra && <span className="block text-muted-foreground">{extra}</span>}
        </span>
      </span>
    );
  }

  return (
    <div className="space-y-4">
      {/* Barra de herramientas */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-xs flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar usuario..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 border-border bg-input pl-9 text-foreground placeholder:text-muted-foreground/50"
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={exportCSV}
          className="h-9 cursor-pointer gap-2 border-border bg-secondary text-foreground hover:bg-secondary/80"
        >
          <Download className="h-4 w-4" />
          Exportar CSV
        </Button>
      </div>

      {/* Tabla */}
      <div className="overflow-hidden rounded-xl border border-border">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th
                  className="cursor-pointer px-4 py-3 text-left font-medium text-muted-foreground hover:text-foreground"
                  onClick={() => handleSort("username")}
                >
                  Usuario <SortIcon col="username" />
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Bebida
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Plato Principal
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Panadería
                </th>
                <th
                  className="cursor-pointer px-4 py-3 text-right font-medium text-muted-foreground hover:text-foreground"
                  onClick={() => handleSort("total")}
                >
                  Total <SortIcon col="total" />
                </th>
              </tr>
            </thead>
            <tbody>
              {sorted.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
                    {search ? "No se encontraron usuarios." : "Aún no hay pedidos."}
                  </td>
                </tr>
              ) : (
                sorted.map((order, idx) => {
                  const isNew = newOrderIds?.has(order.id);
                  const drink = getDrinkItem(order);
                  const main = getMainItem(order);
                  const addon = getAddonItem(order);
                  const bakery = getBakeryItem(order);
                  return (
                    <tr
                      key={order.id}
                      className={`border-b border-border transition-colors hover:bg-secondary/30 ${
                        isNew
                          ? "animate-pulse bg-primary/5"
                          : idx % 2 === 0
                          ? ""
                          : "bg-secondary/10"
                      }`}
                    >
                      {/* Username */}
                      <td className="px-4 py-3 font-semibold text-foreground">
                        <span className="flex items-center gap-2">
                          {order.users.username}
                          {isNew && (
                            <span className="inline-flex items-center rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground">
                              NUEVO
                            </span>
                          )}
                        </span>
                      </td>

                      {/* Bebida */}
                      <td className="px-4 py-3">
                        <ProductCell item={drink} />
                      </td>

                      {/* Plato Principal */}
                      <td className="px-4 py-3">
                        <ProductCell
                          item={main}
                          extra={addon ? `+ ${addon.products.name}` : undefined}
                        />
                      </td>

                      {/* Panadería */}
                      <td className="px-4 py-3">
                        <ProductCell item={bakery} />
                      </td>

                      {/* Total */}
                      <td className="px-4 py-3 text-right font-bold text-primary tabular-nums">
                        {formatCOP(getOrderTotal(order))}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>

            {/* Fila de totales */}
            {sorted.length > 0 && (
              <tfoot>
                <tr className="border-t-2 border-border bg-secondary/30">
                  <td className="px-4 py-3 font-bold text-foreground" colSpan={4}>
                    TOTAL ({sorted.length} {sorted.length === 1 ? "usuario" : "usuarios"})
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-primary tabular-nums">
                    {formatCOP(grandTotal)}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}
