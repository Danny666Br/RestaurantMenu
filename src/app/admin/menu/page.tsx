"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Coffee, ArrowLeft, Plus, Pencil, Loader2, ToggleLeft, ToggleRight } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ProductForm } from "@/components/admin/ProductForm";
import { CategoryManager } from "@/components/admin/CategoryManager";
import { ADMIN_AUTH_STORAGE_KEY } from "@/lib/constants";
import { formatCOP } from "@/lib/constants";
import type { Product, Category } from "@/types";

export default function AdminMenuPage() {
  const router = useRouter();
  const [adminPassword, setAdminPassword] = useState("");
  const [loading, setLoading] = useState(true);

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [formOpen, setFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);
  const [toggling, setToggling] = useState<string | null>(null);

  useEffect(() => {
    const saved = sessionStorage.getItem(ADMIN_AUTH_STORAGE_KEY);
    if (!saved) {
      router.replace("/admin");
      return;
    }
    setAdminPassword(saved);
  }, [router]);

  const fetchData = useCallback(async () => {
    if (!adminPassword) return;
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        fetch("/api/products?all=true", { headers: { "x-admin-auth": adminPassword } }),
        fetch("/api/categories"),
      ]);
      const prodData = await prodRes.json();
      const catData = await catRes.json();
      setProducts(prodData.products ?? []);
      setCategories(catData.categories ?? []);
    } catch {
      toast.error("Error al cargar datos.");
    } finally {
      setLoading(false);
    }
  }, [adminPassword]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function toggleActive(product: Product) {
    setToggling(product.id);
    try {
      const res = await fetch("/api/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json", "x-admin-auth": adminPassword },
        body: JSON.stringify({ id: product.id, is_active: !product.is_active }),
      });
      if (!res.ok) throw new Error();
      toast.success(product.is_active ? "Producto desactivado." : "Producto activado.");
      fetchData();
    } catch {
      toast.error("Error al cambiar estado.");
    } finally {
      setToggling(null);
    }
  }

  function openCreate() {
    setEditingProduct(undefined);
    setFormOpen(true);
  }

  function openEdit(product: Product) {
    setEditingProduct(product);
    setFormOpen(true);
  }

  const categoryMap = Object.fromEntries(categories.map((c) => [c.id, c.name]));
  const activeProducts = products.filter((p) => p.is_active);
  const inactiveProducts = products.filter((p) => !p.is_active);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Coffee className="h-5 w-5 text-primary" />
            <span
              className="text-lg font-bold text-foreground"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              BreakfastHub
            </span>
            <Separator orientation="vertical" className="h-5 bg-border" />
            <span className="text-sm text-muted-foreground">Gestión de menú</span>
          </div>

          <Link href="/admin">
            <Button
              variant="ghost"
              size="sm"
              className="cursor-pointer gap-1.5 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Volver al dashboard</span>
            </Button>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <Tabs defaultValue="products">
            <div className="flex items-center justify-between gap-4 mb-6">
              <TabsList className="bg-secondary">
                <TabsTrigger
                  value="products"
                  className="cursor-pointer data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  Productos
                  <Badge variant="outline" className="ml-2 border-border text-xs">
                    {products.length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger
                  value="categories"
                  className="cursor-pointer data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  Categorías
                  <Badge variant="outline" className="ml-2 border-border text-xs">
                    {categories.length}
                  </Badge>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="products" className="mt-0">
                <Button
                  onClick={openCreate}
                  className="cursor-pointer gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Plus className="h-4 w-4" />
                  Nuevo producto
                </Button>
              </TabsContent>
            </div>

            {/* ── Productos ── */}
            <TabsContent value="products" className="space-y-6 outline-none">
              {/* Activos */}
              <div>
                <h3 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  Disponibles ({activeProducts.length})
                </h3>
                <ProductList
                  products={activeProducts}
                  categoryMap={categoryMap}
                  toggling={toggling}
                  onToggle={toggleActive}
                  onEdit={openEdit}
                />
              </div>

              {/* Inactivos */}
              {inactiveProducts.length > 0 && (
                <div>
                  <h3 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    Desactivados ({inactiveProducts.length})
                  </h3>
                  <ProductList
                    products={inactiveProducts}
                    categoryMap={categoryMap}
                    toggling={toggling}
                    onToggle={toggleActive}
                    onEdit={openEdit}
                    dimmed
                  />
                </div>
              )}
            </TabsContent>

            {/* ── Categorías ── */}
            <TabsContent value="categories" className="outline-none">
              <CategoryManager
                categories={categories}
                onChanged={fetchData}
                adminPassword={adminPassword}
              />
            </TabsContent>
          </Tabs>
        )}
      </main>

      {/* Modal de producto */}
      <ProductForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSaved={() => {
          fetchData();
          toast.success(editingProduct ? "Producto actualizado." : "Producto creado.");
        }}
        product={editingProduct}
        categories={categories}
        adminPassword={adminPassword}
      />
    </div>
  );
}

// ─────────────────────────────────────────────
// Lista de productos (reutilizable)
// ─────────────────────────────────────────────
function ProductList({
  products,
  categoryMap,
  toggling,
  onToggle,
  onEdit,
  dimmed = false,
}: {
  products: Product[];
  categoryMap: Record<string, string>;
  toggling: string | null;
  onToggle: (p: Product) => void;
  onEdit: (p: Product) => void;
  dimmed?: boolean;
}) {
  if (products.length === 0) {
    return <p className="py-8 text-center text-sm text-muted-foreground">No hay productos aquí.</p>;
  }

  return (
    <div className="space-y-2">
      {products.map((product) => (
        <div
          key={product.id}
          className={`flex items-center gap-4 rounded-xl border border-border bg-card px-4 py-3 transition-colors hover:bg-secondary/20 ${
            dimmed ? "opacity-50" : ""
          }`}
        >
          {/* Emoji */}
          <span className="text-2xl">{product.emoji}</span>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-foreground truncate">{product.name}</p>
              <Badge
                variant="outline"
                className="shrink-0 border-border text-xs text-muted-foreground"
              >
                {categoryMap[product.category_id] ?? "—"}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground truncate">{product.description}</p>
          </div>

          {/* Precio */}
          <span className="hidden shrink-0 text-sm font-bold text-primary sm:block">
            {formatCOP(product.price)}
          </span>

          {/* Acciones */}
          <div className="flex shrink-0 items-center gap-1">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => onEdit(product)}
              className="h-8 w-8 cursor-pointer text-muted-foreground hover:text-primary"
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => onToggle(product)}
              disabled={toggling === product.id}
              className={`h-8 w-8 cursor-pointer ${
                product.is_active
                  ? "text-emerald-400 hover:text-muted-foreground"
                  : "text-muted-foreground hover:text-emerald-400"
              }`}
            >
              {toggling === product.id ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : product.is_active ? (
                <ToggleRight className="h-5 w-5" />
              ) : (
                <ToggleLeft className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
