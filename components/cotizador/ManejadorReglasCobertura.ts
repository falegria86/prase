import { iGetAllCobertura, iGetAllReglaNegocio } from "@/interfaces/ReglasNegocios";

interface ValoresCobertura {
    sumaAseguradaMin: number;
    sumaAseguradaMax: number;
    primaBase: number;
    deducibleMin: number;
    deducibleMax: number;
}

interface ValoresFormulario {
    Estado?: string;
    Modelo?: string;
    Marca?: string;
    marcaNombre?: string;
    Submarca?: string;
    modeloNombre?: string;
    Version?: string;
    versionNombre?: string;
    CP?: string;
    UsoVehiculo?: number;
    TipoVehiculo?: number;
    SumaAsegurada?: number;
    [key: string]: any;
}

// Función para evaluar una condición individual
const evaluarCondicion = (
    condicion: {
        Campo: string;
        Operador: string;
        Evaluacion: string;
    },
    valoresFormulario: Record<string, any>
): boolean => {
    const valorCampo = valoresFormulario[condicion.Campo];
    const valorEvaluacion = condicion.Evaluacion;

    switch (condicion.Operador) {
        case "=":
            return valorCampo === valorEvaluacion;
        case ">":
            return Number(valorCampo) > Number(valorEvaluacion);
        case "<":
            return Number(valorCampo) < Number(valorEvaluacion);
        case ">=":
            return Number(valorCampo) >= Number(valorEvaluacion);
        case "<=":
            return Number(valorCampo) <= Number(valorEvaluacion);
        default:
            return false;
    }
};

// Función principal para aplicar las reglas
export const aplicarReglasPorCobertura = (
    cobertura: iGetAllCobertura,
    reglas: iGetAllReglaNegocio[],
    valoresFormulario: ValoresFormulario,
): ValoresCobertura => {
    // Valores iniciales de la cobertura
    const valores: ValoresCobertura = {
        sumaAseguradaMin: Number(cobertura.SumaAseguradaMin),
        sumaAseguradaMax: Number(cobertura.SumaAseguradaMax),
        primaBase: Number(cobertura.PrimaBase),
        deducibleMin: Number(cobertura.DeducibleMin),
        deducibleMax: Number(cobertura.DeducibleMax)
    };

    // Filtrar reglas aplicables a esta cobertura
    const reglasAplicables = reglas.filter(
        regla =>
            regla.Activa &&
            (regla.EsGlobal || regla.cobertura?.CoberturaID === cobertura.CoberturaID)
    );

    // Aplicar cada regla
    reglasAplicables.forEach(regla => {
        // Verificar si todas las condiciones de la regla se cumplen
        const condicionesCumplidas = regla.condiciones.every(
            condicion => evaluarCondicion(condicion, valoresFormulario)
        );

        if (condicionesCumplidas) {
            const valorAjuste = Number(regla.condiciones[0]?.Valor || 0);

            switch (regla.TipoRegla) {
                case "SumaAsegurada":
                    valores.sumaAseguradaMin = valorAjuste;
                    valores.sumaAseguradaMax = valorAjuste;
                    break;
                case "Prima":
                    valores.primaBase = valorAjuste;
                    break;
                case "Deducible":
                    valores.deducibleMin = valorAjuste;
                    valores.deducibleMax = valorAjuste;
                    break;
            }
        }
    });

    return valores;
};