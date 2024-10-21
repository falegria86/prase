export interface iGetGroups {
    id: number;
    nombre: string;
    descripcion: string;
}

export interface iPostGroup {
    nombre: string;
    descripcion: string;
}

export interface iPatchGroup {
    nombre?: string;
    descripcion?: string;
}

export interface iGetApplications {
    id: number;
    nombre: string;
    descripcion: string;
}

export interface iPostApplication {
    nombre: string;
    descripcion: string;
}

export interface iPostApplicationResp {
    nombre: string;
    descripcion: string;
    id: number;
}

export interface iPatchApplication {
    nombre?: string;
    descripcion?: string;
}

export interface iPostUsuario {
    username: string;
    password: string;
    idGroup: number;
}

export interface iApplication {
    id: number;
    ingresar: boolean;
    insertar: boolean;
    eliminar: boolean;
    actualizar: boolean;
}

export interface iGetApplicationGroup {
    id: number;
    ingresar: boolean;
    insertar: boolean;
    eliminar: boolean;
    actualizar: boolean;
    aplicaciones: iGetApplications;
    grupos: iGetGroups | null;
}

export interface iPostApplicationGroup {
    aplicaciones: iApplication[];
}

export interface iPatchApplicationGroup {
    aplicaciones: iApplication[];
}

export interface iDeleteApplicationGroup {
    aplicacionesIds: number[];
}