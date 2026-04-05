"use client"

import { useState } from "react"
import Image from "next/image"
import { Package, Search, SlidersHorizontal, X, ChevronRight, FileText, AlertTriangle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ShareProductButton } from "@/components/ShareProductButton"
import { CATEGORIES, getProductDocumentBadges, type ViewProps } from "./types"

export function ProductsMobileView({
  filteredProducts,
  selectedCategories,
  searchQuery,
  onSearchChange,
  onToggleCategory,
  onOpenProduct,
  products,
  isLoading,
}: ViewProps) {
  const [filterOpen, setFilterOpen] = useState(false)

  const clearAll = () => {
    selectedCategories.forEach((cat) => onToggleCategory(cat))
  }

  return (
    <div className="flex flex-col min-h-full">
      {/* ── Sticky search + filter bar ── */}
      <div className="sticky top-0 z-10 bg-bg-main border-b border-border-subtle px-4 pt-3 pb-3 space-y-2">
        <h2 className="text-lg font-bold text-text-main">Product Catalog</h2>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9 w-full text-sm bg-bg-card border-border-subtle focus-visible:ring-1 focus-visible:ring-text-brand h-11"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setFilterOpen(true)}
            className="relative shrink-0 border-border-subtle bg-bg-card h-11 w-11 p-0"
            aria-label="Filter by category"
          >
            <SlidersHorizontal className="w-4 h-4" />
            {selectedCategories.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-brand-accent text-black text-[9px] font-bold flex items-center justify-center leading-none">
                {selectedCategories.length}
              </span>
            )}
          </Button>
        </div>

        {/* Active filter chips */}
        {selectedCategories.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {selectedCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => onToggleCategory(cat)}
                className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide bg-brand-accent/15 text-text-brand border border-brand-accent/30 px-2 py-1 rounded-full"
              >
                {cat}
                <X className="w-2.5 h-2.5" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Product list ── */}
      <div className="flex-1 px-4 py-3 space-y-3">
        {isLoading || products === null ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Loader2 className="w-10 h-10 text-brand-accent animate-spin mb-3" />
            <p className="text-sm font-bold text-text-main">Syncing Catalog...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Package className="w-10 h-10 text-text-meta mb-3" strokeWidth={1} />
            <p className="text-sm font-medium text-text-muted">No products found</p>
            <p className="text-xs text-text-meta mt-1">Try adjusting your search or filters</p>
          </div>
        ) : (
          filteredProducts.map((product) => (
            <div
              key={product.id}
              onClick={() => onOpenProduct(product)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  onOpenProduct(product);
                }
              }}
              role="button"
              tabIndex={0}
              className="w-full flex items-center gap-3 bg-bg-card border border-border-subtle rounded-xl p-3 text-left active:scale-[0.99] active:bg-bg-hover transition-all cursor-pointer relative"
            >
              {/* Product image */}
              <div className="relative w-[72px] h-[72px] bg-bg-hover rounded-lg border border-border-subtle shrink-0 overflow-hidden flex items-center justify-center">
                {product.product_media && product.product_media.length > 0 ? (
                  <Image
                    src={product.product_media[0].media_url}
                    alt={product.name}
                    fill
                    sizes="72px"
                    className="object-contain p-1.5"
                  />
                ) : (
                  <Package className="w-7 h-7 text-text-muted" strokeWidth={1} />
                )}
              </div>

              {/* Product info */}
              <div className="flex-1 min-w-0">
                {product.category && (
                  <span className="text-[9px] font-bold uppercase tracking-widest text-text-brand block mb-0.5">
                    {product.category}
                  </span>
                )}
                <h3 className="text-sm font-bold text-text-main leading-snug line-clamp-2 pr-8">
                  {product.name}
                </h3>
                <div className="absolute top-2 right-8">
                  <ShareProductButton product={product} />
                </div>
                {product.usp && (
                  <p className="text-[11px] text-text-muted mt-0.5 line-clamp-1 leading-relaxed">
                    {product.usp}
                  </p>
                )}
                
                {/* Document Badges */}
                {(() => {
                  const badges = getProductDocumentBadges(product);
                  if (badges.length === 0) return null;
                  return (
                    <div className="flex flex-wrap gap-1.5 mt-2 pt-2 border-t border-border-subtle">
                      {badges.map(badge => (
                          <Badge key={badge} variant="outline" className="text-[9px] font-mono tracking-tight px-1.5 py-0.5 bg-bg-main border-border-subtle text-text-muted">
                            {badge}
                          </Badge>
                      ))}
                    </div>
                  );
                })()}
              </div>

              <ChevronRight className="w-4 h-4 text-text-meta shrink-0" />
            </div>
          ))
        )}
      </div>

      {/* ── Filter bottom sheet ── */}
      {filterOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setFilterOpen(false)}
          />
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-bg-card rounded-t-2xl border-t border-border-subtle">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border-subtle">
              <h3 className="text-base font-bold text-text-main">Filter by Category</h3>
              <button
                onClick={() => setFilterOpen(false)}
                className="p-1.5 rounded-lg hover:bg-bg-hover transition-colors"
              >
                <X className="w-5 h-5 text-text-muted" />
              </button>
            </div>
            <div className="p-4 grid grid-cols-2 gap-2 max-h-[50vh] overflow-y-auto">
              {CATEGORIES.map((cat) => {
                const active = selectedCategories.includes(cat)
                return (
                  <button
                    key={cat}
                    onClick={() => onToggleCategory(cat)}
                    className={`py-3 px-3 rounded-xl border text-xs font-bold uppercase tracking-wide text-left transition-all ${
                      active
                        ? "bg-brand-accent/15 border-brand-accent/50 text-text-brand"
                        : "bg-bg-main border-border-subtle text-text-muted"
                    }`}
                  >
                    {cat}
                  </button>
                )
              })}
            </div>
            <div className="px-4 pb-8 pt-2 flex gap-3">
              <Button
                variant="outline"
                onClick={clearAll}
                className="flex-1 border-border-subtle text-text-muted h-11"
              >
                Clear All
              </Button>
              <Button
                onClick={() => setFilterOpen(false)}
                className="flex-1 bg-brand-accent hover:bg-[#4e9422] text-black font-bold h-11"
              >
                Apply
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
