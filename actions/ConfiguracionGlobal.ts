"use server";
import {
    IPostConfiguracionGlobal,
    IPatchConfiguracionGlobal,
    IGetAllConfiguracionGlobal
} from '@/interfaces/ConfiguracionGlobal';

const url = process.env.API_URL;

export const getAllConfiguracionGlobal = async () => {
    try {
        const resp = await fetch(`${url}/configuraciones-sistema`, {
            cache: 'no-store'
        });

        if (!resp.ok) return null;

        const data: IGetAllConfiguracionGlobal[] = await resp.json();
        return data;
    } catch (error) {
        console.log('Error al obtener configuración global: ', error);
    }
}

export const postConfiguracionGlobal = async (body: IPostConfiguracionGlobal) => {
    try {
        const resp = await fetch(`${url}/configuraciones-sistema`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body)
        });

        if (!resp.ok) return null;

        const data: IPostConfiguracionGlobal = await resp.json();
        return data;
    } catch (error) {
        console.log('Error al crear configuración global: ', error);
    }
}

export const patchConfiguracionGlobal = async (id: number, body: IPatchConfiguracionGlobal) => {
    try {
        const resp = await fetch(`${url}/configuraciones-sistema/${id}/admin`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body)
        });

        if (!resp.ok) return null;

        const data: IPatchConfiguracionGlobal = await resp.json();
        return data;
    } catch (error) {
        console.log('Error al actualizar configuración global: ', error);
    }
}