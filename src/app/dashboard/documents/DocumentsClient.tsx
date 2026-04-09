"use client"

import { useState, useEffect } from "react"
import { FileText, Search, Database, Trash2, Download } from "lucide-react"
import { getSecureDocumentUrl } from "@/app/dashboard/actions/document"
import { deleteProductDocument } from "@/app/dashboard/actions/admin"
import { createClient } from "@/utils/supabase/client"
import { useDashboard } from "@/contexts/DashboardContext"
import { ShareDocumentButton } from "@/components/ShareDocumentButton"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type Document = {
    id: string
    title: string
    category: string
    file_url?: string
    products?: { name: string; sku: string } | null
}

export function DocumentsClient() {
    const { isAdmin } = useDashboard()
    const [documents, setDocuments] = useState<Document[]>([])
    const [isLoading, setIsLoading] = useState(true)

    const handleDelete = async (docId: string, e: React.MouseEvent) => {
        e.stopPropagation()
        if (!confirm("Are you sure you want to permanently delete this document?")) return
        const res = await deleteProductDocument(docId)
        if (res.success) {
            setDocuments(docs => docs.filter(d => d.id !== docId))
        } else {
            alert('Failed to delete document: ' + res.error)
        }
    }

    useEffect(() => {
        const supabase = createClient()
        supabase
            .from('documents')
            .select('id, title, category, file_url, products(name, sku)')
            .order('created_at', { ascending: false })
            .then(({ data }) => {
                if (data) setDocuments(data as unknown as Document[])
                setIsLoading(false)
            })
    }, [])
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedCategory, setSelectedCategory] = useState("All")
    const [openingDocId, setOpeningDocId] = useState<string | null>(null)

    const uniqueCategories = Array.from(new Set(documents.map(d => d.category))).sort()

    const filteredDocs = documents.filter(doc => {
        const q = searchQuery.toLowerCase()
        const titleMatch = doc.title ? doc.title.toLowerCase().includes(q) : false
        const catMatch = doc.category ? doc.category.toLowerCase().includes(q) : false
        
        let prodMatch = false
        if (doc.products) {
            const prods = Array.isArray(doc.products) ? doc.products : [doc.products]
            prodMatch = prods.some((p: any) => 
                (p.name && p.name.toLowerCase().includes(q)) || 
                (p.sku && p.sku.toLowerCase().includes(q))
            )
        }
            
        const matchesSearch = titleMatch || catMatch || prodMatch
        const matchesCategory = selectedCategory === "All" || doc.category === selectedCategory
        
        return matchesSearch && matchesCategory
    })

    const handleViewDocument = async (doc: Document) => {
        setOpeningDocId(doc.id)
        try {
            const { success, url, error } = await getSecureDocumentUrl(doc.id)
            if (success && url) {
                const fileUrl = doc.file_url?.toLowerCase() || ''
                const isDoc = fileUrl.endsWith('.docx') || fileUrl.endsWith('.doc') ||
                             fileUrl.endsWith('.xlsx') || fileUrl.endsWith('.xls') ||
                             fileUrl.endsWith('.pptx') || fileUrl.endsWith('.ppt') ||
                             fileUrl.endsWith('.rtf')
                const isPdf = fileUrl.endsWith('.pdf')
                const isCoshh = doc.title?.toUpperCase().includes('COSHH') ||
                               doc.category?.toUpperCase() === 'COSHH'

                const openUrl = (isDoc || isCoshh)
                    ? `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=false`
                    : url

                window.open(openUrl, '_blank')
            } else {
                alert(error || 'Failed to open document')
            }
        } catch (err) {
            console.error('Error opening document:', err)
            alert('An error occurred while trying to open the document.')
        } finally {
            setOpeningDocId(null)
        }
    }

    const handleDownload = async (docId: string, e: React.MouseEvent) => {
        e.stopPropagation()
        try {
            const { success, url, error } = await getSecureDocumentUrl(docId, 60, true)
            if (success && url) {
                window.open(url, '_blank')
            } else {
                alert(error || 'Download failed')
            }
        } catch (err) {
            console.error('Error downloading:', err)
        }
    }

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 bg-bg-main border-border-subtle text-text-main">
            <div className="flex flex-col gap-1">
                <h2 className="text-sm font-bold tracking-widest text-brand-accent uppercase">Global Repository</h2>
                <h1 className="text-3xl font-extrabold tracking-tight text-text-main mb-2">Documents</h1>
                <p className="text-text-muted">Search and retrieve Technical Data Sheets (TDS), MSDS, and specific product literature approved for your region.</p>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-4 bg-bg-card border border-border-subtle p-4 rounded-2xl">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <Input
                        placeholder="Search documents by title, product name, or category..."
                        className="w-full pl-10 bg-bg-main border-border-subtle text-text-main focus-visible:ring-[#6abf30] focus-visible:border-brand-accent h-12"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                {uniqueCategories.length > 0 && (
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger className="w-full md:w-[220px] h-12 bg-bg-card border-border-subtle text-text-main focus:ring-[#6abf30] focus:border-brand-accent">
                            <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent className="bg-bg-card border-border-subtle text-text-main">
                            <SelectItem value="All">All Categories</SelectItem>
                            {uniqueCategories.map(cat => (
                                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )}
            </div>

            <div className="bg-bg-card border border-border-subtle rounded-2xl overflow-hidden shadow-lg">
                <div className="p-6 border-b border-border-subtle flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-brand-accent/10 rounded-lg">
                            <Database className="w-5 h-5 text-brand-accent" />
                        </div>
                        <div>
                            <h3 className="text-lg font-extrabold text-text-main">Central Index</h3>
                            <p className="text-xs font-semibold tracking-wide text-text-muted uppercase">All Downloadable Content</p>
                        </div>
                    </div>
                    <span className="text-xs font-bold bg-bg-main text-brand-accent px-3 py-1.5 rounded-full border border-brand-accent/20">
                        {filteredDocs.length} FILES FOUND
                    </span>
                </div>

                <div className="p-0">
                    {isLoading ? (
                        <div className="py-24 flex justify-center items-center">
                            <div className="w-8 h-8 border-2 border-brand-accent border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : filteredDocs.length === 0 ? (
                        <div className="py-24 text-center">
                            <FileText className="w-12 h-12 text-text-meta mx-auto mb-4" />
                            <p className="text-sm font-bold tracking-wide text-text-meta uppercase">No documents found matching your search</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-border-subtle">
                            {filteredDocs.map((doc) => (
                                <div key={doc.id} className="p-4 sm:p-6 hover:bg-bg-hover/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 group">
                                    <div
                                        className="flex items-start gap-4 cursor-pointer flex-1"
                                        onClick={() => handleViewDocument(doc)}
                                    >
                                        <div className="p-3 bg-bg-main rounded-xl border border-border-subtle shrink-0 mt-1 sm:mt-0 group-hover:border-brand-accent/50 transition-colors relative">
                                            {openingDocId === doc.id ? (
                                                <div className="w-6 h-6 border-2 border-brand-accent border-t-transparent rounded-full animate-spin" />
                                            ) : (
                                                <FileText className="w-6 h-6 text-brand-accent" />
                                            )}
                                        </div>
                                        <div>
                                            <h4 className="text-base font-bold text-text-main tracking-wide">{doc.title}</h4>
                                            <div className="flex flex-wrap items-center gap-2 mt-2">
                                                <span className="text-[10px] font-bold tracking-widest uppercase bg-brand-accent/10 text-brand-accent px-2 py-0.5 rounded border border-brand-accent/20">
                                                    {doc.category}
                                                </span>
                                                {doc.products && (
                                                    <>
                                                        <span className="text-text-meta text-xs">•</span>
                                                        <span className="text-xs font-semibold text-text-muted tracking-wide">
                                                            Related: {doc.products.name}
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="shrink-0 flex items-center justify-start sm:justify-end border-t border-border-subtle mt-4 pt-4 sm:border-0 sm:mt-0 sm:pt-0 w-full sm:w-auto gap-2">
                                        <button
                                            onClick={(e) => handleDownload(doc.id, e)}
                                            className="p-2 bg-brand-accent/10 hover:bg-brand-accent/20 text-brand-accent px-4 py-2 rounded-lg transition-colors h-[42px] flex items-center justify-center shrink-0 border border-brand-accent/20 text-xs font-bold uppercase tracking-wider gap-2 shadow-sm"
                                            title="Quick Download"
                                        >
                                            <Download className="w-4 h-4" />
                                            Download
                                        </button>
                                        <ShareDocumentButton documentId={doc.id} title={doc.title} />
                                        {isAdmin && (
                                            <button
                                                onClick={(e) => handleDelete(doc.id, e)}
                                                className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors h-[42px] w-[42px] flex items-center justify-center shrink-0 border border-red-500/20"
                                                title="Delete Document"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

        </div>
    )
}
