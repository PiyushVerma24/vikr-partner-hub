import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Users, FileText, Package, LayoutDashboard, ShieldCheck, Video, LifeBuoy, Database, Key } from "lucide-react"
import { NavItem } from "@/components/nav-item"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return redirect("/login")
  }

  // Fetch profile to get territory
  const { data: profile } = await supabase
    .from("profiles")
    .select("territory_code, is_admin")
    .eq("id", user.id)
    .single()

  return (
    <div className="flex min-h-screen bg-[#0B0C10] text-[#E0E2E6]">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-[#131720] border-[#1E2330] hidden md:flex flex-col relative">
        <div className="p-6">
          <h1 className="text-xl font-bold tracking-widest flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-[#0B0C10] border border-[#1E2330] flex items-center justify-center shadow-[0_0_10px_rgba(10,191,188,0.1)]">
              <span className="text-[#0ABFBC] font-bold text-xs">V</span>
            </div>
            <span className="text-white">VIKR<span className="text-[#0ABFBC]">HUB</span></span>
          </h1>
          <div className="mt-4 px-1">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#0ABFBC]" />
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#8F9BB3]">Access Tier</span>
            </div>
            <div className="mt-1 text-sm font-semibold text-white pl-6">
              Region: <span className="text-[#0ABFBC]">{profile?.territory_code || "Unknown"}</span>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          <div className="text-[10px] uppercase tracking-widest text-[#4E5666] font-bold px-3 mb-2">Partner Toolkit</div>
          <NavItem href="/dashboard" icon={<LayoutDashboard className="w-4 h-4" />} label="Control Center" />
          <NavItem href="/dashboard/products" icon={<Package className="w-4 h-4" />} label="Product Vault" />
          <NavItem href="/dashboard/training" icon={<Video className="w-4 h-4" />} label="Training Nexus" />
          <NavItem href="/dashboard/meetings" icon={<Users className="w-4 h-4" />} label="Engagements" />
          <NavItem href="/dashboard/support" icon={<LifeBuoy className="w-4 h-4" />} label="Help Desk" />
          <NavItem href="/dashboard/documents" icon={<FileText className="w-4 h-4" />} label="Asset Library" />

          {profile?.is_admin === true && (
            <>
              <div className="text-[10px] uppercase tracking-widest text-[#4E5666] font-bold px-3 mt-8 mb-2">Admin Overrides</div>
              <NavItem href="/dashboard/admin/users" icon={<Key className="w-4 h-4" />} label="Partner Access" />
              <NavItem href="/dashboard/admin/cms" icon={<Database className="w-4 h-4" />} label="Data Control" />
              <NavItem href="/dashboard/admin/meetings" icon={<Users className="w-4 h-4" />} label="Schedule Manager" />
            </>
          )}
        </nav>

        <div className="p-4 border-t border-[#1E2330] bg-[#131720]">
          <form action="/auth/signout" method="post">
            <button className="flex w-full items-center gap-2 px-4 py-2 text-sm font-bold tracking-wide text-[#FF4C4C] hover:bg-[#FF4C4C]/10 rounded-md transition-all border border-transparent hover:border-[#FF4C4C]/20 uppercase">
              Terminate Session
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}

