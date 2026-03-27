"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Product, Category } from "@/types";

interface ProductFormProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  product?: Product;
  categories: Category[];
  adminPassword: string;
}

const EMOJI_OPTIONS = ["☕", "🍵", "🍫", "🍊", "🥭", "🥤", "💧", "🍳", "🥞", "🥑", "🥓", "🍓", "🥣", "🥐", "🧁", "🍞", "🍽️"];

export function ProductForm({
  open,
  onClose,
  onSaved,
  product,
  categories,
  adminPassword,
}: ProductFormProps) {
  const isEditing = !!product;

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [emoji, setEmoji] = useState("🍽️");
  const [categoryId, setCategoryId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Pre-llenar al editar
  useEffect(() => {
    if (open) {
      setName(product?.name ?? "");
      setDescription(product?.description ?? "");
      setPrice(product?.price?.toString() ?? "");
      setEmoji(product?.emoji ?? "🍽️");
      setCategoryId(product?.category_id ?? categories[0]?.id ?? "");
      setError("");
    }
  }, [open, product, categories]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!name.trim()) return setError("El nombre es requerido.");
    const priceNum = parseInt(price.replace(/\D/g, ""), 10);
    if (!priceNum || priceNum <= 0) return setError("Ingresa un precio válido.");
    if (!categoryId) return setError("Selecciona una categoría.");

    setLoading(true);
    try {
      const body = {
        ...(isEditing ? { id: product.id } : {}),
        name: name.trim(),
        description: description.trim(),
        price: priceNum,
        emoji,
        category_id: categoryId,
      };

      const res = await fetch("/api/products", {
        method: isEditing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-auth": adminPassword,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Error al guardar el producto.");
        return;
      }

      onSaved();
      onClose();
    } catch {
      setError("Error de conexión.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !loading && !v && onClose()}>
      <DialogContent className="border-border bg-card sm:max-w-md">
        <DialogHeader>
          <DialogTitle
            className="text-foreground"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            {isEditing ? "Editar producto" : "Nuevo producto"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Emoji */}
          <div className="space-y-2">
            <Label className="text-muted-foreground text-xs">Emoji</Label>
            <div className="flex flex-wrap gap-2">
              {EMOJI_OPTIONS.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setEmoji(e)}
                  className={`flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border text-lg transition-all ${
                    emoji === e
                      ? "border-primary bg-primary/10"
                      : "border-border bg-secondary hover:border-border/50"
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          {/* Nombre */}
          <div className="space-y-1.5">
            <Label htmlFor="pname" className="text-xs text-muted-foreground">Nombre</Label>
            <Input
              id="pname"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Café Americano"
              className="border-border bg-input text-foreground"
              disabled={loading}
            />
          </div>

          {/* Descripción */}
          <div className="space-y-1.5">
            <Label htmlFor="pdesc" className="text-xs text-muted-foreground">Descripción</Label>
            <Input
              id="pdesc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Breve descripción del producto"
              className="border-border bg-input text-foreground"
              disabled={loading}
            />
          </div>

          {/* Precio + Categoría en fila */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="pprice" className="text-xs text-muted-foreground">Precio (COP)</Label>
              <Input
                id="pprice"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="4500"
                className="border-border bg-input text-foreground"
                disabled={loading}
                inputMode="numeric"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Categoría</Label>
              <Select value={categoryId} onValueChange={setCategoryId} disabled={loading}>
                <SelectTrigger className="border-border bg-input text-foreground">
                  <SelectValue placeholder="Selecciona..." />
                </SelectTrigger>
                <SelectContent className="border-border bg-card">
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id} className="text-foreground focus:bg-secondary">
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <DialogFooter className="gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={loading}
              className="cursor-pointer text-muted-foreground hover:text-foreground"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {loading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Guardando...</>
              ) : isEditing ? "Guardar cambios" : "Crear producto"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
