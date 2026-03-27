"use client";

import { useState } from "react";
import { ChevronUp, ChevronDown, Pencil, Trash2, Plus, Check, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { Category } from "@/types";

interface CategoryManagerProps {
  categories: Category[];
  onChanged: () => void;
  adminPassword: string;
}

export function CategoryManager({ categories, onChanged, adminPassword }: CategoryManagerProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [addingNew, setAddingNew] = useState(false);
  const [newName, setNewName] = useState("");
  const [loading, setLoading] = useState<string | null>(null); // id o "new"

  const headers = { "Content-Type": "application/json", "x-admin-auth": adminPassword };

  async function saveEdit(id: string) {
    if (!editName.trim()) return;
    setLoading(id);
    try {
      await fetch("/api/categories", {
        method: "PUT",
        headers,
        body: JSON.stringify({ id, name: editName.trim() }),
      });
      onChanged();
    } finally {
      setEditingId(null);
      setLoading(null);
    }
  }

  async function reorder(id: string, direction: "up" | "down") {
    const idx = categories.findIndex((c) => c.id === id);
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= categories.length) return;

    const a = categories[idx];
    const b = categories[swapIdx];
    setLoading(id);
    try {
      await Promise.all([
        fetch("/api/categories", {
          method: "PUT",
          headers,
          body: JSON.stringify({ id: a.id, display_order: b.display_order }),
        }),
        fetch("/api/categories", {
          method: "PUT",
          headers,
          body: JSON.stringify({ id: b.id, display_order: a.display_order }),
        }),
      ]);
      onChanged();
    } finally {
      setLoading(null);
    }
  }

  async function deleteCategory(id: string) {
    if (!confirm("¿Eliminar esta categoría? Solo funciona si no tiene productos activos.")) return;
    setLoading(id);
    try {
      const res = await fetch(`/api/categories?id=${id}`, {
        method: "DELETE",
        headers: { "x-admin-auth": adminPassword },
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error ?? "No se pudo eliminar.");
      } else {
        onChanged();
      }
    } finally {
      setLoading(null);
    }
  }

  async function createCategory() {
    if (!newName.trim()) return;
    setLoading("new");
    try {
      await fetch("/api/categories", {
        method: "POST",
        headers,
        body: JSON.stringify({ name: newName.trim() }),
      });
      setNewName("");
      setAddingNew(false);
      onChanged();
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="space-y-3">
      {categories.map((cat, idx) => (
        <div
          key={cat.id}
          className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 transition-colors hover:bg-secondary/20"
        >
          {/* Orden */}
          <Badge variant="outline" className="shrink-0 border-border font-mono text-xs text-muted-foreground">
            {cat.display_order}
          </Badge>

          {/* Nombre (editable) */}
          <div className="flex-1 min-w-0">
            {editingId === cat.id ? (
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") saveEdit(cat.id);
                  if (e.key === "Escape") setEditingId(null);
                }}
                autoFocus
                className="h-8 border-primary bg-input text-foreground"
              />
            ) : (
              <span className="text-sm font-medium text-foreground">{cat.name}</span>
            )}
          </div>

          {/* Acciones */}
          <div className="flex shrink-0 items-center gap-1">
            {editingId === cat.id ? (
              <>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 cursor-pointer text-emerald-400 hover:text-emerald-300"
                  onClick={() => saveEdit(cat.id)}
                  disabled={loading === cat.id}
                >
                  {loading === cat.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 cursor-pointer text-muted-foreground hover:text-foreground"
                  onClick={() => setEditingId(null)}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </>
            ) : (
              <>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 cursor-pointer text-muted-foreground hover:text-foreground disabled:opacity-30"
                  onClick={() => reorder(cat.id, "up")}
                  disabled={idx === 0 || loading === cat.id}
                >
                  <ChevronUp className="h-3.5 w-3.5" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 cursor-pointer text-muted-foreground hover:text-foreground disabled:opacity-30"
                  onClick={() => reorder(cat.id, "down")}
                  disabled={idx === categories.length - 1 || loading === cat.id}
                >
                  <ChevronDown className="h-3.5 w-3.5" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 cursor-pointer text-muted-foreground hover:text-primary"
                  onClick={() => { setEditingId(cat.id); setEditName(cat.name); }}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 cursor-pointer text-muted-foreground hover:text-destructive"
                  onClick={() => deleteCategory(cat.id)}
                  disabled={loading === cat.id}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </>
            )}
          </div>
        </div>
      ))}

      {/* Agregar nueva categoría */}
      {addingNew ? (
        <div className="flex items-center gap-3 rounded-xl border border-dashed border-primary/50 bg-primary/5 px-4 py-3">
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") createCategory();
              if (e.key === "Escape") { setAddingNew(false); setNewName(""); }
            }}
            placeholder="Nombre de la categoría..."
            autoFocus
            className="h-8 border-primary bg-input text-foreground"
          />
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7 cursor-pointer text-emerald-400 hover:text-emerald-300"
            onClick={createCategory}
            disabled={loading === "new"}
          >
            {loading === "new" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7 cursor-pointer text-muted-foreground hover:text-foreground"
            onClick={() => { setAddingNew(false); setNewName(""); }}
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      ) : (
        <Button
          variant="outline"
          onClick={() => setAddingNew(true)}
          className="w-full cursor-pointer gap-2 border-dashed border-border bg-transparent text-muted-foreground hover:border-primary/50 hover:bg-primary/5 hover:text-primary"
        >
          <Plus className="h-4 w-4" />
          Agregar categoría
        </Button>
      )}
    </div>
  );
}
