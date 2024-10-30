'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import { Home, FileText, ChevronDown, ChevronUp, Plus, List, Shield, LockKeyhole, User2, Merge, Scale, Bolt, BookOpenCheck, Car, User } from 'lucide-react'
import { Button } from "@/components/ui/button"
import UserDropdown from './UserDropdown'

export default function Sidebar() {
    const pathname = usePathname()
    const [isCotizacionesOpen, setIsCotizacionesOpen] = useState(false);
    const [isAdminOpen, setIsAdminOpen] = useState(false);

    return (
        <aside className="w-64 bg-white shadow-lg p-4 flex flex-col">
            <div className="flex items-center justify-center mb-8">
                <Image
                    src='/prase-logo.png'
                    width={100}
                    height={100}
                    alt='Prase logo'
                    priority={true}
                />
            </div>
            <nav className="flex-1">
                <Link href="/" passHref>
                    <Button
                        variant={pathname === '/' ? 'link' : 'ghost'}
                        className="w-full justify-start mb-4"
                    >
                        <Home className="mr-2 h-4 w-4" />
                        Inicio
                    </Button>
                </Link>
                <div className="mb-4">
                    <Button
                        variant={pathname.includes('/admin') ? 'link' : 'ghost'}
                        className="w-full justify-between"
                        onClick={() => setIsAdminOpen(!isAdminOpen)}
                    >
                        <span className="flex items-center">
                            <Shield className="mr-2 h-4 w-4" />
                            Administración
                        </span>
                        {isAdminOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                    {isAdminOpen && (
                        <div className="ml-4 mt-2 space-y-2">
                            <Link href="/admin/usuarios" passHref>
                                <Button
                                    variant={pathname === '/admin/usuarios' ? 'link' : 'ghost'}
                                    className="w-full justify-start text-sm"
                                >
                                    <User2 className="mr-2 h-3 w-3" />
                                    Usuarios
                                </Button>
                            </Link>
                            <Link href="/admin/seguridad" passHref>
                                <Button
                                    variant={pathname === '/admin/seguridad' ? 'link' : 'ghost'}
                                    className="w-full justify-start text-sm"
                                >
                                    <LockKeyhole className="mr-2 h-3 w-3" />
                                    Seguridad
                                </Button>
                            </Link>
                            <Link href="/admin/configuracion-global" passHref>
                                <Button
                                    variant={pathname === '/admin/configuracion-global' ? 'link' : 'ghost'}
                                    className="w-full justify-start text-sm"
                                >
                                    <Bolt className="mr-2 h-3 w-3" />
                                    Configuración Global
                                </Button>
                            </Link>
                            <Link href="/admin/reglas-negocio" passHref>
                                <Button
                                    variant={pathname === '/admin/reglas-negocio' ? 'link' : 'ghost'}
                                    className="w-full justify-start text-sm"
                                >
                                    <Scale className="mr-2 h-3 w-3" />
                                    Reglas de negocio
                                </Button>
                            </Link>
                            <Link href="/admin/asociar-paquete-cobertura" passHref>
                                <Button
                                    variant={pathname === '/admin/asociar-paquete-cobertura' ? 'link' : 'ghost'}
                                    className="w-full justify-start text-sm"
                                >
                                    <Merge className="mr-2 h-3 w-3" />
                                    Asociar Paq-Cobertura
                                </Button>
                            </Link>
                            <Link href="/admin/catalogos-paquetes" passHref>
                                <Button
                                    variant={pathname === '/admin/catalogos-paquetes' ? 'link' : 'ghost'}
                                    className="w-full justify-start text-sm"
                                >
                                    <List className="mr-2 h-3 w-3" />
                                    Catálogo Paquetes
                                </Button>
                            </Link>
                            <Link href="/admin/catalogos-deducibles" passHref>
                                <Button
                                    variant={pathname === '/admin/catalogos-deducibles' ? 'link' : 'ghost'}
                                    className="w-full justify-start text-sm"
                                >
                                    <List className="mr-2 h-3 w-3" />
                                    Catálogo Deducibles
                                </Button>
                            </Link>
                            <Link href="/admin/catalogos-coberturas" passHref>
                                <Button
                                    variant={pathname === '/admin/catalogos-coberturas' ? 'link' : 'ghost'}
                                    className="w-full justify-start text-sm"
                                >
                                    <List className="mr-2 h-3 w-3" />
                                    Catálogo Coberturas
                                </Button>
                            </Link>
                            <Link href="/admin/catalogos-monedas" passHref>
                                <Button
                                    variant={pathname === '/admin/catalogos-monedas' ? 'link' : 'ghost'}
                                    className="w-full justify-start text-sm"
                                >
                                    <List className="mr-2 h-3 w-3" />
                                    Catálogo Monedas
                                </Button>
                            </Link>
                            <Link href="/admin/tipos-sumas-aseguradas" passHref>
                                <Button
                                    variant={pathname === '/admin/tipos-sumas-aseguradas' ? 'link' : 'ghost'}
                                    className="w-full justify-start text-sm"
                                >
                                    <List className="mr-2 h-3 w-3" />
                                    Tipos Sumas Aseguradas
                                </Button>
                            </Link>
                            <Link href="/admin/vehiculos" passHref>
                                <Button
                                    variant={pathname === '/admin/vehiculos' ? 'link' : 'ghost'}
                                    className="w-full justify-start text-sm"
                                >
                                    <Car className="mr-2 h-3 w-3" />
                                    Vehículos
                                </Button>
                            </Link>
                            <Link href="/admin/clientes" passHref>
                                <Button
                                    variant={pathname === '/admin/clientes' ? 'link' : 'ghost'}
                                    className="w-full justify-start text-sm"
                                >
                                    <User className="mr-2 h-3 w-3" />
                                    Clientes
                                </Button>
                            </Link>

                        </div>
                    )}
                </div>
                <div className="mb-4">
                    <Button
                        variant={pathname.includes('/cotizaciones') ? 'link' : 'ghost'}
                        className="w-full justify-between"
                        onClick={() => setIsCotizacionesOpen(!isCotizacionesOpen)}
                    >
                        <span className="flex items-center">
                            <FileText className="mr-2 h-4 w-4" />
                            Cotizaciones
                        </span>
                        {isCotizacionesOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                    {isCotizacionesOpen && (
                        <div className="ml-4 mt-2 space-y-2">
                            <Link href="/cotizaciones/nueva" passHref>
                                <Button
                                    variant={pathname === '/cotizaciones/nueva' ? 'link' : 'ghost'}
                                    className="w-full justify-start text-sm"
                                >
                                    <Plus className="mr-2 h-3 w-3" />
                                    Nueva cotización
                                </Button>
                            </Link>
                            <Link href="/cotizaciones/lista" passHref>
                                <Button
                                    variant={pathname === '/cotizaciones/lista' ? 'link' : 'ghost'}
                                    className="w-full justify-start text-sm"
                                >
                                    <List className="mr-2 h-3 w-3" />
                                    Lista de cotizaciones
                                </Button>
                            </Link>
                            <Link href="/cotizaciones/libroAzul" passHref>
                                <Button
                                    variant={pathname === '/cotizaciones/libroAzul' ? 'link' : 'ghost'}
                                    className="w-full justify-start text-sm"
                                >
                                    <BookOpenCheck className="mr-2 h-3 w-3" />
                                    Libro Azul
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>
            </nav>
            <div className="mt-auto pt-4 border-t">
                <UserDropdown />
            </div>
        </aside>
    )
}