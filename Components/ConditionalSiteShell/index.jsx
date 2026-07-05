"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Header from "@/Components/Header";
import Footer from "@/Components/Footer";

const ADMIN_SHELL_PATHS = ["/admin", "/login"];

function isAdminShellPath(pathname) {
  if (!pathname) return false;
  return ADMIN_SHELL_PATHS.some(
    (base) => pathname === base || pathname.startsWith(`${base}/`)
  );
}

export default function ConditionalSiteShell({ children }) {
  const pathname = usePathname();
  const isAdminShell = isAdminShellPath(pathname);

  useEffect(() => {
    document.body.classList.toggle("admin-shell", isAdminShell);
    return () => document.body.classList.remove("admin-shell");
  }, [isAdminShell]);

  if (isAdminShell) {
    return <div className="admin-shell-root">{children}</div>;
  }

  return (
    <>
      <Header />
      {/* display:contents keeps children as direct flex items of body (no layout change) */}
      <main style={{ display: 'contents' }}>{children}</main>
      <Footer />
    </>
  );
}
