export type FieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'email'
  | 'phone'
  | 'select'
  | 'multiselect'
  | 'checkbox'
  | 'radio'
  | 'date'
  | 'file'
  | 'divider'
  | 'heading'

export interface FieldOption {
  label: string
  value: string
}

export interface FormField {
  id: string
  type: FieldType
  label: string
  placeholder?: string
  required: boolean
  description?: string
  options?: FieldOption[]
  validation?: {
    min?: number
    max?: number
    pattern?: string
    message?: string
  }
  colSpan?: 1 | 2
}

export interface FormSection {
  id: string
  title: string
  description?: string
  columns: 1 | 2
  fields: FormField[]
}

export interface FormSchema {
  id: string
  title: string
  description?: string
  sections: FormSection[]
  createdAt: string
  updatedAt: string
}

export type PanelTarget =
  | { kind: 'form' }
  | { kind: 'section'; sectionId: string }
  | { kind: 'field'; sectionId: string; fieldId: string }
