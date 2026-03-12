"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

export function NavItem({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
    const pathname = usePathname()

    // Exact match for /dashboard, startsWith for sub-pages like /dashboard/products
    const active = href === "/dashboard"
        ? pathname === "/dashboard"
        : pathname?.startsWith(href)

    return (
        <Link
            href={href}
            className={`flex items-center gap-3 px-3 py-2.5 text-sm font-semibold rounded-lg transition-all border ${active
                    ? "bg-[#0ABFBC]/10 text-[#0ABFBC] border-[#0ABFBC]/20 shadow-[0_0_15px_rgba(10,191,188,0.05)]"
                    : "border-transparent text-[#8F9BB3] hover:text-[#E0E2E6] hover:bg-[#1E2330]"
                }`}
        >
            {icon}
            {label}
        </Link>
    )
}
