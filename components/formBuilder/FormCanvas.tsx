'use client'
import { useState } from 'react'
import {
  DndContext, PointerSensor, useSensor, useSensors, closestCenter,
} from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable'
import Button from '@/components/common/antd/Button'
import Typography from '@/components/common/antd/Typography'
import Tooltip from '@/components/common/antd/Tooltip'
import { PlusOutlined, SettingOutlined } from '@/components/common/antd/icons'
import { useFormBuilder } from './store'
import DraggableSection from './DraggableSection'
import type { DragEndEvent } from '@dnd-kit/core'
import type { FieldType } from './types'

const { Title, Text } = Typography

export default function FormCanvas() {
  const { form, dispatch, setActivePanel, addField } = useFormBuilder()
  const [, setActiveId] = useState<string | null>(null)
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))

  function onDragEnd({ active, over }: DragEndEvent) {
    setActiveId(null)
    if (!over || active.id === over.id) return
    const activeIdStr = active.id as string
    const overIdStr = over.id as string
    const sectionIds = form.sections.map(s => s.id)

    if (sectionIds.includes(activeIdStr) && sectionIds.includes(overIdStr)) {
      dispatch({ type: 'REORDER_SECTIONS', ids: arrayMove(sectionIds, sectionIds.indexOf(activeIdStr), sectionIds.indexOf(overIdStr)) })
      return
    }

    for (const section of form.sections) {
      const fieldIds = section.fields.map(f => f.id)
      if (!fieldIds.includes(activeIdStr)) continue

      if (fieldIds.includes(overIdStr)) {
        dispatch({ type: 'REORDER_FIELDS', sectionId: section.id, ids: arrayMove(fieldIds, fieldIds.indexOf(activeIdStr), fieldIds.indexOf(overIdStr)) })
        return
      }
      if (overIdStr.startsWith('droppable_')) {
        const targetId = overIdStr.replace('droppable_', '')
        if (targetId !== section.id)
          dispatch({ type: 'MOVE_FIELD', fromSection: section.id, toSection: targetId, fieldId: activeIdStr, toIndex: form.sections.find(s => s.id === targetId)?.fields.length ?? 0 })
        return
      }
      for (const other of form.sections) {
        if (other.id === section.id) continue
        const otherIds = other.fields.map(f => f.id)
        if (otherIds.includes(overIdStr)) {
          dispatch({ type: 'MOVE_FIELD', fromSection: section.id, toSection: other.id, fieldId: activeIdStr, toIndex: otherIds.indexOf(overIdStr) })
          return
        }
      }
    }
  }

  return (
    <div>
      {/* Form title bar */}
      <div
        style={{
          padding: '14px 16px',
          background: 'linear-gradient(135deg, #fdf4ff 0%, #f5f3ff 100%)',
          border: '1px solid #e9d5ff',
          borderRadius: 10,
          cursor: 'pointer',
          marginBottom: 12,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
        onClick={() => setActivePanel({ kind: 'form' })}
      >
        <div>
          <Title level={5} style={{ margin: 0, color: '#1e293b', fontSize: 15 }}>{form.title}</Title>
          {form.description && <Text style={{ color: '#64748b', fontSize: 12 }}>{form.description}</Text>}
        </div>
        <Tooltip title="Edit form settings">
          <Button variant="ghost" size="small" icon={<SettingOutlined />} style={{ color: '#7c3aed' }} />
        </Tooltip>
      </div>

      {/* Sections */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={({ active }) => setActiveId(active.id as string)} onDragEnd={onDragEnd}>
        <SortableContext items={form.sections.map(s => s.id)} strategy={verticalListSortingStrategy}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {form.sections.map(section => (
              <DraggableSection key={section.id} section={section} onAddField={(id: string, type: FieldType) => addField(id, type)} />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <Button
        variant="dashed"
        icon={<PlusOutlined />}
        block
        style={{ marginTop: 12, height: 44, borderRadius: 10, fontWeight: 500 }}
        onClick={() => dispatch({ type: 'ADD_SECTION' })}
      >
        Add Section
      </Button>
    </div>
  )
}
