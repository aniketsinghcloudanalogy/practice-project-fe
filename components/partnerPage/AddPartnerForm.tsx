"use client";

import { useState } from "react";
import { App } from "antd";
import { isAxiosError } from "axios";

import Button from "@/components/common/Button";
import Form from "@/components/common/Form";
import { addpartner } from "@/lib/api/partner.api";

import PartnerFormFields from "./PartnerFormFields";
import type { PartnerFormValues } from "./types";
import type { PartnerRow } from "./types";

type AddPartnerFormProps = {
  onSubmit: (newPartner: PartnerRow) => void;
  onCancel: () => void;
};

export default function AddPartnerForm({ onSubmit, onCancel }: AddPartnerFormProps) {
  const { message } = App.useApp();
  const [form] = Form.useForm<PartnerFormValues>();
  const [loading, setLoading] = useState(false);

  const onSubmitHandler = async (values: PartnerFormValues) => {
    try {
      setLoading(true);
      const response = await addpartner(values);
      message.success("Partner created successfully");
      form.resetFields();
      onSubmit(response.data);
    } catch (error) {
      if (isAxiosError(error)) {
        message.error(error.response?.data?.message || "Request failed");
      } else {
        console.error(error);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form<PartnerFormValues>
      form={form}
      layout="vertical"
      onFinish={onSubmitHandler}
      initialValues={{
        externalId: null,
        partnerName: "",
        parentPartner: null,
        pmId: null,
        url: null,
        email: null,
      }}
      className="mt-4"
    >
      <PartnerFormFields />

      <div className="mt-6 flex justify-end gap-3">
        <Button variant="secondary" htmlType="button" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="primary" loading={loading} htmlType="submit">
          Save Partner
        </Button>
      </div>
    </Form>
  );
}
