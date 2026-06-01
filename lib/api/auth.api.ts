import type { Account, User } from "next-auth";
import api from "@/lib/axios/axios";

export const signup = async (data: { name: string; email: string; password: string }) => {
  const res = await api.post("/api/users/signup", data);
  return res.data;
};

export const login = async (data: { email: string; password: string }) => {
  const res = await api.post("/api/users/login", data);
  return res.data?.data?.user ?? null;
};

type OAuthPayload = {
  user: User;
  account: Account;
  providerAccountId: string;
};

export const oauth = async ({ user, account, providerAccountId }: OAuthPayload) => {
  try {
    await api.post(
      "/api/users/oauth",
      {
        provider: account.provider,
        providerAccountId,
        email: user.email,
        name: user.name,
        image: user.image,
      },
      {
        headers: {
          "x-internal-secret": process.env.INTERNAL_AUTH_SECRET,
        },
      }
    );

    return true;
  } catch (error) {
    console.error("OAuth API Error:", error);
    return false;
  }
};
