"use server";

import { iGetApplications, iGetGroups, iPatchApplication, iPatchGroup, iPostApplication, iPostApplicationResp, iPostGroup } from "@/interfaces/SeguridadInterface";

const url = process.env.API_URL;

export const getGroups = async () => {
    try {
        const resp = await fetch(`${url}/groups`, {
            cache: 'no-store'
        });

        if (!resp.ok) return null;

        const data: iGetGroups[] = await resp.json();
        return data;
    } catch (error) {
        console.log('Error al obtener coberturas: ', error);
    }
}

export const postGroup = async (body: iPostGroup) => {
    try {
        const resp = await fetch(`${url}/groups`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body)
        });

        if (!resp.ok) return null;

        const data = await resp.json();
        return data;
    } catch (error) {
        console.log('Error al crear paquete: ', error);
    }
}

export const patchGroup = async (id: number, body: iPatchGroup) => {
    try {
        const resp = await fetch(`${url}/groups/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body)
        });

        if (!resp.ok) return null;

        const data = await resp.json();
        return data;
    } catch (error) {
        console.log('Error al crear paquete: ', error);
    }
}

export const deleteGroup = async (id: number) => {
    try {
        const resp = await fetch(`${url}/groups/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!resp.ok) return null;

        const data = await resp.json();
        return data;
    } catch (error) {
        console.log('Error al crear paquete: ', error);
    }
}

export const getApplications = async () => {
    try {
        const resp = await fetch(`${url}/applications`, {
            cache: 'no-store'
        });

        if (!resp.ok) return null;

        const data: iGetApplications[] = await resp.json();
        return data;
    } catch (error) {
        console.log('Error al obtener coberturas: ', error);
    }
}

export const postApplication = async (body: iPostApplication) => {
    try {
        const resp = await fetch(`${url}/applications`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body)
        });

        if (!resp.ok) return null;

        const data: iPostApplicationResp = await resp.json();
        return data;
    } catch (error) {
        console.log('Error al crear paquete: ', error);
    }
}

export const patchApplication = async (id: number, body: iPatchApplication) => {
    try {
        const resp = await fetch(`${url}/applications/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body)
        });

        if (!resp.ok) return null;

        const data: iPostApplicationResp = await resp.json();
        return data;
    } catch (error) {
        console.log('Error al crear paquete: ', error);
    }
}

export const deleteApplication = async (id: number) => {
    try {
        const resp = await fetch(`${url}/applications/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!resp.ok) return null;

        const data = await resp.json();
        return data;
    } catch (error) {
        console.log('Error al crear paquete: ', error);
    }
}
