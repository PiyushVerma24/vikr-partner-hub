"use client"

import { useState, useMemo, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

type Meeting = {
    id: string
    title: string
    date_time: string
    meet_link: string | null
    recording_url: string | null
    notes: string | null
}

interface MeetingsCalendarProps {
    meetings: Meeting[]
}

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
]

function toLocalDateKey(date: Date): string {
    const yyyy = date.getFullYear()
    const mm = String(date.getMonth() + 1).padStart(2, "0")
    const dd = String(date.getDate()).padStart(2, "0")
    return `${yyyy}-${mm}-${dd}`
}

export function MeetingsCalendar({ meetings }: MeetingsCalendarProps) {
    const [mounted, setMounted] = useState(false)
    const [currentMonth, setCurrentMonth] = useState<Date | null>(null)
    const [selectedDate, setSelectedDate] = useState<string | null>(null)
    const [todayKey, setTodayKey] = useState<string>("")
    const [now, setNow] = useState<Date | null>(null)

    useEffect(() => {
        setMounted(true)
        const currentNow = new Date()
        setNow(currentNow)
        setTodayKey(toLocalDateKey(currentNow))
        setCurrentMonth(new Date(currentNow.getFullYear(), currentNow.getMonth(), 1))
    }, [])

    // Build date-string → meetings[] map
    const meetingMap = useMemo(() => {
        const map = new Map<string, Meeting[]>()
        for (const m of meetings) {
            const key = toLocalDateKey(new Date(m.date_time))
            if (!map.has(key)) map.set(key, [])
            map.get(key)!.push(m)
        }
        return map
    }, [meetings])

    // Build 42-cell grid
    const calendarCells = useMemo(() => {
        if (!currentMonth) return []
        const year = currentMonth.getFullYear()
        const month = currentMonth.getMonth()
        const firstDow = new Date(year, month, 1).getDay() // 0 = Sun
        const daysInMonth = new Date(year, month + 1, 0).getDate()
        const daysInPrev = new Date(year, month, 0).getDate()

        const cells: { date: Date; key: string; current: boolean }[] = []

        // Leading days (prev month)
        for (let i = firstDow - 1; i >= 0; i--) {
            const d = new Date(year, month - 1, daysInPrev - i)
            cells.push({ date: d, key: toLocalDateKey(d), current: false })
        }

        // Current month
        for (let d = 1; d <= daysInMonth; d++) {
            const date = new Date(year, month, d)
            cells.push({ date, key: toLocalDateKey(date), current: true })
        }

        // Trailing days (next month)
        let t = 1
        while (cells.length < 42) {
            const d = new Date(year, month + 1, t++)
            cells.push({ date: d, key: toLocalDateKey(d), current: false })
        }

        return cells
    }, [currentMonth])

    const prevMonth = () => {
        if (!currentMonth) return
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
    }

    const nextMonth = () => {
        if (!currentMonth) return
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
    }

    const selectedMeetings = selectedDate ? (meetingMap.get(selectedDate) ?? []) : []

    const formatTime = (iso: string) =>
        new Date(iso).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit", hour12: true })

    if (!mounted || !currentMonth) {
        return (
            <div className="w-full h-[400px] bg-bg-card border border-border-subtle rounded-xl flex flex-col items-center justify-center space-y-4 animate-pulse">
                <div className="w-10 h-10 border-2 border-brand-accent/20 border-t-brand-accent rounded-full animate-spin" />
                <p className="text-xs font-bold text-text-meta tracking-widest uppercase">Initializing Calendar...</p>
            </div>
        )
    }

    return (
        <div className="rounded-xl overflow-hidden border border-border-subtle bg-bg-card">
            {/* ── Header ── */}
            <div className="flex items-center justify-between p-4 border-b border-border-subtle bg-bg-hover/30">
                <button
                    onClick={prevMonth}
                    aria-label="Previous month"
                    className="p-1.5 rounded-lg text-text-muted hover:text-brand-accent hover:bg-bg-hover transition-colors"
                >
                    <ChevronLeft className="w-4 h-4" />
                </button>

                <span className="text-text-main font-bold text-sm tracking-wide">
                    {MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                </span>

                <button
                    onClick={nextMonth}
                    aria-label="Next month"
                    className="p-1.5 rounded-lg text-text-muted hover:text-brand-accent hover:bg-bg-hover transition-colors"
                >
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>

            {/* ── Day-of-week headers ── */}
            <div className="grid grid-cols-7 border-b border-border-subtle">
                {DAYS_OF_WEEK.map((d) => (
                    <div
                        key={d}
                        className="py-2 text-center text-[10px] font-bold uppercase tracking-widest text-text-meta"
                    >
                        {d}
                    </div>
                ))}
            </div>

            {/* ── Day cells grid ── */}
            <div className="grid grid-cols-7">
                {calendarCells.map((cell, idx) => {
                    const count = cell.current ? (meetingMap.get(cell.key)?.length ?? 0) : 0
                    const hasMeetings = count > 0
                    const isToday = cell.current && cell.key === todayKey
                    const isSelected = cell.key === selectedDate

                    return (
                        <button
                            key={`${cell.key}-${idx}`}
                            onClick={() => {
                                if (!cell.current) return
                                setSelectedDate(isSelected ? null : cell.key)
                            }}
                            disabled={!cell.current}
                            className={`
                                relative flex flex-col items-center justify-start pt-3 pb-3 min-h-[64px]
                                border-b border-r border-border-subtle/30 transition-colors
                                ${cell.current ? 'cursor-pointer' : 'cursor-default opacity-25 grayscale'}
                                ${isSelected ? 'bg-brand-accent/10' : hasMeetings ? 'bg-bg-card' : 'bg-transparent'}
                                ${cell.current && !isSelected ? 'hover:bg-bg-hover' : ''}
                            `}
                        >
                            {/* Day number */}
                            <span
                                className={`
                                    flex items-center justify-center w-8 h-8 rounded-full text-xs transition-colors
                                    ${isToday ? 'bg-brand-accent text-black font-extrabold' : isSelected ? 'text-brand-accent font-bold' : cell.current ? 'text-text-main font-medium' : 'text-text-meta'}
                                `}
                            >
                                {cell.date.getDate()}
                            </span>

                            {/* Meeting count badge */}
                            {hasMeetings && (
                                <span
                                    className="mt-1 flex items-center justify-center w-4 h-4 rounded-full bg-brand-accent text-black text-[9px] font-extrabold"
                                >
                                    {count}
                                </span>
                            )}
                        </button>
                    )
                })}
            </div>

            {/* ── Selected day detail panel ── */}
            {selectedDate && (
                <div className="border-t border-border-subtle bg-bg-card/50 p-4">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-text-meta mb-3">
                        {selectedMeetings.length > 0
                            ? `Meetings on ${new Date(selectedDate + "T00:00:00").toLocaleDateString(undefined, {
                                month: "long", day: "numeric", year: "numeric",
                            })}`
                            : `No meetings on ${new Date(selectedDate + "T00:00:00").toLocaleDateString(undefined, {
                                month: "long", day: "numeric", year: "numeric",
                            })}`}
                    </p>

                    {selectedMeetings.length === 0 ? (
                        <p className="text-xs text-text-meta italic text-center py-2">
                            Nothing scheduled for this day.
                        </p>
                    ) : (
                        <div className="flex flex-col gap-2">
                            {selectedMeetings.map((m) => {
                                const isPast = now ? new Date(m.date_time) < now : false
                                return (
                                    <div
                                        key={m.id}
                                        className="flex items-center justify-between gap-3 p-3 rounded-lg border border-border-subtle bg-bg-main"
                                    >
                                        <div className="min-w-0">
                                            <p className="text-sm font-bold text-text-main truncate">
                                                {m.title}
                                            </p>
                                            <p className="text-xs text-text-muted mt-0.5">
                                                {formatTime(m.date_time)}
                                            </p>
                                        </div>
                                        <div className="flex gap-2 shrink-0">
                                            {m.meet_link && !isPast && (
                                                <a
                                                    href={m.meet_link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-[10px] uppercase font-bold tracking-wider px-3 py-1.5 rounded-md bg-brand-accent/15 text-brand-accent border border-brand-accent/30 hover:bg-brand-accent/25 transition-colors"
                                                >
                                                    Join
                                                </a>
                                            )}
                                            {m.recording_url && (
                                                <a
                                                    href={m.recording_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-[10px] uppercase font-bold tracking-wider px-3 py-1.5 rounded-md bg-bg-hover text-text-main border border-border-subtle hover:bg-bg-hover/80 transition-colors"
                                                >
                                                    Recording
                                                </a>
                                            )}
                                            {isPast && !m.recording_url && (
                                                <span className="text-[10px] uppercase font-bold tracking-widest text-text-meta italic">Past</span>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* ── Legend ── */}
            <div className="flex items-center gap-5 p-3 border-t border-border-subtle bg-bg-hover/10">
                <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-brand-accent flex items-center justify-center text-[8px] font-extrabold text-black">
                        n
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-text-meta">Meeting Count</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-brand-accent flex items-center justify-center text-xs font-extrabold text-black">
                        {now?.getDate()}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-text-meta">Today</span>
                </div>
            </div>
        </div>
    )
}
