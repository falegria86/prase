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