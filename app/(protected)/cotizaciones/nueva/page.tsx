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
            ] = await Promise.all([
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
            throw new Error("No se pudo obtener uno o más recursos necesarios para cargar la página.");
        }
    };

    let tiposVehiculo, usosVehiculo, tiposPagos, keyAuto, tiposSumas, derechoPoliza;

    try {
        ({ tiposVehiculo, usosVehiculo, tiposPagos, keyAuto, tiposSumas, derechoPoliza } = await fetchData());
    } catch (error) {
        return (
            <div className="text-red-600">
                <h2>Error al cargar los datos</h2>
                <p>Por favor, intenta recargar la página o contacta a soporte si el problema persiste.</p>
            </div>
        );
    }

    if (!tiposVehiculo || tiposVehiculo.length === 0) {
        return (
            <div className="text-red-600">
                <h2>Error al obtener los tipos de vehículo</h2>
                <p>No se pudo cargar la información de tipos de vehículo. Intenta recargar la página.</p>
            </div>
        );
    }

    if (!usosVehiculo || usosVehiculo.length === 0) {
        return (
            <div className="text-red-600">
                <h2>Error al obtener los usos de vehículo</h2>
                <p>No se pudo cargar la información de usos de vehículo. Intenta recargar la página.</p>
            </div>
        );
    }

    if (!tiposPagos || tiposPagos.length === 0) {
        return (
            <div className="text-red-600">
                <h2>Error al obtener los tipos de pago</h2>
                <p>No se pudo cargar la información de tipos de pago. Intenta recargar la página.</p>
            </div>
        );
    }

    if (!keyAuto) {
        return (
            <div className="text-red-600">
                <h2>Error en la autenticación de Libro Azul</h2>
                <p>No se pudo obtener la clave de autenticación. Intenta recargar la página.</p>
            </div>
        );
    }

    if (!tiposSumas || tiposSumas.length === 0) {
        return (
            <div className="text-red-600">
                <h2>Error al obtener las sumas aseguradas</h2>
                <p>No se pudo cargar la información de sumas aseguradas. Intenta recargar la página.</p>
            </div>
        );
    }

    const years = await getAnios(keyAuto);

    if (!years) {
        return (
            <div className="text-red-600">
                <h2>Error al obtener los años de los vehículos</h2>
                <p>No se pudo cargar la lista de años de los vehículos. Intenta recargar la página.</p>
            </div>
        );
    }

    return (
        <>
            <h2 className="text-3xl font-bold mb-6">Cotizador</h2>
            <Cotizador
                apiKey={keyAuto}
                tiposVehiculo={tiposVehiculo}
                usosVehiculo={usosVehiculo}
                years={years}
                usuarioID={1} //TODO: Cambiar por el que retorne el login
                tiposSumas={tiposSumas}
                derechoPoliza={derechoPoliza?.ValorConfiguracion ?? "0"}
            />
        </>
    );
}
