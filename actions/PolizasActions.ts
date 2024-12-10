"use server";

import { iPatchPoliza, iPostPoliza } from "@/interfaces/CatPolizas";

const url = process.env.API_URL;

export const getPolizas = async () => {
    try {
        const resp = await fetch(`${url}/polizas`, {
            cache: "no-store",
        });

        if (!resp.ok) return null;

        const data = await resp.json();
        return data;
    } catch (error) {
        console.log("Error al obtener pólizas: ", error);
    }
};

export const postPoliza = async (poliza: iPostPoliza) => {
    try {
        const resp = await fetch(`${url}/polizas`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(poliza),
        });

        if (!resp.ok) return null;
    } catch (error) {
        console.log('Error al crear póliza: ', error);
    }
}

export const patchPoliza = async (id: number, body: iPatchPoliza) => {
    try {
        const resp = await fetch(`${url}/polizas/${id}/admin`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        if (resp.ok) {
            return 'OK';
        } else {
            console.error(`Error: ${resp.status} ${resp.statusText}`);
            return null;
        }
    } catch (error) {
        console.error('Error al eliminar póliza: ', error);
        return null;
    }
};

export const deletePoliza = async (id: number) => {
    try {
        const resp = await fetch(`${url}/polizas/${id}/admin`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (resp.ok) {
            return 'OK';
        } else {
            console.error(`Error: ${resp.status} ${resp.statusText}`);
            return null;
        }
    } catch (error) {
        console.error('Error al eliminar póliza: ', error);
        return null;
    }
};
