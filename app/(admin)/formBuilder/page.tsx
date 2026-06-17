'use client'
import FormBuilder from '@/components/formBuilder/FormBuilder'

export default function FormBuilderPage() {
  return (
    <div className="h-[calc(100vh-var(--navbar-height)-48px)] overflow-auto">
      <FormBuilder />
    </div>
  )
}
