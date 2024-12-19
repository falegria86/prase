import { getEmpleados } from "@/actions/EmpleadosActionts";
import { getGroups, getUsuarios } from "@/actions/SeguridadActions";
import { RegistrarForm } from "@/components/admin/usuarios/RegistrarForm";
import { TableUsuarios } from "@/components/admin/usuarios/TableUsuarios";

export default async function UsuariosPage() {
    const groups = await getGroups();
    const usuarios = await getUsuarios();
    const empleados = await getEmpleados();

    if (!groups || groups.length === 0) {
        return <h4 className="text-red-500">Hubo un error al obtener los datos.</h4>;
    }

    return (
        <>
            {usuarios ? (
                <>
                    {usuarios.length > 0 ? (
                        <>
                            <h2 className="text-3xl font-bold mb-6">Usuarios</h2>
                            <TableUsuarios
                                usuarios={usuarios}
                                grupos={groups}
                            />
                        </>
                    ) : (
                        <h4 className="text-red-500">No existen usuarios registrados.</h4>
                    )}
                </>
            ) : (
                <h4 className="text-red-500">Hubo un error al obtener los usuarios.</h4>
            )}

            {(!groups || !empleados || empleados.length === 0) ? (
                <h4 className="text-red-500">Hubo un error al obtener los datos necesarios para registar usuario.</h4>
            ) : (
                <>
                    <h2 className="text-3xl font-bold mt-16 mb-6">Registrar nuevo usuario</h2>
                    <RegistrarForm
                        groups={groups}
                        empleados={empleados}
                    />
                </>
            )}
        </>
    )
}