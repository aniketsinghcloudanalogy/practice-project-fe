import { getSession } from "next-auth/react";
import api from "@/lib/axios/axios";

export type ContactPayload = {
  firstName: string;
  lastName?: string | null;
  email: string;
  primaryContact: string;
  secondaryContact?: string | null;
  subject: string;
  message: string;
};

export type ContactResponse = {
  success?: boolean;
  message?: string;
  data?: unknown;
};

export const createContact = async (data: ContactPayload): Promise<ContactResponse> => {
  const session = await getSession();

  const payload: ContactPayload = {
    ...data,
    lastName: data.lastName || null,
    secondaryContact: data.secondaryContact || null,
  };

  const res = await api.post(
    "/api/contact",
    payload,
    {
      headers: session?.accessToken
        ? {
            Authorization: `Bearer ${session.accessToken}`,
          }
        : {},
    }
  );

  return res.data;
};
