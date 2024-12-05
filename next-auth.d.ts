import NextAuth, { DefaultSession, DefaultUser } from "next-auth";
import "next-auth/jwt";

export interface Aplicaciones {
  aplicacionId: number;
  nombre: string;
  descripcion: string;
  icon: null;
  color: null;
  categoria: string;
  ingresar: boolean;
  insertar: boolean;
  eliminar: boolean;
  actualizar: boolean;
}

interface CustomUser extends DefaultUser {
  jwt: string;
  aplicaciones: Aplicaciones[];
}

declare module "next-auth" {
  interface Session {
    user: CustomUser & DefaultSession["user"];
  }

  interface User extends CustomUser {}
}

declare module "next-auth/jwt" {
  interface JWT {
    access_token?: string;
    aplicaciones: Aplicaciones[];
  }
}
