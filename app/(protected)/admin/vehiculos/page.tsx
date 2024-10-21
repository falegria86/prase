import { getAllClientes } from '@/actions/ClientesActions';
import { getAllVehiculos } from '@/actions/vehiculoActions';
import { NuevoVehiculoForm } from '@/components/admin/catalogos/vehiculos/NuevoVehiculoForm';
import { TableVehiculos } from '@/components/admin/catalogos/vehiculos/TablaVehiculos';
import { Suspense } from 'react';

export default async function Vehiculos() {
    const vehiculos = await getAllVehiculos();
    const clientes = await getAllClientes();
    return (
        <Suspense fallback={<div>Cargando...</div>}>

            <h2 className="text-3xl font-bold mb-6">Vehículo</h2>

            {vehiculos && vehiculos.length > 0 ? (
                <TableVehiculos vehiculos={vehiculos} />
            ) : (
                <h4 className="text-red-500">Hubo un error al obtener los vehículos.</h4>
            )}

            <h3 className="text-2xl font-bold mt-16 mb-6">Nuevo Vehículo</h3>
            <NuevoVehiculoForm
                clientes={clientes || []}
            />

        </Suspense>
    )
}