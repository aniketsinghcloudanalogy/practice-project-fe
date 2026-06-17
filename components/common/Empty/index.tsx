"use client";

import AntEmpty from '../antd/Empty'
import { StyledEmptyWrapper } from './styles'
import type { AppEmptyProps } from './types'

const Empty = (({ children, ...props }: AppEmptyProps) => {
  return (
    <StyledEmptyWrapper>
      <AntEmpty {...props}>{children}</AntEmpty>
    </StyledEmptyWrapper>
  )
}) as typeof AntEmpty

Empty.PRESENTED_IMAGE_SIMPLE = AntEmpty.PRESENTED_IMAGE_SIMPLE
Empty.PRESENTED_IMAGE_DEFAULT = AntEmpty.PRESENTED_IMAGE_DEFAULT

export default Empty
