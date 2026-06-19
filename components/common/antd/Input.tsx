'use client'
import { Input as AntInput } from 'antd'
import type { InputProps, InputRef } from 'antd'

function Input({ style, ...props }: InputProps) {
  return (
    <AntInput
      {...props}
      style={{ borderRadius: 8, borderColor: '#e2e8f0', ...style }}
    />
  )
}

function TextArea({ style, ...props }: React.ComponentProps<typeof AntInput.TextArea>) {
  return (
    <AntInput.TextArea
      {...props}
      style={{ borderRadius: 8, borderColor: '#e2e8f0', ...style }}
    />
  )
}

Input.TextArea = TextArea
Input.Password = AntInput.Password
Input.Search = AntInput.Search
Input.Group = AntInput.Group

export default Input
export type { InputProps, InputRef }
