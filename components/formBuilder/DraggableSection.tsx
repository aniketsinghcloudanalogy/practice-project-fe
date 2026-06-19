'use client'
import { useState } from 'react'
import { Input } from 'antd'
import { DeleteOutlined, HolderOutlined, PlusOutlined, CopyOutlined } from '@ant-design/icons'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable'
import { useDroppable } from '@dnd-kit/core'
import { useFormBuilder } from './store'
import FieldCard from './DraggableField'
import type { SectionDef, FieldDef } from './types'

function groupIntoRows(fields: FieldDef[]): FieldDef[][] {
  const rows: FieldDef[][] = []
  let current: FieldDef[] = []
  for (const f of fields) {
    if (f.col === 'full') {
      if (current.length > 0) { rows.push(current); current = [] }
      rows.push([f])
    } else {
      current.push(f)
      if (current.length === 3) { rows.push(current); current = [] }
    }
  }
  if (current.length > 0) rows.push(current)
  return rows
}

function SectionDropZone({ sectionId, dragging, hasFields }: { sectionId: string; dragging: boolean; hasFields: boolean }) {
  const { setNodeRef, isOver } = useDroppable({ id: `drop-${sectionId}` })
  const { dispatch } = useFormBuilder()

  if (hasFields) {
    // Only show the drop strip when actively dragging
    if (!dragging) return null
    return (
      <div
        ref={setNodeRef}
        style={{
          height: 36,
          border: `2px dashed ${isOver ? '#2F54EB' : '#d1d5db'}`,
          borderRadius: 8,
          marginTop: 8,
          background: isOver ? '#eef2ff' : 'transparent',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 12, fontWeight: 500,
          color: isOver ? '#2F54EB' : '#9ca3af',
          transition: 'all 0.2s cubic-bezier(0.4,0,0.2,1)',
          transform: isOver ? 'scale(1.01)' : 'scale(1)',
        }}
      >
        {isOver ? '↓ Drop here' : 'Drop field here'}
      </div>
    )
  }

  // Empty section — show helpful CTA
  return (
    <div
      ref={setNodeRef}
      style={{
        minHeight: 90,
        border: `2px dashed ${isOver ? '#2F54EB' : '#e5e7eb'}`,
        borderRadius: 10,
        background: isOver ? '#eef2ff' : '#fafbfc',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column', gap: 6,
        transition: 'all 0.2s cubic-bezier(0.4,0,0.2,1)',
        cursor: 'default',
        transform: isOver ? 'scale(1.01)' : 'scale(1)',
      }}
    >
      {isOver ? (
        <>
          <div style={{ fontSize: 22, color: '#2F54EB' }}>↓</div>
          <div style={{ fontSize: 12, color: '#2F54EB', fontWeight: 600 }}>Release to drop</div>
        </>
      ) : (
        <>
          <div style={{ fontSize: 12, color: '#9ca3af', fontWeight: 500 }}>
            Drag fields here or click from sidebar
          </div>
          <button
            onClick={() => dispatch({ type: 'ADD_FIELD', sectionId, fieldType: 'text' })}
            style={{
              marginTop: 4, padding: '5px 14px', borderRadius: 6,
              border: '1px dashed #c7d4f8', background: '#f8faff',
              cursor: 'pointer', fontSize: 12, fontWeight: 500, color: '#2F54EB',
              display: 'flex', alignItems: 'center', gap: 5,
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#eef2ff'; (e.currentTarget as HTMLElement).style.borderColor = '#2F54EB' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#f8faff'; (e.currentTarget as HTMLElement).style.borderColor = '#c7d4f8' }}
          >
            <PlusOutlined style={{ fontSize: 11 }} /> Add a text field
          </button>
        </>
      )}
    </div>
  )
}

interface Props { section: SectionDef; dragging: boolean }

export default function DraggableSection({ section, dragging }: Props) {
  const { dispatch, snapshot } = useFormBuilder()
  const [editing, setEditing] = useState(false)
  const [titleVal, setTitleVal] = useState(section.title)
  const [hovered, setHovered] = useState(false)

  const {
    attributes, listeners, setNodeRef, setActivatorNodeRef,
    transform, transition, isDragging,
  } = useSortable({ id: section.id, animateLayoutChanges: () => false })

  const rows = groupIntoRows(section.fields)
  const hasFields = section.fields.length > 0

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition: transition ? `${transition}, box-shadow 0.2s, border-color 0.2s` : 'transform 200ms ease, box-shadow 0.2s, border-color 0.2s',
        opacity: isDragging ? 0.4 : 1,
        marginBottom: 12,
        borderRadius: 10,
        border: `1.5px solid ${isDragging ? '#2F54EB' : hovered ? '#c7d4f8' : '#e5e7eb'}`,
        background: '#ffffff',
        overflow: 'hidden',
        boxShadow: isDragging
          ? '0 12px 28px rgba(47,84,235,0.2)'
          : hovered
            ? '0 2px 10px rgba(0,0,0,0.06)'
            : '0 1px 3px rgba(0,0,0,0.02)',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Section Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px',
        background: isDragging ? '#eef2ff' : '#f9fafb', borderBottom: '1px solid #f3f4f6',
        transition: 'background 0.15s',
      }}>
        <span
          ref={setActivatorNodeRef}
          {...attributes}
          {...listeners}
          style={{
            color: hovered ? '#9ca3af' : '#d1d5db', cursor: 'grab', fontSize: 15,
            display: 'flex', touchAction: 'none', flexShrink: 0, transition: 'color 0.15s',
          }}
        >
          <HolderOutlined />
        </span>

        {editing ? (
          <Input
            autoFocus
            value={titleVal}
            size="small"
            style={{ flex: 1, fontWeight: 600, color: '#111827', fontSize: 13 }}
            onChange={e => setTitleVal(e.target.value)}
            onBlur={() => {
              snapshot()
              dispatch({ type: 'RENAME_SECTION', sectionId: section.id, title: titleVal })
              setEditing(false)
            }}
            onPressEnter={() => {
              snapshot()
              dispatch({ type: 'RENAME_SECTION', sectionId: section.id, title: titleVal })
              setEditing(false)
            }}
          />
        ) : (
          <span
            style={{ flex: 1, fontWeight: 600, color: '#111827', fontSize: 13, cursor: 'text', lineHeight: 1.4 }}
            onDoubleClick={() => { setTitleVal(section.title); setEditing(true) }}
            title="Double-click to rename"
          >
            {section.title}
          </span>
        )}

        <span style={{ fontSize: 11, color: '#9ca3af', marginRight: 4, whiteSpace: 'nowrap' }}>
          {section.fields.length} field{section.fields.length !== 1 ? 's' : ''}
        </span>

        <button
          onClick={() => dispatch({ type: 'DELETE_SECTION', sectionId: section.id })}
          style={{
            background: 'none', border: '1px solid #fca5a5', cursor: 'pointer',
            color: '#ef4444', fontSize: 12, display: 'flex', padding: '3px 6px',
            borderRadius: 5, alignItems: 'center', flexShrink: 0, transition: 'all 0.15s',
            opacity: hovered ? 1 : 0.6,
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#fee2e2' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'none' }}
          title="Delete section"
        >
          <DeleteOutlined />
        </button>
      </div>

      {/* Field Grid */}
      <div style={{ padding: '10px 12px' }}>
        <SortableContext items={section.fields.map(f => f.id)} strategy={rectSortingStrategy}>
          {hasFields && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {rows.map((row, ri) => (
                <div
                  key={ri}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: row[0]?.col === 'full'
                      ? '1fr'
                      : `repeat(${row.length}, 1fr)`,
                    gap: 8,
                  }}
                >
                  {row.map(field => (
                    <FieldCard key={field.id} field={field} sectionId={section.id} />
                  ))}
                </div>
              ))}
            </div>
          )}
        </SortableContext>

        <SectionDropZone sectionId={section.id} dragging={dragging} hasFields={hasFields} />
      </div>
    </div>
  )
}
