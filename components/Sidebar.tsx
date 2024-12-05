"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  Home,
  FileText,
  ChevronDown,
  ChevronUp,
  Plus,
  List,
  Shield,
  LockKeyhole,
  User2,
  Merge,
  Scale,
  Bolt,
  BookOpenCheck,
  Car,
  User,
  LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import UserDropdown from "./UserDropdown";
import { Aplicaciones } from "@/next-auth";

interface SidebarProps {
  aplicaciones: Aplicaciones[];
}

// Mapa de iconos disponibles
const iconosDisponibles: Record<string, LucideIcon> = {
  Home,
  FileText,
  List,
  Shield,
  LockKeyhole,
  User2,
  Merge,
  Scale,
  Bolt,
  BookOpenCheck,
  Car,
  User,
  Plus,
};

export default function Sidebar({ aplicaciones }: SidebarProps) {
  const pathname = usePathname();
  const [menuAbierto, setMenuAbierto] = useState<Record<string, boolean>>({});

  // Agrupar aplicaciones por categoría
  const aplicacionesPorCategoria = aplicaciones.reduce((acc, app) => {
    if (!acc[app.categoria]) {
      acc[app.categoria] = [];
    }
    acc[app.categoria].push(app);
    return acc;
  }, {} as Record<string, Aplicaciones[]>);

  // Obtener el icono correspondiente o un icono por defecto
  const obtenerIcono = (nombreIcono: string | null): LucideIcon => {
    if (!nombreIcono) return FileText;
    return iconosDisponibles[nombreIcono] || FileText;
  };

  const alternarMenu = (categoria: string) => {
    setMenuAbierto((prev) => ({
      ...prev,
      [categoria]: !prev[categoria],
    }));
  };

  return (
    <aside className="w-64 bg-white shadow-lg p-4 flex flex-col fixed h-screen">
      <div className="flex items-center justify-center mb-8">
        <Link href="/">
          <Image
            src="/prase-logo.png"
            width={100}
            height={100}
            alt="Prase logo"
            priority={true}
          />
        </Link>
      </div>

      <nav className="flex-1">
        <Link href="/" passHref>
          <Button
            variant={pathname === "/" ? "link" : "ghost"}
            className="w-full justify-start mb-4"
          >
            <Home className="mr-2 h-4 w-4" />
            Inicio
          </Button>
        </Link>

        {Object.entries(aplicacionesPorCategoria).map(([categoria, apps]) => (
          <div key={categoria} className="mb-4">
            <Button
              variant={
                apps.some((app) => pathname.includes(app.descripcion))
                  ? "link"
                  : "ghost"
              }
              className="w-full justify-between"
              onClick={() => alternarMenu(categoria)}
            >
              <span className="flex items-center">
                {categoria === "Administración" ? (
                  <Shield className="mr-2 h-4 w-4" />
                ) : (
                  <FileText className="mr-2 h-4 w-4" />
                )}
                {categoria}
              </span>
              {menuAbierto[categoria] ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>

            {menuAbierto[categoria] && (
              <div className="ml-4 mt-2 space-y-2">
                {apps.map((app) => {
                  const IconoApp = obtenerIcono(app.icon);
                  return (
                    <Link
                      key={app.aplicacionId}
                      href={app.descripcion}
                      passHref
                    >
                      <Button
                        variant={
                          pathname === app.descripcion ? "link" : "ghost"
                        }
                        className="w-full justify-start text-sm"
                      >
                        <IconoApp className="mr-2 h-3 w-3" />
                        {app.nombre}
                      </Button>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </nav>

      <div className="mt-auto pt-4 border-t">
        <UserDropdown />
      </div>
    </aside>
  );
}
