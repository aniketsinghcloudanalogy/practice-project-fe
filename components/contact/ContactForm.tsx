"use client";

import { useState } from 'react'
import Button from '@/components/common/Button'
import Form from '@/components/common/Form'
import Input from '@/components/common/Input'
import Message from '@/components/common/Message'
import {  Phone } from 'lucide-react';
import {
	MailOutlined,
	MessageOutlined,
	SendOutlined,
	UserOutlined,
} from '@/components/common/antd/icons'
import { createContact, type ContactPayload } from '@/lib/api/contactus.api'
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

const ContactForm = () => {
	const [form] = Form.useForm<ContactPayload>()
	const [loading, setLoading] = useState(false)

	const handleSubmit = async (values: ContactPayload) => {
		setLoading(true)

		try {
			await createContact(values)
			Message.success('Your message has been sent.')
			form.resetFields()
		} catch {
			Message.error('Unable to send your message right now.')
		} finally {
			setLoading(false)
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

			<Form<ContactPayload>
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
							{ min: 10, message: 'Primary contact must be at least 10 digits.' },
							{ max: 15, message: 'Primary contact must be at most 15 digits.' },
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
					>
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
