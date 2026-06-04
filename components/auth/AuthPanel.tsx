
"use client";

import { useEffect } from 'react'
import Image from 'next/image';
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Card from '@/components/common/Card'
import ConfigProvider from '@/components/common/ConfigProvider'
import type { AuthMode } from '@/types/auth.types'
import SignupForm from '@/components/auth/SignupForm';
import { authTheme } from '@/components/common/antd/theme'
import LoginForm from './LoginForm';


type AuthPanelProps = {
    mode: AuthMode
}

const AuthPanel = ({ mode }: AuthPanelProps) => {
    const router = useRouter()
    const { status } = useSession()
    const isCheckingSession = status === 'loading'
    const isLoggedIn = status === 'authenticated'

    useEffect(() => {
        if (isLoggedIn) {
            router.replace('/dashboard')
        }
    }, [isLoggedIn, router])

    if (isCheckingSession || isLoggedIn) {
        return null
    }

    return (
        <ConfigProvider theme={authTheme}>
            <main className="relative h-dvh overflow-hidden bg-[radial-gradient(circle_at_top,rgba(124,58,237,0.18),transparent_34%),linear-gradient(135deg,#f5f3ff_0%,#fafafa_45%,#ede9fe_100%)] px-3 py-3 sm:px-6 sm:py-4 lg:px-8">
                <div className="pointer-events-none absolute inset-0" aria-hidden="true">
                    <Image src="/authbg.jpeg" alt="" fill priority quality={100} sizes="100vw" className="object-cover" />
                    <div className="absolute inset-0 bg-black/30 backdrop-blur-xs" />
                </div>
                <div className=" relative mx-auto flex h-full w-full max-w-295 items-center justify-center">
                    
                    <Card
                        variant="borderless"
                            className="h-[calc(100dvh-1.5rem)] w-full max-w-md sm:h-[calc(100dvh-2rem)] sm:max-w-2xl md:w-[90vw] md:max-w-280 lg:w-[64vw] lg:max-w-310 overflow-hidden border border-[#1e3a8a] bg-white/92 shadow-[0_24px_70px_rgba(76,29,149,0.16)] lg:mx-auto"
                        styles={{ body: { padding: 0, height: '100%' } }}
                    >
                            <div className="grid h-full grid-cols-1 md:grid-cols-2">
                            <div className="relative hidden min-h-72 overflow-hidden bg-[linear-gradient(160deg,#2e1065_0%,#6d28d9_52%,#a855f7_100%)] md:block md:rounded-r-[28px]">
                                <Image
                                    src="/authleftimage.jpeg"
                                    alt=""
                                    fill
                                    priority
                                    sizes="(min-width: 1024px) 50vw, 100vw"
                                    className="object-cover "
                                />
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.12),transparent_26%),radial-gradient(circle_at_80%_75%,rgba(255,255,255,0.08),transparent_20%)]" aria-hidden="true" />
                                <div className="absolute inset-0 border-r border-white/10" aria-hidden="true" />
                                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(18,9,45,0.12),rgba(46,16,101,0.38))]" />
                                <div className="absolute inset-x-6 bottom-6 rounded-[28px] border border-white/10 bg-white/10 p-5 text-white shadow-2xl backdrop-blur-sm">
                                    <p className="text-sm font-medium uppercase tracking-[0.3em] text-white/70">Secure access</p>
                                    <p className="mt-3 max-w-md text-2xl font-semibold leading-tight lg:text-[2rem]">
                                        Clean authentication surfaces for modern teams.
                                    </p>
                                </div>
                            </div>

                            <div
                                className={`no-scrollbar flex h-full justify-center overflow-y-auto bg-white px-4 py-3 sm:px-6 sm:py-4 lg:px-8 lg:py-3 ${
                                    mode === 'signup' ? 'items-start' : 'items-center'
                                }`}
                            >
                                <div className="w-full max-w-md sm:max-w-140">
                                    {mode === 'signup' ? <SignupForm /> : <LoginForm />}
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>



            </main>
        </ConfigProvider>
    )
}

export default AuthPanel
