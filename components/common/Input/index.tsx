"use client";

import type { InputRef } from 'antd'
import type { ComponentProps, RefAttributes, ReactElement } from 'react'
import { forwardRef, useImperativeHandle, useRef } from 'react'
import AntInput from '../antd/Input'
import { StyledInputWrapper } from './styles'
import type { AppInputProps } from './types'

type AppPasswordProps = Omit<ComponentProps<typeof AntInput.Password>, 'variant'> & {
	appearance?: 'default' | 'soft'
}

type AppTextAreaProps = Omit<ComponentProps<typeof AntInput.TextArea>, 'variant'> & {
	appearance?: 'default' | 'soft'
}

type AppSearchProps = Omit<ComponentProps<typeof AntInput.Search>, 'variant'> & {
	appearance?: 'default' | 'soft'
}

type InputComponent = ((props: AppInputProps & RefAttributes<InputRef>) => ReactElement) & {
	Password: (props: AppPasswordProps) => ReactElement
	TextArea: (props: AppTextAreaProps) => ReactElement
	Search: (props: AppSearchProps) => ReactElement
	Group: typeof AntInput.Group
}

const InputBase = forwardRef<InputRef, AppInputProps>(function Input(
	{ appearance = 'default', ...props },
	ref,
) {
	const nativeFileInputRef = useRef<HTMLInputElement | null>(null)

	useImperativeHandle(
		ref,
		() => ({ input: nativeFileInputRef.current }) as InputRef,
		[],
	)

	if (props.type === 'file') {
		const fileInputProps = props as unknown as ComponentProps<'input'>

		return (
			<StyledInputWrapper $appearance={appearance}>
				<input ref={nativeFileInputRef} {...fileInputProps} />
			</StyledInputWrapper>
		)
	}

	return (
		<StyledInputWrapper $appearance={appearance}>
			<AntInput ref={ref} {...props} />
		</StyledInputWrapper>
	)
}) as unknown as InputComponent

InputBase.Password = (({ appearance = 'default', ...props }: AppPasswordProps) => (
	<StyledInputWrapper $appearance={appearance}>
		<AntInput.Password {...props} />
	</StyledInputWrapper>
)) as InputComponent['Password']

InputBase.TextArea = ((props) => {
	const { appearance = 'default', ...rest } = props as AppTextAreaProps
	return (
		<StyledInputWrapper $appearance={appearance}>
			<AntInput.TextArea {...(rest as ComponentProps<typeof AntInput.TextArea>)} />
		</StyledInputWrapper>
	)
}) as InputComponent['TextArea']

InputBase.Search = (({ appearance = 'default', ...props }: AppSearchProps) => (
	<StyledInputWrapper $appearance={appearance}>
		<AntInput.Search {...props} />
	</StyledInputWrapper>
)) as InputComponent['Search']

InputBase.Group = AntInput.Group

export default InputBase
