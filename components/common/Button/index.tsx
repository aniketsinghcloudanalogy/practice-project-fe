"use client";

import { usePathname } from 'next/navigation'
import AntButton from '../antd/Button'
import { StyledButtonWrapper } from './styles'
import type { AppButtonProps } from './types'

const Button = ({ children, variant = 'primary', ...props }: AppButtonProps) => {
	const pathname = usePathname() ?? ''
	const href = typeof props.href === 'string' ? props.href : undefined
	const isCurrentPageLink = href === pathname
	const buttonProps = isCurrentPageLink
		? { ...props, href: undefined, 'aria-current': 'page' as const }
		: props

	return (
		<StyledButtonWrapper $variant={variant}>
			<AntButton {...buttonProps}>{children}</AntButton>
		</StyledButtonWrapper>
	)
}

export default Button
