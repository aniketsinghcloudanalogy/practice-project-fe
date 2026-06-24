"use client";

import { useState } from "react";
import { App } from "antd";

import Button from "@/components/common/Button";
import Form from "@/components/common/Form";
import { useAddPartnerMutation, type PartnerRow } from "@/store/services";

import PartnerFormFields from "./PartnerFormFields";
import type { PartnerFormValues } from "./types";

type AddPartnerFormProps = {
  onSubmit: (newPartner: PartnerRow) => void;
  onCancel: () => void;
};

export default function AddPartnerForm({ onSubmit, onCancel }: AddPartnerFormProps) {
  const { message } = App.useApp();
  const [form] = Form.useForm<PartnerFormValues>();
  const [addPartner, { isLoading: loading }] = useAddPartnerMutation();

  const onSubmitHandler = async (values: PartnerFormValues) => {
    try {
      const response = await addPartner(values).unwrap();
      message.success("Partner created successfully");
      form.resetFields();
      onSubmit(response.data);
    } catch (error: any) {
      const errorMessage = error?.data?.message || error?.message || "Request failed";
      message.error(errorMessage);
      console.error('Failed to add partner:', error);
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
