"use client";

import { Form, Input, Select, DatePicker, TimePicker, Checkbox, Radio, Switch, Upload, Divider, Row, Col, Card } from "antd";
import { InboxOutlined } from "@ant-design/icons";
import type { FieldDef, SectionDef } from "@/components/formBuilder/types";

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

function renderInput(field: FieldDef) {
  switch (field.type) {
    case "text": case "text-content":
      return <Input placeholder={field.placeholder || `Enter ${field.label}`} allowClear />;
    case "contact":
      return <Input type="tel" placeholder={field.placeholder || "Phone number"} allowClear />;
    case "email":
      return <Input type="email" placeholder={field.placeholder || "Email address"} allowClear />;
    case "textarea":
      return <Input.TextArea rows={3} placeholder={field.placeholder || "Enter text..."} allowClear />;
    case "drop-down":
      return <Select style={{ width: "100%" }} placeholder={field.placeholder || "Select"} options={field.options.map((o) => ({ label: o, value: o }))} allowClear />;
    case "multi-select":
      return <Select mode="multiple" style={{ width: "100%" }} placeholder={field.placeholder || "Select"} options={field.options.map((o) => ({ label: o, value: o }))} allowClear />;
    case "date":
      return <DatePicker style={{ width: "100%" }} />;
    case "time":
      return <TimePicker style={{ width: "100%" }} />;
    case "currency":
      return <Input prefix="USD" placeholder="0.00" allowClear />;
    default:
      return <Input placeholder={field.placeholder || field.label} allowClear />;
  }
}

function FieldRenderer({ field, colProps }: { field: FieldDef; colProps: Record<string, any> }) {
  const rules = field.required ? [{ required: true, message: `${field.label} is required` }] : [];
  const label = <span style={{ fontSize: 13, fontWeight: 500 }}>{field.label}</span>;

  if (field.type === "line-break") {
    return <Col key={field.id} span={24}><Divider style={{ margin: "8px 0 16px" }} /></Col>;
  }
  if (field.type === "add-section") {
    return (
      <Col key={field.id} span={24}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "#111827", padding: "8px 0 4px", borderBottom: "1px solid #e5e7eb", marginBottom: 12 }}>
          {field.label}
        </div>
      </Col>
    );
  }
  if (field.type === "toggle") {
    return (
      <Col key={field.id} {...colProps}>
        <Form.Item name={field.id} label={label} valuePropName="checked" style={{ marginBottom: 16 }}>
          <Switch />
        </Form.Item>
      </Col>
    );
  }
  if (field.type === "checkbox") {
    return (
      <Col key={field.id} {...colProps}>
        <Form.Item name={field.id} label={label} rules={rules} style={{ marginBottom: 16 }}>
          <Checkbox.Group options={(field.options.length > 0 ? field.options : [field.label]).map((o) => ({ label: o, value: o }))} />
        </Form.Item>
      </Col>
    );
  }
  if (field.type === "radio") {
    return (
      <Col key={field.id} {...colProps}>
        <Form.Item name={field.id} label={label} rules={rules} style={{ marginBottom: 16 }}>
          <Radio.Group>
            {(field.options.length > 0 ? field.options : ["Option 1"]).map((o) => <Radio key={o} value={o}>{o}</Radio>)}
          </Radio.Group>
        </Form.Item>
      </Col>
    );
  }
  if (field.type === "attachment") {
    return (
      <Col key={field.id} {...colProps}>
        <Form.Item label={label} style={{ marginBottom: 16 }}>
          <Upload.Dragger multiple style={{ borderRadius: 8 }}>
            <InboxOutlined style={{ fontSize: 28, color: "#2F54EB" }} />
            <div style={{ fontSize: 13, marginTop: 6 }}>Click or drag files</div>
          </Upload.Dragger>
        </Form.Item>
      </Col>
    );
  }

  return (
    <Col key={field.id} {...colProps}>
      <Form.Item name={field.id} label={label} rules={rules} style={{ marginBottom: 16 }}>
        {renderInput(field)}
      </Form.Item>
    </Col>
  );
}

export default function FormSection({ section }: { section: SectionDef }) {
  const rows = groupIntoRows(section.fields);
  if (section.fields.length === 0) return null;

  return (
    <Card style={{ borderRadius: 10, border: "1px solid #e5e7eb", marginBottom: 16 }} styles={{ body: { padding: 0 } }}>
      <div style={{ padding: "12px 20px", borderBottom: "1px solid #f3f4f6", background: "#fafafa" }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>{section.title}</div>
      </div>
      <div style={{ padding: "20px 20px 8px" }}>
        {rows.map((row, ri) => (
          <Row key={ri} gutter={[16, 0]}>
            {row.map((field) => {
              const colProps = field.col === "full" ? { span: 24 } : { flex: "1" as const };
              return <FieldRenderer key={field.id} field={field} colProps={colProps} />;
            })}
          </Row>
        ))}
      </div>
    </Card>
  );
}
