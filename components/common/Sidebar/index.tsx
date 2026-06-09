"use client";

import AntLayout from '../antd/layout'
import { StyledSiderWrapper } from './styles'
import type { AppSiderProps } from './types'

const Sidebar = ({ variant = 'default', children, ...props }: AppSiderProps) => {
  return (
    <StyledSiderWrapper $variant={variant}>
      <AntLayout.Sider {...props}>{children}</AntLayout.Sider>
    </StyledSiderWrapper>
  )
}

export default Sidebar
