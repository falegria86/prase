"use server"

import { iGetSucursales } from "@/interfaces/SeguridadInterface";

const url = process.env.API_URL;

export const getSucursales = async () => {
    try {
        const resp = await fetch(`${url}/sucursales`, {
            cache: 'no-store'
        });

        if (!resp.ok) return null;

        const data: iGetSucursales[] = await resp.json();
        return data;
    } catch (error) {
        console.log('Error al obtener usuarios: ', error);
    }
}