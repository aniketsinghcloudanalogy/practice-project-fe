export type FieldType =
  | 'text-content'
  | 'add-section'
  | 'text'
  | 'multi-select'
  | 'drop-down'
  | 'date'
  | 'time'
  | 'currency'
  | 'contact'
  | 'email'
  | 'textarea'
  | 'table'
  | 'attachment'
  | 'checkbox'
  | 'radio'
  | 'toggle'
  | 'line-break'

export type ColSpan = 'begin' | 'mid' | 'end' | 'full'

export interface FieldDef {
  id: string
  type: FieldType
  label: string
  placeholder: string
  required: boolean
  col: ColSpan
  options: string[]
}

export interface SectionDef {
  id: string
  title: string
  fields: FieldDef[]
}

export interface FormSchema {
  id: string
  title: string
  sections: SectionDef[]
}
