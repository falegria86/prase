"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { IGetAllCorteDia } from "@/interfaces/CorteDelDiaInterface"
import { ArrowUpCircle, Calendar, Clock, DollarSign, Eye, Scale } from "lucide-react"
import { useState } from "react"
import { CorteUsuarioModal } from "./CorteDelDiaModal"

interface TablaCortesDelDiaProps {
    CortesDelDia: IGetAllCorteDia[]
}

export const TablaCortesDelDia = ({ CortesDelDia }: TablaCortesDelDiaProps) => {

    const [selectedCorte, setSelectedCorte] = useState<IGetAllCorteDia | null>(null)

    const formatCurrency = (amount: string) => {
        return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(Number.parseFloat(amount))
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString("es-MX", {
            year: "numeric",
            month: "long",
            day: "numeric",
        })
    }

    const formatTime = (dateString: string) => {
        return new Date(dateString).toLocaleString("es-MX", {
            hour: "2-digit",
            minute: "2-digit",
        })
    }

    return (
        <>
            <div className="container mx-auto p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {CortesDelDia.map((corte) => (
                        <Card key={corte.CorteUsuarioID}>
                            <CardHeader>
                                <CardTitle>Corte #{corte.CorteUsuarioID}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="flex items-center">
                                    <Calendar className="w-4 h-4 mr-2" />
                                    <strong className="mr-1">Fecha: </strong> {formatDate(corte.FechaCorte)}
                                </p>
                                <p className="flex items-center">
                                    <Clock className="w-4 h-4 mr-2" />
                                    <strong className="mr-1">Hora: </strong> {formatTime(corte.FechaCorte)}
                                </p>
                                <p className="flex items-center">
                                    <ArrowUpCircle className="w-4 h-4 mr-2" /> <strong className="mr-1">Total Egresos: </strong>
                                    {formatCurrency(corte.TotalEgresos)}
                                </p>
                                <p className="flex items-center">
                                    <Scale className="w-4 h-4 mr-2" /> <strong className="mr-1">Saldo Esperado: </strong>
                                    {formatCurrency(corte.SaldoEsperado)}
                                </p>
                                <p className="flex items-center">
                                    <Scale className="w-4 h-4 mr-2" /> <strong className="mr-1">Saldo Real: </strong> {formatCurrency(corte.SaldoReal)}
                                </p>
                                <p className="flex items-center">
                                    <DollarSign className="w-4 h-4 mr-2" /> <strong className="mr-1">Estatus: </strong> {corte.Estatus}
                                </p>
                                <Button className="mt-2 w-full" onClick={() => setSelectedCorte(corte)}>
                                    <Eye className="mr-2 h-4 w-4" /> Ver Detalles
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
                {selectedCorte && <CorteUsuarioModal corte={selectedCorte} onClose={() => setSelectedCorte(null)} />}
            </div>
        </>
    )
}