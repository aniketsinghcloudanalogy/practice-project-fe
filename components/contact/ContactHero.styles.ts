"use client";

import styled from 'styled-components'

export const HeroShell = styled.section`
	display: flex;
	height: 100%;
	min-height: clamp(500px, 44vw, 680px);
	flex-direction: column;
	justify-content: space-between;
	gap: clamp(28px, 4vw, 48px);
	overflow: hidden;
	border-radius: 8px;
	background:
		linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(29, 78, 216, 0.82) 58%, rgba(14, 116, 144, 0.76)),
		url('/authbg.jpeg');
	background-position: center;
	background-size: cover;
	color: #ffffff;
	padding: clamp(28px, 3.6vw, 56px);
	box-shadow: 0 24px 70px rgba(15, 23, 42, 0.18);

	@media (max-width: 1024px) {
		min-height: 420px;
	}

	@media (max-width: 640px) {
		min-height: auto;
		padding: 22px;
	}
`

export const HeroBadge = styled.div`
	display: inline-flex;
	width: fit-content;
	align-items: center;
	gap: 8px;
	border: 1px solid rgba(255, 255, 255, 0.28);
	border-radius: 999px;
	background: rgba(255, 255, 255, 0.12);
	padding: 8px 12px;
	color: #dbeafe;
	font-size: 13px;
	font-weight: 600;
	line-height: 1;
	white-space: nowrap;
`

export const HeroTitle = styled.h1`
	margin: 0;
	max-width: 620px;
	color: #ffffff;
	font-size: clamp(2rem, 4.2vw, 4.7rem);
	font-weight: 750;
	letter-spacing: 0;
	line-height: 1.04;

	@media (max-width: 640px) {
		font-size: clamp(2rem, 10vw, 2.8rem);
		line-height: 1.08;
	}
`

export const HeroText = styled.p`
	margin: 18px 0 0;
	max-width: 560px;
	color: #dbeafe;
	font-size: clamp(15px, 1.3vw, 17px);
	line-height: 1.7;

	@media (max-width: 640px) {
		line-height: 1.6;
	}
`

export const InfoGrid = styled.div`
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
	gap: 12px;

	@media (max-width: 380px) {
		gap: 10px;
	}
`

export const InfoTile = styled.div`
	border: 1px solid rgba(255, 255, 255, 0.18);
	border-radius: 8px;
	background: rgba(255, 255, 255, 0.1);
	padding: 16px;
	backdrop-filter: blur(12px);
	min-width: 0;

	@media (max-width: 640px) {
		display: grid;
		grid-template-columns: 40px 1fr;
		column-gap: 12px;
		align-items: center;
		padding: 14px;
	}
`

export const InfoIcon = styled.span`
	display: flex;
	height: 36px;
	width: 36px;
	align-items: center;
	justify-content: center;
	border-radius: 8px;
	background: rgba(255, 255, 255, 0.16);
	color: #bfdbfe;
	font-size: 18px;

	@media (max-width: 640px) {
		grid-row: span 2;
	}
`

export const InfoLabel = styled.p`
	margin: 12px 0 4px;
	color: #bfdbfe;
	font-size: 12px;
	font-weight: 700;
	text-transform: uppercase;
	letter-spacing: 0;

	@media (max-width: 640px) {
		margin: 0 0 3px;
	}
`

export const InfoValue = styled.p`
	margin: 0;
	color: #ffffff;
	font-size: 14px;
	font-weight: 600;
	line-height: 1.45;
	overflow-wrap: anywhere;
`
