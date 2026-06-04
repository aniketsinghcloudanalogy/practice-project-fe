import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import AzureADProvider from "next-auth/providers/azure-ad";
import { login, oauth, refreshToken } from "../api/auth.api";

// Extract expiry from JWT payload (exp is in seconds); fallback to 1h buffer before now
const getTokenExpiry = (token?: string | null): number => {
  if (!token) return Date.now();
  try {
    const payload = JSON.parse(Buffer.from(token.split(".")[1], "base64").toString());
    return payload.exp ? payload.exp * 1000 : Date.now();
  } catch {
    return Date.now();
  }
};

export const authOptions: NextAuthOptions = {
  pages: {
    signIn: "/login",
    error: "/login",
  },

  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
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
        } catch (error: any) {
          // Pass through specific error messages from backend
          const errorMessage = error?.response?.data?.message || error?.message || "Login failed";
          throw new Error(errorMessage);
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

    async jwt({ token, user }) {
      // Initial sign-in: populate token from user object
      if (user) {
        const accessToken = (user as any).accessToken ?? null;
        token.user = user as any;
        token.accessToken = accessToken;
        token.accessTokenExpires = getTokenExpiry(accessToken);
        token.error = undefined;
        return token;
      }

      // Already errored — don't retry
      if (token.error === "RefreshTokenExpired") return token;

      // Token not yet expired — return as-is
      if (token.accessTokenExpires && Date.now() < (token.accessTokenExpires as number)) {
        return token;
      }

      // Access token expired — try to refresh
      const userId = (token.user as any)?.id;
      if (!userId) return { ...token, error: "RefreshTokenExpired" };

      try {
        const refreshed = await refreshToken(userId);
        return {
          ...token,
          accessToken: refreshed.accessToken,
          accessTokenExpires: getTokenExpiry(refreshed.accessToken),
          user: { ...(token.user as any), ...refreshed.user },
          error: undefined,
        };
      } catch {
        return { ...token, error: "RefreshTokenExpired" };
      }
    },

    async session({ session, token }) {
      if (token.user) {
        session.user = token.user;
      }
      session.accessToken = token.accessToken;
      session.error = token.error;
      return session;
    },
  },

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },

  secret: process.env.NEXTAUTH_SECRET,
};