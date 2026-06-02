import { ArrowRight, BarChart3, CheckCircle2, Mail, ShieldCheck, Users } from 'lucide-react'
import Link from 'next/link'
import Button from '@/components/common/Button'
import Card from '@/components/common/Card'

const highlights = [
	{
		title: 'Secure account flow',
		description: 'Login, signup, protected dashboard access, and session-aware navigation are wired into the app.',
		icon: ShieldCheck,
	},
	{
		title: 'Contact management',
		description: 'A focused contact experience connects the public page with the project API layer.',
		icon: Mail,
	},
	{
		title: 'Dashboard workspace',
		description: 'Authenticated users get a clean workspace built for reviewing app data and activity.',
		icon: BarChart3,
	},
]

const stats = [
	{ value: '3', label: 'Core modules' },
	{ value: '6+', label: 'Shared UI pieces' },
	{ value: '100%', label: 'Responsive layout' },
]

const Page = () => {
	return (
		<main className="flex-1 overflow-hidden bg-slate-50">
			<section className="relative border-b border-slate-200 bg-white">
				<div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(22,119,255,0.10),transparent_34%),linear-gradient(135deg,rgba(14,165,233,0.08),rgba(255,255,255,0)_45%)]" />
				<div
					className="relative mx-auto grid min-h-[calc(100vh-88px)] w-full max-w-360 items-center gap-10 py-12 pr-4 pl-4 sm:pr-6 sm:pl-6 lg:grid-cols-[1.05fr_0.95fr] lg:py-16 lg:pr-8 lg:pl-[var(--navbar-offset)]"
				>
					<div className="max-w-3xl">
						<div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">
							<CheckCircle2 size={16} aria-hidden="true" />
							Practice Project
						</div>
						<h1 className="text-4xl font-bold tracking-normal text-slate-950 sm:text-5xl lg:text-6xl">
							A practical full-stack workspace for auth, dashboard, and contact workflows.
						</h1>
						<p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
							This home page brings the project together with quick access to the main user journeys and a
							clear snapshot of what has already been built.
						</p>

						<div className="mt-8 flex flex-col gap-3 sm:flex-row">
							<Button href="/signup" variant="signin" className="w-full sm:w-auto">
								Get Started
								<ArrowRight size={18} aria-hidden="true" />
							</Button>
							<Button href="/contact" variant="auth" className="w-full sm:w-auto">
								Contact Us
							</Button>
						</div>
					</div>

					<div className="grid gap-4">
						<Card className="border-slate-200 shadow-sm">
							<div className="flex flex-col gap-6">
								<div className="flex items-start justify-between gap-4">
									<div>
										<p className="text-sm font-semibold uppercase tracking-normal text-slate-500">
											Project status
										</p>
										<h2 className="mt-2 text-2xl font-bold tracking-normal text-slate-950">
											Ready for everyday flows
										</h2>
									</div>
									<div className="rounded-full bg-emerald-50 p-3 text-emerald-600">
										<Users size={24} aria-hidden="true" />
									</div>
								</div>

								<div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
									{stats.map((item) => (
										<div key={item.label} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
											<p className="text-2xl font-bold text-slate-950">{item.value}</p>
											<p className="mt-1 text-sm text-slate-600">{item.label}</p>
										</div>
									))}
								</div>
							</div>
						</Card>

						<div className="grid gap-4 sm:grid-cols-2">
							<Link
								href="/login"
								className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
							>
								<p className="text-sm font-semibold text-slate-500">Existing user</p>
								<p className="mt-2 text-lg font-bold text-slate-950">Login</p>
							</Link>
							<Link
								href="/dashboard"
								className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
							>
								<p className="text-sm font-semibold text-slate-500">Workspace</p>
								<p className="mt-2 text-lg font-bold text-slate-950">Dashboard</p>
							</Link>
						</div>
					</div>
				</div>
			</section>

			<section className="mx-auto w-full max-w-360 py-12 pr-4 pl-4 sm:pr-6 sm:pl-6 lg:pr-8 lg:pl-[var(--navbar-offset)]">
				<div className="mb-7 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
					<div>
						<p className="text-sm font-semibold uppercase tracking-normal text-blue-700">What is inside</p>
						<h2 className="mt-2 text-2xl font-bold tracking-normal text-slate-950 sm:text-3xl">
							Built around real app sections
						</h2>
					</div>
				</div>

				<div className="grid gap-4 md:grid-cols-3">
					{highlights.map(({ title, description, icon: Icon }) => (
						<Card key={title} className="h-full border-slate-200 shadow-sm">
							<div className="flex h-full flex-col gap-4">
								<div className="flex size-11 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
									<Icon size={22} aria-hidden="true" />
								</div>
								<div>
									<h3 className="text-lg font-bold tracking-normal text-slate-950">{title}</h3>
									<p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
								</div>
							</div>
						</Card>
					))}
				</div>
			</section>
		</main>
	)
}

export default Page
