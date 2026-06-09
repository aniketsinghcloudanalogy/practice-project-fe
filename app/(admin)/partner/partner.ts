import { createElement, type ReactNode } from 'react'
import { HiOutlineUsers } from 'react-icons/hi2'
import { MdOutlineHandshake } from 'react-icons/md'
import { LuClock4 } from 'react-icons/lu'
import { GoXCircle } from 'react-icons/go'

export type PartnerStat = {
	icon: ReactNode;
	bg: string;
	value: string;
	label: string;
}

export const partnerStats: PartnerStat[] = [
	{
		icon: createElement(HiOutlineUsers, { size: 24, className: 'text-purple-600' }),
		bg: 'bg-purple-50',
		value: '1,278',
		label: 'Partners',
	},
	{
		icon: createElement(MdOutlineHandshake, { size: 24, className: 'text-teal-700' }),
		bg: 'bg-teal-50',
		value: '50',
		label: 'Partner Programs',
	},
	{
		icon: createElement(LuClock4, { size: 24, className: 'text-amber-700' }),
		bg: 'bg-amber-50',
		value: '10',
		label: 'In Request',
	},
	{
		icon: createElement(GoXCircle, { size: 24, className: 'text-red-700' }),
		bg: 'bg-red-50',
		value: '5',
		label: 'Rejected',
	},
]
