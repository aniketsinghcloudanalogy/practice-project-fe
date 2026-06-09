"use client";

import AntDrawer from '../antd/Drawer'
import { StyledDrawerWrapper } from './styles'
import type { AppDrawerProps } from './types'

const Drawer = ({ variant = 'default', children, ...props }: AppDrawerProps) => {
  return (
    <StyledDrawerWrapper $variant={variant}>
      <AntDrawer {...props}>{children}</AntDrawer>
    </StyledDrawerWrapper>
  )
}

export default Drawer
