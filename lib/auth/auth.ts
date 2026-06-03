import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import AzureADProvider from "next-auth/providers/azure-ad";
import { login, oauth } from "../api/auth.api";

export const authOptions: NextAuthOptions = {
  pages: {
    signIn: "/login",
    error: "/random",
  },

  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        name: { label: "Name", type: "text" },
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password required");
        }

        try {
          const user = await login({
            email: credentials.email,
            password: credentials.password,
          });

          if (!user) return null;

          return user;
        } catch {
          return null;
        }
      },
    }),

    Google({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),

    AzureADProvider({
      clientId: process.env.MICROSOFT_CLIENT_ID as string,
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET as string,
      tenantId: process.env.MICROSOFT_TENANT_ID as string,
    }),
  ],

  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "credentials") {
        return true;
      }

      const providerAccountId = account?.providerAccountId;

      if (!account?.provider || !providerAccountId || !user?.email) {
        console.error("OAuth API Error: Missing required OAuth data");
        return false;
      }

      try {
        const backendUser = await oauth({
          user,
          account,
          providerAccountId,
        });

        if (!backendUser) return false;

        user.id = backendUser.id;
        user.name = backendUser.name;
        user.email = backendUser.email;
        user.image = backendUser.image;
        user.role = backendUser.role;
        user.authProvider = backendUser.authProvider;
        user.accessToken = backendUser.accessToken;

        return true;
      } catch (error) {
        console.error("OAuth API Error:", error);
        return false;
      }
    },

    async jwt({ token, user, account }) {
      if (user) token.user = user as any;
      if (account) token.accessToken = (account as any).access_token;
      return token;
    },

    async session({ session, token }) {
      if (token.user) {
        session.user = token.user;
      }

      session.accessToken = token.accessToken;

      return session;
    },
  },

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },

  secret: process.env.NEXTAUTH_SECRET,
};