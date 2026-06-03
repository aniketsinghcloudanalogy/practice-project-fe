import { DefaultSession } from "next-auth";

export type AuthMode = 'login' | 'signup';

// export interface AppSession extends DefaultSession {
//   user: DefaultSession["user"] & {
//     id: string;
//   };
// }

// export type AppJWT = {
//   id?: string;
// };

// declare module "next-auth" {
//   interface Session extends DefaultSession {
//     user: DefaultSession["user"] & {
//       id: string;
//     };
//   }
// }

// declare module "next-auth/jwt" {
//   interface JWT {
//     id?: string;
//   }
// }

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
    } & DefaultSession["user"]
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    user?: {
      id: string;
      role: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}