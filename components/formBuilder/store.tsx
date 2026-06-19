'use client'
import { createContext, useContext, useReducer, useState, useCallback, useRef } from 'react'
import type { FormSchema, FieldDef, FieldType } from './types'

function uid() { return Math.random().toString(36).slice(2, 10) }

export function makeField(type: FieldType): FieldDef {
  return {
    id: `field_${uid()}`,
    type,
    label: type.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
    placeholder: '',
    required: false,
    col: 'begin',
    options: ['multi-select', 'drop-down', 'radio'].includes(type) ? ['Option 1', 'Option 2'] : [],
  }
}

const defaultForm: FormSchema = {
  id: 'form_1',
  title: 'Untitled Form',
  sections: [{ id: 'section_1', title: 'Section 1', fields: [] }],
}

export type Action =
  | { type: 'SET_TITLE'; title: string }
  | { type: 'ADD_SECTION' }
  | { type: 'DELETE_SECTION'; sectionId: string }
  | { type: 'RENAME_SECTION'; sectionId: string; title: string }
  | { type: 'REORDER_SECTIONS'; ids: string[] }
  | { type: 'ADD_FIELD'; sectionId: string; fieldType: FieldType }
  | { type: 'DUPLICATE_FIELD'; sectionId: string; fieldId: string }
  | { type: 'UPDATE_FIELD'; sectionId: string; fieldId: string; payload: Partial<FieldDef> }
  | { type: 'DELETE_FIELD'; sectionId: string; fieldId: string }
  | { type: 'MOVE_FIELD'; fromSection: string; toSection: string; fieldId: string }
  | { type: 'REORDER_FIELDS'; sectionId: string; ids: string[] }
  | { type: 'LOAD_FORM'; form: FormSchema }

function reducer(state: FormSchema, action: Action): FormSchema {
  switch (action.type) {
    case 'SET_TITLE':
      return { ...state, title: action.title }
    case 'ADD_SECTION':
      return { ...state, sections: [...state.sections, { id: `section_${uid()}`, title: `Section ${state.sections.length + 1}`, fields: [] }] }
    case 'DELETE_SECTION':
      return { ...state, sections: state.sections.filter(s => s.id !== action.sectionId) }
    case 'RENAME_SECTION':
      return { ...state, sections: state.sections.map(s => s.id === action.sectionId ? { ...s, title: action.title } : s) }
    case 'REORDER_SECTIONS': {
      const map = Object.fromEntries(state.sections.map(s => [s.id, s]))
      return { ...state, sections: action.ids.map(id => map[id]).filter(Boolean) }
    }
    case 'ADD_FIELD':
      return { ...state, sections: state.sections.map(s => s.id === action.sectionId ? { ...s, fields: [...s.fields, makeField(action.fieldType)] } : s) }
    case 'DUPLICATE_FIELD': {
      return {
        ...state,
        sections: state.sections.map(s => {
          if (s.id !== action.sectionId) return s
          const idx = s.fields.findIndex(f => f.id === action.fieldId)
          if (idx === -1) return s
          const original = s.fields[idx]
          const clone: FieldDef = {
            ...original,
            id: `field_${uid()}`,
            label: `${original.label} (copy)`,
          }
          const newFields = [...s.fields]
          newFields.splice(idx + 1, 0, clone)
          return { ...s, fields: newFields }
        }),
      }
    }
    case 'UPDATE_FIELD':
      return { ...state, sections: state.sections.map(s => s.id === action.sectionId ? { ...s, fields: s.fields.map(f => f.id === action.fieldId ? { ...f, ...action.payload } : f) } : s) }
    case 'DELETE_FIELD':
      return { ...state, sections: state.sections.map(s => s.id === action.sectionId ? { ...s, fields: s.fields.filter(f => f.id !== action.fieldId) } : s) }
    case 'MOVE_FIELD': {
      const field = state.sections.find(s => s.id === action.fromSection)?.fields.find(f => f.id === action.fieldId)
      if (!field) return state
      return {
        ...state,
        sections: state.sections.map(s => {
          if (s.id === action.fromSection) return { ...s, fields: s.fields.filter(f => f.id !== action.fieldId) }
          if (s.id === action.toSection) return { ...s, fields: [...s.fields, field] }
          return s
        }),
      }
    }
    case 'REORDER_FIELDS': {
      const allFields = Object.fromEntries(state.sections.flatMap(s => s.fields.map(f => [f.id, f])))
      return { ...state, sections: state.sections.map(s => s.id === action.sectionId ? { ...s, fields: action.ids.map(id => allFields[id]).filter(Boolean) } : s) }
    }
    case 'LOAD_FORM':
      return action.form
    default: return state
  }
}

// Actions that should NOT create undo history entries (high-frequency typing)
const SKIP_HISTORY: Action['type'][] = ['UPDATE_FIELD', 'SET_TITLE', 'RENAME_SECTION']

const MAX_HISTORY = 50

interface CtxValue {
  form: FormSchema
  dispatch: (action: Action) => void
  activeFieldId: string | null
  activeSectionId: string | null
  setActiveField: (sectionId: string | null, fieldId: string | null) => void
  undo: () => void
  redo: () => void
  canUndo: boolean
  canRedo: boolean
  /** Snapshot current state to history (call on blur / significant change) */
  snapshot: () => void
}

const Ctx = createContext<CtxValue | null>(null)

export function FormBuilderProvider({ children, initialForm: initial }: { children: React.ReactNode; initialForm?: FormSchema }) {
  const [form, rawDispatch] = useReducer(reducer, initial ?? defaultForm)
  const [activeFieldId, setActiveFieldId] = useState<string | null>(null)
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null)

  // Undo/redo stacks
  const pastRef = useRef<FormSchema[]>([])
  const futureRef = useRef<FormSchema[]>([])
  const [, forceUpdate] = useState(0)
  const formRef = useRef(form)
  formRef.current = form

  const snapshot = useCallback(() => {
    pastRef.current = [...pastRef.current.slice(-MAX_HISTORY), formRef.current]
    futureRef.current = []
    forceUpdate(n => n + 1)
  }, [])

  const dispatch = useCallback((action: Action) => {
    if (!SKIP_HISTORY.includes(action.type)) {
      pastRef.current = [...pastRef.current.slice(-MAX_HISTORY), formRef.current]
      futureRef.current = []
      forceUpdate(n => n + 1)
    }
    rawDispatch(action)
  }, [rawDispatch])

  const undo = useCallback(() => {
    if (pastRef.current.length === 0) return
    const prev = pastRef.current[pastRef.current.length - 1]
    pastRef.current = pastRef.current.slice(0, -1)
    futureRef.current = [...futureRef.current, formRef.current]
    rawDispatch({ type: 'LOAD_FORM', form: prev })
    forceUpdate(n => n + 1)
  }, [rawDispatch])

  const redo = useCallback(() => {
    if (futureRef.current.length === 0) return
    const next = futureRef.current[futureRef.current.length - 1]
    futureRef.current = futureRef.current.slice(0, -1)
    pastRef.current = [...pastRef.current, formRef.current]
    rawDispatch({ type: 'LOAD_FORM', form: next })
    forceUpdate(n => n + 1)
  }, [rawDispatch])

  const setActiveField = useCallback((sectionId: string | null, fieldId: string | null) => {
    setActiveSectionId(sectionId)
    setActiveFieldId(fieldId)
  }, [])

  const canUndo = pastRef.current.length > 0
  const canRedo = futureRef.current.length > 0

  return (
    <Ctx.Provider value={{ form, dispatch, activeFieldId, activeSectionId, setActiveField, undo, redo, canUndo, canRedo, snapshot }}>
      {children}
    </Ctx.Provider>
  )
}

export function useFormBuilder() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useFormBuilder outside provider')
  return ctx
}
