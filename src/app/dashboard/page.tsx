"use client"

import { useState, useEffect } from "react"
import { Package, FileText, Video, Bell, Link2 } from "lucide-react"
import { getAnnouncements } from "@/app/dashboard/actions/content"

type Announcement = {
  id: string
  title: string
  content: string
  date_posted: string
  is_pinned: boolean
  attachment_url: string | null
}

export default function DashboardPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      setIsLoading(true)
      const { success, data } = await getAnnouncements(5)
      if (success && data) {
        setAnnouncements(data as Announcement[])
      }
      setIsLoading(false)
    }

    loadData()
  }, [])

  return (
    <div className="p-4 md:p-8 space-y-8 bg-[#0B0C10] min-h-full">
      <div className="flex flex-col gap-1">
        <h2 className="text-sm font-bold tracking-widest text-[#0ABFBC] uppercase">System Overview</h2>
        <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">Control Center</h1>
        <p className="text-[#8F9BB3]">Welcome back to your centralized command dashboard.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Metric Card 1 */}
        <div className="bg-[#131720] border border-[#1E2330] rounded-2xl p-6 shadow-lg flex-1 hover:border-[#0ABFBC]/30 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-[#8F9BB3] uppercase tracking-wider">Product Vault</h3>
            <div className="p-2 bg-[#0ABFBC]/10 rounded-lg">
              <Package className="h-5 w-5 text-[#0ABFBC]" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white">--</div>
          <p className="text-xs text-[#4E5666] font-medium tracking-wide uppercase mt-2">Active SKUs For Your Tier</p>
        </div>

        {/* Metric Card 2 */}
        <div className="bg-[#131720] border border-[#1E2330] rounded-2xl p-6 shadow-lg flex-1 hover:border-[#0ABFBC]/30 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-[#8F9BB3] uppercase tracking-wider">Asset Library</h3>
            <div className="p-2 bg-[#0ABFBC]/10 rounded-lg">
              <FileText className="h-5 w-5 text-[#0ABFBC]" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white">--</div>
          <p className="text-xs text-[#4E5666] font-medium tracking-wide uppercase mt-2">TDS & MSDS Available</p>
        </div>

        {/* Metric Card 3 */}
        <div className="bg-[#131720] border border-[#1E2330] rounded-2xl p-6 shadow-lg flex-1 hover:border-[#0ABFBC]/30 transition-colors sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-[#8F9BB3] uppercase tracking-wider">Training Nexus</h3>
            <div className="p-2 bg-[#0ABFBC]/10 rounded-lg">
              <Video className="h-5 w-5 text-[#0ABFBC]" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white">--</div>
          <p className="text-xs text-[#4E5666] font-medium tracking-wide uppercase mt-2">New Video Guides Added</p>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-1 xl:grid-cols-7">
        <div className="col-span-1 xl:col-span-4 bg-[#131720] border border-[#1E2330] rounded-2xl overflow-hidden shadow-lg">
          <div className="p-6 border-b border-[#1E2330] flex items-center gap-3">
            <div className="p-2 bg-[#0ABFBC]/10 rounded-lg">
              <Bell className="w-5 h-5 text-[#0ABFBC]" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-white">Network Broadcasts</h3>
              <p className="text-xs font-semibold tracking-wide text-[#8F9BB3] uppercase">Recent Alerts & Updates</p>
            </div>
          </div>
          <div className="p-6">
            {isLoading ? (
              <div className="py-12 flex justify-center items-center">
                <div className="w-6 h-6 border-2 border-[#0ABFBC] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : announcements.length === 0 ? (
              <div className="py-8 text-center text-sm font-medium tracking-wide text-[#4E5666] uppercase">No active broadcasts</div>
            ) : (
              <div className="space-y-6">
                {announcements.map((announcement) => (
                  <div key={announcement.id} className="flex flex-col gap-2 border-b border-[#1E2330]/50 pb-5 last:border-0 last:pb-0">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                      <div className="flex items-center gap-2">
                        {announcement.is_pinned && <span className="text-[10px] bg-[#FF4C4C]/10 border border-[#FF4C4C]/30 text-[#FF4C4C] font-bold px-1.5 py-0.5 rounded tracking-wide uppercase">PRIORITY</span>}
                        <p className="text-base font-bold text-white tracking-wide">
                          {announcement.title}
                        </p>
                      </div>
                      <span className="text-xs font-bold text-[#4E5666] tracking-widest uppercase whitespace-nowrap sm:ml-4">
                        {new Date(announcement.date_posted).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-[#8F9BB3] leading-relaxed">
                      {announcement.content}
                    </p>
                    {announcement.attachment_url && (
                      <div className="pt-2">
                        <a
                          href={announcement.attachment_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-xs font-bold tracking-wider text-[#0ABFBC] hover:text-white transition-colors bg-[#0ABFBC]/10 hover:bg-[#0ABFBC] px-3 py-1.5 rounded-lg border border-[#0ABFBC]/30 uppercase"
                        >
                          <Link2 className="w-3.5 h-3.5" /> ACCESS ATTACHMENT
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
