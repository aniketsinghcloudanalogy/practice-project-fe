"use client";
 
import styled from 'styled-components'
 
export const StyledModalWrapper = styled.div<{ $variant: string }>`
    .ant-modal-content {
        border-radius: 16px;
    }

    .ant-modal-body,
    .ant-modal-body * {
        scrollbar-width: none;
        -ms-overflow-style: none;
    }

    .ant-modal-body::-webkit-scrollbar,
    .ant-modal-body *::-webkit-scrollbar {
        display: none;
    }
 
    ${({ $variant }) =>
        $variant === 'compact' &&
        `
        .ant-modal-content {
            padding: 16px;
        }
    `}

  ${({ $variant }) =>
        $variant === 'rounds' &&
        `
        .ant-modal-content {
            padding: 16px;
			border-radius: 16px;
        }
    `}
`
