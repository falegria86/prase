"use client";

import { IoKey } from "react-icons/io5";
import { IoIosLogOut } from "react-icons/io";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { logout } from "@/actions/logout";

interface Props {
    children?: React.ReactNode;
}

export const LogoutButton = ({ children }: Props) => {
    return (
        <div className="flex justify-center">
            <DropdownMenu>
                <DropdownMenuTrigger>
                    <span>
                        {children}
                    </span>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuLabel>Menú</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem><IoKey className="text-gray-500 mr-2 focus:text-white" /> Cambiar contraseña</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => logout()}><IoIosLogOut className="text-gray-500 mr-2 focus:text-white" size={12} /> Cerrar sesión</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div >
    )
}