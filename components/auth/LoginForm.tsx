'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import Button from '@/components/common/Button'
import Checkbox from '@/components/common/Checkbox'
import Divider from '@/components/common/Divider'
import Form from '@/components/common/Form'
import Input from '@/components/common/Input'
import Typography from '@/components/common/Typography'
import {
	EyeInvisibleOutlined,
	EyeOutlined,
	LockOutlined,
	MailOutlined,
} from '@/components/common/antd/icons'

type LoginFormValues = {
	email: string
	password: string
	remember: boolean
}

const LoginForm = () => {

	const [form] = Form.useForm<LoginFormValues>()
	const [loading, setLoading] = useState(false)

	const handleSubmit = async () => {
		setLoading(true)

		await new Promise((resolve) => {
			window.setTimeout(resolve, 1200)
		})

		setLoading(false)
	}

	return (
		<div className="flex h-full w-full flex-col gap-4 text-slate-900 lg:min-h-[calc(100dvh-6rem)] lg:justify-center lg:gap-6 lg:py-8">
			<div className="space-y-1.5 text-center">
				<div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#7c3aed,#d946ef)] text-white shadow-[0_12px_28px_rgba(124,58,237,0.34)]"><LockOutlined className="text-lg" /></div>

				<div className="space-y-1">
					<Typography.Title level={2} className="mb-0! text-[1.65rem]! font-semibold! text-slate-900! sm:text-[1.8rem]!" >Welcome back</Typography.Title>
					<Typography.Text className="block text-[13px] leading-5 text-slate-500 sm:text-[14px]">Sign in to continue to your secure workspace.</Typography.Text>
				</div>
			</div>
			<div className="grid grid-cols-1 gap-2">
				<Button variant='auth' className='h-10 w-full px-4 text-[13px] font-medium' size="large">
					<span className='inline-flex items-center justify-center gap-3'>
						<Image src="/googlelogo.svg" alt="Google" width={18} height={18} priority />
						<span>Continue with Google</span>
					</span>
				</Button>
				<Button variant="auth" className="h-10 w-full px-4 text-[13px] font-medium" size="large">
					<span className="inline-flex items-center justify-center gap-3">
						<Image src="/mslogo.svg" alt="Microsoft" width={18} height={18} priority />
						<span>Continue with Microsoft</span>
					</span>
				</Button>
			</div>

			<Divider className="font-normal! text-slate-500">
				OR
			</Divider>

			<div className="flex flex-col gap-4 lg:gap-6">
				<Form <LoginFormValues>
					form={form}
					layout="vertical"
					requiredMark={false}
					onFinish={handleSubmit}
					initialValues={{ remember: false }}
					className="w-full"
				>
					<div className="space-y-2.5">
					<Form.Item
						label={<span className="text-[13px] font-medium text-slate-700">Email address</span>}
						name="email"
						rules={[
							{ required: true, message: 'Please enter your email address.' },
							{ type: 'email', message: 'Enter a valid email address.' },
						]}
						validateTrigger="onBlur"
						className="mb-0!"
					>
						<Input
							appearance="soft"
							prefix={<MailOutlined className="text-slate-400" />}
							placeholder="Enter your email address"
							size="large"
							className="h-10 rounded-xl px-4 text-[13px] transition-all duration-300"

						/>
					</Form.Item>

					<Form.Item
						label={<span className="text-[13px] font-medium text-slate-700">Password</span>}
						name="password"
						rules={[
							{ required: true, message: 'Please enter your password.' },
							{ min: 8, message: 'Password must be at least 8 characters long.' },
						]}
						validateTrigger="onBlur"
						className="mb-0!"
					>
						<Input.Password
							appearance="soft"
							prefix={<LockOutlined className="text-slate-400" />}
							placeholder="Enter your password"
							size="large"
							iconRender={(visible) =>
								visible ? (
									<EyeOutlined className="text-slate-400" />
								) : (
									<EyeInvisibleOutlined className="text-slate-400" />
								)
							}
							className="h-10 rounded-xl px-4 text-[13px] transition-all duration-300"
						/>
					</Form.Item>

					<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

						<Form.Item name="remember" valuePropName="checked" className="mb-0">
							<Checkbox className="text-[12px] text-slate-600">Remember me</Checkbox>
						</Form.Item>

						<Link href="#" className="text-[12px] font-medium text-violet-600 transition-colors hover:text-violet-500">
							Forgot password?
						</Link>
					</div>


					<Button
						variant="signin"
						type="primary"
						htmlType="submit"
						loading={loading}
						className="mt-2 h-10 w-full text-[13px] font-semibold transition-all duration-300 hover:-translate-y-0.5"
					>
						Sign in
					</Button>
					</div>
				</Form>

				<div className="text-center">
					<Typography.Text className="text-[13px] text-slate-500">
						Don't have an account?{' '}
						<Link href="/signup" className="font-semibold text-violet-600 transition-colors hover:text-violet-500">
							Sign up
						</Link>
					</Typography.Text>
				</div>
			</div>




		</div>

	)

}

export default LoginForm