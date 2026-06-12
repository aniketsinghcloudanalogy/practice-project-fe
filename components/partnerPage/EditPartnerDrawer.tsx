import { useEffect, useState } from "react";

import { App } from "antd";
import Button from "@/components/common/Button";
import Drawer from "@/components/common/Drawer";
import Form from "@/components/common/Form";
import { updatePartner } from "@/lib/api/partner.api";
import { addPartnerSchema } from "@/lib/validations/partner.schema";
import type { PartnerRow } from "./PartnerTable";

import PartnerFormFields from "./PartnerFormFields";
import type { PartnerFormValues } from "./types";

type EditPartnerDrawerProps = {
  open: boolean;
  partner: PartnerRow | null;
  onClose: () => void;
  onSubmit: (values: PartnerFormValues) => void;
};

export default function EditPartnerDrawer({
  open,
  partner,
  onClose,
  onSubmit,
}: EditPartnerDrawerProps) {
  const { message } = App.useApp();
  const [form] = Form.useForm<PartnerFormValues>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !partner) return;

    form.setFieldsValue({
      externalId: partner.externalId,
      partnerName: partner.partnerName ?? "",
      parentPartner: partner.parentPartner ?? "",
      pmId: partner.pmId ?? "",
      url: partner.url ?? "",
      email: partner.email ?? "",
    });
  }, [open, partner, form]);

  const handleClose = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Drawer
      variant="sidebar"
      title={<span className="text-base font-semibold text-slate-900">Edit Partner</span>}
      placement="right"
      size={500}
      open={open}
      onClose={handleClose}
    >
      <Form<PartnerFormValues>
      form={form}
      layout="vertical"
      onFinish={async (values) => {
        const result = addPartnerSchema.safeParse(values);
        if (!result.success) {
          form.setFields(
            result.error.issues.map((issue) => ({
              name: issue.path[0] as keyof PartnerFormValues,
              errors: [issue.message],
            }))
          );
          return;
        }
        if (!partner) return;
        try {
          setLoading(true);
          await updatePartner(partner.id, result.data);
          message.success("Partner updated successfully");
          onSubmit(result.data);
        } catch (err: unknown) {
          const status = (err as { response?: { status?: number } })?.response?.status;
          if (status === 400) {
            form.setFields([{ name: "partnerName", errors: ["Partner with this name already exists"] }]);
          } else {
            message.error("Failed to update partner. Please try again.");
          }
        } finally {
          setLoading(false);
        }
      }}
      className="mt-4"
    >
        <PartnerFormFields />
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" htmlType="button" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="primary" htmlType="submit" loading={loading}>
            Update Partner
          </Button>
        </div>
      </Form>
    </Drawer>
  );
}
