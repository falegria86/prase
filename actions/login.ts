"use server";

import { AuthError } from "next-auth";

import * as z from "zod";

import { signIn } from "@/auth"
import { LoginSchema } from "@/schemas/loginSchema";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";

export const login = async (
    values: z.infer<typeof LoginSchema>,
) => {
    const validatedFields = LoginSchema.safeParse(values);

    if (!validatedFields.success) {
        return { error: "Todos los campos son requeridos." };
    }

    const { username, password } = validatedFields.data;

    try {
        await signIn("credentials", {
            username,
            password,
            redirectTo: DEFAULT_LOGIN_REDIRECT
        });
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case "CredentialsSignin":
                    return { error: "Nombre de usuario o contraseña incorrecta" }
                default:
                    return { error: "¡Oops! Algo ha salido mal", message: error }
            }
        }

        throw error;
    }
}