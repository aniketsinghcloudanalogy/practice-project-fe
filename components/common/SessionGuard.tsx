"use client";

import { useEffect } from "react";
import { useSession, signOut } from "next-auth/react";

const SessionGuard = () => {
  const { data: session } = useSession();

  useEffect(() => {
    if (session?.error === "AccountDeactivated" || session?.error === "RefreshTokenExpired") {
      signOut({ redirect: true, callbackUrl: "/login" });
    }
  }, [session?.error]);

  return null;
};

export default SessionGuard;
