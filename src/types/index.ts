import type { Database } from "@/lib/supabase/types";

export type Category = Database["public"]["Tables"]["categories"]["Row"];
export type Product = Database["public"]["Tables"]["products"]["Row"];
export type User = Database["public"]["Tables"]["users"]["Row"];
export type Order = Database["public"]["Tables"]["orders"]["Row"];
export type OrderItem = Database["public"]["Tables"]["order_items"]["Row"];

/** Producto con su categoría joinada */
export type ProductWithCategory = Product & {
  categories: Pick<Category, "name">;
};

/** Item de pedido con producto joinado (incluye categoría para la tabla de admin) */
export type OrderItemWithProduct = OrderItem & {
  products: Pick<Product, "name" | "price" | "emoji"> & {
    category_id: string;
    categories: { name: string } | null;
  };
};

/** Pedido completo con usuario e ítems */
export type OrderWithDetails = Order & {
  users: Pick<User, "username">;
  order_items: OrderItemWithProduct[];
};

/** Estado del carrito en el cliente */
export interface CartItem {
  productId: string;
  name: string;
  price: number;
  emoji: string;
  quantity: number;
}

/** Resumen de estadísticas para el admin */
export interface AdminStats {
  totalUsers: number;
  totalItems: number;
  totalRevenue: number;
  mostPopularProduct: string;
}
