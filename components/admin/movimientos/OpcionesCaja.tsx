"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { DollarSign } from "lucide-react";
import { FaCut } from "react-icons/fa";
import { getInicioActivo } from "@/actions/MovimientosActions";
import { iGetInicioActivo } from "@/interfaces/MovimientosInterface";
import { ModalCorteCaja } from "./ModalCorteCaja";
import { InicioCajaActivoModal } from "@/components/inicios-caja/InicioCajaActivoModal";

interface OpcionesCajaProps {
    usuarioId: number;
}

export function OpcionesCaja({ usuarioId }: OpcionesCajaProps) {
    const [inicioCajaActivo, setInicioCajaActivo] = useState<iGetInicioActivo | null>(null);
    const [modalInicioCajaAbierto, setModalInicioCajaAbierto] = useState(false);
    const [modalCorteAbierto, setModalCorteAbierto] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const obtenerInicioCaja = async () => {
            const respuesta = await getInicioActivo(usuarioId);
            if (respuesta && !('statusCode' in respuesta)) {
                setInicioCajaActivo(respuesta);
            }
        };

        if (usuarioId) {
            obtenerInicioCaja();
        }
    }, [usuarioId]);

    const manejarActualizacionInicioCaja = async () => {
        setModalInicioCajaAbierto(false);
        const respuesta = await getInicioActivo(usuarioId);
        if (respuesta && !('statusCode' in respuesta)) {
            setInicioCajaActivo(respuesta);
        }
        router.refresh();
    };

    if (!inicioCajaActivo) return null;

    return (
        <>
            <div className="px-4 py-2">
                <Button
                    variant="outline"
                    className="w-full rounded-lg"
                    onClick={() => setModalInicioCajaAbierto(true)}
                >
                    <DollarSign className="mr-2 h-4 w-4" />
                    Inicio de Caja Activo
                </Button>
            </div>

            {inicioCajaActivo.FirmaElectronica && (
                <div className="px-4 py-2">
                    <Button
                        variant="outline"
                        className="w-full rounded-lg"
                        onClick={() => setModalCorteAbierto(true)}
                    >
                        <FaCut className="mr-2 h-4 w-4" />
                        Corte del dia
                    </Button>
                </div>
            )}

            <InicioCajaActivoModal
                inicioCaja={inicioCajaActivo}
                abierto={modalInicioCajaAbierto}
                alCerrar={() => setModalInicioCajaAbierto(false)}
                alAceptar={manejarActualizacionInicioCaja}
            />

            <ModalCorteCaja
                abierto={modalCorteAbierto}
                alCerrar={() => setModalCorteAbierto(false)}
                usuarioId={usuarioId}
                inicioCajaActivoID={inicioCajaActivo}
            />
        </>
    );
}