"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { iGetInicioActivo } from "@/interfaces/MovimientosInterface";
import { formatCurrency } from "@/lib/format";
import { formatDateTimeFull } from "@/lib/format-date";

interface PropiedadesModal {
    inicioCaja: iGetInicioActivo;
    abierto: boolean;
    alCerrar: () => void;
}

export const InicioCajaActivoModal = ({ inicioCaja, abierto, alCerrar }: PropiedadesModal) => {
    return (
        <Dialog open={abierto} onOpenChange={alCerrar}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Inicio de Caja Activo</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <div>
                        <p className="text-sm text-muted-foreground">Fecha de inicio</p>
                        <p className="font-medium">{formatDateTimeFull(inicioCaja.FechaInicio)}</p>
                    </div>

                    <div>
                        <p className="text-sm text-muted-foreground">Monto inicial</p>
                        <p className="font-medium">{formatCurrency(Number(inicioCaja.MontoInicial))}</p>
                    </div>

                    <div>
                        <p className="text-sm text-muted-foreground">Total efectivo</p>
                        <p className="font-medium">{formatCurrency(Number(inicioCaja.TotalEfectivo))}</p>
                    </div>

                    <div>
                        <p className="text-sm text-muted-foreground">Total transferencia</p>
                        <p className="font-medium">{formatCurrency(Number(inicioCaja.TotalTransferencia))}</p>
                    </div>

                    <div>
                        <p className="text-sm text-muted-foreground">Usuario que autorizó</p>
                        <p className="font-medium">{inicioCaja.UsuarioAutorizo.NombreUsuario}</p>
                    </div>

                    <div>
                        <p className="text-sm text-muted-foreground">Firma electrónica</p>
                        <img
                            src={inicioCaja.FirmaElectronica}
                            alt="Firma electrónica"
                            className="max-h-32 mt-2"
                        />
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}