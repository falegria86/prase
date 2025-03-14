import { getCortesDelDiaAdmin } from "@/actions/CorteDelDiaActions";
import { NuevoCorteDelDiaForm } from "@/components/admin/movimientos/NuevoCorteDelDiaForm";
import { TablaCortesDelDia } from "@/components/admin/movimientos/TablaCortesDelDia";
import { currentUser } from "@/lib/auth";

export default async function CortesDelDia() {
    const user = await currentUser();
    const usuarioAutorizoID = user?.usuario.UsuarioID;

    if (!usuarioAutorizoID) {
        return (
            <h4 className="text-red-500">Error al obtener información del usuario actual, intente nuevamente.</h4>
        )
    }

    const CortesDelDia = await getCortesDelDiaAdmin();
    if (!CortesDelDia) {
        return (
            <h4 className="text-red-500">Error al obtener los Cortes del Dia, intente nuevamente.</h4>
        )
    }
    return (
        <>
            {/* <h2 className="text-3xl font-bold mb-6 pt-5">Nuevo Corte del Dia</h2>
            <NuevoCorteDelDiaForm /> */}

            <h2 className="text-3xl font-bold mb-6 mt-6">Cortes</h2>
            <TablaCortesDelDia cortes={CortesDelDia} />
        </>
    )
}