import type { AddPartnerInput, AddProgramInput } from "@/lib/validations/partner.schema";

export type PartnerProgramRow = {
  id: number;
  partnerProgramName: string;
  description: string | null;
  verificationStep: boolean | null;
  template: string | null;
  loginTemplate: string | null;
  loginScript: string | null;
  partnerId: number;
  formStatus?: 'DRAFT' | 'SUBMITTED' | null;
  formCreatorId?: string | null;
};

export type ModalType = "partner" | "program" | "edit-partner" | null;

export type PartnerFormValues = AddPartnerInput;

export type ProgramFormValues = AddProgramInput;
