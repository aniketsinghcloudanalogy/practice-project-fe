'use client'
import { useDraggable } from '@dnd-kit/core'
import {
  FileTextOutlined, PlusSquareOutlined, FontSizeOutlined, UnorderedListOutlined,
  DownOutlined, CalendarOutlined, ClockCircleOutlined, DollarOutlined,
  PhoneOutlined, MailOutlined, AlignLeftOutlined, TableOutlined,
  PaperClipOutlined, CheckSquareOutlined, RadiusSettingOutlined,
  SwitcherOutlined, MinusOutlined,
} from '@ant-design/icons'
import { useFormBuilder } from './store'
import type { FieldType } from './types'

const CATEGORIES = [
  {
    label: 'Text Fields',
    items: [
      { type: 'text-content' as FieldType, label: 'Text Content', icon: <FileTextOutlined /> },
      { type: 'add-section' as FieldType, label: 'Add Section', icon: <PlusSquareOutlined /> },
    ],
  },
  {
    label: 'Fields',
    items: [
      { type: 'text' as FieldType, label: 'Text', icon: <FontSizeOutlined /> },
      { type: 'multi-select' as FieldType, label: 'Multi-Select', icon: <UnorderedListOutlined /> },
      { type: 'drop-down' as FieldType, label: 'Drop Down', icon: <DownOutlined /> },
      { type: 'date' as FieldType, label: 'Date', icon: <CalendarOutlined /> },
      { type: 'time' as FieldType, label: 'Time', icon: <ClockCircleOutlined /> },
      { type: 'currency' as FieldType, label: 'Currency', icon: <DollarOutlined /> },
      { type: 'contact' as FieldType, label: 'Contact', icon: <PhoneOutlined /> },
      { type: 'email' as FieldType, label: 'Email', icon: <MailOutlined /> },
      { type: 'textarea' as FieldType, label: 'Textarea', icon: <AlignLeftOutlined /> },
    ],
  },
  {
    label: 'Sections',
    items: [
      { type: 'table' as FieldType, label: 'Table', icon: <TableOutlined /> },
      { type: 'attachment' as FieldType, label: 'Attachment', icon: <PaperClipOutlined /> },
    ],
  },
  {
    label: 'Elements',
    items: [
      { type: 'checkbox' as FieldType, label: 'Checkbox', icon: <CheckSquareOutlined /> },
      { type: 'radio' as FieldType, label: 'Radio Button', icon: <RadiusSettingOutlined /> },
      { type: 'toggle' as FieldType, label: 'Toggle', icon: <SwitcherOutlined /> },
      { type: 'line-break' as FieldType, label: 'Line Break', icon: <MinusOutlined /> },
    ],
  },
]

export { CATEGORIES }

function DraggableTile({ type, label, icon }: { type: FieldType; label: string; icon: React.ReactNode }) {
  const { dispatch, form } = useFormBuilder()
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `tile-${type}`,
    data: { type, source: 'sidebar' },
  })

  function handleClick() {
    // Add to the first section, or last active section
    const targetSection = form.sections[form.sections.length - 1]
    if (targetSection) {
      dispatch({ type: 'ADD_FIELD', sectionId: targetSection.id, fieldType: type })
    }
  }

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      onClick={handleClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '8px 10px',
        borderRadius: 8,
        border: '1px solid transparent',
        background: isDragging ? '#e6edff' : 'transparent',
        cursor: 'grab',
        userSelect: 'none',
        opacity: isDragging ? 0.6 : 1,
        transition: 'all 0.15s',
        touchAction: 'none',
      }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLElement
        el.style.background = '#eef2ff'
        el.style.borderColor = '#c7d4f8'
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLElement
        el.style.background = 'transparent'
        el.style.borderColor = 'transparent'
      }}
    >
      <span style={{
        width: 30, height: 30, borderRadius: 7, background: '#eef2ff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#2F54EB', fontSize: 14, flexShrink: 0,
      }}>
        {icon}
      </span>
      <span style={{ fontSize: 13, color: '#374151', fontWeight: 500, lineHeight: 1.3 }}>{label}</span>
    </div>
  )
}

export default function FieldPalette() {
  return (
    <div style={{ padding: '16px 8px' }}>
      <div style={{ padding: '0 8px 8px', marginBottom: 4 }}>
        <span style={{ fontSize: 10, color: '#9ca3af', letterSpacing: '0.5px' }}>
          Click or drag to add
        </span>
      </div>
      {CATEGORIES.map(cat => (
        <div key={cat.label} style={{ marginTop: 12 }}>
          <div style={{ fontSize: 10.5, fontWeight: 600, color: '#9ca3af', letterSpacing: '0.6px', textTransform: 'uppercase', padding: '0 10px', marginBottom: 2 }}>
            {cat.label}
          </div>
          {cat.items.map(item => (
            <DraggableTile key={item.type} type={item.type} label={item.label} icon={item.icon} />
          ))}
        </div>
      ))}
    </div>
  )
}
