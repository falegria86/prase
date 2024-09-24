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
                };
            }
            return session;
        },

        async jwt({ token, user }) {
            if (user) {
                token.access_token = user.jwt;
            }

            return token;
        },
    },

    session: { strategy: "jwt" },
    trustHost: process.env.NODE_ENV === 'production' ? true : false,
    ...authConfig,
});
