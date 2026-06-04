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
    ...authData.user,
    token: authData.token ?? undefined,
  };
};


export const logout = async (token?: string) => {
  const res = await api.post(
    "/api/users/logout",
    undefined,
    {
      headers: token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {},
    }
  );
  return res.data;
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
    ...authData.user,
    token: authData.token ?? undefined,
  };
};
