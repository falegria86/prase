"use server";

import { iGetDocumentos, iGetPolizas, iPatchPoliza, iPostDocumento, iPostPoliza, iPostPolizaResp } from "@/interfaces/CatPolizas";

const url = process.env.API_URL;

export const getPolizas = async () => {
    try {
        const resp = await fetch(`${url}/polizas`, {
            cache: "no-store",
        });

        if (!resp.ok) return null;

        const data: iGetPolizas[] = await resp.json();
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

        const data: iPostPolizaResp = await resp.json();
        return data;
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

        const data = await resp.json();
        return data;
    } catch (error) {
        console.error('Error al eliminar póliza: ', error);
        return null;
    }
};

export const deletePoliza = async (id: number, body: { motivo: string }) => {
    try {
        const resp = await fetch(`${url}/polizas/${id}/admin`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        const data = await resp.json();
        return data;
    } catch (error) {
        console.error('Error al eliminar póliza: ', error);
        return null;
    }
};

export const getDocumentos = async (idPoliza: number) => {
    try {
        const resp = await fetch(`${url}/documentos-digitalizados/poliza/${idPoliza}`, {
            cache: "no-store",
        });

        if (!resp.ok) return null;

        const data: iGetDocumentos[] = await resp.json();
        return data;
    } catch (error) {
        console.log("Error al obtener pólizas: ", error);
    }
};

export const postDocumento = async (body: iPostDocumento) => {
    try {
        const resp = await fetch(`${url}/documentos-digitalizados/upload`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        const data = await resp.json();
        return data;
    } catch (error) {
        console.log('Error al insertar documento: ', error);
    }
}