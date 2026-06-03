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

export const logout = async () => {
  const res = await api.post("/api/users/logout");
  return res.data;
};

export const getUsers = async (accessToken: string) => {
  const res = await api.get("/api/users/list", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return res.data?.data as UserRow[];
};

export const toggleUserActive = async (userId: string, isActive: boolean, accessToken: string) => {
  const res = await api.patch(`/api/users/${userId}/active`, { isActive }, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return res.data?.data as UserRow;
};

export type UserRow = {
  id: string;
  name: string | null;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
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
