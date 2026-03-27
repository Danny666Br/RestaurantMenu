"use client";

import { Users, ShoppingBag, TrendingUp, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatCOP } from "@/lib/constants";
import type { AdminStats } from "@/types";

interface StatsCardsProps {
  stats: AdminStats;
}

export function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      label: "Usuarios con pedido",
      value: stats.totalUsers.toString(),
      icon: Users,
      color: "text-blue-400",
      bg: "bg-blue-400/10",
    },
    {
      label: "Ítems pedidos",
      value: stats.totalItems.toString(),
      icon: ShoppingBag,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Total ingresos",
      value: formatCOP(stats.totalRevenue),
      icon: TrendingUp,
      color: "text-emerald-400",
      bg: "bg-emerald-400/10",
    },
    {
      label: "Producto más popular",
      value: stats.mostPopularProduct || "—",
      icon: Star,
      color: "text-violet-400",
      bg: "bg-violet-400/10",
      small: true,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.label} className="border-border bg-card">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-muted-foreground">{card.label}</p>
                  <p
                    className={`mt-1 font-bold text-foreground ${
                      card.small ? "text-sm leading-tight mt-2" : "text-2xl"
                    }`}
                    style={!card.small ? { fontFamily: "var(--font-playfair)" } : undefined}
                  >
                    {card.value}
                  </p>
                </div>
                <div className={`ml-3 shrink-0 rounded-lg p-2 ${card.bg}`}>
                  <Icon className={`h-5 w-5 ${card.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
