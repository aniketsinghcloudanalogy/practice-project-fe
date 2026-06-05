import { getSession } from "next-auth/react";
import api from "@/lib/axios/axios";

export type ContactPayload = {
  firstName: string;
  lastName?: string | null;
  email: string;
  primaryContact: string;
  secondaryContact?: string | null;
  company?: string | null;
  notes?: string | null;
};

export type ContactResponse<T = unknown> = {
  success?: boolean;
  message?: string;
  data?: T;
};

const getAuthHeaders = async () => {
  const session = await getSession();

  return session?.accessToken
    ? {
        Authorization: `Bearer ${session.accessToken}`,
      }
    : {};
};

export const createContact = async (data: ContactPayload): Promise<ContactResponse> => {
  const res = await api.post("/api/contacts", data, {
    headers: await getAuthHeaders(),
  });

  return res.data;
};

export const getContacts = async (): Promise<ContactResponse> => {
  const res = await api.get("/api/users/me/contacts", {
    headers: await getAuthHeaders(),
  });

  const resData = res.data;
  const contacts = resData?.data?.contacts ?? resData?.data ?? resData;

  return Array.isArray(contacts) ? { success: true, data: contacts } : resData;
};

export const getContact = async (contactId: string): Promise<ContactResponse> => {
  const res = await api.get(`/api/contacts/${contactId}`, {
    headers: await getAuthHeaders(),
  });

  return res.data;
};

export const updateContact = async (
  contactId: string,
  data: Partial<ContactPayload>
): Promise<ContactResponse> => {
  const res = await api.patch(`/api/contacts/${contactId}`, data, {
    headers: await getAuthHeaders(),
  });

  return res.data;
};

export const deleteContact = async (contactId: string): Promise<ContactResponse> => {
  const res = await api.delete(`/api/contacts/${contactId}`, {
    headers: await getAuthHeaders(),
  });

  return res.data;
};
