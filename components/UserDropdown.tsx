import { LogOut } from 'lucide-react'
import { CustomUser } from '@/next-auth'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { logout } from '@/actions/logout'

export default function UserDropdown({ user }: { user: CustomUser | null }) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full justify-start p-0">
                    <div className="flex items-center space-x-2">
                        {user && (
                            <>
                                <Avatar className="w-10 h-10">
                                    {/* <AvatarImage src="https://xsgames.co/randomusers/assets/avatars/male/47.jpg" alt="Usuario" /> */}
                                    <AvatarFallback>{user.empleado.Nombre.toUpperCase().slice(0,1)}{user.empleado.Paterno.toUpperCase().slice(0,1)}</AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col items-start">
                                    <span className="text-sm font-medium">{user.empleado.Nombre} {user.empleado.Paterno} {user.empleado.Materno}</span>
                                    {/* <span className="text-xs text-muted-foreground">juan@ejemplo.com</span> */}
                                </div>
                            </>
                        )}
                    </div>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className='cursor-pointer'>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span onClick={() => logout()}>Cerrar Sesión</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}