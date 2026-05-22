"use client";

import AntTypography from '../antd/Typography'
import { StyledTypographyWrapper } from './styles'
import type { AppTypographyProps } from './types'

type TypographyComponent = typeof AntTypography & {
	Title: typeof AntTypography.Title
	Text: typeof AntTypography.Text
	Paragraph: typeof AntTypography.Paragraph
	Link: typeof AntTypography.Link
}

const TypographyBase = (({ children, variant = 'default', ...props }: AppTypographyProps) => {
	return (
		<StyledTypographyWrapper $variant={variant}>
			<AntTypography {...props}>{children}</AntTypography>
		</StyledTypographyWrapper>
	)
}) as TypographyComponent

TypographyBase.Title = AntTypography.Title
TypographyBase.Text = AntTypography.Text
TypographyBase.Paragraph = AntTypography.Paragraph
TypographyBase.Link = AntTypography.Link

export default TypographyBase