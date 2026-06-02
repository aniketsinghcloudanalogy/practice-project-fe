"use client";

import styled from 'styled-components'

export const ContactPageShell = styled.main`
	flex: 1;
	background:
		radial-gradient(circle at 18% 10%, rgba(37, 99, 235, 0.1), transparent 26%),
		linear-gradient(180deg, #f8fafc 0%, #eef4ff 48%, #f8fafc 100%);
	padding: clamp(24px, 4vw, 72px) clamp(16px, 3vw, 40px);

	@media (max-width: 640px) {
		padding: 18px 12px 28px;
	}
`

export const ContactContainer = styled.div`
	display: grid;
	grid-template-columns: minmax(360px, 0.92fr) minmax(420px, 1.08fr);
	align-items: stretch;
	gap: clamp(18px, 2.4vw, 34px);
	width: min(1320px, 100%);
	margin: 0 auto;

	@media (min-width: 1440px) {
		grid-template-columns: minmax(430px, 0.88fr) minmax(520px, 1.12fr);
	}

	@media (max-width: 1024px) {
		grid-template-columns: 1fr;
		width: min(760px, 100%);
	}

	@media (max-width: 640px) {
		gap: 14px;
	}
`
