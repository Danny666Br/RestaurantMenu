import { createServerClient } from "@/lib/supabase/server";
import { MenuClient } from "./MenuClient";
import type { Category, Product } from "@/types";

export const metadata = {
  title: "Menú — Pastelería Florida",
};

async function getMenuData(): Promise<{
  categories: Category[];
  productsByCategory: Record<string, Product[]>;
}> {
  try {
    const supabase = createServerClient();

    const [categoriesResult, productsResult] = await Promise.all([
      supabase.from("categories").select("*").order("display_order"),
      supabase
        .from("products")
        .select("*")
        .eq("is_active", true)
        .order("name"),
    ]);

    const categories: Category[] = (categoriesResult.data as Category[]) ?? [];
    const products: Product[] = (productsResult.data as Product[]) ?? [];

    const productsByCategory: Record<string, Product[]> = {};
    categories.forEach((cat) => {
      productsByCategory[cat.id] = products.filter((p) => p.category_id === cat.id);
    });

    return { categories, productsByCategory };
  } catch {
    // Si Supabase no está configurado, retornar vacío
    return { categories: [], productsByCategory: {} };
  }
}

export default async function MenuPage() {
  const { categories, productsByCategory } = await getMenuData();

  return (
    <div className="min-h-screen bg-background">
      <MenuClient
        categories={categories}
        productsByCategory={productsByCategory}
      />
    </div>
  );
}
