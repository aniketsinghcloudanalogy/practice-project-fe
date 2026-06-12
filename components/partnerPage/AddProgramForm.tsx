"use client";

import { useState } from "react";

import Button from "@/components/common/Button";
import Form from "@/components/common/Form";
import Input from "@/components/common/Input";
import Select from "@/components/common/Select";
import { addProgram } from "@/lib/api/partner.api";
import { addProgramSchema } from "@/lib/validations/partner.schema";

import type { ProgramFormValues } from "./types";

type PartnerNameOption = {
  label: string;
  value: string;
};

type AddProgramFormProps = {
  partnerNameOptions: PartnerNameOption[];
  onSubmit: (values: ProgramFormValues) => void;
  onCancel: () => void;
};

export default function AddProgramForm({
  partnerNameOptions,
  onSubmit,
  onCancel,
}: AddProgramFormProps) {
  const [form] = Form.useForm<ProgramFormValues>();
  const [loading, setLoading] = useState(false);

  const onSubmitHandler = async (values: ProgramFormValues) => {
    const result = addProgramSchema.safeParse(values);
    if (!result.success) {
      form.setFields(
        result.error.issues.map((issue) => ({
          name: issue.path[0] as keyof ProgramFormValues,
          errors: [issue.message],
        }))
      );
      return;
    }
    try {
      setLoading(true);
      await addProgram(result.data);
      onSubmit(result.data);
    } catch {
      form.setFields([{ name: "partnerName", errors: ["Failed to add program. Please try again."] }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-3xl bg-[#f7fbff] p-1">
      <div className="rounded-[22px] border border-[#dbe6f3] bg-white p-5 shadow-[0_12px_32px_rgba(15,23,42,0.04)] sm:p-6">
        <div className="mb-5 border-b border-slate-200 pb-4">
          <h3 className="mt-1 text-xl font-semibold text-slate-900">Program Details</h3>
        </div>
        <Form<ProgramFormValues>
          form={form}
          layout="vertical"
          onFinish={onSubmitHandler}
          initialValues={{ partnerName: "", partnerProgramName: "", description: "" }}
          className="space-y-5"
        >
          <div className="flex flex-col gap-4 sm:grid-cols-2">
            <Form.Item
              label="Partner Name"
              name="partnerName"
              rules={[{ required: true, message: "Partner name is required" }]}
            >
              <Select
                variant="panel"
                placeholder="Select partner name"
                options={partnerNameOptions}
                showSearch
                optionFilterProp="label"
              />
            </Form.Item>
            <Form.Item label="Program Name" name="partnerProgramName">
              <Input appearance="soft" placeholder="Enter program name" />
            </Form.Item>
            <Form.Item label="Description" name="description">
              <Input.TextArea appearance="soft" placeholder="Enter description" rows={3} />
            </Form.Item>
          </div>
          <div className="flex justify-end gap-3 pt-1">
            <Button variant="secondary" htmlType="button" onClick={onCancel}>
              Cancel
            </Button>
            <Button variant="primary" htmlType="submit" loading={loading}>
              Save Program
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
}
