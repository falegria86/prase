"use server";

import { iGetInicioActivo, iGetIniciosCaja, iPatchInicioCaja, iPostInicioCaja } from "@/interfaces/MovimientosInterface";

const url = process.env.API_URL;

export const getIniciosCaja = async () => {
    try {
        const resp = await fetch(`${url}/inicios-caja`, {
            cache: 'no-store'
        });

        if (!resp.ok) return null;

        const data: iGetIniciosCaja[] = await resp.json();
        return data;
    } catch (error) {
        console.log(`Error al obtener inicios de caja: ${error}`);
    }
}

export const getInicioActivo = async (idUser: number) => {
    try {
        const resp = await fetch(`${url}/inicios-caja/activo/${idUser}`, {
            cache: 'no-store'
        });

        if (!resp.ok) return null;

        const data: iGetInicioActivo = await resp.json();
        return data;
    } catch (error) {
        console.log(`Error al obtener inicios de caja: ${error}`);
    }
}

export const postInicioCaja = async (body: iPostInicioCaja) => {
    try {
        const resp = await fetch(`${url}/inicios-caja`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body)
        });

        if (!resp.ok) return { error: 'Error al crear inicio de caja' };

        const data = await resp.json();
        return data;
    } catch (error) {
        console.log(`Error al crear inicio de caja: ${error}`);
    }
}

export const patchInicioCaja = async (id: number, body: iPatchInicioCaja) => {
    try {
        const resp = await fetch(`${url}/inicios-caja/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body)
        });

        if (!resp.ok) return { error: 'Error al actualizar inicio de caja' };

        const data = await resp.json();
        return data;
    } catch (error) {
        console.log('Error al actualizar inicio de caja: ', error);
    }
}

export const deleteInicioCaja = async (id: number) => {
    try {
        const resp = await fetch(`${url}/inicios-caja/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!resp.ok) return { error: 'Error al eliminar inicio de caja' }

        return { msg: 'Inicio de caja eliminado correctamente' }
    } catch (error) {
        console.log(`Error al eliminar inicio de caja: ${error}`)
    }
}