import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { IGetAllCorteDia } from "@/interfaces/CorteDelDiaInterface"
import { ArrowDownCircle, ArrowUpCircle, Calculator, ClipboardList, CreditCard, DollarSign, Info } from "lucide-react"
import type React from "react"

interface CorteDelDiaModalProps {
    corte: IGetAllCorteDia
    onClose: () => void
}

export function CorteUsuarioModal({ corte, onClose }: CorteDelDiaModalProps) {
    const formatCurrency = (amount: string) => {
        return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(Number.parseFloat(amount))
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString("es-MX", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        })
    }

    const SectionTitle = ({ icon, title }: { icon: React.ReactNode; title: string }) => (
        <div className="flex items-center space-x-2 mb-2">
            {icon}
            <h3 className="font-semibold">{title}</h3>
        </div>
    )

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Detalles del Corte #{corte.CorteUsuarioID}</DialogTitle>
                    <DialogDescription>Fecha del Corte: {formatDate(corte.FechaCorte)}</DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <SectionTitle icon={<Info className="w-5 h-5" />} title="Información General" />
                        <p>
                            <strong>Fecha Actualización:</strong> {formatDate(corte.FechaActualizacion)}
                        </p>
                        <p>
                            <strong>Estatus:</strong> {corte.Estatus}
                        </p>
                        <p>
                            <strong>Observaciones:</strong> {corte.Observaciones || "N/A"}
                        </p>
                    </div>
                    <div>
                        <SectionTitle icon={<DollarSign className="w-5 h-5" />} title="Totales" />
                        <p>
                            <strong>Total Ingresos:</strong> {formatCurrency(corte.TotalIngresos)}
                        </p>
                        <p>
                            <strong>Total Egresos:</strong> {formatCurrency(corte.TotalEgresos)}
                        </p>
                        <p>
                            <strong>Saldo Esperado:</strong> {formatCurrency(corte.SaldoEsperado)}
                        </p>
                        <p>
                            <strong>Saldo Real:</strong> {formatCurrency(corte.SaldoReal)}
                        </p>
                        <p>
                            <strong>Diferencia:</strong> {formatCurrency(corte.Diferencia)}
                        </p>
                    </div>
                    <Separator className="col-span-full my-4" />
                    <div>
                        <SectionTitle icon={<ArrowDownCircle className="w-5 h-5" />} title="Desglose de Ingresos" />
                        <p>
                            <strong>Efectivo:</strong> {formatCurrency(corte.TotalIngresosEfectivo)}
                        </p>
                        <p>
                            <strong>Tarjeta:</strong> {formatCurrency(corte.TotalIngresosTarjeta)}
                        </p>
                        <p>
                            <strong>Transferencia:</strong> {formatCurrency(corte.TotalIngresosTransferencia)}
                        </p>
                    </div>
                    <div>
                        <SectionTitle icon={<ArrowUpCircle className="w-5 h-5" />} title="Desglose de Egresos" />
                        <p>
                            <strong>Efectivo:</strong> {formatCurrency(corte.TotalEgresosEfectivo)}
                        </p>
                        <p>
                            <strong>Tarjeta:</strong> {formatCurrency(corte.TotalEgresosTarjeta)}
                        </p>
                        <p>
                            <strong>Transferencia:</strong> {formatCurrency(corte.TotalEgresosTransferencia)}
                        </p>
                    </div>
                    <Separator className="col-span-full my-4" />
                    <div>
                        <SectionTitle icon={<CreditCard className="w-5 h-5" />} title="Totales por Método de Pago" />
                        <p>
                            <strong>Total Efectivo:</strong> {formatCurrency(corte.TotalEfectivo)}
                        </p>
                        <p>
                            <strong>Total Tarjeta:</strong> {formatCurrency(corte.TotalPagoConTarjeta)}
                        </p>
                        <p>
                            <strong>Total Transferencia:</strong> {formatCurrency(corte.TotalTransferencia)}
                        </p>
                    </div>
                    <div>
                        <SectionTitle icon={<Calculator className="w-5 h-5" />} title="Totales Capturados" />
                        <p>
                            <strong>Efectivo Capturado:</strong> {formatCurrency(corte.TotalEfectivoCapturado)}
                        </p>
                        <p>
                            <strong>Tarjeta Capturada:</strong> {formatCurrency(corte.TotalTarjetaCapturado)}
                        </p>
                        <p>
                            <strong>Transferencia Capturada:</strong> {formatCurrency(corte.TotalTransferenciaCapturado)}
                        </p>
                    </div>
                    <Separator className="col-span-full my-4" />
                    <div className="col-span-full">
                        <SectionTitle icon={<ClipboardList className="w-5 h-5" />} title="Información de Inicio de Caja" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p>
                                    <strong>ID de Inicio:</strong> {corte.InicioCaja.InicioCajaID}
                                </p>
                                <p>
                                    <strong>Fecha de Inicio:</strong> {formatDate(corte.InicioCaja.FechaInicio)}
                                </p>
                                <p>
                                    <strong>Fecha de Actualización:</strong> {formatDate(corte.InicioCaja.FechaActualizacion)}
                                </p>
                                <p>
                                    <strong>Estatus:</strong> {corte.InicioCaja.Estatus}
                                </p>
                            </div>
                            <div>
                                <p>
                                    <strong>Monto Inicial:</strong> {formatCurrency(corte.InicioCaja.MontoInicial)}
                                </p>
                                <p>
                                    <strong>Total Efectivo:</strong> {formatCurrency(corte.InicioCaja.TotalEfectivo)}
                                </p>
                                <p>
                                    <strong>Total Transferencia:</strong> {formatCurrency(corte.InicioCaja.TotalTransferencia)}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

