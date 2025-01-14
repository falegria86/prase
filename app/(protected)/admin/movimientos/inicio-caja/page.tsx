import { getEmpleados } from "@/actions/EmpleadosActionts";
import { getIniciosCaja } from "@/actions/MovimientosActions"
import { getUsuarios } from "@/actions/SeguridadActions";
import { NuevoInicioCajaForm } from "@/components/admin/movimientos/NuevoInicioCajaForm";
import { TableIniciosCaja } from "@/components/admin/movimientos/TableIniciosCaja";
import { currentUser } from "@/lib/auth";

export default async function IniciosCajaPage() {
    const user = await currentUser();
    const usuarioAutorizoID = user?.usuario.UsuarioID;

    if (!usuarioAutorizoID) {
        return (
            <h4 className="text-red-500">Error al obtener información del usuario actual, intente nuevamente.</h4>
        )
    }

    const usuarios = await getUsuarios();

    if (!usuarios || usuarios.length === 0) {
        return (
            <h4 className="text-red-500">Error al obtener información de empleados, intente nuevamente.</h4>
        )
    }

    const iniciosCaja = await getIniciosCaja();
    if (!iniciosCaja) {
        return (
            <h4 className="text-red-500">Error al obtener inicios caja, intente nuevamente.</h4>
        )
    }

    if (iniciosCaja.length === 0) {
        return (
            <h4 className="text-red-500">No existen inicios de caja registrados.</h4>
        )
    }

    return (
        <>
            <h2 className="text-3xl font-bold mb-6">Inicios de caja</h2>
            <TableIniciosCaja
                iniciosCaja={iniciosCaja}
            />

            <h2 className="text-3xl font-bold mt-8 mb-6">Crear un nuevo inicio de caja</h2>
            <NuevoInicioCajaForm
                usuarioAutorizoId={usuarioAutorizoID}
                usuarios={usuarios}
            />
        </>
    )
}