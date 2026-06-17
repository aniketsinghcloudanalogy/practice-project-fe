'use client'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useDroppable } from '@dnd-kit/core'
import Typography from '@/components/common/antd/Typography'
import Button from '@/components/common/antd/Button'
import Tooltip from '@/components/common/antd/Tooltip'
import Tag from '@/components/common/antd/Tag'
import { PlusOutlined } from '@/components/common/antd/icons'
import { BsGripVertical, BsLayoutSplit, BsLayoutThreeColumns, BsGear } from 'react-icons/bs'
import { useFormBuilder } from './store'
import DraggableField from './DraggableField'
import type { FormSection, FieldType } from './types'

const { Text, Title } = Typography

interface Props {
  section: FormSection
  onAddField: (sectionId: string, type: FieldType) => void
}

function DroppableFieldArea({ sectionId, children }: { sectionId: string; children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id: `droppable_${sectionId}` })
  return (
    <div
      ref={setNodeRef}
      style={{
        minHeight: 60, borderRadius: 8, padding: 4, transition: 'all 0.15s',
        border: `1.5px dashed ${isOver ? '#7c3aed' : '#e2e8f0'}`,
        background: isOver ? 'rgba(124,58,237,0.03)' : 'transparent',
      }}
    >
      {children}
    </div>
  )
}

export default function DraggableSection({ section, onAddField }: Props) {
  const { setActivePanel, activePanel } = useFormBuilder()
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: section.id })

  const isActive = activePanel?.kind === 'section' && activePanel.sectionId === section.id

  const gridStyle: React.CSSProperties =
    section.columns === 2
      ? { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }
      : { display: 'flex', flexDirection: 'column', gap: 8 }

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.45 : 1,
        border: `1.5px solid ${isActive ? '#7c3aed' : '#e2e8f0'}`,
        borderRadius: 14,
        background: '#fff',
        boxShadow: isActive ? '0 0 0 3px rgba(124,58,237,0.1), 0 4px 16px rgba(0,0,0,0.06)' : '0 2px 8px rgba(0,0,0,0.05)',
        overflow: 'hidden',
      }}
    >
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8, padding: '12px 14px',
        background: isActive ? 'linear-gradient(90deg,#fdf4ff,#f5f3ff)' : '#f8fafc',
        borderBottom: '1px solid #f1f5f9',
      }}>
        <div {...attributes} {...listeners} style={{ color: '#cbd5e1', cursor: 'grab', fontSize: 16, display: 'flex', alignItems: 'center' }}>
          <BsGripVertical />
        </div>
        <div style={{ flex: 1 }}>
          <Title level={5} style={{ margin: 0, fontSize: 14, color: '#1e293b' }}>
            {section.title || 'Untitled Section'}
          </Title>
          {section.description && <Text style={{ fontSize: 12, color: '#94a3b8' }}>{section.description}</Text>}
        </div>
        <Tag variant="purple" icon={section.columns === 2 ? <BsLayoutSplit style={{ marginRight: 4 }} /> : <BsLayoutThreeColumns style={{ marginRight: 4 }} />}>
          {section.columns === 2 ? '2 Col' : '1 Col'}
        </Tag>
        <Tooltip title="Section settings">
          <Button
            variant="ghost"
            size="small"
            icon={<BsGear />}
            style={{ color: isActive ? '#7c3aed' : '#94a3b8' }}
            onClick={() => setActivePanel({ kind: 'section', sectionId: section.id })}
          />
        </Tooltip>
      </div>

      <div style={{ padding: 12 }}>
        <SortableContext items={section.fields.map(f => f.id)} strategy={verticalListSortingStrategy}>
          <DroppableFieldArea sectionId={section.id}>
            <div style={gridStyle}>
              {section.fields.length === 0 && (
                <div style={{ gridColumn: section.columns === 2 ? 'span 2' : undefined, textAlign: 'center', padding: '20px 0' }}>
                  <Text style={{ fontSize: 13, color: '#cbd5e1' }}>Click a field type on the left to add fields</Text>
                </div>
              )}
              {section.fields.map(field => (
                <DraggableField key={field.id} field={field} sectionId={section.id} columns={section.columns} />
              ))}
            </div>
          </DroppableFieldArea>
        </SortableContext>

        <Button
          variant="dashed"
          icon={<PlusOutlined />}
          size="small"
          style={{ marginTop: 10, width: '100%' }}
          onClick={() => onAddField(section.id, 'text')}
        >
          Add Text Field
        </Button>
      </div>
    </div>
  )
}
