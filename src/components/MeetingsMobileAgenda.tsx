"use client"

import { useMemo } from "react"
import { Video, ExternalLink, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

type Meeting = {
  id: string
  title: string
  date_time: string
  meet_link: string | null
  recording_url: string | null
  notes: string | null
}

function MeetingCard({ meeting }: { meeting: Meeting }) {
  const isPast = new Date(meeting.date_time) < new Date()
  const d = new Date(meeting.date_time)
  const date = d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
  const time = d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit", hour12: true })

  return (
    <div className="bg-bg-card border border-border-subtle rounded-xl p-4 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-bold text-text-main leading-snug">{meeting.title}</p>
          <p className="text-xs text-text-muted mt-0.5">{date} · {time}</p>
        </div>
        {isPast ? (
          <Badge variant="outline" className="text-[10px] bg-bg-hover border-border-subtle text-text-meta shrink-0 italic">
            PAST
          </Badge>
        ) : (
          <Badge className="text-[10px] bg-brand-accent/20 text-brand-accent hover:bg-brand-accent/20 shrink-0">
            UPCOMING
          </Badge>
        )}
      </div>

      {meeting.notes && (
        <p className="text-xs text-text-muted line-clamp-2">{meeting.notes}</p>
      )}

      {(meeting.meet_link || meeting.recording_url) && (
        <div className="flex gap-2 pt-1">
          {meeting.meet_link && !isPast && (
            <Button
              variant="outline"
              size="sm"
              className="flex-1 h-10 gap-1.5 border-border-subtle text-text-main text-xs font-semibold"
              onClick={() => window.open(meeting.meet_link!, "_blank")}
            >
              <ExternalLink className="w-3.5 h-3.5" /> Join Call
            </Button>
          )}
          {meeting.recording_url && (
            <Button
              variant="secondary"
              size="sm"
              className="flex-1 h-10 gap-1.5 bg-bg-hover text-brand-accent hover:bg-[#243018] text-xs font-semibold"
              onClick={() => window.open(meeting.recording_url!, "_blank")}
            >
              <Video className="w-3.5 h-3.5" /> Recording
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

export function MeetingsMobileAgenda({ meetings }: { meetings: Meeting[] }) {
  const { upcoming, past } = useMemo(() => {
    const now = new Date()
    const sorted = [...meetings].sort(
      (a, b) => new Date(a.date_time).getTime() - new Date(b.date_time).getTime()
    )
    return {
      upcoming: sorted.filter((m) => new Date(m.date_time) >= now),
      past: sorted.filter((m) => new Date(m.date_time) < now).reverse(),
    }
  }, [meetings])

  if (meetings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center px-4">
        <Calendar className="w-10 h-10 text-text-meta mb-3" strokeWidth={1} />
        <p className="text-sm font-medium text-text-muted">No meetings in your log yet.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {upcoming.length > 0 && (
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-brand-accent mb-3 px-1">
            Upcoming
          </p>
          <div className="space-y-3">
            {upcoming.map((m) => <MeetingCard key={m.id} meeting={m} />)}
          </div>
        </div>
      )}
      {past.length > 0 && (
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-text-meta mb-3 px-1">
            Past
          </p>
          <div className="space-y-3">
            {past.map((m) => <MeetingCard key={m.id} meeting={m} />)}
          </div>
        </div>
      )}
    </div>
  )
}
