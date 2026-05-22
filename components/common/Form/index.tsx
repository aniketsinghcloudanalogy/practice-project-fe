"use client";

import type { ReactNode } from 'react'

import AntForm from '../antd/Form'
import { StyledFormWrapper } from './styles'
import type { AppFormProps } from './types'

type FormComponent = typeof AntForm & {
	Item: typeof AntForm.Item
	List: typeof AntForm.List
	useForm: typeof AntForm.useForm
	useWatch: typeof AntForm.useWatch
	Provider: typeof AntForm.Provider
	ErrorList: typeof AntForm.ErrorList
}

const FormBase = (({ children, variant = 'default', ...props }: AppFormProps) => {
	return (
		<StyledFormWrapper $variant={variant}>
			<AntForm {...props}>{children as ReactNode}</AntForm>
		</StyledFormWrapper>
	)
}) as FormComponent

FormBase.Item = AntForm.Item
FormBase.List = AntForm.List
FormBase.useForm = AntForm.useForm
FormBase.useWatch = AntForm.useWatch
FormBase.Provider = AntForm.Provider
FormBase.ErrorList = AntForm.ErrorList

export default FormBase