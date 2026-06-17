'use client'
import Button from '@/components/common/antd/Button'
import Input from '@/components/common/antd/Input'
import Select from '@/components/common/antd/Select'
import Switch from '@/components/common/antd/Switch'
import Divider from '@/components/common/antd/Divider'
import Typography from '@/components/common/antd/Typography'
import { PlusOutlined, DeleteOutlined } from '@/components/common/antd/icons'
import { BsXLg } from 'react-icons/bs'
import { useFormBuilder } from './store'
import type { FieldOption } from './types'

const { Text, Title } = Typography

export default function PropertiesPanel() {
  const { form, dispatch, activePanel, setActivePanel } = useFormBuilder()
  if (!activePanel) return null
  const close = () => setActivePanel(null)

  if (activePanel.kind === 'form') {
    return (
      <PanelWrapper title="Form Settings" onClose={close}>
        <PanelField label="Form Title">
          <Input value={form.title} onChange={e => dispatch({ type: 'SET_FORM', payload: { title: e.target.value } })} placeholder="Form title" />
        </PanelField>
        <PanelField label="Description">
          <Input.TextArea value={form.description} rows={3} onChange={e => dispatch({ type: 'SET_FORM', payload: { description: e.target.value } })} placeholder="Form description" />
        </PanelField>
        <Divider style={{ margin: '8px 0' }} />
        <div style={{ background: '#f8fafc', borderRadius: 8, padding: '10px 12px' }}>
          <Text style={{ fontSize: 11, color: '#94a3b8' }}>Form ID</Text><br />
          <Text code style={{ fontSize: 11 }}>{form.id}</Text>
        </div>
      </PanelWrapper>
    )
  }

  if (activePanel.kind === 'section') {
    const section = form.sections.find(s => s.id === activePanel.sectionId)
    if (!section) return null
    const update = (payload: object) => dispatch({ type: 'UPDATE_SECTION', sectionId: section.id, payload })
    return (
      <PanelWrapper title="Section Settings" onClose={close}>
        <PanelField label="Section Title">
          <Input value={section.title} onChange={e => update({ title: e.target.value })} placeholder="Section title" />
        </PanelField>
        <PanelField label="Description">
          <Input.TextArea value={section.description} rows={2} onChange={e => update({ description: e.target.value })} placeholder="Description" />
        </PanelField>
        <PanelField label="Layout">
          <Select value={section.columns} onChange={v => update({ columns: v })} style={{ width: '100%' }}
            options={[{ label: '1 Column', value: 1 }, { label: '2 Columns', value: 2 }]} />
        </PanelField>
        <Divider style={{ margin: '8px 0' }} />
        <Button variant="danger" icon={<DeleteOutlined />} block onClick={() => { dispatch({ type: 'DELETE_SECTION', sectionId: section.id }); close() }}>
          Delete Section
        </Button>
      </PanelWrapper>
    )
  }

  if (activePanel.kind === 'field') {
    const section = form.sections.find(s => s.id === activePanel.sectionId)
    const field = section?.fields.find(f => f.id === activePanel.fieldId)
    if (!section || !field) return null
    const update = (payload: object) => dispatch({ type: 'UPDATE_FIELD', sectionId: section.id, fieldId: field.id, payload })
    const hasOptions = ['select', 'multiselect', 'radio', 'checkbox'].includes(field.type)

    return (
      <PanelWrapper title="Field Settings" onClose={close}>
        <PanelField label="Label">
          <Input value={field.label} onChange={e => update({ label: e.target.value })} placeholder="Field label" />
        </PanelField>
        {!['divider', 'heading'].includes(field.type) && (
          <PanelField label="Placeholder">
            <Input value={field.placeholder} onChange={e => update({ placeholder: e.target.value })} placeholder="Placeholder" />
          </PanelField>
        )}
        <PanelField label="Help Text">
          <Input value={field.description} onChange={e => update({ description: e.target.value })} placeholder="Helper text" />
        </PanelField>
        {section.columns === 2 && (
          <PanelField label="Column Span">
            <Select value={field.colSpan ?? 1} onChange={v => update({ colSpan: v })} style={{ width: '100%' }}
              options={[{ label: 'Half Width (1 col)', value: 1 }, { label: 'Full Width (2 cols)', value: 2 }]} />
          </PanelField>
        )}
        {!['divider', 'heading'].includes(field.type) && (
          <PanelField label="Required">
            <Switch checked={field.required} onChange={v => update({ required: v })} size="small" />
          </PanelField>
        )}
        {hasOptions && (
          <>
            <Divider style={{ margin: '8px 0' }}>
              <Text style={{ fontSize: 11, color: '#94a3b8' }}>Options</Text>
            </Divider>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {(field.options ?? []).map((opt: FieldOption, i: number) => (
                <div key={i} style={{ display: 'flex', gap: 6 }}>
                  <Input size="small" value={opt.label} placeholder="Label"
                    onChange={e => {
                      const opts = [...(field.options ?? [])]
                      opts[i] = { ...opts[i], label: e.target.value }
                      update({ options: opts })
                    }} />
                  <Button size="small" variant="danger" icon={<DeleteOutlined />}
                    onClick={() => update({ options: (field.options ?? []).filter((_, idx) => idx !== i) })} />
                </div>
              ))}
              <Button size="small" variant="dashed" icon={<PlusOutlined />}
                onClick={() => update({ options: [...(field.options ?? []), { label: `Option ${(field.options?.length ?? 0) + 1}`, value: `option_${Date.now()}` }] })}>
                Add Option
              </Button>
            </div>
          </>
        )}
        <Divider style={{ margin: '8px 0' }} />
        <Button variant="danger" icon={<DeleteOutlined />} block
          onClick={() => { dispatch({ type: 'DELETE_FIELD', sectionId: section.id, fieldId: field.id }); close() }}>
          Delete Field
        </Button>
      </PanelWrapper>
    )
  }

  return null
}

function PanelWrapper({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 16px 12px', borderBottom: '1px solid #f1f5f9' }}>
        <Title level={5} style={{ margin: 0, fontSize: 14, color: '#1e293b' }}>{title}</Title>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: 14, display: 'flex', alignItems: 'center' }}>
          <BsXLg />
        </button>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {children}
      </div>
    </div>
  )
}

function PanelField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <Text style={{ fontSize: 12, fontWeight: 500, color: '#64748b' }}>{label}</Text>
      {children}
    </div>
  )
}
