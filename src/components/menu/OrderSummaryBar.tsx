"use client";

import { Button } from "@/components/ui/button";
import { formatCOP } from "@/lib/constants";
import type { CartItem } from "@/types";

interface OrderSummaryBarProps {
  drink: CartItem | null;
  main: CartItem | null;
  addon: CartItem | null;
  bakery: CartItem | null;
  totalPrice: number;
  hasExistingOrder: boolean;
  onConfirm: () => void;
}

export function OrderSummaryBar({
  drink,
  main,
  addon,
  bakery,
  totalPrice,
  hasExistingOrder,
  onConfirm,
}: OrderSummaryBarProps) {
  const hasAny = drink || main || bakery;
  if (!hasAny) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-card/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        {/* Resumen por categoría */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          {drink && (
            <span className="flex items-center gap-1.5 text-sm text-foreground">
              <span className="text-base">{drink.emoji}</span>
              <span className="font-medium">{drink.name}</span>
            </span>
          )}
          {(drink && (main || bakery)) && (
            <span className="text-muted-foreground/40">·</span>
          )}
          {main && (
            <span className="flex items-center gap-1.5 text-sm text-foreground">
              <span className="text-base">{main.emoji}</span>
              <span className="font-medium">
                {main.name}
                {addon && (
                  <span className="text-muted-foreground"> + {addon.name}</span>
                )}
              </span>
            </span>
          )}
          {(main && bakery) && (
            <span className="text-muted-foreground/40">·</span>
          )}
          {bakery && (
            <span className="flex items-center gap-1.5 text-sm text-foreground">
              <span className="text-base">{bakery.emoji}</span>
              <span className="font-medium">{bakery.name}</span>
            </span>
          )}
        </div>

        {/* Total + botón */}
        <div className="flex items-center justify-between gap-4 sm:justify-end">
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Total</p>
            <p
              className="text-lg font-bold text-primary"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              {formatCOP(totalPrice)}
            </p>
          </div>
          <Button
            onClick={onConfirm}
            className="h-11 cursor-pointer bg-primary px-6 font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 hover:shadow-primary/30"
          >
            {hasExistingOrder ? "Actualizar pedido" : "Confirmar pedido"}
          </Button>
        </div>
      </div>
    </div>
  );
}
