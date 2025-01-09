// page.tsx
import { getCoberturas } from "@/actions/CatCoberturasActions";
import { getAllClientes } from "@/actions/ClientesActions";
import { getPolizas, getDocumentos, getMetodosPago, getStatusPagos } from "@/actions/PolizasActions"
import TablaPolizas from "@/components/admin/polizas/TablaPolizas";

export default async function ListaPolizasPage() {
    const [polizas, coberturas, metodosPago, statusPago, clientes] = await Promise.all([
        getPolizas(),
        getCoberturas(),
        getMetodosPago(),
        getStatusPagos(),
        getAllClientes(),
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

    if (!metodosPago || metodosPago.length === 0) {
        return (
            <div>No se pudieron obtener los métodos de pago.</div>
        )
    }

    if (!statusPago || statusPago.length === 0) {
        return (
            <div>No se pudieron obtener los estatus de pago.</div>
        )
    }

    if(!clientes || clientes.length === 0){
        return (
            <div>No se pudo obtener la lista de clientes.</div>
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
                metodosPago={metodosPago}
                statusPago={statusPago}
                clientes={clientes}
            />
        </>
    )
}