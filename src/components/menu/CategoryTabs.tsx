"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ProductCard } from "@/components/menu/ProductCard";
import type { Category, Product } from "@/types";

// Orden canónico de subcategorías en Platos Principales
const SUBCATEGORY_ORDER = [
  "Frutas",
  "Chocolate Acompañado",
  "Huevos",
  "Típicos",
  "Sándwich",
  "Tostadas Francesas",
];

interface CategoryTabsProps {
  categories: Category[];
  productsByCategory: Record<string, Product[]>;
  selectedIds: Set<string>;
  disabledInfo: Record<string, string>; // productId -> razón de deshabilitado
  onSelect: (productId: string, product: Product) => void;
}

export function CategoryTabs({
  categories,
  productsByCategory,
  selectedIds,
  disabledInfo,
  onSelect,
}: CategoryTabsProps) {
  const firstId = categories[0]?.id ?? "";

  return (
    <Tabs defaultValue={firstId} className="w-full">
      {/* Tabs de categorías */}
      <div className="sticky top-16 z-30 bg-background/90 pb-3 pt-4 backdrop-blur-md">
        <TabsList className="flex h-auto w-full justify-start gap-1 overflow-x-auto rounded-xl bg-secondary p-1">
          {categories.map((cat) => {
            const products = productsByCategory[cat.id] ?? [];
            const count = products.filter((p) => selectedIds.has(p.id)).length;
            return (
              <TabsTrigger
                key={cat.id}
                value={cat.id}
                className="shrink-0 cursor-pointer rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm"
              >
                {cat.name}
                {count > 0 && (
                  <span className="ml-1.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-primary-foreground/20 text-[10px] font-bold">
                    {count}
                  </span>
                )}
              </TabsTrigger>
            );
          })}
        </TabsList>
      </div>

      {/* Contenido de cada categoría */}
      {categories.map((cat) => {
        const products = productsByCategory[cat.id] ?? [];
        const hasSubcategories = products.some((p) => p.subcategory != null);

        return (
          <TabsContent key={cat.id} value={cat.id} className="mt-4 outline-none">
            {products.length === 0 ? (
              <p className="py-12 text-center text-muted-foreground">
                No hay productos disponibles en esta categoría.
              </p>
            ) : hasSubcategories ? (
              // ── Vista con subcategorías (Platos Principales) ──
              <SubcategoryView
                products={products}
                selectedIds={selectedIds}
                disabledInfo={disabledInfo}
                onSelect={onSelect}
              />
            ) : (
              // ── Vista normal (grid plano) ──
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    isSelected={selectedIds.has(product.id)}
                    disabled={product.id in disabledInfo}
                    disabledReason={disabledInfo[product.id]}
                    onSelect={() => onSelect(product.id, product)}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        );
      })}
    </Tabs>
  );
}

// ─────────────────────────────────────────────
// Subcomponente: vista agrupada por subcategoría
// ─────────────────────────────────────────────
function SubcategoryView({
  products,
  selectedIds,
  disabledInfo,
  onSelect,
}: {
  products: Product[];
  selectedIds: Set<string>;
  disabledInfo: Record<string, string>;
  onSelect: (productId: string, product: Product) => void;
}) {
  // Agrupar productos por subcategoría
  const grouped = products.reduce<Record<string, Product[]>>((acc, p) => {
    const key = p.subcategory ?? "Otros";
    if (!acc[key]) acc[key] = [];
    acc[key].push(p);
    return acc;
  }, {});

  // Ordenar según SUBCATEGORY_ORDER, luego los que no estén en el orden al final
  const orderedKeys = [
    ...SUBCATEGORY_ORDER.filter((k) => grouped[k]),
    ...Object.keys(grouped).filter((k) => !SUBCATEGORY_ORDER.includes(k)),
  ];

  return (
    <div className="space-y-8">
      {orderedKeys.map((subcatName) => (
        <section key={subcatName}>
          {/* Divider con nombre de subcategoría */}
          <div className="mb-4 flex items-center gap-3">
            <Separator className="flex-1 bg-border/60" />
            <span className="shrink-0 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {subcatName}
            </span>
            <Separator className="flex-1 bg-border/60" />
          </div>

          {/* Grid de productos de esta subcategoría */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {grouped[subcatName].map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                isSelected={selectedIds.has(product.id)}
                disabled={product.id in disabledInfo}
                disabledReason={disabledInfo[product.id]}
                onSelect={() => onSelect(product.id, product)}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
