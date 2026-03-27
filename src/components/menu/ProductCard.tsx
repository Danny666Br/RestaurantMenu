"use client";

import { Check } from "lucide-react";
import { formatCOP } from "@/lib/constants";
import type { Product } from "@/types";

interface ProductCardProps {
  product: Product;
  isSelected: boolean;
  disabled: boolean;
  disabledReason?: string;
  onSelect: () => void;
}

export function ProductCard({
  product,
  isSelected,
  disabled,
  disabledReason,
  onSelect,
}: ProductCardProps) {
  return (
    <article
      onClick={disabled ? undefined : onSelect}
      className={`group relative flex flex-col rounded-2xl border p-5 transition-all duration-200 ${
        disabled
          ? "cursor-not-allowed border-border bg-card opacity-40"
          : isSelected
          ? "cursor-pointer border-primary/60 bg-card shadow-lg shadow-primary/10"
          : "cursor-pointer border-border bg-card hover:border-border/80 hover:shadow-md hover:shadow-black/30"
      }`}
    >
      {/* Badge: seleccionado */}
      {isSelected && (
        <div className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary shadow-md">
          <Check className="h-3.5 w-3.5 text-primary-foreground" strokeWidth={3} />
        </div>
      )}

      {/* Badge: razón de deshabilitado */}
      {disabled && disabledReason && (
        <div className="absolute -top-2 left-3 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
          {disabledReason}
        </div>
      )}

      {/* Emoji del producto */}
      <div
        className={`mb-4 flex h-16 w-16 items-center justify-center rounded-xl text-4xl transition-transform duration-200 ${
          isSelected ? "bg-primary/10" : "bg-secondary group-hover:bg-secondary/80"
        }`}
      >
        {product.emoji}
      </div>

      {/* Info */}
      <div className="flex-1 space-y-1">
        <h3 className="text-sm font-semibold leading-tight text-foreground">
          {product.name}
        </h3>
        {product.description && (
          <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
            {product.description}
          </p>
        )}
      </div>

      {/* Precio + indicador de estado */}
      <div className="mt-4 flex items-center justify-between">
        <span className="text-base font-bold text-primary">
          {formatCOP(product.price)}
        </span>
        {isSelected ? (
          <span className="text-xs font-semibold text-primary">Seleccionado</span>
        ) : !disabled ? (
          <span className="text-xs text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
            Toca para elegir
          </span>
        ) : null}
      </div>
    </article>
  );
}
