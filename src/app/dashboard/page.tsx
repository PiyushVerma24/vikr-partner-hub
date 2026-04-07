"use client"

import { useEffect, useState } from "react"
import { Package, FileText, Video, Bell, Link2 } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/utils/supabase/client"

type Announcement = {
  id: string; title: string; content: string
  date_posted: string; is_pinned: boolean; attachment_url: string | null
}

export default function DashboardPage() {
  const [productCount, setProductCount] = useState(0)
  const [trainingCount, setTrainingCount] = useState(0)
  const [documentCount, setDocumentCount] = useState(0)
  const [announcements, setAnnouncements] = useState<Announcement[]>([])

  useEffect(() => {
    const supabase = createClient()
    Promise.all([
      supabase.from("products").select("id", { count: "exact", head: true }).eq("is_active", true),
      supabase.from("training_hub_videos").select("id", { count: "exact", head: true }),
      supabase.from("documents").select("id", { count: "exact", head: true }),
      supabase.from("announcements").select("*").eq("is_archived", false).order("is_pinned", { ascending: false }).order("date_posted", { ascending: false }).limit(5),
    ]).then(([p, t, d, a]) => {
      setProductCount(p.count ?? 0)
      setTrainingCount(t.count ?? 0)
      setDocumentCount(d.count ?? 0)
      setAnnouncements((a.data ?? []) as Announcement[])
    })
  }, [])

  return (
    <div className="p-4 md:p-8 space-y-4 md:space-y-6 bg-bg-main min-h-full w-full">
      <div className="relative overflow-hidden rounded-xl sm:rounded-2xl border border-border-subtle bg-gradient-to-br from-bg-grad-start to-bg-grad-end px-4 sm:px-6 py-6 md:px-8 shadow-lg">
        <div className="pointer-events-none absolute -top-10 -right-10 h-56 w-56 rounded-full" style={{ background: "radial-gradient(circle,rgba(106,191,48,0.14),transparent 70%)" }} />
        <h1 className="relative z-10 text-xl sm:text-2xl font-extrabold text-text-main">Welcome to <span className="text-brand-accent">VIKR Partner Hub</span></h1>
        <p className="relative z-10 mt-1 max-w-xl text-xs sm:text-sm leading-relaxed text-text-muted">Your central platform for product information, training, announcements and partner support — powered by Vikr Bioscience Pvt. Ltd., India.</p>
      </div>

      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { icon: Package, label: "Products", value: productCount, sub: "In product catalog", href: "/dashboard/products" },
          { icon: Video, label: "Training Modules", value: trainingCount, sub: "Available to you", href: "/dashboard/training" },
          { icon: FileText, label: "Documents", value: documentCount, sub: "TDS & MSDS", href: "/dashboard/documents" },
          { icon: Bell, label: "Announcements", value: announcements.length, sub: "Latest updates", href: null },
        ].map(({ icon: Icon, label, value, sub, href }) => (
          href ? (
            <Link key={label} href={href} className="rounded-lg sm:rounded-xl border border-border-subtle bg-bg-card p-4 sm:p-5 shadow-md hover:border-brand-accent transition-colors cursor-pointer block">
              <Icon className="mb-2 sm:mb-3 h-4 sm:h-5 w-4 sm:w-5 text-text-main" />
              <div className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.06em] text-text-muted">{label}</div>
              <div className="mt-1 text-xl sm:text-[26px] font-extrabold leading-none text-text-main">{value}</div>
              <div className="mt-1 text-[10px] sm:text-[11px] font-semibold text-brand-accent">{sub}</div>
            </Link>
          ) : (
            <div key={label} className="rounded-lg sm:rounded-xl border border-border-subtle bg-bg-card p-4 sm:p-5 shadow-md hover:border-brand-accent transition-colors">
              <Icon className="mb-2 sm:mb-3 h-4 sm:h-5 w-4 sm:w-5 text-text-main" />
              <div className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.06em] text-text-muted">{label}</div>
              <div className="mt-1 text-xl sm:text-[26px] font-extrabold leading-none text-text-main">{value}</div>
              <div className="mt-1 text-[10px] sm:text-[11px] font-semibold text-brand-accent">{sub}</div>
            </div>
          )
        ))}
      </div>

      <div className="bg-bg-card border border-border-subtle rounded-xl sm:rounded-2xl overflow-hidden shadow-lg max-w-3xl">
        <div className="p-4 sm:p-6 border-b border-border-subtle flex items-center gap-3">
          <div className="p-2 bg-brand-accent/10 rounded-lg shrink-0"><Bell className="w-4 sm:w-5 h-4 sm:h-5 text-brand-accent" /></div>
          <div><h3 className="text-base sm:text-lg font-extrabold text-text-main leading-tight">Recent Announcements</h3>
            <p className="text-xs font-semibold tracking-wide text-text-muted uppercase">Alerts &amp; Updates</p></div>
        </div>
        <div className="p-4 sm:p-6">
          {announcements.length === 0 ? (
            <div className="py-8 text-center text-sm font-medium tracking-wide text-text-meta uppercase">No announcements</div>
          ) : (
            <div className="space-y-4 sm:space-y-6">
              {announcements.map((a) => (
                <div key={a.id} className="flex flex-col gap-2 border-b border-border-subtle/50 pb-4 last:border-0 last:pb-0">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                    <div className="flex items-start gap-2 min-w-0">
                      {a.is_pinned && <span className="text-[9px] bg-[#FF4C4C]/10 border border-[#FF4C4C]/30 text-[#FF4C4C] font-bold px-1.5 py-0.5 rounded tracking-wide uppercase shrink-0 mt-0.5">PRIORITY</span>}
                      <p className="text-sm sm:text-base font-bold text-text-main break-words">{a.title}</p>
                    </div>
                    <span className="text-xs font-bold text-text-meta tracking-widest uppercase whitespace-nowrap">{new Date(a.date_posted).toLocaleDateString()}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-text-muted leading-relaxed">{a.content}</p>
                  {a.attachment_url && (
                    <a href={a.attachment_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-xs font-bold tracking-wider text-brand-accent hover:text-bg-main bg-brand-accent/10 hover:bg-brand-accent px-3 py-1.5 rounded-lg border border-brand-accent/30 uppercase w-fit">
                      <Link2 className="w-3.5 h-3.5" /> ACCESS ATTACHMENT
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
