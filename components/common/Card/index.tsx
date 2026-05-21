"use client";

import AntCard from '../antd/Card'
import { StyledCardWrapper } from './styles'
import type { AppCardProps } from './types'

type CardComponent = typeof AntCard & {
	Grid: typeof AntCard.Grid
	Meta: typeof AntCard.Meta
}

const CardBase = (({ children, ...props }: AppCardProps) => {
	return (
		<StyledCardWrapper>
			<AntCard {...props}>{children}</AntCard>
		</StyledCardWrapper>
	)
}) as CardComponent

CardBase.Grid = AntCard.Grid
CardBase.Meta = AntCard.Meta

export default CardBase