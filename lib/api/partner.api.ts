import { getSession } from "next-auth/react";
import api from "@/lib/axios/axios";

type PartnerData = {
  externalId?: string | null;
  partnerName: string;
  parentPartner?: string | null;
  pmId?: string | null;
  url?: string | null;
  email?: string | null;
}

export const addpartner = async (partnerData: PartnerData) => {
  const session = await getSession();

  const res = await api.post("/api/partners/addpartner", partnerData, {
    headers: session?.accessToken
      ? { Authorization: `Bearer ${session.accessToken}` }
      : {},
  });

  return res.data;
};

export const getPartners = async () => {
  const session = await getSession();

  const res = await api.get("/api/partners/names", {
    headers: session?.accessToken
      ? { Authorization: `Bearer ${session.accessToken}` }
      : {},
  });

  return res.data;
};

export const getPartnerCount = async () => {
  const session = await getSession();

  const res = await api.get("/api/partners/count", {
    headers: session?.accessToken
      ? { Authorization: `Bearer ${session.accessToken}` }
      : {},
  });

  return res.data;
};

export const getPartnerStats = async () => {
  const session = await getSession();

  const res = await api.get("/api/partners/stats", {
    headers: session?.accessToken
      ? { Authorization: `Bearer ${session.accessToken}` }
      : {},
  });

  return res.data;
};

export const addProgram = async (programData: { partnerName: string; partnerProgramName?: string; description?: string }) => {
  const session = await getSession();

  const res = await api.post("/api/partners/addprogram", programData, {
    headers: session?.accessToken
      ? { Authorization: `Bearer ${session.accessToken}` }
      : {},
  });

  return res.data;
};

export const getPartnerPrograms = async (partnerId: number) => {
  const session = await getSession();

  const res = await api.get("/api/partners/programs", {
    params: { partnerId },
    headers: session?.accessToken
      ? { Authorization: `Bearer ${session.accessToken}` }
      : {},
  });

  return res.data;
};

export const updateVerificationStep = async (programId: number, verificationStep: boolean) => {
  const session = await getSession();

  const res = await api.patch(`/api/partners/programs/${programId}/verification`, { verificationStep }, {
    headers: session?.accessToken
      ? { Authorization: `Bearer ${session.accessToken}` }
      : {},
  });

  return res.data;
};

export const updatePartner = async (partnerId: number, partnerData: {
  externalId?: string | null;
  partnerName?: string;
  parentPartner?: string | null;
  pmId?: string | null;
  url?: string | null;
  email?: string | null;
}) => {
  const session = await getSession();

  const res = await api.patch(`/api/partners/partners/${partnerId}`, partnerData, {
    headers: session?.accessToken
      ? { Authorization: `Bearer ${session.accessToken}` }
      : {},
  });

  return res.data;
};

export const deletePartner = async (partnerId: number) => {
  const session = await getSession();

  const res = await api.delete(`/api/partners/partners/${partnerId}`, {
    headers: session?.accessToken
      ? { Authorization: `Bearer ${session.accessToken}` }
      : {},
  });

  return res.data;
};