import type { AddPartnerInput, AddProgramInput } from "@/lib/validations/partner.schema";

export type PartnerRow = {
  id: number;
  externalId: string | null;
  partnerName: string;
  parentPartner: string | null;
  pmId: string | null;
  url: string | null;
  email: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PartnerProgramRow = {
  id: number;
  partnerProgramName: string;
  description: string | null;
  verificationStep: boolean | null;
  template: string | null;
  loginTemplate: string | null;
  loginScript: string | null;
  partnerId: number;
};

export type ModalType = "partner" | "program" | "edit-partner" | null;

export type PartnerFormValues = AddPartnerInput;

export type ProgramFormValues = AddProgramInput;
