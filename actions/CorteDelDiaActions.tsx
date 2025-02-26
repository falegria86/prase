"use server";

import { IGetAllCorteDia } from "@/interfaces/CorteDelDiaInterface";

const url = process.env.API_URL;

export const getCortesDelDia = async () => {
    try {
        const resp = await fetch(`${url}/cortes-usuarios`, {
            cache: 'no-store'
        });

        if (!resp.ok) return null;

        const data: IGetAllCorteDia[] = await resp.json();
        return data;
    } catch (error) {
        console.log(`Error al obtener inicios de caja: ${error}`);
    }
}