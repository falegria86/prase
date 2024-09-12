'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { EyeIcon, EyeOffIcon, LogInIcon } from 'lucide-react'

export default function LoginPage() {
    const [showPassword, setShowPassword] = useState(false)

    const togglePasswordVisibility = () => setShowPassword(!showPassword)

    return (
        <div className="flex flex-col md:flex-row h-screen">
            <div className="hidden md:block relative w-1/2 h-full">
                <Image
                    src="/prase-bg.png"
                    alt="Prase Background"
                    layout="fill"
                    objectFit="cover"
                />
            </div>
            <div className="w-full md:w-1/2 flex items-center justify-center p-8 bg-blue-50 min-h-screen">
                <div className="w-full max-w-md">
                    <Image
                        src="/prase-logo.png"
                        alt="Prase logo"
                        width={150}
                        height={150}
                        className='mx-auto mb-5'
                    />
                    <h1 className="text-3xl font-bold uppercase mb-2 text-blue-800">Bienvenido a PRASE</h1>
                    <p className="mb-2 text-gray-600">
                        Inicia sesión con tus credenciales.
                    </p>
                    <form className="space-y-6">
                        <div>
                            <Input
                                type="email"
                                placeholder="Enter your email"
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div className="relative">
                            <Input
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter your password"
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button
                                type="button"
                                onClick={togglePasswordVisibility}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                            >
                                {showPassword ? (
                                    <EyeOffIcon className="h-5 w-5" />
                                ) : (
                                    <EyeIcon className="h-5 w-5" />
                                )}
                            </button>
                        </div>
                        <Button
                            asChild
                            type="submit"
                            className='w-full'
                        >
                            <Link href='/'>
                                <LogInIcon className="mr-2 h-4 w-4" />
                                Iniciar sesión
                            </Link>
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    )
}