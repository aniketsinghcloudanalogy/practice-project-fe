'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ConfigProvider, Button, Drawer, Input, message } from 'antd'
import {
  DndContext, DragOverlay, PointerSensor, useSensor, useSensors,
  pointerWithin, rectIntersection,
  type DragEndEvent, type DragStartEvent, type UniqueIdentifier, type CollisionDetection,
} from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable'
import {
  PlusOutlined, EditOutlined, EyeOutlined, CodeOutlined,
  UndoOutlined, RedoOutlined,
} from '@ant-design/icons'
import { LuArrowLeft, LuTrash2, LuSave } from 'react-icons/lu'
import { FormBuilderProvider, useFormBuilder } from './store'
import FieldPalette from './FieldPalette'
import SectionCard from './DraggableSection'
import PropertiesPanel from './PropertiesPanel'
import FormPreview from './FormPreview'
import JsonView from './JsonView'
import type { FieldType, FormSchema } from './types'
import {
  useSaveProgramFormDraftMutation,
  useSubmitProgramFormMutation,
  useEditProgramFormMutation,
  useDeleteProgramFormMutation,
} from '@/store/services'

const THEME = {
  token: { colorPrimary: '#2F54EB', borderRadius: 8, fontFamily: 'Inter, -apple-system, sans-serif' },
}

type Tab = 'builder' | 'preview' | 'json'

const customCollision: CollisionDetection = (args) => {
  const pw = pointerWithin(args)
  if (pw.length > 0) return pw
  return rectIntersection(args)
}

type FormBuilderProps = {
  programId?: number | null
  role?: string
  formStatus?: 'DRAFT' | 'SUBMITTED' | null
  initialForm?: FormSchema
  onStatusChange?: (status: 'DRAFT' | 'SUBMITTED' | null) => void
  readOnly?: boolean
}

function Layout({ programId, role, formStatus, onStatusChange, readOnly }: Omit<FormBuilderProps, 'initialForm'>) {
  const router = useRouter()
  const { form, dispatch, activeFieldId, setActiveField, undo, redo, canUndo, canRedo, snapshot } = useFormBuilder()
  const [msgApi, msgCtx] = message.useMessage()
  const [tab, setTab] = useState<Tab>(
    programId && formStatus === 'SUBMITTED' ? 'preview' : 'builder'
  )
  const [dragging, setDragging] = useState(false)
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null)
  const [dragData, setDragData] = useState<{ type: FieldType; label?: string } | null>(null)
  const [editingTitle, setEditingTitle] = useState(false)
  const [titleVal, setTitleVal] = useState(form.title)
  const [saving, setSaving] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const canvasRef = useRef<HTMLDivElement>(null)
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastSavedRef = useRef<string>('')
  const drawerOpen = activeFieldId !== null && tab === 'builder'

  const isSuperAdmin = role === 'SUPER_ADMIN'
  
  // RTK Query hooks for API operations
  const [saveProgramFormDraft] = useSaveProgramFormDraftMutation();
  const [submitProgramForm] = useSubmitProgramFormMutation();
  const [editProgramForm] = useEditProgramFormMutation();
  const [deleteProgramForm] = useDeleteProgramFormMutation();
  const isSubmitted = formStatus === 'SUBMITTED'
  const canEdit = !readOnly && (!programId || !isSubmitted || isEditing || isSuperAdmin)

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  // ─── Auto-save draft on form changes (debounced 1.5s) ─────────────────────
  useEffect(() => {
    if (!canEdit || isSubmitted) return
    if (!programId) return // No auto-save for standalone (no programId)
    if (submitting) return // Don't auto-save while submitting
    
    const formJson = JSON.stringify(form)
    if (formJson === lastSavedRef.current) return

    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current)
    autoSaveTimer.current = setTimeout(async () => {
      // Double-check we're not submitting before auto-saving
      if (submitting) return
      
      try {
        setAutoSaveStatus('saving')
        await saveProgramFormDraft({ programId, formDesign: form as unknown as Record<string, unknown> }).unwrap();
        lastSavedRef.current = formJson
        setAutoSaveStatus('saved')
      } catch {
        setAutoSaveStatus('error')
      }
    }, 1500)

    return () => { if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current) }
  }, [form, canEdit, isSubmitted, programId, submitting])

  // Keyboard shortcuts: Ctrl+Z undo, Ctrl+Shift+Z / Ctrl+Y redo
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo() }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) { e.preventDefault(); redo() }
      if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); handleSave() }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [undo, redo])

  function onDragStart({ active }: DragStartEvent) {
    setDragging(true)
    setActiveId(active.id)
    const d = active.data.current
    if (d?.source === 'sidebar') {
      setDragData({ type: d.type as FieldType })
    } else if (d?.source === 'canvas') {
      const sec = form.sections.find(s => s.id === d.sectionId)
      const fld = sec?.fields.find(f => f.id === active.id)
      setDragData({ type: fld?.type ?? 'text', label: fld?.label })
    } else setDragData(null)
  }

  function onDragEnd({ active, over }: DragEndEvent) {
    setDragging(false); setActiveId(null); setDragData(null)
    if (!over) return

    const activeData = active.data.current
    const overData = over.data.current
    const activeIdStr = active.id as string
    const overId = over.id as string

    // Dragged from sidebar palette → add field
    if (activeData?.source === 'sidebar') {
      let targetSectionId: string | null = null
      if (overId.startsWith('drop-')) targetSectionId = overId.replace('drop-', '')
      else if (overData?.sectionId) targetSectionId = overData.sectionId
      else if (form.sections.find(s => s.id === overId)) targetSectionId = overId

      if (targetSectionId) {
        dispatch({ type: 'ADD_FIELD', sectionId: targetSectionId, fieldType: activeData.type as FieldType })
      } else if (form.sections.length > 0) {
        dispatch({ type: 'ADD_FIELD', sectionId: form.sections[form.sections.length - 1].id, fieldType: activeData.type as FieldType })
      }
      return
    }

    // Reorder sections
    const sectionIds = form.sections.map(s => s.id)
    if (sectionIds.includes(activeIdStr) && sectionIds.includes(overId)) {
      dispatch({ type: 'REORDER_SECTIONS', ids: arrayMove(sectionIds, sectionIds.indexOf(activeIdStr), sectionIds.indexOf(overId)) })
      return
    }

    // Reorder or move fields
    if (activeData?.source === 'canvas') {
      const fromSection = activeData.sectionId as string
      if (overData?.source === 'canvas') {
        const toSection = overData.sectionId as string
        if (fromSection === toSection) {
          const sec = form.sections.find(s => s.id === fromSection)!
          const ids = sec.fields.map(f => f.id)
          const fi = ids.indexOf(activeIdStr), ti = ids.indexOf(overId)
          if (fi !== -1 && ti !== -1) dispatch({ type: 'REORDER_FIELDS', sectionId: fromSection, ids: arrayMove(ids, fi, ti) })
        } else {
          dispatch({ type: 'MOVE_FIELD', fromSection, toSection, fieldId: activeIdStr })
        }
        return
      }
      if (overId.startsWith('drop-')) {
        const toSection = overId.replace('drop-', '')
        if (fromSection !== toSection) dispatch({ type: 'MOVE_FIELD', fromSection, toSection, fieldId: activeIdStr })
      }
    }
  }

  const handleSave = useCallback(async () => {
    if (!canEdit || !programId) return
    setSaving(true)
    try {
      await saveProgramFormDraft({ programId, formDesign: form as unknown as Record<string, unknown> }).unwrap();
      lastSavedRef.current = JSON.stringify(form)
      onStatusChange?.('DRAFT')
      setAutoSaveStatus('saved')
      msgApi.success('Form saved as draft')
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status
      const errMsg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      if (status === 403) {
        msgApi.error(errMsg || 'You do not have edit access to this form')
      } else {
        msgApi.error('Failed to save form')
      }
    } finally { setSaving(false) }
  }, [form, programId, canEdit, onStatusChange, msgApi])

  const handleSubmit = async () => {
    if (!canEdit || !programId) return
    if (form.sections.every(s => s.fields.length === 0)) {
      msgApi.warning('Add at least one field before submitting')
      return
    }
    
    // Cancel any pending auto-save before submitting
    if (autoSaveTimer.current) {
      clearTimeout(autoSaveTimer.current)
      autoSaveTimer.current = null
    }
    
    setSubmitting(true)
    try {
      // Make sure we're using the latest form data
      const formData = form as unknown as Record<string, unknown>
      console.log('Submitting form:', { programId, formData })
      
      const response = await submitProgramForm({ programId, formDesign: formData }).unwrap();
      console.log('Submit response:', response)
      
      // Only update status if the API call was successful
      onStatusChange?.('SUBMITTED')
      setIsEditing(false)
      setTab('preview')
      msgApi.success('Form submitted successfully')
      // Update the last saved reference to prevent auto-save conflicts
      lastSavedRef.current = JSON.stringify(form)
    } catch (err: unknown) {
      console.error('Form submission error:', err)
      const status = (err as { response?: { status?: number } })?.response?.status
      const errMsg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      if (status === 403) {
        msgApi.error(errMsg || 'You do not have permission to submit this form')
      } else {
        msgApi.error(errMsg || 'Failed to submit form - please try again')
      }
    } finally { setSubmitting(false) }
  }

  const handleSuperAdminSave = async () => {
    if (!canEdit || !programId) return
    setSaving(true)
    try {
      await editProgramForm({ programId, formDesign: form as unknown as Record<string, unknown> }).unwrap();
      onStatusChange?.('SUBMITTED')
      setIsEditing(false)
      setTab('preview')
      msgApi.success('Changes saved')
    } catch {
      msgApi.error('Failed to save changes')
    } finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!programId) return
    if (!window.confirm('Are you sure you want to delete this form? This cannot be undone.')) return
    setDeleting(true)
    try {
      await deleteProgramForm(programId).unwrap();
      onStatusChange?.(null)
      msgApi.success('Form deleted')
      router.back()
    } catch {
      msgApi.error('Failed to delete form')
    } finally { setDeleting(false) }
  }

  const TABS: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'builder', label: 'Builder', icon: <EditOutlined /> },
    { key: 'preview', label: 'Preview', icon: <EyeOutlined /> },
    { key: 'json', label: 'JSON', icon: <CodeOutlined /> },
  ]

  const showBuilder = canEdit && tab === 'builder'

  return (
    <DndContext sensors={sensors} collisionDetection={customCollision} onDragStart={onDragStart} onDragEnd={onDragEnd}>
      {msgCtx}
      <div style={{ display: 'flex', height: '100%', overflow: 'hidden', background: '#f9fafb' }}>

        {/* Left Sidebar — Field Palette */}
        {showBuilder && (
          <aside style={{
            width: 240, flexShrink: 0, background: '#ffffff',
            borderRight: '1px solid #f3f4f6', overflowY: 'auto',
            display: 'flex', flexDirection: 'column',
          }}>
            <div style={{ padding: '14px 14px 10px', borderBottom: '1px solid #f3f4f6' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>Form Elements</div>
              <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>Click or drag to add</div>
            </div>
            <FieldPalette />
          </aside>
        )}

        {/* Main Content Area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>

          {/* Top Bar */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            background: '#ffffff', borderBottom: '1px solid #f3f4f6',
            padding: '0 16px', height: 52, flexShrink: 0,
          }}>
            {programId && (
              <button
                onClick={() => router.back()}
                style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', fontSize: 13, padding: '4px 8px', borderRadius: 6 }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#f3f4f6' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'none' }}
              >
                <LuArrowLeft size={16} /> Back
              </button>
            )}

            {/* Title */}
            <div style={{ flex: 1, minWidth: 0 }}>
              {editingTitle && canEdit ? (
                <Input
                  autoFocus size="small" value={titleVal}
                  style={{ maxWidth: 280, fontWeight: 600 }}
                  onChange={e => setTitleVal(e.target.value)}
                  onBlur={() => { snapshot(); dispatch({ type: 'SET_TITLE', title: titleVal }); setEditingTitle(false) }}
                  onPressEnter={() => { snapshot(); dispatch({ type: 'SET_TITLE', title: titleVal }); setEditingTitle(false) }}
                />
              ) : (
                <div
                  style={{ fontSize: 14, fontWeight: 700, color: '#111827', cursor: canEdit ? 'pointer' : 'default', display: 'inline-flex', alignItems: 'center', gap: 6 }}
                  onClick={() => canEdit && (setTitleVal(form.title), setEditingTitle(true))}
                >
                  {form.title}
                  {canEdit && <EditOutlined style={{ fontSize: 11, color: '#9ca3af' }} />}
                  {isSubmitted && (
                    <span style={{ marginLeft: 8, fontSize: 11, background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: 12, fontWeight: 500 }}>Submitted</span>
                  )}
                  {formStatus === 'DRAFT' && (
                    <span style={{ marginLeft: 8, fontSize: 11, background: '#fef9c3', color: '#854d0e', padding: '2px 8px', borderRadius: 12, fontWeight: 500 }}>Draft</span>
                  )}
                  {readOnly && (
                    <span style={{ marginLeft: 8, fontSize: 11, background: '#fee2e2', color: '#991b1b', padding: '2px 8px', borderRadius: 12, fontWeight: 500 }}>Read-only</span>
                  )}
                </div>
              )}
            </div>

            {/* Undo / Redo */}
            {canEdit && showBuilder && (
              <div style={{ display: 'flex', gap: 2 }}>
                <button
                  onClick={undo}
                  disabled={!canUndo}
                  title="Undo (Ctrl+Z)"
                  style={{
                    padding: '5px 8px', borderRadius: 6, border: '1px solid #e5e7eb',
                    background: canUndo ? '#fff' : '#f9fafb', cursor: canUndo ? 'pointer' : 'not-allowed',
                    color: canUndo ? '#374151' : '#d1d5db', fontSize: 14, display: 'flex', alignItems: 'center',
                    transition: 'all 0.15s',
                  }}
                >
                  <UndoOutlined />
                </button>
                <button
                  onClick={redo}
                  disabled={!canRedo}
                  title="Redo (Ctrl+Y)"
                  style={{
                    padding: '5px 8px', borderRadius: 6, border: '1px solid #e5e7eb',
                    background: canRedo ? '#fff' : '#f9fafb', cursor: canRedo ? 'pointer' : 'not-allowed',
                    color: canRedo ? '#374151' : '#d1d5db', fontSize: 14, display: 'flex', alignItems: 'center',
                    transition: 'all 0.15s',
                  }}
                >
                  <RedoOutlined />
                </button>
              </div>
            )}

            {/* Tab Switcher */}
            {canEdit && (
              <div style={{ display: 'flex', background: '#f3f4f6', borderRadius: 8, padding: 3, gap: 2 }}>
                {TABS.map(t => (
                  <button
                    key={t.key}
                    onClick={() => setTab(t.key)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 5, padding: '5px 12px',
                      borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 12.5, fontWeight: 600,
                      background: tab === t.key ? '#ffffff' : 'transparent',
                      color: tab === t.key ? '#111827' : '#6b7280',
                      boxShadow: tab === t.key ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                      transition: 'all 0.15s',
                    }}
                  >
                    <span style={{ fontSize: 13 }}>{t.icon}</span>
                    {t.label}
                  </button>
                ))}
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              {/* Auto-save indicator */}
              {canEdit && autoSaveStatus !== 'idle' && (
                <span style={{ fontSize: 11, color: autoSaveStatus === 'error' ? '#dc2626' : autoSaveStatus === 'saving' ? '#9ca3af' : '#16a34a', display: 'flex', alignItems: 'center', gap: 4 }}>
                  {autoSaveStatus === 'saving' && '⟳ Saving…'}
                  {autoSaveStatus === 'saved' && '✓ Saved'}
                  {autoSaveStatus === 'error' && '✗ Auto-save failed'}
                </span>
              )}

              {/* Submission status indicator */}
              {submitting && (
                <span style={{ fontSize: 11, color: '#2F54EB', display: 'flex', alignItems: 'center', gap: 4 }}>
                  ⟳ Submitting form...
                </span>
              )}

              {/* No programId = standalone builder (super admin only) */}
              {!programId && isSuperAdmin && (
                <>
                  <button onClick={handleSave} disabled={saving} style={{ padding: '5px 14px', borderRadius: 6, border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer', fontSize: 12.5, fontWeight: 600, color: '#334155', display: 'flex', alignItems: 'center', gap: 4, transition: 'all 0.15s' }}>
                    <LuSave size={14} /> {saving ? 'Saving…' : 'Save'}
                  </button>
                  <button onClick={handleSubmit} disabled={submitting} style={{ padding: '5px 14px', borderRadius: 6, border: 'none', background: '#0A1172', cursor: 'pointer', fontSize: 12.5, fontWeight: 600, color: '#fff', transition: 'all 0.15s' }}>
                    {submitting ? 'Submitting…' : 'Submit'}
                  </button>
                </>
              )}

              {/* Super Admin: submitted, not editing — view mode */}
              {programId && isSuperAdmin && isSubmitted && !isEditing && (
                <>
                  <button onClick={() => { setIsEditing(true); setTab('builder') }} style={{ padding: '5px 14px', borderRadius: 6, border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer', fontSize: 12.5, fontWeight: 600, color: '#334155', transition: 'all 0.15s' }}>
                    Edit
                  </button>
                  <button onClick={handleDelete} disabled={deleting} style={{ padding: '5px 14px', borderRadius: 6, border: '1px solid #fca5a5', background: '#fef2f2', cursor: 'pointer', fontSize: 12.5, fontWeight: 600, color: '#dc2626', display: 'flex', alignItems: 'center', gap: 4, transition: 'all 0.15s' }}>
                    <LuTrash2 size={14} /> {deleting ? 'Deleting…' : 'Delete'}
                  </button>
                </>
              )}

              {/* Super Admin: submitted + editing */}
              {programId && isSuperAdmin && isSubmitted && isEditing && (
                <>
                  <button onClick={handleSuperAdminSave} disabled={saving} style={{ padding: '5px 14px', borderRadius: 6, border: 'none', background: '#0A1172', cursor: 'pointer', fontSize: 12.5, fontWeight: 600, color: '#fff', transition: 'all 0.15s' }}>
                    {saving ? 'Saving…' : 'Save Changes'}
                  </button>
                  <button onClick={() => { setIsEditing(false); setTab('preview') }} style={{ padding: '5px 14px', borderRadius: 6, border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer', fontSize: 12.5, fontWeight: 600, color: '#334155', transition: 'all 0.15s' }}>
                    Cancel
                  </button>
                </>
              )}

              {/* Super Admin: fresh form (draft or new) */}
              {programId && isSuperAdmin && !isSubmitted && (
                <>
                  <button onClick={handleSave} disabled={saving} style={{ padding: '5px 14px', borderRadius: 6, border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer', fontSize: 12.5, fontWeight: 600, color: '#334155', display: 'flex', alignItems: 'center', gap: 4, transition: 'all 0.15s' }}>
                    <LuSave size={14} /> {saving ? 'Saving…' : 'Save'}
                  </button>
                  <button onClick={handleSubmit} disabled={submitting || saving} style={{ padding: '5px 14px', borderRadius: 6, border: 'none', background: submitting || saving ? '#94a3b8' : '#0A1172', cursor: submitting || saving ? 'not-allowed' : 'pointer', fontSize: 12.5, fontWeight: 600, color: '#fff', transition: 'all 0.15s' }}>
                    {submitting ? 'Submitting…' : 'Submit'}
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Canvas / Preview / JSON */}
          <div style={{ flex: 1, overflow: 'auto', background: '#f3f4f6', position: 'relative' }} ref={canvasRef}>
            {showBuilder && (
              <div style={{
                padding: '16px',
                paddingRight: drawerOpen ? 316 : 16,
                maxWidth: 920,
                margin: '0 auto',
                transition: 'padding-right 0.25s ease',
              }}>
                {form.sections.length === 0 ? (
                  <div style={{
                    textAlign: 'center', padding: '60px 24px',
                    border: '2px dashed #e5e7eb', borderRadius: 12,
                    background: '#fff', color: '#9ca3af',
                  }}>
                    <div style={{ fontSize: 32, marginBottom: 8 }}>📝</div>
                    <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4, color: '#374151' }}>Start Building Your Form</div>
                    <div style={{ fontSize: 13, marginBottom: 16 }}>Add a section to get started, then drag fields from the sidebar.</div>
                    <button
                      onClick={() => dispatch({ type: 'ADD_SECTION' })}
                      style={{
                        padding: '8px 20px', borderRadius: 8, border: 'none',
                        background: '#2F54EB', color: '#fff', fontSize: 13, fontWeight: 600,
                        cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6,
                      }}
                    >
                      <PlusOutlined /> Add First Section
                    </button>
                  </div>
                ) : (
                  <>
                    <SortableContext items={form.sections.map(s => s.id)} strategy={verticalListSortingStrategy}>
                      {form.sections.map(section => (
                        <SectionCard key={section.id} section={section} dragging={dragging} />
                      ))}
                    </SortableContext>
                    <button
                      onClick={() => dispatch({ type: 'ADD_SECTION' })}
                      style={{
                        width: '100%', marginTop: 4, padding: '10px 16px',
                        border: '1.5px dashed #d1d5db', borderRadius: 10, background: 'transparent',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        gap: 6, fontSize: 13, color: '#6b7280', fontWeight: 500,
                        transition: 'all 0.15s',
                      }}
                      onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = '#2F54EB'; el.style.color = '#2F54EB'; el.style.background = '#f5f8ff' }}
                      onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = '#d1d5db'; el.style.color = '#6b7280'; el.style.background = 'transparent' }}
                    >
                      <PlusOutlined />
                      Add Section
                    </button>
                  </>
                )}
              </div>
            )}
            {tab === 'preview' && <FormPreview />}
            {tab === 'json' && <JsonView />}

            {/* Properties Drawer */}
            <Drawer
              open={drawerOpen}
              mask={false}
              getContainer={false}
              size="default"
              styles={{ wrapper: { position: 'absolute', width: 300 }, body: { padding: 0 } }}
              rootStyle={{ position: 'absolute' }}
              onClose={() => setActiveField(null, null)}
              title={null}
              closable={false}
            >
              <PropertiesPanel />
            </Drawer>
          </div>
        </div>
      </div>

      {/* Drag Overlay Ghost */}
      <DragOverlay dropAnimation={{ duration: 180, easing: 'cubic-bezier(0.18,0.67,0.6,1.22)' }}>
        {dragData ? (
          <div style={{
            background: '#fff',
            border: '1.5px solid #c7d4f8',
            borderRadius: 8,
            padding: '9px 16px',
            fontSize: 13,
            fontWeight: 600,
            color: '#2F54EB',
            boxShadow: '0 10px 28px rgba(47,84,235,0.18)',
            display: 'flex', alignItems: 'center', gap: 8,
            whiteSpace: 'nowrap',
          }}>
            <span style={{ width: 22, height: 22, borderRadius: 5, background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>⠿</span>
            {dragData.label ?? dragData.type.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}

export default function FormBuilder({ programId, role, formStatus, initialForm, onStatusChange, readOnly }: FormBuilderProps) {
  return (
    <ConfigProvider theme={THEME}>
      <FormBuilderProvider initialForm={initialForm}>
        <Layout programId={programId} role={role} formStatus={formStatus} onStatusChange={onStatusChange} readOnly={readOnly} />
      </FormBuilderProvider>
    </ConfigProvider>
  )
}
