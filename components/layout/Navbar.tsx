"use client";

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { UserOutlined } from '@ant-design/icons'
import Avatar from '@/components/common/Avatar'
import Button from '@/components/common/Button'
import Dropdown from '@/components/common/Dropdown'
import { logout } from '@/lib/api/auth.api'

const Navbar = () => {
  const router = useRouter()
  const { data: session, status } = useSession()
  const isLoggedIn = status === 'authenticated'
  const username = session?.user?.name
  const userImage = session?.user?.image
  const role = session?.user?.role
  const isAdminRole = role === 'ADMIN' || role === 'SUPER_ADMIN'
  const dashboardHref = isAdminRole ? '/admin' : '/dashboard'

  const handleLogout = async () => {
    try {
      await logout(session?.accessToken ?? '')
    } catch (error) {
      console.error('Logout API Error:', error)
    } finally {
      await signOut({ redirect: false })
    }

    router.push('/')
    router.refresh()
  }

  const menuItems = [
    { key: 'profile', label: <Button variant="dropdown">Profile</Button> },
    {
      key: 'dashboard',
      label: (
        <Button variant="dropdown" href={dashboardHref}>
          {isAdminRole ? 'Admin Panel' : 'Dashboard'}
        </Button>
      ),
    },
    { key: 'logout', label: <Button variant="logout" onClick={handleLogout}>Logout</Button> },
  ]

  return (
    <header className="fixed inset-x-0 top-0 z-50 h-[var(--navbar-height)] w-full border-b border-slate-200/80 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-full w-full max-w-360 flex-col justify-center gap-1.5 px-2 py-1.5 sm:flex-row sm:items-center sm:gap-3 sm:px-3 sm:py-0 lg:px-4">
        <Link
          href="/"
          className="text-left text-base font-semibold tracking-tight text-slate-900 transition-colors hover:text-slate-600 sm:text-lg"
        >
          Practise Project
        </Link>

        <div className="flex w-full flex-col gap-2 sm:ml-auto sm:w-auto sm:flex-row sm:items-center sm:justify-end sm:gap-3">
          <Button variant="secondary" href="/contactus" className="w-full sm:w-auto">
            Contact Us
          </Button>
          {isLoggedIn ? (
            <div className="flex items-center gap-2">
              {username && <span className="hidden text-sm text-slate-800 sm:inline">{username}</span>}
              <Dropdown menuItems={menuItems} trigger={["hover"]} placement="bottomRight">
                <div className="flex cursor-pointer items-center gap-2 rounded px-2 py-1 hover:bg-slate-100">
                  <Avatar size={32} src={userImage ?? undefined} icon={!userImage && <UserOutlined />} />
                </div>
              </Dropdown>
            </div>
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
