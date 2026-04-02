"use client"

import { useState } from "react"
import { Menu, X } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

type MobileNavProps = {
  navItems: Array<{
    href: string
    icon: React.ReactNode
    label: string
  }>
  logo: string
  territory?: string
  children?: React.ReactNode
}

export function MobileNav({ navItems, logo, territory }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  const isActive = (href: string) => {
    return href === "/dashboard"
      ? pathname === "/dashboard"
      : pathname?.startsWith(href)
  }

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-bg-card border-b border-border-subtle z-40 flex items-center justify-between px-4">
        <img
          src={logo}
          alt="VIKR Bioscience"
          className="h-6 w-auto object-contain"
        />
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 hover:bg-bg-hover rounded-lg transition-colors"
          aria-label={isOpen ? "Close menu" : "Open menu"}
        >
          {isOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <Menu className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile Menu Drawer */}
      <nav
        className={`md:hidden fixed left-0 top-16 bottom-0 w-[280px] bg-bg-card border-r border-border-subtle transform transition-transform duration-300 ease-in-out z-30 overflow-y-auto ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Territory Info */}
        {territory && (
          <div className="px-4 py-3 border-b border-border-subtle">
            <div className="text-[10px] font-bold text-text-muted uppercase tracking-wide mb-1">
              Region
            </div>
            <div className="text-sm font-semibold text-text-brand">
              {territory}
            </div>
          </div>
        )}

        {/* Nav Items */}
        <div className="py-2 flex-1">
          {navItems.map((item) => {
            const active = isActive(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 mx-2 my-1 px-3 py-2.5 text-sm rounded-lg transition-all ${
                  active
                    ? "bg-brand-accent/15 text-text-brand font-bold"
                    : "text-text-muted hover:text-text-main hover:bg-bg-hover font-medium"
                }`}
              >
                <span className="w-5 flex justify-center shrink-0">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            )
          })}
        </div>

        {/* About App */}
        <div className="px-4 py-3 border-t border-border-subtle/50">
          <div className="text-[9px] font-bold uppercase tracking-[0.1em] text-text-meta mb-0.5">About App</div>
          <div className="text-[10px] font-semibold text-text-muted">
            v{process.env.NEXT_PUBLIC_APP_VERSION}
          </div>
          <div className="text-[9px] text-text-meta leading-tight">
            {process.env.NEXT_PUBLIC_BUILD_TIME
              ? new Date(process.env.NEXT_PUBLIC_BUILD_TIME).toLocaleString('en-IN', {
                  timeZone: 'Asia/Kolkata',
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true,
                }) + ' IST'
              : '—'}
          </div>
        </div>
      </nav>

      {/* Spacer for fixed header */}
      <div className="md:hidden h-16" />
    </>
  )
}
