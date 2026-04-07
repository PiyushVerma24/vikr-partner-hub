"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { useAuth } from "@/hooks/useAuth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Bell, Archive } from "lucide-react"

interface Announcement {
  id: string
  title: string
  content: string
  attachment_url?: string
  is_pinned?: boolean
  is_archived?: boolean
  date_posted?: string
  valid_regions?: string[]
}

export default function AnnouncementsPage() {
  const supabase = createClient()
  const { user } = useAuth()
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [archivedAnnouncements, setArchivedAnnouncements] = useState<Announcement[]>([])
  const [territory, setTerritory] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedTab, setSelectedTab] = useState<'active' | 'archived'>('active')

  useEffect(() => {
    const loadData = async () => {
      if (!user?.id) return

      setIsLoading(true)

      try {
        // Get user territory
        const { data: profile } = await supabase
          .from('profiles')
          .select('territory_code')
          .eq('id', user.id)
          .single()

        const userTerritory = profile?.territory_code || 'GLOBAL'
        setTerritory(userTerritory)

        // Fetch active announcements
        const { data: activeData } = await supabase
          .from('announcements')
          .select('*')
          .eq('is_archived', false)
          .order('is_pinned', { ascending: false })
          .order('date_posted', { ascending: false })

        // Fetch archived announcements
        const { data: archivedData } = await supabase
          .from('announcements')
          .select('*')
          .eq('is_archived', true)
          .order('date_posted', { ascending: false })

        // Filter by territory
        const filterByTerritory = (items: Announcement[]) => {
          return items.filter(item => {
            if (!item.valid_regions || item.valid_regions.length === 0) return true
            return item.valid_regions.includes('GLOBAL') || item.valid_regions.includes(userTerritory)
          })
        }

        setAnnouncements(filterByTerritory(activeData || []))
        setArchivedAnnouncements(filterByTerritory(archivedData || []))
      } catch (error) {
        console.error('Error loading announcements:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [user?.id])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-text-muted" />
      </div>
    )
  }

  const displayedAnnouncements = selectedTab === 'active' ? announcements : archivedAnnouncements
  const hasActiveAnnouncements = announcements.length > 0
  const hasArchivedAnnouncements = archivedAnnouncements.length > 0

  return (
    <div className="flex flex-col h-full bg-bg-main">
      <div className="px-4 sm:px-6 py-6 border-b border-border-subtle">
        <div className="flex items-center gap-3">
          <Bell className="w-6 h-6 text-brand-accent" />
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-text-main">Announcements</h1>
            <p className="text-sm text-text-muted mt-1">Stay updated with the latest news and updates</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto p-4 sm:p-6">
          {/* Tabs */}
          <div className="flex gap-2 mb-6 border-b border-border-subtle">
            <button
              onClick={() => setSelectedTab('active')}
              className={`px-4 py-2 font-semibold text-sm transition-colors ${
                selectedTab === 'active'
                  ? 'text-brand-accent border-b-2 border-brand-accent'
                  : 'text-text-muted hover:text-text-main'
              }`}
            >
              Active {hasActiveAnnouncements && <span className="ml-1">({announcements.length})</span>}
            </button>
            <button
              onClick={() => setSelectedTab('archived')}
              className={`px-4 py-2 font-semibold text-sm transition-colors flex items-center gap-1 ${
                selectedTab === 'archived'
                  ? 'text-brand-accent border-b-2 border-brand-accent'
                  : 'text-text-muted hover:text-text-main'
              }`}
            >
              <Archive className="w-4 h-4" />
              Archive {hasArchivedAnnouncements && <span className="ml-1">({archivedAnnouncements.length})</span>}
            </button>
          </div>

          {/* Content */}
          {displayedAnnouncements.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="w-12 h-12 text-text-muted/20 mx-auto mb-4" />
              <p className="text-text-muted">
                {selectedTab === 'active'
                  ? 'No active announcements at the moment'
                  : 'No archived announcements'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {displayedAnnouncements.map((ann) => (
                <Card key={ann.id} className={ann.is_pinned ? 'border-brand-accent/50 bg-brand-accent/5' : ''}>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-lg">{ann.title}</CardTitle>
                          {ann.is_pinned && (
                            <span className="text-xs bg-orange-500/10 text-orange-600 px-2 py-1 rounded">
                              📌 Pinned
                            </span>
                          )}
                          {ann.is_archived && (
                            <span className="text-xs bg-gray-500/10 text-gray-600 px-2 py-1 rounded">
                              📋 Archived
                            </span>
                          )}
                        </div>
                        {ann.date_posted && (
                          <p className="text-xs text-text-muted mt-1">
                            {new Date(ann.date_posted).toLocaleDateString('en-IN', {
                              weekday: 'short',
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm leading-relaxed text-text-main whitespace-pre-wrap">{ann.content}</p>
                    {ann.valid_regions && ann.valid_regions.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-2 border-t border-border-subtle/50">
                        {ann.valid_regions.map((region) => (
                          <span
                            key={region}
                            className="text-xs bg-brand-accent/10 text-brand-accent px-2 py-1 rounded"
                          >
                            {region}
                          </span>
                        ))}
                      </div>
                    )}
                    {ann.attachment_url && (
                      <div className="pt-2">
                        <a
                          href={ann.attachment_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline"
                        >
                          📎 View Attachment
                        </a>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
