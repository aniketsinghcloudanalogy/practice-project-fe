"use client";

import AntSpace from '../antd/Space'
import { StyledSpaceWrapper } from './styles'
import type { AppSpaceProps } from './types'

const Space = ({ children, ...props }: AppSpaceProps) => {
  return (
    <StyledSpaceWrapper>
      <AntSpace {...props}>{children}</AntSpace>
    </StyledSpaceWrapper>
  )
}

export default Space
