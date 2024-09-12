import AppLayout from '../../components/AppLayout'
import Cotizador from '../../components/Cotizador'

export default function CotizadorPage() {
    return (
        <AppLayout>
            <h2 className="text-3xl font-bold mb-6">Cotizador</h2>
            <Cotizador />
        </AppLayout>
    )
}