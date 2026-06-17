"use client";

import AntUpload from '../antd/Upload'
import { StyledUploadWrapper } from './styles'
import type { AppUploadProps } from './types'

const Upload = ({ children, ...props }: AppUploadProps) => {
  return (
    <StyledUploadWrapper>
      <AntUpload {...props}>{children}</AntUpload>
    </StyledUploadWrapper>
  )
}

export default Upload
