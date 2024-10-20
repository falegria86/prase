
import { Suspense } from 'react'

export default async function Vehiculos() {
    return (
        <Suspense fallback={<div>Cargando...</div>}>

            hola
        </Suspense>
    )
}