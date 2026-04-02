export default function DocumentsLoading() {
  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto animate-pulse">
      <div className="mb-6 h-8 w-40 bg-bg-card rounded-lg" />
      <div className="flex flex-col gap-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="border border-border-subtle bg-bg-card rounded-xl h-[72px]" />
        ))}
      </div>
    </div>
  )
}
