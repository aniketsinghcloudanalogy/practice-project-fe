"use client";

import { Input, Select, DatePicker, TimePicker, Checkbox, Radio, Switch, Upload, Table, Divider, Form, Button, Row, Col, Typography, Card } from "antd";
import { InboxOutlined, SendOutlined } from "@ant-design/icons";
import type { FormSchema, FieldDef, SectionDef } from "@/components/formBuilder/types";

function groupIntoRows(fields: FieldDef[]): FieldDef[][] {
  const rows: FieldDef[][] = [];
  let current: FieldDef[] = [];
  for (const f of fields) {
    if (f.col === "full") {
      if (current.length > 0) { rows.push(current); current = []; }
      rows.push([f]);
    } else {
      current.push(f);
      if (current.length === 3) { rows.push(current); current = []; }
    }
  }
  if (current.length > 0) rows.push(current);
  return rows;
}

function PreviewSection({ section }: { section: SectionDef }) {
  const rows = groupIntoRows(section.fields);
  if (section.fields.length === 0) return null;

  return (
    <Card
      style={{ borderRadius: 10, border: "1px solid #e5e7eb", marginBottom: 16, overflow: "hidden" }}
      styles={{ body: { padding: 0 } }}
    >
      <div style={{ padding: "12px 20px", borderBottom: "1px solid #f3f4f6", background: "#fafafa" }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>{section.title}</div>
      </div>
      <div style={{ padding: "20px 20px 8px" }}>
        {rows.map((row, ri) => (
          <Row key={ri} gutter={[16, 0]}>
            {row.map((field) => {
              if (field.type === "line-break") {
                return <Col key={field.id} span={24}><Divider style={{ margin: "8px 0 16px" }} /></Col>;
              }

              const colProps = field.col === "full"
                ? { span: 24 }
                : { flex: "1" as const };

              const required = field.required;
              const rules = required
                ? [{ required: true, message: `${field.label} is required` }]
                : [];

              if (field.type === "toggle") {
                return (
                  <Col key={field.id} {...colProps}>
                    <Form.Item
                      name={field.id}
                      label={<span style={{ fontSize: 13, fontWeight: 500, color: "#374151" }}>{field.label}</span>}
                      valuePropName="checked"
                      style={{ marginBottom: 16 }}
                    >
                      <Switch />
                    </Form.Item>
                  </Col>
                );
              }

              if (field.type === "checkbox") {
                return (
                  <Col key={field.id} {...colProps}>
                    <Form.Item
                      name={field.id}
                      label={<span style={{ fontSize: 13, fontWeight: 500, color: "#374151" }}>{field.label}</span>}
                      rules={rules}
                      validateTrigger={["onChange"]}
                      style={{ marginBottom: 16 }}
                    >
                      <Checkbox.Group
                        style={{ display: "flex", flexDirection: "column", gap: 6 }}
                        options={(field.options.length > 0 ? field.options : [field.label]).map((o) => ({ label: o, value: o }))}
                      />
                    </Form.Item>
                  </Col>
                );
              }

              if (field.type === "radio") {
                return (
                  <Col key={field.id} {...colProps}>
                    <Form.Item
                      name={field.id}
                      label={<span style={{ fontSize: 13, fontWeight: 500, color: "#374151" }}>{field.label}</span>}
                      rules={rules}
                      validateTrigger={["onChange"]}
                      style={{ marginBottom: 16 }}
                    >
                      <Radio.Group style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        {(field.options.length > 0 ? field.options : ["Option 1"]).map((o) => (
                          <Radio key={o} value={o}>{o}</Radio>
                        ))}
                      </Radio.Group>
                    </Form.Item>
                  </Col>
                );
              }

              if (field.type === "attachment") {
                return (
                  <Col key={field.id} {...colProps}>
                    <Form.Item
                      label={<span style={{ fontSize: 13, fontWeight: 500, color: "#374151" }}>{field.label}</span>}
                      style={{ marginBottom: 16 }}
                    >
                      <Upload.Dragger multiple style={{ borderRadius: 8 }}>
                        <div style={{ padding: "8px 0" }}>
                          <InboxOutlined style={{ fontSize: 28, color: "#2F54EB" }} />
                          <div style={{ fontSize: 13, color: "#374151", marginTop: 6 }}>Click or drag files here</div>
                          <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>Supports any file type</div>
                        </div>
                      </Upload.Dragger>
                    </Form.Item>
                  </Col>
                );
              }

              if (field.type === "table") {
                return (
                  <Col key={field.id} span={24}>
                    <Form.Item
                      label={<span style={{ fontSize: 13, fontWeight: 500, color: "#374151" }}>{field.label}</span>}
                      style={{ marginBottom: 16 }}
                    >
                      <Table
                        size="small"
                        dataSource={[]}
                        columns={[
                          { title: "Column 1", dataIndex: "c1" },
                          { title: "Column 2", dataIndex: "c2" },
                          { title: "Column 3", dataIndex: "c3" },
                        ]}
                        pagination={false}
                        locale={{ emptyText: "No data" }}
                        style={{ border: "1px solid #f3f4f6", borderRadius: 8 }}
                      />
                    </Form.Item>
                  </Col>
                );
              }

              const renderInput = () => {
                switch (field.type) {
                  case "text": case "text-content": case "add-section":
                    return <Input placeholder={field.placeholder || `Enter ${field.label}`} allowClear />;
                  case "contact":
                    return <Input type="tel" placeholder={field.placeholder || "Phone number"} allowClear />;
                  case "email":
                    return <Input type="email" placeholder={field.placeholder || "Email address"} allowClear />;
                  case "textarea":
                    return <Input.TextArea rows={3} placeholder={field.placeholder || "Enter text..."} allowClear />;
                  case "drop-down":
                    return (
                      <Select
                        style={{ width: "100%" }}
                        placeholder={field.placeholder || "Select an option"}
                        options={field.options.map((o) => ({ label: o, value: o }))}
                        allowClear
                      />
                    );
                  case "multi-select":
                    return (
                      <Select
                        mode="multiple"
                        style={{ width: "100%" }}
                        placeholder={field.placeholder || "Select options"}
                        options={field.options.map((o) => ({ label: o, value: o }))}
                        allowClear
                      />
                    );
                  case "date":
                    return <DatePicker style={{ width: "100%" }} placeholder="Select date" />;
                  case "time":
                    return <TimePicker style={{ width: "100%" }} placeholder="Select time" />;
                  case "currency":
                    return <Input prefix="USD" placeholder="0.00" allowClear />;
                  default:
                    return <Input placeholder={field.placeholder || field.label} allowClear />;
                }
              };

              return (
                <Col key={field.id} {...colProps}>
                  <Form.Item
                    name={field.id}
                    label={<span style={{ fontSize: 13, fontWeight: 500, color: "#374151" }}>{field.label}</span>}
                    rules={rules}
                    validateTrigger={["onChange", "onBlur"]}
                    style={{ marginBottom: 16 }}
                  >
                    {renderInput()}
                  </Form.Item>
                </Col>
              );
            })}
          </Row>
        ))}
      </div>
    </Card>
  );
}

type FormPreviewRendererProps = {
  schema: FormSchema;
  readOnly?: boolean;
};

export default function FormPreviewRenderer({ schema, readOnly }: FormPreviewRendererProps) {
  const [antForm] = Form.useForm();
  const hasSections = schema.sections.some((s) => s.fields.length > 0);

  const handleFinish = (values: Record<string, unknown>) => {
    console.log("=== Form Submitted ===");
    console.log("Form title:", schema.title);
    console.log("Submitted values:", JSON.stringify(values, null, 2));
    console.log("Form schema:", JSON.stringify(schema, null, 2));
    
    // Clear the form after submission
    antForm.resetFields();
    
    // Show success message
    // Note: This is just a preview - in a real implementation, 
    // you would send this data to your backend
  };

  return (
    <div style={{ maxWidth: 780 }}>
      <div style={{ marginBottom: 16 }}>
        <Typography.Title level={4} style={{ margin: 0, color: "#111827", fontWeight: 700 }}>
          {schema.title}
        </Typography.Title>
        <div style={{ fontSize: 13, color: "#6b7280", marginTop: 4 }}>
          Fill in the form below and click submit.
        </div>
      </div>

      {!hasSections ? (
        <div style={{
          textAlign: "center", padding: "40px 24px", border: "1.5px dashed #e5e7eb",
          borderRadius: 12, background: "#fff", color: "#9ca3af",
        }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>📋</div>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>No fields in this form</div>
        </div>
      ) : (
        <Form
          form={antForm}
          layout="vertical"
          size="middle"
          onFinish={handleFinish}
          scrollToFirstError
          disabled={readOnly}
        >
          {schema.sections.map((s) => <PreviewSection key={s.id} section={s} />)}
          {!readOnly && (
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              icon={<SendOutlined />}
              style={{ borderRadius: 8, height: 44, paddingInline: 32, fontWeight: 600 }}
            >
              Submit Form
            </Button>
          )}
        </Form>
      )}
    </div>
  );
}
