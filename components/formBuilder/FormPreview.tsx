'use client'
import { Checkbox, Radio, DatePicker, Upload } from 'antd'
import { InputNumber } from 'antd'
import Form from '@/components/common/antd/Form'
import Input from '@/components/common/antd/Input'
import Select from '@/components/common/antd/Select'
import Button from '@/components/common/antd/Button'
import Divider from '@/components/common/antd/Divider'
import Typography from '@/components/common/antd/Typography'
import { UploadOutlined } from '@/components/common/antd/icons'
import { useFormBuilder } from './store'
import type { FormField, FormSection } from './types'

const { Title, Text, Paragraph } = Typography

function PreviewField({ field }: { field: FormField }) {
  const rules = field.required ? [{ required: true, message: `${field.label} is required` }] : []
  if (field.type === 'divider') return <Divider style={{ margin: '4px 0' }} />
  if (field.type === 'heading') return <Title level={5} style={{ margin: '8px 0 4px', color: '#1e293b' }}>{field.label}</Title>

  return (
    <Form.Item
      label={<Text style={{ fontWeight: 500, fontSize: 13 }}>{field.label}</Text>}
      rules={rules}
      extra={field.description ? <Text style={{ fontSize: 11, color: '#94a3b8' }}>{field.description}</Text> : undefined}
    >
      {field.type === 'text' && <Input placeholder={field.placeholder} />}
      {field.type === 'textarea' && <Input.TextArea placeholder={field.placeholder} rows={3} />}
      {field.type === 'number' && <InputNumber placeholder={field.placeholder} style={{ width: '100%', borderRadius: 8 }} />}
      {field.type === 'email' && <Input type="email" placeholder={field.placeholder} />}
      {field.type === 'phone' && <Input type="tel" placeholder={field.placeholder} />}
      {field.type === 'date' && <DatePicker style={{ width: '100%', borderRadius: 8 }} />}
      {field.type === 'select' && (
        <Select placeholder={field.placeholder} style={{ width: '100%' }}
          options={field.options?.map(o => ({ label: o.label, value: o.value }))} />
      )}
      {field.type === 'multiselect' && (
        <Select mode="multiple" placeholder={field.placeholder} style={{ width: '100%' }}
          options={field.options?.map(o => ({ label: o.label, value: o.value }))} />
      )}
      {field.type === 'radio' && (
        <Radio.Group>
          {field.options?.map(o => <Radio key={o.value} value={o.value}>{o.label}</Radio>)}
        </Radio.Group>
      )}
      {field.type === 'checkbox' && (
        <Checkbox.Group options={field.options?.map(o => ({ label: o.label, value: o.value }))} />
      )}
      {field.type === 'file' && (
        <Upload><Button variant="ghost" icon={<UploadOutlined />}>Click to Upload</Button></Upload>
      )}
    </Form.Item>
  )
}

function PreviewSection({ section }: { section: FormSection }) {
  const gridStyle: React.CSSProperties =
    section.columns === 2 ? { display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: 16 } : {}

  return (
    <div style={{ border: '1px solid #f1f5f9', borderRadius: 12, background: '#fff', overflow: 'hidden', marginBottom: 16 }}>
      <div style={{ padding: '12px 16px', background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
        <Title level={5} style={{ margin: 0, fontSize: 14, color: '#1e293b' }}>{section.title}</Title>
        {section.description && <Text style={{ fontSize: 12, color: '#64748b' }}>{section.description}</Text>}
      </div>
      <div style={{ padding: 16 }}>
        <div style={gridStyle}>
          {section.fields.map(field => (
            <div key={field.id} style={section.columns === 2 && field.colSpan === 2 ? { gridColumn: 'span 2' } : {}}>
              <PreviewField field={field} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function FormPreview() {
  const { form } = useFormBuilder()
  return (
    <div style={{ padding: '4px 0' }}>
      <div style={{ maxWidth: 680, margin: '0 auto' }}>
        <div style={{ padding: '20px 24px', borderRadius: 14, background: 'linear-gradient(135deg,#7c3aed,#a855f7)', marginBottom: 20 }}>
          <Title level={3} style={{ margin: 0, color: '#fff', fontSize: 20 }}>{form.title}</Title>
          {form.description && <Paragraph style={{ margin: '6px 0 0', color: 'rgba(255,255,255,0.85)', fontSize: 13 }}>{form.description}</Paragraph>}
        </div>
        <Form layout="vertical">
          {form.sections.map(section => <PreviewSection key={section.id} section={section} />)}
          <Button variant="primary" htmlType="submit" style={{ width: '100%', height: 44, borderRadius: 10, fontWeight: 600 }}>
            Submit Form
          </Button>
        </Form>
      </div>
    </div>
  )
}
