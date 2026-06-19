'use client'
import { useState } from 'react'
import { Input, Select, DatePicker, TimePicker, Checkbox, Switch, Divider, Space } from 'antd'
import {
  ExpandOutlined, CompressOutlined, DeleteOutlined, HolderOutlined, CopyOutlined,
  FileTextOutlined, PlusSquareOutlined, FontSizeOutlined, UnorderedListOutlined,
  DownOutlined, CalendarOutlined, ClockCircleOutlined, DollarOutlined,
  PhoneOutlined, MailOutlined, AlignLeftOutlined, TableOutlined,
  PaperClipOutlined, CheckSquareOutlined, RadiusSettingOutlined,
  SwitcherOutlined, MinusOutlined,
} from '@ant-design/icons'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useFormBuilder } from './store'
import type { FieldDef, ColSpan, FieldType } from './types'

const ICONS: Record<FieldType, React.ReactNode> = {
  'text-content': <FileTextOutlined />, 'add-section': <PlusSquareOutlined />,
  'text': <FontSizeOutlined />, 'multi-select': <UnorderedListOutlined />,
  'drop-down': <DownOutlined />, 'date': <CalendarOutlined />,
  'time': <ClockCircleOutlined />, 'currency': <DollarOutlined />,
  'contact': <PhoneOutlined />, 'email': <MailOutlined />,
  'textarea': <AlignLeftOutlined />, 'table': <TableOutlined />,
  'attachment': <PaperClipOutlined />, 'checkbox': <CheckSquareOutlined />,
  'radio': <RadiusSettingOutlined />, 'toggle': <SwitcherOutlined />,
  'line-break': <MinusOutlined />,
}

const COL_LABELS: Record<ColSpan, string> = { begin: '1/3', mid: '2/3', end: '3/3', full: 'Full' }

// Live preview reflects field.label and field.placeholder in real time
function FieldPreview({ field }: { field: FieldDef }) {
  const stop: React.CSSProperties = { pointerEvents: 'none' }
  const ph = field.placeholder || `Enter ${field.label}`
  switch (field.type) {
    case 'text': case 'text-content': case 'add-section':
      return <Input size="small" placeholder={ph} style={stop} />
    case 'contact':
      return <Input size="small" type="tel" placeholder={field.placeholder || 'Phone number'} style={stop} />
    case 'email':
      return <Input size="small" type="email" placeholder={field.placeholder || 'Email address'} style={stop} />
    case 'textarea':
      return <Input.TextArea size="small" rows={2} placeholder={field.placeholder || 'Enter text...'} style={stop} />
    case 'drop-down':
      return <Select size="small" style={{ width: '100%', ...stop }} placeholder={field.placeholder || 'Select option'} options={field.options.map(o => ({ label: o, value: o }))} open={false} />
    case 'multi-select':
      return <Select size="small" mode="multiple" style={{ width: '100%', ...stop }} placeholder={field.placeholder || 'Select options'} options={field.options.map(o => ({ label: o, value: o }))} open={false} />
    case 'date':
      return <DatePicker size="small" style={{ width: '100%', ...stop }} placeholder="Pick a date" inputReadOnly />
    case 'time':
      return <TimePicker size="small" style={{ width: '100%', ...stop }} placeholder="Pick a time" inputReadOnly />
    case 'currency':
      return (
        <Space.Compact size="small" style={{ width: '100%', pointerEvents: 'none' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', padding: '0 8px', background: '#fafafa', border: '1px solid #d9d9d9', borderRight: 'none', borderRadius: '6px 0 0 6px', fontSize: 12, color: '#6b7280', whiteSpace: 'nowrap' }}>USD</span>
          <Input size="small" placeholder="0.00" style={stop} />
        </Space.Compact>
      )
    case 'checkbox':
      return <Checkbox style={stop}>{field.options[0] || field.label}</Checkbox>
    case 'toggle':
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, pointerEvents: 'none' }}>
          <Switch size="small" />
          <span style={{ fontSize: 12, color: '#6b7280' }}>{field.label}</span>
        </div>
      )
    case 'line-break':
      return <Divider style={{ margin: '2px 0' }} />
    default:
      return <Input size="small" placeholder={ph} style={stop} />
  }
}

interface Props { field: FieldDef; sectionId: string }

export default function FieldCard({ field, sectionId }: Props) {
  const { dispatch, activeFieldId, setActiveField } = useFormBuilder()
  const [hovered, setHovered] = useState(false)
  const isActive = activeFieldId === field.id

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: field.id,
    data: { fieldId: field.id, sectionId, source: 'canvas' },
    animateLayoutChanges: () => false,
  })

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition: transition ? `${transition}, box-shadow 0.15s, border-color 0.15s` : 'transform 200ms ease, box-shadow 0.15s, border-color 0.15s',
        opacity: isDragging ? 0.3 : 1,
        position: 'relative',
        borderRadius: 8,
        border: `1.5px solid ${isActive ? '#2F54EB' : hovered ? '#c7d4f8' : '#e5e7eb'}`,
        background: isActive ? '#f5f8ff' : '#ffffff',
        cursor: 'pointer',
        overflow: 'hidden',
        boxShadow: isDragging ? '0 8px 20px rgba(47,84,235,0.15)' : isActive ? '0 0 0 3px rgba(47,84,235,0.1)' : 'none',
      }}
      onClick={() => setActiveField(sectionId, field.id)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Left drag strip — isolated from click */}
      <span
        {...attributes}
        {...listeners}
        onClick={e => e.stopPropagation()}
        style={{
          position: 'absolute', top: 0, left: 0, bottom: 0, width: 20,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: hovered ? '#9ca3af' : '#d1d5db',
          cursor: 'grab', fontSize: 13, touchAction: 'none',
          borderRight: `1px solid ${hovered ? '#e5e7eb' : '#f3f4f6'}`,
          background: hovered ? '#fafafa' : 'transparent',
          transition: 'all 0.15s',
          zIndex: 1,
        }}
      >
        <HolderOutlined />
      </span>

      {/* Card content */}
      <div style={{ padding: '8px 8px 8px 28px' }}>
        {/* Top row: badge + actions */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: 20, height: 20, borderRadius: 5, background: '#eef2ff', color: '#2F54EB', fontSize: 11,
            }}>
              {ICONS[field.type]}
            </span>
            <span style={{ fontSize: 11, color: '#9ca3af', fontWeight: 500 }}>
              {field.type.replace(/-/g, ' ')}
            </span>
          </div>
          <div style={{ display: 'flex', gap: 3, opacity: hovered || isActive ? 1 : 0, transition: 'opacity 0.15s' }}>
            <button
              title={field.col === 'full' ? 'Collapse' : 'Full width'}
              onClick={e => {
                e.stopPropagation()
                dispatch({ type: 'UPDATE_FIELD', sectionId, fieldId: field.id, payload: { col: field.col === 'full' ? 'begin' : 'full' } })
              }}
              style={{ background: '#f3f4ff', border: '1px solid #c7d4f8', borderRadius: 4, cursor: 'pointer', color: '#2F54EB', padding: '2px 5px', fontSize: 11, display: 'flex', alignItems: 'center' }}
            >
              {field.col === 'full' ? <CompressOutlined /> : <ExpandOutlined />}
            </button>
            <button
              title="Duplicate"
              onClick={e => { e.stopPropagation(); dispatch({ type: 'DUPLICATE_FIELD', sectionId, fieldId: field.id }) }}
              style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 4, cursor: 'pointer', color: '#16a34a', padding: '2px 5px', fontSize: 11, display: 'flex', alignItems: 'center' }}
            >
              <CopyOutlined />
            </button>
            <button
              title="Delete"
              onClick={e => { e.stopPropagation(); dispatch({ type: 'DELETE_FIELD', sectionId, fieldId: field.id }) }}
              style={{ background: '#fff5f5', border: '1px solid #fca5a5', borderRadius: 4, cursor: 'pointer', color: '#ef4444', padding: '2px 5px', fontSize: 11, display: 'flex', alignItems: 'center' }}
            >
              <DeleteOutlined />
            </button>
          </div>
        </div>

        {/* Label — updates live from PropertiesPanel */}
        <div style={{ fontSize: 12.5, fontWeight: 600, color: '#111827', marginBottom: 6, lineHeight: 1.3 }}>
          {field.label}
          {field.required && <span style={{ color: '#ef4444', marginLeft: 3, fontWeight: 700 }}>*</span>}
        </div>

        {/* Input preview — reflects placeholder live */}
        <FieldPreview field={field} />

        {/* Col badge */}
        <div style={{ marginTop: 6 }}>
          <span style={{
            fontSize: 10, color: '#6b7280', background: '#f9fafb',
            border: '1px solid #e5e7eb', borderRadius: 4, padding: '1px 5px',
          }}>
            {COL_LABELS[field.col]}
          </span>
        </div>
      </div>
    </div>
  )
}
