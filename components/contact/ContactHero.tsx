"use client";

import {
	CustomerServiceOutlined,
	MailFilled,
	PhoneOutlined,
} from '@/components/common/antd/icons'
import {
	HeroBadge,
	HeroShell,
	HeroText,
	HeroTitle,
	InfoGrid,
	InfoIcon,
	InfoLabel,
	InfoTile,
	InfoValue,
} from './ContactHero.styles'

const contactItems = [
	{
		icon: <MailFilled />,
		label: 'Email',
		value: 'support@practiceproject.com',
	},
	{
		icon: <PhoneOutlined />,
		label: 'Phone',
		value: '+91 7048937789',
	},

]

const ContactHero = () => {
	return (
		<HeroShell>
			<div>
				<HeroBadge>
					<CustomerServiceOutlined />
					Contact support
				</HeroBadge>
				<HeroTitle>Let&apos;s solve the next thing together.</HeroTitle>
				<HeroText>
					Send your question, project note, or support request. The team reviews every message and gets back with clear next steps.
				</HeroText>
			</div>

			<InfoGrid>
				{contactItems.map((item) => (
					<InfoTile key={item.label}>
						<InfoIcon>{item.icon}</InfoIcon>
						<InfoLabel>{item.label}</InfoLabel>
						<InfoValue>{item.value}</InfoValue>
					</InfoTile>
				))}
			</InfoGrid>
		</HeroShell>
	)
}

export default ContactHero
