export default function ProductsLoading() {
  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto flex flex-col gap-4 md:gap-6 w-full animate-pulse">
      {/* Header */}
      <div className="h-8 w-48 bg-bg-card rounded-lg" />

      {/* Search + filter bar */}
      <div className="flex flex-col sm:flex-row gap-2 md:gap-4">
        <div className="h-10 w-full sm:max-w-md bg-bg-card rounded-lg" />
        <div className="h-10 w-32 bg-bg-card rounded-lg" />
      </div>

      {/* Product grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="border border-border-subtle bg-bg-card rounded-xl h-[110px] sm:h-[160px]" />
        ))}
      </div>
    </div>
  )
}
