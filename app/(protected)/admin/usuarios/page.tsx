import { getGroups, getUsuarios } from "@/actions/SeguridadActions";
import { RegistrarForm } from "@/components/admin/usuarios/RegistrarForm";
import { TableUsuarios } from "@/components/admin/usuarios/TableUsuarios";

export default async function UsuariosPage() {
    const groups = await getGroups();
    const usuarios = await getUsuarios();

    if (!groups || groups.length === 0) {
        return <h4 className="text-red-500">Hubo un error al obtener los datos.</h4>;
    }

    if (!usuarios || usuarios.length === 0) {
        return <h4 className="text-red-500">Hubo un error al obtener los usuarios.</h4>;
    }
    
    return (
        <>
            <h2 className="text-3xl font-bold mb-6">Usuarios</h2>
            <TableUsuarios
                usuarios={usuarios}
                grupos={groups}
            />

            <h2 className="text-3xl font-bold mt-16 mb-6">Registrar nuevo usuario</h2>
            <RegistrarForm
                groups={groups}
            />
        </>
    )
}