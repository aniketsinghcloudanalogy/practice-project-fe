"use client";

import { useEffect } from "react";
import { Form, Typography, App } from "antd";
import { useGetProgramFormQuery, useSubmitDealRegMutation } from "@/store/services";
import type { FormSchema } from "@/components/formBuilder/types";
import FormSection from "./FormSection";

interface ProgramFormRendererProps {
  programId: number;
  partnerId: number;
  formRef: React.MutableRefObject<any>;
  clientUrl?: string | null;
}

export default function ProgramFormRenderer({ programId, partnerId, formRef, clientUrl }: ProgramFormRendererProps) {
  const { data: formData, isLoading } = useGetProgramFormQuery(programId);
  const [antForm] = Form.useForm();
  const { message } = App.useApp();
  const [submitDealReg, { isLoading: submitting }] = useSubmitDealRegMutation();

  useEffect(() => {
    formRef.current = antForm;
    (antForm as any).__submitting = submitting;
    return () => { formRef.current = null; };
  }, [antForm, formRef, submitting]);

  if (isLoading) return <p className="text-slate-400 text-center py-12">Loading form…</p>;
  if (!formData) return <p className="text-slate-400 text-center py-12">No form found for this program.</p>;

  const schema = (formData.status === "SUBMITTED" ? formData.submittedDesign : formData.formDesign) as unknown as FormSchema | null;
  if (!schema) return <p className="text-slate-400 text-center py-12">No form design available.</p>;

  // Build map: field ID → labeled key
  const fieldIdToLabel: Record<string, string> = {};
  schema.sections.forEach((s) => {
    s.fields.forEach((f) => {
      const label = f.label.replace(/\s+/g, "_");
      fieldIdToLabel[f.id] = `u_${label}_${programId}`;
    });
  });

  const allFieldIds = schema.sections.flatMap((s) => s.fields.map((f) => f.id));

  const handleFinish = async (values: Record<string, unknown>) => {
    if (submitting) return;

    // Validate URL is present
    if (!clientUrl) {
      message.error({ content: "Client form URL not configured. Please add the URL in partner settings.", key: "dealreg" });
      return;
    }

    // Build payload — unfilled fields get "--None--"
    const labeledValues: Record<string, unknown> = {};
    for (const fieldId of allFieldIds) {
      const label = fieldIdToLabel[fieldId] || fieldId;
      const val = values[fieldId];
      labeledValues[label] = (val === undefined || val === null || val === "") ? "--None--" : val;
    }

    const payload = {
      partnerId,
      programId,
      response: [JSON.stringify(labeledValues)],
      clientUrl,
    };

    try {
      message.loading({ content: "Submitting to client site...", key: "dealreg", duration: 0 });
      const data = await submitDealReg(payload).unwrap();
      if (data.success) {
        message.success({ content: `Form submitted! ${data.fieldsMapped} fields mapped.`, key: "dealreg" });
        antForm.resetFields();
      } else {
        message.error({ content: data.message || "Submission failed", key: "dealreg" });
      }
    } catch (err: any) {
      message.error({ content: err.data?.message || err.message || "Network error", key: "dealreg" });
    }
  };

  return (
    <div style={{ maxWidth: 780, opacity: submitting ? 0.6 : 1, pointerEvents: submitting ? "none" : "auto" }}>
      <Typography.Title level={4} style={{ margin: "0 0 4px", fontWeight: 700 }}>{schema.title}</Typography.Title>
      <p className="text-sm text-slate-500 mb-4">Fill in the form below.</p>
      <Form form={antForm} layout="vertical" size="middle" onFinish={handleFinish} scrollToFirstError disabled={submitting}>
        {schema.sections.map((s) => <FormSection key={s.id} section={s} />)}
      </Form>
    </div>
  );
}
