export default function TrainingLoading() {
  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto bg-bg-main min-h-full animate-pulse">
      {/* Header */}
      <div className="mb-8 space-y-2">
        <div className="h-9 w-48 bg-bg-card rounded-lg" />
        <div className="h-4 w-72 bg-bg-card rounded" />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-9 w-24 bg-bg-card rounded-lg" />
        ))}
      </div>

      {/* Video grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="border border-border-subtle bg-bg-card rounded-xl h-[240px]" />
        ))}
      </div>
    </div>
  )
}
