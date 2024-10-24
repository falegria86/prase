"use server";
import {
    iGetAnios,
    iGetMarcasPorAnio,
    iGetModelosPorAnioMarca,
    iGetVersionesPorAnioMarcaModelo,
    iGetPrecioVersionPorClave
} from '@/interfaces/LibroAzul';

const user = "demo2410031214" //process.env.LIBRO_USER
const pass = "DEit*1367" //process.env.LIBRO_PASS

export const login = async (user: string, pass: string) => {
    try {
        const resp = await fetch(`https://api.libroazul.com/Api/Sesion/?Usuario=${user}&Contrasena=${pass}`, {
            cache: 'no-store'
        });

        if (!resp.ok) return null;

        const data: string = await resp.json();
        return data;
    } catch (error) {
        console.log('Error al obtener reglas de negocio: ', error);
    }
}

export const loginAuto = async () => {
    try {
        const resp = await fetch(`https://api.libroazul.com/Api/Sesion/?Usuario=${user}&Contrasena=${pass}`, {
            cache: 'no-store'
        });

        if (!resp.ok) return null;

        const data: string = await resp.json();
        return data;
    } catch (error) {
        console.log('Error al obtener reglas de negocio: ', error);
    }
}

export const getAnios = async (key: string) => {

    try {
        const resp = await fetch(`https://api.libroazul.com/Api/A%C3%B1os/?Llave=${key}`, {
            method: 'POST'
        });
        if (!key) return null;
        
        console.log("🚀 ~ getAnios ~ resp:", resp)

        if (!resp.ok) return null;

        const data: iGetAnios[] = await resp.json();
        return data;
    } catch (error) {
        console.log('Error al obtener reglas de negocio: ', error);
    }
}

export const getMarcasPorAnio = async (key: string, anio: iGetAnios) => {
    try {
        const resp = await fetch(`https://api.libroazul.com/Api/Marcas/?Llave=${key}&ClaveAnio=${anio.Clave}`, {
            method: 'POST'
        });

        if (!resp.ok) return null;

        const data: iGetMarcasPorAnio[] = await resp.json();
        return data;
    } catch (error) {
        console.log('Error al obtener reglas de negocio: ', error);
    }
}

export const getModelosPorAnioMarca = async (key: string, anio: iGetAnios, marca: iGetMarcasPorAnio) => {
    try {
        const resp = await fetch(`https://api.libroazul.com/Api/Modelos/?Llave=${key}&ClaveAnio=${anio.Clave}&ClaveMarca=${marca.Clave}`, {
            method: 'POST'
        });

        if (!resp.ok) return null;

        const data: iGetModelosPorAnioMarca[] = await resp.json();
        return data;
    } catch (error) {
        console.log('Error al obtener reglas de negocio: ', error);
    }
}

export const getVersionesPorAnioMarcaModelo = async (key: string, anio: iGetAnios, marca: iGetMarcasPorAnio, modelo: iGetModelosPorAnioMarca) => {
    try {
        const resp = await fetch(`https://api.libroazul.com/Api/Versiones/?Llave=${key}&ClaveAnio=${anio.Clave}&ClaveMarca=${marca.Clave}&ClaveModelo=${modelo.Clave}`, {
            method: 'POST'
        });

        if (!resp.ok) return null;

        const data: iGetVersionesPorAnioMarcaModelo[] = await resp.json();
        return data;
    } catch (error) {
        console.log('Error al obtener reglas de negocio: ', error);
    }
}

export const getPrecioVersionPorClave = async (key: string, version: iGetVersionesPorAnioMarcaModelo) => {
    try {
        const resp = await fetch(`https://api.libroazul.com/Api/Precio/?Llave=${key}&ClaveVersion=${version.Clave}`, {
            method: 'POST'
        });

        if (!resp.ok) return null;

        const data: iGetPrecioVersionPorClave = await resp.json();
        return data;
    } catch (error) {
        console.log('Error al obtener reglas de negocio: ', error);
    }
}