'use client'

import { Home, FileText } from 'lucide-react'
import { Button } from "@/components/ui/button"
import UserDropdown from './UserDropdown'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from 'next/image'

export default function Sidebar() {
    const pathname = usePathname()

    return (
        <aside className="w-64 bg-white shadow-lg p-4 flex flex-col">
            <div className="flex items-center justify-center mb-8">
                <Image
                    src='/prase-logo.png'
                    width={100}
                    height={100}
                    alt='Prase logo'
                />
            </div>
            <nav className="flex-1">
                <Link href="/" passHref>
                    <Button
                        variant={pathname === '/' ? 'default' : 'ghost'}
                        className="w-full justify-start mb-4"
                    >
                        <Home className="mr-2 h-4 w-4" />
                        Inicio
                    </Button>
                </Link>
                <Link href="/cotizador" passHref>
                    <Button
                        variant={pathname === '/cotizador' ? 'default' : 'ghost'}
                        className="w-full justify-start mb-4"
                    >
                        <FileText className="mr-2 h-4 w-4" />
                        Cotizador
                    </Button>
                </Link>
            </nav>
            <div className="mt-auto pt-4 border-t">
                <UserDropdown />
            </div>
        </aside>
    )
}