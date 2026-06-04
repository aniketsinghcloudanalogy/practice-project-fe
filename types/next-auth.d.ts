import { DefaultSession } from "next-auth";

type AppUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role: string;
  authProvider: string;
};

declare module "next-auth" {
  interface User extends AppUser {
    token?: string;
  }

  interface Session {
    token?: string;
    user: AppUser & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    token?: string;
    providerAccessToken?: string;
    user?: AppUser;
  }
}
