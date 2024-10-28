"use server";

const url = process.env.API_URL;

// Función para obtener sugerencias de autocompletar desde tu API de Geoapify
export const getAutocompleteSuggestions = async (query: string) => {
    try {
        const resp = await fetch(`${url}/geoapify/autocomplete?query=${encodeURIComponent(query)}`, {
            cache: 'no-store'
        });

        if (!resp.ok) return null;

        const data = await resp.json();
        return data.features; // Asegúrate de que 'features' es lo que necesitas en tu aplicación
    } catch (error) {
        console.log('Error al obtener sugerencias de autocompletar: ', error);
        return null;
    }
};
