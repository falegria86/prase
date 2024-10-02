"use server";

import { iGetAllPaquetes, iPatchPaqueteCobertura, iPostPaqueteCobertura, iPostPaqueteResp } from "@/interfaces/CatPaquetesInterface";

const url = process.env.API_URL;

export const getAllPaquetes = async () => {
    try {
        const resp = await fetch(`${url}/paquete-coberturas`, {
            cache: 'no-store'
        });

        if (!resp.ok) return null;

        const data: iGetAllPaquetes[] = await resp.json();
        return data;
    } catch (error) {
        console.log('Error al obtener paquetes: ', error);
    }
}

export const getPaquetesById = async (id: number) => {
    try {
        const resp = await fetch(`${url}/paquete-coberturas/${id}`, {
            cache: 'no-store'
        });

        if (!resp.ok) {
            console.log(`Error al obtener paquete con id ${id}`);
        }

        const data: iGetAllPaquetes = await resp.json();
        return data;
    } catch (error) {
        console.log('Error al obtener paquete: ', error);
    }
}

export const postPaqueteCobertura = async (body: iPostPaqueteCobertura) => {
    try {
        const resp = await fetch(`${url}/paquete-coberturas`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body)
        });

        if (!resp.ok) return null;

        const data: iPostPaqueteResp = await resp.json();
        return data;
    } catch (error) {
        console.log('Error al crear paquete: ', error);
    }
}

export const patchPaqueteCobertura = async (id: number, body: iPatchPaqueteCobertura) => {
    try {
        const resp = await fetch(`${url}/paquete-coberturas/${id}/admin`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body)
        });

        if (!resp.ok) return null;

        const data: iPostPaqueteResp = await resp.json();
        return data;
    } catch (error) {
        console.log('Error al modificar paquete: ', error);
    }
}

export const deletePaqueteCobertura = async (id: number) => {
    try {
        const resp = await fetch(`${url}/paquete-coberturas/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        //TODO: Implementarlo bien ya que se modifique api
        if (resp.ok) {
            return 'OK';
        } else {
            console.error(`Error: ${resp.status} ${resp.statusText}`);
            return null;
        }
    } catch (error) {
        console.error('Error al eliminar el paquete: ', error);
        return null;
    }
};