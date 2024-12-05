"use server";

import { iAjustesCP } from "@/interfaces/AjustesCPInterace";

const url = process.env.API_URL;

export const getAjustesCP = async (cp: string) => {
    try {
        const resp = await fetch(`${url}/ajuste-por-codigo-postal/${cp}`, {
            cache: 'no-store'
        });

        if (!resp.ok) {
            console.log(`Error al obtener ajuste con CP ${cp}`);
        }

        const data: iAjustesCP = await resp.json();
        return data;
    } catch (error) {
        console.log('Error al obtener regla de negocio: ', error);
    }
}