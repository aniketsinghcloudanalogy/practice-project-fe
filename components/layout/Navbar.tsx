"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { MenuOutlined, CloseOutlined } from "@ant-design/icons";
import { MdAdminPanelSettings, MdNotificationsNone } from "react-icons/md";
import Avatar from "@/components/common/Avatar";
import Button from "@/components/common/Button";
import Dropdown from "@/components/common/Dropdown";
import { logout } from "@/lib/api/auth.api";

// Reusable fallback avatar shown when the user has no profile image
const AdminAvatar = ({ size = 28 }: { size?: number }) => (
  <div
    style={{ width: size, height: size }}
    className="flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-sm"
  >
    <MdAdminPanelSettings size={Math.round(size * 0.6)} />
  </div>
);

const Navbar = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isLoggedIn = status === "authenticated";
  const username = session?.user?.name;
  const userImage = session?.user?.image;
  const role = session?.user?.role;
  const isAdminRole = role === "ADMIN" || role === "SUPER_ADMIN";
  const dashboardHref = isAdminRole ? "/admin" : "/dashboard";

  const handleLogout = useCallback(async () => {
    setMobileOpen(false);

    const token = session?.accessToken ?? "";
    if (token) {
      try {
        await logout(token);
      } catch (error) {
        console.error(error);
      }
    }

    await signOut({ redirect: false });

    router.push("/");
    router.refresh();
  }, [router, session?.accessToken]);

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  const menuItems = [
    {
      key: "profile",
      label: (
        <Button variant="dropdown" href="/profile">
          Profile
        </Button>
      ),
    },
    {
      key: "dashboard",
      label: (
        <Button variant="dropdown" href={dashboardHref}>
          {isAdminRole ? "Admin Panel" : "Dashboard"}
        </Button>
      ),
    },
    {
      key: "logout",
      label: (
        <Button variant="logout" onClick={handleLogout}>
          Logout
        </Button>
      ),
    },
  ];

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 h-[var(--navbar-height)] w-full border-b border-slate-200/80 bg-white/95 shadow-sm backdrop-blur">
        <div className="mx-auto flex h-full w-full max-w-360 items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link
            href="/"
            className="text-base font-bold tracking-tight text-slate-900 transition-colors hover:text-blue-600 sm:text-lg"
          >
            Practice Project
          </Link>

          {/* Desktop nav */}
          <div className="hidden items-center gap-3 sm:flex">
            <Button variant="secondary" href="/contactus">
              Contact Us
            </Button>

            {isLoggedIn ? (
              <div className="flex items-center gap-2.5">
                {/* Notification bell - logged in only */}
                <button
                  type="button"
                  aria-label="Notifications"
                  className="relative rounded-full p-2 text-slate-600 transition hover:bg-slate-100"
                >
                  <MdNotificationsNone size={22} />
                  <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
                </button>

                {username && (
                  <span className="max-w-[140px] truncate text-sm font-medium text-slate-700">
                    {username}
                  </span>
                )}

                <Dropdown menuItems={menuItems} trigger={["hover"]} placement="bottomRight">
                  <div className="flex cursor-pointer items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 p-0.5 pr-2.5 transition hover:border-blue-200 hover:bg-blue-50">
                    {userImage ? (
                      <Avatar size={28} src={userImage} />
                    ) : (
                      <AdminAvatar size={28} />
                    )}
                    <span className="text-xs font-semibold text-slate-600">Account</span>
                  </div>
                </Dropdown>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button href="/login" variant="auth">
                  Login
                </Button>
                <Button href="/signup" variant="signin">
                  Signup
                </Button>
              </div>
            )}
          </div>

          {/* Mobile right side */}
          <div className="flex items-center gap-2 sm:hidden">
            {/* Notification bell - logged in only, mobile */}
            {isLoggedIn && (
              <button
                type="button"
                aria-label="Notifications"
                className="relative rounded-full p-2 text-slate-600 transition hover:bg-slate-100"
              >
                <MdNotificationsNone size={22} />
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
              </button>
            )}

            {/* Mobile hamburger */}
            <button
              type="button"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen((v) => !v)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50"
            >
              {mobileOpen ? (
                <CloseOutlined style={{ fontSize: 16 }} />
              ) : (
                <MenuOutlined style={{ fontSize: 16 }} />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-x-0 top-[var(--navbar-height)] z-40 border-b border-slate-200 bg-white px-4 py-4 shadow-lg sm:hidden">
          <div className="flex flex-col gap-3">
            {isLoggedIn && username && (
              <div className="flex items-center gap-2.5 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2.5">
                {userImage ? (
                  <Avatar size={32} src={userImage} />
                ) : (
                  <AdminAvatar size={32} />
                )}
                <span className="text-sm font-semibold text-slate-800">{username}</span>
              </div>
            )}

            <Button variant="secondary" href="/contactus" onClick={closeMobile}>
              Contact Us
            </Button>

            {isLoggedIn ? (
              <>
                <Button variant="dropdown" href="#" onClick={closeMobile}>
                  Profile
                </Button>

                <Button variant="dropdown" href={dashboardHref} onClick={closeMobile}>
                  {isAdminRole ? "Admin Panel" : "Dashboard"}
                </Button>

                <Button variant="logout" onClick={handleLogout}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button href="/login" variant="auth" onClick={closeMobile}>
                  Login
                </Button>
                <Button href="/signup" variant="signin" onClick={closeMobile}>
                  Signup
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;