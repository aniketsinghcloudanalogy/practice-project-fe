'use client'
import { Select as AntSelect } from 'antd'
import type { SelectProps } from 'antd'

function Select({ style, ...props }: SelectProps) {
  return (
    <AntSelect
      {...props}
      style={{ borderRadius: 8, ...style }}
    />
  )
}

Select.Option = AntSelect.Option
Select.OptGroup = AntSelect.OptGroup

export default Select
export type { SelectProps }
