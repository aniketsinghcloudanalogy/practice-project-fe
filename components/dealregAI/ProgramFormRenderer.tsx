"use client";

import { useEffect } from "react";
import { Form, Typography, App } from "antd";
import { useGetProgramFormQuery } from "@/store/services";
import type { FormSchema } from "@/components/formBuilder/types";
import FormSection from "./FormSection";

interface ProgramFormRendererProps {
  programId: number;
  partnerId: number;
  formRef: React.MutableRefObject<any>;
}

export default function ProgramFormRenderer({ programId, partnerId, formRef }: ProgramFormRendererProps) {
  const { data: formData, isLoading } = useGetProgramFormQuery(programId);
  const [antForm] = Form.useForm();
  const { message } = App.useApp();

  useEffect(() => {
    formRef.current = antForm;
    return () => { formRef.current = null; };
  }, [antForm, formRef]);

  if (isLoading) return <p className="text-slate-400 text-center py-12">Loading form…</p>;
  if (!formData) return <p className="text-slate-400 text-center py-12">No form found for this program.</p>;

  const schema = (formData.status === "SUBMITTED" ? formData.submittedDesign : formData.formDesign) as unknown as FormSchema | null;
  if (!schema) return <p className="text-slate-400 text-center py-12">No form design available.</p>;

  // Build a map from field ID to label
  const fieldIdToLabel: Record<string, string> = {};
  schema.sections.forEach((s) => {
    s.fields.forEach((f) => {
      const label = f.label.replace(/\s+/g, "_");
      fieldIdToLabel[f.id] = `u_${label}_${programId}`;
    });
  });

  const handleFinish = (values: Record<string, unknown>) => {
    const labeledValues: Record<string, unknown> = {};
    Object.entries(values).forEach(([key, val]) => {
      const label = fieldIdToLabel[key] || key;
      labeledValues[label] = val;
    });
    const response = [JSON.stringify(labeledValues)];
    console.log("Partner ID:", partnerId);
    console.log("Program ID:", programId);
    console.log("Response:", JSON.stringify(response, null, 2));
    message.success("Form submitted successfully");
    antForm.resetFields();
  };

  return (
    <div style={{ maxWidth: 780 }}>
      <Typography.Title level={4} style={{ margin: "0 0 4px", fontWeight: 700 }}>{schema.title}</Typography.Title>
      <p className="text-sm text-slate-500 mb-4">Fill in the form below.</p>
      <Form form={antForm} layout="vertical" size="middle" onFinish={handleFinish} scrollToFirstError>
        {schema.sections.map((s) => <FormSection key={s.id} section={s} />)}
      </Form>
    </div>
  );
}
