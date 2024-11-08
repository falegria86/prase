import { getTiposSumasAseguradas } from "@/actions/CatSumasAseguradasActions";
import { getTipoPagos } from "@/actions/CatTipoPagos";
import { getTiposVehiculo, getUsoVehiculo } from "@/actions/CatVehiculosActions";
import { getConfiguracionGlobalByName } from "@/actions/ConfiguracionGlobal";
import { getAnios, loginAuto } from "@/actions/LibroAzul";
import Cotizador from "@/components/cotizador/Cotizador";

export default async function NuevaCotizacionPage() {
    const fetchData = async () => {
        try {
            const [
                tiposVehiculo,
                usosVehiculo,
                tiposPagos,
                keyAuto,
                tiposSumas,
                derechoPoliza,
            ] = await Promise.all(
                [
                    getTiposVehiculo(),
                    getUsoVehiculo(),
                    getTipoPagos(),
                    loginAuto(),
                    getTiposSumasAseguradas(),
                    getConfiguracionGlobalByName("Derecho de poliza")
                ]);
            return { tiposVehiculo, usosVehiculo, tiposPagos, keyAuto, tiposSumas, derechoPoliza };
        } catch (error) {
            console.log("Error al obtener tipos y usos de vehiculo: ", error);
            return {
                tiposVehiculo: [],
                usosVehiculo: [],
                tiposPagos: [],
                tiposSumas: [],
                derechoPoliza: null,
            }
        }
    }

    const { tiposVehiculo, usosVehiculo, tiposPagos, keyAuto, tiposSumas, derechoPoliza } = await fetchData();
    if (!tiposVehiculo || tiposVehiculo.length === 0 || !usosVehiculo || usosVehiculo.length === 0 || !keyAuto || !tiposPagos || tiposPagos.length === 0 || !tiposSumas || tiposSumas.length === 0) {
        return (
            <div>
                Ha ocurrido un error al obtener los datos necesarios.
            </div>
        )
    }

    const years = await getAnios(keyAuto);

    if (!years) {
        return (
            <div>
                Hubo un error al obtener los años de los vehículos.
            </div>
        )
    }

    return (
        <>
            <h2 className="text-3xl font-bold mb-6">Cotizador</h2>
            <Cotizador
                apiKey={keyAuto}
                tiposVehiculo={tiposVehiculo}
                usosVehiculo={usosVehiculo}
                years={years}
                // tiposPagos={tiposPagos}
                usuarioID={1} //TODO: Cambiar por el que retorne el login
                tiposSumas={tiposSumas}
                derechoPoliza={derechoPoliza?.ValorConfiguracion ?? "0"}
            />
        </>
    )
}