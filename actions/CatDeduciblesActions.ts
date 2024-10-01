"use server";

import { iGetDeducibles, iPatchDeducible, iPostDeducible, iPostDeducibleResp } from "@/interfaces/CatDeduciblesInterface";

const url = process.env.API_URL;

export const getDeducibles = async () => {
    try {
        const resp = await fetch(`${url}/paquete-coberturas`);

        if (!resp.ok) return null;

        const data: iGetDeducibles[] = await resp.json();
        return data;
    } catch (error) {
        console.log('Error al obtener paquetes: ', error);
    }
}

export const postDeducible = async (body: iPostDeducible) => {
    try {
        const resp = await fetch(`${url}/paquete-coberturas`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body)
        });

        if (!resp.ok) return null;

        const data: iPostDeducibleResp = await resp.json();
        return data;
    } catch (error) {
        console.log('Error al crear paquete: ', error);
    }
}

export const patchDeducible = async (id: number, body: iPatchDeducible) => {
    try {
        const resp = await fetch(`${url}/paquete-coberturas/${id}/admin`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body)
        });

        if (!resp.ok) return null;

        const data: iPostDeducible = await resp.json();
        return data;
    } catch (error) {
        console.log('Error al modificar paquete: ', error);
    }
}
