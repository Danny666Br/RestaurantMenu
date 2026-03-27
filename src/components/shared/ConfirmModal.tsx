"use client";

import { Loader2, CheckCircle2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatCOP } from "@/lib/constants";
import type { CartItem } from "@/types";

interface ConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  items: CartItem[];
  total: number;
  loading: boolean;
  success: boolean;
  isUpdate: boolean;
}

export function ConfirmModal({
  open,
  onClose,
  onConfirm,
  items,
  total,
  loading,
  success,
  isUpdate,
}: ConfirmModalProps) {
  return (
    <Dialog open={open} onOpenChange={(v) => !loading && !success && onClose()}>
      <DialogContent className="border-border bg-card sm:max-w-md">
        {success ? (
          /* Estado de éxito */
          <div className="flex flex-col items-center gap-4 py-6 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <CheckCircle2 className="h-9 w-9 text-primary" />
            </div>
            <div>
              <h2
                className="text-xl font-bold text-foreground"
                style={{ fontFamily: "var(--font-playfair)" }}
              >
                {isUpdate ? "¡Pedido actualizado!" : "¡Pedido confirmado!"}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Tu selección fue guardada correctamente.
              </p>
            </div>
            <Button
              onClick={onClose}
              className="mt-2 cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Listo
            </Button>
          </div>
        ) : (
          /* Estado normal */
          <>
            <DialogHeader>
              <DialogTitle
                className="text-xl text-foreground"
                style={{ fontFamily: "var(--font-playfair)" }}
              >
                {isUpdate ? "Actualizar pedido" : "Confirmar pedido"}
              </DialogTitle>
            </DialogHeader>

            {/* Lista de ítems */}
            <div className="max-h-64 overflow-y-auto">
              <ul className="space-y-3 py-2">
                {items.map((item) => (
                  <li key={item.productId} className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xl">{item.emoji}</span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">
                          {item.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatCOP(item.price)} × {item.quantity}
                        </p>
                      </div>
                    </div>
                    <span className="shrink-0 text-sm font-semibold text-primary">
                      {formatCOP(item.price * item.quantity)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <Separator className="bg-border" />

            {/* Total */}
            <div className="flex items-center justify-between py-1">
              <span className="font-semibold text-foreground">Total</span>
              <span
                className="text-xl font-bold text-primary"
                style={{ fontFamily: "var(--font-playfair)" }}
              >
                {formatCOP(total)}
              </span>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                variant="ghost"
                onClick={onClose}
                disabled={loading}
                className="cursor-pointer text-muted-foreground hover:text-foreground"
              >
                Cancelar
              </Button>
              <Button
                onClick={onConfirm}
                disabled={loading}
                className="cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : isUpdate ? (
                  "Actualizar pedido"
                ) : (
                  "Confirmar pedido"
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
