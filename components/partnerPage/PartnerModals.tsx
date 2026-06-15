import Modal from "@/components/common/Modal";

import AddPartnerForm from "./AddPartnerForm";
import AddProgramForm from "./AddProgramForm";
import type { PartnerRow } from "./PartnerTable";
import type { ModalType, ProgramFormValues } from "./types";

type PartnerNameOption = {
  label: string;
  value: string;
};

type PartnerModalsProps = {
  modalType: ModalType;
  partnerNameOptions: PartnerNameOption[];
  onClose: () => void;
  onPartnerSubmit: (newPartner: PartnerRow) => void;
  onProgramSubmit: (values: ProgramFormValues) => void;
};

export default function PartnerModals({
  modalType,
  partnerNameOptions,
  onClose,
  onPartnerSubmit,
  onProgramSubmit,
}: PartnerModalsProps) {
  const isPartner = modalType === "partner";
  const isProgram = modalType === "program";

  return (
    <Modal
      open={isPartner || isProgram}
      onCancel={onClose}
      title={
        <span className="text-base font-semibold text-slate-900">
          {isPartner ? "Add Partner" : "Add Partner Program"}
        </span>
      }
      variant="compact"
      width={isProgram ? "min(920px, 96vw)" : "min(760px, 96vw)"}
      destroyOnHidden
      footer={null}
    >
      {isPartner && <AddPartnerForm onSubmit={onPartnerSubmit} onCancel={onClose} />}
      {isProgram && (
        <AddProgramForm
          partnerNameOptions={partnerNameOptions}
          onSubmit={onProgramSubmit}
          onCancel={onClose}
        />
      )}
    </Modal>
  );
}
