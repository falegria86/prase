"use server";

import {
    iGetCliente,
    iPostCliente,
    iPatchCliente
} from '@/interfaces/ClientesInterface';

const url = process.env.API_URL;

export const getAllClientes = async () => {
    try {
        const resp = await fetch(`${url}/clientes`, {
            cache: 'no-store'
        });

        if (!resp.ok) return null;

        const data: iGetCliente[] = await resp.json();
        return data;
    } catch (error) {
        console.log('Error al obtener clientes: ', error);
    }
}

export const getClienteById = async (id: number) => {
    try {
        const resp = await fetch(`${url}/clientes/${id}`, {
            cache: 'no-store'
        });

        if (!resp.ok) {
            console.log(`Error al obtener cliente con id ${id}`);
        }

        const data: iGetCliente = await resp.json();
        return data;
    } catch (error) {
        console.log('Error al obtener cliente: ', error);
    }
}

export const postCliente = async (data: iPostCliente) => {
    try {
        const resp = await fetch(`${url}/clientes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        if (!resp.ok) {
            console.log(`Error al crear cliente`);
            return null;
        }

        const cliente: iGetCliente = await resp.json();
        return cliente;
    } catch (error) {
        console.log('Error al crear cliente: ', error);
    }
}

export const patchCliente = async (id: number, data: iPatchCliente) => {
    console.log("🚀 ~ patchCliente ~ id:", id)
    console.log("🚀 ~ patchCliente ~ data:", data)
    try {
        const resp = await fetch(`${url}/clientes/${id}/admin`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        console.log("🚀 ~ patchCliente ~ resp:", resp)

        if (!resp.ok) {
            console.log(`Error al modificar cliente con id ${id}`);
            return null;
        }

        const cliente: iGetCliente = await resp.json();
        return cliente;
    } catch (error) {
        console.log('Error al modificar cliente: ', error);
    }
}

export const deleteCliente = async (id: number) => {
    try {
        const resp = await fetch(`${url}/clientes/${id}/admin`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (resp.ok) {
            return 'OK';
        } else {
            console.error(`Error: ${resp.status} ${resp.statusText}`);
            return null;
        }

        return true;
    } catch (error) {
        console.log('Error al eliminar cliente: ', error);
    }
}