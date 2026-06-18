"use client";

import { App } from 'antd'
import Button from '@/components/common/Button'
import Form from '@/components/common/Form'
import Input from '@/components/common/Input'
import {  Phone } from 'lucide-react';
import {
	MailOutlined,
	MessageOutlined,
	SendOutlined,
	UserOutlined,
} from '@/components/common/antd/icons'
import {
	useSubmitContactMessageMutation,
} from '@/store/services/contact/apiSlice'
import type { ContactMessagePayload } from '@/store/services/types'
import {
	FieldGrid,
	FormDescription,
	FormEyebrow,
	FormHeader,
	FormPanel,
	FormTitle,
	HelperText,
	SubmitRow,
} from './ContactForm.styles'

const toDigitsOnly = (value?: string | null) => {
	if (!value) return ''
	return value.replace(/\D/g, '')
}

const hasValidPhoneLength = (value?: string | null) => {
	const digits = toDigitsOnly(value)
	return digits.length >= 10 && digits.length <= 15
}

const ContactForm = () => {
	const { message } = App.useApp()
	const [form] = Form.useForm<ContactMessagePayload>()
	const [submitContact, { isLoading: loading }] = useSubmitContactMessageMutation()

	const handleSubmit = async (values: ContactMessagePayload) => {
		const primaryContact = toDigitsOnly(values.primaryContact)
		const secondaryContactDigits = toDigitsOnly(values.secondaryContact)

		const payload: ContactMessagePayload = {
			...values,
			firstName: values.firstName.trim(),
			lastName: values.lastName?.trim() || undefined,
			email: values.email.trim().toLowerCase(),
			primaryContact,
			secondaryContact: secondaryContactDigits || undefined,
			subject: values.subject.trim(),
			message: values.message.trim(),
		}

		try {
			const request = submitContact(payload)
			const timeoutId = setTimeout(() => {
				request.abort()
			}, 15000)

			const response = await request.unwrap()
			clearTimeout(timeoutId)
			message.success(response.message || 'Your message has been sent.')
			form.resetFields()
		} catch (error: any) {
			if (error?.name === 'AbortError') {
				message.error('Request timed out. Please check the server and try again.')
				return
			}

			const apiError = error?.data?.message
			message.error(apiError || 'Unable to send your message right now.')
		}
	}

	return (
		<FormPanel>
			<FormHeader>
				<FormEyebrow>Send a message</FormEyebrow>
				<FormTitle>Tell us what you need</FormTitle>
				<FormDescription>
					Share the important details and we will route your request to the right person.
				</FormDescription>
			</FormHeader>

			<Form<ContactMessagePayload>
				form={form}
				layout="vertical"
				requiredMark={false}
				validateTrigger="onBlur"
				onFinish={handleSubmit}
			>
				<FieldGrid>
					<Form.Item
						label={<span className="text-[13px] font-medium text-slate-700">First name</span>}
						name="firstName"
						rules={[
							{ required: true, message: 'Please enter your first name.' },
							{ min: 2, message: 'First name must be at least 2 characters long.' },
						]}
					>
						<Input
							appearance="soft"
							prefix={<UserOutlined className="text-slate-400" />}
							placeholder="First name"
							size="large"
						/>
					</Form.Item>

					<Form.Item
						label={<span className="text-[13px] font-medium text-slate-700">Last name</span>}
						name="lastName"
					>
						<Input
							appearance="soft"
							prefix={<UserOutlined className="text-slate-400" />}
							placeholder="Last name"
							size="large"
						/>
					</Form.Item>
				</FieldGrid>

				<Form.Item
					label={<span className="text-[13px] font-medium text-slate-700">Email address</span>}
					name="email"
					rules={[
						{ required: true, message: 'Please enter your email address.' },
						{ type: 'email', message: 'Enter a valid email address.' },
					]}
				>
					<Input
						appearance="soft"
						prefix={<MailOutlined className="text-slate-400" />}
						placeholder="name@example.com"
						size="large"
					/>
				</Form.Item>

				<FieldGrid>
					<Form.Item
						label={<span className="text-[13px] font-medium text-slate-700">Primary contact</span>}
						name="primaryContact"
						rules={[
							{ required: true, message: 'Please enter your phone number.' },
							{
								validator: async (_rule, value) => {
									if (!hasValidPhoneLength(value)) {
										throw new Error('Primary contact must contain 10-15 digits.')
									}
								},
							},
						]}
					>
						<Input
							appearance="soft"
							prefix={<Phone className="text-slate-400" />}
							placeholder="+1 555 000 0000"
							size="large"
						/>
					</Form.Item>

					<Form.Item
						label={<span className="text-[13px] font-medium text-slate-700">Secondary contact</span>}
						name="secondaryContact"
						rules={[
							{
								validator: async (_rule, value) => {
									if (!value) return

									if (!hasValidPhoneLength(value)) {
										throw new Error('Secondary contact must contain 10-15 digits.')
									}
								},
							},
						]}>
						<Input
							appearance="soft"
							prefix={<Phone className="text-slate-400" />}
							placeholder="Optional"
							size="large"
						/>
					</Form.Item>
				</FieldGrid>

				<Form.Item
						label={<span className="text-[13px] font-medium text-slate-700">Subject</span>}
						name="subject"
						rules={[
							{ required: true, message: 'Please enter a subject.' },
							{ min: 3, message: 'Subject must be at least 3 characters long.' },
						]}
				>
					<Input
						appearance="soft"
						prefix={<MessageOutlined className="text-slate-400" />}
						placeholder="What should we help with?"
						size="large"
					/>
				</Form.Item>

				<Form.Item
					label={<span className="text-[13px] font-medium text-slate-700">Message</span>}
					name="message"
					rules={[
						{ required: true, message: 'Please enter your message.' },
						{ min: 12, message: 'Message must be at least 12 characters long.' },
					]}
				>
					<Input.TextArea
						appearance="soft"
						placeholder="Add context, goals, timeline, or any blockers..."
						rows={5}
						showCount
						maxLength={800}
					/>
				</Form.Item>

				<SubmitRow>
					<HelperText>We usually reply within one business day. Urgent requests should include a phone number.</HelperText>
					<Button
						variant="signin"
						type="primary"
						htmlType="submit"
						loading={loading}
						icon={<SendOutlined />}
						className="min-w-44"
					>
						Send message
					</Button>
				</SubmitRow>
			</Form>
		</FormPanel>
	)
}

export default ContactForm
