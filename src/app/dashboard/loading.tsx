export default function DashboardLoading() {
  return (
    <div className="p-4 md:p-8 space-y-4 md:space-y-6 bg-bg-main min-h-full w-full animate-pulse">
      {/* Welcome banner skeleton */}
      <div className="rounded-xl sm:rounded-2xl border border-border-subtle bg-bg-card px-4 sm:px-6 py-6 md:px-8 h-[88px]" />

      {/* Stat cards skeleton */}
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-lg sm:rounded-xl border border-border-subtle bg-bg-card p-4 sm:p-5 h-[100px]" />
        ))}
      </div>

      {/* Announcements skeleton */}
      <div className="bg-bg-card border border-border-subtle rounded-xl sm:rounded-2xl h-[320px]" />
    </div>
  )
}
