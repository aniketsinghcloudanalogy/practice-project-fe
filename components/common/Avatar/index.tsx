"use client";

import React from 'react'

import AntdAvatar from '../antd/Avatar'
import { UserOutlined } from '@ant-design/icons'
import { StyledAvatarWrapper } from './styles'
import type { AppAvatarProps } from './types'

const Avatar = ({ src, size = 32, alt, className, icon }: AppAvatarProps) => {
  const resolvedIcon = icon ?? (!src && <UserOutlined />)

  return (
    <StyledAvatarWrapper className={className}>
      <AntdAvatar size={size as any} src={src ?? undefined} icon={resolvedIcon as any} alt={alt} />
    </StyledAvatarWrapper>
  )
}

export default Avatar
