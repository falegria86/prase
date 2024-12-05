import NextAuth from "next-auth";
import authConfig from "./auth.config";

export const {
    handlers: { GET, POST },
    auth,
    signIn,
    signOut,
} = NextAuth({
    pages: {
        signIn: "/login",
        error: "/error",
    },

    callbacks: {
        async signIn({ user }) {
            return user ? true : false;
        },

        async session({ session, token }) {
            if (token) {
                session.user = {
                    ...session.user,
                    jwt: token.access_token as string,
                    aplicaciones: token.aplicaciones || [],
                };
            }
            return session;
        },

        async jwt({ token, user }) {
            if (user) {
                token.access_token = user.jwt;
                token.aplicaciones = user.aplicaciones;
            }

            return token;
        },
    },

    session: { strategy: "jwt" },
    ...authConfig,
});
