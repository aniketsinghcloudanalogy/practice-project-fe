"use client";

import AntConfigProvider from '../antd/ConfigProvider'
import { StyledConfigProviderWrapper } from './styles'
import type { AppConfigProviderProps } from './types'

const ConfigProvider = ({ children, ...props }: AppConfigProviderProps) => {
	return (
		<StyledConfigProviderWrapper>
			<AntConfigProvider {...props}>{children}</AntConfigProvider>
		</StyledConfigProviderWrapper>
	)
}

export default ConfigProvider