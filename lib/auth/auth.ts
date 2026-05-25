// import type { NextAuthOptions } from "next-auth";
// import Credentials from "next-auth/providers/credentials";
// import Google from "next-auth/providers/google";
// import AzureADProvider from "next-auth/providers/azure-ad";


import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import AzureADProvider from "next-auth/providers/azure-ad";
import { login } from "../api/auth.api";

// const apiUrl = process.env.NODE_API_URL || "http://localhost:4000";

// async function syncOAuthUser({
//   provider,
//   providerAccountId,
//   email,
//   name,
//   image,
// }: {
//   provider: string;
//   providerAccountId: string;
//   email: string;
//   name?: string | null;
//   image?: string | null;
// }) {
//   const res = await fetch(`${apiUrl}/api/auth/oauth`, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//       ...(process.env.INTERNAL_AUTH_SECRET
//         ? { "x-internal-secret": process.env.INTERNAL_AUTH_SECRET }
//         : {}),
//     },
//     body: JSON.stringify({
//       provider,
//       providerAccountId,
//       email,
//       name,
//       image,
//     }),
//   });

//   const data = await res.json();

//   if (!res.ok || !data?.data?.user || !data?.data?.token) {
//     throw new Error(data?.message || "OAuth sync failed");
//   }

//   return data.data;
// }

// export const authOptions: NextAuthOptions = {
//   session: { strategy: "jwt" },
//   pages : {
//     signIn : "/login",
//   },
//   secret: process.env.NEXTAUTH_SECRET,

//   providers: [
//     Credentials({
//       name: "Credentials",
//       credentials: {
//         email: { label: "Email", type: "email" },
//         password: { label: "Password", type: "password" },
//       },
//       async authorize(credentials) {
// const res = await fetch(`${apiUrl}/api/users/login`, {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({
//             email: credentials?.email,
//             password: credentials?.password,
//           }),
//         });

//         const data = await res.json();

//         if (!res.ok || !data?.data?.user || !data?.data?.token) {
//           return null;
//         }

//         return {
//           ...data.data.user,
//           accessToken: data.data.token,
//           provider: "credentials",
//         };
//       },
//     }),

//     Google({
//       clientId: process.env.GOOGLE_CLIENT_ID as string,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
//     }),

//     AzureADProvider({
//       clientId: process.env.MICROSOFT_CLIENT_ID as string,
//       clientSecret: process.env.MICROSOFT_CLIENT_SECRET as string,
//       tenantId: process.env.MICROSOFT_TENANT_ID as string,
//     }),
//   ],

//   callbacks: {
//     async jwt({ token, user, account, profile }) {
//       if (user) {
//         token.user = user;
//         token.accessToken = (user as any).accessToken;
//       }

//       if (
//         (account?.provider === "google" || account?.provider === "azure-ad") &&
//         profile
//       ) {
//         const synced = await syncOAuthUser({
//           provider: account.provider,
//           providerAccountId: account.providerAccountId,
//           email: (profile as any).email || (user as any)?.email,
//           name: (profile as any).name || (user as any)?.name,
//           image:
//             (profile as any).picture || (user as any)?.image || null,
//         });

//         token.user = synced.user;
//         token.accessToken = synced.token;
//       }

//       return token;
//     },

//     async session({ session, token }) {
//       (session as any).accessToken = token.accessToken;
//       session.user = token.user as any;
//       return session;
//     },
//   },
// };

export const authOptions: NextAuthOptions = {
  pages : {
    signIn : "/login",
    error : "/login",
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
          // api call and db call
          const res = await login({email : credentials.email , password : credentials.password})
          return null;
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
    async jwt({token,user}) {
      return {};
    },

    async session({ session, token }) {
      return session;
    },
  },
  session: {
    strategy: "jwt",
    maxAge : 30*24*60*60
  },
  secret : process.env.NEXTAUTH_SECRET,
  
};
