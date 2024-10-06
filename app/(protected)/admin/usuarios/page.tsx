import { getGroups } from "@/actions/SeguridadActions";
import { RegistrarForm } from "@/components/admin/usuarios/RegistrarForm";

export default async function UsuariosPage() {
    const groups = await getGroups();

    if (!groups || groups.length === 0) {
        return <h4 className="text-red-500">Hubo un error al obtener los datos.</h4>;
    }
    return (
        <>
            <h2 className="text-3xl font-bold mb-6">Registrar usuario</h2>
            <RegistrarForm
                groups={groups}
            />
        </>
    )
}