'use client'

import { ReactNode } from 'react'
import Sidebar from './Sidebar'

interface AppLayoutProps {
    children: ReactNode
}

export default function AppLayout({ children }: AppLayoutProps) {
    return (
        <div className="flex h-screen bg-gray-100">
            <Sidebar />
            <main className="flex-1 p-8 overflow-auto">
                {children}
            </main>
        </div>
    )
}