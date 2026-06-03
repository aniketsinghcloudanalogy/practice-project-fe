"use client";

import React from 'react'
import AntDropdown from '../antd/Dropdown'
import type { MenuProps } from 'antd'
import { StyledDropdownWrapper } from './styles'
import type { AppDropdownProps } from './types'

const Dropdown = ({ menuItems, trigger = ['hover'], placement = 'bottomRight', children }: AppDropdownProps) => {
  return (
    <StyledDropdownWrapper>
      <AntDropdown menu={{ items: menuItems as MenuProps['items'] }} trigger={trigger} placement={placement}>
        {children}
      </AntDropdown>
    </StyledDropdownWrapper>
  )
}

export default Dropdown
