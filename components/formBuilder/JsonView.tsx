'use client'
import { useMemo } from 'react'
import { Button, Typography, message } from 'antd'
import { CopyOutlined } from '@ant-design/icons'
import { useFormBuilder } from './store'

function highlight(json: string): React.ReactNode[] {
  const parts = json.split(/("(?:[^"\\]|\\.)*"(?:\s*:)?|true|false|null|\d+)/g)
  return parts.map((part, i) => {
    if (/^"[^"]*":/.test(part)) return <span key={i} style={{ color: '#79c0ff' }}>{part}</span>
    if (/^"/.test(part)) return <span key={i} style={{ color: '#a8d4ff' }}>{part}</span>
    if (/^\d/.test(part)) return <span key={i} style={{ color: '#f2cc60' }}>{part}</span>
    if (/^(true|false)/.test(part)) return <span key={i} style={{ color: '#ff9f60' }}>{part}</span>
    return <span key={i}>{part}</span>
  })
}

export default function JsonView() {
  const { form } = useFormBuilder()
  const [msg, ctx] = message.useMessage()

  const schema = useMemo(() => ({
    formTitle: form.title,
    sections: form.sections.map(s => ({
      id: s.id,
      title: s.title,
      fields: s.fields.map(f => ({
        id: f.id,
        type: f.type,
        label: f.label,
        placeholder: f.placeholder,
        required: f.required,
        col: f.col,
        options: f.options,
      })),
    })),
  }), [form])

  const jsonStr = JSON.stringify(schema, null, 2)

  const copy = () => {
    navigator.clipboard.writeText(jsonStr)
    msg.success('Copied to clipboard')
  }

  return (
    <div style={{ padding: '20px 24px' }}>
      {ctx}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <Typography.Text style={{ fontWeight: 600, fontSize: 14, color: '#1a1f3a' }}>Form Schema JSON</Typography.Text>
        <Button size="small" icon={<CopyOutlined />} onClick={copy} style={{ borderRadius: 6, borderColor: '#ADC6FF', color: '#2F54EB' }}>
          Copy
        </Button>
      </div>
      <pre
        style={{
          background: '#1a1f3a', borderRadius: 8, padding: 14,
          fontFamily: 'monospace', fontSize: 12, lineHeight: 1.7,
          overflowX: 'auto', margin: 0, color: '#e0e6f7',
        }}
      >
        {highlight(jsonStr)}
      </pre>
    </div>
  )
}
