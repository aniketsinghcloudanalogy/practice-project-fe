'use client'
import { useState, useEffect } from 'react'
import { Button, Input, Switch, Divider } from 'antd'
import { PlusOutlined, DeleteOutlined, HolderOutlined, CloseOutlined, CopyOutlined } from '@ant-design/icons'
import {
  DndContext, PointerSensor, useSensor, useSensors, closestCenter, type DragEndEvent,
} from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, arrayMove, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useFormBuilder } from './store'
import type { FieldDef, ColSpan } from './types'

const COL_OPTIONS: { value: ColSpan; label: string }[] = [
  { value: 'begin', label: '1/3' }, { value: 'mid', label: '2/3' },
  { value: 'end', label: '3/3' }, { value: 'full', label: 'Full' },
]

const HAS_OPTIONS = ['multi-select', 'drop-down', 'radio']

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 11.5, fontWeight: 600, color: '#6b7280', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
      {children}
    </div>
  )
}

function SortableOption({ opt, idx, onChange, onDelete }: {
  opt: string; idx: number; onChange: (v: string) => void; onDelete: () => void
}) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
    id: `opt-${idx}`, animateLayoutChanges: () => false,
  })
  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition: transition ?? 'transform 200ms ease',
        opacity: isDragging ? 0.4 : 1,
        display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5,
      }}
    >
      <span
        ref={setActivatorNodeRef}
        {...attributes}
        {...listeners}
        style={{ color: '#d1d5db', cursor: 'grab', display: 'flex', fontSize: 14, touchAction: 'none', flexShrink: 0 }}
      >
        <HolderOutlined />
      </span>
      <Input
        size="small"
        value={opt}
        onChange={e => onChange(e.target.value)}
        style={{ flex: 1, fontSize: 13 }}
        placeholder={`Option ${idx + 1}`}
      />
      <button
        onClick={onDelete}
        style={{
          background: 'none', border: '1px solid #fca5a5', borderRadius: 5,
          cursor: 'pointer', color: '#ef4444', padding: '3px 7px',
          display: 'flex', alignItems: 'center', fontSize: 12, flexShrink: 0,
          transition: 'background 0.15s',
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#fff5f5' }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'none' }}
      >
        <DeleteOutlined />
      </button>
    </div>
  )
}

export default function PropertiesPanel() {
  const { form, dispatch, activeFieldId, activeSectionId, setActiveField, snapshot } = useFormBuilder()

  const section = form.sections.find(s => s.id === activeSectionId)
  const field = section?.fields.find(f => f.id === activeFieldId)

  // localOptions synced to current field — updates on field switch AND when field.options changes externally
  const [localOptions, setLocalOptions] = useState<string[]>(field?.options ?? [])

  useEffect(() => {
    if (field) setLocalOptions([...(field.options ?? [])])
  }, [activeFieldId, field?.options?.length])

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  if (!field || !section) return null

  const push = (payload: Partial<FieldDef>) =>
    dispatch({ type: 'UPDATE_FIELD', sectionId: section.id, fieldId: field.id, payload })

  const pushOptions = (opts: string[]) => {
    setLocalOptions(opts)
    dispatch({ type: 'UPDATE_FIELD', sectionId: section.id, fieldId: field.id, payload: { options: opts } })
  }

  const onOptionDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return
    const ids = localOptions.map((_, i) => `opt-${i}`)
    const from = ids.indexOf(active.id as string)
    const to = ids.indexOf(over.id as string)
    if (from >= 0 && to >= 0) {
      snapshot()
      pushOptions(arrayMove(localOptions, from, to))
    }
  }

  const handleDuplicate = () => {
    dispatch({ type: 'DUPLICATE_FIELD', sectionId: section.id, fieldId: field.id })
  }

  const handleDelete = () => {
    dispatch({ type: 'DELETE_FIELD', sectionId: section.id, fieldId: field.id })
    setActiveField(null, null)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 14px', borderBottom: '1px solid #f3f4f6', background: '#fff',
        flexShrink: 0,
      }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>
            {field.type.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
          </div>
          <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 1 }}>Field Properties</div>
        </div>
        <button
          onClick={() => setActiveField(null, null)}
          style={{
            background: '#f9fafb', border: '1px solid #e5e7eb', cursor: 'pointer',
            color: '#6b7280', display: 'flex', fontSize: 12, padding: '5px 7px', borderRadius: 6,
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#f3f4f6' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#f9fafb' }}
        >
          <CloseOutlined />
        </button>
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 14px 0' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          <div>
            <Label>Label</Label>
            <Input
              value={field.label}
              onChange={e => push({ label: e.target.value })}
              onBlur={snapshot}
              placeholder="Field label"
            />
          </div>

          <div>
            <Label>Placeholder</Label>
            <Input
              value={field.placeholder}
              onChange={e => push({ placeholder: e.target.value })}
              onBlur={snapshot}
              placeholder="Placeholder text"
            />
          </div>

          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '10px 12px', border: '1px solid #f3f4f6', borderRadius: 8, background: '#fafafa',
          }}>
            <div>
              <div style={{ fontSize: 13, color: '#111827', fontWeight: 500 }}>Required</div>
              <div style={{ fontSize: 11, color: '#9ca3af' }}>Mark this field as required</div>
            </div>
            <Switch checked={field.required} onChange={v => { snapshot(); push({ required: v }) }} />
          </div>

          <div>
            <Label>Column Width</Label>
            <div style={{ display: 'flex', gap: 4, background: '#f3f4f6', padding: 3, borderRadius: 8 }}>
              {COL_OPTIONS.map(c => (
                <button
                  key={c.value}
                  onClick={() => { snapshot(); push({ col: c.value }) }}
                  style={{
                    flex: 1, padding: '5px 0', fontSize: 12, fontWeight: 600,
                    borderRadius: 6, cursor: 'pointer', border: 'none',
                    background: field.col === c.value ? '#fff' : 'transparent',
                    color: field.col === c.value ? '#2F54EB' : '#6b7280',
                    boxShadow: field.col === c.value ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                    transition: 'all 0.15s',
                  }}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {HAS_OPTIONS.includes(field.type) && (
            <div>
              <Divider style={{ margin: '0 0 12px' }} />
              <Label>Options</Label>
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onOptionDragEnd}>
                <SortableContext items={localOptions.map((_, i) => `opt-${i}`)} strategy={verticalListSortingStrategy}>
                  {localOptions.map((opt, i) => (
                    <SortableOption
                      key={`${activeFieldId}-${i}`}
                      opt={opt} idx={i}
                      onChange={v => { const o = [...localOptions]; o[i] = v; pushOptions(o) }}
                      onDelete={() => { snapshot(); pushOptions(localOptions.filter((_, j) => j !== i)) }}
                    />
                  ))}
                </SortableContext>
              </DndContext>
              <Button
                type="dashed"
                size="small"
                icon={<PlusOutlined />}
                block
                style={{ borderColor: '#c7d4f8', color: '#2F54EB', borderRadius: 6, marginTop: 4 }}
                onClick={() => { snapshot(); pushOptions([...localOptions, `Option ${localOptions.length + 1}`]) }}
              >
                Add Option
              </Button>
            </div>
          )}

          <Divider style={{ margin: '4px 0' }} />

          {/* Actions */}
          <div style={{ display: 'flex', gap: 8 }}>
            <Button
              size="small"
              icon={<CopyOutlined />}
              onClick={handleDuplicate}
              style={{ flex: 1, borderRadius: 6, borderColor: '#c7d4f8', color: '#2F54EB' }}
            >
              Duplicate
            </Button>
            <Button
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={handleDelete}
              style={{ flex: 1, borderRadius: 6 }}
            >
              Delete
            </Button>
          </div>

          <div style={{ height: 14 }} />
        </div>
      </div>

      {/* Footer */}
      <div style={{
        padding: '10px 14px', borderTop: '1px solid #f3f4f6', background: '#fafafa', flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
          <span style={{ fontSize: 11.5, color: '#6b7280' }}>Changes apply instantly</span>
        </div>
      </div>
    </div>
  )
}
