import { getAllReglasNegocio } from "@/actions/ReglasNegocio"
import { NuevaReglaForm } from "@/components/admin/catalogos/reglas-negocios/NuevaReglaForm";
import { TableReglasNegocio } from "@/components/admin/catalogos/reglas-negocios/TableReglasNegocio";

export default async function ReglasNegocioPage() {
    const reglas = await getAllReglasNegocio();

    return (
        <>
            <h2 className="text-3xl font-bold mb-6">Reglas de negocio</h2>

            {reglas && reglas.length > 0 ? (
                <TableReglasNegocio
                    reglas={reglas}
                />
            ) : (
                <h4 className="text-red-500">Hubo un error al obtener las reglas de negocio.</h4>
            )}

            <h3 className="text-2xl font-bold mt-16 mb-6">Nueva Regla de Negocio</h3>
            <NuevaReglaForm />

        </>
    )
}