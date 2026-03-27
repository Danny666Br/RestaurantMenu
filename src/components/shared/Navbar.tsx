"use client";

import { useRouter } from "next/navigation";
import { UtensilsCrossed, LogOut, MapPin, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { USERNAME_STORAGE_KEY, USERID_STORAGE_KEY } from "@/lib/constants";

interface NavbarProps {
  username: string;
}

export function Navbar({ username }: NavbarProps) {
  const router = useRouter();

  function handleChangeUser() {
    localStorage.removeItem(USERNAME_STORAGE_KEY);
    localStorage.removeItem(USERID_STORAGE_KEY);
    router.push("/");
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
        {/* Logo + info del evento */}
        <div className="flex items-center gap-2.5 min-w-0">
          <UtensilsCrossed className="h-5 w-5 shrink-0 text-primary" />
          <div className="min-w-0">
            <span
              className="block text-base font-bold leading-tight text-foreground"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              Pastelería Florida
            </span>
            <span className="hidden items-center gap-2 text-[10px] text-muted-foreground/70 sm:flex">
              <MapPin className="h-2.5 w-2.5 shrink-0" />
              Cra 7 #21-46
              <span className="text-border">·</span>
              <Calendar className="h-2.5 w-2.5 shrink-0" />
              Jue 10 Abr · 8:00 AM
            </span>
          </div>
        </div>

        {/* Saludo + botón */}
        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-muted-foreground sm:block">
            Hola,{" "}
            <span className="font-semibold text-primary">{username}</span>
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleChangeUser}
            className="cursor-pointer gap-1.5 text-muted-foreground hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Cambiar usuario</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
