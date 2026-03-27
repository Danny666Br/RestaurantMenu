"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Navbar } from "@/components/shared/Navbar";
import { CategoryTabs } from "@/components/menu/CategoryTabs";
import { OrderSummaryBar } from "@/components/menu/OrderSummaryBar";
import { ConfirmModal } from "@/components/shared/ConfirmModal";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { USERNAME_STORAGE_KEY, USERID_STORAGE_KEY } from "@/lib/constants";
import type { Category, Product, CartItem, OrderWithDetails } from "@/types";

// Nombres especiales dentro de Platos Principales
const ADDON_NAME = "Ingrediente adicional";
const MAIN_ALLOWS_ADDON = ["Combinados", "Omelet de huevos o claras"];

type CatType = "hot" | "cold" | "main" | "bakery";

interface ReplaceModal {
  message: string;
  onConfirm: () => void;
}

interface MenuClientProps {
  categories: Category[];
  productsByCategory: Record<string, Product[]>;
}

export function MenuClient({ categories, productsByCategory }: MenuClientProps) {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [userId, setUserId] = useState("");

  // ── Slots de selección ──
  const [selectedDrinkId, setSelectedDrinkId] = useState<string | null>(null);
  const [drinkType, setDrinkType] = useState<"hot" | "cold" | null>(null);
  const [selectedMainId, setSelectedMainId] = useState<string | null>(null);
  const [hasAddon, setHasAddon] = useState(false);
  const [selectedBakeryId, setSelectedBakeryId] = useState<string | null>(null);

  // ── Estado de UI ──
  const [hasExistingOrder, setHasExistingOrder] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [confirmSuccess, setConfirmSuccess] = useState(false);
  const [replaceModal, setReplaceModal] = useState<ReplaceModal | null>(null);

  // ── Mapa de todos los productos ──
  const allProducts = useMemo<Record<string, Product>>(() => {
    const map: Record<string, Product> = {};
    Object.values(productsByCategory).forEach((products) => {
      products.forEach((p) => { map[p.id] = p; });
    });
    return map;
  }, [productsByCategory]);

  // ── Mapa: categoryId → tipo ──
  const catTypeMap = useMemo<Record<string, CatType>>(() => {
    const map: Record<string, CatType> = {};
    categories.forEach((cat) => {
      if (cat.name === "Bebidas Calientes") map[cat.id] = "hot";
      else if (cat.name === "Bebidas Frías") map[cat.id] = "cold";
      else if (cat.name === "Platos Principales") map[cat.id] = "main";
      else if (cat.name === "Panadería") map[cat.id] = "bakery";
    });
    return map;
  }, [categories]);

  // ── Mapa: productId → tipo de categoría ──
  const productCatType = useMemo<Record<string, CatType>>(() => {
    const map: Record<string, CatType> = {};
    categories.forEach((cat) => {
      const type = catTypeMap[cat.id];
      if (!type) return;
      (productsByCategory[cat.id] ?? []).forEach((p) => {
        map[p.id] = type;
      });
    });
    return map;
  }, [categories, catTypeMap, productsByCategory]);

  // ── Producto addon ──
  const addonProduct = useMemo(
    () => Object.values(allProducts).find((p) => p.name === ADDON_NAME) ?? null,
    [allProducts]
  );

  // ── Cargar sesión y pedido existente ──
  useEffect(() => {
    const savedUsername = localStorage.getItem(USERNAME_STORAGE_KEY);
    const savedUserId = localStorage.getItem(USERID_STORAGE_KEY);

    if (!savedUsername || !savedUserId) {
      router.replace("/");
      return;
    }

    setUsername(savedUsername);
    setUserId(savedUserId);

    fetch(`/api/orders?userId=${encodeURIComponent(savedUserId)}`)
      .then((r) => r.json())
      .then((data: { order: OrderWithDetails | null }) => {
        if (!data.order || data.order.order_items.length === 0) return;

        setHasExistingOrder(true);

        // Restaurar slots desde los ítems del pedido
        data.order.order_items.forEach((item) => {
          const pid = item.product_id;
          const p = allProducts[pid];
          if (!p) return;

          const type = productCatType[pid];
          if (type === "hot") {
            setSelectedDrinkId(pid);
            setDrinkType("hot");
          } else if (type === "cold") {
            setSelectedDrinkId(pid);
            setDrinkType("cold");
          } else if (type === "main") {
            if (p.name === ADDON_NAME) {
              setHasAddon(true);
            } else {
              setSelectedMainId(pid);
            }
          } else if (type === "bakery") {
            setSelectedBakeryId(pid);
          }
        });
      })
      .catch(() => {
        // Si falla, empezamos con carrito vacío
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, allProducts, productCatType]);

  // ── Información de productos deshabilitados ──
  // Solo el addon cuando el plato principal no lo permite.
  // Las bebidas del tipo opuesto NO se deshabilitan: se permite el click
  // para mostrar el modal de cambio de tipo (caliente ↔ fría).
  const disabledInfo = useMemo<Record<string, string>>(() => {
    const info: Record<string, string> = {};

    // Addon deshabilitado si el plato principal no lo permite
    if (addonProduct) {
      const mainAllowsAddon =
        selectedMainId !== null &&
        MAIN_ALLOWS_ADDON.includes(allProducts[selectedMainId]?.name ?? "");
      if (!mainAllowsAddon) {
        info[addonProduct.id] = "Solo con Combinados u Omelet";
      }
    }

    return info;
  }, [addonProduct, selectedMainId, allProducts]);

  // ── Conjunto de IDs seleccionados ──
  const selectedIds = useMemo<Set<string>>(() => {
    const ids = new Set<string>();
    if (selectedDrinkId) ids.add(selectedDrinkId);
    if (selectedMainId) ids.add(selectedMainId);
    if (hasAddon && addonProduct) ids.add(addonProduct.id);
    if (selectedBakeryId) ids.add(selectedBakeryId);
    return ids;
  }, [selectedDrinkId, selectedMainId, hasAddon, addonProduct, selectedBakeryId]);

  // ── Lógica de selección ──
  const handleSelect = useCallback(
    (productId: string, product: Product) => {
      const catType = productCatType[productId];

      if (catType === "hot" || catType === "cold") {
        if (selectedDrinkId === productId) {
          // Deseleccionar
          setSelectedDrinkId(null);
          setDrinkType(null);
        } else if (!selectedDrinkId) {
          // Slot vacío
          setSelectedDrinkId(productId);
          setDrinkType(catType);
        } else if (drinkType === catType) {
          // Mismo tipo → reemplazar directamente
          setSelectedDrinkId(productId);
        } else {
          // Tipo opuesto → modal de reemplazo
          const prev = allProducts[selectedDrinkId];
          setReplaceModal({
            message: `Ya elegiste "${prev?.name ?? ""}". ¿Cambiar por "${product.name}"?`,
            onConfirm: () => {
              setSelectedDrinkId(productId);
              setDrinkType(catType);
              setReplaceModal(null);
            },
          });
        }
      } else if (catType === "main") {
        if (product.name === ADDON_NAME) {
          // Addon: solo toggle si el main lo permite (el disabled se maneja afuera)
          setHasAddon((prev) => !prev);
        } else if (selectedMainId === productId) {
          // Deseleccionar
          setSelectedMainId(null);
          setHasAddon(false);
        } else if (!selectedMainId) {
          setSelectedMainId(productId);
          // Si el nuevo plato no permite addon, limpiarlo
          if (!MAIN_ALLOWS_ADDON.includes(product.name)) setHasAddon(false);
        } else {
          // Reemplazar → modal
          const prev = allProducts[selectedMainId];
          setReplaceModal({
            message: `¿Reemplazar "${prev?.name ?? ""}" por "${product.name}"?`,
            onConfirm: () => {
              setSelectedMainId(productId);
              if (!MAIN_ALLOWS_ADDON.includes(product.name)) setHasAddon(false);
              setReplaceModal(null);
            },
          });
        }
      } else if (catType === "bakery") {
        if (selectedBakeryId === productId) {
          setSelectedBakeryId(null);
        } else if (!selectedBakeryId) {
          setSelectedBakeryId(productId);
        } else {
          const prev = allProducts[selectedBakeryId];
          setReplaceModal({
            message: `¿Reemplazar "${prev?.name ?? ""}" por "${product.name}"?`,
            onConfirm: () => {
              setSelectedBakeryId(productId);
              setReplaceModal(null);
            },
          });
        }
      }
    },
    [
      productCatType,
      selectedDrinkId,
      drinkType,
      selectedMainId,
      selectedBakeryId,
      allProducts,
    ]
  );

  // ── CartItems para el modal de confirmación y API ──
  const makeCartItem = (id: string | null): CartItem | null => {
    if (!id) return null;
    const p = allProducts[id];
    if (!p) return null;
    return { productId: id, name: p.name, price: p.price, emoji: p.emoji, quantity: 1 };
  };

  const drinkItem = makeCartItem(selectedDrinkId);
  const mainItem = makeCartItem(selectedMainId);
  const addonItem =
    hasAddon && addonProduct
      ? { productId: addonProduct.id, name: addonProduct.name, price: addonProduct.price, emoji: addonProduct.emoji, quantity: 1 }
      : null;
  const bakeryItem = makeCartItem(selectedBakeryId);

  const cartItems: CartItem[] = [drinkItem, mainItem, addonItem, bakeryItem].filter(
    Boolean
  ) as CartItem[];

  const totalPrice = cartItems.reduce((acc, i) => acc + i.price, 0);

  // ── Confirmar pedido ──
  async function handleConfirm() {
    setConfirming(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, items: cartItems }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "Error al guardar el pedido.");
        return;
      }

      setConfirmSuccess(true);
      setHasExistingOrder(true);
    } catch {
      toast.error("Error de conexión. Intenta de nuevo.");
    } finally {
      setConfirming(false);
    }
  }

  function handleCloseModal() {
    setModalOpen(false);
    setConfirmSuccess(false);
  }

  return (
    <>
      <Navbar username={username} />

      <main className="mx-auto w-full max-w-5xl px-4 pb-40 pt-6">
        {/* Saludo en mobile */}
        <div className="mb-6 sm:hidden">
          <p className="text-sm text-muted-foreground">
            Hola, <span className="font-semibold text-primary">{username}</span>
          </p>
          {hasExistingOrder && (
            <p className="mt-0.5 text-xs text-muted-foreground">
              Tienes un pedido guardado — puedes modificarlo.
            </p>
          )}
        </div>

        {hasExistingOrder && (
          <div className="mb-4 hidden items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 sm:flex">
            <div className="h-1.5 w-1.5 rounded-full bg-primary" />
            <p className="text-sm text-muted-foreground">
              Tienes un pedido guardado. Puedes modificarlo y actualizarlo.
            </p>
          </div>
        )}

        <CategoryTabs
          categories={categories}
          productsByCategory={productsByCategory}
          selectedIds={selectedIds}
          disabledInfo={disabledInfo}
          onSelect={handleSelect}
        />
      </main>

      <OrderSummaryBar
        drink={drinkItem}
        main={mainItem}
        addon={addonItem}
        bakery={bakeryItem}
        totalPrice={totalPrice}
        hasExistingOrder={hasExistingOrder}
        onConfirm={() => setModalOpen(true)}
      />

      <ConfirmModal
        open={modalOpen}
        onClose={handleCloseModal}
        onConfirm={handleConfirm}
        items={cartItems}
        total={totalPrice}
        loading={confirming}
        success={confirmSuccess}
        isUpdate={hasExistingOrder}
      />

      {/* Modal de reemplazo */}
      <Dialog
        open={replaceModal !== null}
        onOpenChange={(open) => { if (!open) setReplaceModal(null); }}
      >
        <DialogContent className="max-w-sm border-border bg-card">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold text-foreground">
              ¿Cambiar selección?
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">{replaceModal?.message}</p>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setReplaceModal(null)}
              className="cursor-pointer border-border bg-secondary text-foreground hover:bg-secondary/80"
            >
              Mantener
            </Button>
            <Button
              onClick={replaceModal?.onConfirm}
              className="cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Cambiar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
