// page.tsx
import { getCoberturas } from "@/actions/CatCoberturasActions";
import { getPolizas, getDocumentos } from "@/actions/PolizasActions"
import TablaPolizas from "@/components/admin/polizas/TablaPolizas";

export default async function ListaPolizasPage() {
    const [polizas, coberturas] = await Promise.all([
        getPolizas(),
        getCoberturas()
    ]);

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

    const polizasConDocumentos = await Promise.all(
        polizas.map(async (poliza) => {
            const documentos = await getDocumentos(poliza.PolizaID);
            return {
                ...poliza,
                tieneDocumentos: documentos ? documentos.length > 0 : false
            };
        })
    );

    return (
        <>
            <h2 className="text-3xl font-bold mb-6">Pólizas</h2>
            <TablaPolizas
                polizas={polizasConDocumentos}
                coberturas={coberturas}
            />
        </>
    )
}