import { getPolizas } from "@/actions/PolizasActions"

export default async function PolizasPage() {
    const polizas = await getPolizas();

    console.log(polizas)

    return (
        <div>Pólizas</div>
    )
}