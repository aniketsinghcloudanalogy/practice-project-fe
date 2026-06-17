'use client'
import { useState } from 'react'
import ConfigProvider from '@/components/common/antd/ConfigProvider'
import { FormBuilderProvider, useFormBuilder } from './store'
import BuilderToolbar from './BuilderToolbar'
import FieldPalette from './FieldPalette'
import FormCanvas from './FormCanvas'
import PropertiesPanel from './PropertiesPanel'
import FormPreview from './FormPreview'
import type { FieldType } from './types'

const theme = {
  token: {
    colorPrimary: '#7c3aed',
    colorInfo: '#7c3aed',
    borderRadius: 8,
    fontFamily: 'var(--font-geist-sans, system-ui, sans-serif)',
  },
}

function BuilderLayout() {
  const [mode, setMode] = useState<'build' | 'preview'>('build')
  const { activePanel, addField, form } = useFormBuilder()
  const hasPanel = activePanel !== null

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <BuilderToolbar mode={mode} onModeChange={setMode} />

      {mode === 'preview' ? (
        <FormPreview />
      ) : (
        <div style={{
          display: 'flex',
          gap: 12,
          alignItems: 'flex-start',
        }}>
          {/* Left palette */}
          <aside style={{
            width: 200,
            background: '#fff',
            border: '1px solid #e2e8f0',
            borderRadius: 10,
            flexShrink: 0,
            position: 'sticky',
            top: 0,
          }}>
            <FieldPalette
              onAdd={(type: FieldType) => {
                const first = form.sections[0]
                if (first) addField(first.id, type)
              }}
            />
          </aside>

          {/* Canvas */}
          <main style={{ flex: 1, minWidth: 0 }}>
            <FormCanvas />
          </main>

          {/* Right panel */}
          {hasPanel && (
            <aside style={{
              width: 280,
              background: '#fff',
              border: '1px solid #e2e8f0',
              borderRadius: 10,
              flexShrink: 0,
              position: 'sticky',
              top: 0,
            }}>
              <PropertiesPanel />
            </aside>
          )}
        </div>
      )}
    </div>
  )
}

export default function FormBuilder() {
  return (
    <ConfigProvider theme={theme}>
      <FormBuilderProvider>
        <BuilderLayout />
      </FormBuilderProvider>
    </ConfigProvider>
  )
}
