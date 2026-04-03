"use client"

import Image from "next/image"
import { Package, Search, Filter } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu"
import { EditProductModal, EditableProduct } from "@/components/EditProductModal"
import { DeleteProductModal } from "@/components/DeleteProductModal"
import { CATEGORIES, type ViewProps } from "./types"

export function ProductsDesktopView({
  filteredProducts,
  products,
  selectedCategories,
  searchQuery,
  onSearchChange,
  onToggleCategory,
  onOpenProduct,
  isAdmin,
  onAdminRefresh,
}: ViewProps) {
  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto flex flex-col gap-4 md:gap-6 w-full">
      {/* Top Header & Filters */}
      <div className="flex flex-col gap-3 md:gap-4">
        <h2 className="text-xl md:text-2xl font-semibold tracking-tight">Product Catalog</h2>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 md:gap-4">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9 w-full text-sm bg-bg-main border-border-subtle focus-visible:ring-1 focus-visible:ring-text-brand"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {isAdmin && (
              <EditProductModal
                products={products as EditableProduct[]}
                onSuccess={onAdminRefresh}
              />
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-fit flex items-center gap-2 border-border-subtle bg-bg-main">
                  <Filter className="w-4 h-4" />
                  Categories
                  {selectedCategories.length > 0 && (
                    <Badge variant="secondary" className="ml-1 px-1.5 py-0.5 text-[10px]">
                      {selectedCategories.length}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-bg-card border-border-subtle shadow-md">
                <DropdownMenuLabel>Filter by Category</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-border-subtle" />
                {CATEGORIES.map((category) => (
                  <DropdownMenuCheckboxItem
                    key={category}
                    checked={selectedCategories.includes(category)}
                    onCheckedChange={() => onToggleCategory(category)}
                  >
                    {category}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            {isAdmin && (
              <DeleteProductModal
                products={products as EditableProduct[]}
                onSuccess={onAdminRefresh}
              />
            )}
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <main className="w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {filteredProducts.map((product) => (
            <Card
              key={product.id}
              onClick={() => onOpenProduct(product)}
              className="w-full overflow-hidden transition-all hover:shadow-md cursor-pointer border-border-subtle flex flex-row min-h-[110px] sm:min-h-[160px]"
            >
              <div className="relative w-[90px] sm:w-[38%] bg-bg-hover flex items-center justify-center p-2 sm:p-5 border-r border-border-subtle transition-colors shrink-0">
                {product.product_media && product.product_media.length > 0 ? (
                  <Image
                    src={product.product_media[0].media_url}
                    alt={product.name}
                    fill
                    sizes="(max-width: 640px) 90px, 38vw"
                    className="object-contain p-2 sm:p-4"
                  />
                ) : (
                  <Package className="w-8 sm:w-12 h-8 sm:h-12 text-text-muted" strokeWidth={1} />
                )}
              </div>
              <CardContent className="p-3 sm:p-5 flex flex-col justify-center flex-1 overflow-hidden min-w-0">
                {product.category && (
                  <span className="text-[9px] sm:text-[10px] font-bold tracking-widest uppercase text-primary mb-1 block truncate">
                    {product.category}
                  </span>
                )}
                <h3 className="font-bold text-sm sm:text-base lg:text-lg text-text-main leading-snug line-clamp-2">
                  {product.name}
                </h3>
                {product.usp ? (
                  <p className="text-[11px] sm:text-xs text-text-muted mt-1 sm:mt-2 line-clamp-2 leading-relaxed">
                    {product.usp}
                  </p>
                ) : (
                  <p className="text-[11px] sm:text-xs text-text-meta italic mt-1 sm:mt-2">
                    No description available.
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center px-4">
            <Package className="w-12 h-12 text-zinc-300 mb-4" />
            <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">No products found</h3>
            <p className="text-zinc-500 mt-1 max-w-sm">
              Try adjusting your filters or wait for admins to add products accessible to your region.
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
