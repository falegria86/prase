import { getCoberturas } from "@/actions/CatCoberturasActions";
import { NuevaCoberturaForm } from "@/components/admin/catalogos/coberturas/NuevaCoberturaForm";
import { TableCoberturas } from "@/components/admin/catalogos/coberturas/TableCoberturas";

export default async function CatalogoPaquetesPage() {
    const coberturas = await getCoberturas();

    return (
        <>
            <h2 className="text-3xl font-bold mb-6">Catálogo de Coberturas</h2>

            {coberturas && coberturas.length > 0 ? (
                <TableCoberturas
                    coberturas={coberturas}
                />
            ) : (
                <h4 className="text-red-500">Hubo un error al obtener los paquetes.</h4>
            )}

            <h3 className="text-2xl font-bold mt-16 mb-6">Nuevo Paquete</h3>
            <NuevaCoberturaForm />
        </>
    )
}