// import type { NextAuthOptions } from "next-auth";
// import Credentials from "next-auth/providers/credentials";
// import Google from "next-auth/providers/google";
// import AzureADProvider from "next-auth/providers/azure-ad";


import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import AzureADProvider from "next-auth/providers/azure-ad";
import { login, oauth } from "../api/auth.api";
import api from "../axios/axios";

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
          const user = await login({ email: credentials.email, password: credentials.password });
          if (!user) return null;
          return user;
        } catch (error) {
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



    async signIn({user,account}){

      if (account?.provider === "credentials") {
        return true;
      }

      const providerAccountId : string = (account?.providerAccountId ?? account?.id) as string;

      if (!account?.provider || !providerAccountId || !user?.email) {
        console.error("OAuth API Error: Missing required OAuth data", {
          provider: account?.provider,
          providerAccountId,
          email: user?.email,
        });
        return false;
      }

      try {
  
       return await oauth({user,account,providerAccountId});

        // return true;
      } catch (error) {
        console.error("OAuth API Error:", error);
        return false;
      }
    },
    async jwt({ token, user, account }) {
      console.log(user,account);
      
      if (user) token.user = user;
      if (account) token.accessToken = (account as any).access_token;
      return token;
    },

    async session({ session, token }) {
      session.user = token.user as any;
      (session as any).accessToken = token.accessToken;
      return session;
    },
  },

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60
  },
  secret: process.env.NEXTAUTH_SECRET,

};
