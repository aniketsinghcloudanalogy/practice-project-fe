import type { Account, User } from "next-auth";
import { isAxiosError } from "axios";
import api from "@/lib/axios/axios";

type AuthenticatedUser = User & {
  token?: string;
};

type AuthData = {
  user?: AuthenticatedUser;
  token?: string | null;
};

const getAuthData = (data: unknown) => {
  if (
    data &&
    typeof data === "object" &&
    "data" in data &&
    data.data &&
    typeof data.data === "object"
  ) {
    return data.data as AuthData;
  }

  return null;
};

export const signup = async (data: { name: string; email: string; password: string }) => {
  const res = await api.post("/api/users/signup", data);
  return res.data;
};

export const login = async (data: { email: string; password: string }) => {
  const res = await api.post("/api/users/login", data);
  const authData = getAuthData(res.data);

  if (!authData?.user) {
    return null;
  }

  return {
    ...res.data?.data?.user,
    accessToken: res.data?.data?.token ?? null,
  };
};


export const logout = async (accessToken: string) => {
  const res = await api.post("/api/users/logout", {}, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return res.data;
};

export const refreshToken = async (userId: string) => {
  const res = await api.post(
    "/api/users/refresh",
    { userId },
    { headers: { "x-internal-secret": process.env.INTERNAL_AUTH_SECRET } }
  );
  const d = res.data?.data as { user: User; token: string };
  return { user: d.user, accessToken: d.token };
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
  const internalSecret = process.env.INTERNAL_AUTH_SECRET;

  if (!internalSecret) {
    throw new Error("INTERNAL_AUTH_SECRET is not configured");
  }

  const payload = {
    provider: account.provider,
    providerAccountId,
    email: user.email,
    name: user.name,
    image: user.image,
  };

  const res = await api.post("/api/users/oauth", payload, {
    headers: {
      "x-internal-secret": internalSecret,
    },
  }).catch((error: unknown) => {
    if (isAxiosError(error)) {
      console.error("Backend OAuth API Error:", {
        status: error.response?.status,
        data: error.response?.data,
        payload: {
          provider: payload.provider,
          providerAccountId: payload.providerAccountId,
          email: payload.email,
          hasName: Boolean(payload.name),
          hasImage: Boolean(payload.image),
        },
      });
    }

    throw error;
  });
  const authData = getAuthData(res.data);

  if (!authData?.user) {
    return null;
  }

  return {
    ...res.data?.data?.user,
    accessToken: res.data?.data?.token ?? null,
  };
};
