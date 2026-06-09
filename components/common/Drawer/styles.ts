"use client";

import styled from 'styled-components'

export const StyledDrawerWrapper = styled.div<{ $variant: string }>`
  .ant-drawer-content-wrapper {
    box-shadow: 12px 0 40px rgba(15, 23, 42, 0.12);
  }

  .ant-drawer-body {
    padding: 0;
  }

  ${({ $variant }) =>
    $variant === 'sidebar' &&
    `
    .ant-drawer-content {
      background: linear-gradient(
        180deg,
        rgba(255, 255, 255, 0.98) 0%,
        rgba(248, 250, 252, 0.95) 100%
      );
    }

    .ant-drawer-header {
      display: none;
    }
  `}
`
