'use client'
import { Modal as AntModal } from 'antd'
import type { ModalProps } from 'antd'

export default function Modal({ styles, ...props }: ModalProps) {
  return (
    <AntModal
      {...props}
      styles={{
        header: { borderBottom: '1px solid #f1f5f9', paddingBottom: 12 },
        body: { paddingTop: 16 },
        ...styles,
      }}
    />
  )
}

export type { ModalProps }
