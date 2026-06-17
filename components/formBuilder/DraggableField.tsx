'use client'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import Typography from '@/components/common/antd/Typography'
import Tag from '@/components/common/antd/Tag'
import Tooltip from '@/components/common/antd/Tooltip'
import { DeleteOutlined } from '@/components/common/antd/icons'
import { BsGripVertical } from 'react-icons/bs'
import { useFormBuilder } from './store'
import { FIELD_DEFS } from './FieldPalette'
import type { FormField } from './types'

const { Text } = Typography

interface Props {
  field: FormField
  sectionId: string
  columns: 1 | 2
}

export default function DraggableField({ field, sectionId, columns }: Props) {
  const { dispatch, setActivePanel, activePanel } = useFormBuilder()
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: field.id })

  const isActive = activePanel?.kind === 'field' && activePanel.fieldId === field.id
  const def = FIELD_DEFS.find(d => d.type === field.type)

  const colStyle: React.CSSProperties =
    columns === 2 && field.colSpan === 2 ? { gridColumn: 'span 2' } : {}

  return (
    <div
      ref={setNodeRef}
      style={{
        ...colStyle,
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
        border: `1.5px solid ${isActive ? '#7c3aed' : '#e2e8f0'}`,
        borderRadius: 10,
        background: isActive ? '#fdf4ff' : '#fff',
        boxShadow: isActive ? '0 0 0 3px rgba(124,58,237,0.1)' : '0 1px 3px rgba(0,0,0,0.06)',
        cursor: 'pointer',
        position: 'relative',
      }}
      onClick={() => setActivePanel({ kind: 'field', sectionId, fieldId: field.id })}
    >
      <div
        {...attributes}
        {...listeners}
        style={{
          position: 'absolute', left: 0, top: 0, bottom: 0, width: 28,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#cbd5e1', cursor: 'grab', borderRadius: '10px 0 0 10px', fontSize: 15,
        }}
        onClick={e => e.stopPropagation()}
      >
        <BsGripVertical />
      </div>

      <div style={{ padding: '10px 36px 10px 32px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ color: def?.color ?? '#7c3aed', fontSize: 15, display: 'flex', alignItems: 'center' }}>
          {def?.icon}
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <Text style={{ fontSize: 13, fontWeight: 500, color: '#1e293b', display: 'block' }}>
            {field.label}
            {field.required && <span style={{ color: '#ef4444', marginLeft: 3 }}>*</span>}
          </Text>
          {field.description && <Text style={{ fontSize: 11, color: '#94a3b8' }}>{field.description}</Text>}
        </div>
        <Tag variant="slate">{field.type}</Tag>
      </div>

      <Tooltip title="Delete field">
        <button
          style={{
            position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#cbd5e1', fontSize: 13, padding: 4, borderRadius: 4, display: 'flex', alignItems: 'center',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = '#ef4444')}
          onMouseLeave={e => (e.currentTarget.style.color = '#cbd5e1')}
          onClick={e => { e.stopPropagation(); dispatch({ type: 'DELETE_FIELD', sectionId, fieldId: field.id }) }}
        >
          <DeleteOutlined />
        </button>
      </Tooltip>
    </div>
  )
}
