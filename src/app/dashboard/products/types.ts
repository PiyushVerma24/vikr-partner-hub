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
  documents?: ProductDocument[]
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

export function getProductDocumentBadges(product: ProductListItem): string[] {
  if (!product.documents || product.documents.length === 0) return [];
  const badges = new Set<string>();
  
  product.documents.forEach(doc => {
    if (doc.file_url) {
      const parts = doc.file_url.split('/');
      if (parts.length >= 2) {
        let folderName = parts[parts.length - 2];
        if (folderName && folderName !== 'Product_Documents' && folderName !== 'general') {
          badges.add(folderName);
          return;
        }
      }
    }
    
    const title = doc.title?.toUpperCase() || "";
    if (title.includes("MSDS") || title.includes("MATERIAL SAFETY")) badges.add("MSDS");
    else if (title.includes("TDS") || title.includes("TECHNICAL")) badges.add("TDS");
    else if (title.includes("COSHH")) badges.add("Coshh Sheet");
    else if (title.includes("GREENPRO")) badges.add("GreenPro Certificate");
    else if (title.includes("ISO")) badges.add("ISO 9001:2015 Certificate");
    else if (title.includes("WHO") || title.includes("GMP")) badges.add("WHO-GMP Certificate");
    else if (title.includes("SOP")) badges.add("SOP");
    else badges.add(doc.category || "Document");
  });
  
  const badgeArray = Array.from(badges).filter(b => b && b.toUpperCase() !== "DOCUMENT" && b.toUpperCase() !== "CERTIFICATE");
  const preferredOrder = ["TDS", "MSDS", "SOP", "Coshh Sheet", "GreenPro Certificate", "ISO 9001:2015 Certificate", "WHO-GMP Certificate", "Product Label", "Product Test Report"];
  return badgeArray.sort((a, b) => {
      const idxA = preferredOrder.indexOf(a);
      const idxB = preferredOrder.indexOf(b);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return a.localeCompare(b);
  });
}
