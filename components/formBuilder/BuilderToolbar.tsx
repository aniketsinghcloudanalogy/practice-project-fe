'use client'
import { useState } from 'react'
import { message } from 'antd'
import Button from '@/components/common/antd/Button'
import Modal from '@/components/common/antd/Modal'
import Tooltip from '@/components/common/antd/Tooltip'
import Typography from '@/components/common/antd/Typography'
import {
  SaveOutlined, EyeOutlined, EditOutlined, DownloadOutlined, CopyOutlined,
} from '@/components/common/antd/icons'
import { useFormBuilder } from './store'

const { Text } = Typography

interface Props {
  mode: 'build' | 'preview'
  onModeChange: (m: 'build' | 'preview') => void
}

export default function BuilderToolbar({ mode, onModeChange }: Props) {
  const { form } = useFormBuilder()
  const [jsonOpen, setJsonOpen] = useState(false)
  const [msg, contextHolder] = message.useMessage()

  const jsonStr = JSON.stringify(form, null, 2)

  const handleSave = () => {
    localStorage.setItem(`form_${form.id}`, jsonStr)
    msg.success('Form saved')
  }

  const handleExport = () => {
    const blob = new Blob([jsonStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${form.title.replace(/\s+/g, '_')}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <>
      {contextHolder}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '8px 16px',
        background: '#fff',
        border: '1px solid #e2e8f0',
        borderRadius: 10,
        marginBottom: 16,
        flexShrink: 0,
      }}>
        <Text style={{ fontWeight: 600, fontSize: 14, color: '#1e293b' }}>
          {form.title}
        </Text>

        <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: 8, padding: 3, gap: 2 }}>
          <button
            onClick={() => onModeChange('build')}
            style={{
              padding: '5px 14px', borderRadius: 6, border: 'none', cursor: 'pointer',
              background: mode === 'build' ? '#7c3aed' : 'transparent',
              color: mode === 'build' ? '#fff' : '#64748b',
              fontWeight: 500, fontSize: 13, display: 'flex', alignItems: 'center', gap: 5, transition: 'all 0.15s',
            }}
          >
            <EditOutlined /> Build
          </button>
          <button
            onClick={() => onModeChange('preview')}
            style={{
              padding: '5px 14px', borderRadius: 6, border: 'none', cursor: 'pointer',
              background: mode === 'preview' ? '#7c3aed' : 'transparent',
              color: mode === 'preview' ? '#fff' : '#64748b',
              fontWeight: 500, fontSize: 13, display: 'flex', alignItems: 'center', gap: 5, transition: 'all 0.15s',
            }}
          >
            <EyeOutlined /> Preview
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Tooltip title="View JSON schema">
            <Button variant="ghost" icon={<DownloadOutlined />} size="small" onClick={() => setJsonOpen(true)}>
              JSON
            </Button>
          </Tooltip>
          <Tooltip title="Save form">
            <Button variant="primary" icon={<SaveOutlined />} size="small" onClick={handleSave}>
              Save
            </Button>
          </Tooltip>
        </div>
      </div>

      <Modal
        title="Form JSON Schema"
        open={jsonOpen}
        onCancel={() => setJsonOpen(false)}
        footer={[
          <Button key="copy" variant="ghost" icon={<CopyOutlined />} onClick={() => { navigator.clipboard.writeText(jsonStr); msg.success('Copied') }}>Copy</Button>,
          <Button key="export" variant="primary" icon={<DownloadOutlined />} onClick={handleExport}>Export</Button>,
        ]}
        width={680}
      >
        <pre style={{
          background: '#0f172a', color: '#e2e8f0', borderRadius: 8,
          padding: 16, maxHeight: 420, overflowY: 'auto', fontSize: 12, lineHeight: 1.6,
        }}>
          {jsonStr}
        </pre>
      </Modal>
    </>
  )
}
