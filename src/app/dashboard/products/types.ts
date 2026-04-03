export type ProductMedia = {
  id: string
  media_url: string
  type: string
}

export type ProductDocument = {
  id: string
  title: string
  category: string
  valid_regions: string[]
  file_url: string
}

export type ProductListItem = {
  id: string
  sku: string
  name: string
  description: string | null
  category: string | null
  ph_level: number | null
  usp: string | null
  features_benefits: string | null
  applications: string | null
  ingredients: string | null
  directions_to_use: string | null
  product_media: ProductMedia[]
}

export type ProductDetail = ProductListItem & {
  documents: ProductDocument[]
}

export const CATEGORIES = [
  "TOILET & BATHROOM",
  "SURFACE CLEANING",
  "KITCHEN CARE",
  "FABRIC CARE",
  "AIR FRESHNER",
  "INDUSTRIAL",
  "POULTRY FARM",
  "MEDICAL",
] as const

export type ViewProps = {
  filteredProducts: ProductListItem[]
  products: ProductListItem[]
  selectedCategories: string[]
  searchQuery: string
  onSearchChange: (q: string) => void
  onToggleCategory: (cat: string) => void
  onOpenProduct: (p: ProductListItem) => void
  isAdmin: boolean
  onAdminRefresh: () => void
}
