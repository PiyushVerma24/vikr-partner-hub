"use client"

import { useState, useEffect } from "react"
import { Users, FileText, Package, LayoutDashboard, Video, LifeBuoy, Database, Key, Bell } from "lucide-react"
import { NavItem } from "@/components/nav-item"
import { MobileNav } from "@/components/mobile-nav"
import { DashboardProvider, useDashboard } from "@/contexts/DashboardContext"

const navBase = [
  { href: "/dashboard", icon: <LayoutDashboard className="w-[15px] h-[15px]" />, label: "Dashboard" },
  { href: "/dashboard/products", icon: <Package className="w-[15px] h-[15px]" />, label: "Product Catalog" },
  { href: "/dashboard/training", icon: <Video className="w-[15px] h-[15px]" />, label: "Training Hub" },
  { href: "/dashboard/announcements", icon: <Bell className="w-[15px] h-[15px]" />, label: "Announcements" },
  { href: "/dashboard/meetings", icon: <Users className="w-[15px] h-[15px]" />, label: "Meetings" },
  { href: "/dashboard/support", icon: <LifeBuoy className="w-[15px] h-[15px]" />, label: "Support Requests" },
  { href: "/dashboard/documents", icon: <FileText className="w-[15px] h-[15px]" />, label: "Documents" },
]

const buildTime = process.env.NEXT_PUBLIC_BUILD_TIME
  ? new Date(process.env.NEXT_PUBLIC_BUILD_TIME).toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit", hour12: true,
    }) + " IST"
  : "—"

function Sidebar() {
  const { profile, isAdmin } = useDashboard()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const navItems = [
    ...navBase,
    ...(isAdmin ? [
      { href: "/dashboard/admin/users", icon: <Key className="w-[15px] h-[15px]" />, label: "Partner Access" },
      { href: "/dashboard/admin/cms", icon: <Database className="w-[15px] h-[15px]" />, label: "Data Control" },
    ] : [])
  ]

  return (
    <>
      <MobileNav navItems={navItems} logo="/vikr-logo-new.svg" territory={profile?.territory_code ?? undefined} />

      {/* Desktop sidebar */}
      <aside className="w-[252px] h-screen sticky top-0 border-r bg-bg-card border-border-subtle hidden md:flex flex-col shrink-0">
        {/* Logo */}
        <div className="px-4 pt-5 pb-4 border-b border-border-subtle">
          <img src="/vikr-logo-new.svg" alt="VIKR Bioscience" className="h-[56px] w-auto max-w-[220px] object-contain object-left" />
          <div className="-mt-3 text-[9px] font-semibold uppercase tracking-[0.1em] text-text-muted">
            Partner Hub &middot; Vikr Bioscience Pvt. Ltd.
          </div>
        </div>

        {/* User block */}
        <div className="px-4 py-3 border-b border-border-subtle flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1a3a5c] to-[#0a8cc4] flex items-center justify-center text-[11px] font-extrabold text-white shrink-0">
            {profile?.territory_code?.slice(0, 2) ?? "VI"}
          </div>
          <div className="min-w-0">
            <div className="text-[11px] font-bold truncate text-text-main">Distributor Partner</div>
            <div className="text-[10px] font-semibold text-text-brand">
              Region: {profile?.territory_code ?? "…"}
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-2">
          <div className="text-[9px] uppercase tracking-[0.12em] text-text-meta font-bold px-4 mt-3 mb-1">Main</div>
          <NavItem href="/dashboard" icon={<LayoutDashboard className="w-[15px] h-[15px]" />} label="Dashboard" />
          <NavItem href="/dashboard/products" icon={<Package className="w-[15px] h-[15px]" />} label="Product Catalog" />
          <NavItem href="/dashboard/training" icon={<Video className="w-[15px] h-[15px]" />} label="Training Hub" />

          <div className="text-[9px] uppercase tracking-[0.12em] text-text-meta font-bold px-4 mt-4 mb-1">Communication</div>
          <NavItem href="/dashboard/announcements" icon={<Bell className="w-[15px] h-[15px]" />} label="Announcements" />
          <NavItem href="/dashboard/meetings" icon={<Users className="w-[15px] h-[15px]" />} label="Meetings" />
          <NavItem href="/dashboard/support" icon={<LifeBuoy className="w-[15px] h-[15px]" />} label="Support Requests" />

          <div className="text-[9px] uppercase tracking-[0.12em] text-text-meta font-bold px-4 mt-4 mb-1">Resources</div>
          <NavItem href="/dashboard/documents" icon={<FileText className="w-[15px] h-[15px]" />} label="Documents" />

          {isAdmin && (
            <>
              <div className="text-[9px] uppercase tracking-[0.12em] text-text-meta font-bold px-4 mt-4 mb-1">Admin</div>
              <NavItem href="/dashboard/admin/users" icon={<Key className="w-[15px] h-[15px]" />} label="Partner Access" />
              <NavItem href="/dashboard/admin/cms" icon={<Database className="w-[15px] h-[15px]" />} label="Data Control" />
            </>
          )}
        </nav>

        <div className="p-3 border-t border-border-subtle bg-bg-card shrink-0 space-y-2 mt-auto">
          <form action="/auth/signout" method="post">
            <button className="flex w-full items-center justify-center gap-2 px-3 py-2 text-xs font-bold tracking-wide text-[#FF4C4C] hover:bg-[#FF4C4C]/10 rounded-md transition-all border border-transparent hover:border-[#FF4C4C]/20 uppercase">
              Sign Out
            </button>
          </form>
          <div className="px-1 pt-1 border-t border-border-subtle/50">
            <div className="text-[9px] font-bold uppercase tracking-[0.1em] text-text-meta mb-0.5">About App</div>
            <div className="text-[10px] font-semibold text-text-muted">v{process.env.NEXT_PUBLIC_APP_VERSION}</div>
            <div className="text-[9px] text-text-meta leading-tight" suppressHydrationWarning>
              {mounted ? buildTime : "—"}
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardProvider>
      <div className="dashboard-scope flex flex-col md:flex-row min-h-screen bg-bg-main text-text-main">
        <Sidebar />
        <main className="flex-1 overflow-y-auto w-full pb-safe">
          {children}
        </main>
      </div>
    </DashboardProvider>
  )
}
