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
    NombreUsuario: string;
}

export function OpcionesCaja({ usuarioId, NombreUsuario }: OpcionesCajaProps) {
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

    return (
        <>
            {inicioCajaActivo && (
                <div className="px-4 py-2">
                    <Button
                        variant="outline"
                        className="w-full rounded-lg"
                        onClick={() => {
                            setModalInicioCajaAbierto(true);
                            console.log("Inicio de caja abierto")
                        }}
                    >
                        <DollarSign className="mr-2 h-4 w-4" />
                        {inicioCajaActivo ? "Inicio de Caja Activo" : "Iniciar Caja"}
                    </Button>
                </div>
            )}
            <div className="px-4 py-2">
                <Button
                    variant="outline"
                    className="w-full rounded-lg"
                    onClick={() => setModalCorteAbierto(true)}
                >
                    <FaCut className="mr-2 h-4 w-4" />
                    Corte del Día
                </Button>
            </div>


            {inicioCajaActivo && (
                <InicioCajaActivoModal
                    inicioCaja={inicioCajaActivo}
                    abierto={modalInicioCajaAbierto}
                    alCerrar={() => setModalInicioCajaAbierto(false)}
                    alAceptar={manejarActualizacionInicioCaja}
                />
            )}

            <ModalCorteCaja
                abierto={modalCorteAbierto}
                alCerrar={() => setModalCorteAbierto(false)}
                usuarioId={usuarioId}
                NombreUsuario={NombreUsuario}
            />
        </>
    );
}