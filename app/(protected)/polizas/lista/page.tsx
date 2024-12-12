import { getCoberturas } from "@/actions/CatCoberturasActions";
import { getTipoPagos } from "@/actions/CatTipoPagos";
import { getPolizas } from "@/actions/PolizasActions"
import TablaPolizas from "@/components/admin/polizas/TablaPolizas";

export default async function ListaPolizasPage() {
    const polizas = await getPolizas();
    const coberturas = await getCoberturas();

    if (!polizas || polizas.length === 0) {
        return (
            <div>No se pudieron obtener los datos de pólizas.</div>
        )
    }

    if (!coberturas || coberturas.length === 0) {
        return (
            <div>No se pudieron obtener los datos de coberturas.</div>
        )
    }

    return (
        <>
            <TablaPolizas
                polizas={polizas}
                coberturas={coberturas}
            />
        </>
    )
}