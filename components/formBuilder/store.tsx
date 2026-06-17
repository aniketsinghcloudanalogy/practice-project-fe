'use client'
import { createContext, useContext, useReducer, useState, useCallback } from 'react'
import type { FormSchema, FormSection, FormField, PanelTarget, FieldType } from './types'

const initialForm: FormSchema = {
  id: 'form_1',
  title: 'Untitled Form',
  description: '',
  sections: [
    {
      id: 'section_1',
      title: 'Section 1',
      description: '',
      columns: 1,
      fields: [],
    },
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

type Action =
  | { type: 'SET_FORM'; payload: Partial<FormSchema> }
  | { type: 'ADD_SECTION' }
  | { type: 'UPDATE_SECTION'; sectionId: string; payload: Partial<FormSection> }
  | { type: 'DELETE_SECTION'; sectionId: string }
  | { type: 'REORDER_SECTIONS'; ids: string[] }
  | { type: 'ADD_FIELD'; sectionId: string; field: FormField }
  | { type: 'UPDATE_FIELD'; sectionId: string; fieldId: string; payload: Partial<FormField> }
  | { type: 'DELETE_FIELD'; sectionId: string; fieldId: string }
  | { type: 'REORDER_FIELDS'; sectionId: string; ids: string[] }
  | { type: 'MOVE_FIELD'; fromSection: string; toSection: string; fieldId: string; toIndex: number }

function uid() {
  return Math.random().toString(36).slice(2, 10)
}

function reducer(state: FormSchema, action: Action): FormSchema {
  const now = new Date().toISOString()
  switch (action.type) {
    case 'SET_FORM':
      return { ...state, ...action.payload, updatedAt: now }

    case 'ADD_SECTION':
      return {
        ...state,
        updatedAt: now,
        sections: [
          ...state.sections,
          { id: `section_${uid()}`, title: `Section ${state.sections.length + 1}`, description: '', columns: 1, fields: [] },
        ],
      }

    case 'UPDATE_SECTION':
      return {
        ...state,
        updatedAt: now,
        sections: state.sections.map(s => s.id === action.sectionId ? { ...s, ...action.payload } : s),
      }

    case 'DELETE_SECTION':
      return { ...state, updatedAt: now, sections: state.sections.filter(s => s.id !== action.sectionId) }

    case 'REORDER_SECTIONS': {
      const map = Object.fromEntries(state.sections.map(s => [s.id, s]))
      return { ...state, updatedAt: now, sections: action.ids.map(id => map[id]) }
    }

    case 'ADD_FIELD':
      return {
        ...state,
        updatedAt: now,
        sections: state.sections.map(s =>
          s.id === action.sectionId ? { ...s, fields: [...s.fields, action.field] } : s
        ),
      }

    case 'UPDATE_FIELD':
      return {
        ...state,
        updatedAt: now,
        sections: state.sections.map(s =>
          s.id === action.sectionId
            ? { ...s, fields: s.fields.map(f => f.id === action.fieldId ? { ...f, ...action.payload } : f) }
            : s
        ),
      }

    case 'DELETE_FIELD':
      return {
        ...state,
        updatedAt: now,
        sections: state.sections.map(s =>
          s.id === action.sectionId ? { ...s, fields: s.fields.filter(f => f.id !== action.fieldId) } : s
        ),
      }

    case 'REORDER_FIELDS':
      return {
        ...state,
        updatedAt: now,
        sections: state.sections.map(s => {
          if (s.id !== action.sectionId) return s
          const map = Object.fromEntries(s.fields.map(f => [f.id, f]))
          return { ...s, fields: action.ids.map(id => map[id]) }
        }),
      }

    case 'MOVE_FIELD': {
      const field = state.sections.find(s => s.id === action.fromSection)?.fields.find(f => f.id === action.fieldId)
      if (!field) return state
      return {
        ...state,
        updatedAt: now,
        sections: state.sections.map(s => {
          if (s.id === action.fromSection) return { ...s, fields: s.fields.filter(f => f.id !== action.fieldId) }
          if (s.id === action.toSection) {
            const fields = [...s.fields]
            fields.splice(action.toIndex, 0, field)
            return { ...s, fields }
          }
          return s
        }),
      }
    }

    default:
      return state
  }
}

interface CtxValue {
  form: FormSchema
  dispatch: React.Dispatch<Action>
  activePanel: PanelTarget | null
  setActivePanel: (t: PanelTarget | null) => void
  addField: (sectionId: string, type: FieldType) => void
}

const Ctx = createContext<CtxValue | null>(null)

export function FormBuilderProvider({ children }: { children: React.ReactNode }) {
  const [form, dispatch] = useReducer(reducer, initialForm)
  const [activePanel, setActivePanelState] = useState<PanelTarget | null>(null)

  const setActivePanel = useCallback((t: PanelTarget | null) => setActivePanelState(t), [])

  const addField = useCallback((sectionId: string, type: FieldType) => {
    const field: FormField = {
      id: `field_${uid()}`,
      type,
      label: type.charAt(0).toUpperCase() + type.slice(1) + ' Field',
      placeholder: '',
      required: false,
      options: ['select', 'multiselect', 'radio', 'checkbox'].includes(type)
        ? [{ label: 'Option 1', value: 'option_1' }, { label: 'Option 2', value: 'option_2' }]
        : undefined,
      colSpan: 1,
    }
    dispatch({ type: 'ADD_FIELD', sectionId, field })
    setActivePanel({ kind: 'field', sectionId, fieldId: field.id })
  }, [setActivePanel])

  return <Ctx.Provider value={{ form, dispatch, activePanel, setActivePanel, addField }}>{children}</Ctx.Provider>
}

export function useFormBuilder() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useFormBuilder must be used inside FormBuilderProvider')
  return ctx
}
