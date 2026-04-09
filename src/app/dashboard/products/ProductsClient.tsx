"use client"

import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { Package, FileText, X, Loader2, Download } from "lucide-react"
import { getSecureDocumentUrl } from "@/app/dashboard/actions/document"
import { ShareDocumentButton } from "@/components/ShareDocumentButton"
import Image from "next/image"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/utils/supabase/client"
import { useDashboard } from "@/contexts/DashboardContext"
import { ProductsDesktopView } from "./ProductsDesktopView"
import { ProductsMobileView } from "./ProductsMobileView"
import type { ProductListItem, ProductDetail, ProductDocument } from "./types"

export function ProductsPage() {
  const { isAdmin } = useDashboard()
  const [products, setProducts] = useState<ProductListItem[] | null>(null)
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  // ── Dialog / detail state ──────────────────────────────────────
  const [openProduct, setOpenProduct] = useState<ProductListItem | null>(null)
  const [productDetail, setProductDetail] = useState<ProductDetail | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [openingDocId, setOpeningDocId] = useState<string | null>(null)
  const [viewingDoc, setViewingDoc] = useState<{ doc: ProductDocument; url: string; isImage: boolean } | null>(null)
  const [zoomedImage, setZoomedImage] = useState<{ url: string; name: string } | null>(null)

  // ── Data fetch ──────────────────────────────────────────────────
  const fetchProducts = async () => {
    setIsLoading(true)
    try {
      const supabase = createClient()
      const { data } = await supabase
        .from("products")
        .select(
          "id, sku, name, description, category, ph_level, usp, features_benefits, applications, ingredients, directions_to_use, product_media(id, media_url, type), documents(*)"
        )
        .eq("is_active", true)
        .order("name")
      if (data) {
        setProducts(data as ProductListItem[])
      } else {
        setProducts([])
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { fetchProducts() }, [])

  // ── Handlers ────────────────────────────────────────────────────
  const handleOpenProduct = async (product: ProductListItem) => {
    setOpenProduct(product)
    setProductDetail(null)
    setDetailLoading(true)
    try {
      // Fetch only documents — all other fields are already in the product list item
      const supabase = createClient()
      const { data } = await supabase
        .from("products")
        .select("documents(*)")
        .eq("id", product.id)
        .single()
      if (data) {
        setProductDetail({ ...product, documents: (data as any).documents ?? [] } as ProductDetail)
      }
    } catch (err) {
      console.error("Error fetching product documents:", err)
    } finally {
      setDetailLoading(false)
    }
  }

  const handleCloseProduct = () => {
    setOpenProduct(null)
    setProductDetail(null)
  }

  const handleViewDocument = async (doc: ProductDocument) => {
    setOpeningDocId(doc.id)
    try {
      const { success, url, error } = await getSecureDocumentUrl(doc.id)
      if (success && url) {
        // Determine how to open based on file extension from file_url field
        const fileUrl = doc.file_url?.toLowerCase() || ''
        const isOfficeDoc = fileUrl.endsWith('.docx') || fileUrl.endsWith('.doc') ||
                           fileUrl.endsWith('.xlsx') || fileUrl.endsWith('.xls') ||
                           fileUrl.endsWith('.pptx') || fileUrl.endsWith('.ppt') ||
                           fileUrl.endsWith('.rtf')

        // Use Google Docs Viewer only for office documents
        // All other formats (PDFs, images, etc.) open directly
        const openUrl = isOfficeDoc
          ? `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=false`
          : url

        // Use anchor tag click for reliable mobile support
        const link = document.createElement('a')
        link.href = openUrl
        link.target = '_blank'
        link.rel = 'noopener noreferrer'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      } else {
        alert(error || "Failed to open document")
      }
    } catch (err) {
      console.error("Error opening document:", err)
      alert("An error occurred while trying to open the document.")
    } finally {
      setOpeningDocId(null)
    }
  }

  const handleDownloadDocument = async (doc: ProductDocument) => {
    try {
      const { success, url, error } = await getSecureDocumentUrl(doc.id, 60, true)
      if (success && url) {
        // Use anchor tag click instead of window.open() for better mobile support
        const link = document.createElement('a')
        link.href = url
        link.target = '_blank'
        link.rel = 'noopener noreferrer'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      } else {
        alert(error || "Download failed")
      }
    } catch (err) {
      console.error("Error downloading document:", err)
    }
  }

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    )
  }

  // ── Helpers ─────────────────────────────────────────────────────
  const isAirFreshenerVariant = (name: string) =>
    name !== "BIO AIR FRESHENER" &&
    (name.toUpperCase().startsWith("BIO AIR FRESHENER") ||
      name.toUpperCase().startsWith("BIO AIR FRESHNER"))

  const isHandWashVariant = (name: string) =>
    name !== "BIO HANDWASH" && name.toUpperCase().startsWith("BIO HAND WASH")

  const filteredProducts = (products || []).filter((product) => {
    const matchesCategory =
      selectedCategories.length === 0 ||
      (product.category && selectedCategories.includes(product.category))
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch && !isAirFreshenerVariant(product.name) && !isHandWashVariant(product.name)
  })

  const airFreshenerVariants = (products || []).filter((p) => isAirFreshenerVariant(p.name))
  const handWashVariants = (products || []).filter((p) => isHandWashVariant(p.name))

  const getVarietiesForProduct = (productName: string) => {
    if (productName === "BIO AIR FRESHENER") return airFreshenerVariants
    if (productName === "BIO HANDWASH") return handWashVariants
    return []
  }

  const getCleanVariantName = (variantName: string, productName: string) => {
    if (productName === "BIO AIR FRESHENER")
      return variantName.replace(/Bio\s+Air\s+Freshe?ner\s*[-–]*\s*/i, "")
    if (productName === "BIO HANDWASH")
      return variantName.replace(/Bio\s+Hand\s+Wash\s*[-–]*\s*/i, "")
    return variantName
  }

  const dialogProduct = productDetail ?? openProduct

  const viewProps = {
    filteredProducts,
    products,
    selectedCategories,
    searchQuery,
    onSearchChange: setSearchQuery,
    onToggleCategory: toggleCategory,
    onOpenProduct: handleOpenProduct,
    isAdmin,
    onAdminRefresh: fetchProducts,
    isLoading,
  }

  return (
    <>
      {/* ── Desktop view — quarantined, untouched PC layout ── */}
      <div className="hidden lg:block">
        <ProductsDesktopView {...viewProps} />
      </div>

      {/* ── Mobile view — clean mobile-first layout ── */}
      <div className="block lg:hidden">
        <ProductsMobileView {...viewProps} />
      </div>

      {/* ══ Shared dialogs — same experience on both views ══ */}

      {/* Product Detail Dialog */}
      <Dialog open={!!openProduct} onOpenChange={(open) => { if (!open) handleCloseProduct() }}>
        {dialogProduct && (
          <DialogContent
            className="max-w-5xl p-0 overflow-hidden bg-bg-card gap-0 border-border-subtle w-[calc(100vw-32px)] max-h-[calc(100vh-80px)] sm:max-h-[85vh]"
            onPointerDownOutside={(e) => { if (viewingDoc) e.preventDefault() }}
            onInteractOutside={(e) => { if (viewingDoc) e.preventDefault() }}
            onEscapeKeyDown={(e) => { if (viewingDoc) { e.preventDefault(); setViewingDoc(null) } }}
          >
            <div className="flex flex-col lg:flex-row max-h-[calc(100vh-100px)] sm:max-h-[85vh] overflow-y-auto lg:overflow-hidden">
              {/* Left: Image + Varieties */}
              {getVarietiesForProduct(dialogProduct.name).length > 0 ? (
                <div className="w-full lg:w-[45%] bg-bg-hover flex flex-col p-4 sm:p-8 shrink-0 border-b lg:border-b-0 lg:border-r border-border-subtle lg:overflow-y-auto">
                  <button
                    onClick={() =>
                      dialogProduct.product_media?.[0] &&
                      setZoomedImage({ url: dialogProduct.product_media[0].media_url, name: dialogProduct.name })
                    }
                    className="w-full h-[200px] sm:h-[280px] lg:h-[350px] flex items-center justify-center shrink-0 mb-4 sm:mb-6 bg-transparent hover:opacity-80 transition-opacity"
                  >
                    {dialogProduct.product_media && dialogProduct.product_media.length > 0 ? (
                      <img
                        src={dialogProduct.product_media[0].media_url}
                        alt={dialogProduct.name}
                        className="w-full h-full object-contain filter drop-shadow-md"
                      />
                    ) : (
                      <Package className="w-32 h-32 text-text-muted" strokeWidth={1} />
                    )}
                  </button>
                  <div className="w-full mt-4 sm:mt-6 shrink-0">
                    <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-text-muted mb-3 sm:mb-4 border-b border-border-subtle pb-2">
                      Fragrances
                    </h4>
                    <div className="grid grid-cols-3 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
                      {getVarietiesForProduct(dialogProduct.name).map((variant) => (
                        <button
                          key={variant.id}
                          onClick={() =>
                            variant.product_media?.[0] &&
                            setZoomedImage({ url: variant.product_media[0].media_url, name: variant.name })
                          }
                          className="flex flex-col items-center justify-between bg-bg-card p-3 rounded-lg border border-border-subtle shadow-sm hover:border-text-brand transition-all"
                        >
                          <div className="relative w-full h-16 mb-2 flex-shrink-0">
                            {variant.product_media && variant.product_media.length > 0 ? (
                              <Image
                                src={variant.product_media[0].media_url}
                                alt={variant.name}
                                fill
                                sizes="80px"
                                className="object-contain drop-shadow-sm"
                              />
                            ) : (
                              <Package className="w-6 h-6 mx-auto text-text-muted" />
                            )}
                          </div>
                          <span className="text-[11px] font-bold text-center text-text-main leading-snug line-clamp-2">
                            {getCleanVariantName(variant.name, dialogProduct.name)}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() =>
                    dialogProduct.product_media?.[0] &&
                    setZoomedImage({ url: dialogProduct.product_media[0].media_url, name: dialogProduct.name })
                  }
                  className="relative w-full lg:w-[45%] bg-bg-hover flex items-center justify-center p-4 sm:p-8 shrink-0 min-h-[300px] sm:min-h-[400px] border-b lg:border-b-0 lg:border-r border-border-subtle hover:opacity-90 transition-opacity"
                >
                  {dialogProduct.product_media && dialogProduct.product_media.length > 0 ? (
                    <Image
                      src={dialogProduct.product_media[0].media_url}
                      alt={dialogProduct.name}
                      fill
                      sizes="(max-width: 1024px) 100vw, 45vw"
                      className="object-contain p-8 drop-shadow-md"
                    />
                  ) : (
                    <Package className="w-32 h-32 text-text-muted" strokeWidth={1} />
                  )}
                </button>
              )}

              {/* Right: Scrollable detail content */}
              <div className="flex-1 p-4 sm:p-6 lg:p-10 lg:overflow-y-auto w-full">
                <DialogHeader className="mb-6 sm:mb-8 text-left space-y-2">
                  {dialogProduct.category && (
                    <span className="text-xs font-bold tracking-widest uppercase text-primary block">
                      {dialogProduct.category}
                    </span>
                  )}
                  <DialogTitle className="text-xl sm:text-3xl lg:text-4xl font-extrabold text-text-main leading-tight">
                    {dialogProduct.name}
                  </DialogTitle>
                  <DialogDescription className="sr-only">
                    Detailed capabilities, applications, and guidelines for {dialogProduct.name}
                  </DialogDescription>
                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <span className="inline-block text-xs font-mono bg-bg-hover text-text-muted px-3 py-1.5 rounded-md border border-border-subtle">
                      SKU: {dialogProduct.sku}
                    </span>
                    {dialogProduct.ph_level !== null && (
                      <span className="inline-block text-xs font-bold font-mono bg-brand-accent/10 text-text-brand border border-brand-accent/20 px-3 py-1.5 rounded-md">
                        pH Level {dialogProduct.ph_level}
                      </span>
                    )}
                  </div>
                </DialogHeader>

                {/* Text content — shown immediately from already-loaded list data */}
                <div className="space-y-8 text-sm text-text-main">
                    {dialogProduct.description && (
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-2 border-b border-border-subtle pb-2">
                          Description
                        </h4>
                        <p className="leading-relaxed text-base">{dialogProduct.description}</p>
                      </div>
                    )}
                    {dialogProduct.features_benefits && (
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-2 border-b border-border-subtle pb-2">
                          Features & Benefits
                        </h4>
                        <p className="leading-relaxed whitespace-pre-wrap">{dialogProduct.features_benefits}</p>
                      </div>
                    )}
                    {dialogProduct.applications && (
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-2 border-b border-border-subtle pb-2">
                          Applications
                        </h4>
                        <p className="leading-relaxed whitespace-pre-wrap">{dialogProduct.applications}</p>
                      </div>
                    )}
                    {dialogProduct.directions_to_use && (
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-2 border-b border-border-subtle pb-2">
                          Directions for Use
                        </h4>
                        <p className="leading-relaxed whitespace-pre-wrap">{dialogProduct.directions_to_use}</p>
                      </div>
                    )}
                    {dialogProduct.ingredients && (
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-2 border-b border-border-subtle pb-2">
                          Ingredients
                        </h4>
                        <p className="leading-relaxed whitespace-pre-wrap">{dialogProduct.ingredients}</p>
                      </div>
                    )}

                    {/* Documents — fetched separately, show spinner only here */}
                    {detailLoading ? (
                      <div className="flex items-center gap-2 text-xs text-text-meta py-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading documents…
                      </div>
                    ) : productDetail?.documents && productDetail.documents.length > 0 ? (
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-4 border-b border-border-subtle pb-2">
                          Available Documents
                        </h4>
                        <div className="flex flex-col gap-4">
                          {productDetail.documents.map((doc) => (
                            <div
                              key={doc.id}
                              onClick={(e) => { e.stopPropagation(); handleViewDocument(doc) }}
                              className="flex flex-col justify-between gap-3 p-4 rounded-xl bg-bg-hover border border-border-subtle transition-colors cursor-pointer hover:border-brand-accent/50 hover:bg-bg-hover/80 group min-h-[120px]"
                            >
                              <div className="flex items-start gap-3">
                                {openingDocId === doc.id ? (
                                  <div className="w-5 h-5 border-2 border-brand-accent border-t-transparent rounded-full animate-spin shrink-0" />
                                ) : (
                                  <FileText className="w-5 h-5 text-text-brand shrink-0 mt-0.5 group-hover:text-brand-accent transition-colors" />
                                )}
                                <span className="text-sm font-semibold leading-snug line-clamp-2 flex-1 group-hover:text-brand-accent transition-colors">
                                  {doc.title}
                                </span>
                              </div>
                              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mt-auto">
                                <div onClick={(e) => e.stopPropagation()} className="w-full sm:w-auto flex items-center gap-2">
                                  <button
                                    onClick={() => handleDownloadDocument(doc)}
                                    className="p-2 bg-brand-accent/10 hover:bg-brand-accent/20 text-text-brand rounded-lg transition-colors border border-brand-accent/20 h-[44px] px-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider"
                                    title="Quick Download"
                                  >
                                    <Download className="w-4 h-4" />
                                    Download
                                  </button>
                                  <ShareDocumentButton documentId={doc.id} title={doc.title} />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>

      {/* Image Zoom Dialog */}
      {zoomedImage && (
        <Dialog open={!!zoomedImage} onOpenChange={(open) => { if (!open) setZoomedImage(null) }}>
          <DialogContent className="max-w-4xl p-8 bg-bg-card border-border-subtle rounded-xl flex flex-col items-center">
            <DialogHeader className="text-center w-full mb-6">
              <DialogTitle className="text-3xl font-extrabold text-text-main">
                {zoomedImage.name}
              </DialogTitle>
              <DialogDescription className="sr-only">Larger view of {zoomedImage.name}</DialogDescription>
            </DialogHeader>
            <div className="relative w-full h-[600px] flex items-center justify-center">
              <img
                src={zoomedImage.url}
                alt={zoomedImage.name}
                className="w-full h-full object-contain filter drop-shadow-2xl"
              />
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Document Viewer Overlay */}
      {viewingDoc && typeof document !== "undefined"
        ? createPortal(
            <div
              className="fixed inset-0 flex items-center justify-center bg-black/80 p-4"
              style={{ zIndex: 99999, pointerEvents: "auto" }}
            >
              <div className="absolute inset-0 cursor-pointer" onClick={() => setViewingDoc(null)} />
              <div
                className="relative flex flex-col bg-bg-card border-border-subtle rounded-xl shadow-2xl overflow-hidden"
                style={{
                  zIndex: 100000,
                  borderColor: "#243018",
                  borderWidth: "1px",
                  width: viewingDoc.isImage ? "fit-content" : "calc(100vw - 40px)",
                  height: viewingDoc.isImage ? "fit-content" : "calc(100vh - 40px)",
                  maxWidth: "calc(100vw - 40px)",
                  maxHeight: "calc(100vh - 40px)",
                  padding: "20px",
                  display: "flex",
                }}
              >
                <div className="flex flex-shrink-0 justify-between items-start pb-4">
                  <h2 className="text-xl font-bold text-text-main pr-8">{viewingDoc.doc.title}</h2>
                  <button
                    onClick={(e) => { e.stopPropagation(); setViewingDoc(null) }}
                    className="p-1.5 rounded-md opacity-70 hover:opacity-100 bg-bg-hover hover:bg-bg-main border border-border-subtle absolute right-4 top-4 transition-all focus:outline-none focus:ring-2 focus:ring-brand-accent"
                  >
                    <X className="w-5 h-5 text-text-main" />
                  </button>
                </div>
                <div
                  className="w-full bg-white relative rounded-lg border border-border-subtle overflow-hidden flex items-center justify-center flex-1 shrink-0"
                  style={{
                    minHeight: viewingDoc.isImage ? "auto" : "50vh",
                    maxHeight: "calc(100vh - 120px)",
                  }}
                >
                  {viewingDoc.isImage ? (
                    <img
                      src={viewingDoc.url}
                      alt={viewingDoc.doc.title}
                      style={{
                        maxWidth: "100%",
                        maxHeight: "calc(100vh - 120px)",
                        objectFit: "contain",
                        display: "block",
                      }}
                    />
                  ) : (
                    <iframe
                      src={
                        (() => {
                          const fileUrl = viewingDoc.doc.file_url?.toLowerCase() || '';
                          const isDoc = fileUrl.endsWith('.docx') || fileUrl.endsWith('.doc') || 
                                       fileUrl.endsWith('.xlsx') || fileUrl.endsWith('.xls') || 
                                       fileUrl.endsWith('.pptx') || fileUrl.endsWith('.ppt') ||
                                       fileUrl.endsWith('.rtf');
                          const isCoshh = viewingDoc.doc.title?.toUpperCase().includes('COSHH') || 
                                         viewingDoc.doc.category?.toUpperCase() === 'COSHH';
                          
                          if (isDoc || isCoshh) {
                            return `https://docs.google.com/viewer?url=${encodeURIComponent(viewingDoc.url)}&embedded=true`;
                          }
                          return viewingDoc.url;
                        })()
                      }
                      style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none" }}
                      title={viewingDoc.doc.title}
                    />
                  )}
                </div>
              </div>
            </div>,
            document.body
          )
        : null}
    </>
  )
}
