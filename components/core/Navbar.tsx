"use client";

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import Button from '@/components/common/Button'
import { logout } from '@/lib/api/auth.api'
import Avatar from '@/components/common/Avatar'
import { UserOutlined } from '@ant-design/icons'
import React from 'react'
import Dropdown from '@/components/common/Dropdown'

const Navbar = () => {
  const router = useRouter()
  const { data: session, status } = useSession()
  const isLoggedIn = status === 'authenticated'
  const username = session?.user?.name
  const userImage = session?.user?.image

  const handleLogout = async () => {
    await signOut({ redirect: false })

    try {
      await logout()
    } catch (error) {
      console.error('Logout API Error:', error)
    }

    router.push('/')
    router.refresh()
  }

  const menuItems = [
    { key: 'profile', label: <Button variant="dropdown">Profile</Button> },
    { key: 'dashboard', label: <Button variant="dropdown" href="/dashboard">Dashboard</Button> },
    { key: 'logout', label: <Button variant="logout" onClick={handleLogout}>Logout</Button> },
  ]

  return (
    <header className="fixed inset-x-0 top-0 z-50 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-360 flex-col gap-4 px-2 py-3 sm:flex-row sm:items-center sm:gap-6 sm:px-3 lg:px-4">
        <Link
          href="/"
          className="text-left text-lg font-semibold tracking-tight text-slate-900 transition-colors hover:text-slate-600 sm:text-xl"
        >
          Practise Project
        </Link>

        <div className="flex w-full flex-col gap-3 sm:ml-auto sm:w-auto sm:flex-row sm:items-center sm:justify-end sm:gap-3">
          <Button variant="secondary" href="/contact" className="w-full sm:w-auto">
            Contact Us
          </Button>
          {isLoggedIn ? (
            <>
              <div className="flex items-center gap-2">
                {username && <span className="text-sm hidden sm:inline text-slate-800">{username}</span>}
                <Dropdown menuItems={menuItems} trigger={["hover"]} placement="bottomRight">
                  <div className="flex items-center cursor-pointer gap-2 rounded px-2 py-1 hover:bg-slate-100">
                    <Avatar size={32} src={userImage ?? undefined} icon={!userImage && <UserOutlined />} />
                  </div>
                </Dropdown>
              </div>
            </>
          ) : (
            <>
              <Button href="/login" variant="auth" className="w-full sm:w-auto">
                Login
              </Button>
              <Button href="/signup" variant="signin" className="w-full sm:w-auto">
                Signup
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

export default Navbar
