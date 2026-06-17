"use client";

import AntSpin from '../antd/Spin'
import { StyledSpinWrapper } from './styles'
import type { AppSpinProps } from './types'

const Spin = ({ children, ...props }: AppSpinProps) => {
  return (
    <StyledSpinWrapper>
      <AntSpin {...props}>{children}</AntSpin>
    </StyledSpinWrapper>
  )
}

export default Spin
