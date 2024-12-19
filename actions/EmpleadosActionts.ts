"use server"

import { iGetEmpleados } from "@/interfaces/EmpleadosInterface";

const url = process.env.API_URL;

export const getEmpleados = async () => {
    try {
        const resp = await fetch(`${url}/empleados`, {
            cache: "no-store",
        });

        if (!resp.ok) return null;

        const data: iGetEmpleados[] = await resp.json();
        return data;
    } catch (error) {
        console.log("Error al obtener empleados: ", error);
    }
};