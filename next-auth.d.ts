import { UserRole } from "@prisma/client";
import NextAuth, { type DefaultSession } from "next-auth"

export type ExtendedUser = DefaultSession["user"] & {
    role: UserRole;
};

interface CustomUser extends DefaultUser {
    jwt: string;
}

declare module "next-auth" {
    interface Session {
        user: CustomUser & DefaultSession["user"];
    }

    interface User extends CustomUser { }
}

declare module "next-auth/jwt" {
    interface JWT {
        access_token?: string;
    }
}