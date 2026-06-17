'use client'
import Typography from '@/components/common/antd/Typography'
import Tooltip from '@/components/common/antd/Tooltip'
import {
  BsInputCursorText, BsTextareaResize, BsHash, BsEnvelope, BsTelephone,
  BsChevronDown, BsListCheck, BsCheckSquare, BsRecordCircle,
  BsCalendar, BsPaperclip, BsDash, BsTypeH1,
} from 'react-icons/bs'
import type { FieldType } from './types'

const { Text } = Typography

interface FieldDef {
  type: FieldType
  label: string
  icon: React.ReactNode
  color: string
}

export const FIELD_DEFS: FieldDef[] = [
  { type: 'text',        label: 'Text',         icon: <BsInputCursorText />, color: '#7c3aed' },
  { type: 'textarea',    label: 'Textarea',     icon: <BsTextareaResize />, color: '#2563eb' },
  { type: 'number',      label: 'Number',       icon: <BsHash />,           color: '#059669' },
  { type: 'email',       label: 'Email',        icon: <BsEnvelope />,       color: '#dc2626' },
  { type: 'phone',       label: 'Phone',        icon: <BsTelephone />,      color: '#ea580c' },
  { type: 'select',      label: 'Select',       icon: <BsChevronDown />,    color: '#7c3aed' },
  { type: 'multiselect', label: 'Multi Select', icon: <BsListCheck />,      color: '#0891b2' },
  { type: 'checkbox',    label: 'Checkbox',     icon: <BsCheckSquare />,    color: '#16a34a' },
  { type: 'radio',       label: 'Radio',        icon: <BsRecordCircle />,   color: '#9333ea' },
  { type: 'date',        label: 'Date',         icon: <BsCalendar />,       color: '#d97706' },
  { type: 'file',        label: 'File Upload',  icon: <BsPaperclip />,      color: '#475569' },
  { type: 'divider',     label: 'Divider',      icon: <BsDash />,           color: '#94a3b8' },
  { type: 'heading',     label: 'Heading',      icon: <BsTypeH1 />,         color: '#1e293b' },
]

interface Props {
  onAdd: (type: FieldType) => void
}

export default function FieldPalette({ onAdd }: Props) {
  return (
    <div style={{ padding: '16px 12px' }}>
      <Text style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', letterSpacing: 1, textTransform: 'uppercase', display: 'block', marginBottom: 12 }}>
        Form Elements
      </Text>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {FIELD_DEFS.map(def => (
          <Tooltip key={def.type} title={`Add ${def.label}`} placement="right">
            <button
              onClick={() => onAdd(def.type)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 12px', borderRadius: 8,
                border: '1px solid transparent', background: 'transparent',
                cursor: 'pointer', width: '100%', textAlign: 'left', transition: 'all 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#f8f5ff'; e.currentTarget.style.borderColor = '#e9d5ff' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent' }}
            >
              <span style={{ fontSize: 16, color: def.color, minWidth: 20, display: 'flex', alignItems: 'center' }}>
                {def.icon}
              </span>
              <Text style={{ fontSize: 13, color: '#374151', fontWeight: 500 }}>{def.label}</Text>
            </button>
          </Tooltip>
        ))}
      </div>
    </div>
  )
}
