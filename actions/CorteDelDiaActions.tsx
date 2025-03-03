"use server";

import { IGetAllCorteDia, IPostCorteDelDia } from "@/interfaces/CorteDelDiaInterface";

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

export const getCorteDelDiaByID = async (id: number) => {
    console.log("🚀 ~ getCorteDelDiaByID ~ id:", id)
    try {
        const resp = await fetch(`${url}/cortes-usuarios/usuario/${id}`, {
            cache: 'no-store'
        });
        
        console.log("🚀 ~ getCorteDelDiaByID ~ resp:", resp)
        if (!resp.ok) return null;

        const data = await resp.json();
        console.log("🚀 ~ getCorteDelDiaByID ~ data:", data)
        return data;

    } catch (error) {
        console.log(`Error al obtener el corte de caja: ${error}`);
    }
}

export const generarCorteDelDiaByID = async (id: number) => {
    // console.log("🚀 ~ generarCorteDelDiaByID ~ id:", id)
    try {
        const resp = await fetch(`${url}/cortes-usuarios/generar/${id}`, {
            cache: 'no-store'
        });

        // console.log("🚀 ~ generarCorteDelDiaByID ~ resp:", resp)
        if (!resp.ok) return null;

        const data = await resp.json();
        // console.log("🚀 ~ generarCorteDelDiaByID ~ data:", data)
        return data;

    } catch (error) {
        console.log(`Error al obtener el corte de caja: ${error}`);
    }
}

export const postCorteDelDia = async (body: IPostCorteDelDia) => {
    try {
        const resp = await fetch(`${url}/cortes-usuarios/guardar`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body)
        });

        console.log("🚀 ~ postCorteDelDia ~ resp:", resp)
        if (!resp.ok) return null;

        const data = await resp.json();
        return data;
    } catch (error) {
        console.log('Error al crear corte: ', error);
    }
}